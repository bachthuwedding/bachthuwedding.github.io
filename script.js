const envelopeButton =
  document.getElementById("envelopeButton");


envelopeButton.addEventListener(
  "click",
  () => {

    const isOpen =
      envelopeButton.classList.toggle(
        "is-open"
      );


    envelopeButton.setAttribute(
      "aria-expanded",
      String(isOpen)
    );


    envelopeButton.setAttribute(
      "aria-label",
      isOpen
        ? "Đóng thiệp"
        : "Mở thiệp"
    );


    if (isOpen) {

      window.dispatchEvent(
        new CustomEvent(
          "wedding-invitation-opened"
        )
      );

    }

  }
);
