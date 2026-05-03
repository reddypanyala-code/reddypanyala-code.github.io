// Hero stage — 3D tilt on pointer move + touch suit-up toggle

(function () {
  const stage = document.getElementById('heroStage');
  if (!stage) return;

  const toggleBtn     = stage.querySelector('.suit-up-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsHover = window.matchMedia('(hover: hover)').matches;

  // ── 3D perspective tilt ────────────────────────────────────────────────
  // On pointer move, the whole stage card tilts in 3D toward the cursor.
  // CSS :hover handles the helmet reveal independently.
  if (supportsHover && !reducedMotion) {
    let raf = null;

    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect();
        // Normalised offset from center: -0.5 … +0.5
        const dx = (e.clientX - rect.left)  / rect.width  - 0.5;
        const dy = (e.clientY - rect.top)   / rect.height - 0.5;
        // Tilt: pitch (up/down) and yaw (left/right)
        const tiltX = -dy * 7;
        const tiltY =  dx * 9;
        stage.style.transform =
          `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        raf = null;
      });
    };

    // Fast response while moving, slow spring-back on leave
    stage.addEventListener('pointerenter', () => {
      stage.style.transition =
        'transform 0.12s ease, box-shadow 0.4s ease';
    });

    stage.addEventListener('pointermove', onMove);

    stage.addEventListener('pointerleave', () => {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      stage.style.transition =
        'transform 0.7s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease';
      stage.style.transform =
        'perspective(900px) rotateX(0deg) rotateY(0deg)';
    });
  }

  // ── Touch suit-up toggle ───────────────────────────────────────────────
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const suited = stage.classList.toggle('is-suited');
      toggleBtn.setAttribute('aria-pressed', suited ? 'true' : 'false');
      toggleBtn.textContent = suited ? 'Suit off' : 'Suit up';
    });
  }
})();
