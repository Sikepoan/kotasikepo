// Peta live Kota Sikepo: pulau isometrik pixel, warga jalan-jalan, siang-malam sesuai jam WIB
(function () {
  const WW = 360, WH = 300;                 // world size (pixel art)
  const ISL = { cx: 180, cy: 150, hw: 150, hh: 76 };   // island diamond
  const PLOT = { cx: 214, cy: 128, hw: 54, hh: 27 };   // kebun sawit
  const HOME = { x: 132, y: 162 };                     // tikar Udin
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const rnd = s => { const x = Math.sin(s * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const inDia = (x, y, d, m = 0) => Math.abs(x - d.cx) / (d.hw - m * 2) + Math.abs(y - d.cy) / (d.hh - m) <= 1;
  // Layout Hari 3 (kebun di tengah kota) aktif otomatis mulai 12 Nov 2026 10.00 WIB
  const KOTA_AT = Date.parse('2026-11-12T03:00:00Z');
  // Layout KEPO FANTASY aktif otomatis mulai 12 Nov 2026 18.00 WIB (menggantikan layout kota)
  const FANT_AT = Date.parse('2026-11-12T11:00:00Z');
  // KOTA SIKEPO (konsep baru, 15 Nov 2026): lahan kosong + papan, warga = yang sudah daftar
  const SMODE = !window.SIKEPO_OLD;
  const SIMG = {}; const simg = n => { if (!SIMG[n]) { const i = new Image(); i.src = 'img/' + n + '.png'; SIMG[n] = i; } return SIMG[n]; };
  const SIGN = { x0: 140, x1: 222, y0: 166 };
  const isFant = () => !SMODE && !!window.FANT3 && (window.SIKEPO_FORCE_FANTASY ?? (Date.now() >= FANT_AT));
  const isKota = () => !SMODE && !!window.KOTA3 && !isFant() && (window.SIKEPO_FORCE_KOTA ?? (Date.now() >= KOTA_AT));
  let KMODE = isKota(), FMODE = isFant(), LIGHTS = [];
  const ISL0 = Object.assign({}, ISL), PLOT0 = Object.assign({}, PLOT), HOME0 = Object.assign({}, HOME);
  function applyLayout() { if (SMODE) { Object.assign(ISL, { cx: 150, cy: 110, hw: 330, hh: 230 }); Object.assign(PLOT, { cx: -999, cy: -999, hw: 1, hh: 1 }); Object.assign(HOME, { x: 150, y: 160 }); return; } if (FMODE) { Object.assign(ISL, FANT3.ISL); Object.assign(PLOT, { cx: -999, cy: -999, hw: 1, hh: 1 }); Object.assign(HOME, FANT3.HOME); return; }
    if (KMODE) { Object.assign(ISL, { cx: 180, cy: 150, hw: 172, hh: 88 }); Object.assign(PLOT, KOTA3.PLOT); Object.assign(HOME, { x: 125, y: 98 }); }
    else { Object.assign(ISL, ISL0); Object.assign(PLOT, PLOT0); Object.assign(HOME, HOME0); } }
  applyLayout();
  const kTile = (x, y) => KOTA3.toTile(x, y), kWalk = (x, y) => { const [a, b] = kTile(x, y); return KOTA3.walk(a, b); };
  const WT = []; if (window.KOTA3) for (let a = -1; a <= 10; a++) for (let b = -1; b <= 10; b++) if (KOTA3.walk(a, b)) WT.push([a, b]);
  const ENTRY = () => KOTA3.tw(-1, 0);
  function kNext(o) {   // jalan ke petak tetangga yang bisa dilewati (jalan, taman, plaza)
    const [a, b] = kTile(o.x, o.y), nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([da, db]) => [a + da, b + db]).filter(([x, y]) => KOTA3.walk(x, y));
    if (!KOTA3.walk(a, b) || !nb.length) { const [ex, ey] = ENTRY(); return { x: ex, y: ey }; }
    let pick = nb[Math.floor(Math.random() * nb.length)];
    if (o.pa != null && nb.length > 1 && Math.random() < 0.7) { const fw = nb.find(([x, y]) => x - a === o.pa && y - b === o.pb); if (fw) pick = fw; }
    o.pa = pick[0] - a; o.pb = pick[1] - b; const [x, y] = KOTA3.tw(pick[0], pick[1]); return { x: x + (o.jx || 0), y: y + (o.jy || 0) };
  }
  // ===== KOMPLEKS ISOMETRIK: 1 rumah per warga terdaftar, berbaris rapi menghadap jalan =====
  const KU = [34, 17], KV = [-44, 22], KO = [120, -20], PERROW = 10;
  const kAt = (c, r) => [KO[0] + c * KU[0] + r * KV[0], KO[1] + c * KU[1] + r * KV[1]];
  const VR = r => Math.floor(r / 2) * 2.7 + (r % 2) * 1.1 + 1.0, VEND = () => Math.max(VR(ROWS() - 1) + 1, Math.floor((ROWS() + 1) / 2) * 2.7 + 0.25 + 0.9);   // 2 baris berhadapan per jalan
  const kCol = i => { const c = i % PERROW; return c >= 5 ? c + 1 : c; };          // kolom 5 = jalan utama
  let HS = [];
  function houseSpots(n) { HS = []; n = Math.min(n, MAXRUMAH); for (let i = 0; i < n; i++) { const D2 = i >= CAP1, j = D2 ? i - CAP1 : i, cc = D2 ? (j < 20 ? kCol(j) : (j - 20) % 5) - 12.4 : kCol(j), rr = VR(D2 ? (j < 20 ? Math.floor(j / PERROW) : 2 + Math.floor((j - 20) / 5)) : Math.floor(j / PERROW)); const [x, y] = kAt(cc, rr); const w = (P.walkers.slice().sort((p, q) => p.w.no - q.w.no)[i] || {}).w; HS.push({ c: cc, r: rr, d2: D2, x, y, nama: w ? String(w.nama || '').toUpperCase().slice(0, 16) : '', no: w ? w.no : 0 }); } const [hx, hy] = POSXY(); Object.assign(HOME, { x: hx - 2, y: hy - 1 }); if (typeof U !== 'undefined') { const g = GATE(); const [ux, uy] = kAt(5, VEND() + 3.0); U.x = U.tx = ux; U.y = U.ty = uy; } }
  const CAP1 = 80, ROWS = () => Math.max(1, Math.ceil(Math.min(HS.length, CAP1) / PERROW)), ROWS2 = () => { const j = Math.max(0, HS.length - CAP1); return j <= 20 ? Math.ceil(j / PERROW) : 2 + Math.ceil((j - 20) / 5); }, MAXRUMAH = 120, PERRUMAH = 10;
  const GATE = () => { const [x, y] = kAt(5, VEND() + 2.4); return { x, y }; };
  const POSXY = () => { const RR = ROWS(); let vL = 0; for (let r = 0; r <= RR + 1; r += 2) vL = Math.floor(r / 2) * 2.7 + 0.25; return kAt(6.0, vL + 1.15); };
  let ZQ = [];
  function zzz(sx, sy, seed) { const t = performance.now() / 1000, u = Math.max(8, cam.z * dpr * 3.2);
    cx.save(); cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.lineJoin = 'round';
    for (let k = 0; k < 3; k++) { const ph = (t * 0.5 + k / 3 + (seed || 0) * 0.37) % 1, x = sx + k * u * 0.55 + Math.sin(t * 2 + k) * u * 0.15, y = sy - ph * u * 2.6, fs = Math.round(u * (0.7 + k * 0.25));
      cx.globalAlpha = Math.sin(ph * Math.PI); cx.font = 'bold ' + fs + 'px "Silkscreen", monospace'; cx.lineWidth = Math.max(2, fs * 0.22); cx.strokeStyle = '#1c1c24'; cx.strokeText('Z', x, y); cx.fillStyle = '#fff6dc'; cx.fillText('Z', x, y); }
    cx.restore(); }
  const sLand = (x, y) => x > SB.x0 + 20 && x < SB.x1 - 20 && y > SB.y0 + 20 && y < SB.y1 - 20 && !HS.some(h => Math.abs(h.x - x) < 15 && y < h.y + 3 && y > h.y - 12);
  const onLand = (x, y) => SMODE ? sLand(x, y) : FMODE ? FANT3.walk(x, y) : KMODE ? kWalk(x, y) : (inDia(x, y, ISL, 6) && !inDia(x, y, PLOT, -2) && Math.hypot(x - HOME.x, (y - HOME.y) * 2) > 16);

  // ---------- static background ----------
  const bg = document.createElement('canvas'); bg.width = WW; bg.height = WH; const g = bg.getContext('2d');
  function palm(x, y, s) {
    R(g, x, y - 9 * s, 2 * s, 9 * s, '#6b4a2c'); R(g, x, y - 9 * s, 1, 9 * s, '#83603a');
    R(g, x - 1 * s, y - 10 * s, 4 * s, 2 * s, '#e0602a');
    [[-5, -1], [-4, -3], [-2, -4], [2, -4], [4, -3], [5, -1], [0, -5]].forEach(([dx, dy], i) => {
      for (let k = 1; k <= 3; k++) R(g, x + 1 + dx * k / 3 * s, y - 10 * s + dy * k / 3 * s + (k === 3 && Math.abs(dx) > 3 ? s : 0), s + 1, s, i % 2 ? '#2f7a2c' : '#3f9b3a');
    });
  }
  function pine(x, y) {
    R(g, x - 1, y - 3, 2, 3, '#6b4a2c');
    [[7, 0], [5, -3], [3, -6], [1, -8]].forEach(([w, dy], i) => R(g, x - w, y - 5 + dy, w * 2, 3, i % 2 ? '#1f6a3a' : '#2a8048'));
  }
  function drawBg() {
    if (SMODE) { g.clearRect(0, 0, WW, WH); const im = simg('lahan_kota'); if (im.complete && im.naturalWidth) g.drawImage(im, 0, 50, 360, 201); else im.onload = () => { g.clearRect(0, 0, WW, WH); drawBg(); }; LIGHTS = []; return; }
    // sea
    R(g, 0, 0, WW, WH, '#2c86d8');
    for (let y = 0; y < WH; y += 6) for (let x = (y / 6 % 2) * 10; x < WW; x += 20) R(g, x, y, 6, 1, '#3d95e0');
    if (FMODE) FANT3.mountain(g);
    // island sides (dirt), then grass top
    for (let y = ISL.cy - ISL.hh; y <= ISL.cy + ISL.hh + 12; y++) {
      const yy = y - 12, k = 1 - Math.abs(yy - ISL.cy) / ISL.hh;
      if (yy > ISL.cy && k > 0) { const w = ISL.hw * k; R(g, ISL.cx - w, y, w * 2, 1, y % 4 < 2 ? '#8a5a2b' : '#7a4e24'); }
    }
    for (let y = ISL.cy - ISL.hh; y <= ISL.cy + ISL.hh; y++) {
      const k = 1 - Math.abs(y - ISL.cy) / ISL.hh, w = ISL.hw * k;
      R(g, ISL.cx - w - 2, y, w * 2 + 4, 1, '#e8d08a');                       // sand rim
      for (let x = Math.ceil(ISL.cx - w); x < ISL.cx + w; x += 1) {
        const u = Math.floor((x - ISL.cx) / 16 + (y - ISL.cy) / 8), v = Math.floor((x - ISL.cx) / 16 - (y - ISL.cy) / 8);
        R(g, x, y, 1, 1, (u + v) % 2 ? '#6fbf4a' : '#66b443');
      }
    }
    if (FMODE) { FANT3.ground(g); LIGHTS = FANT3.lights(); FANT3.sprites().sort((a, b) => a[0] - b[0]).forEach(([, f]) => f(g)); return; }
    if (KMODE) KOTA3.ground(g);
    // plantation plot
    for (let y = PLOT.cy - PLOT.hh; y <= PLOT.cy + PLOT.hh; y++) { const w = PLOT.hw * (1 - Math.abs(y - PLOT.cy) / PLOT.hh); R(g, PLOT.cx - w, y, w * 2, 1, y % 3 ? '#8a5a2b' : '#7a4e24'); }
    for (let y = PLOT.cy - PLOT.hh; y <= PLOT.cy + PLOT.hh + 1; y++) { const w = PLOT.hw * (1 - Math.abs(y - PLOT.cy) / PLOT.hh); if (y % 2 === 0) { R(g, PLOT.cx - w - 1, y, 1, 1, '#ffffff'); R(g, PLOT.cx + w, y, 1, 1, '#ffffff'); } }
    const palms = [];
    for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const x = PLOT.cx + (i - j) * 7, y = PLOT.cy + (i + j) * 3.5 + 4; if (inDia(x, y, PLOT, 2)) palms.push([x, y]); }
    const tikar = () => { for (let y = 0; y < 8; y++) for (let x = 0; x < 26; x++) R(g, HOME.x - 13 + x - y, HOME.y - 4 + y, 1, 1, (y === 0 || y === 7) ? '#8a2a1a' : (Math.floor((x + y) / 3) % 2 ? '#e0a64a' : '#c8502e')); };
    const sx = HOME.x - 40, sy = HOME.y + 2;
    const sign = () => { R(g, sx + 4, sy + 8, 2, 10, '#6b4a2c'); R(g, sx + 20, sy + 8, 2, 10, '#6b4a2c'); R(g, sx, sy, 26, 10, '#a8763e'); R(g, sx, sy, 26, 1, '#d39b5a');
      [['KOTA', sx + 2, sy + 1], ['SIKEPO', sx + 2, sy + 5]].forEach(([s, x, y]) => mini(g, s, x, y, '#3b2412')); };
    const pines = [];
    for (let i = 0; i < 26; i++) { const a = rnd(i * 3.7) * Math.PI * 2, r = 0.82 + rnd(i * 1.9) * 0.12; const x = ISL.cx + Math.cos(a) * ISL.hw * r * 0.95, y = ISL.cy + Math.sin(a) * ISL.hh * r * 0.9;
      if (!inDia(x, y, ISL, 8) || inDia(x, y, PLOT, -8)) continue; if (KMODE) { const [a2, b2] = kTile(x, y); if (KOTA3.inGrid(a2, b2) || KOTA3.inGrid(a2 - 1, b2) || KOTA3.inGrid(a2, b2 - 1) || Math.hypot(x - HOME.x, y - HOME.y) < 40) continue; } pines.push([x, y]); }
    if (KMODE) {
      palms.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => palm(x, y, 1));
      LIGHTS = KOTA3.sprites(g, pines.map(([x, y]) => [y, () => pine(x, y)]).concat([[HOME.y + 4, tikar], [sy + 18, sign]]));
    } else {
      palms.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => palm(x, y, 1));
      pines.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => pine(x, y));
      tikar(); R(g, 96, 172, 2, 10, '#6b4a2c'); R(g, 112, 172, 2, 10, '#6b4a2c'); R(g, 92, 164, 26, 10, '#a8763e'); R(g, 92, 164, 26, 1, '#d39b5a');
      [['KOTA', 94, 165], ['SIKEPO', 94, 169]].forEach(([s, x, y]) => mini(g, s, x, y, '#3b2412'));
    }
  }
  // 3x4 mini font for in-world sign
  const M = { K: [5, 6, 5, 5], O: [7, 5, 5, 7], T: [7, 2, 2, 2], A: [2, 5, 7, 5], S: [3, 4, 1, 6], I: [7, 2, 2, 7], E: [7, 6, 4, 7], P: [6, 5, 6, 4] };
  function mini(c, s, x, y, col) { for (let i = 0; i < s.length; i++) { const m = M[s[i]]; if (!m) continue; m.forEach((row, r) => { for (let b = 0; b < 3; b++) if (row & (4 >> b)) R(c, x + i * 4 + b, y + r, 1, 1, col); }); } }

  // ---------- walkers ----------
  const COLS = ['#e02f2f', '#4d7cff', '#f07aa8', '#ffd84a', '#72c44c', '#a06ad0', '#f08a2a', '#2aa89a'];
  const HAIR = { COWOK1: '#1c1c24', COWOK2: '#6b3b1f', COWOK3: '#2f5fd0', CEWEK1: '#f07aa8', CEWEK2: '#1c1c24', CEWEK3: '#8a4a24', MISTERI: '#1c1c24' };
  const SHIRT = { COWOK1: '#d23a2a', COWOK2: '#3f9b4a', COWOK3: '#ffd84a', CEWEK1: '#7a4fd0', CEWEK2: '#f08a2a', CEWEK3: '#2aa89a' };
  const SKIN = { COWOK3: '#a8683c' };
  function spot(seed) { if (KMODE && WT.length) { const [a, b] = WT[Math.floor(rnd(seed * 5.7) * WT.length)], [x, y] = KOTA3.tw(a, b); return { x: x + Math.round((rnd(seed) - 0.5) * 6), y: y + Math.round((rnd(seed * 2) - 0.5) * 3) }; } for (let k = 0; k < 40; k++) { const x = ISL.cx + (rnd(seed * 7.1 + k) * 2 - 1) * ISL.hw, y = ISL.cy + (rnd(seed * 3.3 + k * 1.7) * 2 - 1) * ISL.hh; if (onLand(x, y)) return { x, y }; } return { x: ISL.cx - 40, y: ISL.cy + 20 }; }
  const P = { walkers: [], byNo: new Map(), sel: null, hl: new Set(), showAll: false, onPick: null, follow: null };
  const homeOf = w => FMODE ? FANT3.huddle(w.no) : KMODE ? KOTA3.doors[w.no % KOTA3.doors.length] : spot(w.no * 1.37 + 0.5);
  function addWalker(w, fresh) {
    if (P.byNo.has(w.no)) return P.byNo.get(w.no);
    const home = homeOf(w), st = spot(w.no * 2.91 + 9), en = KMODE ? ENTRY() : [HOME.x + 8, HOME.y + 6];
    const o = { w, jx: Math.round((rnd(w.no * 1.3) - 0.5) * 6), jy: Math.round((rnd(w.no * 2.7) - 0.5) * 3), x: fresh ? en[0] : st.x, y: fresh ? en[1] : st.y, tx: st.x, ty: st.y, home, wait: rnd(w.no) * 3, ph: rnd(w.no * 5) * 6, col: SHIRT[w.av] || COLS[w.no % COLS.length], born: fresh ? performance.now() : 0 };
    P.walkers.push(o); P.byNo.set(w.no, o); return o;
  }

  // ---------- canvas / camera ----------
  let cv, cx, cam = { x: ISL.cx, y: ISL.cy, z: 3 }, dpr = 1, last = 0;
  const SB = { x0: -330, x1: 650, y0: -200, y1: 420 };
  function fitSB() { if (!SMODE || !HS) return; const VE = VEND() + 6, P4 = [kAt(-14.5, -7), kAt(15.5, -7), kAt(15.5, VE), kAt(-14.5, VE)]; for (const h of HS) P4.push(kAt(h.c - 2, h.r - 2), kAt(h.c + 2, h.r + 2)); SB.x0 = Math.min(...P4.map(q => q[0])); SB.x1 = Math.max(...P4.map(q => q[0])); SB.y0 = Math.min(...P4.map(q => q[1])); SB.y1 = Math.max(...P4.map(q => q[1])); }
  const CAMV = { vx: 0, vy: 0, tz: null, ax: 0, ay: 0 };   // batas gambar lahan (SMODE): layar selalu penuh lahan
  const zMin = () => SMODE ? Math.max(0.12, Math.min(cv.width / dpr / (SB.x1 - SB.x0), cv.height / dpr / (SB.y1 - SB.y0)) * 0.9) : Math.max(1.5, Math.min(cv.width / dpr / WW, cv.height / dpr / WH) * 0.95), zMax = 9;
  function clampCam() { cam.z = Math.max(zMin(), Math.min(zMax, cam.z));
    if (SMODE) { cam.x = Math.max(SB.x0, Math.min(SB.x1, cam.x)); cam.y = Math.max(SB.y0, Math.min(SB.y1, cam.y)); return; }
    cam.x = Math.max(20, Math.min(WW - 20, cam.x)); cam.y = Math.max(20, Math.min(WH - 20, cam.y)); }
  function resize() { const r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); clampCam(); }
  const toScreen = (x, y) => [(x - cam.x) * cam.z * dpr + cv.width / 2, (y - cam.y) * cam.z * dpr + cv.height / 2];
  const toWorld = (sx, sy) => [(sx * dpr - cv.width / 2) / (cam.z * dpr) + cam.x, (sy * dpr - cv.height / 2) / (cam.z * dpr) + cam.y];

  function wibHour() { try { const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date()); const h = +p.find(x => x.type === 'hour').value, m = +p.find(x => x.type === 'minute').value; return (h % 24) + m / 60; } catch (e) { return new Date().getHours(); } }
  function nightK(h) { if (h >= 19 || h < 4.5) return 1; if (h >= 17.5) return (h - 17.5) / 1.5; if (h < 6) return 1 - (h - 4.5) / 1.5; return 0; }

  // Wali Kota Udin keliling kota; malam pulang ke tikarnya
  const landU = (x, y) => SMODE ? sLand(x, y) : FMODE ? FANT3.walk(x, y) : (inDia(x, y, ISL, 6) && !inDia(x, y, PLOT, -2));
  const U = { x: HOME.x + 2, y: HOME.y + 1, tx: HOME.x + 2, ty: HOME.y + 1, wait: 2, moving: false, face: 1, talk: 0, say: '', sayT: 0 };
  const SAPA = ['HALO WARGA! SELAMAT DATANG DI KOTA SIKEPO!', 'SUDAH BIKIN KARTU WARGA BELUM?', 'KOMEN RUMAH YANG WARAS YA!', 'FOLLOW DULU, BIAR JADI WARGA!', '1 LIKE = 1 KOIN. AYO LIKE!', 'COBA KLIK KEBUN SAWIT, SERU LHO!', 'HATI-HATI, INI KOTA PALING KEPO!', 'ENAKAN JAMAN WALIKOTA DULU? SAYA WALIKOTA PERTAMA!'];
  let sapaI = Math.floor(Math.random() * 8);
  function blip() { try { const A = window.__ac || (window.__ac = new (window.AudioContext || window.webkitAudioContext)()); [660, 880, 990].forEach((f, i) => { const o = A.createOscillator(), g = A.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(0.05, A.currentTime + i * 0.07); g.gain.exponentialRampToValueAtTime(0.0001, A.currentTime + i * 0.07 + 0.09); o.connect(g).connect(A.destination); o.start(A.currentTime + i * 0.07); o.stop(A.currentTime + i * 0.07 + 0.1); }); } catch (e) {} }
  function sapa() {
    const SF = ['SELAMAT DATANG DI KEPO FANTASY!', 'AKU UDIN THE GOBLIN, KETUA GUILD KALIAN!', 'JANGAN DEKAT-DEKAT GUA ITU...', 'LIKE, KOMEN & SHARE BIAR KITA PUNYA TENDA!', 'BRRR... MALAM DI SINI DINGIN BANGET.', 'MATA MERAH ITU NGELIATIN KITA TERUS...'];
    if (SMODE) { const SS = ['HALO! SAYA WALI KOTA UDIN.', 'SELAMAT DATANG DI KOTA SIKEPO!', 'KOTANYA MASIH KOSONG MELOMPONG...', 'FOLLOW = KAMU JADI WARGA!', 'KOMEN USULAN BANGUNAN YA!', 'USULAN LIKE TERBANYAK BESOK SAYA BANGUN.', 'BURUNG INI NGGAK DIHITUNG, DIA CUMA NUMPANG.', 'BELUM ADA KANTOR, KANTOR SAYA DI SINI DULU.']; U.say = U.sleep ? 'SSST... UDIN LAGI TIDUR. ZZZ...' : SS[sapaI++ % SS.length]; U.sayT = performance.now() + 4000; if (!U.sleep) { U.wait = 4; U.talk = 4; U.moving = false; } blip(); return; }
    let ln = FMODE ? SF[sapaI++ % SF.length] : SAPA[sapaI++ % SAPA.length]; if (KMODE) ln = ln.includes('KOIN') ? 'SEKARANG BANGUN APA AJA TANPA BUDGET!' : ln.includes('RUMAH YANG WARAS') ? 'KOMEN PEKERJAAN BUAT WARGA YA!' : ln;
    U.say = U.sleep ? 'SSST... UDIN LAGI TIDUR. ZZZ...' : ln; U.sayT = performance.now() + 4000;
    if (!U.sleep) { U.wait = 4; U.talk = 4; U.moving = false; U.face = 1; } blip();
  }
  function stepUdin(dt, t, night) {
    if (night > 0.6) {
      const hx = HOME.x + 2, hy = HOME.y + 1, dx = hx - U.x, dy = hy - U.y, d = Math.hypot(dx, dy);
      if (d > 0.6) { const v = Math.min(d, 12 * dt); U.x += dx / d * v; U.y += dy / d * v; U.moving = true; U.face = dx < 0 ? -1 : 1; } else U.moving = false;
      U.sleep = d <= 0.6; return;
    }
    if (KMODE && U.sleep) { U.tx = ENTRY()[0]; U.ty = ENTRY()[1]; }
    U.sleep = false;
    if (U.wait > 0) { U.wait -= dt; U.moving = false; return; }
    if (KMODE) { const dx = U.tx - U.x, dy = U.ty - U.y, d = Math.hypot(dx, dy);
      if (d < 0.8) { const n = kNext(U); U.tx = n.x; U.ty = n.y; if (Math.random() < 0.2) { U.wait = 2 + Math.random() * 3; U.talk = Math.random() < 0.6 ? U.wait : 0; } return; }
      const v = Math.min(d, 7 * dt); U.x += dx / d * v; U.y += dy / d * v; U.moving = true; U.face = dx < 0 ? -1 : 1; return; }
    const dx = U.tx - U.x, dy = U.ty - U.y, d = Math.hypot(dx, dy);
    if (d < 0.8) {   // sampai: berhenti, kadang teriak pakai toa
      let n = null; for (let k = 0; k < 30 && !n; k++) { const x = ISL.cx + (Math.random() * 2 - 1) * ISL.hw * 0.8, y = ISL.cy + (Math.random() * 2 - 1) * ISL.hh * 0.8; if (landU(x, y)) n = { x, y }; }
      if (Math.random() < 0.25) n = { x: HOME.x + 2, y: HOME.y + 1 };
      if (n) { U.tx = n.x; U.ty = n.y; }
      U.wait = 2 + Math.random() * 3; U.talk = Math.random() < 0.6 ? U.wait : 0; return;
    }
    const v = Math.min(d, 7 * dt), nx = U.x + dx / d * v, ny = U.y + dy / d * v;
    if (landU(nx, ny)) { U.x = nx; U.y = ny; U.moving = true; U.face = dx < 0 ? -1 : 1; } else { U.tx = HOME.x + 2; U.ty = HOME.y + 1; }
  }
  // jaringan jalan ala city-builder: simpul di persimpangan & ujung jalan blok, jalur kiri (lane) di trotoar
  function roadNodes() { const R = ROWS(), V = []; for (let r = 0; r <= R + 1; r += 2) V.push(Math.floor(r / 2) * 2.7 + 0.25); return V; }
  function nextNode(o) { const V = roadNodes(), cs = [-0.6, 5, 10.6], { c, v } = o.rn, opts = [];
    const vi = V.findIndex(q => Math.abs(q - v) < 0.01);
    if (Math.abs(c - 5) < 0.01) { if (vi > 0) opts.push({ c: 5, v: V[vi - 1] }); if (vi < V.length - 1) opts.push({ c: 5, v: V[vi + 1] }); opts.push({ c: -0.6, v }, { c: 10.6, v }); }
    else opts.push({ c: 5, v });
    const back = opts.filter(q => !(o.pn && Math.abs(q.c - o.pn.c) < 0.01 && Math.abs(q.v - o.pn.v) < 0.01));
    const pick = (back.length ? back : opts)[Math.floor(Math.random() * (back.length ? back.length : opts.length))]; o.pn = o.rn; o.rn = pick; return pick; }
  function laneXY(o, c, v) { const hor = Math.abs(o.rn.v - (o.pn ? o.pn.v : o.rn.v)) < 0.01, side = o.lane; return kAt(c + (hor ? 0 : side * 0.06), v + (hor ? side * 0.07 : 0)); }
  function roadStep(o, dt) {
    if (!o.rn) { const V = roadNodes(); o.rn = { c: 5, v: V[Math.floor(rnd(o.w.no * 3.1) * V.length)] }; o.pn = null; o.lane = rnd(o.w.no) < 0.5 ? -1 : 1; const [x, y] = kAt(o.rn.c + (rnd(o.w.no * 7) - 0.5) * 8, o.rn.v + o.lane * 0.07); o.x = x; o.y = y; o.rn = { c: Math.abs(x) < 0 ? 5 : (rnd(o.w.no * 7) < 0.5 ? -0.6 : 10.6), v: o.rn.v }; o.pn = { c: 5, v: o.rn.v }; }
    const [tx, ty] = laneXY(o, o.rn.c, o.rn.v), dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy);
    if (d < 0.8) { if (tryWarung(o) || tryGather(o)) return; if (Math.random() < 0.25 && Math.abs(o.rn.c - 5) > 0.01) { o.wait = 1 + Math.random() * 2; } nextNode(o); return; }
    const sp = (7 + (o.w.no % 3)) * (o.w.no % 6 === 1 ? 2.2 : 1), v = Math.min(d, sp * dt); o.x += dx / d * v; o.y += dy / d * v; o.moving = true; o.face = dx < 0 ? -1 : 1; }
  // ===== interaksi NPC: nongkrong & makan di warung, ngobrol saat berpapasan =====
  const WARUNG_TALK = ['BU, NASI SATU YA!', 'KOPI SATU!', 'ENAK BANGET INI', 'KAPAN BANGUN SEKOLAH?', 'GW MAU JADI WAKIL WALIKOTA', 'GRATIS GAK NIH?', 'HAHAHA', 'RUMAH LO YANG MANA?', 'PAK UDIN KEMANA YA?', 'KENYANG...', 'BESOK BANGUN APA YA?', 'KEPO DEH'];
  const ROAD_TALK = [['HALO TETANGGA!', 'HALO JUGA!'], ['HAI!', 'HAI JUGA!'], ['PAGI!', 'PAGI JUGA!'], ['DARI WARUNG?', 'IYA, ENAK!'], ['LIAT PAK UDIN GAK?', 'DI GERBANG TUH'], ['MAU KE MANA?', 'KE WARUNG DONG'], ['UDAH MAKAN?', 'BELUM NIH'], ['RUMAH BARU YA?', 'IYA DONG'], ['ADA GOSIP APA?', 'KEPO AJA LO']];
  const SEATS = [[-0.42, 0.42], [-0.22, 0.5], [-0.02, 0.56], [0.18, 0.5], [-0.5, 0.18], [0.3, 0.32]];
  const seatTaken = []; const WXY = () => { const V = roadNodes(); return [4.0, V[V.length - 1] + 1.05]; };
  window.__wxy = () => kAt(...WXY()); window.__seat = () => seatTaken.filter(Boolean).length;
  function say(o, txt, dur) { o.say = txt; o.sayT = performance.now() / 1000 + (dur || 3); }
  function warungStep(o, dt) { const t = performance.now() / 1000, [wc, wv] = WXY(), [sc, sv] = SEATS[o.seat], [tx, ty] = kAt(wc + sc, wv + sv), dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy);
    if (d > 0.6 && !o.seated) { const v = Math.min(d, 7 * dt); o.x += dx / d * v; o.y += dy / d * v; o.moving = true; o.face = dx < 0 ? -1 : 1; return; }
    o.seated = true; o.moving = false; o.face = sc < 0 ? 1 : -1; o.eat -= dt;
    if (!o.say || t > o.sayT + 2 + rnd(o.w.no + Math.floor(t)) * 4) say(o, WARUNG_TALK[Math.floor(Math.random() * WARUNG_TALK.length)], 3);
    if (o.eat <= 0) { seatTaken[o.seat] = null; o.state = null; o.seated = false; o.seat = null; const V = roadNodes(); o.rn = { c: 5, v: V[V.length - 1] }; o.pn = null; say(o, 'DADAH!', 1.5); } }
  function tryWarung(o) { const V = roadNodes(); if (!(Math.abs(o.rn.c - 5) < 0.01 && Math.abs(o.rn.v - V[V.length - 1]) < 0.01) || Math.random() > 0.45) return false;
    const free = SEATS.map((_, i) => i).filter(i => !seatTaken[i]); if (!free.length) return false; o.seat = free[Math.floor(Math.random() * free.length)]; seatTaken[o.seat] = o; o.state = 'warung'; o.eat = 8 + Math.random() * 10; return true; }
  function chatCheck(dt) { if (Math.random() > dt * 1.2) return; const L = P.walkers.filter(o => !o.state && o.moving && !o.sleep); if (L.length < 2) return; const a = L[Math.floor(Math.random() * L.length)];
    const b = L.find(o => o !== a && Math.hypot(o.x - a.x, o.y - a.y) < 14); if (!b) return; const pr = ROAD_TALK[Math.floor(Math.random() * ROAD_TALK.length)];
    a.wait = b.wait = 3.2; a.moving = b.moving = false; a.face = b.x < a.x ? -1 : 1; b.face = -a.face; const tt = performance.now() / 1000; a.jumpT = tt + 0.5; say(a, pr[0], 1.6); setTimeout(() => { say(b, pr[1], 1.6); b.jumpT = performance.now() / 1000 + 0.5; }, 1500); }
  // kumpul-kumpul di pojok persimpangan
  const GROUP_TALK = ['JADI GINI CERITANYA...', 'SERIUS LO?!', 'HAHAHA', 'WKWKWK', 'TERUS TERUS?', 'EH ADA PAK UDIN', 'GOSIPNYA...', 'MASA SIH?', 'KEPO BANGET', 'ANJAY', 'IYA BENER', 'NANTI MALAM RONDA YA'];
  const EMO = ['!', '?', '<3', 'HAHA', '...', 'HMM', 'YEAY'];
  const gMembers = {};
  function gatherSpots() { const V = roadNodes(), S = []; V.forEach((v, i) => { S.push(kAt(-1.15, v)); S.push(kAt(11.15, v)); }); return S; }
  window.__gs = () => gatherSpots().map((s, i) => [s, (gMembers[i] || []).filter(x => x.state === "kumpul").length]);
  function tryGather(o) { if (Math.abs(o.rn.c - 5) < 0.01) return false; const S = gatherSpots(), V = roadNodes(), vi = V.findIndex(q => Math.abs(q - o.rn.v) < 0.01), gi = vi * 2 + (o.rn.c < 5 ? 0 : 1), cur = (gMembers[gi] || []).filter(x => x.state === 'kumpul').length; if (Math.random() > (cur ? 0.85 : 0.5)) return false;
    if (!S[gi]) return false; const m = (gMembers[gi] = (gMembers[gi] || []).filter(x => x.state === 'kumpul')); if (m.length >= 4) return false;
    m.push(o); o.state = 'kumpul'; o.gi = gi; o.gk = Math.random() * 6.28; o.stay = 10 + Math.random() * 10; return true; }
  function gatherStep(o, dt) { const t = performance.now() / 1000, S = gatherSpots(), sp = S[o.gi]; if (!sp) { o.state = null; return; }
    const m = gMembers[o.gi] || [], idx = Math.max(0, m.indexOf(o)), ang = o.gk * 0 + idx * (6.28 / Math.max(2, m.length)), tx = sp[0] + Math.cos(ang) * 7, ty = sp[1] + Math.sin(ang) * 3.5, dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy);
    if (d > 0.6) { const v = Math.min(d, 7 * dt); o.x += dx / d * v; o.y += dy / d * v; o.moving = true; o.face = dx < 0 ? -1 : 1; return; }
    o.moving = false; o.face = sp[0] < o.x ? -1 : 1; o.stay -= dt;
    if (m.length > 1 && (!o.say || t > o.sayT + 1.5 + rnd(o.w.no * 3 + Math.floor(t / 2)) * 5) && Math.random() < dt * 0.8) { say(o, GROUP_TALK[Math.floor(Math.random() * GROUP_TALK.length)], 2.4); if (Math.random() < 0.3) o.jumpT = t + 0.6; }
    if (o.stay <= 0) { gMembers[o.gi] = m.filter(x => x !== o); o.state = null; o.rn = { c: 5, v: roadNodes()[Math.floor(o.gi / 2)] }; o.pn = null; say(o, 'DULUAN YA!', 1.4); } }
  function step(dt, night) {
    if (SMODE && night <= 0.6) chatCheck(dt);
    for (const o of P.walkers) {
      if (night > 0.6) {   // malam: pulang ke tikar sendiri & tidur
        if (SMODE) { if (o.state) { if (o.state === 'warung') seatTaken[o.seat] = null; if (o.state === 'kumpul' && gMembers[o.gi]) gMembers[o.gi] = gMembers[o.gi].filter(x => x !== o); o.state = null; o.seated = false; } const h = HS.find(q => q.no === o.w.no) || (HS.length ? HS[Math.abs(o.w.no | 0) % HS.length] : null); if (h) o.home = { x: h.x + 6, y: h.y + 4 }; }
        const dx = o.home.x - o.x, dy = o.home.y - o.y, d = Math.hypot(dx, dy);
        if (d > 0.6) { const v = Math.min(d, 14 * dt); o.x += dx / d * v; o.y += dy / d * v; o.moving = true; } else o.moving = false;
        o.sleep = d <= 0.6; continue;
      }
      if (KMODE && o.sleep) { o.sleep = false; const n = kNext(o); o.tx = n.x; o.ty = n.y; }
      if (SMODE && o.sleep) { o.rn = null; }
      o.sleep = false;
      if (o.wait > 0) { o.wait -= dt; o.moving = false; continue; }
      if (KMODE) { const dx = o.tx - o.x, dy = o.ty - o.y, d = Math.hypot(dx, dy);
        if (d < 0.8) { const n = kNext(o); o.tx = n.x; o.ty = n.y; if (Math.random() < 0.15) o.wait = 1 + Math.random() * 3; continue; }
        const v = Math.min(d, 9 * dt); o.x += dx / d * v; o.y += dy / d * v; o.moving = true; continue; }
      if (SMODE) { if (o.state === 'warung') { warungStep(o, dt); continue; } if (o.state === 'kumpul') { gatherStep(o, dt); continue; }
        if (o.moving && !o.say && Math.random() < dt * 0.04) say(o, EMO[Math.floor(Math.random() * EMO.length)], 1.2);
        roadStep(o, dt); continue; }
      const dx = o.tx - o.x, dy = o.ty - o.y, d = Math.hypot(dx, dy);
      if (d < 0.8) { const n = spot(o.w.no * 1.1 + performance.now() * 0.0013 % 97); o.tx = n.x; o.ty = n.y; o.wait = 1 + rnd(o.x) * 4; continue; }
      const v = Math.min(d, 9 * dt), nx = o.x + dx / d * v, ny = o.y + dy / d * v;
      if (onLand(nx, ny)) { o.x = nx; o.y = ny; o.moving = true; } else { const n = spot(o.y * 9 + o.w.no); o.tx = n.x; o.ty = n.y; }
    }
  }
  function drawWalker(c, o, t) {
    const z = cam.z * dpr, [sx, sy] = toScreen(o.x, o.y), s = Math.max(1, Math.round(z));
    if (sx < -20 * s || sy < -30 * s || sx > cv.width + 20 * s || sy > cv.height + 20 * s) return;
    const r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(sx + x * s), Math.round(sy + y * s), w * s, h * s); };
    if (SMODE) { const AVM = { COWOK1: 9, COWOK2: 1, COWOK3: 6, CEWEK1: 5, CEWEK2: 2, CEWEK3: 3 }, MIS = [4, 0, 7, 8], ai = AVM[o.w.av] ?? MIS[Math.abs(o.w.no | 0) % 4], im = simg('w/w' + ai); if (!im.complete || !im.naturalWidth) return; const hh = 9 * z, ww = im.naturalWidth / im.naturalHeight * hh, b = (o.moving ? Math.abs(Math.sin(t * 9 + o.ph)) * z * 0.6 : 0) + (o.jumpT && t < o.jumpT ? Math.abs(Math.sin((o.jumpT - t) * 12)) * z * 2.2 : 0);
      c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(Math.round(sx - ww * 0.3), Math.round(sy - z * 0.5), Math.round(ww * 0.6), Math.max(1, Math.round(z)));
      const bike = o.w.no % 6 === 1 && !o.seated && !o.state, bb = bike ? 2.6 * z : 0;
      if (bike) { const bi = simg('w/sp' + (Math.abs(o.w.no | 0) % 4)); if (bi.complete && bi.naturalWidth) { const bh = 11 * z * (Math.abs(o.w.no | 0) % 4 === 3 ? 0.85 : 1), bw = bi.naturalWidth / bi.naturalHeight * bh, bo = o.moving ? Math.abs(Math.sin(t * 6 + o.ph)) * z * 0.3 : 0; c.save(); c.translate(Math.round(sx), 0); if (o.tx < o.x - 0.3) c.scale(-1, 1); c.drawImage(bi, Math.round(-bw / 2), Math.round(sy - bh - bo), Math.round(bw), Math.round(bh)); c.restore(); if (o.say && performance.now() / 1000 < o.sayT) {} return; } }
      c.save(); c.translate(Math.round(sx), 0); if (o.tx < o.x - 0.3) c.scale(-1, 1); c.drawImage(im, Math.round(-ww / 2), Math.round(sy - hh - b - bb), Math.round(ww), Math.round(bike ? hh * 0.85 : hh)); c.restore();
      if (o.say && performance.now() / 1000 < o.sayT && window.SK && cam.z >= 2) { const sc = Math.max(1, Math.round(dpr * (cam.z >= 5 ? 2 : 1))), tw = SK.tw(o.say, sc), bx = Math.round(sx - tw / 2 - 4 * sc), by = Math.round(sy - hh - b - 16 * sc);
        c.fillStyle = '#1c1c24'; c.fillRect(bx - sc, by - sc, tw + 10 * sc, 13 * sc); c.fillStyle = '#ffffff'; c.fillRect(bx, by, tw + 8 * sc, 11 * sc); c.fillRect(Math.round(sx - sc), by + 11 * sc, 2 * sc, 3 * sc); SK.txt(c, o.say, bx + 4 * sc, by + 2 * sc, sc, '#1c1c24', null); }
      if (P.sel === o) { c.fillStyle = '#ffd84a'; c.fillRect(Math.round(sx - 2 * z), Math.round(sy - hh - 4 * z), Math.round(4 * z), Math.round(2 * z)); } return; }
    const tk = o.w.kat === 'TUKANG', av = o.w.av || 'MISTERI', skin = SKIN[av] || '#f4b47c', hair = HAIR[av] || '#1c1c24';
    if (o.sleep && (KMODE || (SMODE && HS.some(q => q.no === o.w.no)))) return;   // tidur di dalam rumah
    if (o.sleep && FMODE) { o.moving = false; const jx = Math.round(Math.sin(t * 40 + o.ph) * 0.6); r(-3 + jx, 0, 7, 1, 'rgba(0,0,0,0.25)'); r(-1 + jx, -10, 3, 3, skin); r(-1 + jx, -11, 3, 1, hair); r(-2 + jx, -7, 5, 4, tk ? '#2a5fc8' : o.col); r(-2 + jx, -3, 2, 3, '#24242e'); r(1 + jx, -3, 2, 3, '#24242e'); if (Math.floor(t * 2 + o.ph) % 3 === 0) r(3, -12, 1, 2, '#8fd8ff'); return; }
    if (o.sleep) {   // tikar kecil + tidur
      for (let y = 0; y < 4; y++) r(-5 - y * 0.5, -1 + y, 10, 1, y % 3 === 0 ? '#8a2a1a' : (y % 2 ? '#e0a64a' : '#c8502e'));
      r(-4, -1, 3, 3, skin); r(-4, -2, 3, 1, hair); r(-1, -1, 5, 2, tk ? '#2a5fc8' : o.col);
      return;
    }
    const b = o.moving ? (Math.floor(t * 8 + o.ph) % 2) : 0;
    r(-3, 0, 7, 1, 'rgba(0,0,0,0.25)');
    r(-1, -10 - b, 3, 3, skin); r(-1, -11 - b, 3, 1, hair);
    if (av === 'CEWEK1') { r(-2, -11 - b, 5, 4, hair); r(-1, -10 - b, 3, 2, skin); }
    if (av === 'CEWEK2' || av === 'CEWEK3') r(-2, -10 - b, 1, 4, hair);
    if (tk) { r(-2, -12 - b, 5, 2, '#ffffff'); }
    r(-2, -7 - b, 5, 4, tk ? '#2a5fc8' : o.col); if (tk) r(-2, -5 - b, 5, 1, '#ffd84a');
    if (WX.rain > 0.25) umbrella(r, b, COLS[(o.w.no + 3) % COLS.length]);
    r(-2, -3, 2, 3 - (o.moving && b ? 1 : 0), '#24242e'); r(1, -3, 2, 3 - (o.moving && !b ? 1 : 0), '#24242e');
    if (FMODE && window.SK && SK.jobOf) { const j = SK.jobOf(o.w).id;
      if (j === 'WARRIOR') { r(-2, -12 - b, 5, 2, '#b8bcc8'); r(3, -9 - b, 1, 6, '#d8dce8'); r(-4, -7 - b, 2, 4, '#8a5a2b'); }
      else if (j === 'BARBARIAN') { r(-2, -11 - b, 5, 1, '#e8c060'); r(-2, -8 - b, 3, 1, '#e8c060'); r(3, -12 - b, 1, 9, '#6b4a2c'); r(2, -12 - b, 3, 2, '#b8bcc8'); }
      else if (j === 'RANGER') { r(-2, -12 - b, 5, 2, '#2a8a8a'); r(-2, -10 - b, 1, 2, '#2a8a8a'); r(4, -10 - b, 1, 7, '#8a5a2b'); }
      else if (j === 'MAGE') { r(-3, -12 - b, 7, 1, '#4a2a78'); r(-1, -14 - b, 3, 2, '#5a2e8c'); r(4, -13 - b, 1, 10, '#5a3a20'); r(3, -14 - b, 3, 2, '#b040ff'); }
      else if (j === 'BLACKSMITH') { r(-1, -6 - b, 3, 3, '#6b4a2c'); r(3, -11 - b, 1, 6, '#6b4a2c'); r(2, -12 - b, 3, 2, '#4a4a56'); } }
    if (P.sel === o) { r(-4, -15 - b, 9, 1, '#ffd84a'); r(-1, -17 - b, 3, 2, '#ffd84a'); }
  }
  function drawUdin(c, night, t) {
    const z = cam.z * dpr, [sx, sy] = toScreen(U.x, U.y), s = Math.max(1, Math.round(z));
    const f = U.face, r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(sx + (f < 0 ? -x - w + 1 : x) * s), Math.round(sy + y * s), w * s, h * s); };
    if (SMODE && U.sleep) { const [px, py] = POSXY(); ZQ.push([px, py, 99]); return; }
    if (SMODE) { const nm = U.sleep ? 'w/u_tidur' : U.moving ? 'w/u_j' + (Math.floor(t * 5) % 4) : (U.wait > 0 && U.talk > 0 && Math.floor(t * 3) % 2) ? 'w/u_bicara' : 'w/u_idle', im = simg(nm), bi = { complete: false };
      if (!im.complete || !im.naturalWidth) return; const hh = (U.sleep ? 8 : 10.5) * z, ww = im.naturalWidth / im.naturalHeight * hh, br = U.moving ? 0 : Math.round(Math.sin(t * 2) * z * 0.3);
      c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(Math.round(sx - ww * 0.3), Math.round(sy - z * 0.5), Math.round(ww * 0.6), Math.max(1, Math.round(z)));
      c.drawImage(im, Math.round(sx - ww / 2), Math.round(sy - hh - br), Math.round(ww), Math.round(hh));
      if (bi.complete && bi.naturalWidth) { const bh = 4.5 * z, bw = bi.naturalWidth / bi.naturalHeight * bh; c.drawImage(bi, Math.round(sx - bw / 2 + (U.sleep ? -2 * z : z * 0.5)), Math.round(sy - hh - br - bh + z * 1.2), Math.round(bw), Math.round(bh)); }
      return; }
    if (U.sleep) { r(-5, -3, 4, 4, FMODE ? '#7cc85a' : '#f4b47c'); r(-5, -5, 4, 2, '#1c1c24'); r(-1, -3, 8, 3, '#8a4a22'); r(1, -3, 1, 3, '#e02f2f'); return; }
    const b = U.moving ? (Math.floor(t * 7) % 2) : 0, toa = U.wait > 0 && U.talk > 0;
    r(-4, 0, 9, 1, 'rgba(0,0,0,0.25)');
    const sk = FMODE ? '#7cc85a' : '#f4b47c'; r(-2, -13 - b, 5, 4, sk); r(-2, -15 - b, 5, 2, '#1c1c24'); if (FMODE) { r(-4, -12 - b, 2, 1, sk); r(3, -12 - b, 2, 1, sk); r(-5, -13 - b, 1, 1, sk); r(5, -13 - b, 1, 1, sk); } r(-1, -10 - b, 3, 1, '#3b2412');
    r(-3, -9 - b, 7, 6, '#8a4a22'); r(-2, -9 - b, 1, 1, '#e02f2f'); r(-1, -8 - b, 1, 1, '#e02f2f'); r(0, -7 - b, 1, 1, '#e02f2f'); r(1, -6 - b, 1, 1, '#e02f2f');
    if (toa) { r(4, -10 - b, 2, 3, '#f4b47c'); r(5, -12, 3, 3, '#ffffff'); r(8, -13, 1, 5, '#e02f2f'); if (Math.floor(t * 4) % 2) { r(10, -12, 1, 1, '#ffffff'); r(11, -14, 1, 1, '#ffffff'); r(11, -10, 1, 1, '#ffffff'); } }
    r(-2, -3, 2, 3 - (U.moving && b ? 1 : 0), '#24242e'); r(1, -3, 2, 3 - (U.moving && !b ? 1 : 0), '#24242e');
    if (WX.rain > 0.25) { r(-7, -20 - b, 15, 2, '#1c1c24'); r(-5, -21 - b, 11, 1, '#1c1c24'); r(0, -18 - b, 1, 5, '#3a3a46'); }
  }
  function udinBubble(c) {
    if (!U.say || performance.now() > U.sayT) return;
    const [sx, sy] = toScreen(U.x, U.y), s = Math.max(1, Math.round(cam.z * dpr)), sc = Math.max(1, Math.round(dpr * (cam.z >= 3 ? 2 : 1)));
    const words = U.say.split(' '), lines = []; let cur = '';
    words.forEach(w => { const n = cur ? cur + ' ' + w : w; if (n.length > 18 && cur) { lines.push(cur); cur = w; } else cur = n; }); if (cur) lines.push(cur);
    const w = Math.max(...lines.map(l => SK.tw(l, sc))) + 12 * sc, h = lines.length * 10 * sc + 8 * sc;
    let x = Math.round(sx - w / 2); x = Math.max(4 * dpr, Math.min(cv.width - w - 4 * dpr, x));
    const y = Math.round(sy - (U.sleep ? 8 : 19) * s - 15 * sc - h);
    c.fillStyle = '#1c1c24'; c.fillRect(x - sc, y - sc, w + 2 * sc, h + 2 * sc); c.fillStyle = '#ffffff'; c.fillRect(x, y, w, h);
    c.fillRect(Math.round(sx - 2 * sc), y + h, 4 * sc, 4 * sc);
    lines.forEach((l, i) => SK.txt(c, l, x + 6 * sc, y + 5 * sc + i * 10 * sc, sc, '#1c1c24', null));
  }
  function udinLabel(c) { if (window.PETA_HIDE) return;
    const [sx, sy] = toScreen(U.x, U.y), s = Math.max(1, Math.round(cam.z * dpr)), sc = Math.max(1, Math.round(dpr * (cam.z >= 3 ? 2 : 1)));
    const txt = FMODE ? 'UDIN THE GOBLIN' : U.sleep ? 'UDIN (TIDUR)' : 'WALI KOTA UDIN', w = SK.tw(txt, sc), y = sy - (U.sleep ? 8 : 19) * s - 11 * sc;
    c.fillStyle = 'rgba(224,47,47,0.92)'; c.fillRect(Math.round(sx - w / 2 - 3 * sc), Math.round(y - 2 * sc), w + 6 * sc, 11 * sc);
    SK.txt(c, txt, Math.round(sx - w / 2), Math.round(y), sc, '#ffffff', null);
  }
  function label(c, o, strong) {
    const z = cam.z * dpr, [sx, sy] = toScreen(o.x, o.y), s = Math.max(1, Math.round(z));
    const sc = Math.max(1, Math.round(dpr * (strong ? 2 : 1))), txt = o.w.nama, w = SK.tw(txt, sc);
    const y = sy - (o.sleep ? 6 : 19) * s - 7 * sc - 4 * sc;
    c.fillStyle = strong ? 'rgba(28,28,36,0.92)' : 'rgba(28,28,36,0.7)'; c.fillRect(Math.round(sx - w / 2 - 3 * sc), Math.round(y - 2 * sc), w + 6 * sc, 11 * sc);
    SK.txt(c, txt, Math.round(sx - w / 2), Math.round(y), sc, strong ? '#ffd84a' : '#ffffff', null);
  }
  // ---------- cuaca (simulasi, sama untuk semua pengunjung, ganti tiap 3 jam WIB) ----------
  const CUACA = [['CERAH', 0.34], ['BERAWAN', 0.26], ['GERIMIS', 0.2], ['HUJAN', 0.12], ['BADAI', 0.08]];
  const CPROP = { CERAH: { cl: 0.1, rain: 0, dark: 0 }, BERAWAN: { cl: 0.75, rain: 0, dark: 0.08 }, GERIMIS: { cl: 0.85, rain: 0.35, dark: 0.14 }, HUJAN: { cl: 1, rain: 1, dark: 0.24 }, BADAI: { cl: 1, rain: 1.5, dark: 0.34, petir: 1 } };
  function cuacaAt(ms) { const blk = Math.floor((ms + 7 * 3600e3) / (3 * 3600e3)), r = rnd(blk * 1.618 + 3.1); let acc = 0; for (const [n, q] of CUACA) { acc += q; if (r < acc) return n; } return 'CERAH'; }
  const WX = { name: 'CERAH', cl: -1, rain: 0, dark: 0, petir: 0, flash: 0, bolt: 0, boltX: 0 };
  function stepWx(dt, t) {
    const n = window.SIKEPO_FORCE_CUACA || cuacaAt(Date.now()), tg = CPROP[n] || CPROP.CERAH; WX.name = n;
    const k = WX.cl < 0 ? 1 : Math.min(1, dt * 0.4); ['cl', 'rain', 'dark'].forEach(q => { WX[q] = (WX[q] < 0 ? 0 : WX[q]) + ((tg[q] || 0) - Math.max(0, WX[q])) * k; });
    WX.petir = tg.petir || 0; if (WX.petir && t > WX.bolt) { WX.flash = 1; WX.bolt = t + 4 + Math.random() * 8; WX.boltX = 0.15 + Math.random() * 0.7; }
    WX.flash = Math.max(0, WX.flash - dt * 2.5);
  }
  const umbrella = (r, b, col) => { r(-6, -17 - b, 13, 2, col); r(-4, -18 - b, 9, 1, col); r(-6, -15 - b, 1, 1, col); r(6, -15 - b, 1, 1, col); r(0, -15 - b, 1, 5, '#3a3a46'); };
  function drawWeatherBack(t) {   // gelap mendung + bayangan awan di atas peta
    if (WX.dark > 0.01) { cx.fillStyle = `rgba(40,52,78,${WX.dark.toFixed(3)})`; cx.fillRect(0, 0, cv.width, cv.height); }
    if (WX.cl > 0.05) { const zz = cam.z * dpr;
      for (let i = 0; i < 7; i++) { const x = ((rnd(i * 4.1) * (WW + 160) + t * (3 + i % 3)) % (WW + 160)) - 80, y = rnd(i * 2.7) * WH, [a, b2] = toScreen(x, y), rr = (40 + rnd(i) * 30) * zz;
        const gr = cx.createRadialGradient(a, b2, 0, a, b2, rr); gr.addColorStop(0, `rgba(20,30,50,${(0.22 * WX.cl).toFixed(3)})`); gr.addColorStop(1, 'rgba(20,30,50,0)'); cx.fillStyle = gr; cx.fillRect(a - rr, b2 - rr, rr * 2, rr * 2); } }
  }
  function drawWeatherFront(t) {   // hujan, cipratan, petir
    if (WX.rain > 0.02) { const W = cv.width, H = cv.height, n = Math.round(Math.min(600, W * H / 2600) * WX.rain), len = Math.round(9 * dpr), sp = 520 * dpr;
      cx.fillStyle = 'rgba(205,225,255,0.55)';
      for (let i = 0; i < n; i++) { const x = (rnd(i * 1.3) * (W + 60) + t * sp * 0.25) % (W + 60) - 30, y = (rnd(i * 7.7) * (H + len) + t * sp * (0.8 + rnd(i) * 0.4)) % (H + len) - len;
        cx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(dpr)), len); cx.fillRect(Math.round(x - dpr), Math.round(y + len * 0.6), Math.max(1, Math.round(dpr)), Math.round(len * 0.4)); }
      cx.fillStyle = 'rgba(220,235,255,0.6)';
      for (let i = 0; i < n / 6; i++) { const k = Math.floor(t * 8) + i, x = rnd(k * 3.3) * W, y = rnd(k * 5.9) * H; cx.fillRect(Math.round(x - 2 * dpr), Math.round(y), Math.round(4 * dpr), Math.max(1, Math.round(dpr))); } }
    if (WX.flash > 0) { cx.fillStyle = `rgba(235,240,255,${(0.55 * WX.flash).toFixed(3)})`; cx.fillRect(0, 0, cv.width, cv.height);
      if (WX.flash > 0.6) { let x = WX.boltX * cv.width, y = 0; cx.fillStyle = '#fffbe0'; const s = Math.max(2, Math.round(2 * dpr)); while (y < cv.height * 0.45) { const nx = x + (Math.random() - 0.5) * 30 * dpr; for (let k = 0; k < 10; k++) cx.fillRect(Math.round(x + (nx - x) * k / 10), Math.round(y + k * 2 * dpr), s, s * 2); x = nx; y += 20 * dpr; } } }
  }
  function camStep(dt) { fitSB();
    if (CAMV.tz) { const [wx, wy] = toWorld(CAMV.ax, CAMV.ay), z0 = cam.z, nz = cam.z + (CAMV.tz - cam.z) * Math.min(1, dt * 12); cam.z = nz; const k = 1 - z0 / cam.z; cam.x += (wx - cam.x) * k; cam.y += (wy - cam.y) * k; if (Math.abs(CAMV.tz - cam.z) < 0.002) CAMV.tz = null; clampCam(); }
    if (Math.abs(CAMV.vx) + Math.abs(CAMV.vy) > 2) { cam.x += CAMV.vx * dt; cam.y += CAMV.vy * dt; const f = Math.exp(-dt * 4.5); CAMV.vx *= f; CAMV.vy *= f; clampCam(); } }
  function frame(ts) {
    const t = ts / 1000, dt = Math.min(0.1, (ts - last) / 1000 || 0.016); last = ts;
    const h = window.SIKEPO_FORCE_HOUR ?? wibHour(), night = nightK(h);
    step(dt, night); stepUdin(dt, t, night); stepWx(dt, t); camStep(dt);
    if (P.follow) { CAMV.vx = CAMV.vy = 0; const f = P.follow === 'U' ? U : P.follow, k = 1 - Math.exp(-dt * 4); cam.x += (f.x - cam.x) * k; cam.y += (f.y - 8 - cam.y) * k; cam.z += (Math.max(cam.z, 7.5) - cam.z) * k * 0.5; clampCam(); }
    { let b = document.getElementById('droneBadge'); if (!b) { b = document.createElement('button'); b.id = 'droneBadge'; b.type = 'button'; b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);top:calc(76px + env(safe-area-inset-top,0px));z-index:45;font:10px var(--display,monospace);padding:8px 12px;border:3px solid #1c1c24;background:#c8302a;color:#fff;box-shadow:3px 3px 0 #1c1c24;cursor:pointer'; b.onclick = () => { P.follow = null; }; document.body.append(b); }
      const on = !!P.follow; b.hidden = !on; if (on) { const nm = P.follow === 'U' ? 'WALI KOTA UDIN' : String(P.follow.w.nama || 'WARGA').toUpperCase().slice(0, 16); const txt = '● DRONE: ' + nm + '  ✕'; if (b.textContent !== txt) b.textContent = txt; } }
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.imageSmoothingEnabled = false;
    cx.fillStyle = SMODE ? '#2b4a26' : FMODE ? '#1a2e24' : '#2c86d8'; cx.fillRect(0, 0, cv.width, cv.height);
    const z = cam.z * dpr; const [ox, oy] = toScreen(0, 0);
    if (SMODE) { const GR = window.__GR || (window.__GR = Object.assign(new Image(), { src: 'img/rumput.jpg' }));
      const TG = window.__TG || (window.__TG = Object.assign(new Image(), { src: 'img/tex_grass.png' })), TD = window.__TD || (window.__TD = Object.assign(new Image(), { src: 'img/tex_dirt.png' }));
      const pat = (img, sc) => { if (!img.complete || !img.naturalWidth) return null; const pt = cx.createPattern(img, 'repeat'), [a0, b0] = toScreen(0, 0); pt.setTransform(new DOMMatrix().translate(a0, b0).scale(z * sc)); return pt; };
      const PG = pat(TG, 0.45), PD = pat(TD, 0.4);
      cx.fillStyle = '#7fae45'; cx.fillRect(0, 0, cv.width, cv.height); if (PG) { cx.globalAlpha = 0.55; cx.fillStyle = PG; cx.fillRect(0, 0, cv.width, cv.height); const PG2 = pat(TG, 1.13); if (PG2) { cx.globalAlpha = 0.35; cx.fillStyle = PG2; cx.fillRect(0, 0, cv.width, cv.height); } cx.globalAlpha = 1; }
      if (GR.complete && GR.naturalWidth) { const pt = cx.createPattern(GR, 'repeat'), [a0, b0] = toScreen(0, 0); pt.setTransform(new DOMMatrix().translate(a0, b0).scale(z * 0.22)); cx.globalAlpha = PG ? 0 : 0.28; cx.fillStyle = pt; cx.fillRect(0, 0, cv.width, cv.height); cx.globalAlpha = 1; }
      const quad = (c0, r0, c1, r1, fill, line, lw) => { const P = [kAt(c0, r0), kAt(c1, r0), kAt(c1, r1), kAt(c0, r1)].map(q => toScreen(...q)); cx.beginPath(); P.forEach(([a, b], i) => i ? cx.lineTo(a, b) : cx.moveTo(a, b)); cx.closePath(); if (fill) { cx.fillStyle = fill; cx.fill(); } if (line) { cx.strokeStyle = line; cx.lineWidth = Math.max(1, z * (lw || 0.6)); cx.stroke(); } };
      const R = ROWS(), VE = VEND(), V = []; for (let r = 0; r <= R + 1; r += 2) V.push(Math.floor(r / 2) * 2.7 + 0.25);
      // distrik kota: tanah rata + grid zona tipis (ala city-builder)
      quad(-1.2, -0.9, 11.2, VE + 1.6, PG ? 'rgba(255,255,200,0.06)' : '#8fca60', 'rgba(255,255,255,0.35)', 1.0);
      cx.strokeStyle = 'rgba(255,255,255,' + (cam.z > 4 ? 0 : 0.07) + ')'; cx.lineWidth = Math.max(1, z * 0.35); cx.beginPath();
      for (let c = -1.2; c <= 11.21; c += 0.5) { const [a, b] = toScreen(...kAt(c, -0.9)), [e, f] = toScreen(...kAt(c, VE + 1.6)); cx.moveTo(a, b); cx.lineTo(e, f); }
      for (let v = -0.9; v <= VE + 1.61; v += 0.45) { const [a, b] = toScreen(...kAt(-1.2, v)), [e, f] = toScreen(...kAt(11.2, v)); cx.moveTo(a, b); cx.lineTo(e, f); } cx.stroke();
      const zq = (c0, r0, c1, r1, col, txt) => { quad(c0, r0, c1, r1, col.replace('A', '0.07'), col.replace('A', '0.55'), 0.9); if (txt && window.SK && cam.z < 4) { const [a, b] = toScreen(...kAt((c0 + c1) / 2, (r0 + r1) / 2)), sc = Math.max(1, Math.round(dpr * 1.5)), w = SK.tw(txt, sc); cx.fillStyle = 'rgba(28,28,36,0.55)'; cx.fillRect(a - w / 2 - 4 * sc, b - 3 * sc, w + 8 * sc, 13 * sc); SK.txt(cx, txt, Math.round(a - w / 2), Math.round(b), sc, col.replace('A', '1').replace('rgba', 'rgba'), null); } };
      zq(-1.5, -4.6, 11.5, -1.0, 'rgba(240,200,60,A)', ''); zq(11.6, -0.7, 14.5, V[V.length - 1] - 0.2, 'rgba(60,200,200,A)', 'TAMAN / CADANGAN'); zq(-1.0, V[V.length - 1] + 0.25, 11.0, VE + 1.4, 'rgba(80,150,255,A)', 'PUSAT KOTA');
      if (window.SK && cam.z >= 1.4 && cam.z < 6) for (let r = 0; r < R; r++) for (const sd of [0, 1]) { const [a, b] = toScreen(...kAt(sd ? 8.6 : 1.4, VR(r) - 0.7 + (r % 2) * 1.4)), t = 'RT ' + String(r * 2 + sd + 1).padStart(2, '0'), sc = Math.max(1, Math.round(dpr)), w = SK.tw(t, sc); cx.fillStyle = 'rgba(255,246,220,0.85)'; cx.fillRect(a - w / 2 - 3 * sc, b - 2 * sc, w + 6 * sc, 10 * sc); SK.txt(cx, t, Math.round(a - w / 2), Math.round(b), sc, '#1c1c24', null); }
      { // SUNGAI di atas sawah + saluran irigasi ke sawah
        const tt = performance.now() / 1000, R0 = -6.4, R1 = -5.1;
        quad(-40, R0 - 0.25, 45, R1 + 0.25, '#c8b27a'); quad(-40, R0, 45, R1, '#3d8fc4'); quad(-40, R0 + 0.18, 45, R1 - 0.18, '#4aa3d8');
        quad(4.82, R1, 5.18, -4.4, '#c8b27a'); quad(4.88, R1, 5.12, -4.4, '#4aa3d8');
        const pw = Math.max(2, Math.round(z * 1.3)), PX = (cc, vv, col, w, h) => { const [x1, y1] = toScreen(...kAt(cc, vv)); cx.fillStyle = col; cx.fillRect(Math.round(x1 / pw) * pw, Math.round(y1 / pw) * pw, pw * w, pw * h); };
        for (let q = 0; q < 620; q++) { const cc = -40 + ((q * 0.137 + tt * 0.5) % 85 + 85) % 85, lane = q % 5, vv = R0 + 0.18 + lane * (R1 - R0 - 0.36) / 4 + Math.sin(tt * 2 + q) * 0.03, ph = (tt * 3 + q * 1.7) % 6;
          if (ph < 4) { PX(cc, vv, lane % 2 ? '#7cc8f0' : '#2f78ad', 3, 1); PX(cc + 0.04, vv - 0.02, lane % 2 ? '#bfe8ff' : '#5fb0e0', 1, 1); } }
        for (let q = 0; q < 258; q++) { const cc = -40 + q * 0.33, f = Math.floor(tt * 4 + q) % 3; PX(cc, R0 + 0.03, f ? '#e8f6ff' : '#9fd6f5', 2, 1); PX(cc + 0.15, R1 - 0.05, f === 1 ? '#e8f6ff' : '#9fd6f5', 2, 1); }
        for (let q = 0; q < 40; q++) { const k = Math.floor(tt * 2.5 + q * 3.1) % 8; if (k > 2) continue; const cc = -38 + (q * 2.17 % 82), vv = R0 + 0.3 + (q * 0.37 % 0.7); PX(cc, vv, '#ffffff', 1, 1); if (k === 1) { PX(cc - 0.05, vv, '#ffffff', 1, 1); PX(cc + 0.05, vv, '#ffffff', 1, 1); PX(cc, vv - 0.05, '#ffffff', 1, 1); PX(cc, vv + 0.05, '#ffffff', 1, 1); } }
        { const fp = (tt * 0.25) % 1, fc = -8 + Math.floor(tt * 0.25) * 7.3 % 24; if (fp < 0.25) { const hgt = Math.sin(fp / 0.25 * Math.PI) * 0.35; PX(fc + fp * 1.2, (R0 + R1) / 2 - hgt, '#f0a040', 2, 1); PX(fc + fp * 1.2 - 0.06, (R0 + R1) / 2 - hgt, '#c06020', 1, 1); } }
        for (let q = 0; q < 8; q++) { const vv = R1 + ((tt * 0.4 + q / 8) % 1) * (-4.4 - R1); PX(5, vv, q % 2 ? '#bfe8ff' : '#7cc8f0', 1, 2); }
        if (window.SK && cam.z < 4) { const [a2, b2] = toScreen(...kAt(0, (R0 + R1) / 2)), sc = Math.max(1, Math.round(dpr * 1.5)), w = SK.tw('SUNGAI', sc); cx.fillStyle = '#fff'; SK.text ? 0 : 0; cx.font = (10 * sc) + 'px monospace'; cx.fillText('SUNGAI', a2 - w / 2, b2); } }
      { // SAWAH ala terasering: petak dipisah pematang hijau, isi kosong(air)/hijau/kuning bergaris
        const PAL = [['#8ea4b8', '#b6c8d6'], ['#5f9e3a', '#86c255'], ['#c9a63a', '#e6c95a']], C0 = -1.3, C1 = 11.3, V0 = -4.5, V1 = -1.1, nc = 9, nv = 4, dc = (C1 - C0) / nc, dv = (V1 - V0) / nv;
        
        for (let a = 0; a < nc; a++) for (let b2 = 0; b2 < nv; b2++) { const c0 = C0 + a * dc + 0.07, c1 = C0 + (a + 1) * dc - 0.07, v0 = V0 + b2 * dv + 0.06, v1 = V0 + (b2 + 1) * dv - 0.06; if (c0 < 5.25 && c1 > 4.75) continue;
          const k = (a * 7 + b2 * 13 + 3) % 10, ty = k < 3 ? 0 : k < 6 ? 1 : 2, [base, hi] = PAL[ty]; quad(c0 - 0.03, v0 - 0.03, c1 + 0.03, v1 + 0.03, '#6b5a2e'); quad(c0, v0, c1, v1, base);
          cx.strokeStyle = hi; cx.lineWidth = Math.max(1, z * 0.45); cx.beginPath(); const ln = ty === 0 ? 3 : 6;
          for (let q = 1; q < ln; q++) { const vv = v0 + (v1 - v0) * q / ln, [x1, y1] = toScreen(...kAt(c0 + 0.04, vv)), [x2, y2] = toScreen(...kAt(c1 - 0.04, vv)); cx.moveTo(x1, y1); cx.lineTo(x2, y2); }
          cx.stroke();
          if (ty) { cx.fillStyle = ty === 1 ? '#3f7a2a' : '#a8862a'; for (let q = 0; q < 10; q++) { const cc = c0 + (c1 - c0) * ((q * 37 % 10) + 0.5) / 10, vv = v0 + (v1 - v0) * ((q * 53 % 10) + 0.5) / 10, [x1, y1] = toScreen(...kAt(cc, vv)); cx.fillRect(Math.round(x1), Math.round(y1 - z), Math.max(1, Math.round(z * 0.5)), Math.max(1, Math.round(z * 1.4))); } } } }
      // kavling: petak seragam + pagar tanaman + bedeng bunga rapi
      for (const h of HS) { quad(h.c - 0.46, h.r - 0.5, h.c + 0.46, h.r + 0.46, null, 'rgba(255,255,255,0.12)', 0.6);
        const up = (h.r % 2.7) > 1.5, ve = up ? h.r + 0.46 : h.r - 0.5, vr = up ? h.r + 0.6 : h.r - 0.64; quad(h.c - 0.06, Math.min(ve, vr), h.c + 0.06, Math.max(ve, vr), '#d8cdb4');
        const fv = up ? h.r + 0.38 : h.r - 0.42, cols = ['#ff6b8a', '#ffd84a', '#ffffff', '#c86bff'], fc = cols[Math.abs(h.no | 0) % 4];
        if (false) for (let k = 0; k < 7; k++) { const c = h.c - 0.4 + k * 0.133; if (Math.abs(c - h.c) < 0.1) continue; const [a, b] = toScreen(...kAt(c, fv)), rr = Math.max(1.2, z * 0.9); cx.fillStyle = '#3f8f3a'; cx.beginPath(); cx.arc(a, b, rr * 1.6, 0, 7); cx.fill(); cx.fillStyle = fc; cx.beginPath(); cx.arc(a, b - rr * 0.4, rr * 0.8, 0, 7); cx.fill(); } }
      { const pr = V[V.length - 1] + 1.15; quad(5.5, pr - 0.55, 6.5, pr + 0.4, '#b9b3a4', '#8a8478', 1.0); quad(3.45, pr - 0.65, 4.55, pr + 0.4, '#b9b3a4', '#8a8478', 1.0); }
      // jalan: tepi lurus (tanpa ujung bulat), bahu jalan lalu badan jalan, persimpangan menyatu
      const RQ = V.map(v => [-0.7, v - 0.14, 10.7, v + 0.14, -0.7, v - 0.105, 10.7, v + 0.105]); RQ.push([4.81, -3.2, 5.19, VE + 4.2, 4.85, -3.2, 5.15, VE + 4.2]);
      { const R2 = ROWS2(); if (R2 > 0) { const V2 = []; for (let r = 0; r <= R2 + 1; r += 2) V2.push(Math.floor(r / 2) * 2.7 + 0.25); const v2e = V2[V2.length - 1];
        V2.forEach(v => { const e = v > 3 ? -7.2 : -0.6; RQ.push([-13.1, v - 0.14, e, v + 0.14, -13.1, v - 0.105, e, v + 0.105]); }); RQ.push([-7.59, -0.4, -7.21, v2e + 0.2, -7.55, -0.4, -7.25, v2e + 0.2]); } }
      { const GV = 5.2, R = (c0, v0, c1, v1, h) => RQ.push(h ? [c0, v0 - 0.14, c1, v0 + 0.14, c0, v0 - 0.105, c1, v0 + 0.105] : [c0 - 0.14, v0, c0 + 0.14, v1, c0 - 0.105, v0, c0 + 0.105, v1]);
        R(-6.6, GV, -0.75, 0, 1); R(-0.75, 2.81, 0, GV + 0.14, 0); for (let k = 0; k < 6; k++) { const cc = -6.15 + (k % 3) * 1.45, vv = GV - 0.55 + Math.floor(k / 3) * 1.75; R(cc, Math.min(vv, GV), 0, Math.max(vv, GV), 0); } }
      RQ.forEach(q => quad(q[0], q[1], q[2], q[3], '#8c6a3c')); RQ.forEach(q => quad(q[4], q[5], q[6], q[7], PD || '#d3ad76'));
      cx.strokeStyle = 'rgba(255,240,210,0)'; cx.lineWidth = Math.max(1, z * 0.4); cx.setLineDash([z * 3, z * 3]); cx.beginPath();
      for (const v of V) { const [a, b] = toScreen(...kAt(-0.6, v)), [e, f] = toScreen(...kAt(10.6, v)); cx.moveTo(a, b); cx.lineTo(e, f); }
      { const [a, b] = toScreen(...kAt(5, -0.4)), [e, f] = toScreen(...kAt(5, VE + 4.1)); cx.moveTo(a, b); cx.lineTo(e, f); } cx.stroke(); cx.setLineDash([]); }
    else cx.drawImage(bg, Math.round(ox), Math.round(oy), Math.round(WW * z), Math.round(WH * z));
    // sea shimmer
    cx.fillStyle = 'rgba(255,255,255,0.35)';
    if (SMODE && window.SK) { const nEl = document.getElementById('hWarga'), v = nEl && nEl.textContent.trim(), txt = 'WARGA: ' + (v && v !== '—' ? v : '0'), sc = Math.max(1, Math.round(z / 2.2)), w = SK.tw(txt, sc), [a, b2] = toScreen(GATE().x - 4, GATE().y + 14);
      cx.fillStyle = '#1c1c24'; cx.fillRect(Math.round(a - w / 2 - 5 * sc), Math.round(b2 - 3 * sc), w + 10 * sc, 13 * sc); cx.fillStyle = '#7a4a22'; cx.fillRect(Math.round(a - w / 2 - 4 * sc), Math.round(b2 - 2 * sc), w + 8 * sc, 11 * sc); SK.txt(cx, txt, Math.round(a - w / 2), Math.round(b2), sc, '#ffd84a', null); }
    if (!FMODE && !SMODE) for (let i = 0; i < 18; i++) { const x = (rnd(i) * WW + t * (3 + i % 4)) % WW, y = rnd(i * 7) * WH; if (inDia(x, y, ISL, -6)) continue; const [a, b2] = toScreen(x, y); cx.fillRect(Math.round(a), Math.round(b2), Math.round(5 * z), Math.max(1, Math.round(z))); }
    // sprites sorted by y
    const list = P.walkers.slice().sort((a, b) => a.y - b.y);
    let udDrawn = false;
    if (!window.PETA_HIDE) {
    if (SMODE) { const RV = window.__RV || (window.__RV = ['v0', 'v1', 'v2', 'v3', 'v4', 'v5', '2lt', 'kayu'].map(k => Object.assign(new Image(), { src: 'img/rumah3d_' + k + '.png' }))), RI = RV[0], GI = window.__GI || (window.__GI = Object.assign(new Image(), { src: 'img/gerbang3d.png' }));
      const items = list.map(o => [o.y, () => drawWalker(cx, o, t)]); items.push([U.y, () => drawUdin(cx, night, t)]);
      if (RI.complete && RI.naturalWidth) for (const h of HS) items.push([h.y, () => { const hh = 36 * z, ww = RI.naturalWidth / RI.naturalHeight * hh, [a, b] = toScreen(h.x, h.y); cx.imageSmoothingEnabled = true; { const nn = Math.abs(h.no | 0), md = nn % 3, vi = md === 0 ? 6 : md === 1 ? 7 : (nn * 7 + 3) % 6, fl = (nn >> 2) % 2 === 1, im = RV[vi].complete && RV[vi].naturalWidth ? RV[vi] : RI; cx.save(); cx.translate(Math.round(a), 0); if (fl) cx.scale(-1, 1); cx.drawImage(im, Math.round(-ww / 2), Math.round(b - hh * 0.82), Math.round(ww), Math.round(hh)); cx.restore(); } cx.imageSmoothingEnabled = false;
        { const ow = P.byNo.get(h.no); if (ow && ow.sleep) ZQ.push([h.x, h.y, h.no]); }
        if (h.nama && window.SK && cam.z >= 1.6) { const sc = Math.max(1, Math.round(dpr * (cam.z >= 3 ? 2 : 1))), tw = SK.tw(h.nama, sc), y = Math.round(b - hh * 0.86 - 11 * sc); cx.fillStyle = 'rgba(28,28,36,0.85)'; cx.fillRect(Math.round(a - tw / 2 - 3 * sc), y - 2 * sc, tw + 6 * sc, 11 * sc); SK.txt(cx, h.nama, Math.round(a - tw / 2), y, sc, '#ffffff', null); } }]);
      const PI = window.__PI || (window.__PI = Object.assign(new Image(), { src: 'img/pos3d.png' }));
      if (PI.complete && PI.naturalWidth) { const RR = ROWS(); let vL = 0; for (let r = 0; r <= RR + 1; r += 2) vL = Math.floor(r / 2) * 2.7 + 0.25; for (const v of [vL]) { const [px, py] = kAt(6.0, v + 1.15); items.push([py, () => { const hh = 34 * z, ww = PI.naturalWidth / PI.naturalHeight * hh, [a, b] = toScreen(px, py); cx.imageSmoothingEnabled = true; cx.drawImage(PI, Math.round(a - ww / 2), Math.round(b - hh * 0.85), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); } }
      const WI = window.__WI || (window.__WI = Object.assign(new Image(), { src: 'img/warung3d.png' }));
      { // KAWASAN IBADAH 6 agama + MENARA UDIN
  const quad = (c0, r0, c1, r1, fill, line, lw) => { const P = [kAt(c0, r0), kAt(c1, r0), kAt(c1, r1), kAt(c0, r1)].map(q => toScreen(...q)); cx.beginPath(); P.forEach(([a, b], i) => i ? cx.lineTo(a, b) : cx.moveTo(a, b)); cx.closePath(); if (fill) { cx.fillStyle = fill; cx.fill(); } if (line) { cx.strokeStyle = line; cx.lineWidth = Math.max(1, z * (lw || 0.6)); cx.stroke(); } };
        const IBN = ['masjid', 'gereja', 'katedral', 'pura', 'vihara', 'klenteng'], IM = window.__IB || (window.__IB = Object.fromEntries([...IBN, 'menara'].map(n => [n, Object.assign(new Image(), { src: 'img/' + n + '.png' })])));
        const PC0 = -7.0, PV0 = 3.3, PC1 = -2.5, PV1 = 7.1, GV = (PV0 + PV1) / 2;
        for (let k = 0; k < 46; k++) { const cc = PC0 + 0.3 + (k * 0.731 % 1) * (PC1 - PC0 - 0.6), vv = PV0 + 0.25 + (k * 0.457 % 1) * (PV1 - PV0 - 0.5); if (Math.abs(vv - GV) < 0.25) continue; const [a, b] = toScreen(...kAt(cc, vv)); cx.fillStyle = ['#ff6b8a', '#ffd84a', '#ffffff', '#c86bff', '#ff9a3c'][k % 5]; cx.beginPath(); cx.ellipse(a, b, 1.8 * z, 1 * z, 0, 0, 7); cx.fill(); }
        const FE = [[PC0, PV0, PC1, PV0], [PC1, PV0, PC1, GV - 0.2], [PC1, GV + 0.2, PC1, PV1], [PC1, PV1, PC0, PV1], [PC0, PV1, PC0, PV0]];
        for (const [ca, va, cb, vb] of FE) { const n = Math.max(1, Math.round(Math.hypot(cb - ca, vb - va) / 0.22)); let pv = null;
          for (let k = 0; k <= n; k++) { const [x, y] = toScreen(...kAt(ca + (cb - ca) * k / n, va + (vb - va) * k / n)), fz = z * dpr;
            if (pv) { cx.strokeStyle = '#8a5a2a'; cx.lineWidth = Math.max(1, 1.6 * fz / dpr); cx.beginPath(); cx.moveTo(pv[0], pv[1] - 6.5 * fz / dpr); cx.lineTo(x, y - 6.5 * fz / dpr); cx.moveTo(pv[0], pv[1] - 3 * fz / dpr); cx.lineTo(x, y - 3 * fz / dpr); cx.stroke(); }
            cx.fillStyle = '#f4ead2'; cx.fillRect(x - 1.2 * z, y - 10 * z, 2.4 * z, 10 * z); pv = [x, y]; } }
        IBN.forEach((n, k) => { const [x, y] = kAt(PC0 + 0.85 + (k % 3) * 1.45, GV - 0.55 + Math.floor(k / 3) * 1.75); items.push([y, () => { const im = IM[n]; if (!im.complete || !im.naturalWidth) return; const hh = 50 * z, ww = im.naturalWidth / im.naturalHeight * hh, [a, b] = toScreen(x, y); cx.imageSmoothingEnabled = true; cx.drawImage(im, Math.round(a - ww / 2), Math.round(b - hh * 0.84), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); });
        { const [x, y] = kAt(-1.45, GV - 1.25); items.push([y, () => { const im = IM.menara; if (!im.complete || !im.naturalWidth) return; const hh = 120 * z, ww = im.naturalWidth / im.naturalHeight * hh, [a, b] = toScreen(x, y); cx.imageSmoothingEnabled = true; cx.drawImage(im, Math.round(a - ww / 2), Math.round(b - hh + 14 * z), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); } }
      if (window.SIKEPO_WARUNG !== false && WI.complete && WI.naturalWidth) { const [px, py] = POSXY(), wx = px - 2 * KU[0] - 0.1 * KV[0], wy = py - 2 * KU[1] - 0.1 * KV[1]; items.push([wy, () => { const hh = 40 * z, ww = WI.naturalWidth / WI.naturalHeight * hh, [a, b] = toScreen(wx, wy); cx.imageSmoothingEnabled = true; cx.drawImage(WI, Math.round(a - ww / 2), Math.round(b - hh * 0.85), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); }
      { const RR = ROWS(); for (let r = 0; r <= RR + 1; r += 2) { const v = Math.floor(r / 2) * 2.7 + 0.25; for (let c = 0.5; c < 11; c += 1) { if (c > 4 && c < 6) continue; for (const dv of [-0.45, 0.45]) { const [tx, ty] = kAt(c, v + dv), sd = c * 13 + v * 7 + dv * 5; items.push([ty, () => { const TR = window.__TR || (window.__TR = ['pohon1', 'pohon2', 'pohon3', 'pohon1', 'pohon2', 'kelapa', 'pisang', 'semak1', 'semak2'].map(n => Object.assign(new Image(), { src: 'img/px/' + n + '.png' }))), im = TR[Math.abs(Math.round(sd)) % TR.length]; if (!im.complete || !im.naturalWidth) return;
        const [a, b] = toScreen(tx, ty), hh = (im.src.includes('semak') ? 9 : 22) * z, ww = im.naturalWidth / im.naturalHeight * hh; cx.fillStyle = 'rgba(0,0,0,0.18)'; cx.beginPath(); cx.ellipse(a, b, ww * 0.32, ww * 0.12, 0, 0, 7); cx.fill(); cx.imageSmoothingEnabled = true; cx.drawImage(im, Math.round(a - ww / 2), Math.round(b - hh * 0.95), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); } } } }
      { const R2 = ROWS2(); for (let r = 0; r <= R2 + 1 && R2 > 0; r += 2) { const v = Math.floor(r / 2) * 2.7 + 0.25; for (let c = -12.9; c < (v > 3 ? -7.8 : -1); c += 1) { if (c > -8.4 && c < -6.4) continue; for (const dv of [-0.45, 0.45]) { const [tx, ty] = kAt(c, v + dv), sd = Math.abs(Math.round(c * 13 + v * 7 + dv * 5)); items.push([ty, () => { const TR = window.__TR; if (!TR) return; const im = TR[sd % TR.length]; if (!im.complete || !im.naturalWidth) return; const [a, b] = toScreen(tx, ty), hh = (im.src.includes('semak') ? 9 : 22) * z, ww = im.naturalWidth / im.naturalHeight * hh; cx.imageSmoothingEnabled = true; cx.drawImage(im, Math.round(a - ww / 2), Math.round(b - hh * 0.95), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); } } } }
      const gt = GATE(); if (GI.complete && GI.naturalWidth) items.push([gt.y, () => { const hh = 62 * z, ww = GI.naturalWidth / GI.naturalHeight * hh, [a, b] = toScreen(gt.x, gt.y); cx.imageSmoothingEnabled = true; cx.drawImage(GI, Math.round(a - ww * 0.46), Math.round(b - hh * 0.8), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]);
      items.sort((p, q) => p[0] - q[0]).forEach(([, f]) => f());
      { // HELIKOPTER keliling Menara Udin
        const [mx, my] = toScreen(...kAt(-1.45, 3.95)), ty = my - 112 * z, a = t * 0.7, hx = mx + Math.cos(a) * 42 * z, hy = ty - 18 * z + Math.sin(a) * 15 * z + Math.sin(t * 3) * 1.5 * z, fl = -Math.sin(a) >= 0 ? 1 : -1, u = z * 0.9;
        const R_ = (x, y, w, h, col) => { cx.fillStyle = col; cx.fillRect(Math.round(hx + x * u * fl - (fl < 0 ? w * u : 0)), Math.round(hy + y * u), Math.ceil(w * u), Math.ceil(h * u)); };
        cx.fillStyle = 'rgba(0,0,0,0.18)'; cx.beginPath(); cx.ellipse(hx, my - 2 * z + Math.sin(a) * 15 * z * 0.4, 6 * z, 2 * z, 0, 0, 7); cx.fill();
        R_(-14, -1, 9, 2, '#2a3a6e'); R_(-16, -4, 2, 5, '#2a3a6e'); R_(-17, -4, 1, 1, '#ffd84a'); R_(-5, -4, 10, 7, '#2a3a6e'); R_(-5, -4, 10, 2, '#3f56a0'); R_(2, -3, 4, 4, '#8fe0ff'); R_(-3, -2, 3, 3, '#8fe0ff'); R_(-4, 1, 9, 1, '#ffd84a');
        R_(-5, 4, 11, 1, '#1c1c24'); R_(-3, 3, 1, 1, '#1c1c24'); R_(3, 3, 1, 1, '#1c1c24'); R_(-1, -6, 2, 2, '#1c1c24');
        const rl = 13 * Math.abs(Math.cos(t * 28)) + 3; cx.fillStyle = 'rgba(30,30,36,0.85)'; cx.fillRect(Math.round(hx - rl * u), Math.round(hy - 6.5 * u), Math.round(rl * 2 * u), Math.max(1, Math.round(0.8 * u)));
        if (Math.floor(t * 4) % 2) R_(-17, -6, 1, 1, '#ff4040'); }
      if (cam.z < 3.2) { // LABEL KOMPLEK BLOK
        const blk = (c, v, name, n) => { const [x0, y0] = toScreen(...kAt(c, v)), s1 = Math.round(12 * dpr), s2 = Math.round(9 * dpr); cx.font = 'bold ' + s1 + 'px sans-serif'; const w = Math.max(cx.measureText(name).width, 70 * dpr) + 20 * dpr, h = 36 * dpr, x = x0 - w / 2, y = y0 - h;
          cx.fillStyle = 'rgba(0,0,0,0.25)'; cx.beginPath(); cx.roundRect(x + 2 * dpr, y + 3 * dpr, w, h, 8 * dpr); cx.fill(); cx.fillStyle = '#fffdf4'; cx.beginPath(); cx.roundRect(x, y, w, h, 8 * dpr); cx.fill(); cx.fillStyle = '#ffd84a'; cx.fillRect(x, y + 6 * dpr, 4 * dpr, h - 12 * dpr);
          cx.textBaseline = 'middle'; cx.fillStyle = '#1d2a3a'; cx.fillText(name, x + 10 * dpr, y + 13 * dpr); cx.font = s2 + 'px sans-serif'; cx.fillStyle = '#6a7280'; cx.fillText(n + ' rumah', x + 10 * dpr, y + 27 * dpr); cx.textBaseline = 'alphabetic'; };
        const AB = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; let bi = 0; const cnt = {};
        for (const h of HS) { const k = (h.d2 ? 'D' : 'U') + Math.floor((h.r - 1.0 + 0.01) / 2.7); cnt[k] = (cnt[k] || 0) + 1; }
        for (const k of Object.keys(cnt).sort((a, b) => (a[0] === b[0] ? +a.slice(1) - +b.slice(1) : a[0] === 'U' ? -1 : 1))) { const d2 = k[0] === 'D', bk = +k.slice(1), v = bk * 2.7 + 1.55, c = d2 ? (bk >= 1 ? -10.4 : -7.4) : 5; blk(c, v, 'Komplek Blok ' + AB[bi++ % 26], cnt[k]); } }
      if (cam.z < 1.8) { // PIN LANDMARK ala negara gabut
        const pin = (x, y, col, ic, name) => { const [a, b0] = toScreen(x, y), r = 13 * dpr, b = b0 - 34 * dpr; cx.strokeStyle = '#fff'; cx.lineWidth = 2 * dpr; cx.beginPath(); cx.moveTo(a, b + r); cx.lineTo(a, b0); cx.stroke();
          cx.fillStyle = 'rgba(0,0,0,0.25)'; cx.beginPath(); cx.ellipse(a, b0, 4 * dpr, 2 * dpr, 0, 0, 7); cx.fill();
          cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(a, b, r + 2.5 * dpr, 0, 7); cx.fill(); cx.fillStyle = col; cx.beginPath(); cx.arc(a, b, r, 0, 7); cx.fill();
          cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.font = Math.round(13 * dpr) + 'px sans-serif'; cx.fillText(ic, a, b + dpr); cx.textAlign = 'left';
          cx.font = 'bold ' + Math.round(11 * dpr) + 'px sans-serif'; const w = cx.measureText(name).width, lx = a + r + 6 * dpr; cx.fillStyle = 'rgba(255,255,255,0.92)'; cx.beginPath(); cx.roundRect(lx - 4 * dpr, b - 9 * dpr, w + 8 * dpr, 18 * dpr, 9 * dpr); cx.fill(); cx.fillStyle = '#1d2a3a'; cx.fillText(name, lx, b + dpr); cx.textBaseline = 'alphabetic'; };
        const [px, py] = POSXY(), g2 = GATE(), sw = kAt(5, -2.8), sg = kAt(-4, -5.75);
        pin(px, py, '#2c4a9e', '👮', 'Pos Satpam'); pin(px - 2 * KU[0] - 0.1 * KV[0], py - 2 * KU[1] - 0.1 * KV[1], '#d9822b', '🍛', 'Warung'); pin(g2.x, g2.y, '#8e2b2b', '⛩', 'Gerbang Kota');
        pin(sw[0], sw[1], '#5a9e2f', '🌾', 'Sawah Sikepo'); pin(sg[0], sg[1], '#2f86c4', '💧', 'Sungai'); { const ib = kAt(-4.75, 4.0), mn = kAt(-1.45, 3.95); pin(ib[0], ib[1], '#7a4fb0', '🕌', 'Kawasan Ibadah'); pin(mn[0], mn[1], '#1c2a6e', '🏢', 'Menara Udin'); } }
 }
    else { for (const o of list) { if (!udDrawn && o.y > U.y) { drawUdin(cx, night, t); udDrawn = true; } drawWalker(cx, o, t); }
    if (!udDrawn) drawUdin(cx, night, t); }
    }
    if (FMODE && FANT3.drawTop) FANT3.drawTop(cx, toScreen, cam.z * dpr);
    if (FMODE) { const ph = (t % 45) / 45; if (ph < 0.4) { const k = ph / 0.4, sx = -60 + k * (WW + 120), sy = 260 - k * 220, z = cam.z * dpr, [a, b2] = toScreen(sx, sy);
      cx.save(); cx.translate(a, b2); cx.rotate(Math.atan2(-220, WW + 120) + Math.PI / 2); cx.scale(z * 0.9, z * 0.9); cx.fillStyle = 'rgba(10,15,25,0.28)';
      const flap = Math.sin(t * 5) * 3, P = pts => { cx.beginPath(); pts.forEach(([x, y], i) => i ? cx.lineTo(x, y) : cx.moveTo(x, y)); cx.closePath(); cx.fill(); };
      P([[-1.5, -32], [1.5, -32], [2.5, -26], [1.5, -14], [-1.5, -14], [-2.5, -26]]);                                   // kepala + leher
      cx.beginPath(); cx.ellipse(0, -4, 4.5, 11, 0, 0, 7); cx.fill();                                                    // badan
      for (const s of [-1, 1]) { P([[s * 3, -12], [s * 18, -16 - flap], [s * 34, -12 - flap], [s * 44, -8 - flap], [s * 36, -4], [s * 30, -6], [s * 24, -1], [s * 17, -4], [s * 10, 1], [s * 3, -2]]);   // sayap
        P([[s * 2, 5], [s * 5, 11], [s * 4, 13], [s * 1, 8]]); }                                                         // kaki
      P([[-2.5, 5], [2.5, 5], [0.6, 44], [-0.6, 44]]);                                                                   // ekor panjang
      cx.restore(); } }
    drawWeatherBack(t);
    // night
    if (night > 0) {
      cx.fillStyle = `rgba(10,16,60,${(0.5 * night).toFixed(3)})`; cx.fillRect(0, 0, cv.width, cv.height);
      if (WX.cl < 0.6) for (let i = 0; i < 50; i++) if ((Math.floor(t * 1.5) + i) % 7) { cx.fillStyle = `rgba(255,255,255,${(0.8 * night).toFixed(2)})`; cx.fillRect(rnd(i * 9.1) * cv.width, rnd(i * 2.3) * cv.height * 0.35, 2 * dpr, 2 * dpr); }
      if ((KMODE || FMODE) && LIGHTS.length) { const zz = cam.z * dpr; cx.save(); cx.globalCompositeOperation = 'lighter';
        for (const [x, y, r] of LIGHTS) { const [a, b2] = toScreen(x, y), rr = r * zz; if (a < -rr || b2 < -rr || a > cv.width + rr || b2 > cv.height + rr) continue; const gr = cx.createRadialGradient(a, b2, 0, a, b2, rr);
          gr.addColorStop(0, `rgba(255,220,120,${(0.55 * night).toFixed(2)})`); gr.addColorStop(1, 'rgba(255,200,80,0)'); cx.fillStyle = gr; cx.fillRect(a - rr, b2 - rr, rr * 2, rr * 2); }
        cx.restore(); for (const [x, y, r] of LIGHTS) { const [a, b2] = toScreen(x, y), q = Math.max(1, Math.round(zz * (r > 4 ? 1.5 : 1))); cx.fillStyle = `rgba(255,242,176,${night.toFixed(2)})`; cx.fillRect(Math.round(a - q / 2), Math.round(b2 - q / 2), q, q); } }
      if (FMODE) for (const [ex, ey] of FANT3.EYES) { const [a, b2] = toScreen(ex, ey), rr = 14 * cam.z * dpr; const gr = cx.createRadialGradient(a, b2, 0, a, b2, rr); gr.addColorStop(0, `rgba(255,40,30,${(0.85 * night).toFixed(2)})`); gr.addColorStop(1, 'rgba(255,40,30,0)'); cx.fillStyle = gr; cx.fillRect(a - rr, b2 - rr, rr * 2, rr * 2); }
      if (night > 0.6 && !FMODE && !SMODE) for (const o of list) if (o.sleep && (Math.floor(t + o.ph) % 3 === 0)) { const [a, b2] = toScreen(o.x + 2, o.y - 5 - (t * 3 + o.ph) % 4); SK.txt(cx, 'Z', Math.round(a), Math.round(b2), Math.max(1, Math.round(dpr)), '#c9d2ea', null); }
    }
    drawWeatherFront(t);
    // hint above the plantation
    if (!FMODE && !SMODE) { const [a, b2] = toScreen(PLOT.cx, PLOT.cy - PLOT.hh - 14), sc = Math.max(1, Math.round(dpr * (cam.z >= 3 ? 2 : 1))), s = 'KLIK KEBUN: POV', w = SK.tw(s, sc), bob = Math.round(Math.sin(t * 3) * 2 * dpr);
      cx.fillStyle = 'rgba(28,28,36,0.85)'; cx.fillRect(Math.round(a - w / 2 - 4 * sc), Math.round(b2 - 3 * sc + bob), w + 8 * sc, 13 * sc); SK.txt(cx, s, Math.round(a - w / 2), Math.round(b2 + bob), sc, '#ffd84a', null); }
    // labels
    const strong = new Set([P.sel, ...[...P.hl].map(n => P.byNo.get(n))].filter(Boolean));
    let n = 0;
    if (cam.z >= 4 || P.showAll) for (const o of list) { if (strong.has(o)) continue; const [a, b2] = toScreen(o.x, o.y); if (a < 0 || b2 < 0 || a > cv.width || b2 > cv.height) continue; if (++n > (P.showAll ? 400 : 60)) break; label(cx, o, false); }
    strong.forEach(o => label(cx, o, true));
    { const z0 = cam.z * dpr; for (const [x, y, sd] of ZQ) { const [a, b] = toScreen(x, y); zzz(a + 6 * z0, b - 30 * z0, sd); } ZQ = []; }
    udinLabel(cx); udinBubble(cx);
    requestAnimationFrame(frame);
  }

  // ---------- input ----------
  function bindInput() {
    const pts = new Map(); let pinch0 = null, moved = 0;
    let lastT = 0; cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); moved = 0; CAMV.vx = CAMV.vy = 0; CAMV.tz = null; lastT = performance.now(); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: cam.z, mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2 }; } });
    cv.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return; const p = pts.get(e.pointerId), dx = e.clientX - p[0], dy = e.clientY - p[1]; pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2 && pinch0) { const [a, b] = [...pts.values()], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, r = cv.getBoundingClientRect(), [wx, wy] = toWorld(mx - r.left, my - r.top);
        const z0 = cam.z; cam.z = Math.max(zMin(), Math.min(zMax, pinch0.z * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch0.d)); const k = 1 - z0 / cam.z; cam.x += (wx - cam.x) * k; cam.y += (wy - cam.y) * k;
        cam.x -= (mx - pinch0.mx) / cam.z; cam.y -= (my - pinch0.my) / cam.z; pinch0.mx = mx; pinch0.my = my; clampCam(); moved += 10; P.follow = null; return; }
      if (pts.size > 1) return;
      const now = performance.now(), dtm = Math.max(8, now - lastT); lastT = now;
      if (Math.abs(dx) + Math.abs(dy) > 3) P.follow = null; cam.x -= dx / cam.z; cam.y -= dy / cam.z; CAMV.vx = CAMV.vx * 0.6 + (-dx / cam.z) / dtm * 1000 * 0.4; CAMV.vy = CAMV.vy * 0.6 + (-dy / cam.z) / dtm * 1000 * 0.4; moved += Math.abs(dx) + Math.abs(dy); clampCam();
    });
    const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch0 = null; if (performance.now() - lastT > 80 || moved < 6) CAMV.vx = CAMV.vy = 0;
      if (moved < (e.pointerType === 'touch' ? 14 : 6) && e.type === 'pointerup') { const r = cv.getBoundingClientRect(), [wx, wy] = toWorld(e.clientX - r.left, e.clientY - r.top); let best = null, bd = 9 / Math.max(1, cam.z / 3);
        if (Math.hypot(U.x - wx, (U.y - 7) - wy) < Math.max(6, 10 / Math.max(1, cam.z / 3))) { sapa(); P.follow = 'U'; return; }
        for (const o of P.walkers) { const d = Math.hypot(o.x - wx, (o.y - 5) - wy); if (d < bd) { bd = d; best = o; } }
        if (FMODE && P.onTavern && window.FANT3 && FANT3.tavern() >= 4) { const C = FANT3.CAMP; if (Math.abs(wx - C.x) < 40 && wy > C.y - 76 && wy < C.y + 14) { P.onTavern(); return; } }
        if (!best && inDia(wx, wy + 4, PLOT, -4) && P.onSawit) { P.onSawit(); return; }
        P.sel = best; P.follow = best || null; P.onPick && P.onPick(best ? best.w : null); } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(); CAMV.ax = e.clientX - r.left; CAMV.ay = e.clientY - r.top; CAMV.tz = Math.max(zMin(), Math.min(zMax, (CAMV.tz || cam.z) * Math.exp(-e.deltaY * 0.0015))); }, { passive: false });
    window.addEventListener('resize', resize);
  }

  window.PETA = {
    init(canvas) { cv = canvas; cx = cv.getContext('2d'); drawBg(); resize(); cam.z = Math.max(zMin(), 2.6); if (SMODE) { cam.z = Math.max(zMin(), 2.2); cam.x = 150; cam.y = 130; } clampCam(); bindInput(); requestAnimationFrame(frame);
      setInterval(() => { if (isKota() === KMODE && isFant() === FMODE) return; KMODE = isKota(); FMODE = isFant(); applyLayout(); g.clearRect(0, 0, WW, WH); drawBg();
        P.walkers.forEach(o => { const s = spot(o.w.no * 2.91 + 9); o.x = o.tx = s.x; o.y = o.ty = s.y; o.home = homeOf(o.w); o.sleep = false; });
        const [ex, ey] = KMODE ? ENTRY() : [HOME.x + 2, HOME.y + 1]; U.x = U.tx = ex; U.y = U.ty = ey; }, 20000); },
    setWarga(list) { list.forEach(w => addWalker(w, false)); houseSpots(P.walkers.length); },
    add(w) { const o = addWalker(w, true); houseSpots(P.walkers.length); P.hl.add(w.no); setTimeout(() => P.hl.delete(w.no), 15000); return o; },
    focus(no) { const o = P.byNo.get(no); if (!o) return false; P.sel = o; P.follow = o; const z0 = cam.z, x0 = cam.x, y0 = cam.y, z1 = Math.max(5, z0), t0 = performance.now();
      const go = ts => { const k = Math.min(1, (ts - t0) / 700), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; cam.x = x0 + (o.x - x0) * e; cam.y = y0 + (o.y - 8 - y0) * e; cam.z = z0 + (z1 - z0) * e; clampCam(); if (k < 1) requestAnimationFrame(go); }; requestAnimationFrame(go); return true; },
    zoom(f) { if (!cv) return; CAMV.ax = cv.width / dpr / 2; CAMV.ay = cv.height / dpr / 2; CAMV.tz = Math.max(zMin(), Math.min(zMax, (CAMV.tz || cam.z) * f)); },
    reset() { const kc = SMODE ? [GATE().x + 10, GATE().y - 50] : [ISL.cx, ISL.cy]; cam = { x: kc[0], y: kc[1], z: Math.max(zMin(), SMODE ? 2.2 : 2.6) }; clampCam(); P.sel = null; },
    showAll(v) { P.showAll = v; },
    onPick(f) { P.onPick = f; },
    onSawit(f) { P.onSawit = f; },
    onTavern(f) { P.onTavern = f; },
    screenOf(x, y) { if (!cv) return [0, 0]; const [a, b] = toScreen(x, y); return [a / dpr, b / dpr]; },
    resize() { resize(); },
    udinScreen() { const [x, y] = toScreen(U.x, U.y - 7); return [x / dpr, y / dpr]; },
    isNight() { return nightK(window.SIKEPO_FORCE_HOUR ?? wibHour()) > 0.6; },
    cuaca: () => WX.name,
    fantasy: () => FMODE,
    redraw() { if (g) { applyLayout(); if (window.FANT3) LIGHTS = []; g.clearRect(0, 0, WW, WH); drawBg(); } },
    cam(x, y, z) { cam.x = x; cam.y = y; cam.z = z; clampCam(); },
    setTents(n) { if (!window.FANT3 || FANT3.tents() === (n | 0)) return; FANT3.setTents(n); if (FMODE && g) { g.clearRect(0, 0, WW, WH); drawBg(); } },
    wib: wibHour
  };
})();
