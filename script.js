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


let envelopeIsOpen = false;
let envelopeIsPreparing = false;
let page02IsOpen = false;

let openingAssetsPromise = null;


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
        { once: true }
      );

      image.addEventListener(
        "error",
        resolve,
        { once: true }
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
   LOAD AFTER FIRST SCREEN
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
   START LOADING ON TOUCH
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
      page02IsOpen
    ) {
      return;
    }


    event.preventDefault();

    event.stopPropagation();


    openPage02();

  }
);
