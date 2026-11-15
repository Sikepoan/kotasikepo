// Layar masuk Kepo Fantasy: username IG/TikTok -> pilih job -> kartu jadi -> langsung masuk desa
(function () {
  const $ = id => document.getElementById(id), KEY = 'kf_onb_skip';
  let O = null, job = null, nama = '';
  function err(m) { $('onbErr').textContent = m || ''; }
  function step(n) { $('onb1').hidden = n !== 1; $('onb2').hidden = n !== 2; err(''); }
  function jobs() { const box = $('onbJobs'); box.innerHTML = '';
    SK.JOBS.forEach((j, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); if (i === 0) job = j;
      const c = document.createElement('canvas'); c.width = 24; c.height = 28; c.getContext('2d').drawImage(SK.JSPR[j.id], 0, 0); const s = document.createElement('span'); s.textContent = j.label;
      b.append(c, s); b.onclick = () => { job = j; box.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); }; box.append(b); }); }
  function close(skip) { $('onb').hidden = true; document.body.style.overflow = ''; if (skip) try { localStorage.setItem(KEY, '1'); } catch (e) {} }
  window.ONBOARD = {
    start(o) { O = o; if (!$('onb') || o.mine) return; let sk = null; try { sk = localStorage.getItem(KEY); } catch (e) {} if (sk) return; ONBOARD.open(); },
    open() { if (!O) return; step(1); jobs(); $('onb').hidden = false; document.body.style.overflow = 'hidden'; setTimeout(() => $('onbNama').focus(), 50); }
  };
  document.addEventListener('DOMContentLoaded', () => {}, { once: true });
  $('onbForm1').addEventListener('submit', e => { e.preventDefault(); nama = O.clean($('onbNama').value.replace(/^@+/, ''));
    if (nama.length < 2) { err('Username minimal 2 karakter.'); return; } step(2); });
  $('onbBack').onclick = () => step(1);
  $('onbSkip').onclick = () => close(true);
  $('onbMasuk').onclick = async () => { const b = $('onbMasuk'); b.disabled = true; err('Membuat kartu petualang…');
    try { const w = await O.daftar({ nama, kat: 'WARGA', av: job.av, hari: O.hari() }); close(false); O.focus(w.no); }
    catch (x) { const k = x && x.kode; err(k === 'nama_dipakai' ? 'Username itu sudah terdaftar. Pakai username lain.' : k === 'sudah_daftar' ? 'Perangkat ini sudah punya kartu.' : k === 'nama_tidak_valid' ? 'Username berisi karakter yang tidak boleh.' : 'Gagal mendaftar. Coba lagi ya.'); if (k === 'nama_dipakai' || k === 'nama_tidak_valid') step(1), err(k === 'nama_dipakai' ? 'Username itu sudah terdaftar. Pakai username lain.' : 'Username berisi karakter yang tidak boleh.'); }
    finally { b.disabled = false; } };
})();
