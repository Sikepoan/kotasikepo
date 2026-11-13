// Kota Sikepo — UI
(function () {
  const $ = id => document.getElementById(id);
  const C = window.SIKEPO_CONFIG || {};
  const pad = n => String(n).padStart(4, '0');
  const fmt = n => Number(n || 0).toLocaleString('id-ID');
  const cleanNama = s => (s || '').toUpperCase().replace(/[^A-Z0-9_.@ ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24);
  const ST = { av: 'COWOK1', stats: null, warga: [], mine: null };

  // ---------- card helpers ----------
  const cardData = (w, size) => ({ nama: w.nama, no: pad(w.no), kat: w.kat, av: w.av, hari: String(w.hari || (ST.stats && ST.stats.hari) || 1), judul: 'WARGA SIKEPO', bg: 'hari2', size, fantasy: FANT() });
  const FANT = () => !!(window.PETA && PETA.fantasy && PETA.fantasy());
  function drawTo(canvas, d) { const r = SK.render(d); canvas.width = r.small.width; canvas.height = r.small.height; const c = canvas.getContext('2d'); c.imageSmoothingEnabled = false; c.drawImage(r.small, 0, 0); return r; }
  const fname = (w, k) => `kartu_warga_sikepo_${pad(w.no)}_${w.nama.toLowerCase().replace(/[^a-z0-9]+/g, '')}${k ? '_' + k : ''}.png`;

  // ---------- form preview ----------
  function formData() {
    const nama = cleanNama($('nama').value), kat = document.querySelector('input[name=kat]:checked').value;
    const nextNo = ST.warga.reduce((m, w) => Math.max(m, w.no), 0) + 1;
    return { nama, no: nextNo, kat: FANT() ? 'WARGA' : kat, av: ST.av, hari: (ST.stats && ST.stats.hari) || 1 };
  }
  function preview() { if (ST.mine) return drawTo($('prev'), cardData(ST.mine, 'story')); drawTo($('prev'), cardData(formData(), 'story')); }
  function buildAvs() {
    const wrap = $('avs'); wrap.innerHTML = ''; const tk = document.querySelector('input[name=kat]:checked').value === 'TUKANG';
    if (FANT()) { if (!SK.JOBS.some(j => j.av === ST.av)) ST.av = 'CEWEK3';
      SK.JOBS.forEach(j => { const b = document.createElement('button'); b.type = 'button'; b.className = 'av'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', j.av === ST.av);
        const c = document.createElement('canvas'); c.width = 72; c.height = 88; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; SK.R(x, 0, 0, 72, 88, '#5a3418'); SK.jobPortrait(x, 0, 0, j);
        const s = document.createElement('span'); s.textContent = j.label; b.append(c, s); b.onclick = () => { ST.av = j.av; buildAvs(); preview(); }; wrap.append(b); }); return; }
    SK.AV.forEach(a => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'av'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', a.id === ST.av);
      const c = document.createElement('canvas'); c.width = 72; c.height = 88; const x = c.getContext('2d');
      SK.R(x, 0, 0, 72, 88, '#1c1c24'); SK.R(x, 3, 3, 66, 82, '#8fd0fb'); SK.R(x, 3, 58, 66, 27, '#72c44c');
      x.save(); x.beginPath(); x.rect(3, 3, 66, 82); x.clip(); SK.avatar(x, 0, 0, a.id, tk); x.restore();
      const s = document.createElement('span'); s.textContent = a.label; b.append(c, s);
      b.onclick = () => { ST.av = a.id; buildAvs(); preview(); };
      wrap.append(b);
    });
  }
  function status(msg, err) { const s = $('status'); s.textContent = msg; s.classList.toggle('err', !!err); }

  function showMine(w) {
    ST.mine = w; $('daftar').hidden = true; $('punya').hidden = false;
    $('punyaTxt').textContent = `Nomor induk ${pad(w.no)} atas nama ${w.nama}. Namamu sudah jalan-jalan di peta Kota Sikepo.`;
    const rs = SK.render(cardData(w, 'story')), rk = SK.render(cardData(w, 'kartu'));
    $('dlStory').href = rs.big.toDataURL('image/png'); $('dlStory').download = fname(w, 'story');
    $('dlKartu').href = rk.big.toDataURL('image/png'); $('dlKartu').download = fname(w, 'kartu');
    preview();
  }

  // ---------- map pick popup ----------
  function pick(w) {
    if (!w) { $('pick').hidden = true; return; }
    $('pick').hidden = false; drawTo($('pickCard'), cardData(w, 'kartu'));
    const tgl = w.created_at ? new Date(w.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    $('pickTxt').textContent = `${FANT() ? SK.jobOf(w).label : (w.kat === 'TUKANG' ? 'Tukang' : 'Warga')} #${pad(w.no)} · bergabung hari ke-${w.hari || 1}${tgl ? ' · ' + tgl : ''}`;
  }

  // ---------- stats ----------
  function renderStats() {
    const s0 = ST.stats || {}, YT_LAMA = 4007;   // Kepo Fantasy: subscriber YouTube lama (gugur kena meteor) tidak dihitung
    const s = FANT() ? Object.assign({}, s0, { youtube: Math.max(0, (s0.youtube || 0) - YT_LAMA) }) : s0, total = (s.ig || 0) + (s.tiktok || 0) + (s.youtube || 0);
    if (FANT()) { const st = document.querySelector('#sTotal + .s'); if (st) st.textContent = 'warga yang selamat'; const k = document.querySelector('#sTotal') && document.querySelector('#sTotal').previousElementSibling; if (k) k.textContent = 'WARGA HIDUP'; }
    $('hWarga').textContent = fmt(total); $('hBangunan').textContent = fmt(s.bangunan); $('hKoin').textContent = fmt(s.koin);
    $('sTotal').textContent = fmt(total); $('sKartu').textContent = fmt(ST.warga.length); $('sKoin').textContent = fmt(s.koin); $('sBangunan').textContent = fmt(s.bangunan); $('sHari').textContent = s.hari || '—';
    const rows = [['INSTAGRAM', s.ig, '#f07aa8'], ['TIKTOK', s.tiktok, '#2aa89a'], [FANT() ? 'YOUTUBE (BARU)' : 'YOUTUBE', s.youtube, '#e02f2f']];
    const mx = Math.max(1, ...rows.map(r => r[1] || 0));
    $('bars').innerHTML = '';
    rows.forEach(([k, v, col]) => {
      const d = document.createElement('div'); d.className = 'bar';
      const lb = document.createElement('span'); lb.className = 'lb'; lb.textContent = k;
      const tr = document.createElement('div'); tr.className = 'tr'; const fl = document.createElement('div'); fl.className = 'fl'; fl.style.width = Math.max(2, (v || 0) / mx * 100) + '%'; fl.style.background = col; tr.append(fl);
      const vv = document.createElement('span'); vv.className = 'v'; vv.textContent = fmt(v);
      d.append(lb, tr, vv); $('bars').append(d);
    });
    $('sUpdated').textContent = s.updated_at ? 'Diperbarui ' + new Date(s.updated_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' WIB' : '';
    if (s.pengumuman) { $('pengumuman').hidden = false; $('pengumuman').textContent = '📢 ' + s.pengumuman; } else $('pengumuman').hidden = true;
    applyFantasy && applyFantasy();
    const baru = ST.warga.slice().sort((a, b) => b.no - a.no).slice(0, 3); $('baru').innerHTML = '';
    if (!baru.length) { const li = document.createElement('li'); li.textContent = 'Belum ada. Jadilah warga pertama yang punya kartu!'; $('baru').append(li); }
    baru.forEach(w => { const li = document.createElement('li'); const b = document.createElement('button'); b.textContent = w.nama; b.onclick = () => { location.hash = 'peta'; PETA.focus(w.no); pick(w); };
      const n = document.createElement('span'); n.className = 'no'; n.textContent = '#' + pad(w.no) + (w.kat === 'TUKANG' ? ' · TUKANG' : ''); li.append(b, n); $('baru').append(li); });
  }
  // Hari 3 (12 Nov 10.00 WIB): Udin hapus BUDGET -> statistik KOIN dihapus dari website
  const noKoin = () => window.SIKEPO_FORCE_KOTA ?? (Date.now() >= Date.parse('2026-11-12T03:00:00Z'));
  function applyKoin() { if (!noKoin()) return; document.body.classList.add('nokoin'); ['chipKoin', 'statKoin'].forEach(id => { const e = $(id); if (e) e.hidden = true; e && (e.style.display = 'none'); });
    const li = $('caraLike'); if (li && !li.dataset.done) { li.dataset.done = 1; li.innerHTML = '<b>Like</b> &amp; share videonya biar kotanya makin rame. Sekarang bangun apa aja <b>tanpa budget</b>!'; } }
  // Kepo Fantasy (12 Nov 18.00 WIB): panel misi; Poin Guild disimpan di kolom stats.koin, tenda di stats.bangunan
  const Q = { target: 200 };
  function applyFantasy() { const f = PETA.fantasy && PETA.fantasy(); $('quest').hidden = !f; if (!f) return; if (PETA.setTents && ST.stats) PETA.setTents(ST.stats.bangunan || 0); document.body.classList.add('fantasy'); if (!ST.fx) { ST.fx = 1; const fs = document.querySelector('fieldset.kat'); if (fs) fs.hidden = true; const h2 = document.querySelector('#kartu h2'); if (h2) h2.textContent = 'Bikin Kartu Petualang';
      const ld = document.querySelector('#kartu .lead'); if (ld) ld.textContent = 'Isi username, pilih job petualangmu, dan kartumu langsung jadi. Namamu ikut bertualang di peta Kepo Fantasy. Satu orang satu kartu ya.';
      const lb = $('avLbl'); if (lb) lb.textContent = 'PILIH JOB'; const nv = document.querySelector('nav a[href="#kartu"]'); if (nv) nv.textContent = 'Kartu Petualang';
      $('kirim').textContent = 'BIKIN KARTU PETUALANG'; buildAvs(); preview(); } const tp = $('toPov'); if (tp) tp.hidden = true; const mt = $('mapTip'); if (mt) mt.textContent = 'Geser peta · zoom · klik warga untuk lihat kartu · klik Udin The Goblin untuk disapa';
    const s = ST.stats || {}, pts = s.koin || 0, k = Math.min(1, pts / Q.target); $('qFill').style.width = (k * 100) + '%'; $('qNum').textContent = fmt(pts) + ' / ' + fmt(Q.target) + ' POIN';
    const lb = document.querySelector('#hBangunan') && document.querySelector('#hBangunan').previousElementSibling; if (lb) lb.textContent = 'TENDA';
    const sl = document.querySelector('#sBangunan') && document.querySelector('#sBangunan').previousElementSibling; if (sl) sl.textContent = 'TENDA'; }
  function clock() { applyKoin(); applyFantasy();
    const h = PETA.wib(), hh = Math.floor(h), mm = Math.round((h - hh) * 60) % 60;
    $('clock').textContent = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    const CI = { CERAH: '☀ CERAH', BERAWAN: '☁ BERAWAN', GERIMIS: '🌦 GERIMIS', HUJAN: '🌧 HUJAN', BADAI: '⛈ BADAI PETIR' }, cw = PETA.cuaca ? PETA.cuaca() : 'CERAH';
    $('fase').textContent = (PETA.isNight() ? (PETA.fantasy && PETA.fantasy() ? 'MALAM, WARGA KETAKUTAN' : 'MALAM, WARGA TIDUR') : (h < 11 ? 'PAGI' : h < 15 ? 'SIANG' : 'SORE')) + ' · ' + (PETA.isNight() && cw === 'CERAH' ? '☾ CERAH' : CI[cw] || cw);
  }

  // ---------- events ----------
  $('nama').addEventListener('input', preview);
  document.querySelectorAll('input[name=kat]').forEach(r => r.addEventListener('change', () => { buildAvs(); preview(); }));
  $('daftar').addEventListener('submit', async e => {
    e.preventDefault();
    const d = formData();
    if (d.nama.length < 2) { status('Nama minimal 2 karakter (huruf, angka, titik, garis bawah, @, spasi).', true); $('nama').focus(); return; }
    $('kirim').disabled = true; status('Mendaftarkan kartu…');
    try {
      const w = await DATA.daftar({ nama: d.nama, kat: d.kat, av: d.av, hari: d.hari });
      if (!ST.warga.some(x => x.no === w.no)) { ST.warga.push(w); PETA.add(w); }
      status(''); showMine(w); renderStats();
    } catch (err) {
      const k = err && err.kode;
      status(k === 'nama_dipakai' ? 'Nama itu sudah dipakai warga lain. Coba nama lain.' : k === 'sudah_daftar' ? 'Kamu sudah punya kartu dari perangkat ini.' : k === 'nama_tidak_valid' ? 'Nama berisi karakter yang tidak boleh.' : k === 'login_gagal' ? 'Pendaftaran sedang ditutup sementara. Coba lagi nanti.' : 'Gagal mendaftar. Periksa koneksi lalu coba lagi.', true);
    } finally { $('kirim').disabled = false; }
  });
  $('lihatPeta').onclick = () => { location.hash = 'peta'; if (ST.mine) { PETA.focus(ST.mine.no); pick(ST.mine); } };
  $('cari').addEventListener('submit', e => {
    e.preventDefault(); const q = cleanNama($('q').value); if (!q) return;
    const w = ST.warga.find(x => x.nama === q) || ST.warga.find(x => x.nama.includes(q));
    if (w) { PETA.focus(w.no); pick(w); } else { pick(null); $('q').value = ''; $('q').placeholder = 'Belum ketemu. Bikin kartu dulu ya!'; }
  });
  $('zIn').onclick = () => PETA.zoom(1.3); $('zOut').onclick = () => PETA.zoom(1 / 1.3); $('zReset').onclick = () => { PETA.reset(); pick(null); };
  $('allNames').onclick = () => { const v = $('allNames').getAttribute('aria-pressed') !== 'true'; $('allNames').setAttribute('aria-pressed', v); PETA.showAll(v); };
  $('pickX').onclick = () => pick(null);
  setTimeout(() => { const t = $('mapTip'); if (t) t.style.opacity = '0'; }, 7000);

  // sosial media
  [['INSTAGRAM', C.LINK_IG], ['TIKTOK', C.LINK_TIKTOK], ['YOUTUBE', C.LINK_YOUTUBE]].forEach(([k, u]) => { if (!u) return; ['sosmed', 'sosTop', 'sosFoot'].forEach(id => { const box = $(id); if (!box) return; const a = document.createElement('a'); a.className = 'btn sm sos ' + k.toLowerCase(); a.href = u; a.target = '_blank'; a.rel = 'noopener'; a.textContent = (id === 'sosTop' ? 'FOLLOW ' : '') + k; box.append(a); }); });

  // ---------- akun Google ----------
  function renderAkun() { const box = $('akun'); if (!C.GOOGLE_LOGIN || DATA.mode !== 'live') { box.hidden = true; $('perluLogin').hidden = true; return; }
    const ak = DATA.akun(); box.hidden = false; box.innerHTML = '';
    if (ak) { if (ak.foto) { const im = document.createElement('img'); im.src = ak.foto; im.alt = ''; im.referrerPolicy = 'no-referrer'; box.append(im); }
      const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = ak.nama; const out = document.createElement('button'); out.className = 'btn sm alt'; out.type = 'button'; out.textContent = 'KELUAR'; out.onclick = () => DATA.logout(); box.append(nm, out); }
    else { const b = document.createElement('button'); b.className = 'btn sm google'; b.type = 'button'; b.textContent = 'MASUK GOOGLE'; b.onclick = goLogin; box.append(b); }
    const need = !ak && !ST.mine; $('perluLogin').hidden = !need; $('daftar').hidden = need || !!ST.mine; }
  async function goLogin() { try { await DATA.loginGoogle(); } catch (e) { status('Login Google belum bisa. Coba lagi nanti.', true); } }
  $('btnGoogle2').onclick = goLogin;
  // ---------- boot ----------
  (async () => {
    if (DATA.mode === 'demo') { $('demoBar').hidden = false; $('fMode').textContent = 'mode demo'; } else $('fMode').textContent = 'peta live';
    PETA.init($('map')); PETA.onPick(pick); POV.init(); PETA.onSawit(() => POV.open()); $('toPov').onclick = () => POV.open(); buildAvs(); clock(); setInterval(clock, 20000); setTimeout(clock, 300);
    const bgReady = new Promise(r => { const im = SK.BG.hari2; if (im.complete) r(); else { im.onload = r; im.onerror = r; } });
    try {
      await DATA.init();
      const [warga, stats, mine] = await Promise.all([DATA.listWarga(), DATA.stats(), DATA.myCard()]);
      ST.warga = warga || []; ST.stats = stats || {}; PETA.setWarga(ST.warga);
      await bgReady; renderStats();
      if (mine) showMine(mine); else preview();
    } catch (e) { status('Data kota belum bisa dimuat. Coba muat ulang halaman.', true); await bgReady; preview(); renderStats(); }
    renderAkun(); DATA.onAuth(async () => { renderAkun(); const m = await DATA.myCard(); if (m) showMine(m); });
    DATA.onNew(w => { if (ST.warga.some(x => x.no === w.no)) return; ST.warga.push(w); PETA.add(w); renderStats(); });
  })();
})();
