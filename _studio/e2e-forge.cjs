// THE FORGE E2E: lock-bond at deeper discount, no early claim, yield paid at unlock from the Vigil pool. Run with FORGE_LOCK_DAYS tiny.
const B = 'http://localhost:8206'; const U = '0x0000000000000000000000000000000000000311';
const post = (u, b) => fetch(B + u, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ wallet: U, ...b }) }).then((r) => r.json());
let fails = 0; const ok = (n, c, x) => { console.log((c ? 'PASS ' : 'FAIL ') + n + (x ? '  · ' + x : '')); if (!c) fails++; };
const f = (n) => Math.round(n * 100) / 100;
(async () => {
  await new Promise((r) => setTimeout(r, 2000));
  const m0 = await (await fetch(B + '/api/metrics')).json(); const F = m0.bonds.forge;
  ok('metrics.bonds.forge present', F && F.discount === 0.3 && F.apy === 0.8, JSON.stringify(F));
  ok('forge price = market × 0.7', Math.abs(F.price - m0.bonds.market * 0.7) < 1e-12);
  await post('/api/dev/faucet', { amount: 1000 });
  const b = await post('/api/bond', { amount: 200, lock: true });
  ok('forge 200 USDG → LETHE at −30%', b.ok && b.lock && Math.abs(b.letheOut - 200 / (b.market * 0.7)) < 1e-6, `${Math.round(b.letheOut)} LETHE @ ${b.price} apy ${b.apy}`);
  ok('locked, nothing claimable', b.bonds.locked > 0 && b.bonds.claimable === 0, `locked ${Math.round(b.bonds.locked)}`);
  const e = await post('/api/bond/claim', {}); ok('early claim refused', /nothing/.test(e.error || ''), e.error);
  const m1 = await (await fetch(B + '/api/metrics')).json(); ok('forge stats + reserve grew', m1.bonds.forge.n >= 1 && m1.bonds.forge.lockedLethe > 0 && f(m1.collateralUsd - m0.collateralUsd) === 200);
  await new Promise((r) => setTimeout(r, 3500));
  const paid0 = m1.vigil.paidLethe;
  const c = await post('/api/bond/claim', {}); const exp = b.letheOut * 0.8 * (+process.env.LOCK_MS || 3000) / 31536000000;
  ok('unlock pays principal + forged yield', c.ok && c.forgedLethe > 0 && Math.abs(c.claimedLethe - (b.letheOut + c.forgedLethe)) < 1e-6, `principal ${Math.round(b.letheOut)} yield ${c.forgedLethe.toExponential(3)} (expected ~${exp.toExponential(3)})`);
  const m2 = await (await fetch(B + '/api/metrics')).json();
  ok('yield drawn from the Vigil pool, not printed', m2.vigil.paidLethe > paid0 && Math.abs(m2.vigil.paidLethe - paid0 - c.forgedLethe) < 1e-9);
  ok('forge lockedLethe released', m2.bonds.forge.lockedLethe < m1.bonds.forge.lockedLethe);
  const c2 = await post('/api/bond/claim', {}); ok('no double yield', /nothing/.test(c2.error || ''), c2.error);
  console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exitCode = fails ? 1 : 0;
})();
