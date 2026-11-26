// Penghitung "online sekarang" (Supabase Realtime presence, tanpa tabel) + tanggal di jam + jumlah pemilik kartu di sheet Kartu
(function () {
  const C = window.SIKEPO_CONFIG || {}, $ = id => document.getElementById(id);
  function setN(n) { const e = $('uiOnline'); if (e) e.textContent = Math.max(1, n).toLocaleString('id-ID'); }
  try { if (window.supabase && C.SUPABASE_URL && C.SUPABASE_ANON_KEY) {
      const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false, storageKey: 'sikepo-online' } });
      const id = Math.random().toString(36).slice(2), ch = sb.channel('online-kota', { config: { presence: { key: id } } });
      const sync = () => { const S = ch.presenceState(), on = new Set(); Object.values(S).forEach(a => a.forEach(m => { if (m.no) on.add(m.no); })); if (window.__mineNo) on.add(window.__mineNo); window.SIKEPO_ONLINE = on; setN(Object.keys(S).length); };
      ch.on('presence', { event: 'sync' }, sync)
        .subscribe(st => { if (st === 'SUBSCRIBED') ch.track({ t: Date.now(), no: window.__mineNo || null }); });
      window.addEventListener('mineNo', () => { ch.track({ t: Date.now(), no: window.__mineNo || null }); sync(); });
    } } catch (e) {}
  const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'], BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  function tgl() { const d = new Date(Date.now() + 7 * 3600e3); return HARI[d.getUTCDay()] + ', ' + d.getUTCDate() + ' ' + BLN[d.getUTCMonth()]; }
  setInterval(() => { const f = $('uiFase'); if (f && f.textContent && !f.textContent.includes(',')) f.textContent = tgl() + ' · ' + f.textContent;
    const k = $('uiKartu'), n = $('kiN'); if (k && n && k.textContent !== '—') n.textContent = k.textContent; }, 1000);
})();
