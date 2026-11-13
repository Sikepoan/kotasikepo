// POV kebun sawit: lihat sekeliling (360°), jalan di antara pohon, ketuk pohon untuk manfaat sawit
(function () {
  const pR = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
  const pLine = (c, x0, y0, x1, y1, th, col) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); for (let i = 0; i <= n; i++) { const k = i / n; pR(c, x0 + (x1 - x0) * k - th / 2, y0 + (y1 - y0) * k - th / 2, th, th, col); } };
  const rnd = s => { const x = Math.sin(s * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const MANFAAT = [
    ['MINYAK GORENG', 'Buahnya diperas jadi minyak goreng buat masak sehari-hari.'],
    ['SABUN & SAMPO', 'Minyak sawit bikin sabun dan sampo jadi berbusa.'],
    ['MENTEGA & ROTI', 'Ada di margarin, roti, sampai cokelat.'],
    ['BAHAN BAKAR', 'Bisa jadi biodiesel untuk mobil dan truk.'],
    ['LAPANGAN KERJA', 'Petani, pemanen, sampai pekerja pabrik.'],
    ['JADI PUPUK', 'Tandan kosongnya dikembalikan ke tanah jadi pupuk.'],
    ['INGAT YA!', 'Tanam di lahan kosong, jangan babat hutan.']
  ];
  const ROWX = 1.25, SPZ = 1.4;           // tree grid: columns every 1.25 (path at x=0), rows every 1.4
  const XMAX = 5.5;
  let cv, c, W = 180, H = 320, raf = 0, on = false, last = 0;
  const cam = { x: 0, z: 0, yaw: 0, walk: 0 };
  const inp = { fwd: 0, turn: 0, auto: false, drag: null };
  let onTree = null, night = 0, drawn = [], tapped = null;

  function blocked(x, z) {   // keep ~0.55 away from every trunk
    for (let j = 1; j <= 4; j++) for (const sg of [-1, 1]) { const tx = sg * (j * ROWX + (j > 1 ? (j - 1) * 0.05 : 0)), off = j % 2 ? 0 : SPZ / 2, tz = Math.round((z - off) / SPZ) * SPZ + off;
      if (Math.hypot(x - tx, z - tz) < 0.55) return true; }
    return false;
  }
  function proj(x, z) {   // world -> camera -> screen
    const dx = x - cam.x, dz = z - cam.z, cs = Math.cos(cam.yaw), sn = Math.sin(cam.yaw);
    const xr = dx * cs - dz * sn, zr = dx * sn + dz * cs;
    if (zr <= 0.25) return null;
    const F = H * 0.4, s = F / zr;
    return { sx: W / 2 + xr * s, sy: H * 0.5 + F * 0.75 / zr, s, z: zr };
  }
  function tree(sx, sy, s, seed, hl) {
    const tw = Math.max(2, 0.2 * s), th = 1.05 * s, top = sy - th;
    pR(c, sx - tw / 2, top, tw, th, '#6b4a2c'); pR(c, sx - tw / 2, top, Math.max(1, tw * 0.3), th, '#83603a');
    if (s > 14) for (let yy = top + 0.1 * s; yy < sy - 0.08 * s; yy += 0.16 * s) { const o = (Math.round((yy - top) / (0.16 * s)) % 2) ? -0.06 : 0.06; pR(c, sx - tw * 0.25 + o * s, yy, tw * 0.5, Math.max(1, 0.05 * s), '#4e341c'); }
    const fr = Math.max(1, 0.13 * s);
    [[-0.12, 0.02], [0.12, 0.04], [0, 0.1]].forEach(([dx, dy], i) => { pR(c, sx + dx * s - fr, top + dy * s, fr * 2, fr * 1.6, i % 2 ? '#b02a1a' : '#e0602a'); if (s > 30) pR(c, sx + dx * s - fr * 0.4, top + dy * s + fr * 0.3, fr * 0.5, fr * 0.5, '#ffb04a'); });
    if (hl) { const g = 0.42 * s; pR(c, sx - g, top - 0.05 * s, g * 2, 1, '#ffe66a'); pR(c, sx - g, top + 0.3 * s, g * 2, 1, '#ffe66a'); pR(c, sx - g, top - 0.05 * s, 1, 0.35 * s, '#ffe66a'); pR(c, sx + g, top - 0.05 * s, 1, 0.35 * s, '#ffe66a'); }
    [100, 70, 130, 40, 160, 15, 185, -10, 210].forEach((a, i) => {
      const r = a * Math.PI / 180, L = (0.75 + rnd(seed + i) * 0.2) * s, droop = (Math.abs(Math.cos(r)) * 0.55 + 0.1) * s;
      let px = sx, py = top; const steps = Math.max(3, Math.round(L / 2.5));
      for (let k = 1; k <= steps; k++) { const q = k / steps, nx = sx + Math.cos(r) * L * q, ny = top - Math.sin(r) * L * q + droop * q * q;
        pLine(c, px, py, nx, ny, Math.max(1, 0.07 * s * (1 - q * 0.8)), i % 2 ? '#2f7a2c' : '#3f9b3a');
        if (s > 12 && k % 2 === 0 && q < 0.95) { const lf = Math.max(1, 0.14 * s * (1 - q)); pR(c, nx - lf / 2, ny + 1, lf, Math.max(1, lf * 0.6), '#1f5a22'); }
        px = nx; py = ny; }
    });
  }
  function scene(t) {
    const hz = H * 0.5, sky = night > 0.5;
    pR(c, 0, 0, W, hz + 2, sky ? '#141c48' : '#8fd0fb'); pR(c, 0, hz - 18, W, 18, sky ? '#1c2a5c' : '#a9dcfc'); pR(c, 0, hz - 6, W, 6, sky ? '#26356a' : '#c4e8ff');
    if (sky) { for (let i = 0; i < 40; i++) pR(c, ((rnd(i * 3.3) * 400 - cam.yaw * 60) % W + W) % W, rnd(i * 8.1) * (hz - 30), 1, 1, '#ffffff'); }
    else for (let i = 0; i < 4; i++) { const x = ((i * 90 + t * 3 - cam.yaw * 80) % (W + 60) + W + 60) % (W + 60) - 30, y = 14 + i * 13; pR(c, x, y, 24, 5, '#ffffff'); pR(c, x + 6, y - 3, 12, 3, '#ffffff'); }
    // far silhouette (moves with yaw)
    for (let x = -8; x < W + 8; x += 8) { const xx = x + ((-cam.yaw * 120) % 8); pR(c, xx + 3, hz - 13, 1, 9, sky ? '#0f2a1e' : '#4e7a3c'); pR(c, xx, hz - 16, 8, 4, sky ? '#12361f' : '#3a7a3a'); }
    pR(c, 0, hz, W, H - hz, sky ? '#24502c' : '#5fae45');
    for (let y = hz + 1; y < H; y += 2) { const z = H * 0.3 / (y - hz); if (Math.floor(z * 2 + cam.walk * 2) % 2) pR(c, 0, y, W, 2, sky ? '#20482a' : '#57a33f'); }
    // path strip along x=0 (projected quads)
    const z0 = Math.floor(cam.z) - 30;
    for (let k = 0; k < 70; k++) {
      const za = z0 + k * 1, zb = za + 1, a1 = proj(-0.32, za), a2 = proj(0.32, za), b1 = proj(-0.32, zb), b2 = proj(0.32, zb);
      if (!a1 || !a2 || !b1 || !b2) continue;
      c.fillStyle = k % 2 ? (sky ? '#5e4630' : '#b98a55') : (sky ? '#544028' : '#a97a48');
      c.beginPath(); c.moveTo(a1.sx, a1.sy); c.lineTo(a2.sx, a2.sy); c.lineTo(b2.sx, b2.sy); c.lineTo(b1.sx, b1.sy); c.closePath(); c.fill();
    }
    // trees around the camera
    const list = [], zr = Math.round(cam.z / SPZ);
    for (let i = -14; i <= 14; i++) for (let j = 1; j <= 4; j++) for (const sg of [-1, 1]) {
      const x = sg * (j * ROWX + (j > 1 ? (j - 1) * 0.05 : 0)), z = (zr + i) * SPZ + (j % 2 ? 0 : SPZ / 2);
      const p = proj(x, z); if (!p || p.sx < -2 * p.s || p.sx > W + 2 * p.s || p.z > 16) continue;
      list.push({ ...p, x, z, seed: Math.round(x * 7 + z * 3) });
    }
    list.sort((a, b) => b.z - a.z);
    // pick the tree nearest screen centre & close enough as "tap target"
    onTree = null; let best = 1e9;
    for (const p of list) { const d = Math.abs(p.sx - W / 2) + (p.z > 4 ? 999 : 0); if (d < p.s * 0.6 && d < best) { best = d; onTree = p; } }
    drawn = list.filter(p => p.z <= 7);
    if (tapped && performance.now() > tapped.until) tapped = null;
    for (const p of list) tree(p.sx, p.sy, p.s, p.seed, p === onTree || (tapped && tapped.seed === p.seed && Math.abs(tapped.z - p.z) < 1.5));
  }
  function arms(t) {
    const sw = inp.fwd || inp.auto ? Math.sin(cam.walk * 5.5) : 0, bob = Math.round(Math.abs(sw) * 2);
    const u = H / 320;   // arms scale with canvas
    const r = (x, y, w, h, col) => pR(c, x * u, y * u + bob, w * u, h * u, col);
    const lx = 14, ly = 268 + Math.round(-sw * 3);
    r(lx - 6, ly + 14, 30, 70, '#7a3e1c');
    for (let yy = ly + 18; yy < 330; yy += 6) for (let xx = lx - 4; xx < lx + 22; xx += 6) r(xx + ((yy / 6) % 2) * 3, yy, 2, 2, '#c8843a');
    r(lx - 2, ly + 2, 20, 16, '#f4b47c'); r(lx - 2, ly + 14, 20, 3, '#d8955e');
    r(lx + 3, ly - 4, 12, 8, '#3a3a44'); r(lx + 1, ly - 22, 16, 18, '#1c1c24'); r(lx + 2, ly - 21, 14, 16, '#e8e8e8');
    r(lx - 5, ly - 40, 28, 20, '#1c1c24'); r(lx - 4, ly - 39, 26, 18, '#ffffff'); r(lx - 4, ly - 39, 26, 4, '#e02f2f'); r(lx + 2, ly - 33, 14, 10, '#d0d0d8');
    const rx = (W / u) - 30, ry = 266 + Math.round(sw * 3);
    r(rx, ry + 12, 34, 70, '#7a3e1c');
    for (let yy = ry + 16; yy < 330; yy += 6) for (let xx = rx + 2; xx < rx + 32; xx += 6) r(xx + ((yy / 6) % 2) * 3, yy, 2, 2, '#c8843a');
    r(rx + 2, ry, 24, 16, '#f4b47c'); r(rx + 2, ry + 12, 24, 3, '#d8955e');
    const mid = (W / u) / 2; r(mid - 30, 312, 60, 10, '#e02f2f'); r(mid - 30, 312, 60, 2, '#ff6a5a'); r(mid - 6, 314, 12, 6, '#ffd84a');
  }
  function frame(ts) {
    if (!on) return;
    const dt = Math.min(0.1, (ts - last) / 1000 || 0.016), t = ts / 1000; last = ts;
    cam.yaw += inp.turn * 1.8 * dt;
    const sp = (inp.fwd || (inp.auto ? 1 : 0)) * 1.6 * dt;
    if (sp) { cam.x += Math.sin(cam.yaw) * sp; cam.z += Math.cos(cam.yaw) * sp; cam.walk += Math.abs(sp);
      cam.x = Math.max(-XMAX, Math.min(XMAX, cam.x));
      if (blocked(cam.x, cam.z)) { cam.x -= Math.sin(cam.yaw) * sp; cam.z -= Math.cos(cam.yaw) * sp; } }
    night = window.PETA && PETA.isNight() ? 1 : 0;
    scene(t); arms(t);
    if (night) { c.fillStyle = 'rgba(10,16,60,0.35)'; c.fillRect(0, 0, W, H); }
    // crosshair
    pR(c, W / 2 - 3, H * 0.42, 7, 1, 'rgba(255,255,255,0.7)'); pR(c, W / 2, H * 0.42 - 3, 1, 7, 'rgba(255,255,255,0.7)');
    const hint = document.getElementById('povHint'); if (hint) hint.hidden = !onTree;
    raf = requestAnimationFrame(frame);
  }
  function size() { const r = cv.getBoundingClientRect(); H = 240; W = Math.round(Math.max(135, Math.min(480, H * r.width / Math.max(1, r.height)))); cv.width = W; cv.height = H; c.imageSmoothingEnabled = false; }
  let mi = 0;
  function treeAt(px, py) {   // px,py in canvas pixels; frontmost tree whose trunk/crown contains the point
    let hit = null;
    for (const p of drawn) { const top = p.sy - 1.05 * p.s;
      if (px >= p.sx - 0.85 * p.s && px <= p.sx + 0.85 * p.s && py >= top - 0.75 * p.s && py <= p.sy + 2) { if (!hit || p.z < hit.z) hit = p; } }
    return hit;
  }
  function tapTree(px, py) {
    const p = (px !== undefined) ? (treeAt(px, py) || null) : onTree;
    if (!p) return false;
    tapped = { seed: p.seed, z: p.z, until: performance.now() + 1500 };
    const m = MANFAAT[mi++ % MANFAAT.length], box = document.getElementById('povCard');
    box.querySelector('b').textContent = (mi <= 6 ? 'MANFAAT SAWIT #' + mi + ': ' : '') + m[0];
    box.querySelector('span').textContent = m[1]; box.hidden = false;
    clearTimeout(box._t); box._t = setTimeout(() => box.hidden = true, 4500); return true;
  }
  function bind() {
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); inp.drag = { x: e.clientX, y: e.clientY, moved: 0 }; });
    cv.addEventListener('pointermove', e => { if (!inp.drag) return; const dx = e.clientX - inp.drag.x; inp.drag.x = e.clientX; inp.drag.moved += Math.abs(dx); if (inp.drag.moved > 10) cam.yaw -= dx * 0.006; });
    cv.addEventListener('pointerup', e => {
      if (inp.drag && inp.drag.moved < 14) { const r = cv.getBoundingClientRect(), px = (e.clientX - r.left) * cv.width / r.width, py = (e.clientY - r.top) * cv.height / r.height; tapTree(px, py); }
      inp.drag = null; });
    const hold = (id, k, v) => { const b = document.getElementById(id); const st = e => { e.preventDefault(); inp[k] = v; }, en = () => { inp[k] = 0; };
      b.addEventListener('pointerdown', st); b.addEventListener('pointerup', en); b.addEventListener('pointerleave', en); b.addEventListener('pointercancel', en); };
    hold('povFwd', 'fwd', 1); hold('povBack', 'fwd', -1); hold('povL', 'turn', -1); hold('povR', 'turn', 1);
    document.getElementById('povAuto').onclick = e => { inp.auto = !inp.auto; e.currentTarget.setAttribute('aria-pressed', inp.auto); };
    window.addEventListener('keydown', e => { if (!on) return; const k = e.key.toLowerCase();
      if (k === 'escape') POV.close(); if (k === 'w' || k === 'arrowup') inp.fwd = 1; if (k === 's' || k === 'arrowdown') inp.fwd = -1;
      if (k === 'a' || k === 'arrowleft') inp.turn = -1; if (k === 'd' || k === 'arrowright') inp.turn = 1; if (k === ' ' || k === 'enter') { tapTree(); e.preventDefault(); } });
    window.addEventListener('keyup', e => { const k = e.key.toLowerCase(); if (['w', 's', 'arrowup', 'arrowdown'].includes(k)) inp.fwd = 0; if (['a', 'd', 'arrowleft', 'arrowright'].includes(k)) inp.turn = 0; });
    window.addEventListener('resize', () => on && size());
    document.getElementById('povX').onclick = () => POV.close();
  }
  window.POV = {
    nearestTreeClient() { const p = drawn.slice().sort((a, b) => a.z - b.z).find(p => p.sx > 10 && p.sx < W - 10); if (!p) return null; const r = cv.getBoundingClientRect(); return [r.left + p.sx * r.width / W, r.top + (p.sy - 0.5 * p.s) * r.height / H]; },
    init() { cv = document.getElementById('povCanvas'); c = cv.getContext('2d'); bind(); },
    open() { const m = document.getElementById('pov'); m.hidden = false; document.body.style.overflow = 'hidden'; on = true; cam.x = 0; cam.z = 0; cam.yaw = 0; size(); last = performance.now(); raf = requestAnimationFrame(frame); document.getElementById('povX').focus(); },
    close() { on = false; cancelAnimationFrame(raf); document.getElementById('pov').hidden = true; document.body.style.overflow = ''; inp.fwd = inp.turn = 0; }
  };
})();
