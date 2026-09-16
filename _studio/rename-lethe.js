// STYX-on-Arc → LETHE: consistent rename (identifiers + copy) and black/blue palette.
const fs = require('fs'), path = require('path');
const F = (p) => path.join(__dirname, '..', p);
const files = ['server/index.js', 'client/index.html', 'client/view.html', 'client/src/app.js', 'README.md', 'package.json', '.claude/launch.json', 'Procfile', ..._studioTests()];
function _studioTests() { return fs.readdirSync(F('_studio')).filter((f) => /^e2e-.*\.cjs$/.test(f)).map((f) => '_studio/' + f); }
const ren = (s) => s
  .split('STYX').join('LETHE').split('Styx').join('Lethe').split('styx').join('lethe')
  .split('sUSD').join('lUSD').split('SUSD').join('LUSD').split('susd').join('lusd')
  .split('ΣΤΥΞ').join('ΛΗΘΗ')   // greek wordmark
  .split('the coin for the crossing').join('the coin the river forgets')
  .split('The river you cross').join('The river that forgets').split('THE RIVER YOU CROSS').join('THE RIVER THAT FORGETS');
for (const f of files) { if (!fs.existsSync(F(f))) continue; const s = fs.readFileSync(F(f), 'utf8'); fs.writeFileSync(F(f), ren(s)); }

// ---- black & blue palette (replaces the Arc-light tokens set by port-arc.js)
const ROOT = '--bg:#05070c;--stone:#0b1220;--stone2:#111a2e;--ink:#e8f0ff;--dim:#a9b8d6;--mut:#5f6f8f;--gold:#3d8bff;--gold2:#9fd8ff;--verd:#3ddc97;--ox:#ff5c6c;--red:#ff5c6c';
const dark = (s) => {
  s = s.replace(/:root\{[^}]*\}/, (m) => { const keep = m.slice(6, -1).split(';').filter((x) => x.trim() && !/^--(bg|stone|stone2|ink|dim|mut|gold|gold2|verd|ox|red):/.test(x.trim())).join(';'); return ':root{' + ROOT + (keep ? ';' + keep : '') + '}'; });
  // literal sweeps: undo the light values from the Arc pass
  s = s.split('rgba(47,87,140,').join('rgba(61,139,255,').split('rgba(233,161,63,').join('rgba(159,216,255,').split('rgba(201,65,58,').join('rgba(255,92,108,').split('rgba(31,138,90,').join('rgba(61,220,151,');
  s = s.split('rgba(27,49,88,').join('rgba(232,240,255,').split('rgba(244,248,253,').join('rgba(5,7,12,').split('rgba(255,255,255,.').join('rgba(11,18,32,.');
  s = s.split('#f4f8fd').join('#05070c').split('#ffffff').join('#0b1220').split('#e9f1fb').join('#111a2e').split('#dbe7f5').join('#16223a').split('#eef4fc').join('#111a2e').split('#1b3158').join('#e8f0ff').split('#2f578c').join('#3d8bff').split('#e9a13f').join('#9fd8ff').split('#c9413a').join('#ff5c6c').split('#1f8a5a').join('#3ddc97');
  return s;
};
for (const f of ['client/index.html', 'client/view.html']) fs.writeFileSync(F(f), dark(fs.readFileSync(F(f), 'utf8')));
// package name + port label
let pk = fs.readFileSync(F('package.json'), 'utf8').replace('"name": "lethe-arc"', '"name": "lethe"'); fs.writeFileSync(F('package.json'), pk);
let lj = fs.readFileSync(F('.claude/launch.json'), 'utf8').replace('"lethe-arc"', '"lethe"'); fs.writeFileSync(F('.claude/launch.json'), lj);
console.log('renamed + recolored');
