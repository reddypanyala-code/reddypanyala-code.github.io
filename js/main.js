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

(function () {
  const stage = document.getElementById("portraitStage");
  const maskBlobCircle = document.getElementById("maskBlobCircle");
  const liquidNoise = document.getElementById("liquid-noise");
  if (!stage || !maskBlobCircle) {
    return;
  }

  const VIEW_W = 400;
  const VIEW_H = 500;
  let mouseX = 0;
  let mouseY = 0;
  let curX = 0;
  let curY = 0;
  let radius = 0;
  let targetRadius = 0;
  let isHovering = false;

  const MAX_RADIUS = 62;
  const LERP_POS = 0.1;
  const LERP_IN = 0.1;
  const LERP_OUT = 0.06;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  stage.addEventListener("mouseenter", function (e) {
    isHovering = true;
    targetRadius = MAX_RADIUS;
    const r = stage.getBoundingClientRect();
    curX = mouseX = clamp(e.clientX - r.left, 0, r.width);
    curY = mouseY = clamp(e.clientY - r.top, 0, r.height);
  });

  stage.addEventListener("mouseleave", function () {
    isHovering = false;
    targetRadius = 0;
  });

  stage.addEventListener("mousemove", function (e) {
    const r = stage.getBoundingClientRect();
    mouseX = clamp(e.clientX - r.left, 0, r.width);
    mouseY = clamp(e.clientY - r.top, 0, r.height);
  });

  function tick() {
    curX = lerp(curX, mouseX, LERP_POS);
    curY = lerp(curY, mouseY, LERP_POS);
    radius = lerp(radius, targetRadius, isHovering ? LERP_IN : LERP_OUT);

    const rect = stage.getBoundingClientRect();
    const scaleX = VIEW_W / Math.max(rect.width, 1);
    const scaleY = VIEW_H / Math.max(rect.height, 1);
    const viewRadius = radius * (scaleX + scaleY) * 0.5;

    maskBlobCircle.setAttribute("cx", (curX * scaleX).toFixed(2));
    maskBlobCircle.setAttribute("cy", (curY * scaleY).toFixed(2));
    maskBlobCircle.setAttribute("r", viewRadius.toFixed(2));

    if (liquidNoise) {
      const t = performance.now();
      const fx = 0.018 + Math.sin(t / 1450) * 0.0018;
      const fy = 0.022 + Math.cos(t / 1200) * 0.0018;
      liquidNoise.setAttribute("baseFrequency", `${fx.toFixed(4)} ${fy.toFixed(4)}`);
    }

    requestAnimationFrame(tick);
  }

  tick();
})();
