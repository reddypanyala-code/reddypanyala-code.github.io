// Hero portrait → Iron Man helmet morph
// Tracks pointer over the stage and writes --mx, --my custom properties.
// On touch devices, .suit-up-toggle button toggles .is-suited.

(function () {
  const stage = document.getElementById("heroStage");
  if (!stage) return;

  const toggleBtn = stage.querySelector(".suit-up-toggle");

  // Pointer tracking — only active for hover-capable devices
  const supportsHover = window.matchMedia("(hover: hover)").matches;

  if (supportsHover) {
    let raf = null;
    const update = (e) => {
      const rect = stage.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      // Clamp to 0–100 so the mask never disappears at the edges
      const cx = Math.max(0, Math.min(100, x));
      const cy = Math.max(0, Math.min(100, y));
      stage.style.setProperty("--mx", cx + "%");
      stage.style.setProperty("--my", cy + "%");
    };

    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        update(e);
        raf = null;
      });
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerenter", (e) => {
      update(e);
    });
    stage.addEventListener("pointerleave", () => {
      // Reset mask center toward the middle for a clean closeout
      stage.style.setProperty("--mx", "50%");
      stage.style.setProperty("--my", "50%");
    });
  }

  // Touch — tap to toggle suit-up
  if (toggleBtn) {
    toggleBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      stage.classList.toggle("is-suited");
      const suited = stage.classList.contains("is-suited");
      toggleBtn.setAttribute("aria-pressed", suited ? "true" : "false");
      toggleBtn.textContent = suited ? "Suit off" : "Suit up";
    });
  }
})();
