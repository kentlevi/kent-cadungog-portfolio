const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let heroIntroReady = prefersReducedMotion;

const splitText = () => {
  document.querySelectorAll("[data-split]").forEach((element) => {
    const mode = element.dataset.split;
    const text = element.textContent.trim();

    if (!text) return;

    if (mode === "chars") {
      element.innerHTML = text
        .split("")
        .map((char) => {
          if (char === " ") return '<span class="split-char">&nbsp;</span>';
          return `<span class="split-char">${char}</span>`;
        })
        .join("");
      return;
    }

    element.innerHTML = text
      .split(" ")
      .map((word) => `<span class="split-word">${word}&nbsp;</span>`)
      .join("");
  });
};

const setupCursor = () => {
  const shell = document.querySelector(".cursor-shell");
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");

  if (!shell || !dot || !ring || prefersReducedMotion || window.innerWidth <= 760) return;

  const state = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  // Set initial centering once so it doesn't conflict with animation
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

  window.addEventListener("pointermove", (event) => {
    state.x = event.clientX;
    state.y = event.clientY;

    gsap.to(dot, {
      x: state.x,
      y: state.y,
      duration: 0.12,
      ease: "power3.out",
      overwrite: true,
    });

    gsap.to(ring, {
      x: state.x,
      y: state.y,
      duration: 0.28,
      ease: "power3.out",
      overwrite: true,
    });
  });

  document.querySelectorAll("a, button, [data-tilt]").forEach((item) => {
    item.addEventListener("mouseenter", () => shell.classList.add("cursor-active"));
    item.addEventListener("mouseleave", () => shell.classList.remove("cursor-active"));
  });
};

const setupMagneticHover = () => {
  const magneticItems = document.querySelectorAll(".magnetic");

  magneticItems.forEach((item) => {
    const reset = () => {
      gsap.to(item, {
        x: 0,
        y: 0,
        duration: 0.55,
        ease: "expo.out",
      });
    };

    item.addEventListener("mousemove", (event) => {
      if (prefersReducedMotion) return;

      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      gsap.to(item, {
        x: x * 0.14,
        y: y * 0.14,
        duration: 0.3,
        ease: "power3.out",
        overwrite: true,
      });
    });

    item.addEventListener("mouseleave", reset);
    item.addEventListener("blur", reset);
  });
};

const setupHeroInteractions = () => {
  const root = document.querySelector("[data-parallax-root]");
  const cards = document.querySelectorAll(".floating-card");

  if (!root || !cards.length || prefersReducedMotion) return;

  const state = {
    mouseX: 0,
    mouseY: 0,
    rect: root.getBoundingClientRect(),
  };

  const update = () => {
    if (!heroIntroReady) return;

    cards.forEach((card) => {
      const depth = Number(card.dataset.depth || 20);
      const isTiltActive = card.matches(":hover") && card.hasAttribute("data-tilt");
      
      // Base parallax calculation
      let x = state.mouseX * depth;
      let y = state.mouseY * depth;
      let rotateY = state.mouseX * 8;
      let rotateX = state.mouseY * -8;

      // Add tilt influence if being hovered directly
      if (isTiltActive) {
        // We could add more complex tilt logic here, but simpler is more stable
        x *= 1.25;
        y *= 1.25;
        rotateY *= 2;
        rotateX *= 2;
      }

      gsap.to(card, {
        x,
        y,
        rotateX,
        rotateY,
        duration: isTiltActive ? 0.35 : 0.8,
        ease: isTiltActive ? "power3.out" : "power2.out",
        overwrite: "auto",
        transformPerspective: 1200,
      });
    });
  };

  root.addEventListener("mousemove", (event) => {
    state.rect = root.getBoundingClientRect();
    state.mouseX = (event.clientX - state.rect.left) / state.rect.width - 0.5;
    state.mouseY = (event.clientY - state.rect.top) / state.rect.height - 0.5;
    update();
  });

  root.addEventListener("mouseleave", () => {
    cards.forEach((card) => {
      gsap.to(card, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 1.2,
        ease: "expo.out",
        overwrite: "auto",
      });
    });
  });

  // Hero Card Focus logic integrated for better synergy
  const activateCard = (card) => {
    cards.forEach((item) => {
      item.classList.toggle("is-focused", item === card);
      item.classList.toggle("is-dimmed", item !== card);
    });
  };

  const clearFocus = () => {
    cards.forEach((card) => {
      card.classList.remove("is-focused", "is-dimmed");
    });
  };

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => activateCard(card));
    card.addEventListener("focusin", () => activateCard(card));
    card.addEventListener("focusout", (e) => {
      if (!card.contains(e.relatedTarget)) {
        clearFocus();
      }
    });
  });
};

const setupSkillMeters = () => {
  document.querySelectorAll(".progress-fill").forEach((fill) => {
    const targetWidth = fill.style.width || "0%";
    
    // Clear initial width for GSAP to animate from 0
    gsap.set(fill, { width: 0 });

    if (prefersReducedMotion) {
      fill.style.width = targetWidth;
      return;
    }

    gsap.to(fill, {
      width: targetWidth,
      duration: 1.6,
      delay: 0.2,
      ease: "power4.out",
      scrollTrigger: {
        trigger: fill,
        start: "top 92%",
        once: true,
      },
    });
  });
};

const setupThumbnailFallbacks = () => {
  document.querySelectorAll(".project-thumb-card img").forEach((image) => {
    const parent = image.closest(".project-thumb-card");

    if (!parent) return;

    const showFallback = () => parent.classList.add("image-missing");

    image.addEventListener("error", showFallback, { once: true });

    if (image.complete && image.naturalWidth === 0) {
      showFallback();
    }
  });
};

const setupActiveNavigation = () => {
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".site-nav a[href^='#']");

  if (!sections.length || !links.length) return;

  const linkMap = new Map(
    Array.from(links).map((link) => [link.getAttribute("href")?.slice(1), link])
  );

  const activate = (id) => {
    links.forEach((link) => link.classList.remove("is-active"));
    linkMap.get(id)?.classList.add("is-active");
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) {
        activate(visible.target.id);
      }
    },
    {
      rootMargin: "-35% 0px -45% 0px",
      threshold: [0.2, 0.4, 0.6],
    }
  );

  sections.forEach((section) => observer.observe(section));
};

const setupScrollAnimations = () => {
  if (prefersReducedMotion) {
    document.querySelectorAll(".reveal-text, .reveal-item").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const heroTl = gsap.timeline({
    defaults: { ease: "expo.out", duration: 1.2 },
    onComplete: () => {
      heroIntroReady = true;
      ScrollTrigger.refresh();
    }
  });

  // Safety fallback to ensure UI is interactive even if timeline stalls
  window.setTimeout(() => {
    if (!heroIntroReady) {
      heroIntroReady = true;
      gsap.to(".reveal-text, .reveal-item, .floating-card", { opacity: 1, y: 0, duration: 1 });
      ScrollTrigger.refresh();
    }
  }, 3500);

  heroTl
    .fromTo(".reveal-text", 
      { y: 60, opacity: 0, skewY: 4 },
      { y: 0, opacity: 1, skewY: 0, stagger: 0.15, duration: 1.5 }
    )
    .fromTo(".hero-lead",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2 },
      "-=1.1"
    )
    .fromTo(".hero-visual .reveal-item:not(.floating-card), .hero-presence, .hero-actions",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 1 },
      "-=1"
    )
    .fromTo(".floating-card",
      { y: 60, scale: 0.9, opacity: 0 },
      { 
        y: 0, 
        scale: 1, 
        opacity: 1, 
        stagger: 0.15, 
        duration: 1.5, 
        ease: "power4.out",
        clearProps: "scale,y,opacity"
      },
      "-=1.2"
    )
    .fromTo(".hero-metrics li",
      { y: 28, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, stagger: 0.12, duration: 0.9, ease: "power3.out" },
      "-=1.0"
    );

  // Animate the "4+" counter
  const counterEl = document.querySelector(".hero-metrics strong");
  if (counterEl && counterEl.textContent.includes("+")) {
    const target = parseInt(counterEl.textContent);
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.6,
      delay: 1.8,
      ease: "power2.out",
      snap: { val: 1 },
      onUpdate: () => {
        counterEl.textContent = Math.round(obj.val) + "+";
      },
    });
  }

  // Section reveals
  gsap.utils.toArray(".reveal-section").forEach((section) => {
    gsap.to(section, {
      y: 0,
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 82%",
        once: true,
        onEnter: () => section.classList.add("section-active"),
      },
    });
  });

  gsap.utils.toArray("[data-split='words']").forEach((heading) => {
    const words = heading.querySelectorAll(".split-word");

    if (!words.length) return;

    gsap.from(words, {
      yPercent: 110,
      opacity: 0,
      filter: "blur(10px)",
      duration: 0.85,
      stagger: 0.03,
      ease: "power3.out",
      scrollTrigger: {
        trigger: heading,
        start: "top 88%",
        once: true,
      },
    });
  });

  gsap.utils.toArray(".project-featured").forEach((featured) => {
    const visual = featured.querySelector(".image-reveal");
    const image = visual?.querySelector("img");
    const mask = visual?.querySelector(".image-mask");
    const info = featured.querySelector(".project-info");
    const infoElements = info?.querySelectorAll("h3, .project-category, .project-description, .project-stack li, .project-metrics, .project-actions");

    const reveal = gsap.timeline({
      scrollTrigger: {
        trigger: featured,
        start: "top 82%",
        once: true,
      },
    });

    if (mask) {
      reveal.to(mask, {
        scaleX: 0,
        duration: 1.25,
        ease: "expo.inOut",
      });
    }

    if (image) {
      reveal.fromTo(
        image,
        { scale: 1.15, filter: "blur(12px)" },
        {
          scale: 1,
          filter: "blur(0px)",
          duration: 1.4,
          ease: "power3.out",
        },
        0.1
      );
    }

    if (infoElements) {
      reveal.from(
        infoElements,
        {
          y: 40,
          opacity: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: "power2.out",
        },
        "-=0.75"
      );
    }
  });

  gsap.to(".gradient-shift", {
    xPercent: 8,
    yPercent: -6,
    ease: "none",
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.8,
    },
  });

  gsap.to(".ambient-one", {
    yPercent: 20,
    ease: "none",
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
    },
  });

  gsap.to(".ambient-two", {
    yPercent: -16,
    ease: "none",
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.4,
    },
  });
};

window.addEventListener("DOMContentLoaded", () => {
  splitText();
  setupThumbnailFallbacks();
  setupCursor();
  setupHeroInteractions();
  setupMagneticHover();
  setupActiveNavigation();
  setupSkillMeters();
  setupScrollAnimations();
  setupMobileNav();

  // Final layout refresh for ScrollTrigger after all elements are positioned
  ScrollTrigger.refresh();
});

const setupMobileNav = () => {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close on nav link click
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
};
