// LETHE mark: a coin sinking into the river that forgets — rim ring, three ripples, the lowest dissolving into dots.
const fs = require('fs'), path = require('path');
const F = (p) => path.join(__dirname, '..', p);
const COIN = `<svg class="coin" viewBox="0 0 200 200" aria-hidden="true">
      <defs><radialGradient id="disc" cx="40%" cy="34%" r="70%"><stop offset="0" stop-color="#16223a"/><stop offset="1" stop-color="#0b1220"/></radialGradient>
        <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3d8bff" stop-opacity="0"/><stop offset=".5" stop-color="#9fd8ff"/><stop offset="1" stop-color="#3d8bff" stop-opacity="0"/></linearGradient></defs>
      <circle cx="100" cy="100" r="96" fill="url(#disc)" stroke="#3d8bff" stroke-width="2.5"/>
      <g class="rim"><circle cx="100" cy="100" r="88" fill="none" stroke="#3d8bff" stroke-width="1" stroke-dasharray="2 5" opacity=".7"/></g>
      <g fill="none" stroke-linecap="round" stroke-width="3">
        <circle cx="100" cy="72" r="18" stroke="#9fd8ff" fill="#0b1220"/>
        <path d="M92 72 h16 M100 64 v16" stroke="#9fd8ff" stroke-width="2.5"/>
        <path d="M40 112 c15 -10 30 -10 45 0 s30 10 45 0 s30 -10 45 0" stroke="#3d8bff"/>
        <path d="M46 132 c15 -10 30 -10 45 0 s30 10 45 0 s30 -10 45 0" stroke="#3d8bff" opacity=".7"/>
        <path d="M52 152 c15 -10 30 -10 45 0 s30 10 45 0 s30 -10 45 0" stroke="#3d8bff" opacity=".4" stroke-dasharray="4 7"/>
      </g>
      <path d="M40 112 c15 -10 30 -10 45 0 s30 10 45 0 s30 -10 45 0" fill="none" stroke="url(#fade)" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
const MARK = `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#0b1220" stroke="#3d8bff" stroke-width="1.5"/><circle cx="16" cy="11" r="3.5" fill="none" stroke="#9fd8ff" stroke-width="1.5"/><path d="M6 18c3-2.5 6-2.5 9 0s6 2.5 9 0" fill="none" stroke="#3d8bff" stroke-width="1.6" stroke-linecap="round"/><path d="M8 23c3-2.5 6-2.5 9 0s6 2.5 9 0" fill="none" stroke="#3d8bff" stroke-width="1.6" stroke-linecap="round" opacity=".5" stroke-dasharray="2 3"/></svg>`;
for (const f of ['client/index.html', 'client/view.html']) {
  let s = fs.readFileSync(F(f), 'utf8'); const o = s;
  s = s.replace(/<svg class="coin"[\s\S]*?<\/svg>/, COIN);
  s = s.replace(/<div class="mark">Ω<\/div>/g, MARK);
  s = s.replace(/\.mark\{width:32px;height:32px;border-radius:50%;background:[^}]*\}/, '.mark{width:32px;height:32px;border-radius:50%;flex:none}');
  s = s.split('#d8b873').join('#9fd8ff').split('#7d5e2e').join('#3d8bff');
  if (s !== o) fs.writeFileSync(F(f), s); console.log(f, s !== o ? 'updated' : 'no change', 'owl left:', (s.match(/d8b873|<div class="mark">Ω/g) || []).length);
}
