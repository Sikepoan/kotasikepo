// Layout KEPO FANTASY (mulai 12 Nov 2026 18.00 WIB): padang liar, gunung seram + gua bermata merah, sungai, kemah (belum ada tenda)
window.FANT3 = (function () {
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const rnd = s => { const x = Math.sin(s * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const ISL = { cx: 180, cy: 150, hw: 172, hh: 88 };
  const CAMP = { x: 172, y: 162, rx: 46, ry: 22 };
  let LAHAN = 0, TAV = -1; const TIMG = []; let onImg = null;
  for (let i = 0; i < 5; i++) { const im = new Image(); im.onload = () => onImg && onImg(); im.src = 'img/tavern_' + i + '.png'; TIMG.push(im); }
  const setLuas = k => { ISL.hw = Math.round(172 + 30 * k); ISL.hh = Math.round(88 + 34 * k); ISL.cy = Math.round(150 + 16 * k); };
  const setLahan = k => { LAHAN = Math.max(0, Math.min(1, k)); CAMP.rx = Math.round(46 + 40 * LAHAN); CAMP.ry = Math.round(22 + 20 * LAHAN); CAMP.y = Math.round(162 + 4 * LAHAN); };
  const RIV = [[268, 92], [282, 120], [290, 150], [300, 178], [318, 196]];          // sungai: dari kaki gunung ke tepi kanan pulau
  const EYES = [[168, 58], [192, 58]];
  const distRiver = (x, y) => { let d = 1e9; for (let i = 0; i < RIV.length - 1; i++) { const [ax, ay] = RIV[i], [bx, by] = RIV[i + 1], vx = bx - ax, vy = by - ay, k = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy))); d = Math.min(d, Math.hypot(x - ax - vx * k, y - ay - vy * k)); } return d; };
  const inIsl = (x, y, m) => Math.abs(x - ISL.cx) / (ISL.hw - m * 2) + Math.abs(y - ISL.cy) / (ISL.hh - m) <= 1;
  const walk = (x, y) => inIsl(x, y, 6) && distRiver(x, y) > 11 && y > 86 && !(TAV >= 0 && Math.abs(x - CAMP.x) < 42 && y > CAMP.y - 30 && y < CAMP.y + 12);
  function mountain(g) {   // pegunungan penuh di belakang pulau (menutup laut atas)
    R(g, 0, 0, 360, 300, '#1a2e24');                                          // lembah hutan gelap (ganti laut)
    for (let i = 0; i < 160; i++) { const x = (i * 37) % 360, y = 150 + ((i * 53) % 150); R(g, x - 4, y - 6, 9, 6, i % 2 ? '#1f3a2a' : '#173024'); R(g, x - 1, y - 9, 3, 3, '#24452f'); }
    R(g, 0, 0, 360, 160, '#1c2236'); for (let i = 0; i < 8; i++) R(g, rnd(i * 4.4) * 360 - 30, 4 + i * 5, 110, 3, 'rgba(90,100,130,0.35)');
    const ridge = (base, amp, f, seed, col, snow) => { for (let x = 0; x < 360; x += 2) { const n = Math.abs(Math.sin(x / f + seed)) * 0.65 + Math.abs(Math.sin(x / (f * 0.41) + seed * 3)) * 0.35, top = Math.round(base - amp * n); R(g, x, top, 2, 170 - top, col); if (snow && n > 0.3) R(g, x, top, 2, Math.max(2, Math.round(5 * n)), snow); } };
    ridge(52, 46, 22, 1.1, '#5a6680', '#dce6f4'); ridge(84, 50, 15, 3.7, '#46506a', '#b8c6dc'); ridge(118, 42, 11, 2.2, '#343c52', null); ridge(150, 30, 8, 5.1, '#2a3044', null);
    for (let x = 0; x < 360; x += 6) R(g, x, 100 + (x * 7) % 17, 1, 40, '#20263a');
    const cx = 180, cy = 84;                                                   // gua besar bermulut taring
    for (let y = 0; y < 52; y++) { const w = Math.round(40 * Math.sqrt(Math.max(0, 1 - ((52 - y) / 52) ** 2))); R(g, cx - w - 3, cy - 52 + y, (w + 3) * 2, 1, '#5a6680'); R(g, cx - w, cy - 52 + y, w * 2, 1, '#0a0608'); }
    for (let k = -34; k <= 34; k += 7) { const h = 11 - Math.abs(k) / 5; for (let j = 0; j < h; j++) R(g, cx + k - Math.round((h - j) / 3), cy - 48 + j + Math.round(Math.abs(k) / 2.6), Math.max(1, Math.round((h - j) / 1.4)), 1, '#e8e0d0'); }
    for (let k = -30; k <= 30; k += 10) for (let j = 0; j < 8; j++) R(g, cx + k - Math.round(j / 3), cy - j, Math.max(1, Math.round(j / 1.4)), 1, '#d8d0c0');
    EYES.forEach(([x, y]) => { R(g, x - 3, y, 7, 3, '#ff6a2a'); R(g, x - 2, y, 3, 1, '#ffe0a0'); });
    for (let i = 0; i < 8; i++) R(g, cx - 40 + i * 10, cy - 4 - (i % 3) * 3, 16, 3, 'rgba(120,70,160,0.4)');
    for (let k = 0; k < 3; k++) for (let j = 0; j < 14; j++) { R(g, cx + 50 + k * 4 + Math.round(j / 4), cy - 44 + j, 1, 1, '#141824'); R(g, cx - 58 - k * 4 + Math.round(j / 4), cy - 40 + j, 1, 1, '#141824'); }
    for (let y = 40; y < 96; y++) R(g, 262, y, 12, 1, (y % 6) < 3 ? '#a8e0ff' : '#6ab8f0'); R(g, 261, 40, 1, 56, '#ffffff'); R(g, 274, 40, 1, 56, '#ffffff');
  }
  function ground(g) {
    for (let y = CAMP.y - CAMP.ry; y <= CAMP.y + CAMP.ry; y++) { const w = Math.round(CAMP.rx * Math.sqrt(1 - ((y - CAMP.y) / CAMP.ry) ** 2)); R(g, CAMP.x - w, y, w * 2, 1, (y % 3) ? '#c8a070' : '#b8905e'); }
    for (let y = 84; y < CAMP.y - CAMP.ry + 2; y++) R(g, 172 - 7 + Math.round((y - 80) * 0.0), y, 14, 1, (y % 3) ? '#c8a070' : '#b8905e');      // jalan dari gua
    for (let i = 0; i < RIV.length - 1; i++) { const [ax, ay] = RIV[i], [bx, by] = RIV[i + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay)); for (let k = 0; k <= n; k++) { const x = ax + (bx - ax) * k / n, y = ay + (by - ay) * k / n; R(g, x - 10, y - 4, 20, 8, '#4a9ae8'); } }
    for (let i = 0; i < RIV.length - 1; i++) { const [ax, ay] = RIV[i], [bx, by] = RIV[i + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay)); for (let k = 0; k <= n; k += 3) { const x = ax + (bx - ax) * k / n, y = ay + (by - ay) * k / n; R(g, x - 4 + (k % 7), y - 1, 4, 1, '#8fd8ff'); R(g, x - 11, y - 4, 1, 8, '#ffffff'); } }
    [[150, 92], [200, 94], [138, 98], [214, 99], [120, 95]].forEach(([x, y], i) => { if (i % 2 === 0) { R(g, x - 3, y - 4, 7, 5, '#e8e0d0'); R(g, x - 2, y - 3, 2, 2, '#1c1c24'); R(g, x + 1, y - 3, 2, 2, '#1c1c24'); } else { R(g, x - 5, y - 1, 10, 2, '#e8e0d0'); R(g, x - 6, y - 2, 2, 4, '#e8e0d0'); R(g, x + 4, y - 2, 2, 4, '#e8e0d0'); } });
    for (let i = 0; i < 30; i++) { const x = 30 + rnd(i * 3.3) * 300, y = 90 + rnd(i * 5.1) * 140; if (inIsl(x, y, 8) && distRiver(x, y) > 14) R(g, x, y, 1, 1, ['#8fb8ff', '#ffffff', '#f07aa8', '#ffd84a'][i % 4]); }
  }
  function tree(g, x, y, k) { R(g, x - 7, y - 1, 14, 3, 'rgba(20,50,20,0.3)'); R(g, x - 1, y - 5, 3, 5, '#6b4223');
    if (k % 3 === 0) { const A = ['#2f8a3e', '#3fa448', '#5ac05a']; R(g, x - 7, y - 14, 14, 9, A[0]); R(g, x - 5, y - 16, 10, 3, A[0]); R(g, x - 5, y - 15, 7, 4, A[1]); R(g, x - 4, y - 15, 2, 2, A[2]); }
    else if (k % 3 === 1) [[7, 0, '#1f6a30'], [5, -3, '#2a7a38'], [3, -6, '#2f8a3e'], [1, -8, '#3a9a44']].forEach(([w, dy, c]) => R(g, x - w, y - 7 + dy, w * 2 + 1, 3, c));
    else { R(g, x, y - 16, 2, 16, '#2a2024'); [[-5, -13, 5], [2, -11, 6], [-3, -7, 3]].forEach(([dx, dy, l]) => { for (let j = 0; j < l; j++) R(g, x + (dx < 0 ? -j : j + 1), y + dy - Math.round(j / 2), 1, 1, '#2a2024'); }); } }
  let TENTS = 0;
  const TPOS = [[-34, -12, '#c8502e', '#a03a20'], [34, -12, '#3a7ae0', '#2a56b0'], [-44, 8, '#3faa4a', '#2f7a34'], [44, 8, '#f0a020', '#c07010'], [-14, -18, '#9a5ad0', '#6e3aa8'], [14, 16, '#2aa89a', '#1d7a70'], [-28, 18, '#e0453a', '#b02a22'], [28, -20, '#f07aa8', '#c85080']];
  function tent(g, x, y, a, b) { R(g, x - 9, y, 18, 2, 'rgba(0,0,0,0.25)'); for (let k = 0; k < 11; k++) { const w = Math.round(k * 0.85); R(g, x - w, y - 11 + k, w * 2 + 1, 1, k % 4 === 3 ? b : a); } R(g, x - 2, y - 5, 4, 5, '#1c1418'); R(g, x, y - 13, 1, 3, '#6b4a2c'); }
  function fireP(g, x, y) { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; R(g, x + Math.cos(a) * 6 - 1, y + Math.sin(a) * 3 - 1, 3, 2, i % 2 ? '#6a6a76' : '#8a8a96'); } R(g, x - 4, y - 1, 9, 2, '#6b4a2c'); R(g, x - 2, y - 6, 5, 5, '#ff6a1a'); R(g, x - 1, y - 8, 3, 4, '#ffb03a'); R(g, x, y - 9, 1, 3, '#fff2a0'); }
  function sprites() {   // [y, fn]
    const L = [];
    TPOS.slice(0, TENTS).forEach(([dx, dy, a, b]) => L.push([CAMP.y + dy, g => tent(g, CAMP.x + dx, CAMP.y + dy, a, b)]));
    if (TENTS > 0) L.push([CAMP.y + 1, g => fireP(g, CAMP.x, CAMP.y + 1)]);
    for (let i = 0; i < 70; i++) { const x = 20 + rnd(i * 7.7) * 320, y = 86 + rnd(i * 4.9) * 150;
      if (!inIsl(x, y, 10) || distRiver(x, y) < 16) continue; if (((x - CAMP.x) / (CAMP.rx + 16)) ** 2 + ((y - CAMP.y) / (CAMP.ry + 10)) ** 2 < 1) continue; if (Math.abs(x - 172) < 14 && y < CAMP.y) continue;
      L.push([y, g => tree(g, Math.round(x), Math.round(y), i)]); }
    [[110, 140], [240, 190], [90, 190]].forEach(([x, y]) => L.push([y, g => { R(g, x - 4, y - 5, 8, 5, '#8a8a96'); R(g, x - 3, y - 6, 6, 2, '#a8a8b4'); R(g, x + 2, y - 4, 2, 4, '#6a6a76'); }]));
    return L;
  }
  const huddle = n => { if (TAV >= 4) { const a = rnd(n * 3.3), b = rnd(n * 7.1); return { x: CAMP.x - 34 + a * 68, y: CAMP.y + 32 + b * 12 }; } const a = (n * 2.39996) % (Math.PI * 2), r = 6 + (n % 5) * 5; return { x: CAMP.x + Math.cos(a) * r * 1.6, y: CAMP.y + Math.sin(a) * r * 0.7 }; };
  const HOMEO = { x: CAMP.x, y: CAMP.y - 2 };
  const drawTop = (c, toS, z) => { if (TAV < 0 || !TIMG[TAV].complete || !TIMG[TAV].naturalWidth) return; const s2 = 0.72, [a, b] = toS(CAMP.x - 75 * s2, CAMP.y + 12 - 118 * s2); c.imageSmoothingEnabled = false; c.drawImage(TIMG[TAV], Math.round(a), Math.round(b), Math.round(150 * s2 * z), Math.round(140 * s2 * z)); };
  return { drawTop, setLahan, setLuas, setTavern: n => { TAV = n | 0; HOMEO.y = TAV >= 0 ? CAMP.y + 30 : CAMP.y - 2; }, tavern: () => TAV, onImg: f => { onImg = f; }, door: () => ({ x: CAMP.x, y: CAMP.y + 10 }), setTents: n => { TENTS = Math.max(0, Math.min(8, n | 0)); }, tents: () => TENTS, lights: () => TAV >= 4 ? [[CAMP.x - 10, CAMP.y - 6, 14], [CAMP.x + 10, CAMP.y - 6, 14], [CAMP.x - 47, CAMP.y + 2, 12], [CAMP.x + 47, CAMP.y + 2, 12], [CAMP.x, CAMP.y - 30, 18]] : TENTS > 0 ? [[CAMP.x, CAMP.y - 4, 22]] : [], ISL, CAMP, EYES, walk, mountain, ground, sprites, huddle, HOME: HOMEO };
})();
