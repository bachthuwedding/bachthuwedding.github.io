(() => {
  "use strict";

  const DESIGN_WIDTH = 390;
  const DESIGN_HEIGHT = 680;

  const root = document.documentElement;
  const siteShell = document.getElementById("siteShell");
  const envelopeButton = document.getElementById("envelopeButton");
  const invitationCard = document.getElementById("invitationCard");
  const pageScroller = document.getElementById("page02");

  const pages = [
    document.getElementById("page02Layout"),
    document.getElementById("page03"),
    document.getElementById("page04"),
    document.getElementById("page05"),
    document.getElementById("page06"),
    document.getElementById("page07"),
    document.getElementById("page08"),
  ].filter(Boolean);

  const openingAssets = Array.from(
    document.querySelectorAll(".deferred-opening-asset[data-src]")
  );

  const imagePromises = new WeakMap();
  const pagePromises = new WeakMap();
  const urlPromises = new Map();

  let opened = false;
  let pageMode = false;
  let resizeRaf = 0;
  let scrollRaf = 0;
  let activePageIndex = -1;

  /* =======================================================
     SCALE
  ======================================================= */
  function updateScale() {
    const viewport = window.visualViewport;
    const width = viewport?.width || window.innerWidth;
    const height = viewport?.height || window.innerHeight;

    const scale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);

    root.style.setProperty("--design-scale", String(scale));
    root.style.setProperty("--render-width", `${DESIGN_WIDTH * scale}px`);
    root.style.setProperty("--render-height", `${DESIGN_HEIGHT * scale}px`);

    siteShell?.classList.add("is-scale-ready");
  }

  function scheduleScale() {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(updateScale);
  }

  updateScale();
  window.addEventListener("resize", scheduleScale, { passive: true });
  window.addEventListener("orientationchange", scheduleScale, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleScale, { passive: true });

  /* =======================================================
     IDLE SCHEDULER
  ======================================================= */
  function runWhenIdle(callback, timeout = 1000) {
    if ("requestIdleCallback" in window) {
      return window.requestIdleCallback(callback, { timeout });
    }

    return window.setTimeout(callback, 160);
  }

  /* =======================================================
     URL PRELOAD CACHE
  ======================================================= */
  function preloadUrl(url, priority = "low") {
    if (!url) return Promise.resolve();
    if (urlPromises.has(url)) return urlPromises.get(url);

    const promise = new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";

      try {
        img.fetchPriority = priority;
      } catch (_) {}

      const done = () => {
        if (typeof img.decode === "function") {
          img.decode().catch(() => {}).finally(resolve);
        } else {
          resolve();
        }
      };

      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", resolve, { once: true });
      img.src = url;

      if (img.complete) done();
    });

    urlPromises.set(url, promise);
    return promise;
  }

  /* =======================================================
     DATA-SRC IMAGE LOADER
  ======================================================= */
  function loadImage(img, priority = "low") {
    if (!img) return Promise.resolve();
    if (imagePromises.has(img)) return imagePromises.get(img);

    const src = img.dataset.src;
    if (!src) return Promise.resolve();

    const promise = new Promise((resolve) => {
      try {
        img.fetchPriority = priority;
      } catch (_) {}

      const done = () => {
        if (typeof img.decode === "function") {
          img.decode().catch(() => {}).finally(resolve);
        } else {
          resolve();
        }
      };

      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", resolve, { once: true });

      img.src = src;
      img.removeAttribute("data-src");

      if (img.complete) done();
    });

    imagePromises.set(img, promise);
    return promise;
  }

  function loadOpeningAssets(priority = "low") {
    return Promise.allSettled(openingAssets.map((img) => loadImage(img, priority)));
  }

  /* =======================================================
     PAGE LOADER
     - current page: high priority
     - next page: low priority
     - Page 02 confetti sprite only starts here, not on first paint
  ======================================================= */
  function loadPage(page, priority = "low") {
    if (!page) return Promise.resolve();
    if (pagePromises.has(page)) return pagePromises.get(page);

    const promise = (async () => {
      page.classList.add("is-loading-assets");

      const images = Array.from(page.querySelectorAll("img[data-src]"));
      const jobs = images.map((img) => loadImage(img, priority));

      const spriteHost = page.querySelector("[data-sprite-src]");
      if (spriteHost) {
        const spriteUrl = spriteHost.dataset.spriteSrc;
        jobs.push(
          preloadUrl(spriteUrl, priority).then(() => {
            spriteHost.style.setProperty(
              "--p02-confetti-sprite",
              `url("${spriteUrl}")`
            );
            spriteHost.removeAttribute("data-sprite-src");
          })
        );
      }

      await Promise.allSettled(jobs);

      page.classList.remove("is-loading-assets");
      page.classList.add("is-assets-ready");
    })();

    pagePromises.set(page, promise);
    return promise;
  }

  /* =======================================================
     ACTIVE / NEARBY PAGE
     Off-screen animations are paused by CSS.
  ======================================================= */
  function setNearbyPages(index) {
    if (!pages.length) return;

    const safeIndex = Math.max(0, Math.min(index, pages.length - 1));

    pages.forEach((page, i) => {
      page.classList.toggle("is-nearby", Math.abs(i - safeIndex) <= 1);
    });

    // Current page: prioritize visible assets.
    loadPage(pages[safeIndex], "high");

    // Preload exactly one page ahead so it is ready before scrolling there.
    if (pages[safeIndex + 1]) {
      loadPage(pages[safeIndex + 1], "low");
    }
  }

  function getCurrentPageIndex() {
    if (!pageScroller) return 0;
    return Math.max(
      0,
      Math.min(
        pages.length - 1,
        Math.round(pageScroller.scrollTop / DESIGN_HEIGHT)
      )
    );
  }

  function onPageScroll() {
    if (scrollRaf) return;

    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      const index = getCurrentPageIndex();

      if (index !== activePageIndex) {
        activePageIndex = index;
        setNearbyPages(index);
      }
    });
  }

  pageScroller?.addEventListener("scroll", onPageScroll, { passive: true });

  /* =======================================================
     OPEN ENVELOPE
  ======================================================= */
  async function openEnvelope() {
    if (opened) return;
    opened = true;

    // Usually already warm from idle/pointerdown. Awaiting here prevents
    // the envelope from opening before its layers exist.
    await loadOpeningAssets("high");

    envelopeButton?.classList.add("is-open");
    envelopeButton?.setAttribute("aria-expanded", "true");

    // While user reads the opened card, warm Page 02.
    runWhenIdle(() => loadPage(pages[0], "low"), 500);
  }

  envelopeButton?.addEventListener("pointerdown", () => {
    loadOpeningAssets("high");
    loadPage(pages[0], "low");
  }, { passive: true });

  envelopeButton?.addEventListener("click", (event) => {
    if (event.target === invitationCard && opened) return;
    openEnvelope();
  });

  /* =======================================================
     ENTER PAGE 02+
  ======================================================= */
  invitationCard?.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!opened || pageMode) return;
    pageMode = true;

    // Page 02 should already be warm. Do not block indefinitely if network
    // is slow; 180 ms is enough to give cached/deferred assets a head start.
    const page02Promise = loadPage(pages[0], "high");
    await Promise.race([
      page02Promise,
      new Promise((resolve) => setTimeout(resolve, 180)),
    ]);

    pageScroller.scrollTop = 0;
    pageScroller.setAttribute("aria-hidden", "false");
    siteShell.classList.add("is-page-02");

    activePageIndex = 0;
    setNearbyPages(0);

    // Page 03 gets a low-priority head start after the transition.
    runWhenIdle(() => loadPage(pages[1], "low"), 700);
  });

  /* =======================================================
     INITIAL WARM-UP
     1) First paint stays tiny: only background + closed envelope.
     2) Open-state assets warm when browser is idle.
     3) Page 02 warms after that, not all seven pages at once.
  ======================================================= */
  runWhenIdle(async () => {
    await loadOpeningAssets("low");
    runWhenIdle(() => loadPage(pages[0], "low"), 1200);
  }, 650);

  /* Pause all page animations if the tab is hidden. */
  document.addEventListener("visibilitychange", () => {
    document.body.classList.toggle("is-document-hidden", document.hidden);
  });
})();
