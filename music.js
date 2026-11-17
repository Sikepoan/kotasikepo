// Musik latar Kota Sikepo (loop). Diputar setelah pengunjung menekan tombol (aturan autoplay browser).
(function () {
  const a = new Audio('img/bgm.mp3'); a.loop = true; a.volume = 0.35;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'px'; b.id = 'musikBtn'; b.textContent = '♪ MUSIK';
  b.style.cssText = 'position:fixed;right:10px;top:calc(76px + env(safe-area-inset-top,0px));z-index:40;font:10px var(--display,monospace);padding:8px 10px;border:3px solid #1c1c24;background:#fff6dc;color:#1c1c24;cursor:pointer;box-shadow:3px 3px 0 #1c1c24';
  let on = false; const set = v => { on = v; b.style.background = v ? '#ffd84a' : '#fff6dc'; b.textContent = v ? '♪ MUSIK ON' : '♪ MUSIK'; try { localStorage.setItem('ks_musik', v ? '1' : '0'); } catch (e) {} };
  b.onclick = () => { if (on) { a.pause(); set(false); } else { a.play().then(() => set(true)).catch(() => {}); } };
  document.body.append(b);
  let pref = null; try { pref = localStorage.getItem('ks_musik'); } catch (e) {}
  if (pref !== '0') { const go = () => { if (!on) a.play().then(() => set(true)).catch(() => {}); removeEventListener('pointerdown', go); }; addEventListener('pointerdown', go, { once: true }); }
})();
