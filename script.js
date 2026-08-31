/* =========================================
   MASTER ARTBOARD

   Toàn bộ website được thiết kế cố định
   tại 390 × 844.

   Chỉ parent .site-scale được scale.

   Tất cả element bên trong giữ nguyên
   tỷ lệ và vị trí tương đối.
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

   QUAN TRỌNG:

   Không scale từng element.

   Toàn bộ artboard 390 × 844
   chỉ được scale MỘT LẦN.

   Vì vậy:
   - vị trí không lệch
   - tỷ lệ không lệch
   - desktop / iPad / mobile giống nhau
========================================= */

function updateDesignScale(
  force = false
) {

  const viewportWidth =
    window.innerWidth;

  const viewportHeight =
    window.innerHeight;


  /*
    Touch device:
    Safari / Chrome mobile thường thay đổi
    innerHeight khi thanh browser ẩn/hiện.

    Nếu width không đổi thì KHÔNG scale lại,
    tránh thiệp tự zoom trong lúc scroll.

    Khi xoay màn hình width sẽ đổi,
    lúc đó scale sẽ được tính lại.
  */

  const isTouchDevice =
    window.matchMedia(
      "(pointer: coarse)"
    ).matches;


  if (
    !force &&
    isTouchDevice &&
    Math.abs(
      viewportWidth -
      lastViewportWidth
    ) < 2
  ) {

    return;

  }


  /*
    Desktop:
    cho phép resize cả ngang và dọc.
  */

  if (
    !force &&
    !isTouchDevice &&
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
     SCALE THEO WIDTH
  ===================================== */

  const scaleByWidth =
    viewportWidth /
    DESIGN_WIDTH;


  /* =====================================
     SCALE THEO HEIGHT
  ===================================== */

  const scaleByHeight =
    viewportHeight /
    DESIGN_HEIGHT;


  /* =====================================
     FIT CONTAIN

     Lấy giá trị nhỏ hơn.

     Kết quả:
     - không crop
     - không méo
     - luôn nằm trọn màn hình

     Màn hình hẹp:
     thường fit width.

     Tablet / desktop:
     thường fit height.
  ===================================== */

  let scale =
    Math.min(
      scaleByWidth,
      scaleByHeight
    );


  /*
    Chặn trường hợp browser trả viewport
    bất thường trong khoảnh khắc đầu.
  */

  scale =
    Math.max(
      .25,
      scale
    );


  /* =====================================
     KÍCH THƯỚC SAU SCALE
  ===================================== */

  const renderWidth =
    DESIGN_WIDTH *
    scale;


  const renderHeight =
    DESIGN_HEIGHT *
    scale;


  /* =====================================
     GHI SCALE VÀO CSS VARIABLE
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
     SHOW SITE
  ===================================== */

  siteShell.classList.add(
    "is-scale-ready"
  );

}


/* =========================================
   SCALE NGAY KHI JS CHẠY
========================================= */

updateDesignScale(true);


/* =========================================
   RESIZE

   Desktop:
   resize browser -> tự fit lại.

   Mobile:
   chỉ thay đổi đáng kể khi width đổi.
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

   Đảm bảo xoay iPhone/iPad
   được tính lại hoàn toàn.
========================================= */

window.addEventListener(
  "orientationchange",
  () => {

    window.setTimeout(
      () => {

        updateDesignScale(true);

      },
      120
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


  /*
    Decode trước khi animation chạy
    để hạn chế giật hình.
  */

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
   LOAD PAGE 01 OPEN ASSETS
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

          /*
            Bật các CSS element phụ thuộc
            asset Page 02 sau khi decode xong.
          */

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

   Page 01 vẫn giữ chiến lược load nhẹ.
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

   Chỉ bắt đầu sau khi phong bì mở.
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
   EARLY LOAD PAGE 02 ON CARD TOUCH
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
    Page 02 KHÔNG preload ngay từ đầu.

    Chỉ khi phong bì đã mở,
    mới bắt đầu tải ngầm Page 02.
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


  /*
    Nếu preload chưa hoàn thành
    thì tiếp tục tải.
  */

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
      Khi đã mở phong bì,
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
