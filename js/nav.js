// Mobile nav toggle + scroll-spy

(function () {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("siteNav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close menu when clicking a link
    nav.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Scroll-spy: highlight current section in nav (only when nav links to in-page anchors)
  const navLinks = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
  if (navLinks.length === 0 || !("IntersectionObserver" in window)) return;

  const sectionMap = new Map();
  navLinks.forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    const sec = document.getElementById(id);
    if (sec) sectionMap.set(sec, a);
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = sectionMap.get(entry.target);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );

  sectionMap.forEach((_, sec) => io.observe(sec));
})();
