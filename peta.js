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
  function houseSpots(n) { HS = []; n = Math.min(n, MAXRUMAH); for (let i = 0; i < n; i++) { const D2 = i >= CAP1, j = D2 ? i - CAP1 : i, cc = D2 ? kCol(j) - 11.4 : kCol(j), rr = VR(Math.floor(j / PERROW)); const [x, y] = kAt(cc, rr); const w = (P.walkers.slice().sort((p, q) => p.w.no - q.w.no)[i] || {}).w; HS.push({ c: cc, r: rr, d2: D2, x, y, nama: w ? String(w.nama || '').toUpperCase().slice(0, 16) : '', no: w ? w.no : 0 }); } const [hx, hy] = POSXY(); Object.assign(HOME, { x: hx - 2, y: hy - 1 }); if (typeof U !== 'undefined') { const g = GATE(); const [ux, uy] = kAt(5, VEND() + 3.0); U.x = U.tx = ux; U.y = U.ty = uy; } }
  const CAP1 = 80, ROWS = () => Math.max(1, Math.ceil(Math.min(HS.length, CAP1) / PERROW)), ROWS2 = () => Math.ceil(Math.max(0, HS.length - CAP1) / PERROW), MAXRUMAH = 120, PERRUMAH = 10;
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
  function fitSB() { if (!SMODE || !HS) return; const VE = VEND() + 6, P4 = [kAt(-45, -7), kAt(65, -7), kAt(65, 45), kAt(-45, 45)]; for (const h of HS) P4.push(kAt(h.c - 2, h.r - 2), kAt(h.c + 2, h.r + 2)); SB.x0 = Math.min(...P4.map(q => q[0])); SB.x1 = Math.max(...P4.map(q => q[0])); SB.y0 = Math.min(...P4.map(q => q[1])); SB.y1 = Math.max(...P4.map(q => q[1])); }
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
  // mobil warna-warni digambar kode (isometrik, sejajar sumbu jalan)
  const CARCOL = ['#e8453c', '#2f7de1', '#f2c230', '#2fae5f', '#f2f2f2', '#9b59d0', '#ff8a2a', '#3a3f48', '#1fb5b0'];
  function shade(h, k) { const n = parseInt(h.slice(1), 16), f = x => Math.max(0, Math.min(255, Math.round(x * k))); return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')'; }
  function isoCar(cx, a, b, axisV, col, z, kind) { z *= 0.72;
    const L = kind === 'truk' ? 0.62 : kind === 'motor' ? 0.22 : kind === 'angkot' ? 0.46 : 0.4, Wd = kind === 'motor' ? 0.07 : 0.2, H = (kind === 'truk' ? 14 : kind === 'angkot' ? 11 : kind === 'motor' ? 7 : 8) * z;
    const ax = axisV ? [KV[0], KV[1]] : [KU[0], KU[1]], px = axisV ? [KU[0], KU[1]] : [KV[0], KV[1]], s_ = z;
    const P = (u, w, h) => [a + (ax[0] * u + px[0] * w) * s_, b + (ax[1] * u + px[1] * w) * s_ - h];
    const box = (u0, u1, w0, w1, h0, h1, c) => { const T = [P(u0, w0, h1), P(u1, w0, h1), P(u1, w1, h1), P(u0, w1, h1)], S1 = [P(u0, w1, h0), P(u1, w1, h0), P(u1, w1, h1), P(u0, w1, h1)], S2 = [P(u1, w0, h0), P(u1, w1, h0), P(u1, w1, h1), P(u1, w0, h1)], S3 = [P(u0, w0, h0), P(u0, w1, h0), P(u0, w1, h1), P(u0, w0, h1)], S4 = [P(u0, w0, h0), P(u1, w0, h0), P(u1, w0, h1), P(u0, w0, h1)];
      const f = (Q, cl) => { cx.fillStyle = cl; cx.beginPath(); Q.forEach(([x, y], i) => i ? cx.lineTo(x, y) : cx.moveTo(x, y)); cx.closePath(); cx.fill(); };
      const vis = [[S1, py => py], [S2], [S3], [S4]]; const cen = Q => Q.reduce((t, q) => t + q[1], 0); [S1, S2, S3, S4].sort((p1, p2) => cen(p1) - cen(p2)).slice(2).forEach((Q, i) => f(Q, shade(c, i ? 0.62 : 0.78))); f(T, c); };
    cx.fillStyle = 'rgba(0,0,0,0.22)'; cx.beginPath(); [P(-L / 2 - 0.03, -Wd / 2 - 0.03, 0), P(L / 2 + 0.03, -Wd / 2 - 0.03, 0), P(L / 2 + 0.03, Wd / 2 + 0.03, 0), P(-L / 2 - 0.03, Wd / 2 + 0.03, 0)].forEach(([x, y], i) => i ? cx.lineTo(x, y) : cx.moveTo(x, y)); cx.fill();
    if (kind === 'motor') { box(-L / 2, L / 2, -Wd / 2, Wd / 2, 1 * z, 3 * z, '#2a2e36'); box(-0.05, 0.06, -0.05, 0.05, 3 * z, 7 * z, col); box(-0.04, 0.05, -0.04, 0.04, 7 * z, 8.5 * z, '#1c1c24'); return; }
    box(-L / 2, L / 2, -Wd / 2, Wd / 2, 0.8 * z, H * 0.55, col);
    if (kind === 'truk') { box(-L / 2, L * 0.15, -Wd / 2, Wd / 2, H * 0.55, H, '#f2f2f2'); box(L * 0.18, L / 2, -Wd / 2 * 0.9, Wd / 2 * 0.9, H * 0.55, H * 0.85, '#9fd0f0'); }
    else if (kind === 'pickup') { box(L * 0.0, L / 2 - 0.02, -Wd / 2 * 0.85, Wd / 2 * 0.85, H * 0.55, H, '#9fd0f0'); box(L * 0.05, L / 2 - 0.06, -Wd / 2 * 0.85, Wd / 2 * 0.85, H, H + 0.6 * z, col); box(-L / 2 + 0.03, -0.02, -Wd / 2 * 0.7, Wd / 2 * 0.7, H * 0.55, H * 0.75, '#c9a66a'); }
    else { box(-L / 2 + (kind === 'angkot' ? 0.03 : 0.08), L / 2 - 0.08, -Wd / 2 * 0.85, Wd / 2 * 0.85, H * 0.55, H, '#9fd0f0'); box(-L / 2 + (kind === 'angkot' ? 0.03 : 0.1), L / 2 - 0.11, -Wd / 2 * 0.85, Wd / 2 * 0.85, H, H + 0.6 * z, col); }
  }
  function drawWalker(c, o, t) {
    if (SMODE && !(window.SIKEPO_ONLINE && window.SIKEPO_ONLINE.has(o.w.no)) && P.sel !== o && !(P.hl && P.hl.has(o.w.no))) return;   // hanya warga online yang tampil
    const z = cam.z * dpr, [sx, sy] = toScreen(o.x, o.y), s = Math.max(1, Math.round(z));
    if (sx < -20 * s || sy < -30 * s || sx > cv.width + 20 * s || sy > cv.height + 20 * s) return;
    const r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(sx + x * s), Math.round(sy + y * s), w * s, h * s); };
    if (SMODE) { const AVM = { COWOK1: 9, COWOK2: 1, COWOK3: 6, CEWEK1: 5, CEWEK2: 2, CEWEK3: 3 }, MIS = [4, 0, 7, 8], ai = AVM[o.w.av] ?? MIS[Math.abs(o.w.no | 0) % 4], im = window.WSPR ? WSPR.get(o.w, Math.floor(t * 7 + o.ph) & 3, o.moving ? 'jalan' : 'idle') : simg('w/w' + ai); if (!window.WSPR && (!im.complete || !im.naturalWidth)) return; const hh = 11 * z, ww = (im.naturalWidth || im.width) / (im.naturalHeight || im.height) * hh * 0.8, b = (o.moving ? Math.abs(Math.sin(t * 9 + o.ph)) * z * 0.6 : 0) + (o.jumpT && t < o.jumpT ? Math.abs(Math.sin((o.jumpT - t) * 12)) * z * 2.2 : 0);
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
      zq(-1.5, -4.6, 11.5, -1.0, 'rgba(240,200,60,A)', ''); zq(-1.0, V[V.length - 1] + 0.25, 11.0, VE + 1.4, 'rgba(80,150,255,A)', 'PUSAT KOTA');
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
        V2.forEach(v => RQ.push([-12.24, v - 0.14, -0.7, v + 0.14, -12.24, v - 0.105, -0.7, v + 0.105])); RQ.push([-6.59, V2[0] - 0.14, -6.21, v2e + 0.14, -6.55, V2[0] - 0.14, -6.25, v2e + 0.14]); RQ.push([-12.24, V2[0] - 0.14, -11.96, v2e + 0.14, -12.21, V2[0] - 0.14, -11.99, v2e + 0.14]); } }
      { // JALAN UTAMA dari gerbang lurus sampai tepi peta
        RQ.push([4.81, 0.11, 5.19, 45, 4.85, 0.11, 5.15, 45]); }
      { const vA = V[0], vB = Math.max(V[V.length - 1], (typeof ROWS2 === 'function' && ROWS2() > 0) ? Math.floor((ROWS2() + 1) / 2) * 2.7 + 0.25 : 0); RQ.push([-0.84, vA - 0.14, -0.56, vB + 0.14, -0.81, vA - 0.14, -0.59, vB + 0.14]); RQ.push([10.56, vA - 0.14, 10.84, V[V.length - 1] + 0.14, 10.59, vA - 0.14, 10.81, V[V.length - 1] + 0.14]); }
      { const R = (c0, v0, c1, v1, h) => RQ.push(h ? [c0, v0 - 0.14, c1, v0 + 0.14, c0, v0 - 0.105, c1, v0 + 0.105] : [c0 - 0.14, v0, c0 + 0.14, v1, c0 - 0.105, v0, c0 + 0.105, v1]);
         for (const c of [10.7, 16.4, 22.1]) R(c, 0.11, 0, 11.19, 0); for (const v of [0.25, 5.65, 8.35, 11.05]) R(10.56, v, 22.24, 0, 1); R(16.4, 3.0, 16.8, 0, 1); R(10.84, 3.48, 11.35, 0, 1); }
      RQ.forEach(q => quad(q[0], q[1], q[2], q[3], '#9a9a9a')); RQ.forEach(q => quad(q[4], q[5], q[6], q[7], '#3f4148'));
      cx.strokeStyle = '#f2f2f2'; cx.lineWidth = Math.max(1, z * 0.7); cx.setLineDash([z * 5, z * 5]); cx.beginPath();
      RQ.forEach(q => { const hor = (q[6] - q[4]) > (q[7] - q[5]); if (hor) { const v = (q[5] + q[7]) / 2, [a1, b1] = toScreen(...kAt(q[4] + 0.1, v)), [e1, f1] = toScreen(...kAt(q[6] - 0.1, v)); cx.moveTo(a1, b1); cx.lineTo(e1, f1); } else { const c = (q[4] + q[6]) / 2, [a1, b1] = toScreen(...kAt(c, q[5] + 0.1)), [e1, f1] = toScreen(...kAt(c, q[7] - 0.1)); cx.moveTo(a1, b1); cx.lineTo(e1, f1); } });
      cx.stroke(); cx.setLineDash([]);
      for (const v of V) for (let k = 0; k < 5; k++) { const cz = 4.72 + k * 0.13; quad(cz, v + 0.16, cz + 0.06, v + 0.38, '#f2f2f2'); quad(cz, v - 0.38, cz + 0.06, v - 0.16, '#f2f2f2'); }
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
      { const LP = [], RN = roadNodes(); for (const v of RN) for (let c = 0.2; c < 10.4; c += 1.6) if (!(c > 4.3 && c < 5.7)) LP.push([c, v + 0.24]); for (let v = 0; v < (RN[RN.length - 1] || 0) + 3; v += 2) LP.push([5.3, v + 1.1]);
        const nt = nightK(window.SIKEPO_FORCE_HOUR ?? wibHour());
        LP.forEach(([c, v]) => { const [x, y] = kAt(c, v); items.push([y, () => { const [a, b] = toScreen(x, y), u = z; cx.fillStyle = '#3a3f48'; cx.fillRect(a - 0.6 * u, b - 19 * u, 1.2 * u, 19 * u); cx.fillRect(a, b - 19 * u, 4 * u, 1 * u); cx.fillStyle = '#2a2e36'; cx.fillRect(a + 2.5 * u, b - 20 * u, 4 * u, 2 * u); cx.fillStyle = nt > 0.4 ? '#fff3a0' : '#ffe58a'; cx.fillRect(a + 3 * u, b - 18.4 * u, 3 * u, 1 * u);
          if (nt > 0.4) { const g = cx.createRadialGradient(a + 4.5 * u, b - 17 * u, 0, a + 4.5 * u, b - 17 * u, 22 * u); g.addColorStop(0, 'rgba(255,220,120,' + 0.35 * nt + ')'); g.addColorStop(1, 'rgba(255,220,120,0)'); cx.fillStyle = g; cx.fillRect(a - 20 * u, b - 40 * u, 50 * u, 50 * u); } }]); }); }
      { // KAWASAN IBADAH 6 agama + MENARA UDIN
  const quad = (c0, r0, c1, r1, fill, line, lw) => { const P = [kAt(c0, r0), kAt(c1, r0), kAt(c1, r1), kAt(c0, r1)].map(q => toScreen(...q)); cx.beginPath(); P.forEach(([a, b], i) => i ? cx.lineTo(a, b) : cx.moveTo(a, b)); cx.closePath(); if (fill) { cx.fillStyle = fill; cx.fill(); } if (line) { cx.strokeStyle = line; cx.lineWidth = Math.max(1, z * (lw || 0.6)); cx.stroke(); } };
        const IBN = ['masjid', 'gereja', 'katedral', 'pura', 'vihara', 'klenteng'], IM = window.__IB || (window.__IB = Object.fromEntries([...IBN, 'menara'].map(n => [n, Object.assign(new Image(), { src: 'img/' + n + '.png' })])));
        const PC0 = 16.8, PV0 = 0.55, PC1 = 21.75, PV1 = 5.35, GV = 3.0;
        const TX = window.__TX || (window.__TX = Object.fromEntries(['alun', 'parkir', 'taman', 'pelataran'].map(n => [n, Object.assign(new Image(), { src: 'img/t/' + n + '.jpg' })]))), tex = (n, c0, v0, c1, v1) => { const im = TX[n]; if (!im.complete || !im.naturalWidth) { quad(c0, v0, c1, v1, '#a9d878'); return; } const big = n === 'alun' || n === 'taman', nV = Math.max(1, Math.round((v1 - v0) / (big ? 2.3 : 1.15))), Lv = (v1 - v0) / nV, nC = Math.max(1, Math.round((c1 - c0) / (2.32 * Lv))), Lc = (c1 - c0) / nC, w = im.naturalWidth, h = im.naturalHeight; cx.save(); cx.beginPath(); { const Q = [kAt(c0, v0), kAt(c1, v0), kAt(c1, v1), kAt(c0, v1)].map(q => toScreen(...q)); Q.forEach(([a, b], i) => i ? cx.lineTo(a, b) : cx.moveTo(a, b)); cx.closePath(); cx.clip(); } cx.imageSmoothingEnabled = true; for (let i = 0; i < nC; i++) for (let j = 0; j < nV; j++) { const a0 = c0 + i * Lc, b0 = v0 + j * Lv, [x0, y0] = toScreen(...kAt(a0, b0)), [x1, y1] = toScreen(...kAt(a0 + Lc, b0)), [x3, y3] = toScreen(...kAt(a0, b0 + Lv)); cx.setTransform((x1 - x0) / w, (y1 - y0) / w, (x3 - x0) / h, (y3 - y0) / h, x0, y0); cx.drawImage(im, 0, 0, w + 1, h + 1); } cx.restore(); cx.imageSmoothingEnabled = false; }; quad(PC0, PV0, PC1, PV1, '#7fbf4f'); tex('alun', PC0 + 0.15, PV0 + 0.15, PC1 - 0.15, PV1 - 0.15);
        for (let k = 0; k < 0; k++) { const cc = PC0 + 0.3 + (k * 0.731 % 1) * (PC1 - PC0 - 0.6), vv = PV0 + 0.25 + (k * 0.457 % 1) * (PV1 - PV0 - 0.5); if (Math.abs(vv - GV) < 0.25) continue; const [a, b] = toScreen(...kAt(cc, vv)); cx.fillStyle = ['#ff6b8a', '#ffd84a', '#ffffff', '#c86bff', '#ff9a3c'][k % 5]; cx.beginPath(); cx.ellipse(a, b, 1.8 * z, 1 * z, 0, 0, 7); cx.fill(); }
        const FE = [[PC0, PV0, PC1, PV0], [PC1, PV0, PC1, PV1], [PC1, PV1, PC0, PV1], [PC0, PV1, PC0, GV + 0.25], [PC0, GV - 0.25, PC0, PV0]];
        for (const [ca, va, cb, vb] of FE) { const n = Math.max(1, Math.round(Math.hypot(cb - ca, vb - va) / 0.22)); let pv = null;
          for (let k = 0; k <= n; k++) { const [x, y] = toScreen(...kAt(ca + (cb - ca) * k / n, va + (vb - va) * k / n)), fz = z * dpr;
            if (pv) { cx.strokeStyle = '#8a5a2a'; cx.lineWidth = Math.max(1, 1.6 * fz / dpr); cx.beginPath(); cx.moveTo(pv[0], pv[1] - 6.5 * fz / dpr); cx.lineTo(x, y - 6.5 * fz / dpr); cx.moveTo(pv[0], pv[1] - 3 * fz / dpr); cx.lineTo(x, y - 3 * fz / dpr); cx.stroke(); }
            cx.fillStyle = '#f4ead2'; cx.fillRect(x - 1.2 * z, y - 10 * z, 2.4 * z, 10 * z); pv = [x, y]; } }
        IBN.forEach((n, k) => { const [x, y] = kAt(PC0 + 0.8 + (k % 3) * 1.65, k < 3 ? 1.7 : 4.25); items.push([y, () => { const im = IM[n]; if (!im.complete || !im.naturalWidth) return; const hh = 50 * z, ww = im.naturalWidth / im.naturalHeight * hh, [a, b] = toScreen(x, y); cx.imageSmoothingEnabled = true; cx.drawImage(im, Math.round(a - ww / 2), Math.round(b - hh * 0.84), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); });
        { // KOMPLEKS RS: pelataran, parkir, mobil, ambulans
          const tex_ = (n, c0, v0, c1, v1) => { const im = TX[n]; if (!im.complete || !im.naturalWidth) { quad(c0, v0, c1, v1, '#a9d878'); return; } const big = n === 'alun' || n === 'taman', nV = Math.max(1, Math.round((v1 - v0) / (big ? 2.3 : 1.15))), Lv = (v1 - v0) / nV, nC = Math.max(1, Math.round((c1 - c0) / (2.32 * Lv))), Lc = (c1 - c0) / nC, w = im.naturalWidth, h = im.naturalHeight; cx.save(); cx.beginPath(); { const Q = [kAt(c0, v0), kAt(c1, v0), kAt(c1, v1), kAt(c0, v1)].map(q => toScreen(...q)); Q.forEach(([a, b], i) => i ? cx.lineTo(a, b) : cx.moveTo(a, b)); cx.closePath(); cx.clip(); } cx.imageSmoothingEnabled = true; for (let i = 0; i < nC; i++) for (let j = 0; j < nV; j++) { const a0 = c0 + i * Lc, b0 = v0 + j * Lv, [x0, y0] = toScreen(...kAt(a0, b0)), [x1, y1] = toScreen(...kAt(a0 + Lc, b0)), [x3, y3] = toScreen(...kAt(a0, b0 + Lv)); cx.setTransform((x1 - x0) / w, (y1 - y0) / w, (x3 - x0) / h, (y3 - y0) / h, x0, y0); cx.drawImage(im, 0, 0, w + 1, h + 1); } cx.restore(); cx.imageSmoothingEnabled = false; }; tex('pelataran', 10.9, 0.45, 16.2, 3.55); tex('parkir', 10.9, 3.55, 16.2, 5.45);

          
          const CC = ['#d8302a', '#2a6fd8', '#f2f2f2', '#2aa84a', '#e0a020', '#555', '#8a2ad8'];
          for (let k = 0; k < 20; k++) { if ((k * 7) % 5 === 0) continue; const c = 11.3 + (k % 10) * 0.48, v = k < 10 ? 3.95 : 5.05, col = CC[(k * 3) % 7], [x, y] = kAt(c, v); items.push([y, () => { const [a1, b1] = toScreen(x, y), u = z; cx.fillStyle = 'rgba(0,0,0,0.25)'; cx.fillRect(a1 - 4 * u, b1 - 1 * u, 8 * u, 2 * u); isoCar(cx, a1, b1, true, CARCOL[(Math.abs(Math.round(x * 7 + y * 3)) % CARCOL.length)], u, (Math.abs(Math.round(x + y)) % 5) ? 'car' : 'pickup'); cx.fillStyle = col; cx.fillRect(a1 - 2.5 * u, b1 - 6.6 * u, 5.5 * u, 0.8 * u); cx.fillStyle = '#1c1c24'; cx.fillRect(a1 - 3 * u, b1 - 0.8 * u, 1.5 * u, 1 * u); cx.fillRect(a1 + 1.5 * u, b1 - 0.8 * u, 1.5 * u, 1 * u); }]); }
          const AM = IM.amb || (IM.amb = Object.assign(new Image(), { src: 'img/ambulans.png' })), fl = Math.floor(performance.now() / 300) % 2;
          for (const [c, v] of [[11.75, 2.9], [11.75, 2.45]]) { const [x, y] = kAt(c, v); items.push([y, () => { if (!AM.complete || !AM.naturalWidth) return; const hh = 12 * z, ww = AM.naturalWidth / AM.naturalHeight * hh, [a1, b1] = toScreen(x, y); cx.imageSmoothingEnabled = true; cx.drawImage(AM, Math.round(a1 - ww / 2), Math.round(b1 - hh * 0.85), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; if (fl && v > 2.6) { cx.fillStyle = 'rgba(255,60,60,0.8)'; cx.fillRect(a1 - ww * 0.25, b1 - hh * 0.95, 2 * z, 1.2 * z); } }]); }
          for (const [c, v] of [[11.4, 1.1], [11.4, 1.8], [14.7, 1.1], [14.7, 2.0], [14.7, 2.9], [14.7, 3.8], [12.4, 4.1], [13.4, 4.1]]) { const [x, y] = kAt(c, v), sd = Math.round(c * 7 + v * 3); items.push([y, () => { const TR = window.__TR; if (!TR) return; const im = TR[sd % TR.length]; if (!im || !im.complete) return; const th = 20 * z, tw = im.naturalWidth / im.naturalHeight * th, [a1, b1] = toScreen(x, y); cx.drawImage(im, Math.round(a1 - tw / 2), Math.round(b1 - th * 0.95), Math.round(tw), Math.round(th)); }]); } }
        { const [x, y] = kAt(12.9, 2.45); items.push([y, () => { const im = IM.rs || (IM.rs = Object.assign(new Image(), { src: 'img/rs.png' })); if (!im.complete || !im.naturalWidth) return; const hh = 95 * z, ww = im.naturalWidth / im.naturalHeight * hh, [a, b] = toScreen(x, y); cx.imageSmoothingEnabled = true; cx.drawImage(im, Math.round(a - ww / 2), Math.round(b - hh * 0.86), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); }
        { const RN = []; const ph = 0; for (const v of [RN[RN.length - 1], RN[RN.length - 2]].filter(v => v != null)) for (const [dc, dv, o2] of [[-0.3, -0.3, 0], [0.3, 0.3, 1]]) { const [x, y] = kAt(5 + dc, v + dv); items.push([y, () => { const [a, b] = toScreen(x, y), u = z / dpr * dpr; cx.fillStyle = '#2a2e36'; cx.fillRect(a - 0.8 * u, b - 24 * u, 1.6 * u, 24 * u); cx.fillStyle = '#1c1c24'; cx.fillRect(a - 2.6 * u, b - 33 * u, 5.2 * u, 10 * u); const st = (ph + o2) % 3; ['#ff3030', '#ffc020', '#30e060'].forEach((c, k) => { cx.fillStyle = st === k ? c : '#3a3a3a'; cx.beginPath(); cx.arc(a, b - 31 * u + k * 3 * u, 1.1 * u, 0, 7); cx.fill(); }); }]); } }
        const plaza = (c0, v0, c1, v1) => { quad(c0, v0, c1, v1, '#7fbf4f'); quad(c0 + 0.18, v0 + 0.18, c1 - 0.18, v1 - 0.18, '#e2d6b8'); cx.strokeStyle = 'rgba(160,140,110,0.55)'; cx.lineWidth = Math.max(1, z * 0.3); cx.beginPath();
          for (let c = c0 + 0.18; c <= c1 - 0.17; c += 0.35) { const [a1, b1] = toScreen(...kAt(c, v0 + 0.18)), [e1, f1] = toScreen(...kAt(c, v1 - 0.18)); cx.moveTo(a1, b1); cx.lineTo(e1, f1); }
          for (let v = v0 + 0.18; v <= v1 - 0.17; v += 0.35) { const [a1, b1] = toScreen(...kAt(c0 + 0.18, v)), [e1, f1] = toScreen(...kAt(c1 - 0.18, v)); cx.moveTo(a1, b1); cx.lineTo(e1, f1); } cx.stroke();
          for (let k = 0; k < 24; k++) { const t2 = k / 24, per = 2 * (c1 - c0 + v1 - v0), dd = t2 * per; let c, v; if (dd < c1 - c0) { c = c0 + dd; v = v0 + 0.09; } else if (dd < c1 - c0 + v1 - v0) { c = c1 - 0.09; v = v0 + dd - (c1 - c0); } else if (dd < 2 * (c1 - c0) + v1 - v0) { c = c1 - (dd - (c1 - c0 + v1 - v0)); v = v1 - 0.09; } else { c = c0 + 0.09; v = v1 - (dd - 2 * (c1 - c0) - (v1 - v0)); }
            const [a1, b1] = toScreen(...kAt(c, v)); cx.fillStyle = ['#ff6b8a', '#ffd84a', '#ffffff', '#c86bff'][k % 4]; cx.beginPath(); cx.ellipse(a1, b1, 1.4 * z, 0.8 * z, 0, 0, 7); cx.fill(); } };
        const tex_ = (n, c0, v0, c1, v1) => { const im = TX[n]; if (!im.complete || !im.naturalWidth) { quad(c0, v0, c1, v1, '#a9d878'); return; } const big = n === 'alun' || n === 'taman', nV = Math.max(1, Math.round((v1 - v0) / (big ? 2.3 : 1.15))), Lv = (v1 - v0) / nV, nC = Math.max(1, Math.round((c1 - c0) / (2.32 * Lv))), Lc = (c1 - c0) / nC, w = im.naturalWidth, h = im.naturalHeight; cx.save(); cx.beginPath(); { const Q = [kAt(c0, v0), kAt(c1, v0), kAt(c1, v1), kAt(c0, v1)].map(q => toScreen(...q)); Q.forEach(([a, b], i) => i ? cx.lineTo(a, b) : cx.moveTo(a, b)); cx.closePath(); cx.clip(); } cx.imageSmoothingEnabled = true; for (let i = 0; i < nC; i++) for (let j = 0; j < nV; j++) { const a0 = c0 + i * Lc, b0 = v0 + j * Lv, [x0, y0] = toScreen(...kAt(a0, b0)), [x1, y1] = toScreen(...kAt(a0 + Lc, b0)), [x3, y3] = toScreen(...kAt(a0, b0 + Lv)); cx.setTransform((x1 - x0) / w, (y1 - y0) / w, (x3 - x0) / h, (y3 - y0) / h, x0, y0); cx.drawImage(im, 0, 0, w + 1, h + 1); } cx.restore(); cx.imageSmoothingEnabled = false; }; tex('alun', 10.9, 5.85, 16.2, 8.15); { const [fx, fy] = toScreen(...kAt(13.55, 7.0)); cx.fillStyle = 'rgba(255,255,255,0.85)'; const jt = performance.now() / 200; for (let k = 0; k < 8; k++) cx.fillRect(fx + Math.cos(jt + k) * 3 * z, fy - 2 * z - Math.abs(Math.sin(jt + k)) * 5 * z, z, z); }
        tex('pelataran', 10.9, 8.55, 13.9, 10.85); tex('parkir', 13.9, 8.55, 16.2, 10.85); tex('parkir', 16.6, 5.85, 21.9, 8.15);
        for (let k = 0; k < 28; k++) { if (k % 5 === 2) continue; const c = 17.06 + (k % 14) * 0.32, v = k < 14 ? 6.25 : 7.75, col = ['#f2f2f2', '#2a3a8e', '#d8302a', '#f2f2f2', '#2a3a8e'][k % 5], [x, y] = kAt(c, v); if (col === '#2a3a8e') { items.push([y, () => { const im = window.__VI && window.__VI.polisi; if (!im || !im.complete) return; const hh = 11 * z, ww = im.naturalWidth / im.naturalHeight * hh, [a1, b1] = toScreen(x, y); cx.imageSmoothingEnabled = true; cx.drawImage(im, a1 - ww / 2, b1 - hh * 0.85, ww, hh); cx.imageSmoothingEnabled = false; }]); continue; } items.push([y, () => { const [a1, b1] = toScreen(x, y), u = z; isoCar(cx, a1, b1, true, CARCOL[(Math.abs(Math.round(x * 7 + y * 3)) % CARCOL.length)], u, (Math.abs(Math.round(x + y)) % 5) ? 'car' : 'pickup'); }]); } tex('taman', 16.6, 8.55, 21.9, 10.85);
        for (const [n, c, v, h] of [['mart', 12.4, 9.9, 46], ['polisi', 18.0, 7.15, 58], ['damkar', 20.4, 7.15, 72]]) { const im = IM[n] || (IM[n] = Object.assign(new Image(), { src: 'img/' + n + '.png' })), [x, y] = kAt(c, v); items.push([y, () => { if (!im.complete || !im.naturalWidth) return; const hh = h * z, ww = im.naturalWidth / im.naturalHeight * hh, [a, b] = toScreen(x, y); cx.imageSmoothingEnabled = true; cx.drawImage(im, Math.round(a - ww / 2), Math.round(b - hh * 0.86), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); }
        { const MB = IM.mobil || (IM.mobil = Object.assign(new Image(), { src: 'img/mobil.png' })), [x, y] = kAt(19.3, 8.0); items.push([y, () => { if (!MB.complete || !MB.naturalWidth) return; const hh = 18 * z, ww = MB.naturalWidth / MB.naturalHeight * hh, [a, b] = toScreen(x, y); cx.imageSmoothingEnabled = true; cx.drawImage(MB, Math.round(a - ww / 2), Math.round(b - hh * 0.85), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); }
        for (let k = 0; k < 14; k++) { const c = 14.1 + (k % 7) * 0.3, v = k < 7 ? 9.1 : 10.3, col = ['#d8302a', '#2a6fd8', '#f2f2f2', '#2aa84a', '#e0a020'][k % 5], [x, y] = kAt(c, v); if (k % 4 === 3) continue; items.push([y, () => { const [a1, b1] = toScreen(x, y), u = z; isoCar(cx, a1, b1, true, CARCOL[(Math.abs(Math.round(x * 7 + y * 3)) % CARCOL.length)], u, (Math.abs(Math.round(x + y)) % 5) ? 'car' : 'pickup'); }]); }
        for (const [c, v] of [[16.9, 8.9], [17.6, 10.5], [21.5, 8.9], [21.2, 10.5], [17.5, 9.3], [20.9, 9.6], [11.2, 6.1], [11.2, 7.9], [12.2, 6.1], [16.0, 6.1]]) { const [x, y] = kAt(c, v), sd = Math.round(c * 7 + v * 3); items.push([y, () => { const TR = window.__TR; if (!TR) return; const im = TR[sd % TR.length]; if (!im || !im.complete) return; const th = 20 * z, tw = im.naturalWidth / im.naturalHeight * th, [a1, b1] = toScreen(x, y); cx.drawImage(im, Math.round(a1 - tw / 2), Math.round(b1 - th * 0.95), Math.round(tw), Math.round(th)); }]); }
        { const [x, y] = kAt(12.7, 7.4); items.push([y, () => { const im = IM.menara; if (!im.complete || !im.naturalWidth) return; const hh = 120 * z, ww = im.naturalWidth / im.naturalHeight * hh, [a, b] = toScreen(x, y); cx.imageSmoothingEnabled = true; cx.drawImage(im, Math.round(a - ww / 2), Math.round(b - hh + 14 * z), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); } }
      if (window.SIKEPO_WARUNG !== false && WI.complete && WI.naturalWidth) { const [px, py] = POSXY(), wx = px - 2 * KU[0] - 0.1 * KV[0], wy = py - 2 * KU[1] - 0.1 * KV[1]; items.push([wy, () => { const hh = 40 * z, ww = WI.naturalWidth / WI.naturalHeight * hh, [a, b] = toScreen(wx, wy); cx.imageSmoothingEnabled = true; cx.drawImage(WI, Math.round(a - ww / 2), Math.round(b - hh * 0.85), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); }
      { const RR = ROWS(); for (let r = 0; r <= RR + 1; r += 2) { const v = Math.floor(r / 2) * 2.7 + 0.25; for (let c = 0.5; c < 11; c += 1) { if (c > 4 && c < 6) continue; for (const dv of [-0.45, 0.45]) { const [tx, ty] = kAt(c, v + dv), sd = c * 13 + v * 7 + dv * 5; items.push([ty, () => { const TR = window.__TR || (window.__TR = ['pohon1', 'pohon2', 'pohon3', 'pohon1', 'pohon2', 'kelapa', 'pisang', 'semak1', 'semak2'].map(n => Object.assign(new Image(), { src: 'img/px/' + n + '.png' }))), im = TR[Math.abs(Math.round(sd)) % TR.length]; if (!im.complete || !im.naturalWidth) return;
        const [a, b] = toScreen(tx, ty), hh = (im.src.includes('semak') ? 9 : 22) * z, ww = im.naturalWidth / im.naturalHeight * hh; cx.fillStyle = 'rgba(0,0,0,0.18)'; cx.beginPath(); cx.ellipse(a, b, ww * 0.32, ww * 0.12, 0, 0, 7); cx.fill(); cx.imageSmoothingEnabled = true; cx.drawImage(im, Math.round(a - ww / 2), Math.round(b - hh * 0.95), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); } } } }
      { const R2 = ROWS2(); for (let r = 0; r <= R2 + 1 && R2 > 0; r += 2) { const v = Math.floor(r / 2) * 2.7 + 0.25; for (let c = -11.9; c < -1; c += 1) { if (c > -7.4 && c < -5.4) continue; for (const dv of [-0.45, 0.45]) { const [tx, ty] = kAt(c, v + dv), sd = Math.abs(Math.round(c * 13 + v * 7 + dv * 5)); items.push([ty, () => { const TR = window.__TR; if (!TR) return; const im = TR[sd % TR.length]; if (!im.complete || !im.naturalWidth) return; const [a, b] = toScreen(tx, ty), hh = (im.src.includes('semak') ? 9 : 22) * z, ww = im.naturalWidth / im.naturalHeight * hh; cx.imageSmoothingEnabled = true; cx.drawImage(im, Math.round(a - ww / 2), Math.round(b - hh * 0.95), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); } } } }
      const gt = GATE(); if (GI.complete && GI.naturalWidth) items.push([gt.y, () => { const hh = 62 * z, ww = GI.naturalWidth / GI.naturalHeight * hh, [a, b] = toScreen(gt.x, gt.y); cx.imageSmoothingEnabled = true; cx.drawImage(GI, Math.round(a - ww * 0.46), Math.round(b - hh * 0.8), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]);
      { // LALU LINTAS: kendaraan hanya di jalan, berhenti saat lampu merah di perempatan
        const VI = window.__VI || (window.__VI = Object.fromEntries(['polisi', 'motorpolisi', 'merah', 'biru', 'angkot', 'pickup', 'truk', 'motor'].flatMap(n => [[n, Object.assign(new Image(), { src: 'img/v/' + n + '.png' })], [n + '_r', Object.assign(new Image(), { src: 'img/v/' + n + '_r.png' })]])));
        const RN = roadNodes(), V0 = RN[0], V1 = RN[Math.min(2, RN.length - 1)], V2 = RN[RN.length - 1];
        const ROUTES = [[[10.7, 0.25], [22.1, 0.25], [22.1, 11.05], [10.7, 11.05]], [[5, V0], [10.7, V0], [10.7, V1], [5, V1]], [[10.7, 5.65], [16.4, 5.65], [16.4, 11.05], [10.7, 11.05]], [[16.4, 0.25], [22.1, 0.25], [22.1, 8.35], [16.4, 8.35]], [[5, V1], [10.7, V1], [10.7, V2], [5, V2]]];
        const now = performance.now() / 1000, TS = window.__TS || (window.__TS = { last: now, cars: [] }), dt = Math.min(0.1, now - TS.last); TS.last = now;
        const LP = Math.floor(now / 6) % 2, LY = (now % 6) > 5;   // fase lampu: 0 = jalur sumbu c hijau, 1 = sumbu v hijau; detik ke-5 kuning
        window.__LAMPU = { LP, LY };
        const VN = ['merah', 'biru', 'angkot', 'pickup', 'motor', 'truk', 'merah', 'biru', 'motor', 'angkot'], nOff = Math.min(24, Math.max(4, Math.round((P.walkers.length - ((window.SIKEPO_ONLINE && window.SIKEPO_ONLINE.size) || 0)) / 6)));
        const want = [['polisi', 0], ['motorpolisi', 2]].concat(Array.from({ length: nOff }, (_, k) => [VN[k % 10], k % 5]));
        if (TS.cars.length !== want.length) { const RC = {}; want.forEach(w => RC[w[1]] = (RC[w[1]] || 0) + 1); const RI = {}; TS.cars = want.map(([n, ri]) => { const R = ROUTES[ri], per = R.reduce((a1, p0, k) => { const p1 = R[(k + 1) % R.length]; return a1 + Math.abs(p1[0] - p0[0]) + Math.abs(p1[1] - p0[1]); }, 0), idx = (RI[ri] = (RI[ri] || 0) + 1) - 1; return { n, ri, d: per * idx / RC[ri], sp: 1.2, sz: n === 'truk' ? 16 : n.includes('motor') ? 11 : 12 }; }); }
        TS.cars.forEach((car, ci) => { const R = ROUTES[car.ri], seg = R.map((p0, k) => { const p1 = R[(k + 1) % R.length]; return Math.abs(p1[0] - p0[0]) + Math.abs(p1[1] - p0[1]); }), per = seg.reduce((a1, b1) => a1 + b1, 0);
          let dd = car.d % per, k = 0; while (dd > seg[k]) { dd -= seg[k]; k = (k + 1) % R.length; } const p0 = R[k], p1 = R[(k + 1) % R.length], dc = Math.sign(p1[0] - p0[0]), dv = Math.sign(p1[1] - p0[1]);
          const toEnd = seg[k] - dd, axisGreen = (dc !== 0 ? 0 : 1) === LP && !LY, ahead = TS.cars.some(o => o !== car && o.ri === car.ri && ((o.d - car.d) % per + per) % per > 0 && ((o.d - car.d) % per + per) % per < 0.55);
          const stop = (!axisGreen && toEnd > 0.25 && toEnd < 0.6) || ahead; if (!stop) car.d = (car.d + car.sp * dt) % per;
          const q = dd / seg[k], c = p0[0] + (p1[0] - p0[0]) * q - dv * 0.08, v = p0[1] + (p1[1] - p0[1]) * q + dc * 0.08, [x, y] = kAt(c, v), im = VI[dv !== 0 ? car.n : car.n + '_r'];
          const POL = car.n.includes('polisi'); if (!POL) { car.col = car.col || CARCOL[ci % CARCOL.length]; items.push([y + 0.05, () => { const [a1, b1] = toScreen(x, y); isoCar(cx, a1, b1, dv !== 0, car.n === 'angkot' ? '#f2c230' : car.col, z, car.n); if (stop && !ahead) { cx.fillStyle = 'rgba(255,40,40,0.9)'; cx.fillRect(a1 - 2 * z, b1 - 3 * z, 4 * z, z); } }]); return; }
          items.push([y + 0.05, () => { if (!im || !im.complete || !im.naturalWidth) return; const hh = car.sz * z, ww = im.naturalWidth / im.naturalHeight * hh, [a1, b1] = toScreen(x, y); cx.fillStyle = 'rgba(0,0,0,0.2)'; cx.beginPath(); cx.ellipse(a1, b1, ww * 0.35, ww * 0.12, 0, 0, 7); cx.fill(); cx.imageSmoothingEnabled = true; cx.drawImage(im, Math.round(a1 - ww / 2), Math.round(b1 - hh * 0.85), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false;
            if (stop && !ahead) { cx.fillStyle = 'rgba(255,40,40,0.9)'; cx.fillRect(a1 - ww * 0.3, b1 - hh * 0.35, 2 * z, z); cx.fillRect(a1 + ww * 0.25, b1 - hh * 0.35, 2 * z, z); }
            if (car.n.includes('polisi')) { const bl = Math.floor(now * 5 + ci) % 2; cx.fillStyle = bl ? 'rgba(255,50,50,0.45)' : 'rgba(50,120,255,0.45)'; cx.beginPath(); cx.arc(a1, b1 - hh * 0.8, 4 * z, 0, 7); cx.fill(); } }]); });
        // LAMPU LALU LINTAS di tiap perempatan rute: 4 tiang, merah/kuning/hijau sesuai fase
        const JX = new Set(); ROUTES.forEach(R => R.forEach(p => JX.add(p[0] + ',' + p[1])));
        JX.forEach(key => { const [jc, jv] = key.split(',').map(Number); for (const [oc, ov, ax] of [[-0.3, -0.3, 1], [0.3, 0.3, 1], [0.3, -0.3, 0], [-0.3, 0.3, 0]]) { const [x, y] = kAt(jc + oc, jv + ov); items.push([y, () => { const [a1, b1] = toScreen(x, y), u = z, gr = ax === LP, col = gr ? (LY ? 1 : 2) : 0;
          cx.fillStyle = 'rgba(0,0,0,0.25)'; cx.fillRect(a1 - 2 * u, b1 - 0.5 * u, 4 * u, 1 * u); cx.fillStyle = '#2a2e36'; cx.fillRect(a1 - 0.7 * u, b1 - 22 * u, 1.4 * u, 22 * u); cx.fillStyle = '#ffd84a'; cx.fillRect(a1 - 3.1 * u, b1 - 32.1 * u, 6.2 * u, 11.2 * u); cx.fillStyle = '#1c1c24'; cx.fillRect(a1 - 2.6 * u, b1 - 31.6 * u, 5.2 * u, 10.2 * u);
          ['#ff3030', '#ffc020', '#30e060'].forEach((cl, k2) => { const on = col === k2; if (on) { cx.fillStyle = cl.replace(')', '') ; cx.globalAlpha = 0.35; cx.beginPath(); cx.arc(a1, b1 - 29.5 * u + k2 * 3.1 * u, 2.6 * u, 0, 7); cx.fill(); cx.globalAlpha = 1; } cx.fillStyle = on ? cl : '#3a3a3a'; cx.beginPath(); cx.arc(a1, b1 - 29.5 * u + k2 * 3.1 * u, 1.2 * u, 0, 7); cx.fill(); }); }]); } }); }
      { // KEJADIAN KOTA ala city-builder: kebakaran -> damkar datang, kemalingan -> polisi datang
        const now = performance.now() / 1000, EV = window.__EV || (window.__EV = { list: [], next: now + 8 });
        if (HS.length && now > EV.next && EV.list.length < 2) { const h = HS[Math.floor(Math.random() * HS.length)], fire = Math.random() < 0.5; EV.list.push({ h, fire, t0: now }); EV.next = now + 25 + Math.random() * 20;
          window.dispatchEvent(new CustomEvent('kabarKota', { detail: fire ? '🔥 Rumah ' + h.nama + ' kebakaran! Damkar meluncur!' : '🚨 Rumah ' + h.nama + ' kemalingan! Polisi meluncur!' })); }
        const VI = window.__VI || {}, DK = kAt(19.3, 8.0), PL = kAt(18.0, 7.6);
        EV.list = EV.list.filter(e => now - e.t0 < 26);
        for (const e of EV.list) { const lt = now - e.t0, h = e.h, src = e.fire ? DK : PL, arrive = 9, done = 18;
          if (e.fire && lt < done + 2) { const k = lt < done ? 1 : Math.max(0, 1 - (lt - done) / 2); items.push([h.y + 0.2, () => { const [a1, b1] = toScreen(h.x, h.y); for (let i = 0; i < 7; i++) { const fl = Math.sin(now * 12 + i * 1.7); cx.fillStyle = ['#ff3a1a', '#ff8a1a', '#ffd84a'][i % 3]; const fx = a1 + (i - 3) * 3.5 * z, fh = (8 + fl * 3) * z * k * (lt > arrive ? Math.max(0.2, 1 - (lt - arrive) / (done - arrive)) : 1); cx.fillRect(fx - 1.5 * z, b1 - 20 * z - fh, 3 * z, fh); }
            cx.fillStyle = 'rgba(60,60,60,0.45)'; for (let i = 0; i < 4; i++) { const sy = ((now * 10 + i * 9) % 36); cx.beginPath(); cx.arc(a1 + Math.sin(now + i) * 4 * z, b1 - 30 * z - sy * z, (3 + sy * 0.15) * z, 0, 7); cx.fill(); }
            if (lt > arrive && lt < done) { cx.strokeStyle = 'rgba(120,200,255,0.8)'; cx.lineWidth = 1.5 * z; cx.beginPath(); const [tx2, ty2] = toScreen(...e.pos); cx.moveTo(tx2, ty2 - 8 * z); cx.quadraticCurveTo((tx2 + a1) / 2, b1 - 40 * z, a1, b1 - 22 * z); cx.stroke(); } }]); }
          if (!e.fire && lt < done + 2) items.push([h.y + 0.2, () => { const [a1, b1] = toScreen(h.x, h.y); if (Math.floor(now * 3) % 2) { cx.fillStyle = '#c8302a'; cx.beginPath(); cx.arc(a1, b1 - 42 * z, 5 * z, 0, 7); cx.fill(); cx.fillStyle = '#fff'; cx.font = 'bold ' + Math.round(7 * z) + 'px sans-serif'; cx.textAlign = 'center'; cx.fillText('!', a1, b1 - 39.5 * z); cx.textAlign = 'left'; } if (lt < done - 3) { const tx = a1 + 10 * z + Math.min(lt, arrive) * 2 * z, ty = b1 + Math.min(lt, arrive) * 1 * z; cx.fillStyle = '#1c1c24'; cx.fillRect(tx - 1.5 * z, ty - 8 * z, 3 * z, 8 * z); cx.fillRect(tx - 2 * z, ty - 10 * z, 4 * z, 3 * z); } }]);
          const q = lt < arrive ? lt / arrive : lt < done ? 1 : Math.max(0, 1 - (lt - done) / 6), x = src[0] + (h.x - src[0]) * q, y = src[1] + (h.y - src[1]) * q; e.pos = [x, y];
          const im = VI[e.fire ? 'x' : (h.x > src[0] ? 'polisi_r' : 'polisi')]; const MB = window.__IB && window.__IB.mobil;
          items.push([y + 0.1, () => { const [a1, b1] = toScreen(x, y), I = e.fire ? MB : im; if (!I || !I.complete || !I.naturalWidth) return; const hh = (e.fire ? 17 : 13) * z, ww = I.naturalWidth / I.naturalHeight * hh; cx.save(); cx.translate(a1, 0); if (e.fire && h.x > src[0]) cx.scale(-1, 1); cx.imageSmoothingEnabled = true; cx.drawImage(I, -ww / 2, b1 - hh * 0.85, ww, hh); cx.restore(); cx.imageSmoothingEnabled = false; const bl = Math.floor(now * 5) % 2; cx.fillStyle = bl ? 'rgba(255,50,50,0.5)' : 'rgba(50,120,255,0.5)'; cx.beginPath(); cx.arc(a1, b1 - hh * 0.85, 5 * z, 0, 7); cx.fill(); }]); } }
      { // KERETA KELILING KOTA: rel melingkar + 4 stasiun, kereta berhenti tiap stasiun
        const quad = (c0, r0, c1, r1, fill, line, lw) => { const P = [kAt(c0, r0), kAt(c1, r0), kAt(c1, r1), kAt(c0, r1)].map(q => toScreen(...q)); cx.beginPath(); P.forEach(([a, b], i) => i ? cx.lineTo(a, b) : cx.moveTo(a, b)); cx.closePath(); if (fill) { cx.fillStyle = fill; cx.fill(); } if (line) { cx.strokeStyle = line; cx.lineWidth = Math.max(1, z * (lw || 0.6)); cx.stroke(); } };
        const LOOP = [[-14.6, -0.7], [23.4, -0.7], [23.4, 13.3], [-14.6, 13.3]], ST = [[17, -0.7, 0], [23.4, 5.6, 1], [8, 13.3, 2], [-14.6, 5, 3]];
        const seg = LOOP.map((p0, k) => { const p1 = LOOP[(k + 1) % 4]; return Math.abs(p1[0] - p0[0]) + Math.abs(p1[1] - p0[1]); }), per = seg.reduce((a1, b1) => a1 + b1, 0);
        const posOf = d => { d = ((d % per) + per) % per; let k = 0; while (d > seg[k]) { d -= seg[k]; k = (k + 1) % 4; } const p0 = LOOP[k], p1 = LOOP[(k + 1) % 4], q = d / seg[k]; return [p0[0] + (p1[0] - p0[0]) * q, p0[1] + (p1[1] - p0[1]) * q, k]; };
        const stD = ST.map(([c, v]) => { let d = 0; for (let k = 0; k < 4; k++) { const p0 = LOOP[k], p1 = LOOP[(k + 1) % 4]; const on = (p0[1] === p1[1] && v === p0[1] && (c - p0[0]) * (c - p1[0]) <= 0) || (p0[0] === p1[0] && c === p0[0] && (v - p0[1]) * (v - p1[1]) <= 0); if (on) return d + Math.abs(c - p0[0]) + Math.abs(v - p0[1]); d += seg[k]; } return 0; }).sort((a1, b1) => a1 - b1);
        // rel
        for (let k = 0; k < 4; k++) { const [c0, v0] = LOOP[k], [c1, v1] = LOOP[(k + 1) % 4], hor = v0 === v1, a0 = Math.min(hor ? c0 : v0, hor ? c1 : v1), a1 = Math.max(hor ? c0 : v0, hor ? c1 : v1);
          if (hor) quad(a0 - 0.2, v0 - 0.2, a1 + 0.2, v0 + 0.2, '#8a8478'); else quad(c0 - 0.2, a0 - 0.2, c0 + 0.2, a1 + 0.2, '#8a8478');
          for (let a = a0; a <= a1; a += 0.22) { if (hor) quad(a - 0.04, v0 - 0.16, a + 0.04, v0 + 0.16, '#5a3a1a'); else quad(c0 - 0.16, a - 0.04, c0 + 0.16, a + 0.04, '#5a3a1a'); }
          cx.strokeStyle = '#c8ccd4'; cx.lineWidth = Math.max(1, z * 0.6); cx.beginPath(); for (const o2 of [-0.08, 0.08]) { const P0 = toScreen(...kAt(hor ? a0 : c0 + o2, hor ? v0 + o2 : a0)), P1 = toScreen(...kAt(hor ? a1 : c0 + o2, hor ? v0 + o2 : a1)); cx.moveTo(...P0); cx.lineTo(...P1); } cx.stroke(); }
        // stasiun
        const IMR = window.__IMR || (window.__IMR = {}), SI = IMR.st || (IMR.st = Object.assign(new Image(), { src: 'img/stasiun.png' }));
        const SR = IMR.str || (IMR.str = Object.assign(new Image(), { src: 'img/stasiun_r.png' }));
        ST.forEach(([c, v]) => { const alongV = LOOP.some(([lc], k) => lc === c && LOOP[(k + 1) % 4][0] === c), sc0 = alongV ? c - 1.0 : c, sv0 = alongV ? v : v - 1.0, img = alongV ? SI : SR;
          if (alongV) { quad(c - 0.62, v - 1.3, c - 0.22, v + 1.3, '#b8b0a0', '#6a6458', 0.5); quad(c - 0.3, v - 1.3, c - 0.22, v + 1.3, '#f2d030'); } else { quad(c - 1.3, v - 0.62, c + 1.3, v - 0.22, '#b8b0a0', '#6a6458', 0.5); quad(c - 1.3, v - 0.3, c + 1.3, v - 0.22, '#f2d030'); }
          const [x, y] = kAt(sc0, sv0); items.push([y, () => { if (!img.complete || !img.naturalWidth) return; const hh = 56 * z, ww = img.naturalWidth / img.naturalHeight * hh, [a1, b1] = toScreen(x, y); cx.imageSmoothingEnabled = true; cx.drawImage(img, Math.round(a1 - ww / 2), Math.round(b1 - hh * 0.55), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); });
        // kereta: jalan, berhenti 4 dtk di tiap stasiun
        const TR = window.__TRN || (window.__TRN = { d: 0, wait: 0, last: performance.now() / 1000, next: 0 }), now2 = performance.now() / 1000, dt2 = Math.min(0.1, now2 - TR.last); TR.last = now2;
        if (TR.wait > 0) TR.wait -= dt2; else { const tgt = stD[TR.next], rem = ((tgt - TR.d) % per + per) % per, mv = 2.2 * dt2; if (rem <= mv) { TR.d = tgt; TR.wait = 4; TR.next = (TR.next + 1) % stD.length; } else TR.d = (TR.d + mv) % per; }
        const KI = IMR.kr || (IMR.kr = Object.assign(new Image(), { src: 'img/kereta.png' })), KR = IMR.krr || (IMR.krr = Object.assign(new Image(), { src: 'img/kereta_r.png' }));
        const [tc, tv, tk] = posOf(TR.d), [x, y] = kAt(tc, tv), im = (tk === 0 || tk === 2) ? KR : KI;
        items.push([y + 0.2, () => { if (!im.complete || !im.naturalWidth) return; const hh = 26 * z, ww = im.naturalWidth / im.naturalHeight * hh, [a1, b1] = toScreen(x, y); cx.imageSmoothingEnabled = true; cx.drawImage(im, Math.round(a1 - ww / 2), Math.round(b1 - hh * 0.75), Math.round(ww), Math.round(hh)); cx.imageSmoothingEnabled = false; }]); }
      items.sort((p, q) => p[0] - q[0]).forEach(([, f]) => f());
      { // HELIKOPTER keliling Menara Udin
        const [mx, my] = toScreen(...kAt(12.7, 7.4)), ty = my - 112 * z, a = t * 0.7, hx = mx + Math.cos(a) * 42 * z, hy = ty - 18 * z + Math.sin(a) * 15 * z + Math.sin(t * 3) * 1.5 * z, fl = -Math.sin(a) >= 0 ? 1 : -1, u = z * 0.9;
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
        pin(sw[0], sw[1], '#5a9e2f', '🌾', 'Sawah Sikepo'); pin(sg[0], sg[1], '#2f86c4', '💧', 'Sungai'); { const ib = kAt(19.3, 3.0), mn = kAt(12.7, 7.4), rsx = kAt(12.9, 2.45), mt = kAt(12.4, 9.9), pl = kAt(18.0, 7.3), dk = kAt(20.4, 7.3), tm = kAt(19.2, 9.7); pin(rsx[0], rsx[1], '#c8302a', '🏥', 'RS Sikepo'); pin(mt[0], mt[1], '#2a6fd8', '🛒', 'Sikepo Mart'); pin(pl[0], pl[1], '#1c2a6e', '👮', 'Kantor Polisi'); pin(dk[0], dk[1], '#d8302a', '🚒', 'Damkar'); pin(tm[0], tm[1], '#2aa84a', '🌳', 'Taman Kota'); pin(ib[0], ib[1], '#7a4fb0', '🕌', 'Kawasan Ibadah'); pin(mn[0], mn[1], '#1c2a6e', '🏢', 'Menara Udin'); } }
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
    if (cam.z >= 4 || P.showAll) for (const o of list) { if (strong.has(o)) continue; if (SMODE && !(window.SIKEPO_ONLINE && window.SIKEPO_ONLINE.has(o.w.no))) continue; const [a, b2] = toScreen(o.x, o.y); if (a < 0 || b2 < 0 || a > cv.width || b2 > cv.height) continue; if (++n > (P.showAll ? 400 : 60)) break; label(cx, o, false); }
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
