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
  const blob = document.getElementById("eraserBlob");
  if (!stage || !blob) {
    return;
  }

  let mouseX = 0;
  let mouseY = 0;
  let curX = 0;
  let curY = 0;
  let radius = 0;
  let targetRadius = 0;
  let isHovering = false;

  const MAX_RADIUS = 90;
  const LERP_POS = 0.1;
  const LERP_IN = 0.1;
  const LERP_OUT = 0.06;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  stage.addEventListener("mouseenter", function (e) {
    isHovering = true;
    targetRadius = MAX_RADIUS;
    const r = stage.getBoundingClientRect();
    curX = mouseX = e.clientX - r.left;
    curY = mouseY = e.clientY - r.top;
  });

  stage.addEventListener("mouseleave", function () {
    isHovering = false;
    targetRadius = 0;
  });

  stage.addEventListener("mousemove", function (e) {
    const r = stage.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });

  function tick() {
    curX = lerp(curX, mouseX, LERP_POS);
    curY = lerp(curY, mouseY, LERP_POS);
    radius = lerp(radius, targetRadius, isHovering ? LERP_IN : LERP_OUT);

    const size = radius * 2;
    blob.style.left = `${curX}px`;
    blob.style.top = `${curY}px`;
    blob.style.width = `${size}px`;
    blob.style.height = `${size}px`;

    requestAnimationFrame(tick);
  }

  tick();
})();
