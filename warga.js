// Sprite warga bertekstur (digambar kode) + kostum sesuai pekerjaan. window.WSPR.get(w, ph, pose) -> canvas 44x64
(function () {
  const COST = {
    warga: {}, polisi: { shirt: '#2a3a6e', pants: '#1c2440', hat: ['cap', '#1c2440'], badge: '#ffd84a' }, brimob: { shirt: '#2a2e36', pants: '#1c1c24', hat: ['baret', '#3a2a5a'], badge: '#ffd84a' },
    damkar: { shirt: '#22305a', pants: '#22305a', hat: ['helm', '#d8302a'], stripe: '#f2e030' }, dokter: { shirt: '#f4f4f4', pants: '#5a8ac8', coat: 1, steth: 1 }, perawat: { shirt: '#7ac8e8', pants: '#7ac8e8', hat: ['cap', '#f4f4f4'] },
    guru: { shirt: '#b8955a', pants: '#6a5030', badge: '#2a6fd8' }, satpam: { shirt: '#f2f2f2', pants: '#1c2440', hat: ['cap', '#1c2440'], badge: '#c8302a' }, pekerja: { shirt: '#2a6fd8', pants: '#3a4258', hat: ['helm', '#ffc020'], vest: '#ff7a1a' },
    petani: { shirt: '#7a5a3a', pants: '#3a3020', hat: ['caping', '#d8b46a'] }, ustadz: { shirt: '#f4f4f4', pants: '#e8e8e8', hat: ['peci', '#1c1c24'] }, kasir: { shirt: '#d8302a', pants: '#2a2a3a', hat: ['cap', '#d8302a'] } };
  const CIV = ['#e8453c', '#2f7de1', '#f2c230', '#2fae5f', '#9b59d0', '#ff8a2a', '#1fb5b0', '#e85ab0', '#8ac83a'], SKIN = ['#f0c090', '#e8a878', '#c88a58', '#a8704a'], HAIR = ['#2a1c14', '#4a3020', '#1c1c24', '#6a4a2a'];
  const sh = (c, k) => { const n = parseInt(c.slice(1), 16), f = x => Math.max(0, Math.min(255, Math.round(x * k))); return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')'; };
  function rng(seed) { let s = (seed * 9301 + 49297) % 233280 || 1; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
  function jobKey(label) { const l = (label || '').toLowerCase();
    for (const [k, re] of [['brimob', /brimob/], ['polisi', /polisi|polwan|bintara|tamtama|kepala polisi/], ['damkar', /damkar|pemadam/], ['dokter', /dokter|direktur rs|anestesi/], ['perawat', /perawat/], ['guru', /guru|kepala sekolah|kepsek/], ['satpam', /satpam|ronda/], ['ustadz', /ustad|imam|marbot|masjid/], ['petani', /petani|kilang|kebun/], ['kasir', /kasir|minimarket|mart|warung/], ['pekerja', /kuli|arsitek|sopir|tukang|parkir/]]) if (re.test(l)) return k;
    return 'warga'; }
  function jobOf(w) { const J = window.SIKEPO_JOBS || [], n = String(w.sosmed || w.tiktok || w.nama || '').toLowerCase().replace(/^@/, '').trim(); if (!n) return 'warga';
    const hit = J.find(([u]) => u.toLowerCase().replace(/^@/, '') === n) || J.find(([u, j]) => n.length > 3 && (j.toLowerCase().includes('(' + n + ')') || u.toLowerCase().includes(n))); return hit && hit[2] !== 'DIPENJARA' ? jobKey(hit[1]) : 'warga'; }
  function draw(w, ph, pose) {
    const job = jobOf(w), c = COST[job] || {}, r = rng((w.no | 0) * 7 + 3), av = String(w.av || ''), female = av.startsWith('CEWEK') || (!av && r() < 0.45);
    const shirt = c.shirt || CIV[Math.floor(r() * CIV.length)], pants = c.pants || ['#3a4258', '#2a2a3a', '#5a3a1a', '#4a6a9a'][Math.floor(r() * 4)], skin = SKIN[Math.floor(r() * 4)], hair = HAIR[Math.floor(r() * 4)];
    const hijab = female && ['warga', 'guru', 'perawat', 'dokter', 'kasir'].includes(job) && (av === 'CEWEK2' || r() < 0.3), skirt = female && job === 'warga' && r() < 0.6, stripe = job === 'warga' && r() < 0.5 ? CIV[Math.floor(r() * CIV.length)] : null, hcol = ['#c86b8a', '#5a8ac8', '#8a6ac8', '#2fae5f', '#e8a040'][Math.floor(r() * 5)], shoe = ['polisi', 'brimob', 'damkar', 'satpam'].includes(job) ? '#1c1c24' : ['#4a3020', '#f2f2f2', '#c8302a', '#2a2a3a'][Math.floor(r() * 4)];
    const cv = document.createElement('canvas'); cv.width = 46; cv.height = 66; const g = cv.getContext('2d'); g.translate(1, 1);
    const R = (x, y, w2, h, col) => { g.fillStyle = col; g.fillRect(x, y, w2, h); }, box = (x, y, w2, h, col) => { const q = Math.max(1, w2 >> 2); R(x, y, w2, h, sh(col, 1)); R(x, y, q, h, sh(col, 1.15)); R(x + w2 - q, y, q, h, sh(col, 0.74)); R(x, y + h - 1, w2, 1, sh(col, 0.62)); };
    const bob = [0, 1, 0, 1][ph & 3], lk = pose === 'jalan' ? [[0, 3], [1, 1], [3, 0], [1, 1]][ph & 3] : [0, 0];
    if (skirt) { box(14, 43, 16, 12, pants === '#5a3a1a' ? '#8a3a6a' : pants); R(16, 55, 4, 2, sh(skin, 0.9)); R(24, 55, 4, 2, sh(skin, 0.9)); } else { box(15, 44 - lk[0], 6, 13 + lk[0], pants); box(23, 44 - lk[1], 6, 13 + lk[1], pants); }
    for (const x of [14, 22]) { R(x, 56, 8, 3, sh(shoe, 1)); R(x, 58, 8, 2, sh(shoe, 0.6)); }
    box(13, 28 + bob, 18, 17, shirt);
    if (c.coat) { R(13, 28 + bob, 18, 17, '#f4f4f4'); R(13, 28 + bob, 4, 17, sh('#f4f4f4', 0.85)); R(27, 28 + bob, 4, 17, sh('#f4f4f4', 0.8)); R(19, 29 + bob, 6, 8, '#5a8ac8'); }
    if (c.vest) { R(16, 28 + bob, 12, 16, c.vest); R(16, 36 + bob, 12, 2, '#ebebeb'); }
    if (c.stripe) { R(13, 36 + bob, 18, 2, c.stripe); R(13, 41 + bob, 18, 2, c.stripe); R(15, 50, 6, 2, c.stripe); R(23, 50, 6, 2, c.stripe); }
    if (c.badge) { R(17, 31 + bob, 3, 3, c.badge); R(24, 31 + bob, 4, 1, '#e6e6e6'); }
    if (stripe) R(13, 34 + bob, 18, 2, stripe);
    if (!skirt) R(13, 43 + bob, 18, 2, '#3a2a1a');
    if (c.steth) { g.strokeStyle = '#282828'; g.beginPath(); g.moveTo(18, 28 + bob); g.lineTo(20, 36 + bob); g.moveTo(26, 28 + bob); g.lineTo(24, 36 + bob); g.stroke(); R(21, 36 + bob, 3, 3, '#a0a0aa'); }
    const sw = pose === 'jalan' ? [3, 0, -3, 0][ph & 3] : 0, sl = c.coat ? '#f4f4f4' : shirt;
    for (const [x0, s] of [[14, 1], [29, -1]]) { const x1 = x0 - 3 * s, y1 = 40 + bob + (s > 0 ? sw : -sw); g.strokeStyle = sh(sl, 0.85); g.lineWidth = 4; g.beginPath(); g.moveTo(x0, 31 + bob); g.lineTo(x1, y1); g.stroke(); R(x1 - 2, y1, 4, 4, skin); }
    R(16, 14 + bob, 12, 13, skin); R(16, 14 + bob, 2, 13, sh(skin, 1.08)); R(26, 14 + bob, 2, 13, sh(skin, 0.82)); R(16, 26 + bob, 12, 1, sh(skin, 0.75));
    R(19, 19 + bob, 2, 2, '#1e181c'); R(24, 19 + bob, 2, 2, '#1e181c'); R(19, 19 + bob, 1, 1, '#fff'); R(24, 19 + bob, 1, 1, '#fff'); R(20, 24 + bob, 4, 1, '#96463c'); R(17, 22 + bob, 2, 1, 'rgba(240,140,130,0.8)'); R(25, 22 + bob, 2, 1, 'rgba(240,140,130,0.8)');
    if (hijab) { R(14, 11 + bob, 16, 5, hcol); R(14, 11 + bob, 3, 20, sh(hcol, 1.05)); R(27, 11 + bob, 3, 20, sh(hcol, 0.8)); R(14, 26 + bob, 16, 4, sh(hcol, 0.9)); R(17, 12 + bob, 4, 1, sh(hcol, 1.3)); }
    else { R(15, 11 + bob, 14, 4, hair); R(15, 14 + bob, 2, 5, hair); R(27, 14 + bob, 2, 5, hair); R(17, 11 + bob, 4, 1, sh(hair, 1.6)); if (female) { R(14, 14 + bob, 3, 13, hair); R(27, 14 + bob, 3, 13, sh(hair, 0.85)); } }
    if (c.hat) { const [k, hc] = c.hat;
      if (k === 'cap') { R(15, 9 + bob, 14, 5, hc); R(13, 13 + bob, 10, 2, sh(hc, 0.75)); R(20, 10 + bob, 3, 2, '#ffd84a'); }
      else if (k === 'helm') { R(14, 9 + bob, 16, 6, hc); R(12, 14 + bob, 20, 2, sh(hc, 0.8)); R(17, 9 + bob, 4, 2, sh(hc, 1.35)); }
      else if (k === 'baret') { R(15, 9 + bob, 14, 4, hc); R(26, 10 + bob, 4, 3, sh(hc, 0.8)); }
      else if (k === 'caping') { g.fillStyle = hc; g.beginPath(); g.moveTo(8, 15 + bob); g.lineTo(22, 5 + bob); g.lineTo(36, 15 + bob); g.fill(); R(10, 15 + bob, 24, 1, sh(hc, 0.7)); }
      else if (k === 'peci') { R(16, 9 + bob, 12, 4, hc); R(16, 9 + bob, 12, 1, sh(hc, 1.6)); } }
    // outline
    const id = g.getImageData(0, 0, 46, 66), D = id.data, O = new Uint8ClampedArray(D); for (let y = 0; y < 66; y++) for (let x = 0; x < 46; x++) { const i = (y * 46 + x) * 4; if (D[i + 3]) continue; const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const X = x + dx, Y = y + dy; return X >= 0 && Y >= 0 && X < 46 && Y < 66 && D[(Y * 46 + X) * 4 + 3] > 0; }); if (n) { O[i] = 28; O[i + 1] = 22; O[i + 2] = 30; O[i + 3] = 255; } }
    id.data.set(O); g.setTransform(1, 0, 0, 1, 0, 0); g.putImageData(id, 0, 0); return cv; }
  const CACHE = new Map();
  window.WSPR = { jobOf, get(w, ph = 0, pose = 'idle') { const k = (w.no | 0) + '|' + (w.av || '') + '|' + (w.nama || '') + '|' + (ph & 3) + pose + '|' + ((window.SIKEPO_JOBS || []).length); let c = CACHE.get(k); if (!c) { c = draw(w, ph, pose); CACHE.set(k, c); } return c; } };
})();
