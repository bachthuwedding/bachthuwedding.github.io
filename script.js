(() => {
  "use strict";


  /* =======================================================
     CONFIG
  ======================================================= */

  const DESIGN_WIDTH = 390;
  const DESIGN_HEIGHT = 680;

  const LUCKY_MIN = 1;
  const LUCKY_MAX = 99;


  /*
    true:
    reload → roll lại được để test

    false:
    khóa số bằng localStorage
  */

  const LUCKY_TEST_MODE = true;


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


  const pages = [

    page02Layout,

    document.getElementById(
      "page03"
    ),

    document.getElementById(
      "page06"
    ),

    document.getElementById(
      "page07"
    ),

    document.getElementById(
      "page08"
    ),

  ].filter(Boolean);


  /* =======================================================
     LUCKY NUMBER
  ======================================================= */

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


  /* =======================================================
     RSVP
  ======================================================= */

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


  const rsvpMessage =
    document.getElementById(
      "rsvpMessage"
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


  /* =======================================================
     SCALE
  ======================================================= */

  function updateScale() {

    const viewport =
      window.visualViewport;


    const viewportWidth =
      viewport?.width
      ||
      window.innerWidth;


    const viewportHeight =
      viewport?.height
      ||
      window.innerHeight;


    const scale =
      Math.min(

        viewportWidth
        /
        DESIGN_WIDTH,

        viewportHeight
        /
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


  window.addEventListener(
    "orientationchange",
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


    return window
      .setTimeout(
        callback,
        160
      );
  }


  /* =======================================================
     PRELOAD
  ======================================================= */

  function preloadUrl(
    url,
    priority = "low"
  ) {

    if (!url) {

      return Promise.resolve();
    }


    if (
      urlPromises.has(url)
    ) {

      return urlPromises
        .get(url);
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
                typeof image.decode
                ===
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
      imagePromises.has(image)
    ) {

      return imagePromises
        .get(image);
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
                typeof image.decode
                ===
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
      pagePromises.has(page)
    ) {

      return pagePromises
        .get(page);
    }


    const promise =
      (async () => {

        page.classList.add(
          "is-loading-assets"
        );


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


        page.classList.remove(
          "is-loading-assets"
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


    /*
      Force browser to commit
      initial animation state.
    */

    void page02Layout.offsetWidth;


    requestAnimationFrame(
      () => {

        requestAnimationFrame(
          () => {

            /*
              ONE class starts:
              - clouds
              - confetti
              - procession
              - sequential text

              at the same render frame.
            */

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
     NEARBY PAGES
  ======================================================= */

  function setNearbyPages(
    index
  ) {

    if (
      !pages.length
    ) {

      return;
    }


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
            pageIndex
            -
            safeIndex
          )
          <=
          1
        );
      }
    );


    loadPage(
      pages[
        safeIndex
      ],
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
     CURRENT PAGE
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
          pageScroller.scrollTop
          /
          DESIGN_HEIGHT
        )
      )
    );
  }


  /* =======================================================
     SCROLL
  ======================================================= */

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
            index
            !==
            activePageIndex
          ) {

            activePageIndex =
              index;


            setNearbyPages(
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


    /*
      Ensure Page02 images are decoded
      before showing entrance animation.
    */

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


    playPage02Entrance();


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


  /*
    Warm Page02 shortly after Page01 appears.
  */

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
     GUEST TOKEN
  ======================================================= */

  function getGuestToken() {

    const params =
      new URLSearchParams(
        window.location.search
      );


    const token =
      (
        params.get(
          "guest"
        )
        ||
        params.get(
          "g"
        )
        ||
        "default"
      )
      .trim()
      .toLowerCase();


    return (
      token
      ||
      "default"
    );
  }


  /* =======================================================
     LUCKY STORAGE
  ======================================================= */

  function getLuckyStorageKey() {

    return (
      "bach-thu-wedding:lucky:"
      +
      getGuestToken()
    );
  }


  function readStoredLuckyNumber() {

    if (
      LUCKY_TEST_MODE
    ) {

      return null;
    }


    try {

      const raw =
        window.localStorage
          .getItem(
            getLuckyStorageKey()
          );


      if (
        raw === null
      ) {

        return null;
      }


      const value =
        Number(raw);


      if (
        !Number.isInteger(
          value
        )
        ||
        value <
        LUCKY_MIN
        ||
        value >
        LUCKY_MAX
      ) {

        return null;
      }


      return value;

    } catch (_) {

      return null;
    }
  }


  function saveLuckyNumber(
    value
  ) {

    if (
      LUCKY_TEST_MODE
    ) {

      return true;
    }


    try {

      window.localStorage
        .setItem(
          getLuckyStorageKey(),
          String(value)
        );


      return true;

    } catch (_) {

      return false;
    }
  }


  /* =======================================================
     LUCKY RANDOM
  ======================================================= */

  function randomLuckyNumber() {

    const range =
      LUCKY_MAX
      -
      LUCKY_MIN
      +
      1;


    if (
      window.crypto
      &&
      typeof window.crypto
        .getRandomValues
        ===
        "function"
    ) {

      const array =
        new Uint32Array(
          1
        );


      window.crypto
        .getRandomValues(
          array
        );


      return (
        LUCKY_MIN
        +
        (
          array[0]
          %
          range
        )
      );
    }


    return (
      LUCKY_MIN
      +
      Math.floor(
        Math.random()
        *
        range
      )
    );
  }


  function formatLuckyNumber(
    value
  ) {

    return String(
      value
    )
    .padStart(
      2,
      "0"
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
      formatLuckyNumber(
        value
      );
  }


  /* =======================================================
     LUCKY IDLE SHUFFLE
  ======================================================= */

  function stopLuckyIdleShuffle() {

    if (
      luckyIdleTimer
      !==
      null
    ) {

      window.clearInterval(
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
      !luckyCard
      ||
      !luckyNumber
      ||
      luckyLocked
      ||
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


    showLuckyNumber(
      randomLuckyNumber()
    );


    luckyIdleTimer =
      window.setInterval(
        () => {

          if (
            luckyLocked
            ||
            luckyRolling
          ) {

            return;
          }


          showLuckyNumber(
            randomLuckyNumber()
          );

        },
        105
      );
  }


  /* =======================================================
     FIREWORKS
     3 BURSTS / 102 PARTICLES
  ======================================================= */

  function clearLuckyFireworks() {

    if (
      !luckyFireworks
    ) {

      return;
    }


    luckyFireworks
      .replaceChildren();
  }


  function fireLuckyFireworks() {

    if (
      !luckyFireworks
    ) {

      return;
    }


    clearLuckyFireworks();


    const colors = [

      "#a63019",
      "#c99633",
      "#e5b747",
      "#315747",
      "#d76b35",
      "#f0d37b"

    ];


    const bursts = [

      {
        x: 0,
        y: -4,
        count: 42,
        min: 68,
        max: 145
      },

      {
        x: -55,
        y: 24,
        count: 30,
        min: 42,
        max: 105
      },

      {
        x: 55,
        y: 24,
        count: 30,
        min: 42,
        max: 105
      }

    ];


    const fragment =
      document
        .createDocumentFragment();


    bursts.forEach(
      (
        burst,
        burstIndex
      ) => {

        for (
          let index = 0;
          index < burst.count;
          index += 1
        ) {

          const particle =
            document
              .createElement(
                "span"
              );


          particle.className =
            "p06-firework-particle";


          const angle =
            (
              Math.PI
              *
              2
              *
              index
            )
            /
            burst.count
            +
            Math.random()
            *
            .25;


          const distance =
            burst.min
            +
            Math.random()
            *
            (
              burst.max
              -
              burst.min
            );


          const x =
            Math.cos(
              angle
            )
            *
            distance;


          const y =
            Math.sin(
              angle
            )
            *
            distance
            -
            12;


          const size =
            2
            +
            Math.random()
            *
            4.8;


          const delay =
            burstIndex
            *
            80
            +
            Math.random()
            *
            140;


          const rotation =
            Math.random()
            *
            720
            -
            360;


          const color =
            colors[
              Math.floor(
                Math.random()
                *
                colors.length
              )
            ];


          particle
            .style
            .setProperty(
              "--ox",
              `${burst.x}px`
            );


          particle
            .style
            .setProperty(
              "--oy",
              `${burst.y}px`
            );


          particle
            .style
            .setProperty(
              "--x",
              `${x.toFixed(2)}px`
            );


          particle
            .style
            .setProperty(
              "--y",
              `${y.toFixed(2)}px`
            );


          particle
            .style
            .setProperty(
              "--size",
              `${size.toFixed(2)}px`
            );


          particle
            .style
            .setProperty(
              "--delay",
              `${delay.toFixed(0)}ms`
            );


          particle
            .style
            .setProperty(
              "--rotation",
              `${rotation.toFixed(0)}deg`
            );


          particle
            .style
            .setProperty(
              "--particle-color",
              color
            );


          fragment
            .appendChild(
              particle
            );
        }
      }
    );


    luckyFireworks
      .appendChild(
        fragment
      );


    window.setTimeout(
      clearLuckyFireworks,
      1750
    );
  }


  /* =======================================================
     FINAL LUCKY NUMBER
  ======================================================= */

  function lockLuckyNumber(
    value,
    {
      animate = true,
      save = true
    } = {}
  ) {

    stopLuckyIdleShuffle();


    luckyRolling =
      false;


    luckyLocked =
      true;


    if (
      save
    ) {

      saveLuckyNumber(
        value
      );
    }


    showLuckyNumber(
      value
    );


    luckyCard
      ?.classList
      .remove(
        "is-rolling"
      );


    luckyCard
      ?.classList
      .add(
        "is-locked"
      );


    if (
      animate
    ) {

      luckyCard
        ?.classList
        .remove(
          "is-revealed"
        );


      void luckyCard
        ?.offsetWidth;


      luckyCard
        ?.classList
        .add(
          "is-revealed"
        );


      fireLuckyFireworks();
    }


    if (
      luckyHint
    ) {

      luckyHint.textContent =
        LUCKY_TEST_MODE
        ?
        "Reload trang để thử lại"
        :
        "Số may mắn của bạn";
    }


    if (
      luckyTrigger
    ) {

      luckyTrigger.disabled =
        true;


      luckyTrigger.setAttribute(
        "aria-label",
        `Số may mắn của bạn là ${formatLuckyNumber(value)}`
      );
    }
  }


  /* =======================================================
     ROLL
  ======================================================= */

  function rollLuckyNumber() {

    if (
      !luckyCard
      ||
      !luckyNumber
      ||
      luckyRolling
      ||
      luckyLocked
    ) {

      return;
    }


    stopLuckyIdleShuffle();


    luckyRolling =
      true;


    luckyCard
      .classList
      .remove(
        "is-revealed"
      );


    luckyCard
      .classList
      .add(
        "is-rolling"
      );


    if (
      luckyHint
    ) {

      luckyHint.textContent =
        "Đang tìm số may mắn...";
    }


    const finalNumber =
      randomLuckyNumber();


    const duration =
      1850;


    const startTime =
      performance.now();


    let lastChange =
      0;


    function frame(
      now
    ) {

      const elapsed =
        now
        -
        startTime;


      const progress =
        Math.min(

          elapsed
          /
          duration,

          1
        );


      const interval =
        35
        +
        (
          progress
          *
          progress
          *
          progress
          *
          145
        );


      if (
        now
        -
        lastChange
        >=
        interval
      ) {

        lastChange =
          now;


        showLuckyNumber(
          randomLuckyNumber()
        );
      }


      if (
        progress
        <
        1
      ) {

        requestAnimationFrame(
          frame
        );


        return;
      }


      lockLuckyNumber(
        finalNumber,
        {
          animate: true,
          save: true
        }
      );
    }


    requestAnimationFrame(
      frame
    );
  }


  /* =======================================================
     INIT LUCKY
  ======================================================= */

  function initialiseLuckyNumber() {

    if (
      !luckyCard
      ||
      !luckyNumber
      ||
      !luckyTrigger
    ) {

      return;
    }


    const storedNumber =
      readStoredLuckyNumber();


    if (
      storedNumber
      !==
      null
    ) {

      lockLuckyNumber(
        storedNumber,
        {
          animate: false,
          save: false
        }
      );


      return;
    }


    luckyLocked =
      false;


    luckyRolling =
      false;


    luckyTrigger.disabled =
      false;


    if (
      luckyHint
    ) {

      luckyHint.textContent =
        "Nhấn để nhận số may mắn";
    }


    startLuckyIdleShuffle();


    luckyTrigger
      .addEventListener(
        "click",
        rollLuckyNumber
      );
  }


  initialiseLuckyNumber();


  /* =======================================================
     RSVP
  ======================================================= */

  function getRsvpStorageKey() {

    return (
      "bach-thu-wedding:rsvp:"
      +
      getGuestToken()
    );
  }


  function updateRsvpCount() {

    if (
      !rsvpGuestCount
    ) {

      return;
    }


    rsvpGuestCount.textContent =
      String(
        rsvpCount
      );


    if (
      rsvpMinus
    ) {

      rsvpMinus.disabled =
        rsvpCount
        <=
        1
        ||
        rsvpAttendanceNo
          ?.checked;
    }


    if (
      rsvpPlus
    ) {

      rsvpPlus.disabled =
        rsvpCount
        >=
        10
        ||
        rsvpAttendanceNo
          ?.checked;
    }
  }


  function updateAttendanceState() {

    if (
      rsvpAttendanceNo
        ?.checked
    ) {

      rsvpCount =
        0;


      if (
        rsvpGuestCount
      ) {

        rsvpGuestCount.textContent =
          "0";
      }


      if (
        rsvpMinus
      ) {

        rsvpMinus.disabled =
          true;
      }


      if (
        rsvpPlus
      ) {

        rsvpPlus.disabled =
          true;
      }


      return;
    }


    if (
      rsvpCount
      <
      1
    ) {

      rsvpCount =
        1;
    }


    updateRsvpCount();
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


        updateRsvpCount();
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


        updateRsvpCount();
      }
    );


  rsvpAttendanceYes
    ?.addEventListener(
      "change",
      updateAttendanceState
    );


  rsvpAttendanceNo
    ?.addEventListener(
      "change",
      updateAttendanceState
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
          !rsvpVideoLabel
        ) {

          return;
        }


        rsvpVideoLabel.textContent =
          file
          ?
          file.name
          :
          "Video lời chúc gửi tới cô dâu chú rể";
      }
    );


  /* =======================================================
     RESTORE RSVP
  ======================================================= */

  function restoreRsvp() {

    if (
      !rsvpForm
    ) {

      return;
    }


    try {

      const raw =
        window.localStorage
          .getItem(
            getRsvpStorageKey()
          );


      if (
        !raw
      ) {

        updateRsvpCount();

        return;
      }


      const data =
        JSON.parse(
          raw
        );


      if (
        rsvpGuestName
        &&
        typeof data.name
        ===
        "string"
      ) {

        rsvpGuestName.value =
          data.name;
      }


      if (
        rsvpMessage
        &&
        typeof data.message
        ===
        "string"
      ) {

        rsvpMessage.value =
          data.message;
      }


      if (
        data.attendance
        ===
        "no"
      ) {

        if (
          rsvpAttendanceNo
        ) {

          rsvpAttendanceNo.checked =
            true;
        }


        if (
          rsvpAttendanceYes
        ) {

          rsvpAttendanceYes.checked =
            false;
        }


        rsvpCount =
          0;

      } else {

        if (
          rsvpAttendanceYes
        ) {

          rsvpAttendanceYes.checked =
            true;
        }


        rsvpCount =
          Number.isInteger(
            data.count
          )
          ?
          Math.min(
            10,
            Math.max(
              1,
              data.count
            )
          )
          :
          1;
      }


      updateAttendanceState();

    } catch (_) {

      updateRsvpCount();
    }
  }


  /* =======================================================
     RSVP SUBMIT
  ======================================================= */

  rsvpForm
    ?.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();


        const name =
          rsvpGuestName
            ?.value
            .trim()
          ||
          "";


        if (
          !name
        ) {

          if (
            rsvpStatus
          ) {

            rsvpStatus.textContent =
              "Bạn nhập tên khách mời giúp chúng mình nhé.";


            rsvpStatus
              .classList
              .add(
                "is-visible"
              );
          }


          rsvpGuestName
            ?.focus();


          return;
        }


        const attendance =
          rsvpAttendanceNo
            ?.checked
          ?
          "no"
          :
          "yes";


        const data = {

          name,

          attendance,

          count:
            attendance
            ===
            "yes"
            ?
            rsvpCount
            :
            0,

          message:
            rsvpMessage
              ?.value
              .trim()
            ||
            "",

          videoName:
            rsvpVideo
              ?.files
              ?.[0]
              ?.name
            ||
            "",

          guestToken:
            getGuestToken(),

          submittedAt:
            new Date()
              .toISOString()

        };


        /*
          LOCAL TEST SAVE.

          Sau này có backend/Google Sheet
          thì thay đoạn này.
        */

        try {

          window.localStorage
            .setItem(
              getRsvpStorageKey(),
              JSON.stringify(
                data
              )
            );

        } catch (_) {}


        if (
          rsvpStatus
        ) {

          rsvpStatus.textContent =
            attendance
            ===
            "yes"
            ?
            "Đã ghi nhận xác nhận của bạn. Hẹn gặp bạn tại ngày vui!"
            :
            "Đã ghi nhận phản hồi của bạn. Cảm ơn bạn rất nhiều!";


          rsvpStatus
            .classList
            .add(
              "is-visible"
            );
        }


        if (
          rsvpSubmit
        ) {

          const submitText =
            rsvpSubmit
              .querySelector(
                "span"
              );


          if (
            submitText
          ) {

            submitText.textContent =
              "ĐÃ GỬI XÁC NHẬN";
          }


          rsvpSubmit.disabled =
            true;
        }
      }
    );


  restoreRsvp();


  /* =======================================================
     VISIBILITY
  ======================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {

      document.body
        .classList
        .toggle(
          "is-document-hidden",
          document.hidden
        );


      if (
        document.hidden
      ) {

        if (
          !luckyLocked
          &&
          !luckyRolling
        ) {

          stopLuckyIdleShuffle();
        }

      } else {

        if (
          !luckyLocked
          &&
          !luckyRolling
        ) {

          startLuckyIdleShuffle();
        }
      }
    }
  );

})();
