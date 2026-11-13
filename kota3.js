// Layout Kota Sikepo Hari 3 (mulai 12 Nov 10.00 WIB): kebun sawit di TENGAH, dikelilingi jalan, rumah, ruko, taman, lapangan & hiburan
window.KOTA3 = (function () {
  let g = null, L = [];
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const rnd = s => { const x = Math.sin(s * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const lit = (x, y, r) => L.push([x, y, r]);
  const KT = 12, X0 = 180, Y0 = 96;
  const tw = (tu, tv) => { const u = (tu + 0.5) * KT, v = (tv + 0.5) * KT; return [Math.round(X0 + u - v), Math.round(Y0 + (u + v) / 2)]; };
  const toTile = (x, y) => { const s = (y - Y0) * 2, d = x - X0, u = (s + d) / 2, v = (s - d) / 2; return [Math.floor(u / KT), Math.floor(v / KT)]; };
  function tileD(tu, tv, col) { const [x, y] = tw(tu, tv); for (let dy = -5; dy <= 5; dy++) { const hw = Math.round(12 * (1 - Math.abs(dy) / 6)); R(g, x - hw, y + dy, hw * 2, 1, col); } }
  const inGrid = (tu, tv) => tu >= -1 && tu <= 10 && tv >= -1 && tv <= 10;
  const isRoad = (tu, tv) => ((tv === 0 || tv === 5) && tu >= -1 && tu <= 10) || ((tu === 0 || tu === 5) && tv >= -1 && tv <= 10);
  const isPark = (tu, tv) => tu >= 6 && tu <= 10 && tv >= 2 && tv <= 3;
  const isCourt = (tu, tv) => tu >= 6 && tu <= 7 && tv >= 6 && tv <= 8;
  const isFun = (tu, tv) => (tu >= 8 && tu <= 10 && tv >= 6 && tv <= 10) || (tu >= 6 && tu <= 7 && tv >= 9 && tv <= 10);
  // ---- urutan bangun (jam timelapse) ----
  const KROAD = []; for (let tu = -1; tu <= 10; tu++) for (let tv = -1; tv <= 10; tv++) if (isRoad(tu, tv)) KROAD.push({ tu, tv, d: Math.abs(tu) + Math.abs(tv) });
  KROAD.sort((a, b) => a.d - b.d || a.tu - b.tu); KROAD.forEach((r, i) => { r.h0 = 7 + 1.4 * i / KROAD.length; });
  const KS = [];   // sprites
  const HSLOT = [];
  for (let tu = 6; tu <= 10; tu++) HSLOT.push([tu, 1]);
  for (let tv = 6; tv <= 10; tv++) HSLOT.push([1, tv], [4, tv]);
  for (let tu = 1; tu <= 10; tu++) if (tu !== 5) HSLOT.push([tu, -1]);
  for (let tv = 1; tv <= 10; tv++) if (tv !== 5) HSLOT.push([-1, tv]);
  HSLOT.sort((a, b) => (Math.abs(a[0]) + Math.abs(a[1])) - (Math.abs(b[0]) + Math.abs(b[1])));
  HSLOT.forEach(([tu, tv], i) => { const r = rnd(tu * 13.1 + tv * 7.7); KS.push({ k: 'house', tu, tv, type: r < 0.25 ? 'bambu' : r < 0.75 ? 'modern' : 'dua', c: Math.floor(rnd(tu * 3.3 + tv * 9.9) * 7), h0: 9.6 + 2.8 * i / HSLOT.length }); });
  for (let tu = 6; tu <= 10; tu++) KS.push({ k: 'ruko', tu, tv: 4, c: tu % 7, h0: 12.5 + (tu - 6) * 0.18 });
  // pohon & lampu
  const TREEP = [[2, 7], [3, 9], [2, 9], [8, -1.6], [-1.6, 8], [10.7, 2], [2, 10.7], [3, 6], [-1.6, 3], [3, -1.6]];
  TREEP.forEach(([tu, tv], i) => KS.push({ k: 'tree', tu, tv, h0: 8.4 + i * 0.07 }));
  const LAMPP = []; for (let tu = -1; tu <= 10; tu += 2) LAMPP.push([tu, -0.45], [tu, 4.55]); for (let tv = 1; tv <= 10; tv += 2) LAMPP.push([-0.45, tv], [4.55, tv]);
  LAMPP.forEach(([tu, tv], i) => KS.push({ k: 'lamp', tu, tv, h0: 8.9 + i * 0.02 }));
  // taman
  [[6, 2], [10, 2], [6, 3], [10, 3]].forEach(([tu, tv], i) => KS.push({ k: 'tree', tu, tv, h0: 13.6 + i * 0.05 }));
  KS.push({ k: 'fountain', tu: 8, tv: 2.5, h0: 13.9 }); [[6.9, 2.5], [9.1, 2.5]].forEach(([tu, tv]) => KS.push({ k: 'bench', tu, tv, h0: 14.0 }));
  // lapangan
  KS.push({ k: 'hoop', tu: 6.5, tv: 5.75, h0: 14.8 }, { k: 'hoop', tu: 6.5, tv: 8.85, h0: 14.8 });
  // hiburan
  KS.push({ k: 'wheel', tu: 9, tv: 7, h0: 16.0 }, { k: 'carousel', tu: 9, tv: 9.4, h0: 16.8 }, { k: 'cart', tu: 6.6, tv: 9.6, h0: 17.2, c: 0 }, { k: 'cart', tu: 7.4, tv: 10.3, h0: 17.3, c: 3 });
  
  const ROOFC = [['#e0453a', '#b02a22'], ['#3a7ae0', '#2a56b0'], ['#3faa4a', '#2a7a34'], ['#f0a020', '#c07010'], ['#f07aa8', '#c85080'], ['#9a5ad0', '#6e3aa8'], ['#2aa89a', '#1d7a70']];
  const WALLC = ['#fff6dc', '#f4ecd0', '#e8f0f8', '#f8e4d4', '#eef4dc', '#f4ecd0', '#fff0e8'];
  function house(x, y, stage, lit) {   // stage 1 pondasi, 2 dinding, 3 atap (rumah bambu sederhana)
    R(g, x - 10, y - 1, 21, 4, '#7a6a58'); R(g, x - 9, y - 1, 19, 1, '#9a8a74');                     // pondasi batu
    if (stage >= 2) { R(g, x - 9, y - 11, 18, 10, '#c8a060'); for (let k = -8; k < 9; k += 3) R(g, x + k, y - 11, 1, 10, '#a07c40');
      R(g, x - 2, y - 7, 4, 6, '#6b4a2c'); R(g, x + 4, y - 9, 3, 3, lit ? '#ffe680' : '#3a2a1a'); R(g, x - 7, y - 9, 3, 3, lit ? '#ffe680' : '#3a2a1a'); }
    if (stage >= 3) { for (let r = 0; r < 8; r++) R(g, x - 12 + r, y - 12 - r, 24 - r * 2, 1, r % 2 ? '#8a5a2b' : '#a0682e'); R(g, x - 1, y - 20, 2, 1, '#6b4a2c'); }
    else if (stage === 2) { R(g, x - 9, y - 12, 18, 1, '#8a5a2b'); }
  }
  function kWin(x, y, on) { R(g, x, y, 3, 3, '#4a6a8a'); R(g, x, y, 1, 1, '#8ab0d0'); if (on) lit(x + 1, y + 1, 3); }
  function kHouse(x, y, s) {
    const [a, b] = ROOFC[s.c], w = WALLC[s.c], on = rnd(s.tu * 5 + s.tv) > 0.25;
    R(g, x - 11, y, 22, 2, 'rgba(20,40,20,0.3)');
    if (s.type === 'bambu') { house(x, y, 3, false); if (on) { lit(x - 6, y - 8, 3); lit(x + 5, y - 8, 3); } return; }
    if (s.type === 'modern') {
      R(g, x - 8, y - 11, 16, 11, w); R(g, x + 5, y - 11, 3, 11, '#d8ccb0'); R(g, x - 8, y - 1, 16, 1, '#b8a888');
      R(g, x - 2, y - 7, 4, 7, '#7a4a2a'); kWin(x - 6, y - 8, on); kWin(x + 3, y - 8, on);
      for (let r = 0; r < 7; r++) R(g, x - 10 + r, y - 12 - r, 20 - r * 2, 1, r % 2 ? b : a); R(g, x - 10, y - 12, 20, 1, b);
      return;
    }
    // dua lantai
    R(g, x - 8, y - 20, 16, 20, w); R(g, x + 5, y - 20, 3, 20, '#d8ccb0'); R(g, x - 8, y - 11, 16, 1, '#c8b898');
    R(g, x - 2, y - 7, 4, 7, '#7a4a2a'); kWin(x - 6, y - 8, on); kWin(x + 3, y - 8, on); kWin(x - 6, y - 17, on); kWin(x - 1, y - 17, on && rnd(s.tu) > 0.5); kWin(x + 3, y - 17, on);
    R(g, x - 10, y - 23, 20, 3, a); R(g, x - 10, y - 21, 20, 1, b); R(g, x - 9, y - 12, 18, 1, '#8a8a96');
  }
  function kRuko(x, y, s) {
    const [a] = ROOFC[s.c], on = true;
    R(g, x - 12, y, 24, 2, 'rgba(20,40,20,0.3)');
    R(g, x - 11, y - 16, 22, 16, '#e8dcc0'); R(g, x + 8, y - 16, 3, 16, '#c8bca0'); R(g, x - 12, y - 18, 24, 2, '#8a7a66');
    kWin(x - 8, y - 14, on); kWin(x - 2, y - 14, on); kWin(x + 4, y - 14, on);
    for (let k = 0; k < 22; k += 2) R(g, x - 11 + k, y - 9, 2, 3, (k / 2) % 2 ? '#ffffff' : a);
    R(g, x - 9, y - 6, 18, 6, on ? '#ffd27a' : '#9aa0aa'); for (let k = -5; k < 0; k += 2) R(g, x - 9, y + k, 18, 1, on ? '#f0b850' : '#868c96');
    lit(x, y - 3, 6);
  }
  function kTree(x, y) {
    R(g, x - 5, y, 11, 2, 'rgba(20,40,20,0.3)'); R(g, x, y - 5, 2, 6, '#7a4a2a');
    [[-4, -12, 10, 7, '#2f8a34'], [-5, -10, 12, 4, '#2f8a34'], [-3, -14, 8, 2, '#3fa444'], [-3, -12, 4, 3, '#5ac05a'], [1, -8, 4, 2, '#24702a']].forEach(([dx, dy, w, h, c]) => R(g, x + dx, y + dy, w, h, c));
  }
  function kLamp(x, y) { R(g, x, y - 13, 1, 13, '#4a4a56'); R(g, x - 1, y - 14, 3, 2, false ? '#fff2a0' : '#d8d8e0'); lit(x, y - 13, 9); }
  function kFountain(x, y) {
    for (let dy = -9; dy <= 9; dy++) { const hw = Math.round(20 * Math.sqrt(1 - (dy / 9.5) ** 2)); R(g, x - hw, y + dy, hw * 2, 1, Math.abs(dy) > 7 || hw < 4 ? '#c8c0b0' : '#4aa8f5'); }
    for (let dy = -6; dy <= 6; dy++) { const hw = Math.round(16 * Math.sqrt(1 - (dy / 6.5) ** 2)); if ((dy + 20) % 3 === 0) R(g, x - hw + 2, y + dy, 4, 1, '#8fd0fb'); }
    R(g, x - 2, y - 10, 4, 10, '#d8d0c0'); R(g, x - 4, y - 11, 8, 2, '#c8c0b0');
    for (let i = 0; i < 10; i++) { const k = ((0 * 1.6 + i / 10) % 1), a = i / 10 * Math.PI * 2; R(g, Math.round(x + Math.cos(a) * k * 12), Math.round(y - 14 - Math.sin(k * Math.PI) * 8 + k * 8), 1, 2, '#c8ecff'); }
    R(g, x - 1, y - 18, 2, 6, '#c8ecff');
  }
  function kBench(x, y) { R(g, x - 4, y - 3, 8, 2, '#8a5a2b'); R(g, x - 4, y - 5, 8, 1, '#a0682e'); R(g, x - 4, y - 1, 1, 2, '#3a2a1a'); R(g, x + 3, y - 1, 1, 2, '#3a2a1a'); }
  function kHoop(x, y) { R(g, x, y - 16, 1, 16, '#6a6a76'); R(g, x - 4, y - 20, 9, 6, '#ffffff'); R(g, x - 2, y - 18, 5, 3, '#e02f2f'); R(g, x - 1, y - 14, 3, 1, '#f08a2a'); }
  function kLine(x0, y0, x1, y1, col) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) R(g, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1, col); }
  function kWheel(x, y) {
    const cy = y - 34, r = 26, rot = 0 * 0.5;
    for (let dy = -4; dy <= 4; dy++) { const hw = Math.round(22 * Math.sqrt(1 - (dy / 4.5) ** 2)); R(g, x - hw, y + dy, hw * 2, 1, dy > 2 ? '#8a8a96' : '#c8c8d0'); }
    for (let i = 0; i < 8; i++) { const a = rot + i / 8 * Math.PI * 2; kLine(x, cy, Math.round(x + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), '#9a9aa8'); }
    for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2, px = Math.round(x + Math.cos(a) * r), py = Math.round(cy + Math.sin(a) * r);
      R(g, px - 1, py - 1, 2, 2, Math.floor(i / 6) % 2 ? '#ffffff' : '#e0453a'); if (false && i % 8 === 0) lit(px, py, 3); }
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; R(g, Math.round(x + Math.cos(a) * 10), Math.round(cy + Math.sin(a) * 10), 1, 1, '#f0c030'); }
    kLine(x - 1, cy, x - 18, y - 1, '#3a3a46'); kLine(x, cy, x - 17, y - 1, '#5a5a66'); kLine(x + 1, cy, x + 18, y - 1, '#3a3a46'); kLine(x, cy, x + 17, y - 1, '#5a5a66');
    const CAB = ['#e0453a', '#3a7ae0', '#f0c030', '#3faa4a', '#f07aa8', '#9a5ad0', '#f08a2a', '#2aa89a'];
    for (let i = 0; i < 8; i++) { const a = rot + i / 8 * Math.PI * 2, px = Math.round(x + Math.cos(a) * r), py = Math.round(cy + Math.sin(a) * r);
      R(g, px, py, 1, 2, '#3a3a46'); R(g, px - 4, py + 2, 8, 6, '#1c1c24'); R(g, px - 3, py + 2, 6, 5, CAB[i]); R(g, px - 2, py + 3, 4, 2, false ? '#ffe680' : '#cfe8ff'); }
    R(g, x - 3, cy - 3, 6, 6, '#1c1c24'); R(g, x - 2, cy - 2, 4, 4, '#f0c030');
  }
  function kCarousel(x, y) {
    for (let dy = -4; dy <= 4; dy++) { const hw = Math.round(16 * Math.sqrt(1 - (dy / 4.5) ** 2)); R(g, x - hw, y + dy, hw * 2, 1, dy > 2 ? '#a08a60' : '#d8c8a0'); }
    const rot = 0 * 2; for (let i = 0; i < 6; i++) { const a = rot + i / 6 * Math.PI * 2, px = Math.round(x + Math.cos(a) * 11), py = Math.round(y + Math.sin(a) * 3);
      R(g, px, py - 16, 1, 16, '#f0c030'); R(g, px - 2, py - 6 + (i % 2), 5, 3, ['#ffffff', '#f07aa8', '#8fd0fb'][i % 3]); }
    for (let r = 0; r < 8; r++) for (let k = 0; k < 34 - r * 4; k += 4) R(g, x - 17 + r * 2 + k, y - 18 - r, Math.min(4, 34 - r * 4 - k), 1, (k / 4 + r) % 2 ? '#ffffff' : '#e0453a');
    R(g, x - 1, y - 28, 2, 3, '#f0c030'); { lit(x, y - 18, 10); for (let k = -16; k <= 16; k += 4) lit(x + k, y - 18, 2); }
  }
  function kCart(x, y, s) { R(g, x - 6, y, 12, 2, 'rgba(20,40,20,0.3)'); R(g, x - 5, y - 6, 10, 5, '#c8502e'); R(g, x - 5, y - 6, 10, 1, '#f4ecd0'); R(g, x - 4, y - 1, 2, 2, '#2a2a36'); R(g, x + 2, y - 1, 2, 2, '#2a2a36');
    R(g, x, y - 13, 1, 7, '#6a6a76'); for (let r = 0; r < 3; r++) R(g, x - 6 + r * 2, y - 15 + r, 13 - r * 4, 1, ROOFC[s.c][r % 2]); lit(x, y - 7, 5); }
  const walk = (tu, tv) => isRoad(tu, tv) || isPark(tu, tv) || isFun(tu, tv) || isCourt(tu, tv);
  function ground(c) {
    g = c;
    for (let tu = -1; tu <= 10; tu++) for (let tv = -1; tv <= 10; tv++) {
      if (isPark(tu, tv)) tileD(tu, tv, (tu === 6 || tu === 10 || tu === 8) ? '#e8d8a8' : ((tu + tv) & 1 ? '#86d860' : '#7acc56'));
      if (isCourt(tu, tv)) tileD(tu, tv, '#e0803a');
      if (isFun(tu, tv)) tileD(tu, tv, (tu + tv) & 1 ? '#e8d4a8' : '#dcc89c');
    }
    { const W = '#ffffff';
      for (let tu = 6; tu <= 7; tu++) for (let tv = 6; tv <= 8; tv++) { const [x, y] = tw(tu, tv);
        if (!isCourt(tu + 1, tv)) kLine(x + 11, y, x, y + 5, W); if (!isCourt(tu, tv + 1)) kLine(x, y + 5, x - 11, y, W);
        if (!isCourt(tu - 1, tv)) kLine(x - 11, y, x, y - 5, W); if (!isCourt(tu, tv - 1)) kLine(x, y - 5, x + 11, y, W); }
      const [a, b] = tw(5.55, 7), [c2, d] = tw(7.45, 7); kLine(a, b, c2, d, W); }
    for (let i = 0; i < 30; i++) { const [x, y] = tw(6.2 + rnd(i * 3.7) * 4.6, 2.1 + rnd(i * 8.1) * 1.8); R(g, x, y, 1, 1, ['#ffffff', '#ffd84a', '#f07aa8', '#e0453a'][i % 4]); }
    for (let tu = -1; tu <= 10; tu++) for (let tv = -1; tv <= 10; tv++) if (isRoad(tu, tv)) { tileD(tu, tv, '#5d6470'); const [x, y] = tw(tu, tv), cross = isRoad(tu + 1, tv) && isRoad(tu, tv + 1);
      if (cross) continue; if (tv === 0 || tv === 5) { R(g, x - 3, y - 1, 2, 1, '#f4ecd0'); R(g, x + 1, y + 1, 2, 1, '#f4ecd0'); } else { R(g, x + 1, y - 1, 2, 1, '#f4ecd0'); R(g, x - 3, y + 1, 2, 1, '#f4ecd0'); } }
  }
  function sprites(c, extra) {   // extra: [[y, drawFn]] (palms, pines, tikar) ikut diurutkan
    g = c; L = [];
    const list = KS.map(s => { const [x, y] = tw(s.tu, s.tv); return [y + 3, () => {
      const yy = y + 3; if (s.k === 'house') kHouse(x, yy, s); else if (s.k === 'ruko') kRuko(x, yy, s); else if (s.k === 'tree') kTree(x, yy); else if (s.k === 'lamp') kLamp(x, yy);
      else if (s.k === 'fountain') kFountain(x, yy - 3); else if (s.k === 'bench') kBench(x, yy); else if (s.k === 'hoop') kHoop(x, yy); else if (s.k === 'wheel') kWheel(x, yy);
      else if (s.k === 'carousel') kCarousel(x, yy); else if (s.k === 'cart') kCart(x, yy, s); }]; }).concat(extra || []);
    list.sort((a, b) => a[0] - b[0]).forEach(([, f]) => f());
    return L;
  }
  const doors = HSLOT.map(([tu, tv]) => { const [x, y] = tw(tu, tv); return { x, y: y + 4 }; });
  return { tw, toTile, inGrid, walk, isRoad, ground, sprites, doors, PLOT: (() => { const [x, y] = tw(2, 2); return { cx: x, cy: y + 6, hw: 46, hh: 23 }; })() };
})();
