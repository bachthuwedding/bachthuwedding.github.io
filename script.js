/* =========================================
   MASTER ARTBOARD
========================================= */

const DESIGN_WIDTH =
  390;

const DESIGN_HEIGHT =
  760;


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


/* =========================================
   ASSETS
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


let lastViewportWidth =
  0;


/* =========================================
   GET REAL VISIBLE VIEWPORT
========================================= */

function getViewportSize() {

  const visualViewport =
    window.visualViewport;


  if (visualViewport) {

    return {
      width:
        visualViewport.width,

      height:
        visualViewport.height
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

   Luôn CONTAIN.

   Không crop.
   Không méo.
   Không scale từng element.
========================================= */

function updateDesignScale(
  force = false
) {

  const viewport =
    getViewportSize();


  const viewportWidth =
    viewport.width;


  const viewportHeight =
    viewport.height;


  /*
    Trên mobile browser toolbar có thể
    thay đổi height liên tục.

    Nếu width không đổi và đây không phải
    lần force, không cho website zoom nhảy.
  */

  const touchDevice =
    window.matchMedia(
      "(pointer: coarse)"
    ).matches;


  if (
    !force &&
    touchDevice &&
    Math.abs(
      viewportWidth -
      lastViewportWidth
    ) < 2
  ) {

    return;

  }


  const scaleByWidth =
    viewportWidth /
    DESIGN_WIDTH;


  const scaleByHeight =
    viewportHeight /
    DESIGN_HEIGHT;


  /*
    CONTAIN:
    luôn giữ toàn bộ artboard trong viewport.
  */

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


  lastViewportWidth =
    viewportWidth;


  siteShell.classList.add(
    "is-scale-ready"
  );

}


/* =========================================
   INITIAL SCALE
========================================= */

updateDesignScale(true);


/* =========================================
   RESIZE
========================================= */

window.addEventListener(
  "resize",
  () => {

    updateDesignScale();

  },
  {
    passive: true
  }
);


/* =========================================
   ORIENTATION
========================================= */

window.addEventListener(
  "orientationchange",
  () => {

    window.setTimeout(
      () => {

        updateDesignScale(true);

      },
      180
    );

  }
);


/* =========================================
   VISUAL VIEWPORT

   iOS Safari / Chrome.
========================================= */

if (
  window.visualViewport
) {

  window.visualViewport
    .addEventListener(
      "resize",
      () => {

        updateDesignScale();

      },
      {
        passive: true
      }
    );

}


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
   PAGE 02 IDLE LOAD
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
   PRELOAD OPENING ON TOUCH
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
   PRELOAD PAGE 02
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


  envelopeIsPreparing =
    false;


  if (
    page02IsOpen
  ) {

    envelopeButton.removeAttribute(
      "aria-busy"
    );

    return;

  }


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
   CARD CLICK
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
