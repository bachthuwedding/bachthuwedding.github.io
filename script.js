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


      /*
        Event này để sẵn cho bước sau.

        Sau này khi có tờ giấy / Page 02,
        chúng ta sẽ bắt event này để:
        - trượt card lên
        - transition sang Page 02
      */

      if (isOpen) {

        window.dispatchEvent(
          new CustomEvent(
            "wedding-invitation-opened"
          )
        );

      }

    }
  );

}
