(() => {
  "use strict";

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const iconHref = "../shared/assets/icons.svg";

  // Guest personalization: ?guest=Nguyễn%20Văn%20An
  const params = new URLSearchParams(location.search);
  const guest = (params.get("guest") || "").trim();
  if (guest) {
    qsa("[data-guest]").forEach((node) => {
      node.textContent = guest;
    });
  }

  // Opening scene.
  const opening = qs("[data-opening]");
  const openButtons = qsa("[data-open-invitation]");
  let openingDone = false;

  const openInvitation = () => {
    if (!opening || openingDone) return;
    openingDone = true;
    opening.classList.add("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(() => {
      opening.hidden = true;
      qs("main")?.focus({ preventScroll: true });
    }, 1100);
  };

  openButtons.forEach((button) => button.addEventListener("click", openInvitation));
  opening?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openInvitation();
    }
  });

  // Scroll reveal.
  const revealNodes = qsa("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        activeObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  // Subtle pointer parallax for desktop/tablet.
  const parallaxNodes = qsa("[data-parallax]");
  let pointerFrame = 0;
  window.addEventListener("pointermove", (event) => {
    if (!parallaxNodes.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      const x = (event.clientX / innerWidth - 0.5) * 2;
      const y = (event.clientY / innerHeight - 0.5) * 2;
      parallaxNodes.forEach((node) => {
        const depth = Number(node.dataset.parallax || 5);
        node.style.setProperty("--px", `${x * depth}px`);
        node.style.setProperty("--py", `${y * depth}px`);
      });
    });
  });

  // Modal helpers.
  const showDialog = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  };
  qsa("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });
  qsa("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      const rect = dialog.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) dialog.close();
    });
  });

  // Lucky game.
  const luckyDialog = qs("#lucky-dialog");
  const luckyResult = qs("[data-lucky-result]");
  const luckyMessages = [
    "Số may mắn của bạn là 08 — viên mãn và đủ đầy.",
    "Số may mắn của bạn là 18 — khởi đầu cho những niềm vui mới.",
    "Số may mắn của bạn là 25 — bình an, yêu thương và nhiều chuyến đi.",
    "Số may mắn của bạn là 68 — lộc đến, duyên lành và thật nhiều tiếng cười.",
    "Món quà của bạn là một lời chúc: mọi điều dịu dàng sẽ tìm đến đúng lúc."
  ];

  qsa("[data-lucky]").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.remove("is-shaking");
      void button.offsetWidth;
      button.classList.add("is-shaking");
      window.setTimeout(() => {
        if (luckyResult) {
          luckyResult.textContent = luckyMessages[Math.floor(Math.random() * luckyMessages.length)];
        }
        showDialog(luckyDialog);
      }, 430);
    });
  });

  // Folk gift selection.
  let selectedGift = null;
  qsa("[data-gift]").forEach((gift) => {
    gift.addEventListener("click", () => {
      qsa("[data-gift]").forEach((item) => item.classList.remove("is-selected"));
      gift.classList.add("is-selected");
      selectedGift = gift.dataset.gift;
    });
  });
  qs("[data-open-selected-gift]")?.addEventListener("click", () => {
    if (!selectedGift) {
      alert("Bạn hãy chọn một phong bao trước nhé.");
      return;
    }
    if (luckyResult) {
      const giftCopy = {
        red: "Phong bao đỏ gửi bạn lời chúc: rực rỡ, may mắn và nhiều niềm vui.",
        green: "Phong bao xanh gửi bạn lời chúc: bình an, bền bỉ và luôn có người đồng hành.",
        cream: "Phong bao kem gửi bạn lời chúc: dịu dàng, đủ đầy và những điều tốt lành."
      };
      luckyResult.textContent = giftCopy[selectedGift];
    }
    showDialog(luckyDialog);
  });

  // Wish form demo.
  qsa("[data-wish-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = qs("[data-form-status]", form);
      if (status) {
        status.textContent = "Cảm ơn bạn! Bản demo chưa lưu dữ liệu; hãy nối form với Google Form hoặc Apps Script.";
      }
      form.reset();
    });
  });

  // Video modal.
  const videoDialog = qs("#video-dialog");
  qsa("[data-open-video]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      showDialog(videoDialog);
    });
  });

  // RSVP.
  const rsvpDialog = qs("#rsvp-dialog");
  qsa("[data-open-rsvp]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      showDialog(rsvpDialog);
    });
  });
  qsa("[data-rsvp-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.rsvpChoice;
      const message = qs("[data-rsvp-status]");
      if (message) {
        message.textContent = choice === "yes"
          ? "Cảm ơn bạn đã xác nhận tham dự. Hẹn gặp bạn trong ngày vui!"
          : "Cảm ơn bạn đã phản hồi. Bách & Thư rất trân trọng tình cảm của bạn.";
      }
      try { localStorage.setItem("wedding-rsvp", choice); } catch {}
    });
  });

  // Optional background music.
  const music = qs("#wedding-music");
  const musicButton = qs("[data-music]");
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
      alert("Chưa có file nhạc. Hãy đặt file music.mp3 trong shared/assets.");
    }
  });

  // Current year.
  qsa("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
