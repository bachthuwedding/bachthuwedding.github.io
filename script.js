(() => {
  "use strict";


  const DESIGN_WIDTH = 390;
  const DESIGN_HEIGHT = 680;

  const LUCKY_MIN = 1;
  const LUCKY_MAX = 99;

  const LUCKY_TEST_MODE = true;


  /* =======================================================
     VIETNAMESE NFC NORMALIZATION
  ======================================================= */

  function normalizeVietnameseText(value) {

    if (
      typeof value !==
      "string"
    ) {

      return value;
    }


    return value.normalize(
      "NFC"
    );
  }


  function normalizeDocumentVietnamese() {

    if (!document.body) {
      return;
    }


    const walker =
      document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );


    const nodes = [];


    while (
      walker.nextNode()
    ) {

      nodes.push(
        walker.currentNode
      );
    }


    nodes.forEach(
      (node) => {

        if (
          typeof node.nodeValue !==
          "string"
        ) {

          return;
        }


        node.nodeValue =
          normalizeVietnameseText(
            node.nodeValue
          );
      }
    );


    document
      .querySelectorAll(
        "[placeholder], [aria-label], [title]"
      )
      .forEach(
        (element) => {

          [
            "placeholder",
            "aria-label",
            "title"
          ]
          .forEach(
            (attribute) => {

              if (
                !element.hasAttribute(
                  attribute
                )
              ) {

                return;
              }


              element.setAttribute(
                attribute,
                normalizeVietnameseText(
                  element.getAttribute(
                    attribute
                  )
                )
              );
            }
          );
        }
      );
  }


  normalizeDocumentVietnamese();


  /* =======================================================
     DOM
  ======================================================= */

  const root =
    document.documentElement;


  const siteShell =
    document.getElementById(
      "siteShell"
    );


  const openingCardButton =
    document.getElementById(
      "openingCardButton"
    );


  const pageScroller =
    document.getElementById(
      "page02"
    );


  const page02Layout =
    document.getElementById(
      "page02Layout"
    );


  const page03 =
    document.getElementById(
      "page03"
    );


  const page06 =
    document.getElementById(
      "page06"
    );


  const page07 =
    document.getElementById(
      "page07"
    );


  const page08 =
    document.getElementById(
      "page08"
    );


  const pages = [

    page02Layout,
    page03,
    page06,
    page07,
    page08

  ].filter(Boolean);


  const page06EntryFireworks =
    document.getElementById(
      "page06EntryFireworks"
    );


  const luckyCard =
    document.getElementById(
      "luckyCard"
    );


  const luckyNumber =
    document.getElementById(
      "luckyNumber"
    );


  const luckyHint =
    document.getElementById(
      "luckyHint"
    );


  const luckyTrigger =
    document.getElementById(
      "luckyTrigger"
    );


  const luckyFireworks =
    document.getElementById(
      "luckyFireworks"
    );


  const rsvpForm =
    document.getElementById(
      "rsvpForm"
    );


  const rsvpGuestName =
    document.getElementById(
      "rsvpGuestName"
    );


  const rsvpAttendanceYes =
    document.getElementById(
      "rsvpAttendanceYes"
    );


  const rsvpAttendanceNo =
    document.getElementById(
      "rsvpAttendanceNo"
    );


  const rsvpAttendanceNoText =
    document.getElementById(
      "rsvpAttendanceNoText"
    );


  const rsvpGuestCount =
    document.getElementById(
      "rsvpGuestCount"
    );


  const rsvpMinus =
    document.getElementById(
      "rsvpMinus"
    );


  const rsvpPlus =
    document.getElementById(
      "rsvpPlus"
    );


  const rsvpVideo =
    document.getElementById(
      "rsvpVideo"
    );


  const rsvpVideoLabel =
    document.getElementById(
      "rsvpVideoLabel"
    );


  const rsvpSubmit =
    document.getElementById(
      "rsvpSubmit"
    );


  const rsvpStatus =
    document.getElementById(
      "rsvpStatus"
    );


  /* =======================================================
     STATE
  ======================================================= */

  const imagePromises =
    new WeakMap();


  const pagePromises =
    new WeakMap();


  const urlPromises =
    new Map();


  let pageMode =
    false;


  let resizeRaf =
    0;


  let scrollRaf =
    0;


  let activePageIndex =
    -1;


  let luckyIdleTimer =
    null;


  let luckyRolling =
    false;


  let luckyLocked =
    false;


  let rsvpCount =
    1;


  let page06EntryTimer =
    null;


  /* =======================================================
     SCALE
  ======================================================= */

  function updateScale() {

    const viewport =
      window.visualViewport;


    const viewportWidth =
      viewport?.width ||
      window.innerWidth;


    const viewportHeight =
      viewport?.height ||
      window.innerHeight;


    const scale =
      Math.min(
        viewportWidth /
        DESIGN_WIDTH,

        viewportHeight /
        DESIGN_HEIGHT
      );


    root.style.setProperty(
      "--design-scale",
      String(scale)
    );


    root.style.setProperty(
      "--render-width",
      `${DESIGN_WIDTH * scale}px`
    );


    root.style.setProperty(
      "--render-height",
      `${DESIGN_HEIGHT * scale}px`
    );


    siteShell
      ?.classList
      .add(
        "is-scale-ready"
      );
  }


  function scheduleScale() {

    cancelAnimationFrame(
      resizeRaf
    );


    resizeRaf =
      requestAnimationFrame(
        updateScale
      );
  }


  updateScale();


  window.addEventListener(
    "resize",
    scheduleScale,
    {
      passive: true
    }
  );


  window.visualViewport
    ?.addEventListener(
      "resize",
      scheduleScale,
      {
        passive: true
      }
    );


  /* =======================================================
     IDLE
  ======================================================= */

  function runWhenIdle(
    callback,
    timeout = 1000
  ) {

    if (
      "requestIdleCallback"
      in window
    ) {

      return window
        .requestIdleCallback(
          callback,
          {
            timeout
          }
        );
    }


    return window.setTimeout(
      callback,
      160
    );
  }


  /* =======================================================
     PRELOAD URL
  ======================================================= */

  function preloadUrl(
    url,
    priority = "low"
  ) {

    if (!url) {

      return Promise.resolve();
    }


    if (
      urlPromises.has(
        url
      )
    ) {

      return urlPromises.get(
        url
      );
    }


    const promise =
      new Promise(
        (resolve) => {

          const image =
            new Image();


          image.decoding =
            "async";


          try {

            image.fetchPriority =
              priority;

          } catch (_) {}


          const finish =
            () => {

              if (
                typeof image.decode ===
                "function"
              ) {

                image
                  .decode()
                  .catch(
                    () => {}
                  )
                  .finally(
                    resolve
                  );

              } else {

                resolve();
              }
            };


          image.addEventListener(
            "load",
            finish,
            {
              once: true
            }
          );


          image.addEventListener(
            "error",
            resolve,
            {
              once: true
            }
          );


          image.src =
            url;


          if (
            image.complete
          ) {

            finish();
          }
        }
      );


    urlPromises.set(
      url,
      promise
    );


    return promise;
  }


  /* =======================================================
     LOAD IMAGE
  ======================================================= */

  function loadImage(
    image,
    priority = "low"
  ) {

    if (!image) {

      return Promise.resolve();
    }


    if (
      imagePromises.has(
        image
      )
    ) {

      return imagePromises.get(
        image
      );
    }


    const source =
      image.dataset.src;


    if (!source) {

      return Promise.resolve();
    }


    const promise =
      new Promise(
        (resolve) => {

          try {

            image.fetchPriority =
              priority;

          } catch (_) {}


          const finish =
            () => {

              if (
                typeof image.decode ===
                "function"
              ) {

                image
                  .decode()
                  .catch(
                    () => {}
                  )
                  .finally(
                    resolve
                  );

              } else {

                resolve();
              }
            };


          image.addEventListener(
            "load",
            finish,
            {
              once: true
            }
          );


          image.addEventListener(
            "error",
            resolve,
            {
              once: true
            }
          );


          image.src =
            source;


          image.removeAttribute(
            "data-src"
          );


          if (
            image.complete
          ) {

            finish();
          }
        }
      );


    imagePromises.set(
      image,
      promise
    );


    return promise;
  }


  /* =======================================================
     LOAD PAGE
  ======================================================= */

  function loadPage(
    page,
    priority = "low"
  ) {

    if (!page) {

      return Promise.resolve();
    }


    if (
      pagePromises.has(
        page
      )
    ) {

      return pagePromises.get(
        page
      );
    }


    const promise =
      (async () => {

        const images =
          Array.from(
            page.querySelectorAll(
              "img[data-src]"
            )
          );


        const jobs =
          images.map(
            (image) =>
              loadImage(
                image,
                priority
              )
          );


        const spriteHost =
          page.querySelector(
            "[data-sprite-src]"
          );


        if (
          spriteHost
        ) {

          const spriteUrl =
            spriteHost
              .dataset
              .spriteSrc;


          jobs.push(

            preloadUrl(
              spriteUrl,
              priority
            )

            .then(
              () => {

                spriteHost
                  .style
                  .setProperty(
                    "--p02-confetti-sprite",
                    `url("${spriteUrl}")`
                  );


                spriteHost
                  .removeAttribute(
                    "data-sprite-src"
                  );
              }
            )
          );
        }


        await Promise.allSettled(
          jobs
        );


        page.classList.add(
          "is-assets-ready"
        );
      })();


    pagePromises.set(
      page,
      promise
    );


    return promise;
  }


  /* =======================================================
     PAGE 02 ENTRANCE
  ======================================================= */

  function playPage02Entrance() {

    if (
      !page02Layout
    ) {

      return;
    }


    page02Layout
      .classList
      .remove(
        "is-entering"
      );


    void page02Layout.offsetWidth;


    requestAnimationFrame(
      () => {

        requestAnimationFrame(
          () => {

            page02Layout
              .classList
              .add(
                "is-entering"
              );
          }
        );
      }
    );
  }


  /* =======================================================
     FIREWORK PARTICLES
  ======================================================= */

  const fireworkColors = [
    "#a63019",
    "#c99633",
    "#e5b747",
    "#315747",
    "#d76b35",
    "#f0d37b"
  ];


  function spawnFireworks(
    target,
    {
      count = 90,
      minDistance = 45,
      maxDistance = 135,
      cleanup = 1500
    } = {}
  ) {

    if (!target) {

      return;
    }


    target.replaceChildren();


    const fragment =
      document
        .createDocumentFragment();


    for (
      let i = 0;
      i < count;
      i += 1
    ) {

      const particle =
        document.createElement(
          "span"
        );


      particle.className =
        "p06-firework-particle";


      const angle =
        Math.random() *
        Math.PI *
        2;


      const distance =
        minDistance +
        Math.random() *
        (
          maxDistance -
          minDistance
        );


      particle.style.setProperty(
        "--x",
        `${Math.cos(angle) * distance}px`
      );


      particle.style.setProperty(
        "--y",
        `${Math.sin(angle) * distance}px`
      );


      particle.style.setProperty(
        "--size",
        `${2 + Math.random() * 4}px`
      );


      particle.style.setProperty(
        "--delay",
        `${Math.random() * 150}ms`
      );


      particle.style.setProperty(
        "--rotation",
        `${Math.random() * 720}deg`
      );


      particle.style.setProperty(
        "--particle-color",
        fireworkColors[
          Math.floor(
            Math.random() *
            fireworkColors.length
          )
        ]
      );


      fragment.appendChild(
        particle
      );
    }


    target.appendChild(
      fragment
    );


    setTimeout(
      () => {

        target.replaceChildren();
      },
      cleanup
    );
  }


  /* =======================================================
     PAGE 06 ENTRY
  ======================================================= */

  function playPage06Entrance() {

    if (!page06) {

      return;
    }


    clearTimeout(
      page06EntryTimer
    );


    page06
      .classList
      .remove(
        "is-confetti-visible"
      );


    /*
      Pháo hoa nổ trước.
    */

    spawnFireworks(
      page06EntryFireworks,
      {
        count: 115,
        minDistance: 60,
        maxDistance: 170,
        cleanup: 1500
      }
    );


    /*
      Sau đó confetti mới hiện.
    */

    page06EntryTimer =
      setTimeout(
        () => {

          if (
            page06
              .classList
              .contains(
                "is-active"
              )
          ) {

            page06
              .classList
              .add(
                "is-confetti-visible"
              );
          }
        },
        600
      );
  }


  /* =======================================================
     ACTIVE PAGE
  ======================================================= */

  function activatePage(
    index
  ) {

    const safeIndex =
      Math.max(
        0,
        Math.min(
          index,
          pages.length - 1
        )
      );


    pages.forEach(
      (
        page,
        pageIndex
      ) => {

        const active =
          pageIndex ===
          safeIndex;


        page.classList.toggle(
          "is-active",
          active
        );


        if (
          page === page06 &&
          !active
        ) {

          page
            .classList
            .remove(
              "is-confetti-visible"
            );
        }
      }
    );


    if (
      pages[safeIndex] ===
      page02Layout
    ) {

      playPage02Entrance();
    }


    if (
      pages[safeIndex] ===
      page06
    ) {

      requestAnimationFrame(
        playPage06Entrance
      );
    }
  }


  /* =======================================================
     NEARBY PAGES
  ======================================================= */

  function setNearbyPages(
    index
  ) {

    const safeIndex =
      Math.max(
        0,
        Math.min(
          index,
          pages.length - 1
        )
      );


    pages.forEach(
      (
        page,
        pageIndex
      ) => {

        page.classList.toggle(
          "is-nearby",
          Math.abs(
            pageIndex -
            safeIndex
          ) <= 1
        );
      }
    );


    loadPage(
      pages[safeIndex],
      "high"
    );


    if (
      pages[
        safeIndex + 1
      ]
    ) {

      loadPage(
        pages[
          safeIndex + 1
        ],
        "low"
      );
    }
  }


  /* =======================================================
     SCROLL
  ======================================================= */

  function getCurrentPageIndex() {

    if (
      !pageScroller
    ) {

      return 0;
    }


    return Math.max(
      0,
      Math.min(
        pages.length - 1,
        Math.round(
          pageScroller.scrollTop /
          DESIGN_HEIGHT
        )
      )
    );
  }


  function onPageScroll() {

    if (
      scrollRaf
    ) {

      return;
    }


    scrollRaf =
      requestAnimationFrame(
        () => {

          scrollRaf =
            0;


          const index =
            getCurrentPageIndex();


          if (
            index !==
            activePageIndex
          ) {

            activePageIndex =
              index;


            setNearbyPages(
              index
            );


            activatePage(
              index
            );
          }
        }
      );
  }


  pageScroller
    ?.addEventListener(
      "scroll",
      onPageScroll,
      {
        passive: true
      }
    );


  /* =======================================================
     OPEN INVITATION
  ======================================================= */

  async function enterInvitation() {

    if (
      pageMode
    ) {

      return;
    }


    pageMode =
      true;


    await loadPage(
      pages[0],
      "high"
    );


    if (
      pageScroller
    ) {

      pageScroller.scrollTop =
        0;


      pageScroller.setAttribute(
        "aria-hidden",
        "false"
      );
    }


    siteShell
      ?.classList
      .add(
        "is-page-02"
      );


    activePageIndex =
      0;


    setNearbyPages(
      0
    );


    activatePage(
      0
    );


    runWhenIdle(
      () => {

        if (
          pages[1]
        ) {

          loadPage(
            pages[1],
            "low"
          );
        }
      },
      600
    );
  }


  openingCardButton
    ?.addEventListener(
      "pointerdown",
      () => {

        loadPage(
          pages[0],
          "high"
        );
      },
      {
        passive: true
      }
    );


  openingCardButton
    ?.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        enterInvitation();
      }
    );


  runWhenIdle(
    () => {

      loadPage(
        pages[0],
        "low"
      );
    },
    450
  );


  /* =======================================================
     LUCKY NUMBER
  ======================================================= */

  function randomLuckyNumber() {

    const range =
      LUCKY_MAX -
      LUCKY_MIN +
      1;


    if (
      window.crypto
      ?.getRandomValues
    ) {

      const data =
        new Uint32Array(1);


      window.crypto
        .getRandomValues(
          data
        );


      return (
        LUCKY_MIN +
        data[0] %
        range
      );
    }


    return (
      LUCKY_MIN +
      Math.floor(
        Math.random() *
        range
      )
    );
  }


  function showLuckyNumber(
    value
  ) {

    if (
      !luckyNumber
    ) {

      return;
    }


    luckyNumber.textContent =
      String(value)
        .padStart(
          2,
          "0"
        );
  }


  function stopLuckyIdleShuffle() {

    if (
      luckyIdleTimer !==
      null
    ) {

      clearInterval(
        luckyIdleTimer
      );


      luckyIdleTimer =
        null;
    }


    luckyCard
      ?.classList
      .remove(
        "is-idle-shuffling"
      );
  }


  function startLuckyIdleShuffle() {

    if (
      !luckyCard ||
      luckyLocked ||
      luckyRolling
    ) {

      return;
    }


    stopLuckyIdleShuffle();


    luckyCard
      .classList
      .add(
        "is-idle-shuffling"
      );


    luckyIdleTimer =
      setInterval(
        () => {

          showLuckyNumber(
            randomLuckyNumber()
          );
        },
        145
      );
  }


  function fireLuckyFireworks() {

    spawnFireworks(
      luckyFireworks,
      {
        count: 102,
        minDistance: 55,
        maxDistance: 155,
        cleanup: 1700
      }
    );
  }


  function rollLuckyNumber() {

    if (
      luckyRolling ||
      luckyLocked
    ) {

      return;
    }


    stopLuckyIdleShuffle();


    luckyRolling =
      true;


    luckyCard
      ?.classList
      .remove(
        "is-revealed"
      );


    luckyCard
      ?.classList
      .add(
        "is-rolling"
      );


    if (
      luckyHint
    ) {

      luckyHint.textContent =
        normalizeVietnameseText(
          "Đang tìm số may mắn..."
        );
    }


    const finalNumber =
      randomLuckyNumber();


    const start =
      performance.now();


    const duration =
      1850;


    let lastUpdate =
      0;


    function frame(
      now
    ) {

      const progress =
        Math.min(
          (
            now -
            start
          ) /
          duration,
          1
        );


      const interval =
        45 +
        Math.pow(
          progress,
          3
        ) *
        145;


      if (
        now -
        lastUpdate >=
        interval
      ) {

        lastUpdate =
          now;


        showLuckyNumber(
          randomLuckyNumber()
        );
      }


      if (
        progress <
        1
      ) {

        requestAnimationFrame(
          frame
        );


        return;
      }


      luckyRolling =
        false;


      luckyLocked =
        true;


      luckyCard
        ?.classList
        .remove(
          "is-rolling"
        );


      luckyCard
        ?.classList
        .add(
          "is-revealed"
        );


      showLuckyNumber(
        finalNumber
      );


      fireLuckyFireworks();


      if (
        luckyHint
      ) {

        luckyHint.textContent =
          normalizeVietnameseText(
            LUCKY_TEST_MODE
              ?
              "Tải lại trang để thử lại"
              :
              "Số may mắn của bạn"
          );
      }


      if (
        luckyTrigger
      ) {

        luckyTrigger.disabled =
          true;
      }
    }


    requestAnimationFrame(
      frame
    );
  }


  startLuckyIdleShuffle();


  luckyTrigger
    ?.addEventListener(
      "click",
      rollLuckyNumber
    );


  /* =======================================================
     RSVP
  ======================================================= */

  function updateCount() {

    if (
      !rsvpGuestCount
    ) {

      return;
    }


    rsvpGuestCount.textContent =
      String(
        rsvpCount
      );
  }


  /*
    PHẦN THAY ĐỔI DUY NHẤT SO VỚI UI RSVP CŨ:

    - chưa chọn "Không" => Không
    - chọn "Không"      => Kó
    - quay lại "Có"     => Không
  */

  function updateAttendanceNoLabel() {

    if (
      !rsvpAttendanceNoText
    ) {

      return;
    }


    rsvpAttendanceNoText.textContent =
      rsvpAttendanceNo
        ?.checked
        ?
        "Kó"
        :
        "Không";
  }


  rsvpMinus
    ?.addEventListener(
      "click",
      () => {

        if (
          rsvpAttendanceNo
            ?.checked
        ) {

          return;
        }


        rsvpCount =
          Math.max(
            1,
            rsvpCount - 1
          );


        updateCount();
      }
    );


  rsvpPlus
    ?.addEventListener(
      "click",
      () => {

        if (
          rsvpAttendanceNo
            ?.checked
        ) {

          return;
        }


        rsvpCount =
          Math.min(
            10,
            rsvpCount + 1
          );


        updateCount();
      }
    );


  rsvpAttendanceNo
    ?.addEventListener(
      "change",
      () => {

        updateAttendanceNoLabel();


        if (
          rsvpAttendanceNo.checked
        ) {

          rsvpCount =
            0;


          updateCount();
        }
      }
    );


  rsvpAttendanceYes
    ?.addEventListener(
      "change",
      () => {

        updateAttendanceNoLabel();


        if (
          rsvpAttendanceYes.checked &&
          rsvpCount < 1
        ) {

          rsvpCount =
            1;


          updateCount();
        }
      }
    );


  rsvpVideo
    ?.addEventListener(
      "change",
      () => {

        const file =
          rsvpVideo
            .files
            ?.[0];


        if (
          file &&
          rsvpVideoLabel
        ) {

          rsvpVideoLabel.textContent =
            normalizeVietnameseText(
              file.name
            );
        }
      }
    );


  rsvpForm
    ?.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();


        const name =
          rsvpGuestName
            ?.value
            .trim();


        if (
          !name
        ) {

          if (
            rsvpStatus
          ) {

            rsvpStatus.textContent =
              normalizeVietnameseText(
                "Bạn nhập tên khách mời giúp chúng mình nhé."
              );


            rsvpStatus
              .classList
              .add(
                "is-visible"
              );
          }


          return;
        }


        if (
          rsvpStatus
        ) {

          rsvpStatus.textContent =
            normalizeVietnameseText(
              "Đã ghi nhận xác nhận của bạn. Hẹn gặp bạn tại ngày vui!"
            );


          rsvpStatus
            .classList
            .add(
              "is-visible"
            );
        }


        if (
          rsvpSubmit
        ) {

          rsvpSubmit.disabled =
            true;


          const text =
            rsvpSubmit
              .querySelector(
                "span"
              );


          if (
            text
          ) {

            text.textContent =
              "ĐÃ GỬI XÁC NHẬN";
          }
        }
      }
    );


  updateCount();

  updateAttendanceNoLabel();


  /* =======================================================
     VISIBILITY
  ======================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.hidden
      ) {

        stopLuckyIdleShuffle();

      } else if (
        !luckyLocked &&
        !luckyRolling
      ) {

        startLuckyIdleShuffle();
      }
    }
  );

})();
