// Lapisan data: Supabase (live) atau mode demo (localStorage)
(function () {
  const C = window.SIKEPO_CONFIG || {};
  const live = !!(C.SUPABASE_URL && C.SUPABASE_ANON_KEY && window.supabase);
  let sb = null, uid = null;
  const DEMO_KEY = 'sikepo-demo-v1';
  const demoSeed = () => ({
    warga: [
      { no: 1, nama: 'KITSUNE1ST', kat: 'WARGA', av: 'MISTERI', hari: 1, created_at: '2026-11-09T10:00:00Z' },
      { no: 2, nama: 'AZUKA_KUN_', kat: 'WARGA', av: 'MISTERI', hari: 1, created_at: '2026-11-09T10:00:00Z' },
      { no: 3, nama: 'SIGMAUVVUFUEFE', kat: 'WARGA', av: 'MISTERI', hari: 1, created_at: '2026-11-09T10:00:00Z' },
      { no: 4, nama: 'CONTOH WARGA', kat: 'TUKANG', av: 'COWOK3', hari: 2, created_at: '2026-11-10T10:00:00Z' },
      { no: 5, nama: 'CONTOH WARGI', kat: 'WARGA', av: 'CEWEK2', hari: 2, created_at: '2026-11-10T11:00:00Z' }
    ],
    mine: null,
    stats: { ig: 29, tiktok: 48, youtube: 4050, koin: 0, bangunan: 1, hari: 2, pengumuman: 'Mode demo: data contoh.', updated_at: new Date().toISOString() }
  });
  function demo() { try { return JSON.parse(localStorage.getItem(DEMO_KEY)) || demoSeed(); } catch (e) { return demoSeed(); } }
  function demoSave(d) { try { localStorage.setItem(DEMO_KEY, JSON.stringify(d)); } catch (e) {} }
  const listeners = [];

  const API = {
    mode: live ? 'live' : 'demo',
    async init() {
      if (!live) return;
      sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, { auth: { persistSession: true } });
      const { data } = await sb.auth.getSession();
      if (data && data.session) uid = data.session.user.id;
      sb.channel('warga-baru').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'warga' },
        p => listeners.forEach(f => f(p.new))).subscribe();
    },
    async listWarga() {
      if (!live) return demo().warga;
      const out = []; let from = 0;
      for (;;) {   // ambil per 1000 baris
        const { data, error } = await sb.from('warga').select('no,nama,kat,av,hari,created_at').order('no').range(from, from + 999);
        if (error) throw error; out.push(...data); if (data.length < 1000) break; from += 1000;
      }
      return out;
    },
    async stats() {
      if (!live) return demo().stats;
      const { data, error } = await sb.from('stats').select('*').eq('id', 1).maybeSingle();
      if (error) throw error; return data;
    },
    async myCard() {
      if (!live) { const d = demo(); return d.mine ? d.warga.find(w => w.no === d.mine) || null : null; }
      if (!uid) return null;
      const { data } = await sb.from('warga').select('no,nama,kat,av,hari,created_at').eq('owner', uid).maybeSingle();
      return data || null;
    },
    async daftar(row) {   // row: {nama, kat, av, hari}
      if (!live) {
        const d = demo();
        if (d.mine) throw { kode: 'sudah_daftar' };
        if (d.warga.some(w => w.nama.toLowerCase() === row.nama.toLowerCase())) throw { kode: 'nama_dipakai' };
        const no = d.warga.reduce((m, w) => Math.max(m, w.no), 0) + 1;
        const w = { no, ...row, created_at: new Date().toISOString() };
        d.warga.push(w); d.mine = no; demoSave(d); listeners.forEach(f => f(w)); return w;
      }
      if (!uid) {
        const { data, error } = await sb.auth.signInAnonymously();
        if (error) throw { kode: 'login_gagal', pesan: error.message };
        uid = data.user.id;
      }
      const { data, error } = await sb.from('warga').insert(row).select('no,nama,kat,av,hari,created_at').single();
      if (error) {
        if (error.code === '23505') throw { kode: 'nama_dipakai' };
        if (error.code === '42501') throw { kode: 'sudah_daftar' };
        if (error.code === '23514') throw { kode: 'nama_tidak_valid' };
        throw { kode: 'gagal', pesan: error.message };
      }
      return data;
    },
    onNew(f) { listeners.push(f); },
    resetDemo() { try { localStorage.removeItem(DEMO_KEY); } catch (e) {} }
  };
  window.DATA = API;
})();
