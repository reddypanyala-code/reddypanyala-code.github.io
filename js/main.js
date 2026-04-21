const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");
const backToTopLinks = document.querySelectorAll('a[href="#top"]');

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

if (backToTopLinks.length > 0) {
  backToTopLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (history.replaceState) {
        history.replaceState(null, "", `${location.pathname}${location.search}`);
      }
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
const eraserBlob = document.getElementById("eraserBlob");
const hoverRing = document.getElementById("hoverRing");
const frontWrap = portraitStage?.querySelector(".portrait-front-wrap");
const liquidTurbulence = portraitStage?.querySelector("#liquidTurbulence");
const liquidDisplacement = portraitStage?.querySelector("#liquidDisplacement");

if (heroPortrait && portraitStage && eraserBlob && hoverRing && frontWrap) {
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const lerp = (a, b, t) => a + (b - a) * t;

  let rect = portraitStage.getBoundingClientRect();
  let mouseX = rect.width / 2;
  let mouseY = rect.height / 2;
  let curX = mouseX;
  let curY = mouseY;
  let radius = 0;
  let targetRadius = 0;
  let isHovering = false;
  let rafId = null;

  const LERP_SPEED = 0.1;
  const EXPAND_SPEED = 0.12;
  const SHRINK_SPEED = 0.08;

  const maxRadiusForRect = () => clamp(Math.min(rect.width, rect.height) * 0.34, 115, 185);

  const setParallaxShift = () => {
    const nx = (curX / rect.width - 0.5) * 2;
    const ny = (curY / rect.height - 0.5) * 2;
    heroPortrait.style.setProperty("--back-shift-x", `${(nx * 9).toFixed(2)}px`);
    heroPortrait.style.setProperty("--back-shift-y", `${(ny * 7).toFixed(2)}px`);
  };

  const setBlobVisuals = () => {
    const diameter = radius * 2;
    if (diameter <= 0.5) {
      eraserBlob.style.width = "0px";
      eraserBlob.style.height = "0px";
      hoverRing.style.width = "0px";
      hoverRing.style.height = "0px";
      return;
    }

    const wobble = 1 + Math.sin(performance.now() / 170) * 0.028;
    eraserBlob.style.left = `${curX}px`;
    eraserBlob.style.top = `${curY}px`;
    eraserBlob.style.width = `${diameter}px`;
    eraserBlob.style.height = `${diameter}px`;
    eraserBlob.style.transform = `translate(-50%, -50%) scale(${wobble.toFixed(3)})`;

    hoverRing.style.left = `${curX}px`;
    hoverRing.style.top = `${curY}px`;
    hoverRing.style.width = `${diameter * 1.04}px`;
    hoverRing.style.height = `${diameter * 1.04}px`;
  };

  const setLiquidFilterState = (t) => {
    if (!liquidTurbulence || !liquidDisplacement) {
      return;
    }
    const fx = 0.017 + Math.sin(t / 920) * 0.005;
    const fy = 0.024 + Math.cos(t / 760) * 0.006;
    liquidTurbulence.setAttribute("baseFrequency", `${fx.toFixed(4)} ${fy.toFixed(4)}`);

    const maxRadius = maxRadiusForRect();
    const displacementScale = 20 + (radius / maxRadius) * 28 + Math.sin(t / 160) * 3.4;
    liquidDisplacement.setAttribute("scale", displacementScale.toFixed(2));
  };

  const animate = (t) => {
    curX = lerp(curX, mouseX, LERP_SPEED);
    curY = lerp(curY, mouseY, LERP_SPEED);

    const speed = isHovering ? EXPAND_SPEED : SHRINK_SPEED;
    radius = lerp(radius, targetRadius, speed);

    if (Math.abs(radius - targetRadius) < 0.2) {
      radius = targetRadius;
    }

    setParallaxShift();
    setBlobVisuals();
    setLiquidFilterState(t);

    const cursorDelta = Math.abs(mouseX - curX) + Math.abs(mouseY - curY);
    if (isHovering || radius > 0.6 || cursorDelta > 0.15) {
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

  const updateMouse = (clientX, clientY) => {
    rect = portraitStage.getBoundingClientRect();
    mouseX = clamp(clientX - rect.left, 0, rect.width);
    mouseY = clamp(clientY - rect.top, 0, rect.height);
    startLoop();
  };

  portraitStage.addEventListener("pointerenter", (event) => {
    if (window.matchMedia("(hover: none)").matches) {
      return;
    }
    isHovering = true;
    heroPortrait.classList.add("is-hovering");
    targetRadius = maxRadiusForRect();
    updateMouse(event.clientX, event.clientY);
  });

  portraitStage.addEventListener("pointermove", (event) => {
    if (window.matchMedia("(hover: none)").matches) {
      return;
    }
    updateMouse(event.clientX, event.clientY);
  });

  portraitStage.addEventListener("pointerleave", () => {
    if (window.matchMedia("(hover: none)").matches) {
      return;
    }
    isHovering = false;
    targetRadius = 0;
    heroPortrait.classList.remove("is-hovering");
    startLoop();
  });

  if (window.matchMedia("(hover: none)").matches) {
    portraitStage.addEventListener("click", () => {
      heroPortrait.classList.toggle("iron-active");
    });
  }

  window.addEventListener("resize", () => {
    rect = portraitStage.getBoundingClientRect();
    mouseX = clamp(mouseX, 0, rect.width);
    mouseY = clamp(mouseY, 0, rect.height);
    curX = clamp(curX, 0, rect.width);
    curY = clamp(curY, 0, rect.height);
    targetRadius = isHovering ? maxRadiusForRect() : 0;
    setParallaxShift();
    setBlobVisuals();
    startLoop();
  });

  setParallaxShift();
  setBlobVisuals();
}
