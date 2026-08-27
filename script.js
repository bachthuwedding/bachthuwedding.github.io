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


let envelopeIsOpen = false;
let envelopeIsPreparing = false;

let page02IsOpen = false;
let page02IsPreparing = false;

let openingAssetsPromise = null;
let page02AssetsPromise = null;

let page02AssetsScheduled = false;


/* =========================================
   LOAD ONE IMAGE
========================================= */

function loadDeferredImage(image) {

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
    typeof image.decode === "function"
  ) {

    return image
      .decode()
      .catch(() => {});

  }


  return new Promise(
    (resolve) => {

      if (image.complete) {
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
   LOAD OPEN ASSETS
========================================= */

function loadOpeningAssets() {

  if (openingAssetsPromise) {
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
   LOAD PAGE 02 ASSETS
========================================= */

function loadPage02Assets() {

  if (page02AssetsPromise) {
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

          /*
            Sau khi hoa source đã load,
            mới bật background crop.
          */
          page02.classList.add(
            "is-assets-ready"
          );

        }
      );


  return page02AssetsPromise;

}


/* =========================================
   LOAD OPEN ASSETS AFTER FIRST SCREEN
========================================= */

function scheduleOpeningAssets() {

  const startLoading =
    () => {

      loadOpeningAssets();

    };


  if (
    "requestIdleCallback" in window
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
   PAGE 02 DEFERRED LOAD
========================================= */

function schedulePage02Assets() {

  if (
    page02AssetsScheduled ||
    page02AssetsPromise
  ) {
    return;
  }


  page02AssetsScheduled =
    true;


  const startLoading =
    () => {

      loadPage02Assets();

    };


  if (
    "requestIdleCallback" in window
  ) {

    window.requestIdleCallback(
      startLoading,
      {
        timeout: 1100
      }
    );

  } else {

    window.setTimeout(
      startLoading,
      380
    );

  }

}


/* =========================================
   START OPENING LOAD ON TOUCH
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
   PAGE 02 LOAD ON CARD TOUCH
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


  if (page02IsOpen) {

    envelopeIsPreparing =
      false;

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
    Page 02 chỉ preload
    sau khi phong bì đã mở.
  */
  schedulePage02Assets();

}


/* =========================================
   OPEN PAGE 02
========================================= */

async function openPage02() {

  if (
    !envelopeIsOpen ||
    page02IsOpen ||
    page02IsPreparing
  ) {
    return;
  }


  page02IsPreparing =
    true;


  envelopeButton.setAttribute(
    "aria-busy",
    "true"
  );


  /*
    Bao gồm cả shared-frame.png.

    Transition chỉ bắt đầu sau khi
    frame + illustration decode xong.
  */
  await loadPage02Assets();


  if (
    !envelopeIsOpen ||
    page02IsOpen
  ) {

    page02IsPreparing =
      false;


    envelopeButton.removeAttribute(
      "aria-busy"
    );


    return;

  }


  page02IsPreparing =
    false;

  page02IsOpen =
    true;


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


  envelopeButton.removeAttribute(
    "aria-busy"
  );

}


/* =========================================
   ENVELOPE CLICK
========================================= */

envelopeButton.addEventListener(
  "click",
  (event) => {

    if (!envelopeIsOpen) {

      event.preventDefault();


      openEnvelope();


      return;

    }


    event.preventDefault();

  }
);


/* =========================================
   PAPER CLICK -> PAGE 02
========================================= */

invitationCard.addEventListener(
  "click",
  (event) => {

    if (
      !envelopeIsOpen ||
      page02IsOpen ||
      page02IsPreparing
    ) {
      return;
    }


    event.preventDefault();

    event.stopPropagation();


    openPage02();

  }
);
