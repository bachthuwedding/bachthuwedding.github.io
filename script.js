(() => {
  "use strict";


  /* =======================================================
     CONFIG
  ======================================================= */

  const DESIGN_WIDTH = 390;
  const DESIGN_HEIGHT = 680;

  const LUCKY_MIN = 1;
  const LUCKY_MAX = 99;


  const WEDDING_API_URL =
    "https://script.google.com/macros/s/AKfycbzZgGDz-UI1bGQI8M4FoYe1GzxUWCI9V1k_hK6N_9WftwU9qyH-Utm9csjz9NkdW6Axhg/exec";


  const LUCKY_HINT_REVEALED =
    "Hãy giữ con số may mắn của bạn tới ngày cưới của chúng mình nhé!";


  /* =======================================================
     URL GUEST
  ======================================================= */

  const urlParams =
    new URLSearchParams(
      window.location.search
    );


  const currentGuestSlug =
    normalizeGuestSlug(
      urlParams.get("guest") || ""
    );


  let currentGuestData =
    null;


  function normalizeGuestSlug(value) {

    return String(
      value || ""
    )
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9-]/g,
        ""
      );
  }


  function isBackendConfigured() {

    return (
      WEDDING_API_URL.startsWith(
        "https://script.google.com/macros/s/"
      )
      &&
      WEDDING_API_URL.includes(
        "/exec"
      )
    );
  }


  function normalizeText(value) {

    return String(
      value ?? ""
    )
      .normalize(
        "NFC"
      );
  }


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


  const personalizedGuestName =
    document.getElementById(
      "personalizedGuestName"
    );


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


  const rsvpMessage =
    document.getElementById(
      "rsvpMessage"
    );


  const rsvpSubmit =
    document.getElementById(
      "rsvpSubmit"
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
     JSONP GET
  ======================================================= */

  function jsonpRequest(
    params = {},
    timeout = 15000
  ) {

    return new Promise(
      (resolve, reject) => {

        if (
          !isBackendConfigured()
        ) {

          reject(
            new Error(
              "Backend chưa được cấu hình."
            )
          );

          return;
        }


        const callbackName =
          "__wedding_"
          +
          Date.now()
          +
          "_"
          +
          Math.random()
            .toString(36)
            .slice(2);


        const query =
          new URLSearchParams();


        Object.entries(
          params
        )
          .forEach(
            ([key, value]) => {

              if (
                value ===
                undefined
                ||
                value ===
                null
              ) {

                return;
              }


              query.set(
                key,
                String(value)
              );
            }
          );


        query.set(
          "callback",
          callbackName
        );


        query.set(
          "_",
          String(
            Date.now()
          )
        );


        const script =
          document.createElement(
            "script"
          );


        let timer =
          null;


        const cleanup =
          () => {

            if (
              timer !==
              null
            ) {

              clearTimeout(
                timer
              );
            }


            try {

              delete window[
                callbackName
              ];

            } catch (_) {

              window[
                callbackName
              ] =
                undefined;
            }


            script.remove();
          };


        window[
          callbackName
        ] =
          (data) => {

            cleanup();

            resolve(
              data
            );
          };


        script.onerror =
          () => {

            cleanup();

            reject(
              new Error(
                "Không thể đọc dữ liệu từ Apps Script."
              )
            );
          };


        script.src =
          WEDDING_API_URL
          +
          "?"
          +
          query.toString();


        script.async =
          true;


        timer =
          setTimeout(
            () => {

              cleanup();

              reject(
                new Error(
                  "Apps Script phản hồi quá lâu."
                )
              );
            },
            timeout
          );


        document.head.appendChild(
          script
        );
      }
    );
  }


  /* =======================================================
     POST
  ======================================================= */

  async function postToBackend(
    data
  ) {

    if (
      !isBackendConfigured()
    ) {

      throw new Error(
        "Backend chưa được cấu hình."
      );
    }


    const body =
      new URLSearchParams();


    Object.entries(
      data
    )
      .forEach(
        ([key, value]) => {

          if (
            value ===
              undefined
            ||
            value ===
              null
          ) {

            return;
          }


          body.append(
            key,
            String(value)
          );
        }
      );


    await fetch(
      WEDDING_API_URL,
      {
        method:
          "POST",

        mode:
          "no-cors",

        body,

        keepalive:
          true
      }
    );
  }


  function sleep(ms) {

    return new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          ms
        )
    );
  }


  /* =======================================================
     MARK OPENED
  ======================================================= */

  function markInvitationOpened() {

    if (
      !currentGuestSlug
    ) {

      return;
    }


    postToBackend(
      {
        action:
          "markOpened",

        guest:
          currentGuestSlug
      }
    )
      .catch(
        (error) => {

          console.warn(
            "Không ghi được Đã đọc:",
            error
          );
        }
      );
  }


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
      passive:
        true
    }
  );


  window.visualViewport
    ?.addEventListener(
      "resize",
      scheduleScale,
      {
        passive:
          true
      }
    );


  /* =======================================================
     SCROLL FROM OUTSIDE INVITATION
  ======================================================= */

  window.addEventListener(
    "wheel",
    (event) => {

      if (
        !pageMode
        ||
        !pageScroller
      ) {

        return;
      }


      /*
        Chuột đang nằm bên trong thiệp:
        để browser scroll bình thường.
      */

      if (
        event.target
        &&
        pageScroller.contains(
          event.target
        )
      ) {

        return;
      }


      if (
        Math.abs(
          event.deltaY
        )
        <=
        Math.abs(
          event.deltaX
        )
      ) {

        return;
      }


      event.preventDefault();


      pageScroller.scrollTop +=
        event.deltaY;
    },
    {
      passive:
        false
    }
  );


  /* =======================================================
     IDLE HELPER
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
     IMAGE PRELOAD
  ======================================================= */

  function preloadUrl(
    url,
    priority = "low"
  ) {

    if (
      !url
    ) {

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
              once:
                true
            }
          );


          image.addEventListener(
            "error",
            resolve,
            {
              once:
                true
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


  function loadImage(
    image,
    priority = "low"
  ) {

    if (
      !image
    ) {

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


    if (
      !source
    ) {

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
              once:
                true
            }
          );


          image.addEventListener(
            "error",
            resolve,
            {
              once:
                true
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


  function loadPage(
    page,
    priority = "low"
  ) {

    if (
      !page
    ) {

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
     PAGE 02 ENTRY
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
     FIREWORKS
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

    if (
      !target
    ) {

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
        Math.random()
        *
        Math.PI
        *
        2;


      const distance =
        minDistance
        +
        Math.random()
        *
        (
          maxDistance
          -
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
            Math.random()
            *
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


  function playPage06Entrance() {

    if (
      !page06
    ) {

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


    spawnFireworks(
      page06EntryFireworks,
      {
        count:
          115,

        minDistance:
          60,

        maxDistance:
          170,

        cleanup:
          1500
      }
    );


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
     PAGE ACTIVATION
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
          page === page06
          &&
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
            pageIndex
            -
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
        passive:
          true
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
        passive:
          true
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
     LUCKY LOCAL STORAGE
  ======================================================= */

  function getLuckyStorageKey() {

    if (
      !currentGuestSlug
    ) {

      return "";
    }


    return (
      "bach-thu-lucky-"
      +
      currentGuestSlug
    );
  }


  function readLocalLuckyNumber() {

    const key =
      getLuckyStorageKey();


    if (
      !key
    ) {

      return null;
    }


    try {

      const value =
        Number(
          localStorage.getItem(
            key
          )
        );


      if (
        Number.isInteger(
          value
        )
        &&
        value >=
          LUCKY_MIN
        &&
        value <=
          LUCKY_MAX
      ) {

        return value;
      }

    } catch (_) {}


    return null;
  }


  function saveLocalLuckyNumber(
    value
  ) {

    const key =
      getLuckyStorageKey();


    if (
      !key
    ) {

      return;
    }


    try {

      localStorage.setItem(
        key,
        String(value)
      );

    } catch (_) {}
  }


  /* =======================================================
     LUCKY NUMBER UI
  ======================================================= */

  function randomLuckyNumber() {

    const range =
      LUCKY_MAX
      -
      LUCKY_MIN
      +
      1;


    if (
      crypto
      ?.getRandomValues
    ) {

      const data =
        new Uint32Array(
          1
        );


      crypto.getRandomValues(
        data
      );


      return (
        LUCKY_MIN
        +
        data[0]
        %
        range
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


  function deterministicLuckyNumber(
    slug
  ) {

    let hash =
      2166136261;


    const value =
      String(
        slug || ""
      );


    for (
      let i = 0;
      i < value.length;
      i += 1
    ) {

      hash ^=
        value.charCodeAt(
          i
        );


      hash =
        Math.imul(
          hash,
          16777619
        );
    }


    return (
      (
        hash >>> 0
      )
      %
      99
    )
    +
    1;
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
      String(
        value
      )
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
      !luckyCard
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


  function lockLuckyNumber(
    value,
    animate = false
  ) {

    const number =
      Number(
        value
      );


    if (
      !Number.isInteger(
        number
      )
      ||
      number <
        LUCKY_MIN
      ||
      number >
        LUCKY_MAX
    ) {

      return;
    }


    stopLuckyIdleShuffle();


    luckyLocked =
      true;


    luckyRolling =
      false;


    showLuckyNumber(
      number
    );


    saveLocalLuckyNumber(
      number
    );


    luckyCard
      ?.classList
      .remove(
        "is-rolling",
        "is-idle-shuffling"
      );


    if (
      animate
    ) {

      luckyCard
        ?.classList
        .remove(
          "is-revealed"
        );


      if (
        luckyCard
      ) {

        void luckyCard.offsetWidth;
      }


      luckyCard
        ?.classList
        .add(
          "is-revealed"
        );
    }


    if (
      luckyHint
    ) {

      luckyHint.textContent =
        normalizeText(
          LUCKY_HINT_REVEALED
        );
    }


    if (
      luckyTrigger
    ) {

      luckyTrigger.disabled =
        true;


      luckyTrigger.setAttribute(
        "aria-label",
        "Bạn đã nhận số may mắn"
      );
    }
  }


  function fireLuckyFireworks() {

    spawnFireworks(
      luckyFireworks,
      {
        count:
          102,

        minDistance:
          55,

        maxDistance:
          155,

        cleanup:
          1700
      }
    );
  }


  async function requestGuestLuckyNumber() {

    if (
      !currentGuestSlug
    ) {

      return null;
    }


    try {

      const response =
        await jsonpRequest(
          {
            action:
              "lucky",

            guest:
              currentGuestSlug
          }
        );


      const number =
        Number(
          response
            ?.luckyNumber
        );


      if (
        response?.ok ===
          true
        &&
        Number.isInteger(
          number
        )
        &&
        number >=
          LUCKY_MIN
        &&
        number <=
          LUCKY_MAX
      ) {

        return number;
      }

    } catch (error) {

      console.warn(
        "Lucky GET failed:",
        error
      );
    }


    return null;
  }


  function saveLuckyFallback(
    number
  ) {

    if (
      !currentGuestSlug
    ) {

      return;
    }


    postToBackend(
      {
        action:
          "saveLucky",

        guest:
          currentGuestSlug,

        luckyNumber:
          number
      }
    )
      .catch(
        (error) => {

          console.warn(
            "Lucky fallback POST failed:",
            error
          );
        }
      );
  }


  function rollLuckyNumber() {

    if (
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
        "Đang tìm số may mắn...";
    }


    const serverPromise =
      requestGuestLuckyNumber();


    const start =
      performance.now();


    const duration =
      1850;


    let lastUpdate =
      0;


    function frame(now) {

      const progress =
        Math.min(
          (
            now
            -
            start
          )
          /
          duration,
          1
        );


      const interval =
        45
        +
        Math.pow(
          progress,
          3
        )
        *
        145;


      if (
        now
        -
        lastUpdate
        >=
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


      finish();
    }


    async function finish() {

      let finalNumber =
        await serverPromise;


      if (
        !Number.isInteger(
          finalNumber
        )
      ) {

        finalNumber =
          currentGuestSlug
            ?
            deterministicLuckyNumber(
              currentGuestSlug
            )
            :
            randomLuckyNumber();


        saveLuckyFallback(
          finalNumber
        );
      }


      lockLuckyNumber(
        finalNumber,
        true
      );


      fireLuckyFireworks();
    }


    requestAnimationFrame(
      frame
    );
  }


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
      rsvpGuestCount
    ) {

      rsvpGuestCount.textContent =
        String(
          rsvpCount
        );
    }
  }


  function updateAttendanceNoLabel() {

    if (
      !rsvpAttendanceNoText
    ) {

      return;
    }


    /*
      UI giữ hiệu ứng Kó.
      Sheet vẫn lưu Không.
    */

    rsvpAttendanceNoText.textContent =
      rsvpAttendanceNo
        ?.checked
        ?
        "Kó"
        :
        "Không";
  }


  function setSubmitText(
    text
  ) {

    const span =
      rsvpSubmit
        ?.querySelector(
          "span"
        );


    if (
      span
    ) {

      span.textContent =
        text;
    }
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
          rsvpAttendanceYes.checked
          &&
          rsvpCount <
            1
        ) {

          rsvpCount =
            1;


          updateCount();
        }
      }
    );


  rsvpForm
    ?.addEventListener(
      "submit",
      async (
        event
      ) => {

        event.preventDefault();


        const name =
          rsvpGuestName
            ?.value
            .trim();


        const message =
          rsvpMessage
            ?.value
            .trim()
          ||
          "";


        const attendance =
          rsvpAttendanceNo
            ?.checked
            ?
            "no"
            :
            "yes";


        if (
          !name
        ) {

          alert(
            "Bạn nhập tên khách mời giúp chúng mình nhé."
          );


          return;
        }


        if (
          !currentGuestSlug
        ) {

          alert(
            "Link thiệp chưa có mã khách mời."
          );


          return;
        }


        rsvpSubmit.disabled =
          true;


        setSubmitText(
          "ĐANG GỬI..."
        );


        try {

          await postToBackend(
            {
              action:
                "rsvp",

              guest:
                currentGuestSlug,

              name,

              attendance,

              guestCount:
                rsvpCount,

              message
            }
          );


          /*
            no-cors không đọc response được,
            nên GET lại guest để kiểm tra
            Apps Script thực sự đã ghi Sheet.
          */

          await sleep(
            700
          );


          let confirmed =
            false;


          try {

            const verify =
              await jsonpRequest(
                {
                  action:
                    "guest",

                  guest:
                    currentGuestSlug
                }
              );


            confirmed =
              verify?.ok ===
              true;

          } catch (_) {}


          if (
            !confirmed
          ) {

            throw new Error(
              "Không xác nhận được dữ liệu."
            );
          }


          setSubmitText(
            "ĐÃ GỬI XÁC NHẬN"
          );


        } catch (error) {

          console.error(
            error
          );


          setSubmitText(
            "GỬI XÁC NHẬN"
          );


          rsvpSubmit.disabled =
            false;


          alert(
            "Có lỗi khi gửi xác nhận. Bạn thử lại giúp chúng mình nhé."
          );
        }
      }
    );


  /* =======================================================
     LOAD GUEST DATA
  ======================================================= */

  async function loadGuestPersonalization() {

    if (
      !currentGuestSlug
    ) {

      return;
    }


    try {

      const response =
        await jsonpRequest(
          {
            action:
              "guest",

            guest:
              currentGuestSlug
          }
        );


      if (
        !response
        ||
        response.ok !==
          true
      ) {

        console.warn(
          "Không tìm thấy khách:",
          currentGuestSlug,
          response
        );


        return;
      }


      currentGuestData =
        response;


      /* ===============================================
         F -> TÊN HIỂN THỊ TRÊN THIỆP
      =============================================== */

      const displayName =
        normalizeText(
          response.displayName
          ||
          response.name
          ||
          ""
        );


      if (
        displayName
        &&
        personalizedGuestName
      ) {

        personalizedGuestName.textContent =
          displayName;


        personalizedGuestName.hidden =
          false;
      }


      if (
        displayName
      ) {

        document.title =
          displayName
          +
          " | Bách & Thư";
      }


      /* ===============================================
         D / J -> TÊN RSVP
      =============================================== */

      if (
        rsvpGuestName
      ) {

        if (
          response.rsvpName
        ) {

          rsvpGuestName.value =
            normalizeText(
              response.rsvpName
            );

        } else if (
          response.name
        ) {

          rsvpGuestName.value =
            normalizeText(
              response.name
            );
        }
      }


      /* ===============================================
         I -> LUCKY NUMBER
      =============================================== */

      const existingLucky =
        Number(
          response.luckyNumber
        );


      if (
        Number.isInteger(
          existingLucky
        )
        &&
        existingLucky >=
          LUCKY_MIN
        &&
        existingLucky <=
          LUCKY_MAX
      ) {

        lockLuckyNumber(
          existingLucky,
          false
        );
      }


      /* ===============================================
         EXISTING RSVP
      =============================================== */

      if (
        response.attendance ===
        "Không"
      ) {

        rsvpAttendanceNo.checked =
          true;


        rsvpAttendanceYes.checked =
          false;

      } else {

        rsvpAttendanceYes.checked =
          true;


        rsvpAttendanceNo.checked =
          false;
      }


      const savedCount =
        Number(
          response.guestCount
        );


      if (
        Number.isInteger(
          savedCount
        )
        &&
        savedCount >=
          0
        &&
        savedCount <=
          10
      ) {

        rsvpCount =
          savedCount;


        updateCount();
      }


      if (
        response.message
        &&
        rsvpMessage
      ) {

        rsvpMessage.value =
          normalizeText(
            response.message
          );
      }


      updateAttendanceNoLabel();


    } catch (error) {

      console.warn(
        "Guest load failed:",
        error
      );
    }
  }


  /* =======================================================
     INITIAL LUCKY STATE
  ======================================================= */

  const locallySavedLucky =
    readLocalLuckyNumber();


  if (
    locallySavedLucky
  ) {

    lockLuckyNumber(
      locallySavedLucky,
      false
    );

  } else {

    startLuckyIdleShuffle();
  }


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
        !luckyLocked
        &&
        !luckyRolling
      ) {

        startLuckyIdleShuffle();
      }
    }
  );


  /* =======================================================
     INITIAL RSVP
  ======================================================= */

  updateCount();

  updateAttendanceNoLabel();


  /* =======================================================
     INIT BACKEND
  ======================================================= */

  markInvitationOpened();

  loadGuestPersonalization();

})();
