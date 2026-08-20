const envelopeButton =
  document.getElementById("envelopeButton");

if (envelopeButton) {

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

    }
  );

}
