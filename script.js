const siteShell =
  document.getElementById("siteShell");

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
   LOAD ONE DEFERRED IMAGE
========================================= */

function loadDeferredImage(image) {

  const source =
    image.dataset.src;

  if (!source) {
    return Promise.resolve();
  }

  /*
    Chỉ lúc này browser mới thực sự
    nhận URL và bắt đầu tải file.
  */

  image.src = source;

  image.removeAttribute(
    "data-src"
  );


  /*
    decode() giúp ảnh được giải mã
    trước khi animation cần render nó.
  */

  if (
    typeof image.decode === "function"
  ) {

    return image
      .decode()
      .catch(() => {
        /*
          Nếu decode() reject nhưng ảnh
          vẫn tải được thì không làm
          hỏng interaction.
        */
      });
  }


  /*
    Fallback cho browser cũ.
  */

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
   LOAD ALL OPENING ASSETS
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
   LOAD OPEN ASSETS AFTER FIRST SCREEN

   First screen xuất hiện trước.
   Sau đó browser rảnh mới tải phần mở.
========================================= */

function scheduleOpeningAssets() {

  const startLoading = () => {
    loadOpeningAssets();
  };


  if (
    "requestIdleCallback" in window
  ) {

    requestIdleCallback(
      startLoading,
      {
        timeout: 1200
      }
    );

  } else {

    setTimeout(
      startLoading,
      350
    );

  }

}


/*
  Chỉ schedule sau khi các tài nguyên
  của first screen đã hoàn thành.
*/

window.addEventListener(
  "load",
  scheduleOpeningAssets,
  { once: true }
);


/* =========================================
   USER TOUCHES ENVELOPE

   Nếu user thao tác rất nhanh,
   bắt đầu download ngay từ pointerdown,
   trước cả click.
========================================= */

envelopeButton.addEventListener(
  "pointerdown",
  () => {

    if (
      !envelopeIsOpen &&
      !envelopeIsPreparing
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


  envelopeIsPreparing = true;

  envelopeButton.setAttribute(
    "aria-busy",
    "true"
  );


  /*
    Đợi body / flap / front / paper
    tải + decode xong.

    Nhờ vậy animation không bị:
    - trắng ảnh
    - pop-in
    - giật giữa chừng
  */

  await loadOpeningAssets();


  envelopeIsPreparing = false;
  envelopeIsOpen = true;


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
   PAGE 02
========================================= */

function openPage02() {

  if (
    !envelopeIsOpen ||
    page02IsOpen
  ) {
    return;
  }


  page02IsOpen = true;


  siteShell.classList.add(
    "is-page-02"
  );


  page02.setAttribute(
    "aria-hidden",
    "false"
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

      openEnvelope();

      return;

    }


    /*
      Sau khi mở:
      click vùng đỏ không đóng lại.
    */

    event.preventDefault();

  }
);


/* =========================================
   PAPER CLICK -> PAGE 02
========================================= */

invitationCard.addEventListener(
  "click",
  (event) => {

    if (!envelopeIsOpen) {
      return;
    }


    event.preventDefault();
    event.stopPropagation();


    openPage02();

  }
);
