// Kota Sikepo — renderer kartu warga (pixel 5x7, sama dengan video)
(function () {
const SK_BG = {};
for (const k of ['hari1', 'hari2']) { const im = new Image(); im.src = 'img/bg_' + k + '.png'; SK_BG[k] = im; }
// ---------- 5x7 pixel font (same as the videos) ----------
const F = {
 'A':[14,17,17,31,17,17,17],'B':[30,17,17,30,17,17,30],'C':[14,17,16,16,16,17,14],'D':[30,17,17,17,17,17,30],
 'E':[31,16,16,30,16,16,31],'F':[31,16,16,30,16,16,16],'G':[14,17,16,23,17,17,15],'H':[17,17,17,31,17,17,17],
 'I':[14,4,4,4,4,4,14],'J':[7,2,2,2,2,18,12],'K':[17,18,20,24,20,18,17],'L':[16,16,16,16,16,16,31],
 'M':[17,27,21,21,17,17,17],'N':[17,17,25,21,19,17,17],'O':[14,17,17,17,17,17,14],'P':[30,17,17,30,16,16,16],
 'Q':[14,17,17,17,21,18,13],'R':[30,17,17,30,20,18,17],'S':[15,16,16,14,1,1,30],'T':[31,4,4,4,4,4,4],
 'U':[17,17,17,17,17,17,14],'V':[17,17,17,17,17,10,4],'W':[17,17,17,21,21,21,10],'X':[17,17,10,4,10,17,17],
 'Y':[17,17,10,4,4,4,4],'Z':[31,1,2,4,8,16,31],
 '0':[14,17,19,21,25,17,14],'1':[4,12,4,4,4,4,14],'2':[14,17,1,2,4,8,31],'3':[30,1,1,14,1,1,30],
 '4':[2,6,10,18,31,2,2],'5':[31,16,30,1,1,17,14],'6':[6,8,16,30,17,17,14],'7':[31,1,2,4,8,8,8],
 '8':[14,17,17,14,17,17,14],'9':[14,17,17,15,1,2,12],
 '!':[4,4,4,4,4,0,4],'?':[14,17,1,2,4,0,4],'.':[0,0,0,0,0,12,12],',':[0,0,0,0,12,4,8],
 ':':[0,12,12,0,12,12,0],'-':[0,0,0,31,0,0,0],"'":[4,4,8,0,0,0,0],'(':[2,4,8,8,8,4,2],')':[8,4,2,2,2,4,8],' ':[0,0,0,0,0,0,0],
 '*':[0,21,14,31,14,21,0],'@':[14,17,23,21,23,16,14],'_':[0,0,0,0,0,0,31],'+':[0,4,4,31,4,4,0],'=':[0,0,31,0,31,0,0],
 '/':[1,1,2,4,8,16,16],'%':[24,25,2,4,8,19,3],'&':[12,18,20,8,21,18,13],'#':[10,10,31,10,31,10,10]
};
const tw = (s, sc) => s.length * 6 * sc - sc;
function txt(ctx, s, x, y, sc, color, shadow) {
  if (shadow) txt(ctx, s, x + sc, y + sc, sc, shadow, null);
  ctx.fillStyle = color;
  for (let i = 0; i < s.length; i++) { const g = F[s[i]] || F[' '];
    for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (g[r] & (16 >> c)) ctx.fillRect(Math.round(x + (i * 6 + c) * sc), Math.round(y + r * sc), sc, sc); }
}
function txtO(ctx, s, x, y, sc, color, outline) {
  for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]]) txt(ctx, s, x + dx * sc, y + dy * sc, sc, outline, null);
  txt(ctx, s, x + sc, y + sc * 2, sc, outline, null); txt(ctx, s, x, y, sc, color, null);
}
const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
function box(ctx, x, y, w, h, fill, border) {
  R(ctx, x + 2, y + 4, w, h, 'rgba(0,0,0,0.25)');
  R(ctx, x + 2, y, w - 4, h, border); R(ctx, x, y + 2, w, h - 4, border);
  R(ctx, x + 4, y + 2, w - 8, h - 4, fill); R(ctx, x + 2, y + 4, w - 4, h - 8, fill);
}
const clean = s => (s || '').toUpperCase().split('').map(ch => F[ch] ? ch : (ch === ' ' ? ' ' : '_')).join('').trim();

const KAT = {
  'PENGUSUL JUARA': { fill: '#ffd84a', ink: '#1c1c24', hak: 'HAK: VOTING + KOMEN' },
  'UNDIAN': { fill: '#e02f2f', ink: '#ffffff', hak: 'HAK: VOTING + KOMEN' },
  'TUKANG': { fill: '#3a6fd8', ink: '#ffffff', hak: 'HAK: VOTING + BANGUN' },
  'WARGA': { fill: '#e02f2f', ink: '#ffffff', hak: 'HAK: VOTING + KOMEN' }
};

// ---------- the card (316x196 world px, same as the episodes) ----------
function kartu(ctx, x, y, d) {
  const w = 316, h = 196;
  R(ctx, x + 4, y + 6, w, h, 'rgba(0,0,0,0.35)');
  R(ctx, x + 2, y, w - 4, h, '#1c1c24'); R(ctx, x, y + 2, w, h - 4, '#1c1c24');
  R(ctx, x + 3, y + 3, w - 6, h - 6, '#fff6dc');
  for (let yy = y + 44; yy < y + h - 8; yy += 8) for (let xx = x + 8; xx < x + w - 8; xx += 8) R(ctx, xx + (((yy - y) / 8) % 2) * 4, yy, 1, 1, '#f1dfae');
  R(ctx, x + 3, y + 3, w - 6, 34, '#e02f2f'); R(ctx, x + 3, y + 30, w - 6, 7, '#ffffff');
  txt(ctx, 'KARTU WARGA', x + 12, y + 10, 2, '#ffffff', '#8a1010');
  txt(ctx, 'KOTA SIKEPO', x + w - 12 - tw('KOTA SIKEPO', 1), y + 12, 1, '#ffd84a', null);
  txt(ctx, 'KOTA PALING KEPO', x + w - 12 - tw('KOTA PALING KEPO', 1), y + 22, 1, '#ffe0dc', null);
  const px = x + 14, py = y + 50;
  R(ctx, px, py, 72, 88, '#1c1c24'); R(ctx, px + 3, py + 3, 66, 82, '#8fd0fb'); R(ctx, px + 3, py + 58, 66, 27, '#72c44c');
  ctx.save(); ctx.beginPath(); ctx.rect(px + 3, py + 3, 66, 82); ctx.clip(); avatar(ctx, px, py, d.av, d.kat === 'TUKANG'); ctx.restore();
  const fx = x + 98; let fy = y + 52; const maxW = w - 98 - 12;
  const field = (k, v, vc) => {
    txt(ctx, k, fx, fy, 1, '#8a5a2b', null);
    let sc = 2; if (tw(v, 2) > maxW) sc = 1;
    let s = v; while (tw(s, sc) > maxW && s.length > 1) s = s.slice(0, -1);
    txt(ctx, s, fx, fy + 10 + (sc === 1 ? 3 : 0), sc, vc || '#1c1c24', null); fy += 30;
  };
  field('NO. INDUK WARGA', d.no);
  field('NAMA', d.nama || '___________');
  field('STATUS', d.kat === 'TUKANG' ? 'TUKANG KEPO' : 'WARGA KEPO', '#d23a2a');
  txt(ctx, 'BERGABUNG: HARI ' + d.hari, fx, fy, 1, '#8a5a2b', null);
  txt(ctx, KAT[d.kat].hak, fx, fy + 10, 1, '#8a5a2b', null);
  const sx = x + w - 92, sy = y + h - 40;
  for (let i = 0; i < 36; i++) R(ctx, sx + i, sy + Math.round(Math.sin(i * 0.7) * 3), 1, 1, '#1c3c8a');
  txt(ctx, 'UDIN, WALI KOTA', sx - 14, sy + 10, 1, '#1c1c24', null);
  const cx = sx + 54, cy = sy + 2, r = 16;
  for (let k = 0; k < 64; k++) { const th = k / 64 * Math.PI * 2;
    R(ctx, cx + Math.round(Math.cos(th) * r), cy + Math.round(Math.sin(th) * r), 1, 1, 'rgba(224,47,47,0.8)');
    R(ctx, cx + Math.round(Math.cos(th) * (r - 3)), cy + Math.round(Math.sin(th) * (r - 3)), 1, 1, 'rgba(224,47,47,0.6)'); }
  txt(ctx, 'SAH', cx - 8, cy - 3, 1, 'rgba(224,47,47,0.9)', null);
  // static shine
  for (let yy = y + 40; yy < y + h - 14; yy++) R(ctx, x + 216 + Math.round((yy - y) * 0.3), yy, 3, 1, 'rgba(255,255,255,0.28)');
  R(ctx, x + 3, y + h - 12, w - 6, 9, '#1c1c24');
  txt(ctx, 'FOLLOW = DAPAT KARTU INI', x + 10, y + h - 11, 1, '#ffd84a', null);
}

// ---------- 6 karakter + misteri (drawn inside the 66x82 photo frame) ----------
const AV = [
  { id: 'MISTERI', label: 'MISTERI ?' },
  { id: 'COWOK1', label: 'COWOK 1' }, { id: 'COWOK2', label: 'COWOK 2' }, { id: 'COWOK3', label: 'COWOK 3' },
  { id: 'CEWEK1', label: 'CEWEK 1' }, { id: 'CEWEK2', label: 'CEWEK 2' }, { id: 'CEWEK3', label: 'CEWEK 3' }
];
function avatar(ctx, px, py, id, tukang) {
  const r = (x, y, w, h, c) => R(ctx, px + x, py + y, w, h, c);
  const K = '#1c1c24';
  const face = (skin, opt = {}) => {
    r(32, 46, 8, 6, skin);                                   // neck
    r(23, 22, 26, 26, skin); r(21, 31, 2, 7, skin); r(49, 31, 2, 7, skin);
    r(23, 47, 26, 1, 'rgba(0,0,0,0.12)');
    if (opt.lashes) { r(28, 33, 5, 1, K); r(39, 33, 5, 1, K); }
    r(29, 34, 3, 4, K); r(40, 34, 3, 4, K); r(29, 34, 1, 1, '#ffffff'); r(40, 34, 1, 1, '#ffffff');
    if (opt.blush) { r(25, 40, 4, 2, '#f28c8c'); r(43, 40, 4, 2, '#f28c8c'); }
    r(33, 42, 6, 1, '#8a3020'); r(32, 41, 1, 1, '#8a3020'); r(39, 41, 1, 1, '#8a3020');
  };
  const body = (c, dark) => { r(15, 52, 42, 33, c); r(15, 52, 4, 33, dark); r(53, 52, 4, 33, dark); };
  if (!id || id === 'MISTERI') {
    r(15, 48, 42, 34, tukang ? '#3a6fd8' : '#4d7cff');
    r(23, 20, 26, 26, '#f4b47c'); r(21, 14, 30, 10, K);
    if (tukang) { vest(); helmet(); }
    txtO(ctx, '?', px + 30, py + 26, 2, '#ffffff', K);
    return;
  }
  function vest() {   // rompi tukang: biru, garis kuning, bagian tengah terbuka
    r(15, 54, 15, 31, '#2a5fc8'); r(42, 54, 15, 31, '#2a5fc8');
    r(15, 54, 2, 31, '#1f4aa0'); r(55, 54, 2, 31, '#1f4aa0'); r(28, 54, 2, 31, '#1f4aa0'); r(42, 54, 2, 31, '#1f4aa0');
    r(15, 66, 15, 3, '#ffd84a'); r(42, 66, 15, 3, '#ffd84a'); r(15, 75, 15, 3, '#ffd84a'); r(42, 75, 15, 3, '#ffd84a');
    r(20, 58, 5, 4, '#1f4aa0');
  }
  function helmet() { r(20, 11, 32, 9, '#ffffff'); r(22, 9, 28, 3, '#ffffff'); r(17, 18, 38, 3, '#d9d9d9'); r(34, 9, 4, 11, '#e6e6e6'); }
  if (id === 'COWOK1') {            // rapi, rambut hitam pendek, kaos merah
    body('#d23a2a', '#a82a1e'); r(30, 52, 12, 3, '#ffffff'); r(44, 60, 7, 6, '#a82a1e');
    face('#e8a874');
    r(21, 15, 30, 9, K); r(21, 22, 3, 9, K); r(48, 22, 3, 9, K); r(24, 22, 14, 3, K); r(38, 22, 6, 2, K);
  } else if (id === 'COWOK2') {     // kacamata, rambut cokelat acak, hoodie hijau
    body('#3f9b4a', '#2c7436'); r(24, 50, 24, 4, '#2c7436'); r(31, 54, 1, 9, '#ffffff'); r(40, 54, 1, 9, '#ffffff');
    face('#f4c49c');
    r(21, 15, 30, 9, '#6b3b1f'); r(23, 12, 4, 3, '#6b3b1f'); r(30, 11, 5, 4, '#6b3b1f'); r(40, 12, 5, 3, '#6b3b1f');
    r(22, 22, 8, 4, '#6b3b1f'); r(30, 22, 6, 3, '#6b3b1f'); r(38, 22, 11, 4, '#6b3b1f'); r(21, 22, 2, 8, '#6b3b1f'); r(49, 22, 2, 8, '#6b3b1f');
    for (const gx of [26, 37]) { r(gx, 32, 9, 1, K); r(gx, 39, 9, 1, K); r(gx, 32, 1, 8, K); r(gx + 8, 32, 1, 8, K); }
    r(35, 34, 2, 1, K);
  } else if (id === 'COWOK3') {     // topi biru, kulit sawo matang, jersey kuning
    body('#ffd84a', '#e0b020'); r(15, 62, 42, 3, K); r(30, 52, 12, 2, K);
    face('#a8683c');
    r(21, 22, 3, 6, K); r(48, 22, 3, 6, K);
    r(21, 13, 30, 10, '#2f5fd0'); r(23, 11, 26, 3, '#2f5fd0'); r(33, 15, 6, 4, '#ffffff'); r(19, 22, 36, 3, '#1f3f90');
  } else if (id === 'CEWEK1') {     // hijab pink, baju ungu
    body('#7a4fd0', '#5a36a8');
    r(18, 15, 36, 37, '#f07aa8'); r(13, 46, 46, 10, '#f07aa8'); r(13, 54, 46, 2, '#c85a88'); r(20, 13, 32, 3, '#f07aa8');
    r(23, 22, 26, 26, '#f4c49c');
    face('#f4c49c', { blush: true, lashes: true });
    r(23, 22, 26, 2, '#f07aa8'); r(20, 22, 3, 28, '#f07aa8'); r(49, 22, 3, 28, '#f07aa8'); r(18, 15, 2, 37, '#c85a88'); r(52, 15, 2, 37, '#c85a88'); r(46, 54, 4, 4, '#ffd84a');
  } else if (id === 'CEWEK2') {     // rambut panjang hitam kuncir, baju oranye
    r(19, 18, 34, 36, K);
    body('#f08a2a', '#c86a18'); r(19, 52, 6, 10, K); r(47, 52, 6, 10, K);
    face('#f0b888', { blush: true, lashes: true });
    r(21, 15, 30, 7, K); r(23, 22, 12, 4, K); r(35, 22, 14, 3, K); r(21, 22, 3, 22, K); r(48, 22, 3, 22, K);
    r(51, 16, 4, 4, '#e02f2f'); r(53, 19, 6, 6, K); r(55, 25, 5, 12, K); r(56, 37, 3, 4, K);
  } else if (id === 'CEWEK3') {     // bob cokelat + jepit, dress toska
    body('#2aa89a', '#1d8075'); r(27, 52, 18, 3, '#ffffff'); r(35, 55, 2, 2, '#ffffff');
    face('#f4b47c', { blush: true, lashes: true });
    r(20, 15, 32, 9, '#8a4a24'); r(20, 22, 5, 20, '#8a4a24'); r(47, 22, 5, 20, '#8a4a24'); r(25, 22, 22, 4, '#8a4a24'); r(30, 26, 4, 1, '#8a4a24');
    r(20, 41, 6, 2, '#6a3418'); r(46, 41, 6, 2, '#6a3418'); r(41, 19, 6, 3, '#ffd84a'); r(42, 18, 4, 1, '#ffd84a');
  }
  if (tukang) { vest(); helmet(); }
}
function pill(ctx, cx, y, d) {
  const k = KAT[d.kat]; if (!k.fill) return;
  const lab = d.no + ' - ' + d.kat, lw = tw(lab, 2) + 20;
  box(ctx, cx - lw / 2, y, lw, 28, k.fill, '#1c1c24');
  txt(ctx, lab, cx - lw / 2 + 10, y + 7, 2, k.ink, null);
}
function batikBg(ctx, W, H) {
  R(ctx, 0, 0, W, H, '#7a3b1c');
  for (let y = 0; y < H; y += 16) for (let x = 0; x < W; x += 16) {
    const o = ((y / 16) % 2) * 8;
    R(ctx, x + o + 6, y + 2, 4, 4, '#a3582a'); R(ctx, x + o + 7, y + 7, 2, 6, '#5c2a12'); R(ctx, x + o + 2, y + 10, 2, 2, '#e0a040'); R(ctx, x + o + 12, y + 10, 2, 2, '#e0a040');
  }
}


// ===== KEPO FANTASY: job petualang (dipetakan dari kode karakter lama, tanpa ubah database) =====
const jMk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; };
function jCrisp(c, outline) {   // ambang alpha + garis tepi 1px
  const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height), p = d.data, w = c.width, h = c.height;
  for (let i = 3; i < p.length; i += 4) p[i] = p[i] > 110 ? 255 : 0;
  if (outline) { const o = new Uint8Array(w * h); for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) { if (p[(yy * w + xx) * 4 + 3]) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = xx + dx, b = yy + dy; if (a >= 0 && b >= 0 && a < w && b < h && p[(b * w + a) * 4 + 3] && !o[b * w + a] ) { o[yy * w + xx] = 2; break; } } }
    const [r, gg, b] = [parseInt(outline.slice(1, 3), 16), parseInt(outline.slice(3, 5), 16), parseInt(outline.slice(5, 7), 16)];
    for (let i = 0; i < w * h; i++) if (o[i] === 2) { p[i * 4] = r; p[i * 4 + 1] = gg; p[i * 4 + 2] = b; p[i * 4 + 3] = 255; } }
  x.putImageData(d, 0, 0); return c;
}
// ---------- karakter chibi (16x26, kaki di y=24) ----------
function jChibi(o) {
  const [c, x] = jMk(24, 28), cx = 12, by = 25, r = (a, b, w, h, col) => R(x, cx + a, by + b, w, h, col);
  const skin = o.skin || '#f4b47c', hair = o.hair || '#5a3a1a';
  if (o.cape) { r(-6, -12, 12, 11, o.cape); r(-6, -2, 12, 1, o.cape2 || o.cape); }
  if (o.wb) o.wb(r);                                                   // senjata di belakang
  r(-3, -3, 2, 3, o.legs || '#3a3a46'); r(1, -3, 2, 3, o.legs || '#3a3a46'); r(-3, -1, 2, 1, o.boot || '#2a1a10'); r(1, -1, 2, 1, o.boot || '#2a1a10');
  if (o.robe) { r(-4, -9, 8, 9, o.body); r(-4, -1, 8, 1, o.robe); } else r(-4, -9, 8, 6, o.body);
  if (o.trim) o.trim(r);
  r(-5, -9, 1, 4, o.sleeve || o.body); r(4, -9, 1, 4, o.sleeve || o.body); r(-5, -5, 1, 1, skin); r(4, -5, 1, 1, skin);
  r(-5, -19, 10, 10, skin);                                            // kepala
  r(-5, -19, 10, 3, hair); r(-5, -16, 1, 3, hair); r(4, -16, 1, 3, hair);
  if (o.hairX) o.hairX(r);
  r(-2, -14, 1, 2, '#1c1c24'); r(1, -14, 1, 2, '#1c1c24');
  if (o.blush) { r(-4, -12, 1, 1, '#f08a8a'); r(3, -12, 1, 1, '#f08a8a'); }
  if (o.face) o.face(r);
  if (o.hat) o.hat(r);
  if (o.wf) o.wf(r);                                                   // senjata di depan
  return jCrisp(c, o.line || '#14101c');
}

const JCH = {
  warrior: { body: '#9a9eac', sleeve: '#7a7e8c', legs: '#5a5e6c', cape: '#c8302a', cape2: '#8a1a1a', hair: '#5a3a1a',
    hat: r => { r(-5, -21, 10, 5, '#b8bcc8'); r(-6, -18, 1, 6, '#b8bcc8'); r(5, -18, 1, 6, '#b8bcc8'); r(-1, -16, 2, 4, '#9a9eac'); r(-5, -22, 10, 1, '#8a8e9c'); r(-1, -23, 2, 1, '#ffd84a'); },
    trim: r => { r(-4, -9, 8, 1, '#c8a040'); r(-1, -8, 2, 4, '#c8302a'); r(-4, -4, 8, 1, '#5a3a20'); },
    wb: r => { r(6, -18, 1, 11, '#d8dce8'); r(5, -8, 3, 1, '#c8a040'); },
    wf: r => { r(-9, -11, 6, 8, '#8a5a2b'); r(-8, -10, 4, 6, '#a8763e'); r(-7, -8, 2, 2, '#c8a040'); } },
  barbarian: { skin: '#e0a070', hair: '#e8c060', body: '#e0a070', sleeve: '#e0a070', legs: '#c89040', boot: '#5a3a20',
    hairX: r => { r(-6, -17, 2, 8, '#e8c060'); r(4, -17, 2, 8, '#e8c060'); },
    face: r => { r(-4, -12, 8, 4, '#e8c060'); r(-2, -12, 4, 1, '#c89040'); r(-3, -15, 2, 1, '#8a5a2b'); r(1, -15, 2, 1, '#8a5a2b'); },
    trim: r => { r(-5, -10, 3, 3, '#f4ecd8'); r(2, -10, 3, 3, '#f4ecd8'); r(-4, -4, 8, 1, '#6b4a2c'); r(-1, -4, 2, 1, '#c8a040'); r(-2, -8, 1, 1, '#c88050'); r(1, -8, 1, 1, '#c88050'); },
    wb: r => { r(6, -22, 1, 22, '#6b4a2c'); r(3, -23, 4, 6, '#b8bcc8'); r(7, -23, 4, 6, '#b8bcc8'); r(2, -22, 1, 4, '#d8dce8'); r(11, -22, 1, 4, '#d8dce8'); } },
  ranger: { body: '#3a7a6a', sleeve: '#2f6a5a', legs: '#4a3a2a', hair: '#3a2a1a', cape: '#1d6a6a', cape2: '#14504f', skin: '#e8b080',
    hat: r => { r(-6, -21, 12, 4, '#2a8a8a'); r(-6, -17, 2, 6, '#2a8a8a'); r(4, -17, 2, 6, '#2a8a8a'); r(-2, -22, 4, 1, '#2a8a8a'); },
    trim: r => { r(-4, -9, 8, 1, '#c8a040'); for (let k = 0; k < 6; k++) r(3 - k, -9 + k, 1, 1, '#6b4a2c'); },
    wb: r => { r(-8, -18, 3, 9, '#6b4a2c'); r(-8, -20, 1, 2, '#f4ecd0'); r(-6, -21, 1, 3, '#f4ecd0');
      for (let k = 0; k < 16; k++) r(7 + Math.round(Math.sin(k / 15 * Math.PI) * 3), -21 + k, 1, 1, '#8a5a2b'); r(7, -21, 1, 16, '#e8e0d0'); } },
  mage: { body: '#4a2a6a', robe: '#2a1a40', sleeve: '#3a2058', skin: '#c8a080', hair: '#2a1a40',
    hat: r => { r(-6, -21, 12, 5, '#3a2058'); r(-6, -16, 2, 7, '#3a2058'); r(4, -16, 2, 7, '#3a2058'); r(-3, -23, 6, 2, '#3a2058'); r(-4, -16, 8, 2, '#1c1030'); },
    face: r => { r(-3, -15, 2, 1, '#e070ff'); r(1, -15, 2, 1, '#e070ff'); r(-2, -12, 4, 1, '#8a6a5a'); },
    trim: r => { r(-1, -9, 2, 9, '#c8a040'); r(-4, -4, 8, 1, '#c8a040'); },
    wb: r => { r(6, -22, 1, 22, '#5a3a20'); r(4, -26, 5, 5, '#b040ff'); r(5, -25, 3, 3, '#f0b0ff'); r(5, -28, 1, 2, '#e070ff'); r(7, -27, 1, 1, '#e070ff'); } },
  blacksmith: { skin: '#d89060', hair: '#6a5a4a', body: '#d89060', sleeve: '#d89060', legs: '#4a3a2a', boot: '#2a1a10',
    hairX: r => { r(-5, -19, 10, 1, '#d89060'); r(-5, -18, 1, 4, '#6a5a4a'); r(4, -18, 1, 4, '#6a5a4a'); },
    face: r => { r(-4, -12, 8, 5, '#8a7a6a'); r(-3, -8, 6, 2, '#8a7a6a'); r(-2, -12, 4, 1, '#6a5a4a'); r(-3, -15, 2, 1, '#5a4a3a'); r(1, -15, 2, 1, '#5a4a3a'); },
    trim: r => { r(-3, -8, 6, 8, '#6b4a2c'); r(-3, -8, 6, 1, '#8a5a2b'); r(-4, -9, 1, 3, '#6b4a2c'); r(3, -9, 1, 3, '#6b4a2c'); },
    wf: r => { r(6, -24, 1, 12, '#6b4a2c'); r(4, -27, 6, 4, '#4a4a56'); r(4, -27, 6, 1, '#6a6a76'); } },
  pemula: { body: '#d8c08a', sleeve: '#c8ac74', legs: '#5a4030', boot: '#3a2414', hair: '#5a3a1a',
    trim: r => { r(-4, -4, 8, 1, '#5a3a20'); r(-1, -4, 2, 1, '#c8a040'); for (let k = 0; k < 6; k++) r(-3 + k, -9 + k, 1, 1, '#6b4a2c'); r(3, -5, 3, 3, '#8a5a2b'); },
    wb: r => { r(-8, -18, 1, 12, '#a8763e'); r(-9, -8, 3, 1, '#6b4a2c'); } },
};
const JOBS = [
  { id: 'WARRIOR', av: 'COWOK1', k: 'warrior', label: 'WARRIOR', col: '#e0602a', hp: 5 },
  { id: 'BARBARIAN', av: 'COWOK2', k: 'barbarian', label: 'BARBARIAN', col: '#f0a040', hp: 6 },
  { id: 'RANGER', av: 'COWOK3', k: 'ranger', label: 'RANGER', col: '#2aa89a', hp: 5 },
  { id: 'MAGE', av: 'CEWEK1', k: 'mage', label: 'MAGE', col: '#b040ff', hp: 3 },
  { id: 'BLACKSMITH', av: 'CEWEK2', k: 'blacksmith', label: 'BLACKSMITH', col: '#ff8a2a', hp: 4 },
  { id: 'PEMULA', av: 'CEWEK3', k: 'pemula', label: 'WARGA BIASA', col: '#8a8a96', hp: 2 }
];
const JSPR = {}; for (const j of JOBS) JSPR[j.id] = jChibi(JCH[j.k]);
function jobOf(w) { if (!w) return JOBS[5]; if (w.kat === 'TUKANG' && w.av !== 'COWOK1' && w.av !== 'COWOK2' && w.av !== 'COWOK3' && w.av !== 'CEWEK1') return JOBS[4]; return JOBS.find(j => j.av === w.av) || JOBS[5]; }
function jobPortrait(ctx, px, py, job) { R(ctx, px + 3, py + 3, 66, 82, '#2a2a46'); for (let i = 0; i < 20; i++) R(ctx, px + 4 + (i * 13) % 64, py + 5 + (i * 7) % 50, 1, 1, '#8a8ad8');
  R(ctx, px + 3, py + 62, 66, 23, '#3a6a3a'); ctx.drawImage(JSPR[job.id], px + 36 - 36, py + 85 - 77, 72, 84); }
const JDESC = { WARRIOR: 'PALING DEPAN SAAT BERTEMPUR. JAGO PEDANG & PERISAI.', BARBARIAN: 'PETARUNG LIAR. KALAU MARAH BISA MENGAMUK!', RANGER: 'PENJAGA HUTAN. JAGO MEMANAH & MELACAK JEJAK.',
  MAGE: 'CERDAS & DISIPLIN. SIHIRNYA MENGHANGUSKAN MONSTER.', BLACKSMITH: 'PENEMPA SENJATA GUILD. TANPA DIA CUMA BAWA RANTING.', PEMULA: 'WARGA BIASA YANG BERKELANA DI DUNIA KEPO FANTASY.' };
function kartuP(ctx, x, y, d, job) {   // gaya kartu perkamen + bingkai kayu
  const w = 316, h = 196;
  R(ctx, x + 4, y + 6, w, h, 'rgba(0,0,0,0.35)');
  R(ctx, x, y, w, h, '#3a2210'); R(ctx, x + 2, y + 2, w - 4, h - 4, '#7a4a22'); R(ctx, x + 2, y + 2, w - 4, 2, '#a8703a');
  for (let i = 0; i < w; i += 12) { R(ctx, x + i, y + 5, 6, 1, '#5a3418'); R(ctx, x + i + 6, y + h - 6, 6, 1, '#5a3418'); }
  R(ctx, x + 8, y + 8, w - 16, h - 16, '#5a3418'); R(ctx, x + 10, y + 10, w - 20, h - 20, '#e8c890');
  for (let yy = y + 12; yy < y + h - 12; yy += 6) for (let xx = x + 12; xx < x + w - 12; xx += 10) if ((xx * 7 + yy * 3) % 11 < 2) R(ctx, xx, yy, 2, 1, '#d8b478');
  [[x + 8, y + 8], [x + w - 14, y + 8], [x + 8, y + h - 14], [x + w - 14, y + h - 14]].forEach(([a, b2]) => { R(ctx, a, b2, 6, 6, '#3a2210'); R(ctx, a + 1, b2 + 1, 4, 4, '#c8a040'); });
  // judul + permata
  R(ctx, x + 16, y + 15, 14, 14, '#1c1c24'); R(ctx, x + 17, y + 16, 12, 12, job.col); R(ctx, x + 19, y + 18, 4, 3, '#ffffff'); R(ctx, x + 18, y + 25, 10, 2, 'rgba(0,0,0,0.25)');
  txtO(ctx, job.label, x + 36, y + 15, 2, job.col, '#3a2210'); R(ctx, x + 36, y + 31, w - 52, 1, '#a8703a');
  // potret
  const px = x + 16, py = y + 40; R(ctx, px, py, 72, 88, '#5a3418'); R(ctx, px + 2, py + 2, 68, 84, '#d8b478');
  ctx.save(); ctx.beginPath(); ctx.rect(px + 3, py + 3, 66, 82); ctx.clip(); R(ctx, px + 3, py + 3, 66, 82, '#e8d0a0'); R(ctx, px + 3, py + 70, 66, 15, '#c89a60'); ctx.drawImage(JSPR[job.id], px, py + 6, 72, 84); ctx.restore();
  // panel teks
  const tx = x + 98, ty = y + 40, tW = w - 98 - 16; R(ctx, tx, ty, tW, 88, '#d8b478'); R(ctx, tx + 1, ty + 1, tW - 2, 86, '#f0dcae');
  const words = JDESC[job.id].split(' '); let line = '', ly = ty + 6; const lines = [];
  words.forEach(wd => { const t2 = line ? line + ' ' + wd : wd; if (tw(t2, 1) > tW - 12) { lines.push(line); line = wd; } else line = t2; }); lines.push(line);
  lines.forEach(l => { txt(ctx, l, tx + 6, ly, 1, '#3a2210', null); ly += 10; });
  txt(ctx, 'HP', tx + 6, ty + 66, 1, '#8a4a22', null); for (let i = 0; i < 6; i++) { const hx = tx + 22 + i * 9, c = i < job.hp ? '#e02f2f' : '#c8aa78'; R(ctx, hx, ty + 66, 3, 2, c); R(ctx, hx + 4, ty + 66, 3, 2, c); R(ctx, hx, ty + 68, 7, 2, c); R(ctx, hx + 1, ty + 70, 5, 1, c); R(ctx, hx + 2, ty + 71, 3, 1, c); }
  // identitas
  const fy = y + 136; let nm = d.nama || '___________', sc = 2; if (tw(nm, 2) > 210) sc = 1;
  txt(ctx, 'PETUALANG #' + d.no, x + 16, fy, 1, '#8a4a22', null); txt(ctx, nm, x + 16, fy + 10, sc, '#1c1c24', null);
  txt(ctx, 'KEPO FANTASY · DAY ' + d.hari, x + 16, fy + 30, 1, '#8a4a22', null);
  const cx = x + w - 40, cy = y + h - 36, r0 = 14; for (let kk = 0; kk < 56; kk++) { const th = kk / 56 * Math.PI * 2; R(ctx, cx + Math.round(Math.cos(th) * r0), cy + Math.round(Math.sin(th) * r0), 1, 1, 'rgba(47,138,58,0.85)'); }
  txt(ctx, 'GUILD', cx - 11, cy - 6, 1, 'rgba(47,138,58,0.95)', null); txt(ctx, 'SAH', cx - 8, cy + 3, 1, 'rgba(47,138,58,0.95)', null);
}
function fantasyBg(ctx, W, H) {   // latar Kepo Fantasy: langit malam, pegunungan, gua bermata merah, hutan
  for (let y = 0; y < H; y++) { const t = y / H; R(ctx, 0, y, W, 1, `rgb(${Math.round(28 + 10 * t)},${Math.round(24 + 30 * t)},${Math.round(60 - 20 * t)})`); }
  for (let i = 0; i < 70; i++) R(ctx, (i * 97) % W, (i * 53) % Math.round(H * 0.45), 1, 1, i % 5 ? '#c9d2ea' : '#ffffff');
  const ridge = (base, amp, f, s, col, snow) => { for (let x = 0; x < W; x += 2) { const n = Math.abs(Math.sin(x / f + s)) * 0.6 + Math.abs(Math.sin(x / (f * 0.4) + s * 3)) * 0.4, top = Math.round(base - amp * n); R(ctx, x, top, 2, H - top, col); if (snow) R(ctx, x, top, 2, 3, snow); } };
  const b = H * 0.2; ridge(b - 20, 46, 26, 1.1, '#4a5470', '#c8d4e8'); ridge(b, 50, 17, 3.7, '#343c52', null);
  const cx = W / 2, cy = b + 10; for (let y = 0; y < 40; y++) { const w = Math.round(34 * Math.sqrt(Math.max(0, 1 - ((40 - y) / 40) ** 2))); R(ctx, cx - w - 2, cy - 40 + y, (w + 2) * 2, 1, '#5a6680'); R(ctx, cx - w, cy - 40 + y, w * 2, 1, '#0a0608'); }
  for (let kx = -28; kx <= 28; kx += 7) for (let j = 0; j < 7 - Math.abs(kx) / 6; j++) R(ctx, cx + kx, cy - 37 + j + Math.round(Math.abs(kx) / 3), 2, 1, '#e8e0d0');
  R(ctx, cx - 12, cy - 22, 6, 3, '#ff3a2a'); R(ctx, cx + 6, cy - 22, 6, 3, '#ff3a2a');
  R(ctx, 0, b + 10, W, H - b, '#1a2e24'); for (let i = 0; i < 60; i++) { const x = (i * 37) % W, y = b + 14 + ((i * 29) % Math.round(H - b)); R(ctx, x - 4, y - 6, 9, 6, i % 2 ? '#1f3a2a' : '#173024'); }
}
function render(d) {
  const story = d.size === 'story';
  const W = story ? 360 : 340, H = story ? 640 : 240;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  if (d.fantasy) fantasyBg(ctx, W, H);
  else if (d.bg === 'polos' || !SK_BG[d.bg] || !SK_BG[d.bg].complete) batikBg(ctx, W, H);
  else if (story) ctx.drawImage(SK_BG[d.bg], 0, 0);
  else ctx.drawImage(SK_BG[d.bg], 10, 150, 340, 240, 0, 0, 340, 240);
  ctx.fillStyle = d.fantasy ? 'rgba(10,10,30,0.15)' : 'rgba(10,10,30,0.6)'; ctx.fillRect(0, 0, W, H);
  if (story) {
    const J = d.fantasy ? jobOf(d) : null;
    if (J) { const lab = d.no + ' - ' + J.label, lw = tw(lab, 2) + 20; box(ctx, 180 - lw / 2, 166, lw, 28, J.col, '#1c1c24'); txt(ctx, lab, 180 - lw / 2 + 10, 173, 2, '#ffffff', null); kartuP(ctx, 22, 210, d, J); }
    else { pill(ctx, 180, 166, d); kartu(ctx, 22, 210, d); }
    const l1 = J ? 'PETUALANG BARU' : (d.judul || 'WARGA TERPILIH'), l2 = J ? 'KEPO FANTASY - DAY ' + d.hari : 'KOTA SIKEPO - HARI ' + d.hari;
    let s1 = 3; if (tw(l1, 3) > 340) s1 = 2;
    txtO(ctx, l1, (W - tw(l1, s1)) / 2, 440, s1, '#ffd84a', '#1c1c24');
    txtO(ctx, l2, (W - tw(l2, 2)) / 2, 474, 2, '#ffffff', '#1c1c24');
    const l3 = J ? 'KOMEN JOB KAMU DI VIDEO UDIN THE GOBLIN' : 'DM "KARTU SIKEPO" KE WALI KOTA';
    txt(ctx, l3, (W - tw(l3, 1)) / 2, 506, 1, '#ffe0dc', '#1c1c24');
  } else {
    const J = d.fantasy ? jobOf(d) : null;
    if (J) { const lab = d.no + ' - ' + J.label, lw = tw(lab, 2) + 20; box(ctx, 170 - lw / 2, 6, lw, 28, J.col, '#1c1c24'); txt(ctx, lab, 170 - lw / 2 + 10, 13, 2, '#ffffff', null); kartuP(ctx, 12, 38, d, J); }
    else { pill(ctx, 170, 6, d); kartu(ctx, 12, KAT[d.kat].fill ? 38 : 22, d); }
  }
  // upscale x3 nearest neighbour
  const o = document.createElement('canvas'); o.width = W * 3; o.height = H * 3;
  const octx = o.getContext('2d'); octx.imageSmoothingEnabled = false; octx.drawImage(c, 0, 0, W * 3, H * 3);
  return { small: c, big: o };
}

window.SK = { F, tw, txt, txtO, R, box, clean, KAT, kartu, AV, avatar, pill, render, BG: SK_BG, JOBS, jobOf, JSPR, jobPortrait };
})();
