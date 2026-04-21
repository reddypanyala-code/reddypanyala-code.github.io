const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".site-nav a");

const setActiveNav = () => {
  let current = "";
  sections.forEach((section) => {
    const top = section.offsetTop - 140;
    const height = section.offsetHeight;
    if (window.scrollY >= top && window.scrollY < top + height) {
      current = section.id;
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute("href")?.replace("#", "");
    link.classList.toggle("active", href === current);
  });
};

window.addEventListener("scroll", setActiveNav);
window.addEventListener("load", setActiveNav);

const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

const reveals = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

reveals.forEach((item) => revealObserver.observe(item));

const heroPortrait = document.getElementById("heroPortrait");
const portraitStage = document.getElementById("portraitStage");

if (heroPortrait && portraitStage) {
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  let rect = portraitStage.getBoundingClientRect();
  let targetX = rect.width / 2;
  let targetY = rect.height / 2;
  let currentX = targetX;
  let currentY = targetY;
  let trailX = targetX;
  let trailY = targetY;
  let active = false;
  let rafId = null;

  const setVisualState = (x, y, tx, ty, shouldPulse) => {
    rect = portraitStage.getBoundingClientRect();

    const baseSize = clamp(Math.min(rect.width, rect.height) * 0.52, 180, 280);
    const pulse = shouldPulse ? Math.sin(performance.now() / 180) * 9 : 0;
    const revealSize = baseSize + pulse;
    const revealLeft = clamp(x - revealSize / 2, 0, rect.width - revealSize);
    const revealTop = clamp(y - revealSize / 2, 0, rect.height - revealSize);

    const nx = (x / rect.width - 0.5) * 2;
    const ny = (y / rect.height - 0.5) * 2;

    heroPortrait.style.setProperty("--portrait-w", `${rect.width}px`);
    heroPortrait.style.setProperty("--portrait-h", `${rect.height}px`);
    heroPortrait.style.setProperty("--reveal-size", `${revealSize}px`);
    heroPortrait.style.setProperty("--reveal-left", `${revealLeft}px`);
    heroPortrait.style.setProperty("--reveal-top", `${revealTop}px`);

    const trailSize = revealSize * 1.18;
    const trailLeft = clamp(tx - trailSize / 2, 0, rect.width - trailSize);
    const trailTop = clamp(ty - trailSize / 2, 0, rect.height - trailSize);
    heroPortrait.style.setProperty("--trail-size", `${trailSize}px`);
    heroPortrait.style.setProperty("--trail-left", `${trailLeft}px`);
    heroPortrait.style.setProperty("--trail-top", `${trailTop}px`);

    heroPortrait.style.setProperty("--cursor-x", `${x}px`);
    heroPortrait.style.setProperty("--cursor-y", `${y}px`);
    heroPortrait.style.setProperty("--parallax-x", nx.toFixed(4));
    heroPortrait.style.setProperty("--parallax-y", ny.toFixed(4));
    heroPortrait.style.setProperty("--blob-rot", `${nx * 8 + ny * 4}deg`);
    heroPortrait.style.setProperty("--drift-x", `${nx * 4}px`);
    heroPortrait.style.setProperty("--drift-y", `${ny * 4}px`);
    heroPortrait.style.setProperty("--ring-size", `${revealSize * 0.92}px`);
  };

  const animate = () => {
    currentX += (targetX - currentX) * 0.17;
    currentY += (targetY - currentY) * 0.17;
    trailX += (currentX - trailX) * 0.1;
    trailY += (currentY - trailY) * 0.1;

    setVisualState(currentX, currentY, trailX, trailY, active);

    const delta = Math.abs(targetX - currentX) + Math.abs(targetY - currentY);
    if (active || delta > 0.3) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
    }
  };

  const startLoop = () => {
    if (!rafId) {
      rafId = requestAnimationFrame(animate);
    }
  };

  const updateTarget = (clientX, clientY) => {
    rect = portraitStage.getBoundingClientRect();
    targetX = clamp(clientX - rect.left, 0, rect.width);
    targetY = clamp(clientY - rect.top, 0, rect.height);
    startLoop();
  };

  portraitStage.addEventListener("pointerenter", (event) => {
    if (window.matchMedia("(hover: none)").matches) {
      return;
    }
    active = true;
    heroPortrait.classList.add("is-hovering");
    updateTarget(event.clientX, event.clientY);
  });

  portraitStage.addEventListener("pointermove", (event) => {
    if (window.matchMedia("(hover: none)").matches) {
      return;
    }
    updateTarget(event.clientX, event.clientY);
  });

  portraitStage.addEventListener("pointerleave", () => {
    if (window.matchMedia("(hover: none)").matches) {
      return;
    }
    active = false;
    heroPortrait.classList.remove("is-hovering");
    rect = portraitStage.getBoundingClientRect();
    targetX = rect.width / 2;
    targetY = rect.height / 2;
    startLoop();
  });

  if (window.matchMedia("(hover: none)").matches) {
    portraitStage.addEventListener("click", () => {
      heroPortrait.classList.toggle("iron-active");
    });
  }

  window.addEventListener("resize", () => {
    rect = portraitStage.getBoundingClientRect();
    targetX = clamp(targetX, 0, rect.width);
    targetY = clamp(targetY, 0, rect.height);
    currentX = clamp(currentX, 0, rect.width);
    currentY = clamp(currentY, 0, rect.height);
    trailX = clamp(trailX, 0, rect.width);
    trailY = clamp(trailY, 0, rect.height);
    setVisualState(currentX, currentY, trailX, trailY, active);
  });

  setVisualState(currentX, currentY, trailX, trailY, false);
}
