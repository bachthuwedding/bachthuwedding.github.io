/* =========================================================
   MASTER ARTBOARD
========================================================= */

const DESIGN_WIDTH =
  390;

const DESIGN_HEIGHT =
  680;


/* =========================================================
   DOM
========================================================= */

const siteShell =
  document.getElementById(
    "siteShell"
  );

const openingPage =
  document.getElementById(
    "opening"
  );

const envelopeButton =
  document.getElementById(
    "envelopeButton"
  );

const invitationCard =
  document.getElementById(
    "invitationCard"
  );

const page02 =
  document.getElementById(
    "page02"
  );

const page03 =
  document.getElementById(
    "page03"
  );

const page04 =
  document.getElementById(
    "page04"
  );


/* =========================================================
   ASSET GROUPS
========================================================= */

const deferredOpeningAssets =
  Array.from(
    document.querySelectorAll(
      ".deferred-opening-asset[data-src]"
    )
  );


const deferredPage02Assets =
  Array.from(
    document.querySelectorAll(
      ".deferred-page02-asset[data-src]"
    )
  );


const deferredPage03Assets =
  Array.from(
    document.querySelectorAll(
      ".deferred-page03-asset[data-src]"
    )
  );


const deferredPage04Assets =
  Array.from(
    document.querySelectorAll(
      ".deferred-page04-asset[data-src]"
    )
  );


/* =========================================================
   STATE
========================================================= */

let envelopeIsOpen =
  false;

let envelopeIsPreparing =
  false;

let page02IsOpen =
  false;


let openingAssetsPromise =
  null;

let page02AssetsPromise =
  null;

let page03AssetsPromise =
  null;

let page04AssetsPromise =
  null;


let scaleFrame =
  null;


/* =========================================================
   VIEWPORT
========================================================= */

function getViewportSize() {

  if (
    window.visualViewport
  ) {

    return {
      width:
        window.visualViewport.width,

      height:
        window.visualViewport.height
    };

  }


  return {
    width:
      window.innerWidth,

    height:
      window.innerHeight
  };

}


/* =========================================================
   GLOBAL SCALE

   Toàn website chỉ scale một lần.
========================================================= */

function updateDesignScale() {

  const {
    width: viewportWidth,
    height: viewportHeight
  } =
    getViewportSize();


  const scaleByWidth =
    viewportWidth /
    DESIGN_WIDTH;


  const scaleByHeight =
    viewportHeight /
    DESIGN_HEIGHT;


  let scale =
    Math.min(
      scaleByWidth,
      scaleByHeight
    );


  scale =
    Math.max(
      .25,
      scale
    );


  const renderWidth =
    DESIGN_WIDTH *
    scale;


  const renderHeight =
    DESIGN_HEIGHT *
    scale;


  document.documentElement
    .style
    .setProperty(
      "--design-scale",
      scale.toFixed(6)
    );


  document.documentElement
    .style
    .setProperty(
      "--render-width",
      `${renderWidth}px`
    );


  document.documentElement
    .style
    .setProperty(
      "--render-height",
      `${renderHeight}px`
    );


  siteShell.classList.add(
    "is-scale-ready"
  );

}


/* =========================================================
   SCALE RAF
========================================================= */

function requestScaleUpdate() {

  if (
    scaleFrame !== null
  ) {
    return;
  }


  scaleFrame =
    window.requestAnimationFrame(
      () => {

        scaleFrame =
          null;


        updateDesignScale();

      }
    );

}


/* INITIAL */

updateDesignScale();


window.addEventListener(
  "resize",
  requestScaleUpdate,
  {
    passive: true
  }
);


if (
  window.visualViewport
) {

  window.visualViewport
    .addEventListener(
      "resize",
      requestScaleUpdate,
      {
        passive: true
      }
    );

}


window.addEventListener(
  "orientationchange",
  () => {

    window.setTimeout(
      requestScaleUpdate,
      150
    );

  }
);


/* =========================================================
   LOAD ONE DEFERRED IMAGE
========================================================= */

function loadDeferredImage(
  image
) {

  const source =
    image.dataset.src;


  if (!source) {
    return Promise.resolve();
  }


  image.src =
    source;


  image.removeAttribute(
    "data-src"
  );


  if (
    typeof image.decode ===
    "function"
  ) {

    return image
      .decode()
      .catch(
        () => {}
      );

  }


  return new Promise(
    (resolve) => {

      if (
        image.complete
      ) {

        resolve();

        return;

      }


      image.addEventListener(
        "load",
        resolve,
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

    }
  );

}


/* =========================================================
   PAGE 01 ASSETS
========================================================= */

function loadOpeningAssets() {

  if (
    openingAssetsPromise
  ) {

    return openingAssetsPromise;

  }


  openingAssetsPromise =
    Promise.all(
      deferredOpeningAssets.map(
        loadDeferredImage
      )
    );


  return openingAssetsPromise;

}


/* =========================================================
   PAGE 02 ASSETS
========================================================= */

function loadPage02Assets() {

  if (
    page02AssetsPromise
  ) {

    return page02AssetsPromise;

  }


  page02AssetsPromise =
    Promise.all(
      deferredPage02Assets.map(
        loadDeferredImage
      )
    )
      .then(
        () => {

          page02.classList.add(
            "is-assets-ready"
          );

        }
      );


  return page02AssetsPromise;

}


/* =========================================================
   PAGE 03 ASSETS
========================================================= */

function loadPage03Assets() {

  if (
    page03AssetsPromise
  ) {

    return page03AssetsPromise;

  }


  page03AssetsPromise =
    Promise.all(
      deferredPage03Assets.map(
        loadDeferredImage
      )
    )
      .then(
        () => {

          page03.classList.add(
            "is-assets-ready"
          );

        }
      );


  return page03AssetsPromise;

}


/* =========================================================
   PAGE 04 ASSETS
========================================================= */

function loadPage04Assets() {

  if (
    page04AssetsPromise
  ) {

    return page04AssetsPromise;

  }


  page04AssetsPromise =
    Promise.all(
      deferredPage04Assets.map(
        loadDeferredImage
      )
    )
      .then(
        () => {

          page04.classList.add(
            "is-assets-ready"
          );

        }
      );


  return page04AssetsPromise;

}


/* =========================================================
   PAGE 01 SCHEDULE
========================================================= */

function scheduleOpeningAssets() {

  const startLoading =
    () => {

      loadOpeningAssets();

    };


  if (
    "requestIdleCallback"
    in window
  ) {

    window.requestIdleCallback(
      startLoading,
      {
        timeout: 1400
      }
    );

  } else {

    window.setTimeout(
      startLoading,
      500
    );

  }

}


window.addEventListener(
  "load",
  scheduleOpeningAssets,
  {
    once: true
  }
);


/* =========================================================
   PAGE 02 SCHEDULE
========================================================= */

function schedulePage02Assets() {

  const startLoading =
    () => {

      loadPage02Assets();

    };


  if (
    "requestIdleCallback"
    in window
  ) {

    window.requestIdleCallback(
      startLoading,
      {
        timeout: 1200
      }
    );

  } else {

    window.setTimeout(
      startLoading,
      280
    );

  }

}


/* =========================================================
   PAGE 03 SCHEDULE
========================================================= */

function schedulePage03Assets() {

  const startLoading =
    () => {

      loadPage03Assets();

    };


  if (
    "requestIdleCallback"
    in window
  ) {

    window.requestIdleCallback(
      startLoading,
      {
        timeout: 1800
      }
    );

  } else {

    window.setTimeout(
      startLoading,
      700
    );

  }

}


/* =========================================================
   PAGE 04 SCHEDULE

   Chỉ tải sau Page 03.
========================================================= */

function schedulePage04Assets() {

  const startLoading =
    () => {

      loadPage04Assets();

    };


  if (
    "requestIdleCallback"
    in window
  ) {

    window.requestIdleCallback(
      startLoading,
      {
        timeout: 1800
      }
    );

  } else {

    window.setTimeout(
      startLoading,
      700
    );

  }

}


/* =========================================================
   EARLY PAGE 01 LOAD
========================================================= */

envelopeButton.addEventListener(
  "pointerdown",
  () => {

    if (
      !envelopeIsOpen &&
      !envelopeIsPreparing &&
      !page02IsOpen
    ) {

      loadOpeningAssets();

    }

  },
  {
    passive: true
  }
);


/* =========================================================
   EARLY PAGE 02 LOAD
========================================================= */

invitationCard.addEventListener(
  "pointerdown",
  () => {

    if (
      envelopeIsOpen &&
      !page02IsOpen
    ) {

      loadPage02Assets();

    }

  },
  {
    passive: true
  }
);


/* =========================================================
   OPEN ENVELOPE
========================================================= */

async function openEnvelope() {

  if (
    envelopeIsOpen ||
    envelopeIsPreparing ||
    page02IsOpen
  ) {

    return;

  }


  envelopeIsPreparing =
    true;


  envelopeButton.setAttribute(
    "aria-busy",
    "true"
  );


  await loadOpeningAssets();


  if (
    page02IsOpen
  ) {

    envelopeIsPreparing =
      false;


    envelopeButton.removeAttribute(
      "aria-busy"
    );


    return;

  }


  envelopeIsPreparing =
    false;

  envelopeIsOpen =
    true;


  envelopeButton.removeAttribute(
    "aria-busy"
  );


  envelopeButton.classList.add(
    "is-open"
  );


  envelopeButton.setAttribute(
    "aria-expanded",
    "true"
  );


  envelopeButton.setAttribute(
    "aria-label",
    "Chạm vào tờ thiệp để tiếp tục"
  );


  /*
    Sau khi phong bì mở
    mới bắt đầu preload Page 02.
  */

  schedulePage02Assets();

}


/* =========================================================
   OPEN PAGE 02
========================================================= */

function openPage02() {

  if (
    !envelopeIsOpen ||
    page02IsOpen
  ) {

    return;

  }


  page02IsOpen =
    true;


  loadPage02Assets();


  page02.scrollTop =
    0;


  siteShell.classList.add(
    "is-page-02"
  );


  page02.setAttribute(
    "aria-hidden",
    "false"
  );


  openingPage.setAttribute(
    "aria-hidden",
    "true"
  );


  envelopeButton.setAttribute(
    "tabindex",
    "-1"
  );


  /*
    Khi Page 02 đã mở,
    preload Page 03 ở idle.
  */

  schedulePage03Assets();

}


/* =========================================================
   ENVELOPE CLICK
========================================================= */

envelopeButton.addEventListener(
  "click",
  (event) => {

    if (
      !envelopeIsOpen
    ) {

      event.preventDefault();


      openEnvelope();


      return;

    }


    event.preventDefault();

  }
);


/* =========================================================
   CARD CLICK -> PAGE 02
========================================================= */

invitationCard.addEventListener(
  "click",
  (event) => {

    if (
      !envelopeIsOpen ||
      page02IsOpen
    ) {

      return;

    }


    event.preventDefault();

    event.stopPropagation();


    openPage02();

  }
);


/* =========================================================
   INVITATION SCROLL PRELOAD

   0px        = Page 02
   680px      = Page 03
   1360px     = Page 04

   Load trước khi user nhìn thấy page tiếp theo.
========================================================= */

page02.addEventListener(
  "scroll",
  () => {

    const scrollY =
      page02.scrollTop;


    /*
      Khi xuống gần cuối Page 02,
      đảm bảo Page 03 đã load.
    */

    if (
      scrollY >=
      DESIGN_HEIGHT * .45
    ) {

      loadPage03Assets();

    }


    /*
      Khi đã đi vào Page 03,
      bắt đầu tải Page 04.

      Khoảng 1.15 artboard:
      user còn khá xa Page 04,
      nên ảnh map có thời gian decode.
    */

    if (
      scrollY >=
      DESIGN_HEIGHT * 1.15
    ) {

      loadPage04Assets();

    }

  },
  {
    passive: true
  }
);


/* =========================================================
   OPTIONAL:
   preload Page 04 ở idle sau khi Page 03 load xong.

   Không chạy từ first screen.
========================================================= */

if (
  page03
) {

  page03.addEventListener(
    "pointerdown",
    () => {

      if (
        page02IsOpen
      ) {

        schedulePage04Assets();

      }

    },
    {
      passive: true
    }
  );

}

/* =========================================================
   PAGE 05
   DEFERRED ASSETS
========================================================= */

const page05 =
  document.getElementById(
    "page05"
  );


const deferredPage05Assets =
  Array.from(
    document.querySelectorAll(
      ".deferred-page05-asset[data-src]"
    )
  );


let page05AssetsPromise =
  null;


/* =========================================================
   LOAD PAGE 05 ASSETS
========================================================= */

function loadPage05Assets() {

  if (
    page05AssetsPromise
  ) {

    return page05AssetsPromise;

  }


  page05AssetsPromise =
    Promise.all(
      deferredPage05Assets.map(
        loadDeferredImage
      )
    )
      .then(
        () => {

          if (
            page05
          ) {

            page05.classList.add(
              "is-assets-ready"
            );

          }

        }
      );


  return page05AssetsPromise;

}


/* =========================================================
   PAGE 05 PRELOAD

   PAGE POSITIONS:

   PAGE 02:
   0 → 680

   PAGE 03:
   680 → 1360

   PAGE 04:
   1360 → 2040

   PAGE 05:
   2040 → 2720

   Load Page 05 khi user mới bắt đầu đi vào Page 04.
========================================================= */

page02.addEventListener(
  "scroll",
  () => {

    const scrollY =
      page02.scrollTop;


    if (
      scrollY >=
      DESIGN_HEIGHT * 2.10
    ) {

      loadPage05Assets();

    }

  },
  {
    passive: true
  }
);


/* =========================================================
   EARLY LOAD ON PAGE 04 TOUCH
========================================================= */

if (
  page04
) {

  page04.addEventListener(
    "pointerdown",
    () => {

      loadPage05Assets();

    },
    {
      passive: true
    }
  );

}
