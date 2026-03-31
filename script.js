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

const setupTiltCards = () => {
  const items = document.querySelectorAll("[data-tilt]");

  items.forEach((item) => {
    const reset = () => {
      gsap.to(item, {
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "expo.out",
      });
    };

    item.addEventListener("mousemove", (event) => {
      if (prefersReducedMotion || window.innerWidth <= 760 || !heroIntroReady) return;

      const rect = item.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      gsap.to(item, {
        rotateY: px * 8,
        rotateX: py * -8,
        x: px * 6,
        y: py * 6,
        duration: 0.35,
        ease: "power3.out",
        transformPerspective: 1200,
        overwrite: true,
      });
    });

    item.addEventListener("mouseleave", reset);
  });
};

const setupHeroParallax = () => {
  const root = document.querySelector("[data-parallax-root]");
  const cards = document.querySelectorAll("[data-depth]");

  if (!root || prefersReducedMotion) return;

  root.addEventListener("mousemove", (event) => {
    if (!heroIntroReady) return;

    const rect = root.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

    cards.forEach((card) => {
      const depth = Number(card.dataset.depth || 24);
      gsap.to(card, {
        x: relativeX * depth,
        y: relativeY * depth,
        rotateY: relativeX * 6,
        rotateX: relativeY * -6,
        duration: 0.9,
        ease: "power3.out",
        overwrite: true,
      });
    });
  });

  root.addEventListener("mouseleave", () => {
    cards.forEach((card) => {
      gsap.to(card, {
        x: 0,
        y: 0,
        rotateY: 0,
        rotateX: 0,
        duration: 1.1,
        ease: "expo.out",
      });
    });
  });
};

const setupHeroCardFocus = () => {
  const root = document.querySelector(".hero-visual");
  const cards = root?.querySelectorAll(".floating-card");

  if (!root || !cards?.length) return;

  const clearFocus = () => {
    cards.forEach((card) => {
      card.classList.remove("is-focused", "is-dimmed");
    });
  };

  const activateCard = (card) => {
    if (!card) return;

    cards.forEach((item) => {
      item.classList.toggle("is-focused", item === card);
      item.classList.toggle("is-dimmed", item !== card);
    });
  };

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => activateCard(card));
    card.addEventListener("focusin", () => activateCard(card));
    card.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (!card.contains(document.activeElement)) {
          clearFocus();
        }
      }, 0);
    });
  });

  root.addEventListener("mouseleave", clearFocus);
};

const setupSkillMeters = () => {
  document.querySelectorAll(".meter-fill").forEach((fill) => {
    const targetWidth = `${fill.dataset.level || 0}%`;

    if (prefersReducedMotion) {
      fill.style.width = targetWidth;
      return;
    }

    gsap.to(fill, {
      width: targetWidth,
      duration: 1.4,
      ease: "expo.out",
      scrollTrigger: {
        trigger: fill,
        start: "top 88%",
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
    document.querySelectorAll(".reveal-section").forEach((section) => {
      section.style.opacity = "1";
      section.style.transform = "none";
      section.style.filter = "none";
    });
    document.querySelectorAll(".image-mask").forEach((mask) => {
      mask.style.transform = "scaleX(0)";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const heroTimeline = gsap.timeline({ defaults: { ease: "expo.out" } });

  // The hero sequence layers words, metrics, and floating panels so the first impression feels controlled and premium.
  heroTimeline
    .from(".site-header", {
      y: -30,
      opacity: 0,
      duration: 0.8,
    })
    .from(
      ".floating-card",
      {
        y: 46,
        scale: 0.92,
        opacity: 0,
        filter: "blur(16px)",
        duration: 1.05,
        stagger: 0.1,
        ease: "power3.out",
      },
      0
    )
    .from(
      ".eyebrow .split-word, .hero-lead .split-word",
      {
        yPercent: 110,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.9,
        stagger: 0.03,
      },
      "-=0.2"
    )
    .from(
      ".hero-title .split-char",
      {
        yPercent: 120,
        opacity: 0,
        filter: "blur(14px)",
        duration: 0.95,
        stagger: 0.025,
      },
      "-=0.55"
    )
    .from(
      ".reveal-copy",
      {
        y: 28,
        opacity: 0,
        filter: "blur(12px)",
        duration: 0.9,
      },
      "-=0.55"
    )
    .from(
      ".hero-actions .button, .hero-metrics li",
      {
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
      },
      "-=0.45"
    );

  heroTimeline.eventCallback("onComplete", () => {
    heroIntroReady = true;
    gsap.set(".hero-actions .button, .hero-presence, .hero-metrics li, .site-header, .reveal-copy", {
      clearProps: "opacity,visibility,filter,transform,x,y,scale,rotate",
    });
    gsap.set(".floating-card", {
      clearProps: "opacity,visibility,filter,transform,x,y,scale,rotate",
    });
  });

  // Section reveals blend blur, lift, and slight scale so the page transitions feel smoother than a basic fade-up.
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

  gsap.utils.toArray(".image-reveal").forEach((visual) => {
    const image = visual.querySelector("img");
    const mask = visual.querySelector(".image-mask");

    const reveal = gsap.timeline({
      scrollTrigger: {
        trigger: visual,
        start: "top 86%",
        once: true,
      },
    });

    if (mask) {
      reveal.to(mask, {
        scaleX: 0,
        duration: 1.05,
        ease: "power3.inOut",
      });
    }

    if (image) {
      reveal.fromTo(
        image,
        { scale: 1.14, filter: "blur(16px)" },
        {
          scale: 1,
          filter: "blur(0px)",
          duration: 1.3,
          ease: "expo.out",
        },
        0
      );
    }
  });

  gsap.utils.toArray(".section").forEach((section) => {
    gsap.fromTo(
      section,
      { scale: 0.985 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      }
    );
  });

  gsap.utils.toArray(".project-card-visual").forEach((visual) => {
    gsap.fromTo(
      visual,
      { scale: 0.96, y: 18 },
      {
        scale: 1.02,
        y: -8,
        ease: "none",
        scrollTrigger: {
          trigger: visual,
          start: "top 92%",
          end: "bottom 20%",
          scrub: 1.3,
        },
      }
    );
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
  setupHeroParallax();
  setupHeroCardFocus();
  setupMagneticHover();
  setupTiltCards();
  setupActiveNavigation();
  setupSkillMeters();
  setupScrollAnimations();
});
