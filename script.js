/* =========================================
   MASTER ARTBOARD

   Toàn bộ website được thiết kế cố định
   tại 390 × 844.

   Chỉ parent .site-scale được scale.
========================================= */

const DESIGN_WIDTH =
  390;

const DESIGN_HEIGHT =
  844;


/*
  Không cho website quá lớn trên desktop.
*/

const MAX_DESKTOP_SCALE =
  1.12;


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


/* =========================================
   SCALE SYSTEM
========================================= */

let lastViewportWidth =
  0;

let lastViewportHeight =
  0;


/*
  Logic:

  MOBILE:
  - fit toàn bộ 390 × 844 vào viewport
  - giữ đúng tỷ lệ
  - không stretch

  DESKTOP:
  - cũng giữ đúng tỷ lệ
  - giới hạn max scale
*/


function updateDesignScale(
  force = false
) {

  const viewportWidth =
    window.innerWidth;

  const viewportHeight =
    window.innerHeight;


  const isDesktop =
    viewportWidth >= 700;


  /*
    Safari / Chrome mobile thường fire resize
    chỉ vì thanh browser ẩn / hiện.

    Nếu WIDTH không đổi thì bỏ qua,
    tránh website tự zoom trong lúc scroll.
  */

  if (
    !force &&
    !isDesktop &&
    Math.abs(
      viewportWidth -
      lastViewportWidth
    ) < 2
  ) {

    return;

  }


  if (
    !force &&
    isDesktop &&
    Math.abs(
      viewportWidth -
      lastViewportWidth
    ) < 2 &&
    Math.abs(
      viewportHeight -
      lastViewportHeight
    ) < 2
  ) {

    return;

  }


  /*
    Desktop chừa một chút khoảng trống
    quanh thiệp.
  */

  const desktopGap =
    isDesktop
      ? 24
      : 0;


  const availableWidth =
    Math.max(
      1,
      viewportWidth -
      desktopGap
    );


  const availableHeight =
    Math.max(
      1,
      viewportHeight -
      desktopGap
    );


  const scaleByWidth =
    availableWidth /
    DESIGN_WIDTH;


  const scaleByHeight =
    availableHeight /
    DESIGN_HEIGHT;


  let scale =
    Math.min(
      scaleByWidth,
      scaleByHeight
    );


  if (isDesktop) {

    scale =
      Math.min(
        scale,
        MAX_DESKTOP_SCALE
      );

  }


  /*
    Tránh scale vô lý nếu browser
    báo viewport sai trong khoảnh khắc đầu.
  */

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


  lastViewportHeight =
    viewportHeight;


  siteShell.classList.add(
    "is-scale-ready"
  );

}


/*
  Tính scale ngay khi JS chạy.
*/

updateDesignScale(true);


/*
  Resize desktop /
  xoay ngang dọc điện thoại.
*/

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
   PAGE 01 OPEN ASSETS
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
   PAGE 01 DEFERRED LOAD
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
   PAGE 02 DEFERRED LOAD
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
   EARLY LOAD ON PAGE 01 TOUCH
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
   EARLY PAGE 02 LOAD
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


  /*
    Page 02 vẫn KHÔNG preload từ đầu.

    Chỉ sau khi phong bì mở
    mới bắt đầu tải ngầm.
  */

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
