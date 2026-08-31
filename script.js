/* =========================================
   MASTER ARTBOARD

   Toàn bộ website được thiết kế cố định
   tại 390 × 844.

   Không scale từng element.
   Chỉ scale toàn bộ .site-scale một lần.
========================================= */

const DESIGN_WIDTH =
  390;

const DESIGN_HEIGHT =
  844;


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
   DEFERRED ASSETS
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


/* =========================================
   SCALE STATE
========================================= */

let lastViewportWidth =
  0;

let lastViewportHeight =
  0;


/* =========================================
   SCALE SYSTEM

   PHONE PORTRAIT
   -> FIT WIDTH

   TABLET / DESKTOP
   -> FIT HEIGHT

   LANDSCAPE PHONE
   -> CONTAIN

   Như vậy:
   - iPhone luôn kín chiều ngang
   - iPad / desktop kín chiều cao
   - không méo
   - tất cả element giữ nguyên vị trí
========================================= */

function updateDesignScale(
  force = false
) {

  /*
    window.innerWidth rất ổn cho việc
    xác định chiều rộng layout trên mobile.

    Không dùng visualViewport.height để
    scale mobile vì browser toolbar sẽ làm
    thiệp co lại theo chiều cao.
  */

  const viewportWidth =
    window.innerWidth;

  const viewportHeight =
    window.innerHeight;


  /* =====================================
     DEVICE / ORIENTATION
  ===================================== */

  const isPortrait =
    viewportHeight >=
    viewportWidth;


  /*
    Dùng CSS viewport width thay vì
    user-agent detection.

    <= 600px portrait:
    coi là phone.
  */

  const isPhonePortrait =
    isPortrait &&
    viewportWidth <= 600;


  /*
    Tablet / desktop portrait hoặc landscape.
  */

  const isLargeScreen =
    !isPhonePortrait;


  /* =====================================
     IGNORE MOBILE TOOLBAR RESIZE

     Safari / Chrome mobile thường fire
     resize khi thanh địa chỉ ẩn / hiện.

     Nếu width không thay đổi,
     KHÔNG scale lại.

     Nhờ vậy website không bị zoom
     lên xuống khi người dùng scroll.
  ===================================== */

  if (
    !force &&
    isPhonePortrait &&
    Math.abs(
      viewportWidth -
      lastViewportWidth
    ) < 2
  ) {

    return;

  }


  /*
    Tablet / desktop:
    resize thật sự thì tính lại.
  */

  if (
    !force &&
    isLargeScreen &&
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


  /* =====================================
     SCALE VALUES
  ===================================== */

  const scaleByWidth =
    viewportWidth /
    DESIGN_WIDTH;


  const scaleByHeight =
    viewportHeight /
    DESIGN_HEIGHT;


  let scale;


  /* =====================================
     PHONE PORTRAIT
     ALWAYS FIT WIDTH
  ===================================== */

  if (
    isPhonePortrait
  ) {

    scale =
      scaleByWidth;

  }


  /* =====================================
     TABLET / DESKTOP

     Ưu tiên full height.

     Vì màn hình tablet / laptop rộng hơn
     artboard rất nhiều nên thông thường
     scaleByHeight vẫn không vượt width.
  ===================================== */

  else {

    scale =
      scaleByHeight;


    /*
      Safety:
      nếu gặp màn hình cực hẹp / landscape
      khiến width không đủ thì chuyển về
      contain để không crop ngang.
    */

    const resultingWidth =
      DESIGN_WIDTH *
      scale;


    if (
      resultingWidth >
      viewportWidth
    ) {

      scale =
        scaleByWidth;

    }

  }


  /* =====================================
     SAFETY
  ===================================== */

  scale =
    Math.max(
      .25,
      scale
    );


  /* =====================================
     RENDER SIZE
  ===================================== */

  const renderWidth =
    DESIGN_WIDTH *
    scale;


  const renderHeight =
    DESIGN_HEIGHT *
    scale;


  /* =====================================
     SEND VALUES TO CSS
  ===================================== */

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


  /* =====================================
     SAVE VIEWPORT
  ===================================== */

  lastViewportWidth =
    viewportWidth;


  lastViewportHeight =
    viewportHeight;


  /* =====================================
     SHOW WEBSITE
  ===================================== */

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

   Phone:
   toolbar resize bị bỏ qua do width
   không đổi.

   Desktop/tablet:
   resize bình thường.
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
   ORIENTATION CHANGE

   Khi xoay điện thoại / iPad,
   bắt buộc tính lại.
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
   LOAD PAGE 01 OPENING ASSETS
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
   LOAD PAGE 02 ASSETS
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
   SCHEDULE PAGE 01 ASSETS
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


/* =========================================
   FIRST SCREEN

   Chỉ preload Page 01 như baseline cũ.
========================================= */

window.addEventListener(
  "load",
  scheduleOpeningAssets,
  {
    once: true
  }
);


/* =========================================
   SCHEDULE PAGE 02 ASSETS

   Chỉ sau khi phong bì mở.
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
   EARLY LOAD PAGE 01 ON TOUCH
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
   EARLY LOAD PAGE 02
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
    Page 02 vẫn không preload từ đầu.
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


    /*
      Phong bì đã mở:
      click vùng đỏ không đóng lại.
    */

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
