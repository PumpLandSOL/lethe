// Full ledger flow with the dev faucet (DEV_FAUCET=1, VIGIL_START=1 locally).
const B = 'http://localhost:8206'; const W = '0x00000000000000000000000000000000000000b2';
const post = (u, b) => fetch(B + u, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ wallet: W, ...b }) }).then((r) => r.json());
const ok = (name, cond, extra) => console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '  · ' + extra : ''));
const f = (n) => Math.round(n * 100) / 100;
(async () => {
  await new Promise((r) => setTimeout(r, 2500));
  const m0 = await (await fetch(B + '/api/metrics')).json();
  ok('vigil live locally', m0.vigil.live === true, 'endsIn ' + Math.round(m0.vigil.endsIn / 864e5) + 'd');
  const fa = await post('/api/dev/faucet', { amount: 1000 }); ok('faucet credited 1000 USDG', fa.usdg === 1000);
  const p0 = m0.pyre.tollUsd;
  const mt = await post('/api/mint', { amount: 500 });
  ok('mint 500 lUSD costs 500 USDG total', mt.ok && f(mt.usdg) === 500 && f(mt.lusd) === 500, `usdg=${f(mt.usdg)} lusd=${f(mt.lusd)} collat=${f(mt.usedUsdg)} algo=${f(mt.algoUsd)}`);
  ok('mint: collateral + algo slice == 500', f(mt.usedUsdg + mt.algoUsd) === 500);
  const m1 = await (await fetch(B + '/api/metrics')).json();
  ok('algo slice went to the pyre (or already burned)', m1.pyre.tollUsd >= p0 || m1.pyre.epochs > m0.pyre.epochs, `toll ${f(p0)} → ${f(m1.pyre.tollUsd)} epochs ${m0.pyre.epochs}→${m1.pyre.epochs}`);
  const st = await post('/api/stake', { amount: 200 }); ok('stake 200', st.ok && f(st.lusd) === 300 && f(st.vigil.staked) === 200, JSON.stringify(st.vigil));
  await new Promise((r) => setTimeout(r, 3000));
  const ac = await post('/api/account', {}); ok('reward accrues in lUSD terms', ac.vigil.accruedUsd > 0 && ac.vigil.accruedLethe > 0, `accruedUsd=${ac.vigil.accruedUsd.toExponential(2)} accruedLethe=${f(ac.vigil.accruedLethe)}`);
  const cl = await post('/api/claim', {}); ok('claim gated below $0.01 or pays LETHE', cl.error === 'nothing to claim yet' || (cl.ok && cl.claimedLethe > 0), cl.error || 'claimed ' + f(cl.claimedLethe));
  const us = await post('/api/unstake', { amount: 200 }); ok('unstake 200 minus 30bps toll', us.ok && f(us.unstaked) === 199.4 && f(us.toll) === 0.6, `back ${f(us.unstaked)} lusd=${f(us.lusd)}`);
  const rd = await post('/api/redeem', { amount: 100 }); ok('redeem 100 lUSD pays CR in USDG (net of 50bps)', rd.ok && rd.gotUsdg > 0, `usdg +${f(rd.gotUsdg)} lethe +${f(rd.gotLethe)} now usdg=${f(rd.usdg)}`);
  const wd = await post('/api/withdraw', { amount: 50 }); ok('withdraw 50 → queue', wd.ok && wd.queued.status === 'queued' && f(wd.usdg) === f(rd.usdg - 50), 'id ' + wd.queued.id);
  const m2 = await (await fetch(B + '/api/metrics')).json(); ok('metrics shows open queue', m2.queue.open >= 1 && m2.queue.openUsd >= 50, JSON.stringify(m2.queue));
  const cap = await post('/api/stake', { amount: 999999 }); ok('stake over balance clamps to balance (MAX semantics)', cap.ok && f(cap.vigil.staked) > 0, 'staked ' + f(cap.vigil.staked));
})();
