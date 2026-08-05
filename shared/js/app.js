(() => {
  "use strict";

  const qs = (selector, parent = document) => parent.querySelector(selector);
  const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  // Personalize guest name through ?guest=Nguyen%20Van%20A
  const params = new URLSearchParams(window.location.search);
  const guest = (params.get("guest") || "").trim();
  if (guest) {
    qsa("[data-guest]").forEach((element) => {
      element.textContent = guest;
    });
  }

  // Opening envelope
  const opening = qs("[data-opening]");
  const openButton = qs("[data-open-invitation]");
  const openInvitation = () => {
    if (!opening) return;
    opening.classList.add("is-opening");
    document.body.classList.add("invitation-is-open");
    window.setTimeout(() => {
      opening.hidden = true;
      qs("main")?.focus({ preventScroll: true });
    }, 950);
  };

  openButton?.addEventListener("click", openInvitation);
  opening?.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && !event.target.closest("button")) {
      event.preventDefault();
      openInvitation();
    }
  });

  // Scroll reveal
  const revealElements = qsa("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -7% 0px" }
    );
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  // Gentle pointer parallax for marked decorations
  const parallaxItems = qsa("[data-parallax]");
  let pointerFrame;
  window.addEventListener("pointermove", (event) => {
    if (!parallaxItems.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      parallaxItems.forEach((item) => {
        const depth = Number(item.dataset.parallax || 8);
        item.style.setProperty("--parallax-x", `${x * depth}px`);
        item.style.setProperty("--parallax-y", `${y * depth}px`);
      });
    });
  });

  // Lucky message dialog
  const luckyDialog = qs("#lucky-dialog");
  const luckyResult = qs("[data-lucky-result]");
  const luckyMessages = [
    "Một năm thật nhiều niềm vui và bình an.",
    "May mắn sẽ đến từ những cuộc gặp gỡ chân thành.",
    "Tình yêu, sức khỏe và những hành trình đáng nhớ.",
    "Một bất ngờ dịu dàng đang chờ bạn phía trước.",
    "Niềm vui nhỏ hôm nay sẽ thành kỷ niệm thật lâu."
  ];

  qsa("[data-open-lucky]").forEach((button) => {
    button.addEventListener("click", () => {
      if (luckyResult) {
        luckyResult.textContent = luckyMessages[Math.floor(Math.random() * luckyMessages.length)];
      }
      if (luckyDialog?.showModal) {
        luckyDialog.showModal();
      } else if (luckyDialog) {
        luckyDialog.setAttribute("open", "");
      }
    });
  });

  qsa("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });

  // Demo wish form — static GitHub Pages cannot store submissions by itself.
  qsa("[data-wish-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = qs("[data-form-message]", form);
      if (message) {
        message.textContent = "Cảm ơn bạn! Đây là bản demo. Hãy nối form với Google Form hoặc Apps Script để lưu lời chúc.";
      }
      form.reset();
    });
  });

  // Demo RSVP action
  qsa("[data-rsvp-demo]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const href = button.getAttribute("href");
      if (!href || href === "#") {
        event.preventDefault();
        alert("Hãy thay liên kết nút này bằng đường dẫn Google Form xác nhận tham dự.");
      }
    });
  });

  // Video placeholder
  qsa("[data-video-demo]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const href = button.getAttribute("href");
      if (!href || href === "#") {
        event.preventDefault();
        alert("Hãy thay liên kết này bằng video YouTube, Vimeo hoặc Google Drive của cô dâu chú rể.");
      }
    });
  });

  // Music toggle — only works after shared/assets/music.mp3 is added.
  const musicButton = qs("[data-music-toggle]");
  const music = qs("#wedding-music");
  musicButton?.addEventListener("click", async () => {
    if (!music) return;
    try {
      if (music.paused) {
        await music.play();
        musicButton.classList.add("is-playing");
        musicButton.setAttribute("aria-label", "Tắt nhạc");
      } else {
        music.pause();
        musicButton.classList.remove("is-playing");
        musicButton.setAttribute("aria-label", "Bật nhạc");
      }
    } catch {
      alert("Chưa có file nhạc. Hãy thêm shared/assets/music.mp3.");
    }
  });

  // Update copyright year
  qsa("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
})();
