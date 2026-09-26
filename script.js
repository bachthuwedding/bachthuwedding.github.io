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
     GUEST PARAM
  ======================================================= */

  const urlParams =
    new URLSearchParams(
      window.location.search
    );


  const currentGuestSlug =
    normalizeGuestSlug(
      urlParams.get("guest") || ""
    );


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


  function normalizeText(value) {

    return String(
      value ?? ""
    )
      .normalize(
        "NFC"
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


  let personalizedGuestName =
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


  let pageMode = false;

  let resizeRaf = 0;

  let scrollRaf = 0;

  let activePageIndex = -1;

  let luckyIdleTimer = null;

  let luckyRolling = false;

  let luckyLocked = false;

  let rsvpCount = 1;

  let page06EntryTimer = null;

  let submitResetTimer = null;

  let currentGuestData = null;

  let guestDataLoaded = false;

  let guestLoadPromise = null;


  /* =======================================================
     JSONP
  ======================================================= */

  function jsonpRequest(
    params = {},
    timeout = 15000
  ) {

    return new Promise(
      (
        resolve,
        reject
      ) => {

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


        function cleanup() {

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
        }


        window[
          callbackName
        ] =
          (response) => {

            cleanup();


            resolve(
              response
            );
          };


        script.onerror =
          () => {

            cleanup();


            reject(
              new Error(
                "Không kết nối được Google Apps Script."
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
                  "Google Apps Script phản hồi quá lâu."
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

  async function postToBackend(data) {

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

        cache:
          "no-store",

        redirect:
          "follow",

        credentials:
          "omit",

        body
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
     OUTSIDE SCROLL
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
     PRELOAD
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
     PAGE 02 GUEST DISPLAY

     CHỈ CỘT F.
  ======================================================= */

  function ensureGuestNameElement() {

    if (
      personalizedGuestName
    ) {

      return personalizedGuestName;
    }


    if (
      !page02Layout
    ) {

      return null;
    }


    const invite =
      page02Layout
        .querySelector(
          ".p02-invite"
        );


    if (
      !invite
    ) {

      return null;
    }


    personalizedGuestName =
      document.createElement(
        "p"
      );


    personalizedGuestName.id =
      "personalizedGuestName";


    personalizedGuestName.className =
      "p02-personalized-guest";


    invite.insertAdjacentElement(
      "afterend",
      personalizedGuestName
    );


    return personalizedGuestName;
  }


  function renderGuestDisplayName(
    value
  ) {

    const element =
      ensureGuestNameElement();


    if (
      !element
    ) {

      return;
    }


    const text =
      normalizeText(
        value
      )
        .trim();


    if (
      !text
    ) {

      element.textContent =
        "";


      element.hidden =
        true;


      return;
    }


    element.textContent =
      text;


    element.hidden =
      false;


    element.removeAttribute(
      "hidden"
    );


    element.style.display =
      "block";
  }


  /* =======================================================
     GET GUEST
  ======================================================= */

  async function requestGuestData() {

    if (
      !currentGuestSlug
    ) {

      return null;
    }


    const response =
      await jsonpRequest(
        {
          action:
            "guest",

          guest:
            currentGuestSlug
        },
        15000
      );


    if (
      !response
      ||
      response.ok !==
        true
    ) {

      throw new Error(
        response?.error
        ||
        "Không tìm thấy khách mời."
      );
    }


    return response;
  }


  /* =======================================================
     APPLY GUEST
  ======================================================= */

  function applyGuestData(
    response
  ) {

    if (
      !response
      ||
      response.ok !==
        true
    ) {

      return;
    }


    currentGuestData =
      response;


    guestDataLoaded =
      true;


    /*
      =====================================================
      PAGE 2

      response.displayName = CỘT F.
      KHÔNG FALLBACK.
      =====================================================
    */

    const displayNameFromColumnF =
      normalizeText(
        response.displayName
        ||
        ""
      )
        .trim();


    renderGuestDisplayName(
      displayNameFromColumnF
    );


    if (
      displayNameFromColumnF
    ) {

      document.title =
        `${displayNameFromColumnF} | Bách & Thư`;
    }


    /*
      RSVP NAME:
      ưu tiên dữ liệu J đã điền,
      sau đó mới tới tên gốc D.
    */

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


    /*
      Lucky number
    */

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


    /*
      RSVP state
    */

    if (
      response.attendance ===
      "Không"
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


    } else if (
      response.attendance ===
      "Có"
    ) {

      if (
        rsvpAttendanceYes
      ) {

        rsvpAttendanceYes.checked =
          true;
      }


      if (
        rsvpAttendanceNo
      ) {

        rsvpAttendanceNo.checked =
          false;
      }
    }


    if (
      response.guestCount !==
      ""
      &&
      response.guestCount !==
      null
      &&
      response.guestCount !==
      undefined
    ) {

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
      }
    }


    if (
      rsvpMessage
    ) {

      rsvpMessage.value =
        normalizeText(
          response.message
          ||
          ""
        );
    }


    updateCount();

    updateAttendanceNoLabel();


    if (
      response.attendance ===
      "Có"
      ||
      response.attendance ===
      "Không"
    ) {

      setSubmitText(
        "CẬP NHẬT XÁC NHẬN"
      );
    }
  }


  /* =======================================================
     LOAD GUEST
  ======================================================= */

  async function loadGuestPersonalization(
    force = false
  ) {

    if (
      !currentGuestSlug
    ) {

      return null;
    }


    if (
      guestDataLoaded
      &&
      !force
    ) {

      return currentGuestData;
    }


    if (
      guestLoadPromise
      &&
      !force
    ) {

      return guestLoadPromise;
    }


    guestLoadPromise =
      (async () => {

        const delays = [
          0,
          450,
          900,
          1600
        ];


        for (
          let i = 0;
          i < delays.length;
          i += 1
        ) {

          if (
            delays[i] >
            0
          ) {

            await sleep(
              delays[i]
            );
          }


          try {

            const response =
              await requestGuestData();


            applyGuestData(
              response
            );


            return response;


          } catch (error) {

            console.warn(
              `[Wedding] guest load attempt ${i + 1}`,
              error
            );
          }
        }


        return null;
      })();


    try {

      return await guestLoadPromise;


    } finally {

      guestLoadPromise =
        null;
    }
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
          page ===
          page06
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


      if (
        !guestDataLoaded
      ) {

        loadGuestPersonalization(
          true
        );
      }
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


    loadGuestPersonalization();


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
     LUCKY STORAGE
  ======================================================= */

  function getLuckyStorageKey() {

    return currentGuestSlug
      ?
      `bach-thu-lucky-${currentGuestSlug}`
      :
      "";
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
     LUCKY UI
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
      ?.getRandomValues
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
        array[0] %
        range
      );
    }


    return (
      LUCKY_MIN
      +
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
      &&
      luckyCard
    ) {

      luckyCard
        .classList
        .remove(
          "is-revealed"
        );


      void luckyCard.offsetWidth;


      luckyCard
        .classList
        .add(
          "is-revealed"
        );
    }


    if (
      luckyHint
    ) {

      luckyHint.textContent =
        LUCKY_HINT_REVEALED;
    }


    if (
      luckyTrigger
    ) {

      luckyTrigger.disabled =
        true;
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


    const response =
      await jsonpRequest(
        {
          action:
            "lucky",

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

      throw new Error(
        response?.error
        ||
        "Không lấy được số may mắn."
      );
    }


    return Number(
      response.luckyNumber
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


    if (
      !currentGuestSlug
    ) {

      alert(
        "Link thiệp chưa có mã khách mời."
      );

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


    const resultPromise =
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
            now - start
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
        now - lastUpdate >=
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


      finishLucky();
    }


    async function finishLucky() {

      try {

        const finalNumber =
          await resultPromise;


        lockLuckyNumber(
          finalNumber,
          true
        );


        fireLuckyFireworks();


      } catch (error) {

        luckyRolling =
          false;


        luckyCard
          ?.classList
          .remove(
            "is-rolling"
          );


        if (
          luckyHint
        ) {

          luckyHint.textContent =
            "Nhấn để thử lại";
        }


        startLuckyIdleShuffle();
      }
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

        if (
          rsvpAttendanceNo.checked
        ) {

          rsvpCount =
            0;


          updateCount();
        }


        updateAttendanceNoLabel();
      }
    );


  rsvpAttendanceYes
    ?.addEventListener(
      "change",
      () => {

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


        updateAttendanceNoLabel();
      }
    );


  /* =======================================================
     BACKGROUND REFRESH
  ======================================================= */

  async function backgroundRefreshGuestData() {

    await sleep(
      1200
    );


    try {

      const response =
        await requestGuestData();


      if (
        response?.ok
      ) {

        currentGuestData =
          response;
      }


    } catch (_) {

      /*
        Không báo lỗi cho khách.
      */
    }
  }


  /* =======================================================
     RSVP SUBMIT
  ======================================================= */

  rsvpForm
    ?.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();


        clearTimeout(
          submitResetTimer
        );


        const name =
          normalizeText(
            rsvpGuestName
              ?.value
              .trim()
            ||
            ""
          );


        const message =
          normalizeText(
            rsvpMessage
              ?.value
              .trim()
            ||
            ""
          );


        const isNo =
          Boolean(
            rsvpAttendanceNo
              ?.checked
          );


        const attendance =
          isNo
            ?
            "no"
            :
            "yes";


        const guestCount =
          isNo
            ?
            0
            :
            Math.max(
              1,
              rsvpCount
            );


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
            "Link thiệp này chưa có mã khách mời."
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

              guestCount,

              message
            }
          );


          rsvpCount =
            guestCount;


          updateCount();


          setSubmitText(
            "ĐÃ GỬI XÁC NHẬN"
          );


          rsvpSubmit.disabled =
            false;


          submitResetTimer =
            setTimeout(
              () => {

                if (
                  !rsvpSubmit.disabled
                ) {

                  setSubmitText(
                    "CẬP NHẬT XÁC NHẬN"
                  );
                }

              },
              1800
            );


          backgroundRefreshGuestData();


        } catch (error) {

          console.error(
            error
          );


          rsvpSubmit.disabled =
            false;


          setSubmitText(
            "GỬI XÁC NHẬN"
          );


          alert(
            "Không thể kết nối để gửi xác nhận. Bạn vui lòng thử lại."
          );
        }
      }
    );


  /* =======================================================
     MARK OPENED
  ======================================================= */

  async function markInvitationOpened() {

    if (
      !currentGuestSlug
    ) {

      return;
    }


    try {

      await jsonpRequest(
        {
          action:
            "markOpened",

          guest:
            currentGuestSlug
        }
      );


    } catch (_) {}
  }


  /* =======================================================
     INIT
  ======================================================= */

  updateCount();

  updateAttendanceNoLabel();


  const localLucky =
    readLocalLuckyNumber();


  if (
    localLucky
  ) {

    lockLuckyNumber(
      localLucky,
      false
    );


  } else {

    startLuckyIdleShuffle();
  }


  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.hidden
      ) {

        stopLuckyIdleShuffle();

        return;
      }


      if (
        !luckyLocked
        &&
        !luckyRolling
      ) {

        startLuckyIdleShuffle();
      }
    }
  );


  markInvitationOpened();

  loadGuestPersonalization();

})();
