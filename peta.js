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
  const isFant = () => !!window.FANT3 && (window.SIKEPO_FORCE_FANTASY ?? (Date.now() >= FANT_AT));
  const isKota = () => !!window.KOTA3 && !isFant() && (window.SIKEPO_FORCE_KOTA ?? (Date.now() >= KOTA_AT));
  let KMODE = isKota(), FMODE = isFant(), LIGHTS = [];
  const ISL0 = Object.assign({}, ISL), PLOT0 = Object.assign({}, PLOT), HOME0 = Object.assign({}, HOME);
  function applyLayout() { if (FMODE) { Object.assign(ISL, FANT3.ISL); Object.assign(PLOT, { cx: -999, cy: -999, hw: 1, hh: 1 }); Object.assign(HOME, FANT3.HOME); return; }
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
  const onLand = (x, y) => FMODE ? FANT3.walk(x, y) : KMODE ? kWalk(x, y) : (inDia(x, y, ISL, 6) && !inDia(x, y, PLOT, -2) && Math.hypot(x - HOME.x, (y - HOME.y) * 2) > 16);

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
  const P = { walkers: [], byNo: new Map(), sel: null, hl: new Set(), showAll: false, onPick: null };
  const homeOf = w => FMODE ? FANT3.huddle(w.no) : KMODE ? KOTA3.doors[w.no % KOTA3.doors.length] : spot(w.no * 1.37 + 0.5);
  function addWalker(w, fresh) {
    if (P.byNo.has(w.no)) return P.byNo.get(w.no);
    const home = homeOf(w), st = spot(w.no * 2.91 + 9), en = KMODE ? ENTRY() : [HOME.x + 8, HOME.y + 6];
    const o = { w, jx: Math.round((rnd(w.no * 1.3) - 0.5) * 6), jy: Math.round((rnd(w.no * 2.7) - 0.5) * 3), x: fresh ? en[0] : st.x, y: fresh ? en[1] : st.y, tx: st.x, ty: st.y, home, wait: rnd(w.no) * 3, ph: rnd(w.no * 5) * 6, col: SHIRT[w.av] || COLS[w.no % COLS.length], born: fresh ? performance.now() : 0 };
    P.walkers.push(o); P.byNo.set(w.no, o); return o;
  }

  // ---------- canvas / camera ----------
  let cv, cx, cam = { x: ISL.cx, y: ISL.cy, z: 3 }, dpr = 1, last = 0;
  const zMin = () => Math.max(1.5, Math.min(cv.width / dpr / WW, cv.height / dpr / WH) * 0.95), zMax = 9;
  function clampCam() { cam.z = Math.max(zMin(), Math.min(zMax, cam.z)); cam.x = Math.max(20, Math.min(WW - 20, cam.x)); cam.y = Math.max(20, Math.min(WH - 20, cam.y)); }
  function resize() { const r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); clampCam(); }
  const toScreen = (x, y) => [(x - cam.x) * cam.z * dpr + cv.width / 2, (y - cam.y) * cam.z * dpr + cv.height / 2];
  const toWorld = (sx, sy) => [(sx * dpr - cv.width / 2) / (cam.z * dpr) + cam.x, (sy * dpr - cv.height / 2) / (cam.z * dpr) + cam.y];

  function wibHour() { try { const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date()); const h = +p.find(x => x.type === 'hour').value, m = +p.find(x => x.type === 'minute').value; return (h % 24) + m / 60; } catch (e) { return new Date().getHours(); } }
  function nightK(h) { if (h >= 19 || h < 4.5) return 1; if (h >= 17.5) return (h - 17.5) / 1.5; if (h < 6) return 1 - (h - 4.5) / 1.5; return 0; }

  // Wali Kota Udin keliling kota; malam pulang ke tikarnya
  const landU = (x, y) => FMODE ? FANT3.walk(x, y) : (inDia(x, y, ISL, 6) && !inDia(x, y, PLOT, -2));
  const U = { x: HOME.x + 2, y: HOME.y + 1, tx: HOME.x + 2, ty: HOME.y + 1, wait: 2, moving: false, face: 1, talk: 0, say: '', sayT: 0 };
  const SAPA = ['HALO WARGA! SELAMAT DATANG DI KOTA SIKEPO!', 'SUDAH BIKIN KARTU WARGA BELUM?', 'KOMEN RUMAH YANG WARAS YA!', 'FOLLOW DULU, BIAR JADI WARGA!', '1 LIKE = 1 KOIN. AYO LIKE!', 'COBA KLIK KEBUN SAWIT, SERU LHO!', 'HATI-HATI, INI KOTA PALING KEPO!', 'ENAKAN JAMAN WALIKOTA DULU? SAYA WALIKOTA PERTAMA!'];
  let sapaI = Math.floor(Math.random() * 8);
  function blip() { try { const A = window.__ac || (window.__ac = new (window.AudioContext || window.webkitAudioContext)()); [660, 880, 990].forEach((f, i) => { const o = A.createOscillator(), g = A.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(0.05, A.currentTime + i * 0.07); g.gain.exponentialRampToValueAtTime(0.0001, A.currentTime + i * 0.07 + 0.09); o.connect(g).connect(A.destination); o.start(A.currentTime + i * 0.07); o.stop(A.currentTime + i * 0.07 + 0.1); }); } catch (e) {} }
  function sapa() {
    const SF = ['SELAMAT DATANG DI KEPO FANTASY!', 'AKU UDIN THE GOBLIN, KETUA GUILD KALIAN!', 'JANGAN DEKAT-DEKAT GUA ITU...', 'LIKE, KOMEN & SHARE BIAR KITA PUNYA TENDA!', 'BRRR... MALAM DI SINI DINGIN BANGET.', 'MATA MERAH ITU NGELIATIN KITA TERUS...'];
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
  function step(dt, night) {
    for (const o of P.walkers) {
      if (night > 0.6) {   // malam: pulang ke tikar sendiri & tidur
        const dx = o.home.x - o.x, dy = o.home.y - o.y, d = Math.hypot(dx, dy);
        if (d > 0.6) { const v = Math.min(d, 14 * dt); o.x += dx / d * v; o.y += dy / d * v; o.moving = true; } else o.moving = false;
        o.sleep = d <= 0.6; continue;
      }
      if (KMODE && o.sleep) { o.sleep = false; const n = kNext(o); o.tx = n.x; o.ty = n.y; }
      o.sleep = false;
      if (o.wait > 0) { o.wait -= dt; o.moving = false; continue; }
      if (KMODE) { const dx = o.tx - o.x, dy = o.ty - o.y, d = Math.hypot(dx, dy);
        if (d < 0.8) { const n = kNext(o); o.tx = n.x; o.ty = n.y; if (Math.random() < 0.15) o.wait = 1 + Math.random() * 3; continue; }
        const v = Math.min(d, 9 * dt); o.x += dx / d * v; o.y += dy / d * v; o.moving = true; continue; }
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
    const tk = o.w.kat === 'TUKANG', av = o.w.av || 'MISTERI', skin = SKIN[av] || '#f4b47c', hair = HAIR[av] || '#1c1c24';
    if (o.sleep && KMODE) return;   // tidur di dalam rumah
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
  function frame(ts) {
    const t = ts / 1000, dt = Math.min(0.1, (ts - last) / 1000 || 0.016); last = ts;
    const h = window.SIKEPO_FORCE_HOUR ?? wibHour(), night = nightK(h);
    step(dt, night); stepUdin(dt, t, night); stepWx(dt, t);
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.imageSmoothingEnabled = false;
    cx.fillStyle = FMODE ? '#1a2e24' : '#2c86d8'; cx.fillRect(0, 0, cv.width, cv.height);
    const z = cam.z * dpr; const [ox, oy] = toScreen(0, 0);
    cx.drawImage(bg, Math.round(ox), Math.round(oy), Math.round(WW * z), Math.round(WH * z));
    // sea shimmer
    cx.fillStyle = 'rgba(255,255,255,0.35)';
    if (!FMODE) for (let i = 0; i < 18; i++) { const x = (rnd(i) * WW + t * (3 + i % 4)) % WW, y = rnd(i * 7) * WH; if (inDia(x, y, ISL, -6)) continue; const [a, b2] = toScreen(x, y); cx.fillRect(Math.round(a), Math.round(b2), Math.round(5 * z), Math.max(1, Math.round(z))); }
    // sprites sorted by y
    const list = P.walkers.slice().sort((a, b) => a.y - b.y);
    let udDrawn = false;
    if (!window.PETA_HIDE) {
    for (const o of list) { if (!udDrawn && o.y > U.y) { drawUdin(cx, night, t); udDrawn = true; } drawWalker(cx, o, t); }
    if (!udDrawn) drawUdin(cx, night, t);
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
      if (night > 0.6 && !FMODE) for (const o of list) if (o.sleep && (Math.floor(t + o.ph) % 3 === 0)) { const [a, b2] = toScreen(o.x + 2, o.y - 5 - (t * 3 + o.ph) % 4); SK.txt(cx, 'Z', Math.round(a), Math.round(b2), Math.max(1, Math.round(dpr)), '#c9d2ea', null); }
    }
    drawWeatherFront(t);
    // hint above the plantation
    if (!FMODE) { const [a, b2] = toScreen(PLOT.cx, PLOT.cy - PLOT.hh - 14), sc = Math.max(1, Math.round(dpr * (cam.z >= 3 ? 2 : 1))), s = 'KLIK KEBUN: POV', w = SK.tw(s, sc), bob = Math.round(Math.sin(t * 3) * 2 * dpr);
      cx.fillStyle = 'rgba(28,28,36,0.85)'; cx.fillRect(Math.round(a - w / 2 - 4 * sc), Math.round(b2 - 3 * sc + bob), w + 8 * sc, 13 * sc); SK.txt(cx, s, Math.round(a - w / 2), Math.round(b2 + bob), sc, '#ffd84a', null); }
    // labels
    const strong = new Set([P.sel, ...[...P.hl].map(n => P.byNo.get(n))].filter(Boolean));
    let n = 0;
    if (cam.z >= 4 || P.showAll) for (const o of list) { if (strong.has(o)) continue; const [a, b2] = toScreen(o.x, o.y); if (a < 0 || b2 < 0 || a > cv.width || b2 > cv.height) continue; if (++n > (P.showAll ? 400 : 60)) break; label(cx, o, false); }
    strong.forEach(o => label(cx, o, true));
    udinLabel(cx); udinBubble(cx);
    requestAnimationFrame(frame);
  }

  // ---------- input ----------
  function bindInput() {
    const pts = new Map(); let pinch0 = null, moved = 0;
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); moved = 0; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: cam.z }; } });
    cv.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return; const p = pts.get(e.pointerId), dx = e.clientX - p[0], dy = e.clientY - p[1]; pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2 && pinch0) { const [a, b] = [...pts.values()]; cam.z = pinch0.z * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch0.d; clampCam(); moved += 10; return; }
      cam.x -= dx / cam.z; cam.y -= dy / cam.z; moved += Math.abs(dx) + Math.abs(dy); clampCam();
    });
    const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch0 = null;
      if (moved < (e.pointerType === 'touch' ? 14 : 6) && e.type === 'pointerup') { const r = cv.getBoundingClientRect(), [wx, wy] = toWorld(e.clientX - r.left, e.clientY - r.top); let best = null, bd = 9 / Math.max(1, cam.z / 3);
        if (Math.hypot(U.x - wx, (U.y - 7) - wy) < Math.max(6, 10 / Math.max(1, cam.z / 3))) { sapa(); return; }
        for (const o of P.walkers) { const d = Math.hypot(o.x - wx, (o.y - 5) - wy); if (d < bd) { bd = d; best = o; } }
        if (!best && inDia(wx, wy + 4, PLOT, -4) && P.onSawit) { P.onSawit(); return; }
        P.sel = best; P.onPick && P.onPick(best ? best.w : null); } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(), [wx, wy] = toWorld(e.clientX - r.left, e.clientY - r.top); const z0 = cam.z; cam.z *= e.deltaY < 0 ? 1.15 : 1 / 1.15; clampCam(); const k = 1 - z0 / cam.z; cam.x += (wx - cam.x) * k; cam.y += (wy - cam.y) * k; clampCam(); }, { passive: false });
    window.addEventListener('resize', resize);
  }

  window.PETA = {
    init(canvas) { cv = canvas; cx = cv.getContext('2d'); drawBg(); resize(); cam.z = Math.max(zMin(), 2.6); clampCam(); bindInput(); requestAnimationFrame(frame);
      setInterval(() => { if (isKota() === KMODE && isFant() === FMODE) return; KMODE = isKota(); FMODE = isFant(); applyLayout(); g.clearRect(0, 0, WW, WH); drawBg();
        P.walkers.forEach(o => { const s = spot(o.w.no * 2.91 + 9); o.x = o.tx = s.x; o.y = o.ty = s.y; o.home = homeOf(o.w); o.sleep = false; });
        const [ex, ey] = KMODE ? ENTRY() : [HOME.x + 2, HOME.y + 1]; U.x = U.tx = ex; U.y = U.ty = ey; }, 20000); },
    setWarga(list) { list.forEach(w => addWalker(w, false)); },
    add(w) { const o = addWalker(w, true); P.hl.add(w.no); setTimeout(() => P.hl.delete(w.no), 15000); return o; },
    focus(no) { const o = P.byNo.get(no); if (!o) return false; P.sel = o; const z0 = cam.z, x0 = cam.x, y0 = cam.y, z1 = Math.max(5, z0), t0 = performance.now();
      const go = ts => { const k = Math.min(1, (ts - t0) / 700), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; cam.x = x0 + (o.x - x0) * e; cam.y = y0 + (o.y - 8 - y0) * e; cam.z = z0 + (z1 - z0) * e; clampCam(); if (k < 1) requestAnimationFrame(go); }; requestAnimationFrame(go); return true; },
    zoom(f) { cam.z *= f; clampCam(); },
    reset() { cam = { x: ISL.cx, y: ISL.cy, z: Math.max(zMin(), 2.6) }; clampCam(); P.sel = null; },
    showAll(v) { P.showAll = v; },
    onPick(f) { P.onPick = f; },
    onSawit(f) { P.onSawit = f; },
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
