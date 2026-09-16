// STYX → Arc port: chain 5042 (native USDC gas, 18dp) replaces Robinhood Chain (USDG ERC-20); Arc light palette + fonts replace the stone/gold noir.
const fs = require('fs'), path = require('path');
const F = (p) => path.join(__dirname, '..', p);
const R = (p, fn) => { let s = fs.readFileSync(F(p), 'utf8'); const o = s; s = fn(s); if (s === o) console.log('NO CHANGE', p); fs.writeFileSync(F(p), s); };
const must = (s, a) => { if (!s.includes(a)) throw new Error('miss: ' + a.slice(0, 80)); };

// ---------------- server ----------------
R('server/index.js', (s) => {
  must(s, "const PORT = process.env.PORT || 8198;"); s = s.replace("const PORT = process.env.PORT || 8198;", "const PORT = process.env.PORT || 8206;");
  s = s.replace("const STYX_MINT = process.env.STYX_MINT || '0xdbd2bd1a734d2b3dc8f88bacc404810fcbff36c4';", "const STYX_MINT = process.env.STYX_MINT || '';");
  s = s.replace("const TREASURY = (process.env.TREASURY || '0x28FC1899eDD7973dc5A9c95321E0cdeB3d8419d1');", "const TREASURY = (process.env.TREASURY || '0x0000000000000000000000000000000000000000');");
  // native USDC on Arc: no token contract, balance via eth_getBalance, deposits are plain value transfers
  must(s, "const USDG = { addr: (process.env.USDG_ADDR || '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168').toLowerCase(), dec: 6 };");
  s = s.replace(/const USDG = \{ addr: [^\n]*\n/, "const USDG = { addr: 'native', dec: 18, native: true };   // USDC is Arc's native gas token (18 dp)\n");
  s = s.replace("const RPCS = (process.env.RH_RPCS || 'https://rpc.mainnet.chain.robinhood.com').split(',');", "const RPCS = (process.env.ARC_RPCS || process.env.RH_RPCS || 'https://rpc.mainnet.arc.io').split(',');\nconst ARC = { id: 5042, hex: '0x13b2', name: 'Arc', explorer: 'https://explorer.arc.io' };");
  s = s.replace("CHAIN.treasuryUsdg = await balOf(USDG.addr, USDG.dec, TREASURY);", "CHAIN.treasuryUsdg = hexToNum(await rpc('eth_getBalance', [TREASURY, 'latest']), 18);");
  s = s.replace("CHAIN.treasuryStyx = await balOf(STYX_MINT, 18, TREASURY);", "CHAIN.treasuryStyx = STYX_MINT ? await balOf(STYX_MINT, 18, TREASURY) : 0;");
  const a = s.indexOf("  let amt = 0;\n  for (const lg of rc.logs || []) {"), b = s.indexOf("  if (!(amt > 0)) throw");
  if (a < 0 || b < 0) throw new Error('deposit block'); s = s.slice(0, a) + "  let amt = 0;\n  if ((tx.to || '').toLowerCase() === TREASURY.toLowerCase()) amt = hexToNum(tx.value, 18);   // native USDC value transfer\n" + s.slice(b);
  s = s.split('Robinhood Chain').join('Arc').split('robinhood').join('arc');
  s = s.replace(/USDG(?![_a-z])/g, 'USDC');   // display strings only (identifiers like db.treasuryIn.usdg, USDG_ADDR are lower/underscored)
  s = s.replace(/const USDC = \{ addr: 'native'/, "const USDG = { addr: 'native'");   // keep the constant name the code references
  return s;
});

// ---------------- client js ----------------
R('client/src/app.js', (s) => {
  must(s, "const CHAIN_HEX = '0x1237';"); s = s.replace("const CHAIN_HEX = '0x1237';", "const CHAIN_HEX = '0x13b2';   // Arc mainnet 5042");
  s = s.replace(/chainName: 'Robinhood Chain', nativeCurrency: \{ name: 'Ether', symbol: 'ETH', decimals: 18 \}, rpcUrls: \['https:\/\/rpc\.mainnet\.chain\.robinhood\.com'\][^\]]*\]/, "chainName: 'Arc', nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 }, rpcUrls: ['https://rpc.mainnet.arc.io'], blockExplorerUrls: ['https://explorer.arc.io']");
  s = s.replace(/chainName: 'Robinhood Chain'/g, "chainName: 'Arc'").replace(/name: 'Ether', symbol: 'ETH'/g, "name: 'USDC', symbol: 'USDC'").replace(/https:\/\/rpc\.mainnet\.chain\.robinhood\.com/g, 'https://rpc.mainnet.arc.io');
  // native transfer instead of ERC-20 transfer()
  must(s, "if (!M || !M.chain || !M.chain.usdg || !M.treasury) return toast('treasury not configured', true);");
  s = s.replace("if (!M || !M.chain || !M.chain.usdg || !M.treasury) return toast('treasury not configured', true);", "if (!M || !M.treasury || /^0x0{40}$/.test(M.treasury)) return toast('treasury not configured', true);");
  s = s.replace("    const units = BigInt(Math.round(amount * 1e6)).toString(16).padStart(64, '0');\n    const data = '0xa9059cbb' + M.treasury.slice(2).toLowerCase().padStart(64, '0') + units;\n    const tx = await eth.request({ method: 'eth_sendTransaction', params: [{ from: wallet, to: M.chain.usdg, data }] });",
    "    const value = '0x' + (BigInt(Math.round(amount * 1e6)) * 10n ** 12n).toString(16);   // USDC is native on Arc, 18 dp\n    const tx = await eth.request({ method: 'eth_sendTransaction', params: [{ from: wallet, to: M.treasury, value }] });");
  must(s, "to: M.treasury, value }");
  s = s.split('Robinhood Chain').join('Arc');
  s = s.replace(/USDG(?![_a-z])/g, 'USDC');
  return s;
});

// ---------------- client html: palette, fonts, copy ----------------
const ROOT_ARC = '--bg:#f4f8fd;--stone:#ffffff;--stone2:#e9f1fb;--ink:#1b3158;--dim:#41464c;--mut:#7a858e;--gold:#2f578c;--gold2:#e9a13f;--verd:#1f8a5a;--ox:#c9413a;--red:#c9413a';
const html = (s) => {
  s = s.replace(/family=Cinzel[^"']*/g, 'family=Space+Grotesk:wght@500;700&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Space+Mono:wght@400;700');
  s = s.split("'Cinzel'").join("'Space Grotesk'").split('Cinzel').join('Space Grotesk').split("'EB Garamond'").join("'DM Sans'").split('EB Garamond').join('DM Sans').split("'JetBrains Mono'").join("'Space Mono'").split('JetBrains Mono').join('Space Mono');
  s = s.replace(/:root\{[^}]*\}/, (m) => {
    let keep = m.slice(6, -1).split(';').filter((x) => x.trim() && !/^--(bg|stone|stone2|ink|dim|mut|gold|gold2|verd|ox|red):/.test(x.trim())).join(';');
    return ':root{' + ROOT_ARC + (keep ? ';' + keep : '') + '}';
  });
  s = s.split('rgba(201,162,94,').join('rgba(47,87,140,').split('rgba(233,207,149,').join('rgba(233,161,63,').split('rgba(98,161,135,').join('rgba(31,138,90,').split('rgba(179,80,47,').join('rgba(201,65,58,').split('#b3502f').join('#c9413a');
  s = s.split('#080706').join('#f4f8fd').split('#100c09').join('#ffffff').split('#181109').join('#e9f1fb').split('#0d0a06').join('#e9f1fb').split('#e9ddc6').join('#1b3158');
  s = s.split('rgba(233,221,198,').join('rgba(27,49,88,').split('rgba(8,7,6,').join('rgba(244,248,253,').split('rgba(16,12,9,').join('rgba(255,255,255,');
  s = s.split('Robinhood Chain').join('Arc').split('robinhood chain').join('Arc');
  s = s.replace(/USDG(?![_a-z])/g, 'USDC');
  s = s.split('x.com/StyxRH').join('x.com/StyxOnArc').split('x.com/styxrh').join('x.com/StyxOnArc').split('styxrh.xyz').join('styxonarc.xyz');
  return s;
};
R('client/index.html', html); R('client/view.html', html);
R('README.md', (s) => s.split('Robinhood Chain').join('Arc').replace(/USDG(?![_a-z])/g, 'USDC').replace('8198', '8206'));
R('package.json', (s) => s.replace('"name": "styx"', '"name": "styx-arc"'));
console.log('ported');
