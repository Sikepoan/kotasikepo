// JAGA SAWAH: mini game tembak burung pipit di sawah Kota Sikepo (desain original)
(() => {
  const W = 256, H = 240, PAL = { sky: '#7ec8f0', sky2: '#a9dcf6', far: '#5f9e3a', rice1: '#86c255', rice2: '#5aa83a', dike: '#6b5a2e', water: '#8ea4b8' };
  let cv, cx, st = null, raf = 0;
  const U = {}; ['u_tawa', 'u_bangga', 'u_sorak'].forEach(n => { U[n] = new Image(); U[n].src = 'img/k/g/' + n + '.png'; });
  const BIRD = [['#7a4a22', '#b87a3a', '#f0d8a8'], ['#4a4a5a', '#7a7a8a', '#e0e0e8'], ['#a0301a', '#d8603a', '#f8d0a0']];
  function px(x, y, w, h, c) { cx.fillStyle = c; cx.fillRect(Math.round(x), Math.round(y), w, h); }
  function drawBird(b) { const [d, m, l] = BIRD[b.kind], f = Math.floor(b.t * 10) % 2, s = b.vx < 0 ? -1 : 1, x = 0, y = 0; cx.save(); cx.translate(Math.round(b.x), Math.round(b.y)); cx.scale(1.8, 1.8);
    const P = (dx, dy, w, h, c) => px(s > 0 ? x + dx : x - dx - w, y + dy, w, h, c);
    if (b.dead) { P(-4, -3, 9, 5, m); P(-2, 2, 5, 2, l); P(3, -5, 3, 3, d); P(-1, -6, 1, 2, '#000'); cx.restore(); return; }
    P(-5, -2, 10, 5, m); P(-3, 1, 6, 3, l); P(4, -4, 4, 4, d); P(6, -3, 1, 1, '#000'); P(8, -2, 2, 1, '#f0b020'); P(-8, -1, 3, 2, d);
    if (f) { P(-3, -7, 6, 5, d); P(-2, -9, 3, 2, d); } else { P(-3, 2, 6, 4, d); P(-2, 5, 3, 2, d); } cx.restore(); }
  function bg(t) { const g = cx.createLinearGradient(0, 0, 0, 150); g.addColorStop(0, PAL.sky); g.addColorStop(1, PAL.sky2); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    px(200, 20, 16, 16, '#fff6b0'); for (const [x0, y0] of [[30, 30], [140, 18], [90, 50]]) { const x = (x0 + t * 4) % (W + 40) - 20; px(x, y0, 24, 6, '#fff'); px(x + 4, y0 - 4, 14, 4, '#fff'); }
    px(0, 140, W, 12, PAL.far); for (let x = 0; x < W; x += 8) px(x, 136 + ((x * 7) % 5), 8, 6, PAL.far);
    for (const kx of [24, 222]) { px(kx, 92, 3, 50, '#7a5a30'); for (let k = 0; k < 6; k++) px(kx - 12 + k * 4, 86 + Math.abs(k - 2.5) * 3, 6, 3, '#3f7a2a'); }
    for (let r = 0; r < 5; r++) { const y = 152 + r * 18; px(0, y, W, 18, r % 2 ? PAL.rice1 : PAL.rice2); px(0, y, W, 2, PAL.dike);
      for (let x = (r * 5) % 7; x < W; x += 7) { const sw = Math.round(Math.sin(t * 2.5 + x * 0.1 + r) * 1.2); px(x + sw, y + 4, 1, 6, '#2f6a22'); px(x + sw, y + 3, 1, 1, '#c9e070'); } }
    px(108, 196, 40, 6, PAL.water); }
  function newRound() { st.round++; st.wave = 0; st.hitsRound = 0; st.birds = []; st.spawn(); }
  function spawn() { st.wave++; st.ammo = 3; st.birds = []; const n = st.round >= 3 ? 2 : 1;
    for (let i = 0; i < n; i++) { const sp = 40 + st.round * 10 + Math.random() * 20; st.birds.push({ x: 40 + Math.random() * 176, y: 160, vx: (Math.random() < 0.5 ? -1 : 1) * sp, vy: -sp * 0.8, t: 0, kind: Math.floor(Math.random() * 3), dead: false, fall: 0, gone: false, life: 6 - Math.min(3, st.round * 0.4) }); }
    st.phase = 'fly'; st.msg = ''; }
  function tick(dt) { const s = st; s.t += dt; s.flash = Math.max(0, s.flash - dt);
    if (s.phase === 'fly') { let alive = 0;
      for (const b of s.birds) { b.t += dt; if (b.dead) { b.y += 120 * dt; if (b.y > 170) { b.gone = true; s.dropX = b.x; } continue; } if (b.gone) continue; alive++; b.life -= dt;
        if (b.life <= 0 || s.ammo <= 0 && !s.birds.some(q => q.dead && !q.gone)) { b.vy = -90; b.vx *= 0.5; }
        b.x += b.vx * dt; b.y += b.vy * dt; if (b.life > 0) { if (b.x < 8 || b.x > W - 8) b.vx *= -1; if (b.y < 12) b.vy = Math.abs(b.vy); if (b.y > 140) b.vy = -Math.abs(b.vy); if (Math.random() < dt * 0.8) b.vy *= -1; }
        if (b.y < -20) { b.gone = true; b.esc = true; } }
      if (s.birds.every(b => b.gone)) { const hit = s.birds.filter(b => b.dead).length, esc = s.birds.filter(b => b.esc).length; s.hitsRound += hit; s.padi = Math.max(0, s.padi - esc * 5); s.phase = 'udin'; s.ut = 0; s.uok = hit > 0; s.got = s.birds.filter(b => b.dead).map(b => b.kind); s.ux = hit ? Math.max(40, Math.min(216, s.dropX || 128)) : 128; s.msg = !hit ? 'YAAH... PADINYA DIMAKAN!' : esc ? 'DAPET SATU, SATUNYA KABUR!' : 'DIPUNGUT PAK UDIN!'; } }
    else if (s.phase === 'udin') { s.ut += dt; if (s.ut > 1.6) { if (s.padi <= 0) { s.phase = 'over'; s.msg = 'GAGAL PANEN! SKOR ' + s.score; kirim(s); } else if (s.wave >= 5) { s.phase = 'ronde'; s.ut = 0; s.msg = 'RONDE ' + s.round + ' SELESAI!'; } else spawn(); } }
    else if (s.phase === 'ronde') { s.ut += dt; if (s.ut > 1.6) newRound(); } }
  function draw() { const s = st; bg(s.t); for (const b of s.birds) if (!b.gone || b.dead) drawBird(b);
    if (s.flash > 0) { cx.fillStyle = 'rgba(255,255,255,' + s.flash * 2 + ')'; cx.fillRect(0, 0, W, H); }
    if (s.phase === 'udin') { const im = U[s.uok ? 'u_sorak' : 'u_tawa'], up = Math.min(1, s.ut * 4) * (s.ut > 1.3 ? (1.6 - s.ut) / 0.3 : 1), h = 56, top = 190 - h * up;
      if (im.complete && im.naturalWidth) { const w = im.naturalWidth / im.naturalHeight * h; cx.save(); cx.beginPath(); cx.rect(0, 0, W, 186); cx.clip(); cx.drawImage(im, s.ux - w / 2, top, w, h);
        (s.got || []).forEach((k, i) => drawBird({ x: s.ux + (i ? 16 : -14), y: top + 2, kind: k, dead: true, vx: 1, t: 0 })); cx.restore(); } }
    px(0, H - 22, W, 22, '#1c1c24'); cx.font = '8px monospace'; cx.fillStyle = '#ffd84a'; cx.fillText('RONDE ' + s.round + '  ' + s.wave + '/5', 6, H - 12); cx.fillText('SKOR ' + s.score, 6, H - 3);
    cx.fillStyle = '#fff'; cx.fillText('PELURU', 104, H - 12); for (let k = 0; k < 3; k++) px(106 + k * 8, H - 9, 5, 6, k < s.ammo ? '#f0b020' : '#444');
    cx.fillStyle = '#fff'; cx.fillText('PADI', 170, H - 12); px(170, H - 8, 70, 5, '#444'); px(170, H - 8, 70 * s.padi / 100, 5, s.padi > 30 ? '#86c255' : '#e05030');
    if (s.msg) { cx.font = 'bold 11px monospace'; const w = cx.measureText(s.msg).width; px(128 - w / 2 - 6, 70, w + 12, 20, '#1c1c24'); cx.fillStyle = '#ffd84a'; cx.fillText(s.msg, 128 - w / 2, 84); }
    if (s.phase === 'over' || s.phase === 'start') { cx.font = '8px monospace'; const t2 = s.phase === 'start' ? 'KETUK UNTUK MULAI' : 'KETUK UNTUK MAIN LAGI'; px(128 - 50, 100, 100, 14, '#c8302a'); cx.fillStyle = '#fff'; cx.fillText(t2, 128 - cx.measureText(t2).width / 2, 110); } }
  function shoot(mx, my) { const s = st; if (s.phase === 'start' || s.phase === 'over') { Object.assign(s, { round: 0, score: 0, padi: 100 }); newRound(); return; }
    if (s.phase !== 'fly' || s.ammo <= 0) return; s.ammo--; s.flash = 0.06; let hit = false;
    for (const b of s.birds) if (!b.dead && !b.gone && Math.abs(b.x - mx) < 18 && Math.abs(b.y - my) < 15) { b.dead = true; hit = true; s.score += 100 * s.round + (b.kind === 2 ? 200 : 0); }
    if (!hit && s.ammo <= 0) for (const b of s.birds) if (!b.dead) b.life = 0; }
  function kirim(s) { const el = document.getElementById('gameInfo'); if (!el || !window.DATA || !s.score) return; el.textContent = 'Mengirim skor...';
    DATA.skorSend(s.score, s.round).then(() => { el.textContent = 'Skor ' + s.score + ' tercatat! Cek peringkat di KABAR > SKOR.'; }).catch(e => { el.textContent = e.kode === 'perlu_kartu' ? 'Bikin Kartu Warga dulu biar skormu masuk papan skor & berita!' : e.kode === 'terlalu_cepat' ? 'Tunggu sebentar sebelum kirim skor lagi.' : e.kode === 'demo' ? '' : 'Skor gagal dikirim.'; }); }
  function loop(ts) { const dt = Math.min(0.05, (ts - (st.last || ts)) / 1000); st.last = ts; tick(dt); draw(); raf = requestAnimationFrame(loop); }
  window.JAGASAWAH = { _st: () => st, open() { let ov = document.getElementById('gameOv'); if (!ov) { ov = document.createElement('div'); ov.id = 'gameOv';
      ov.innerHTML = '<div class="g-box"><div class="g-h"><b>JAGA SAWAH</b><button type="button" class="ui-x" id="gameX">×</button></div><canvas id="gameCv" width="256" height="240"></canvas><p class="g-tip">Burung pipit mau makan padi! Ketuk burungnya. 3 peluru per gelombang, jaga bar PADI jangan habis.</p><p class="g-tip" id="gameInfo" style="font-weight:700;color:#c8302a"></p></div>';
      document.body.append(ov); document.getElementById('gameX').onclick = () => JAGASAWAH.close(); cv = document.getElementById('gameCv'); cx = cv.getContext('2d'); cx.imageSmoothingEnabled = false;
      cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(); shoot((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H); }); }
      ov.hidden = false; st = { t: 0, phase: 'start', round: 0, score: 0, padi: 100, ammo: 3, birds: [], wave: 0, flash: 0, msg: 'JAGA SAWAH', spawn }; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); },
    close() { const ov = document.getElementById('gameOv'); if (ov) ov.hidden = true; cancelAnimationFrame(raf); const pb = document.querySelector('#uiNav button[data-v="peta"]'); if (pb) pb.click(); } };
})();
