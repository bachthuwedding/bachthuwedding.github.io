(() => {
  "use strict";

  /* =======================================================
     CONFIG
  ======================================================= */

  const DESIGN_WIDTH = 390;
  const DESIGN_HEIGHT = 680;


  /* =======================================================
     DOM
  ======================================================= */

  const root =
    document.documentElement;

  const siteShell =
    document.getElementById("siteShell");

  const openingCardButton =
    document.getElementById("openingCardButton");

  const pageScroller =
    document.getElementById("page02");


  /*
    Page 05 đã bỏ.

    Thứ tự hiện tại:
    02 → 03 → 04 → 06 → 07 → 08
  */

  const pages = [

    document.getElementById("page02Layout"),

    document.getElementById("page03"),

    document.getElementById("page04"),

    document.getElementById("page06"),

    document.getElementById("page07"),

    document.getElementById("page08"),

  ].filter(Boolean);


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
        viewportWidth / DESIGN_WIDTH,
        viewportHeight / DESIGN_HEIGHT
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


    siteShell?.classList.add(
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
      passive: true,
    }
  );


  window.addEventListener(
    "orientationchange",
    scheduleScale,
    {
      passive: true,
    }
  );


  window.visualViewport
    ?.addEventListener(
      "resize",
      scheduleScale,
      {
        passive: true,
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
            timeout,
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
     PRELOAD URL
     Dùng cho sprite confetti Page 02
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


          const finish = () => {

            if (
              typeof image.decode
              === "function"
            ) {

              image
                .decode()
                .catch(() => {})
                .finally(resolve);

            } else {

              resolve();
            }
          };


          image.addEventListener(
            "load",
            finish,
            {
              once: true,
            }
          );


          image.addEventListener(
            "error",
            resolve,
            {
              once: true,
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
     DATA-SRC LOADER
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


          const finish = () => {

            if (
              typeof image.decode
              === "function"
            ) {

              image
                .decode()
                .catch(() => {})
                .finally(resolve);

            } else {

              resolve();
            }
          };


          image.addEventListener(
            "load",
            finish,
            {
              once: true,
            }
          );


          image.addEventListener(
            "error",
            resolve,
            {
              once: true,
            }
          );


          /*
            Gắn src chỉ khi page
            thực sự cần load.
          */

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


        /*
          Page 02:
          confetti dùng sprite CSS.

          Không tải sprite này
          ngay lúc mở website.
        */

        const spriteHost =
          page.querySelector(
            "[data-sprite-src]"
          );


        if (spriteHost) {

          const spriteUrl =
            spriteHost
              .dataset
              .spriteSrc;


          jobs.push(

            preloadUrl(
              spriteUrl,
              priority
            )
              .then(() => {

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
              })
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
     ACTIVE / NEARBY PAGE
  ======================================================= */

  function setNearbyPages(
    index
  ) {

    if (!pages.length) {
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


    /*
      Chỉ page hiện tại
      và page sát bên
      được chạy animation.
    */

    pages.forEach(
      (page, pageIndex) => {

        page.classList.toggle(
          "is-nearby",
          Math.abs(
            pageIndex - safeIndex
          ) <= 1
        );
      }
    );


    /*
      Page đang xem:
      high priority
    */

    loadPage(
      pages[safeIndex],
      "high"
    );


    /*
      Chỉ preload đúng
      1 page kế tiếp.
    */

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

    if (!pageScroller) {
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

    if (scrollRaf) {
      return;
    }


    scrollRaf =
      requestAnimationFrame(
        () => {

          scrollRaf = 0;


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
        passive: true,
      }
    );


  /* =======================================================
     ENTER INVITATION
     PAGE 01 → PAGE 02 DIRECTLY
  ======================================================= */

  function enterInvitation() {

    if (pageMode) {
      return;
    }


    pageMode = true;


    /*
      Không đợi animation mở nắp.
      Không đợi ảnh load xong.
      Chuyển Page 02 ngay.
    */

    loadPage(
      pages[0],
      "high"
    );


    if (pageScroller) {

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


    /*
      Sau khi đã vào Page 02,
      warm Page 03.
    */

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
      700
    );
  }


  /* =======================================================
     PAGE 01 INTERACTION
  ======================================================= */

  openingCardButton
    ?.addEventListener(
      "pointerdown",
      () => {

        /*
          User vừa chạm thiệp:
          bắt đầu tải Page 02
          ngay trước click.
        */

        loadPage(
          pages[0],
          "high"
        );
      },
      {
        passive: true,
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


  /* =======================================================
     INITIAL WARM-UP
  ======================================================= */

  /*
    First paint:
    chỉ Page 01 bg + envelope.

    Sau first paint:
    browser rảnh thì bắt đầu warm Page 02.
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
     TAB VISIBILITY
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
    }
  );

})();
