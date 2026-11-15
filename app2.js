// UI v2: aplikasi peta full-screen (gaya pixel Kepo Fantasy): bar cari, siaran, penghitung, pin tempat, navigasi bawah, sheet Guild/Kabar, chat tavern
(function () {
  const $ = id => document.getElementById(id), C = window.SIKEPO_CONFIG || {};
  const fmt = n => (n == null ? '—' : Number(n).toLocaleString('id-ID'));
  const ST = () => window.KF_ST || { warga: [], stats: {} };
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  // ---------- ikon pixel (svg, crisp) ----------
  const PX = (rows, col) => { let r = ''; rows.forEach((s, y) => [...s].forEach((c, x) => { if (c !== '.') r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${col[c]}"/>`; }));
    return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' shape-rendering='crispEdges'>${r.replace(/"/g, "'")}</svg>`)}")`; };
  const ICON = {
    peta: PX(['............', '.aa.bbb.aa..', '.aabbbbbaab.', '.aab.cbbaab.', '.aabbbbbaab.', '.aabbcbbaab.', '.aabbbbbaab.', '.aab.bbbaab.', '.aabbbbbaab.', '.aa.bbb.aa..', '............', '............'], { a: '#72c44c', b: '#ffd84a', c: '#e02f2f' }),
    tavern: PX(['............', '..aaaaaa....', '..abbbbaccc.', '..abbbbac.c.', '..abbbbac.c.', '..abbbbaccc.', '..abbbba....', '..abbbba....', '..aaaaaa....', '............', '............', '............'], { a: '#fff6dc', b: '#ffb03a', c: '#fff6dc' }),
    kartu: PX(['............', '.aaaaaaaaaa.', '.abbbbbbbba.', '.abccbddddа.', '.abccbbbbba.', '.abccbddda..', '.abbbbbbbba.', '.abddddddba.', '.abbbbbbbba.', '.aaaaaaaaaa.', '............', '............'].map(r => r.replace('а', 'a').replace('a..', 'aa.')), { a: '#1c1c24', b: '#fff6dc', c: '#e02f2f', d: '#8a8a96' }),
    guild: PX(['..........a.', '.........aa.', '........aa..', '..a....aa...', '...a..aa....', '....aaa.....', '.....aa.....', '....a.aa....', '...bb..a....', '..bb........', '.bb.........', '............'], { a: '#c8c8d8', b: '#a8763e' }),
    kabar: PX(['............', '.aaaaaaaaa..', '.abbbbbbba..', '.abccccbba..', '.abbbbbbbaa.', '.abddddddba.', '.abbbbbbbba.', '.abddddddba.', '.abbbbbbbba.', '..aaaaaaaa..', '............', '............'], { a: '#c8a040', b: '#fff6dc', c: '#e02f2f', d: '#8a8a96' }),
    gua: PX(['............', '...aaaaaa...', '..aabbbbaa..', '.aab.bb.baa.', '.abcbbbbcba.', '.abbbbbbbba.', '.abdbdbdbba.', '.abbbbbbbba.', '............', '............', '............', '............'], { a: '#5a6680', b: '#0a0608', c: '#ff5a2a', d: '#e8e0d0' }),
    bengkel: PX(['............', '..aaaa......', '..aaaab.....', '...aa.b.....', '......b.....', '......b.....', '...cccccc...', '..cccccccc..', '....cccc....', '...cccccc...', '............', '............'], { a: '#c8c8d8', b: '#a8763e', c: '#6a6a76' })
  };
  document.querySelectorAll('.ic').forEach(i => { const k = [...i.classList].find(c => c.startsWith('ic-')).slice(3); if (ICON[k]) i.style.backgroundImage = ICON[k]; });

  // ---------- bar cari, jam, siaran, penghitung ----------
  const slot = $('ui-cari-slot'), cari = $('cari'); if (slot && cari) { slot.append(cari); const q = $('q'); if (q) q.placeholder = 'Cari petualang, job, tempat…'; }
  function tick() {
    const ck = $('clock'), fs = $('fase'); if (ck) { $('uiJam').textContent = ck.textContent; $('uiClockS').textContent = ck.textContent; } if (fs) $('uiFase').textContent = fs.textContent;
    const st = ST(), s = st.stats || {}; $('uiWarga').textContent = ($('hWarga') || {}).textContent || '—'; $('uiKartu').textContent = fmt((st.warga || []).length);
    const p = (s.pengumuman || '').trim(); if (p) { $('uiSiaranJ').textContent = '📜 ' + p; let d = $('siaranP'); if (!d) { d = document.createElement('p'); d.id = 'siaranP'; $('siaranB').prepend(d); const q = $('quest'); if (q) $('siaranB').append(q); } d.textContent = p; $('uiSiaran').hidden = store.get('kf_siaran_x') === p; }
  }
  $('uiSiaranX').onclick = () => { store.set('kf_siaran_x', (ST().stats || {}).pengumuman || ''); $('uiSiaran').hidden = true; };
  $('uiSiaranT').onclick = () => open('siaran');

  // ---------- pin tempat ----------
  const PINS = [
    { id: 'tavern', ic: 'tavern', t: 'TAVERN GUILD', on: () => window.FANT3 && FANT3.tavern() >= 4, at: () => [FANT3.CAMP.x, FANT3.CAMP.y - 66], go: () => openTavern() },
    { id: 'gua', ic: 'gua', t: 'GUA NAGA', on: () => false, at: () => [180, 40], go: () => toast('GUA NAGA', 'Mata merahnya selalu mengawasi desa. Jangan dekat-dekat sebelum party siap!') },
    { id: 'bengkel', ic: 'bengkel', t: 'BENGKEL', on: () => window.FANT3 && FANT3.tavern() >= 4 && ((ST().stats || {}).hari || 0) >= 3, at: () => [FANT3.CAMP.x + 78, FANT3.CAMP.y + 26], sub: () => ($('qNum') || {}).textContent || '', go: () => open('siaran') }
  ];
  const pinBox = $('uiPins'); PINS.forEach(p => { const b = document.createElement('button'); b.className = 'pin'; b.type = 'button'; b.innerHTML = `<i class="ic"></i><b></b>`; b.querySelector('i').style.backgroundImage = ICON[p.ic]; b.onclick = p.go; p.el = b; pinBox.append(b); });
  function pinLoop() { const map = $('map'); if (map && window.PETA && PETA.screenOf) { const r = map.getBoundingClientRect();
      PINS.forEach(p => { const v = p.on(); p.el.hidden = !v; if (!v) return; const [x, y] = PETA.screenOf(...p.at()); p.el.style.transform = `translate(${Math.round(r.left + x)}px, ${Math.round(r.top + y)}px)`; p.el.querySelector('b').textContent = p.t + (p.sub ? ' ' + p.sub().replace(' POIN', '') : ''); }); }
    requestAnimationFrame(pinLoop); }
  requestAnimationFrame(pinLoop);

  // ---------- toast ----------
  let tt = 0; function toast(j, s) { let t = $('uiToast'); if (!t) { t = document.createElement('div'); t.id = 'uiToast'; t.className = 'ui-toast px'; document.body.append(t); } t.innerHTML = ''; const b = document.createElement('b'); b.textContent = j; const p = document.createElement('p'); p.textContent = s; t.append(b, p); t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 4500); }

  // ---------- sheet: guild & kabar ----------
  function guild() { const b = $('guildB'); b.innerHTML = ''; const w = ST().warga || [], by = {};
    SK.JOBS.forEach(j => by[j.id] = []); w.forEach(x => { const j = SK.jobOf(x); (by[j.id] = by[j.id] || []).push(x); });
    const h = document.createElement('div'); h.className = 'g-party'; h.innerHTML = '<b>PARTY DUNGEON LANTAI 1</b><small>Udin pilih 10 orang: 4 Warrior · 2 Barbarian · 2 Ranger · 2 Mage. Komen job kamu + kirim Kartu Petualang di komen video!</small>'; b.append(h);
    SK.JOBS.forEach(j => { const row = document.createElement('div'); row.className = 'g-row'; const c = document.createElement('canvas'); c.width = 24; c.height = 28; c.getContext('2d').drawImage(SK.JSPR[j.id], 0, 0);
      const t = document.createElement('div'); const n = document.createElement('b'); n.textContent = j.label + ' · ' + by[j.id].length; const s = document.createElement('small'); s.textContent = by[j.id].slice(-6).reverse().map(x => x.nama).join(', ') || 'Belum ada. Jadilah yang pertama!'; t.append(n, s); row.append(c, t); b.append(row); }); }
  const KABAR = [
    ['DAY 3', 'Tavern jadi! Makanan menipis', 'Cahaya memperluas tanah. Udin butuh 10 petualang ke Dungeon Lantai 1, warga bangun bengkel (150 poin).'],
    ['DAY 2', 'Penduduk bertambah, bangun Tavern', 'Tenda berdiri, warga sibuk menebang pohon, ngobrol, dan mancing. Misi: Tavern Guild 200 poin.'],
    ['DAY 1', 'Tersedot ke Kepo Fantasy', 'Meteor menghantam Kota Sikepo. Warga yang selamat terbangun di dunia lain, ketua guild: Udin The Goblin.']
  ];
  function kabar() { const b = $('kabarB'); b.innerHTML = ''; KABAR.forEach(([d, j, s]) => { const a = document.createElement('article'); a.className = 'k-item'; const t = document.createElement('span'); t.className = 'ui-tag'; t.textContent = d; const h = document.createElement('b'); h.textContent = j; const p = document.createElement('p'); p.textContent = s; a.append(t, h, p); b.append(a); });
    const r = $('rules'); if (r) b.append(r); const so = $('sosmed'); if (so) { const w = document.createElement('div'); w.className = 'k-sos'; w.append(so); b.append(w); } }

  // ---------- navigasi ----------
  const SHEETS = { guild: 'sheetGuild', kabar: 'sheetKabar', siaran: 'sheetSiaran', kartu: 'kartu' };
  function closeAll() { Object.values(SHEETS).forEach(id => { const e = $(id); if (e) e.classList.remove('open'); ['sheetGuild', 'sheetKabar', 'sheetSiaran'].forEach(i => $(i).hidden = true); }); document.body.classList.remove('v-kartu'); }
  function nav(v) { document.querySelectorAll('#uiNav button').forEach(b => b.toggleAttribute('aria-current', b.dataset.v === v)); }
  function open(v) { closeAll(); nav(v);
    if (v === 'guild') { guild(); $('sheetGuild').hidden = false; } else if (v === 'kabar') { kabar(); $('sheetKabar').hidden = false; } else if (v === 'siaran') { tick(); $('sheetSiaran').hidden = false; }
    else if (v === 'kartu') document.body.classList.add('v-kartu'); else if (v === 'tavern') { openTavern(); nav('peta'); } }
  function openTavern() { const st = ST(); if (window.TAVERN) TAVERN.open(st.mine, st.warga); chatInit(); }
  document.querySelectorAll('#uiNav button').forEach(b => b.onclick = () => open(b.dataset.v));
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => { closeAll(); nav('peta'); });
  addEventListener('hashchange', () => { if (location.hash === '#kartu') open('kartu'); else if (location.hash === '#peta') { closeAll(); nav('peta'); } });
  const kx = document.createElement('button'); kx.className = 'ui-x kartu-x'; kx.textContent = '×'; kx.setAttribute('aria-label', 'Tutup kartu'); kx.onclick = () => { closeAll(); nav('peta'); history.replaceState(null, '', '#peta'); }; const ks = $('kartu'); if (ks) ks.prepend(kx);

  // ---------- chat tavern (syarat: punya Kartu Petualang) ----------
  let chatOn = false;
  async function chatLoad() { if (!window.DATA || !DATA.chatList) return; let L = []; try { L = await DATA.chatList(); } catch (e) { $('chatList').textContent = 'Obrolan belum bisa dimuat.'; return; }
    const box = $('chatList'); box.innerHTML = ''; if (!L.length) { const p = document.createElement('p'); p.className = 'chat-empty'; p.textContent = 'Belum ada obrolan. Sapa petualang lain!'; box.append(p); }
    L.forEach(m => { const d = document.createElement('div'); d.className = 'chat-m'; const n = document.createElement('b'); n.textContent = m.nama || 'WARGA'; const t = document.createElement('span'); t.textContent = m.isi; d.append(n, t); box.append(d); });
    box.scrollTop = box.scrollHeight; $('chatN').textContent = L.length ? '(' + L.length + ')' : '';
    const last = L[L.length - 1]; if (last && window.TAVERN && TAVERN.bubble) TAVERN.bubble(last.no, last.isi); }
  function chatInit() { const mine = ST().mine; $('chatLock').hidden = !!mine; $('chatF').hidden = !mine;
    $('chatLock').querySelector('p').textContent = 'Mau chat dengan player lain? Bikin Kartu Petualang dulu, gratis!'; const bt = $('chatLogin'); bt.disabled = false; bt.textContent = 'BIKIN KARTU PETUALANG';
    bt.onclick = () => { if (window.TAVERN) TAVERN.close(); open('kartu'); };
    if (!chatOn) { chatOn = true; DATA.onChat && DATA.onChat(chatLoad); } chatLoad(); }
  $('chatH').onclick = () => { $('chatB').hidden = !$('chatB').hidden; };
  $('chatF').addEventListener('submit', async e => { e.preventDefault(); const i = $('chatIn'), v = i.value; if (!v.trim()) return; i.disabled = true;
    try { await DATA.chatSend(v, ST().mine); i.value = ''; } catch (x) { toast('OBROLAN', x.kode === 'terlalu_cepat' ? 'Pelan-pelan, tunggu 3 detik ya.' : x.kode === 'perlu_kartu' ? 'Bikin Kartu Petualang dulu untuk chat.' : 'Pesan gagal terkirim. Coba lagi.'); }
    finally { i.disabled = false; i.focus(); } });

  // ---------- boot ----------
  document.body.classList.add('app'); setInterval(tick, 2000); setTimeout(tick, 400); setTimeout(() => window.PETA && PETA.resize && PETA.resize(), 50);
  if (location.hash === '#kartu') setTimeout(() => open('kartu'), 300);
})();
