const siteShell =
  document.getElementById("siteShell");

const envelopeButton =
  document.getElementById("envelopeButton");

const invitationCard =
  document.getElementById("invitationCard");

const page02 =
  document.getElementById("page02");


let envelopeIsOpen = false;
let page02IsOpen = false;


/* =========================================
   OPEN ENVELOPE
========================================= */

function openEnvelope() {

  if (
    envelopeIsOpen ||
    page02IsOpen
  ) {
    return;
  }

  envelopeIsOpen = true;

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
   GO TO PAGE 02
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
   FIRST CLICK
========================================= */

envelopeButton.addEventListener(
  "click",
  (event) => {

    if (!envelopeIsOpen) {
      openEnvelope();
      return;
    }

    /*
      Khi đã mở, click lên phong bì
      không đóng lại.
      Chỉ card được phép đi Page 02.
    */
    event.preventDefault();

  }
);


/* =========================================
   CARD CLICK
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
