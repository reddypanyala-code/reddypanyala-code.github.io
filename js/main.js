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
  const maskBlobPrimary = document.getElementById("maskBlobPrimary");
  const maskBlobTrail = document.getElementById("maskBlobTrail");
  const maskBlobSatellite = document.getElementById("maskBlobSatellite");
  const liquidNoise = document.getElementById("liquid-noise");
  const liquidDisplace = document.getElementById("liquid-displace");
  if (!stage || !maskBlobPrimary || !maskBlobTrail || !maskBlobSatellite) {
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
  let prevX = 0;
  let prevY = 0;
  let velX = 0;
  let velY = 0;

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

  function buildBlobPath(cx, cy, radiusPx, velocityAngle, speedFactor, timeMs) {
    const points = 24;
    const stretch = 0.28 * speedFactor;
    const waveA = timeMs * 0.0034;
    const waveB = timeMs * 0.0023;
    const nodes = [];

    for (let i = 0; i < points; i += 1) {
      const angle = (i / points) * Math.PI * 2;
      const n1 = Math.sin(angle * 3 + waveA);
      const n2 = Math.cos(angle * 5 - waveB);
      const n3 = Math.sin(angle * 7 + waveA * 0.7 + 1.3);
      const roughness = n1 * 0.12 + n2 * 0.07 + n3 * 0.04;
      const directionalPull = Math.cos(angle - velocityAngle) * stretch;
      const localRadius = radiusPx * (1 + roughness + directionalPull);
      nodes.push({
        x: cx + Math.cos(angle) * localRadius,
        y: cy + Math.sin(angle) * localRadius,
      });
    }

    const firstMidX = (nodes[0].x + nodes[1].x) * 0.5;
    const firstMidY = (nodes[0].y + nodes[1].y) * 0.5;
    let d = `M ${firstMidX.toFixed(2)} ${firstMidY.toFixed(2)}`;

    for (let i = 1; i <= points; i += 1) {
      const point = nodes[i % points];
      const next = nodes[(i + 1) % points];
      const midX = (point.x + next.x) * 0.5;
      const midY = (point.y + next.y) * 0.5;
      d += ` Q ${point.x.toFixed(2)} ${point.y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
    }

    return `${d} Z`;
  }

  stage.addEventListener("mouseenter", function (e) {
    isHovering = true;
    targetRadius = MAX_RADIUS;
    const r = stage.getBoundingClientRect();
    curX = mouseX = clamp(e.clientX - r.left, 0, r.width);
    curY = mouseY = clamp(e.clientY - r.top, 0, r.height);
    prevX = curX;
    prevY = curY;
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
    velX = lerp(velX, curX - prevX, 0.3);
    velY = lerp(velY, curY - prevY, 0.3);
    prevX = curX;
    prevY = curY;

    const rect = stage.getBoundingClientRect();
    const scaleX = VIEW_W / Math.max(rect.width, 1);
    const scaleY = VIEW_H / Math.max(rect.height, 1);
    const viewScale = (scaleX + scaleY) * 0.5;
    const viewRadius = radius * viewScale;
    const viewX = curX * scaleX;
    const viewY = curY * scaleY;
    const speed = Math.hypot(velX, velY) * viewScale;
    const speedFactor = clamp(speed / 16, 0, 1);
    const velocityAngle = Math.atan2(velY, velX || 0.00001);

    if (viewRadius > 0.6) {
      const primaryPath = buildBlobPath(viewX, viewY, viewRadius, velocityAngle, speedFactor, performance.now());
      const directionX = Math.cos(velocityAngle);
      const directionY = Math.sin(velocityAngle);
      const trailDistance = viewRadius * (0.8 + speedFactor * 0.5);
      const trailCx = viewX - directionX * trailDistance;
      const trailCy = viewY - directionY * trailDistance * 0.84;
      const trailRx = viewRadius * (0.56 + speedFactor * 0.24);
      const trailRy = viewRadius * (0.37 + speedFactor * 0.14);
      const satelliteCx = trailCx - directionX * viewRadius * 0.9 - directionY * viewRadius * 0.12;
      const satelliteCy = trailCy - directionY * viewRadius * 0.9 + directionX * viewRadius * 0.09;
      const satelliteR = viewRadius * (0.12 + speedFactor * 0.1);

      maskBlobPrimary.setAttribute("d", primaryPath);
      maskBlobTrail.setAttribute("cx", trailCx.toFixed(2));
      maskBlobTrail.setAttribute("cy", trailCy.toFixed(2));
      maskBlobTrail.setAttribute("rx", trailRx.toFixed(2));
      maskBlobTrail.setAttribute("ry", trailRy.toFixed(2));
      maskBlobSatellite.setAttribute("cx", satelliteCx.toFixed(2));
      maskBlobSatellite.setAttribute("cy", satelliteCy.toFixed(2));
      maskBlobSatellite.setAttribute("r", satelliteR.toFixed(2));
    } else {
      maskBlobPrimary.setAttribute("d", "M0 0");
      maskBlobTrail.setAttribute("rx", "0");
      maskBlobTrail.setAttribute("ry", "0");
      maskBlobSatellite.setAttribute("r", "0");
    }

    if (liquidNoise) {
      const t = performance.now();
      const fx = 0.017 + speedFactor * 0.003 + Math.sin(t / 1400) * 0.0016;
      const fy = 0.021 + speedFactor * 0.003 + Math.cos(t / 1180) * 0.0016;
      liquidNoise.setAttribute("baseFrequency", `${fx.toFixed(4)} ${fy.toFixed(4)}`);
    }
    if (liquidDisplace) {
      const displacement = 12 + speedFactor * 9;
      liquidDisplace.setAttribute("scale", displacement.toFixed(2));
    }

    requestAnimationFrame(tick);
  }

  tick();
})();
