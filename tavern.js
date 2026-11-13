// Dalam Tavern Guild: klik tavern di peta -> interior; warga berkeliaran, tap warga = ngobrol
(function () {
  const W = 270, H = 480, FL = { x0: 26, x1: 244, y0: 280, y1: 420 };
  const KATA = ['APAKAH AKU BISA JADI|WAKIL PRESIDEN?', 'APAKAH PAK UDIN|MAU MEMECAT AKU?', 'IJAZAH PAK UDIN|ASLI GAK SIH?', 'UNTUNG SAWIT KEMARIN|UDAH HANCUR', 'AKU YAKIN PAK UDIN|KORUPSI'];
  const BAR = 'MAU PESAN APA?|MAKANAN TINGGAL|SEDIKIT LHO...';
  const UDIN = ['SUDAH BIKIN KARTU|PETUALANG BELUM?', 'KOMEN JOB KAMU,|AKU PILIH 10 ORANG!', 'BANTU BANGUN BENGKEL|YA, 150 POIN!'];
  const NPC = { bar: { x: 135, y: 236, hx: 135, hy: 262 }, udin: { x: 214, y: 262, hx: 194, hy: 270 } };
  const rnd = s => { const x = Math.sin(s * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const bg = new Image(); bg.src = 'img/tavern_dalam.png';
  let el, cv, c, on = false, raf = 0, last = 0, P = [], me = null, say = null, ki = 0;
  const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const spot = i => ({ x: FL.x0 + rnd(i * 3.1 + Math.random()) * (FL.x1 - FL.x0), y: FL.y0 + rnd(i * 7.7 + Math.random()) * (FL.y1 - FL.y0) });
  function mk(w, i, self) { const s = spot(i); return { w, job: SK.jobOf(w), x: s.x, y: s.y, tx: s.x, ty: s.y, wait: Math.random() * 3, self, ph: Math.random() * 6 }; }
  function bubble(x, y, text) {
    const L = text.split('|'), wd = Math.max(...L.map(l => SK.tw(l, 1))) + 10, h = L.length * 10 + 7, bx = Math.max(2, Math.min(W - wd - 2, x - wd / 2)), by = y - h - 5;
    R(bx - 1, by - 1, wd + 2, h + 2, '#1c1c24'); R(bx, by, wd, h, '#ffffff'); R(x - 2, by + h, 5, 4, '#ffffff'); R(x - 3, by + h, 1, 4, '#1c1c24'); R(x + 3, by + h, 1, 4, '#1c1c24');
    L.forEach((l, i) => SK.txt(c, l, bx + 5, by + 4 + i * 10, 1, '#1c1c24', null));
  }
  function label(x, y, s, col) { const w = SK.tw(s, 1) + 6; R(x - w / 2, y, w, 9, col); SK.txt(c, s, x - w / 2 + 3, y + 1, 1, '#ffffff', null); }
  function draw(o, t) { const sp = SK.JSPR[o.job.id], bob = o.moving ? -Math.abs(Math.round(Math.sin(t * 10 + o.ph))) : 0;
    R(o.x - 6, o.y - 1, 12, 2, 'rgba(0,0,0,0.25)');
    c.save(); if (o.face < 0) { c.translate(Math.round(o.x) * 2, 0); c.scale(-1, 1); } c.drawImage(sp, Math.round(o.x - 12), Math.round(o.y - 25 + bob)); c.restore();
    if (o.self) label(o.x, o.y + 3, o.w ? SK.clean(o.w.nama).slice(0, 14) : 'KAMU', '#c8302a'); }
  function step(o, dt) {
    const dx = o.tx - o.x, dy = o.ty - o.y, d = Math.hypot(dx, dy);
    if (d > 0.8) { const v = Math.min(d, (o.self ? 46 : 14) * dt); o.x += dx / d * v; o.y += dy / d * v; o.moving = true; o.face = dx < 0 ? -1 : 1; return false; }
    o.moving = false; if (o.self) return true; if (o.talk > 0) { o.talk -= dt; return true; }
    o.wait -= dt; if (o.wait <= 0) { const s = spot(o.ph * 99 + performance.now()); o.tx = s.x; o.ty = s.y; o.wait = 2 + Math.random() * 4; } return true;
  }
  function frame(ts) {
    if (!on) return; const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts; const t = ts / 1000;
    P.forEach(o => step(o, dt));
    if (me.goal && step(me, dt)) { const gl = me.goal; me.goal = null;
      if (gl.npc) say = { npc: gl.npc, text: gl.npc === 'bar' ? BAR : UDIN[ki++ % UDIN.length], until: t + 4 };
      else { gl.o.talk = 4; gl.o.tx = gl.o.x; gl.o.ty = gl.o.y; gl.o.face = me.x < gl.o.x ? -1 : 1; say = { o: gl.o, text: KATA[Math.floor(Math.random() * KATA.length)], until: t + 4 }; } }
    else if (!me.goal) step(me, dt);
    if (bg.complete) c.drawImage(bg, 0, 0); else R(0, 0, W, H, '#3a2210');
    [...P, me].sort((a, b) => a.y - b.y).forEach(o => draw(o, t));
    if (say && t < say.until) { const s = say.o || NPC[say.npc]; bubble(Math.round(s.x), Math.round(s.y - (say.npc === 'bar' ? 36 : 28)), say.text); } else say = null;
    raf = requestAnimationFrame(frame);
  }
  function tap(e) {
    const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
    for (const k of ['bar', 'udin']) { const n = NPC[k]; if (Math.abs(x - n.x) < 14 && y > n.y - 32 && y < n.y + 4) { me.tx = n.hx; me.ty = n.hy; me.goal = { npc: k }; return; } }
    let best = null, bd = 16; for (const o of P) { const d = Math.hypot(o.x - x, o.y - 10 - y); if (d < bd) { bd = d; best = o; } }
    if (best) { const sd = me.x < best.x ? -1 : 1; me.tx = Math.max(FL.x0, Math.min(FL.x1, best.x + sd * 18)); me.ty = best.y + 1; me.goal = { o: best }; return; }
    if (y > FL.y0 - 8 && y < FL.y1 + 10) { me.tx = Math.max(FL.x0, Math.min(FL.x1, x)); me.ty = Math.max(FL.y0, Math.min(FL.y1, y)); me.goal = null; }
  }
  function fit() { const s = Math.min(innerWidth / W, innerHeight / H); cv.style.width = Math.floor(W * s) + 'px'; cv.style.height = Math.floor(H * s) + 'px'; }
  window.TAVERN = {
    init() { el = document.getElementById('tav'); cv = document.getElementById('tavCanvas'); if (!el || !cv) return; cv.width = W; cv.height = H; c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
      cv.addEventListener('pointerup', tap); document.getElementById('tavX').onclick = () => TAVERN.close(); addEventListener('resize', () => on && fit());
      addEventListener('keydown', e => { if (on && e.key === 'Escape') TAVERN.close(); }); },
    open(mine, warga) { if (!el) return; const list = (warga || []).filter(w => !mine || w.no !== mine.no).slice(-24);
      while (list.length < 12) list.push({ no: -list.length - 1, nama: 'WARGA', av: ['COWOK1', 'COWOK2', 'COWOK3', 'CEWEK1', 'CEWEK2', 'CEWEK3'][list.length % 6] });
      P = list.map((w, i) => mk(w, i, false)); me = mk(mine || null, 99, true); me.x = me.tx = 135; me.y = me.ty = 412; say = null;
      const hb = document.getElementById('tavDaftar'); if (hb) hb.hidden = !!mine;
      el.hidden = false; document.body.style.overflow = 'hidden'; fit(); on = true; last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); },
    people: () => P,
    close() { on = false; cancelAnimationFrame(raf); if (el) el.hidden = true; document.body.style.overflow = ''; }
  };
})();
