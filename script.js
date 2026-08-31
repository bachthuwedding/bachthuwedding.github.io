/* =========================================
   MASTER ARTBOARD
========================================= */

const DESIGN_WIDTH =
  390;

const DESIGN_HEIGHT =
  680;


/* =========================================
   DOM
========================================= */

const siteShell =
  document.getElementById("siteShell");

const openingPage =
  document.getElementById("opening");

const envelopeButton =
  document.getElementById("envelopeButton");

const invitationCard =
  document.getElementById("invitationCard");

const page02 =
  document.getElementById("page02");

const page03 =
  document.getElementById("page03");


/* =========================================
   ASSET GROUPS
========================================= */

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


/* =========================================
   STATE
========================================= */

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


let scaleFrame =
  null;


/* =========================================
   VIEWPORT
========================================= */

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


/* =========================================
   GLOBAL SCALE
========================================= */

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


/* =========================================
   REQUEST SCALE
========================================= */

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


/* =========================================
   INITIAL SCALE
========================================= */

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


/* =========================================
   LOAD ONE IMAGE
========================================= */

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


/* =========================================
   PAGE 01 ASSETS
========================================= */

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


/* =========================================
   PAGE 02 ASSETS
========================================= */

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


/* =========================================
   PAGE 03 ASSETS
========================================= */

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


/* =========================================
   PAGE 01 IDLE LOAD
========================================= */

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


/* =========================================
   PAGE 02 PRELOAD
========================================= */

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


/* =========================================
   PAGE 03 PRELOAD

   Page 03 chỉ tải khi Page 02 đã xuất hiện.
========================================= */

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


/* =========================================
   PAGE 01 POINTER PRELOAD
========================================= */

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


/* =========================================
   PAGE 02 POINTER PRELOAD
========================================= */

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


/* =========================================
   OPEN ENVELOPE
========================================= */

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


  schedulePage02Assets();

}


/* =========================================
   OPEN PAGE 02
========================================= */

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
    Sau khi Page 02 hiện ra,
    bắt đầu preload ngầm Page 03.
  */

  schedulePage03Assets();

}


/* =========================================
   ENVELOPE CLICK
========================================= */

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


/* =========================================
   CARD CLICK -> PAGE 02
========================================= */

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


/* =========================================
   PAGE 02 SCROLL -> PAGE 03

   Nếu người dùng scroll nhanh,
   đảm bảo Page 03 được load ngay.
========================================= */

page02.addEventListener(
  "scroll",
  () => {

    const preloadPoint =
      DESIGN_HEIGHT *
      .45;


    if (
      page02.scrollTop >=
      preloadPoint
    ) {

      loadPage03Assets();

    }

  },
  {
    passive: true
  }
);
