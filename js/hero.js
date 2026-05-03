// Hero stage — moving band reveal + 3D tilt + touch toggle

(function () {
  const stage    = document.getElementById('heroStage');
  if (!stage) return;

  const helmFace  = stage.querySelector('.layer-helmet-face');
  const glowEl    = stage.querySelector('.layer-hud-glow');
  const toggleBtn = stage.querySelector('.suit-up-toggle');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsHover = window.matchMedia('(hover: hover)').matches;

  if (supportsHover && !reducedMotion && helmFace && glowEl) {
    let raf = null;

    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const sr = stage.getBoundingClientRect();
        const hr = helmFace.getBoundingClientRect();

        // --my: cursor Y relative to the helmet overlay div (px).
        // The CSS linear-gradient mask uses this to position the reveal band.
        helmFace.style.setProperty('--my', `${e.clientY - hr.top}px`);

        // --glow-y: cursor Y relative to stage top (px).
        // The glow element translateY's to this value to track the cursor row.
        glowEl.style.setProperty('--glow-y', `${e.clientY - sr.top}px`);

        // 3D tilt toward cursor
        const dx = (e.clientX - sr.left) / sr.width  - 0.5;
        const dy = (e.clientY - sr.top)  / sr.height - 0.5;
        stage.style.transform =
          `perspective(900px) rotateX(${(-dy * 7).toFixed(2)}deg) rotateY(${(dx * 9).toFixed(2)}deg)`;

        raf = null;
      });
    };

    stage.addEventListener('pointerenter', () => {
      stage.style.transition = 'transform 0.12s ease, box-shadow 0.4s ease';
    });

    stage.addEventListener('pointermove', onMove);

    stage.addEventListener('pointerleave', () => {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      stage.style.transition =
        'transform 0.7s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease';
      stage.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    });
  }

  // Touch suit-up toggle
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const suited = stage.classList.toggle('is-suited');
      toggleBtn.setAttribute('aria-pressed', suited ? 'true' : 'false');
      toggleBtn.textContent = suited ? 'Suit off' : 'Suit up';
    });
  }
})();
