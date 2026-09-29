(() => {
  "use strict";


  /* =======================================================
     CONFIG
  ======================================================= */

  const DESIGN_WIDTH = 390;
  const DESIGN_HEIGHT = 680;

  const LUCKY_MIN = 1;
  const LUCKY_MAX = 99;


  const WEDDING_API_URL =
    "https://script.google.com/macros/s/AKfycbzZgGDz-UI1bGQI8M4FoYe1GzxUWCI9V1k_hK6N_9WftwU9qyH-Utm9csjz9NkdW6Axhg/exec";


  const SPREADSHEET_ID =
    "1Met6W9whg2I9Ho_GVBgpp4QZOrBF_24pKOk0lPiC7Yo";


  const SHEET_NAME =
    "Danh sách khách mời";


  const LUCKY_HINT_REVEALED =
    "Hãy giữ con số may mắn của bạn tới ngày cưới của chúng mình nhé!";


  /*
    Ta đọc:

    D = guest name
    F = display name
    G = invitation URL
    H = opened
    I = lucky number
    J = RSVP name
    K = attendance
    L = guest count
    M = message
    N = video

    Theo thứ tự select bên dưới:

    index 0 = D
    index 1 = F
    index 2 = G
    index 3 = H
    index 4 = I
    index 5 = J
    index 6 = K
    index 7 = L
    index 8 = M
    index 9 = N
  */

  const GVIZ_QUERY =
    "select D,F,G,H,I,J,K,L,M,N";


  /* =======================================================
     URL GUEST
  ======================================================= */

  const urlParams =
    new URLSearchParams(
      window.location.search
    );


  const currentGuestSlug =
    normalizeGuestSlug(
      urlParams.get("guest") || ""
    );


  function isLuckyTestGuest() {

    return (
      String(
        currentGuestSlug ||
        ""
      )
        .trim()
        .toLowerCase()
      ===
      "test"
    );
  }



  function normalizeGuestSlug(value) {

    return String(
      value || ""
    )
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9-]/g,
        ""
      );
  }


  function slugifyGuestName(value) {

    return String(
      value || ""
    )
      .trim()

      .replace(
        /Đ/g,
        "D"
      )

      .replace(
        /đ/g,
        "d"
      )

      .normalize(
        "NFD"
      )

      .replace(
        /[\u0300-\u036f]/g,
        ""
      )

      .toLowerCase()

      .replace(
        /[^a-z0-9]+/g,
        "-"
      )

      .replace(
        /^-+|-+$/g,
        ""
      )

      .replace(
        /-+/g,
        "-"
      );
  }


  function normalizeText(value) {

    return String(
      value ?? ""
    )
      .normalize(
        "NFC"
      );
  }


  function sleep(ms) {

    return new Promise(
      (resolve) => {

        setTimeout(
          resolve,
          ms
        );
      }
    );
  }


  function isDriveFolderUrl(value) {

    return /^https:\/\/drive\.google\.com\/drive\/folders\/[A-Za-z0-9_-]+/i
      .test(
        String(
          value || ""
        ).trim()
      );
  }


  /* =======================================================
     DOM
  ======================================================= */

  const root =
    document.documentElement;


  const siteShell =
    document.getElementById(
      "siteShell"
    );


  const openingCardButton =
    document.getElementById(
      "openingCardButton"
    );


  const weddingMusic =
    document.getElementById(
      "weddingMusic"
    );


  const musicToggle =
    document.getElementById(
      "musicToggle"
    );


  const pageScroller =
    document.getElementById(
      "page02"
    );


  const page02Layout =
    document.getElementById(
      "page02Layout"
    );


  const page03 =
    document.getElementById(
      "page03"
    );
  const page06 =
    document.getElementById(
      "page06"
    );


  const page07 =
    document.getElementById(
      "page07"
    );


  const page08 =
    document.getElementById(
      "page08"
    );


  const pages = [

    page02Layout,

    page03,
    page06,

    page07,

    page08

  ].filter(Boolean);


  let personalizedGuestName =
    document.getElementById(
      "personalizedGuestName"
    );


  const page06EntryFireworks =
    document.getElementById(
      "page06EntryFireworks"
    );


  const luckyCard =
    document.getElementById(
      "luckyCard"
    );


  const luckyNumber =
    document.getElementById(
      "luckyNumber"
    );


  const luckyHint =
    document.getElementById(
      "luckyHint"
    );


  const luckyTrigger =
    document.getElementById(
      "luckyTrigger"
    );


  const luckyFireworks =
    document.getElementById(
      "luckyFireworks"
    );


  const rsvpForm =
    document.getElementById(
      "rsvpForm"
    );


  const rsvpGuestName =
    document.getElementById(
      "rsvpGuestName"
    );


  const rsvpAttendanceYes =
    document.getElementById(
      "rsvpAttendanceYes"
    );


  const rsvpAttendanceNo =
    document.getElementById(
      "rsvpAttendanceNo"
    );


  const rsvpAttendanceNoText =
    document.getElementById(
      "rsvpAttendanceNoText"
    );


  const rsvpGuestCount =
    document.getElementById(
      "rsvpGuestCount"
    );


  const rsvpMinus =
    document.getElementById(
      "rsvpMinus"
    );


  const rsvpPlus =
    document.getElementById(
      "rsvpPlus"
    );


  const rsvpMessage =
    document.getElementById(
      "rsvpMessage"
    );


  const rsvpSubmit =
    document.getElementById(
      "rsvpSubmit"
    );


  const rsvpVideoLink =
    document.getElementById(
      "rsvpVideoLink"
    );


  const rsvpVideoField =
    rsvpVideoLink
    ||
    document.querySelector(
      ".p07-video-field"
    );


  /* =======================================================
     STATE
  ======================================================= */

  const imagePromises =
    new WeakMap();


  const pagePromises =
    new WeakMap();


  const urlPromises =
    new Map();


  let pageMode = false;

  let musicStarted = false;

  let musicFadeRaf = 0;

  const MUSIC_VOLUME = .36;

  let resizeRaf = 0;

  let scrollRaf = 0;

  let activePageIndex = -1;

  let luckyIdleTimer = null;

  let luckyRolling = false;

  let luckyLocked = false;

  /*
    Với khách thật, chỉ cho roll sau khi Google Sheet xác nhận
    cột I hiện đang trống. localStorage chỉ là cache hiển thị nhanh,
    không còn là nguồn quyết định.
  */
  let luckyAuthorityReady = false;

  let rsvpCount = 1;

  let page06EntryTimer = null;

  let submitResetTimer = null;

  let currentGuestData = null;

  let guestDataLoaded = false;

  let guestLoadPromise = null;


  /* =======================================================
     GOOGLE SHEET GVIZ READ

     Đây là phần thay cho Apps Script JSONP.

     docs.google.com/spreadsheets/.../gviz/tq
     -> script injection
     -> responseHandler(...)
  ======================================================= */

  function gvizRequest(
    timeout = 20000
  ) {

    return new Promise(
      (
        resolve,
        reject
      ) => {

        const callbackName =
          "__bachThuSheet"
          +
          Date.now()
          +
          Math.random()
            .toString(36)
            .slice(2);


        const script =
          document.createElement(
            "script"
          );


        let timer = null;
        let finished = false;


        function cleanup() {

          if (
            finished
          ) {

            return;
          }


          finished = true;


          if (
            timer !== null
          ) {

            clearTimeout(
              timer
            );
          }


          script.remove();


          try {

            delete window[
              callbackName
            ];

          } catch (_) {

            window[
              callbackName
            ] = undefined;
          }
        }


        window[
          callbackName
        ] =
          (response) => {

            cleanup();


            if (
              !response
            ) {

              reject(
                new Error(
                  "Google Sheet không trả dữ liệu."
                )
              );

              return;
            }


            if (
              response.status
              &&
              response.status !== "ok"
            ) {

              console.error(
                "[Wedding] GViz response:",
                response
              );


              reject(
                new Error(
                  "Google Sheet trả về lỗi truy vấn."
                )
              );

              return;
            }


            resolve(
              response
            );
          };


        script.onerror =
          () => {

            cleanup();


            reject(
              new Error(
                "Không tải được dữ liệu trực tiếp từ Google Sheet."
              )
            );
          };


        /*
          tqx responseHandler là cơ chế callback
          của Google Visualization.
        */

        const tqx =
          `responseHandler:${callbackName}`;


        const url =
          "https://docs.google.com/spreadsheets/d/"
          +
          encodeURIComponent(
            SPREADSHEET_ID
          )
          +
          "/gviz/tq"
          +
          "?sheet="
          +
          encodeURIComponent(
            SHEET_NAME
          )
          +
          "&headers=1"
          +
          "&tq="
          +
          encodeURIComponent(
            GVIZ_QUERY
          )
          +
          "&tqx="
          +
          encodeURIComponent(
            tqx
          )
          +
          "&t="
          +
          Date.now();


        script.async =
          true;


        script.src =
          url;


        timer =
          setTimeout(
            () => {

              cleanup();


              reject(
                new Error(
                  "Google Sheet phản hồi quá lâu."
                )
              );

            },
            timeout
          );


        document.head.appendChild(
          script
        );
      }
    );
  }


  /* =======================================================
     GVIZ VALUE HELPERS
  ======================================================= */

  function getGvizCell(
    row,
    columnIndex
  ) {

    if (
      !row
      ||
      !Array.isArray(
        row.c
      )
    ) {

      return "";
    }


    const cell =
      row.c[
        columnIndex
      ];


    if (
      !cell
    ) {

      return "";
    }


    /*
      .v = raw value
      .f = formatted value

      Với text, ưu tiên .v.
      Với date, .f dễ đọc hơn nhưng ta không dùng H ở frontend.
    */

    if (
      cell.v !==
      undefined
      &&
      cell.v !==
      null
    ) {

      return cell.v;
    }


    if (
      cell.f !==
      undefined
      &&
      cell.f !==
      null
    ) {

      return cell.f;
    }


    return "";
  }


  function getGvizDisplayCell(
    row,
    columnIndex
  ) {

    if (
      !row
      ||
      !Array.isArray(
        row.c
      )
    ) {

      return "";
    }


    const cell =
      row.c[
        columnIndex
      ];


    if (!cell) {

      return "";
    }


    if (
      cell.f !==
      undefined
      &&
      cell.f !==
      null
    ) {

      return cell.f;
    }


    if (
      cell.v !==
      undefined
      &&
      cell.v !==
      null
    ) {

      return cell.v;
    }


    return "";
  }


  /* =======================================================
     EXTRACT ?guest FROM COLUMN G
  ======================================================= */

  function extractGuestSlugFromLink(
    link
  ) {

    const text =
      String(
        link || ""
      );


    const match =
      text.match(
        /[?&]guest=([^&#]+)/
      );


    if (!match) {

      return "";
    }


    try {

      return normalizeGuestSlug(
        decodeURIComponent(
          match[1]
        )
      );

    } catch (_) {

      return normalizeGuestSlug(
        match[1]
      );
    }
  }


  /* =======================================================
     FIND CURRENT GUEST IN SHEET

     Ưu tiên G = Link thiệp.
     Fallback D = tên khách.
  ======================================================= */

  function findGuestInGvizResponse(
    response
  ) {

    const rows =
      response
        ?.table
        ?.rows;


    if (
      !Array.isArray(
        rows
      )
    ) {

      throw new Error(
        "Google Sheet không có danh sách khách."
      );
    }


    /*
      -----------------------------------------------------
      PASS 1:
      tìm chính xác slug trong G.
      -----------------------------------------------------
    */

    for (
      let i = 0;
      i < rows.length;
      i += 1
    ) {

      const row =
        rows[i];


      const inviteLink =
        getGvizDisplayCell(
          row,
          2
        );


      const slug =
        extractGuestSlugFromLink(
          inviteLink
        );


      if (
        slug
        &&
        slug ===
        currentGuestSlug
      ) {

        return parseGuestRow(
          row,
          i
        );
      }
    }


    /*
      -----------------------------------------------------
      PASS 2:
      fallback D.

      Có xử lý duplicate:
      abc
      abc-2
      abc-3
      -----------------------------------------------------
    */

    const duplicateCounter =
      Object.create(
        null
      );


    for (
      let i = 0;
      i < rows.length;
      i += 1
    ) {

      const row =
        rows[i];


      const guestName =
        String(
          getGvizDisplayCell(
            row,
            0
          )
          ||
          ""
        )
          .trim();


      if (!guestName) {

        continue;
      }


      const baseSlug =
        slugifyGuestName(
          guestName
        );


      if (!baseSlug) {

        continue;
      }


      duplicateCounter[
        baseSlug
      ] =
        (
          duplicateCounter[
            baseSlug
          ]
          ||
          0
        )
        +
        1;


      const occurrence =
        duplicateCounter[
          baseSlug
        ];


      const slug =
        occurrence === 1
          ?
          baseSlug
          :
          `${baseSlug}-${occurrence}`;


      if (
        slug ===
        currentGuestSlug
      ) {

        return parseGuestRow(
          row,
          i
        );
      }
    }


    throw new Error(
      `Không tìm thấy khách "${currentGuestSlug}" trong Google Sheet.`
    );
  }


  /* =======================================================
     MAP GVIZ ROW -> WEBSITE DATA
  ======================================================= */

  function parseGuestRow(
    row,
    rowIndex
  ) {

    /*
      select D,F,G,H,I,J,K,L,M,N

      0 D
      1 F
      2 G
      3 H
      4 I
      5 J
      6 K
      7 L
      8 M
      9 N
    */

    const luckyRaw =
      getGvizCell(
        row,
        4
      );


    const guestCountRaw =
      getGvizCell(
        row,
        7
      );


    const luckyNumber =
      Number(
        luckyRaw
      );


    const guestCount =
      Number(
        guestCountRaw
      );


    return {

      ok:
        true,

      guest:
        currentGuestSlug,

      /*
        +2 vì:
        row 1 là header,
        GViz rows bắt đầu từ dòng data đầu tiên.
      */

      row:
        rowIndex + 2,

      name:
        normalizeText(
          getGvizDisplayCell(
            row,
            0
          )
        )
          .trim(),

      /*
        QUAN TRỌNG:
        Page 2 chỉ dùng cột F.
      */

      displayName:
        normalizeText(
          getGvizDisplayCell(
            row,
            1
          )
        )
          .trim(),

      displayNameSource:
        "F / Google Sheet GViz",

      inviteLink:
        String(
          getGvizDisplayCell(
            row,
            2
          )
          ||
          ""
        ),

      luckyNumber:
        Number.isInteger(
          luckyNumber
        )
          ?
          luckyNumber
          :
          "",

      rsvpName:
        normalizeText(
          getGvizDisplayCell(
            row,
            5
          )
        )
          .trim(),

      attendance:
        normalizeText(
          getGvizDisplayCell(
            row,
            6
          )
        )
          .trim(),

      guestCount:
        Number.isFinite(
          guestCount
        )
          ?
          guestCount
          :
          "",

      message:
        normalizeText(
          getGvizDisplayCell(
            row,
            8
          )
        ),

      video:
        String(
          getGvizDisplayCell(
            row,
            9
          )
          ||
          ""
        )
    };
  }


  /* =======================================================
     REQUEST CURRENT GUEST

     Không chạm Apps Script GET.
  ======================================================= */

  async function requestGuestData() {

    if (
      !currentGuestSlug
    ) {

      return null;
    }


    const response =
      await gvizRequest();


    const guest =
      findGuestInGvizResponse(
        response
      );


    console.log(
      "[Wedding] Sheet guest:",
      guest
    );


    return guest;
  }


  /* =======================================================
     POST TO APPS SCRIPT

     Phần này của bạn đang chạy đúng.
     Giữ nguyên.
  ======================================================= */

  async function postToBackend(
    data
  ) {

    const body =
      new URLSearchParams();


    Object.entries(
      data
    )
      .forEach(
        (
          [
            key,
            value
          ]
        ) => {

          if (
            value === undefined
            ||
            value === null
          ) {

            return;
          }


          body.append(
            key,
            String(
              value
            )
          );
        }
      );


    await fetch(
      WEDDING_API_URL,
      {
        method:
          "POST",

        mode:
          "no-cors",

        cache:
          "no-store",

        redirect:
          "follow",

        credentials:
          "omit",

        body
      }
    );
  }


  /* =======================================================
     SCALE
     Mobile-safe: không rescale artboard theo chiều cao bàn phím.
  ======================================================= */

  let viewportInputLocked =
    false;


  let stableViewportWidth =
    document.documentElement.clientWidth
    ||
    window.innerWidth
    ||
    DESIGN_WIDTH;


  let stableViewportHeight =
    document.documentElement.clientHeight
    ||
    window.innerHeight
    ||
    DESIGN_HEIGHT;


  let keyboardRestoreTimerA =
    null;


  let keyboardRestoreTimerB =
    null;


  function isKeyboardInput(
    target
  ) {

    if (
      !target
      ||
      typeof target.matches !==
        "function"
    ) {

      return false;
    }


    return target.matches(
      [
        "textarea",
        "input:not([type])",
        'input[type="text"]',
        'input[type="email"]',
        'input[type="tel"]',
        'input[type="number"]',
        'input[type="search"]',
        'input[type="url"]'
      ].join(",")
    );
  }


  function readLayoutViewport() {

    const width =
      document.documentElement.clientWidth
      ||
      window.innerWidth
      ||
      stableViewportWidth
      ||
      DESIGN_WIDTH;


    const height =
      document.documentElement.clientHeight
      ||
      window.innerHeight
      ||
      stableViewportHeight
      ||
      DESIGN_HEIGHT;


    if (
      !viewportInputLocked
    ) {

      stableViewportWidth =
        width;


      stableViewportHeight =
        height;
    }


    return {
      width:
        viewportInputLocked
        ?
        stableViewportWidth
        :
        width,

      height:
        viewportInputLocked
        ?
        stableViewportHeight
        :
        height
    };
  }


  function resetHorizontalViewport() {

    root.scrollLeft =
      0;


    if (
      document.body
    ) {

      document.body.scrollLeft =
        0;
    }


    if (
      window.scrollX !==
        0
    ) {

      window.scrollTo(
        0,
        0
      );
    }
  }


  function updateScale() {

    const {
      width:
        viewportWidth,

      height:
        viewportHeight
    } =
      readLayoutViewport();


    const scale =
      Math.min(
        viewportWidth /
        DESIGN_WIDTH,

        viewportHeight /
        DESIGN_HEIGHT
      );


    root.style.setProperty(
      "--design-scale",
      String(
        scale
      )
    );


    root.style.setProperty(
      "--render-width",
      `${DESIGN_WIDTH * scale}px`
    );


    root.style.setProperty(
      "--render-height",
      `${DESIGN_HEIGHT * scale}px`
    );


    siteShell
      ?.classList
      .add(
        "is-scale-ready"
      );
  }


  function scheduleScale() {

    cancelAnimationFrame(
      resizeRaf
    );


    resizeRaf =
      requestAnimationFrame(
        updateScale
      );
  }


  function restoreViewportAfterKeyboard() {

    if (
      keyboardRestoreTimerA !==
        null
    ) {

      clearTimeout(
        keyboardRestoreTimerA
      );
    }


    if (
      keyboardRestoreTimerB !==
        null
    ) {

      clearTimeout(
        keyboardRestoreTimerB
      );
    }


    const restore =
      () => {

        if (
          isKeyboardInput(
            document.activeElement
          )
        ) {

          return;
        }


        viewportInputLocked =
          false;


        stableViewportWidth =
          document.documentElement.clientWidth
          ||
          window.innerWidth
          ||
          stableViewportWidth;


        stableViewportHeight =
          document.documentElement.clientHeight
          ||
          window.innerHeight
          ||
          stableViewportHeight;


        resetHorizontalViewport();


        scheduleScale();
      };


    /*
      Messenger/iOS có thể trả visual viewport về kích thước cũ
      theo hai nhịp sau khi bàn phím đóng, nên restore hai lần.
    */

    keyboardRestoreTimerA =
      window.setTimeout(
        restore,
        180
      );


    keyboardRestoreTimerB =
      window.setTimeout(
        restore,
        620
      );
  }


  document.addEventListener(
    "focusin",
    (event) => {

      if (
        !isKeyboardInput(
          event.target
        )
      ) {

        return;
      }


      /*
        Khóa kích thước artboard trước khi keyboard làm thay đổi
        visual viewport. Nhờ vậy thiệp không co/nhảy sang ngang.
      */

      stableViewportWidth =
        document.documentElement.clientWidth
        ||
        window.innerWidth
        ||
        stableViewportWidth;


      stableViewportHeight =
        document.documentElement.clientHeight
        ||
        window.innerHeight
        ||
        stableViewportHeight;


      viewportInputLocked =
        true;


      resetHorizontalViewport();
    },
    true
  );


  document.addEventListener(
    "focusout",
    (event) => {

      if (
        !isKeyboardInput(
          event.target
        )
      ) {

        return;
      }


      restoreViewportAfterKeyboard();
    },
    true
  );


  updateScale();


  window.addEventListener(
    "resize",
    () => {

      if (
        viewportInputLocked
      ) {

        return;
      }


      scheduleScale();
    },
    {
      passive: true
    }
  );


  window.visualViewport
    ?.addEventListener(
      "resize",
      () => {

        if (
          viewportInputLocked
        ) {

          return;
        }


        scheduleScale();
      },
      {
        passive: true
      }
    );


  window.visualViewport
    ?.addEventListener(
      "scroll",
      () => {

        if (
          viewportInputLocked
        ) {

          return;
        }


        resetHorizontalViewport();
      },
      {
        passive: true
      }
    );


  /* =======================================================
     SCROLL NGOÀI THIỆP
  ======================================================= */

  window.addEventListener(
    "wheel",
    (event) => {

      if (
        !pageMode
        ||
        !pageScroller
      ) {

        return;
      }


      if (
        event.target
        &&
        pageScroller.contains(
          event.target
        )
      ) {

        return;
      }


      if (
        Math.abs(
          event.deltaY
        )
        <=
        Math.abs(
          event.deltaX
        )
      ) {

        return;
      }


      event.preventDefault();


      pageScroller.scrollTop +=
        event.deltaY;
    },
    {
      passive: false
    }
  );


  /* =======================================================
     IDLE
  ======================================================= */

  function runWhenIdle(
    callback,
    timeout = 1000
  ) {

    if (
      "requestIdleCallback"
      in window
    ) {

      return window
        .requestIdleCallback(
          callback,
          {
            timeout
          }
        );
    }


    return window.setTimeout(
      callback,
      160
    );
  }


  /* =======================================================
     PRELOAD
  ======================================================= */

  function preloadUrl(
    url,
    priority = "low"
  ) {

    if (!url) {

      return Promise.resolve();
    }


    if (
      urlPromises.has(
        url
      )
    ) {

      return urlPromises.get(
        url
      );
    }


    const promise =
      new Promise(
        (resolve) => {

          const image =
            new Image();


          image.decoding =
            "async";


          try {

            image.fetchPriority =
              priority;

          } catch (_) {}


          const finish =
            () => {

              if (
                typeof image.decode ===
                "function"
              ) {

                image
                  .decode()
                  .catch(
                    () => {}
                  )
                  .finally(
                    resolve
                  );

              } else {

                resolve();
              }
            };


          image.addEventListener(
            "load",
            finish,
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


          image.src =
            url;


          if (
            image.complete
          ) {

            finish();
          }
        }
      );


    urlPromises.set(
      url,
      promise
    );


    return promise;
  }


  function loadImage(
    image,
    priority = "low"
  ) {

    if (!image) {

      return Promise.resolve();
    }


    if (
      imagePromises.has(
        image
      )
    ) {

      return imagePromises.get(
        image
      );
    }


    const source =
      image.dataset.src;


    if (!source) {

      return Promise.resolve();
    }


    const promise =
      new Promise(
        (resolve) => {

          try {

            image.fetchPriority =
              priority;

          } catch (_) {}


          const finish =
            () => {

              if (
                typeof image.decode ===
                "function"
              ) {

                image
                  .decode()
                  .catch(
                    () => {}
                  )
                  .finally(
                    resolve
                  );

              } else {

                resolve();
              }
            };


          image.addEventListener(
            "load",
            finish,
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


          image.src =
            source;


          image.removeAttribute(
            "data-src"
          );


          if (
            image.complete
          ) {

            finish();
          }
        }
      );


    imagePromises.set(
      image,
      promise
    );


    return promise;
  }


  const CRITICAL_PAGE_IMAGE_SELECTOR =
    [
      ".p02-background",
      ".p02-frame",
      ".p02-bottom-ornament",
      ".p02-procession-item",
      ".p03-background",
      ".p03-frame",
      ".p03-bottom-ornament",
      ".p06-background",
      ".p06-frame",
      ".p06-bottom-ornament",
      ".p07-background",
      ".p07-frame",
      ".p07-bottom-ornament",
      ".p08-background",
      ".p08-frame",
      ".p08-bottom-ornament"
    ].join(",");


  function isCriticalPageImage(
    image
  ) {

    return Boolean(
      image
      &&
      image.matches(
        CRITICAL_PAGE_IMAGE_SELECTOR
      )
    );
  }


  function loadPageCritical(
    page,
    priority = "high"
  ) {

    if (!page) {

      return Promise.resolve();
    }


    const criticalImages =
      Array.from(
        page.querySelectorAll(
          "img"
        )
      )
        .filter(
          isCriticalPageImage
        );


    return Promise.allSettled(
      criticalImages.map(
        (image) => {

          return loadImage(
            image,
            priority
          );
        }
      )
    );
  }


  function loadPage(
    page,
    priority = "low"
  ) {

    if (!page) {

      return Promise.resolve();
    }


    if (
      pagePromises.has(
        page
      )
    ) {

      return pagePromises.get(
        page
      );
    }


    const promise =
      (async () => {

        const images =
          Array.from(
            page.querySelectorAll(
              "img[data-src]"
            )
          );


        const jobs =
          images.map(
            (image) => {

              return loadImage(
                image,
                isCriticalPageImage(
                  image
                )
                ?
                priority
                :
                "low"
              );
            }
          );


        const spriteHost =
          page.querySelector(
            "[data-sprite-src]"
          );


        if (
          spriteHost
        ) {

          const spriteUrl =
            spriteHost
              .dataset
              .spriteSrc;


          jobs.push(

            preloadUrl(
              spriteUrl,
              "low"
            )
              .then(
                () => {

                  spriteHost
                    .style
                    .setProperty(
                      "--p02-confetti-sprite",
                      `url("${spriteUrl}")`
                    );


                  spriteHost
                    .removeAttribute(
                      "data-sprite-src"
                    );
                }
              )
          );
        }


        await Promise.allSettled(
          jobs
        );
})();


    pagePromises.set(
      page,
      promise
    );


    return promise;
  }


  /* =======================================================
     PAGE 02 GUEST NAME
  ======================================================= */

  function ensureGuestNameElement() {

    if (
      personalizedGuestName
    ) {

      return personalizedGuestName;
    }


    if (
      !page02Layout
    ) {

      return null;
    }


    const invite =
      page02Layout.querySelector(
        ".p02-invite"
      );


    if (!invite) {

      return null;
    }


    personalizedGuestName =
      document.createElement(
        "p"
      );


    personalizedGuestName.id =
      "personalizedGuestName";


    personalizedGuestName.className =
      "p02-personalized-guest";


    invite.insertAdjacentElement(
      "afterend",
      personalizedGuestName
    );


    return personalizedGuestName;
  }


  function renderGuestDisplayName(
    value
  ) {

    const element =
      ensureGuestNameElement();


    if (!element) {

      return;
    }


    const text =
      normalizeText(
        value
      )
        .trim();


    if (!text) {

      element.textContent =
        "";

      element.hidden =
        true;

      element.style.display =
        "none";

      return;
    }


    element.textContent =
      text;


    element.hidden =
      false;


    element.removeAttribute(
      "hidden"
    );


    /*
      Đúng vị trí bạn đã test
      và ép thành công trong DevTools.
    */

    element.style.cssText =
      [
        "position:absolute",
        "z-index:25",
        "left:50%",
        "top:62px",
        "width:300px",
        "margin:0",
        "padding:0",
        "transform:translateX(-50%)",
        "display:block",
        "visibility:visible",
        "pointer-events:none",
        "text-align:center",
        "color:#405948",
        'font-family:"Times New Roman", Times, serif',
        "font-size:18px",
        "font-weight:600",
        "font-style:italic",
        "line-height:1.25",
        "letter-spacing:0",
        "white-space:normal"
      ]
        .join(";")
      +
      ";";


    /*
      Nếu dữ liệu tên khách về sau khi Page 2 đã bắt đầu hiện,
      vẫn cho riêng tên khách chạy transition từ trên xuống.
    */
    if (
      page02Layout
        ?.classList
        .contains(
          "is-entering"
        )
    ) {
      element.style.opacity =
        "0";

      element.style.translate =
        "0 -16px";

      requestAnimationFrame(
        () => {
          requestAnimationFrame(
            () => {
              element.style.opacity =
                "";

              element.style.translate =
                "";
            }
          );
        }
      );
    }


    console.log(
      "[Wedding] Page 2 F:",
      text
    );
  }


  /* =======================================================
     LUCKY AUTHORITY GATE
  ======================================================= */

  function isValidLuckyValue(
    value
  ) {

    const number =
      Number(
        value
      );


    return (
      Number.isInteger(
        number
      )
      &&
      number >=
        LUCKY_MIN
      &&
      number <=
        LUCKY_MAX
    );
  }


  function setLuckyAuthorityPending(
    message =
      "Đang kiểm tra số may mắn..."
  ) {

    if (
      isLuckyTestGuest()
    ) {

      luckyAuthorityReady =
        true;


      if (
        luckyTrigger
      ) {

        luckyTrigger.disabled =
          false;
      }


      return;
    }


    luckyAuthorityReady =
      false;


    if (
      luckyTrigger
    ) {

      luckyTrigger.disabled =
        true;
    }


    if (
      luckyHint
      &&
      !luckyLocked
      &&
      !luckyRolling
    ) {

      luckyHint.textContent =
        message;
    }
  }


  function unlockLuckyAfterAuthorityCheck() {

    if (
      isLuckyTestGuest()
    ) {

      luckyAuthorityReady =
        true;


      luckyLocked =
        false;


      if (
        luckyTrigger
      ) {

        luckyTrigger.disabled =
          false;
      }


      return;
    }


    luckyAuthorityReady =
      true;


    luckyLocked =
      false;


    if (
      luckyTrigger
      &&
      !luckyRolling
    ) {

      luckyTrigger.disabled =
        false;
    }


    if (
      luckyHint
      &&
      !luckyRolling
    ) {

      luckyHint.textContent =
        "Nhấn để nhận số may mắn";
    }
  }


  /* =======================================================
     APPLY GUEST DATA
  ======================================================= */

  function applyGuestData(
    response
  ) {

    if (
      !response
      ||
      response.ok !==
      true
    ) {

      return;
    }


    currentGuestData =
      response;


    guestDataLoaded =
      true;


    /* ===================================================
       PAGE 2 = F
    =================================================== */

    const displayName =
      normalizeText(
        response.displayName
        ||
        ""
      )
        .trim();


    renderGuestDisplayName(
      displayName
    );


    if (
      displayName
    ) {

      document.title =
        `${displayName} | Bách & Thư`;
    }


    /* ===================================================
       RSVP NAME

       J nếu đã nhập.
       Nếu chưa thì D.
    =================================================== */

    if (
      rsvpGuestName
    ) {

      if (
        response.rsvpName
      ) {

        rsvpGuestName.value =
          normalizeText(
            response.rsvpName
          );

      } else if (
        response.name
      ) {

        rsvpGuestName.value =
          normalizeText(
            response.name
          );
      }
    }


    /* ===================================================
       LUCKY
    =================================================== */

    const existingLucky =
      Number(
        response.luckyNumber
      );


    if (
      isLuckyTestGuest()
    ) {

      unlockLuckyAfterAuthorityCheck();


    } else if (
      isValidLuckyValue(
        existingLucky
      )
    ) {

      luckyAuthorityReady =
        true;


      lockLuckyNumber(
        existingLucky,
        false
      );


    } else {

      /*
        Sheet đã load thành công và I đang trống:
        bây giờ mới cho khách thật bấm roll.
      */
      unlockLuckyAfterAuthorityCheck();
    }


    /* ===================================================
       ATTENDANCE
    =================================================== */

    if (
      response.attendance ===
      "Không"
    ) {

      if (
        rsvpAttendanceNo
      ) {

        rsvpAttendanceNo.checked =
          true;
      }


      if (
        rsvpAttendanceYes
      ) {

        rsvpAttendanceYes.checked =
          false;
      }


    } else if (
      response.attendance ===
      "Có"
    ) {

      if (
        rsvpAttendanceYes
      ) {

        rsvpAttendanceYes.checked =
          true;
      }


      if (
        rsvpAttendanceNo
      ) {

        rsvpAttendanceNo.checked =
          false;
      }
    }


    /* ===================================================
       COUNT
    =================================================== */

    if (
      response.guestCount !==
        ""
      &&
      response.guestCount !==
        null
      &&
      response.guestCount !==
        undefined
    ) {

      const savedCount =
        Number(
          response.guestCount
        );


      if (
        Number.isInteger(
          savedCount
        )
        &&
        savedCount >=
          0
        &&
        savedCount <=
          10
      ) {

        rsvpCount =
          savedCount;
      }
    }


    /* ===================================================
       MESSAGE
    =================================================== */

    if (
      rsvpMessage
    ) {

      rsvpMessage.value =
        normalizeText(
          response.message
          ||
          ""
        );
    }


    /* ===================================================
       VIDEO FOLDER

       N = link folder riêng của khách.
    =================================================== */

    const videoFolderUrl =
      String(
        response.video
        ||
        ""
      )
        .trim();


    if (
      rsvpVideoLink
    ) {

      if (
        isDriveFolderUrl(
          videoFolderUrl
        )
      ) {

        rsvpVideoLink.href =
          videoFolderUrl;

        rsvpVideoLink.dataset.ready =
          "true";

      } else {

        rsvpVideoLink.href =
          "#";

        rsvpVideoLink.dataset.ready =
          "false";
      }
    }


    updateCount();

    updateAttendanceNoLabel();


    if (
      response.attendance ===
        "Có"
      ||
      response.attendance ===
        "Không"
    ) {

      setSubmitText(
        "CẬP NHẬT XÁC NHẬN"
      );
    }
  }


  /* =======================================================
     LOAD GUEST
  ======================================================= */

  async function loadGuestPersonalization(
    force = false
  ) {

    if (
      !currentGuestSlug
    ) {

      return null;
    }


    if (
      guestDataLoaded
      &&
      !force
    ) {

      return currentGuestData;
    }


    if (
      guestLoadPromise
      &&
      !force
    ) {

      return guestLoadPromise;
    }


    guestLoadPromise =
      (async () => {

        const delays = [
          0,
          500,
          1200
        ];


        let lastError =
          null;


        for (
          let i = 0;
          i < delays.length;
          i += 1
        ) {

          if (
            delays[i] > 0
          ) {

            await sleep(
              delays[i]
            );
          }


          try {

            const response =
              await requestGuestData();


            applyGuestData(
              response
            );


            return response;


          } catch (error) {

            lastError =
              error;


            console.warn(
              `[Wedding] Sheet load attempt ${i + 1}`,
              error
            );
          }
        }


        console.error(
          "[Wedding] Sheet load failed",
          lastError
        );


        if (
          !isLuckyTestGuest()
        ) {

          setLuckyAuthorityPending(
            "Không thể kiểm tra số may mắn. Vui lòng thử lại sau."
          );
        }


        return null;
      })();


    try {

      return await guestLoadPromise;

    } finally {

      guestLoadPromise =
        null;
    }
  }


  /* =======================================================
     PAGE 02 ENTRANCE
  ======================================================= */

  function playPage02Entrance() {

    if (
      !page02Layout
    ) {

      return;
    }


    page02Layout
      .classList
      .remove(
        "is-entering"
      );


    void page02Layout.offsetWidth;


    requestAnimationFrame(
      () => {

        requestAnimationFrame(
          () => {

            page02Layout
              .classList
              .add(
                "is-entering"
              );


            if (
              currentGuestData
              ?.displayName
            ) {

              renderGuestDisplayName(
                currentGuestData
                  .displayName
              );
            }
          }
        );
      }
    );
  }


  /* =======================================================
     FIREWORKS
  ======================================================= */

  const fireworkColors = [
    "#a63019",
    "#c99633",
    "#e5b747",
    "#315747",
    "#d76b35",
    "#f0d37b"
  ];


  function spawnFireworks(
    target,
    {
      count = 90,
      minDistance = 45,
      maxDistance = 135,
      cleanup = 1200
    } = {}
  ) {

    if (!target) {

      return;
    }


    target.replaceChildren();


    const fragment =
      document
        .createDocumentFragment();


    for (
      let i = 0;
      i < count;
      i += 1
    ) {

      const particle =
        document.createElement(
          "span"
        );


      particle.className =
        "p06-firework-particle";


      const angle =
        Math.random()
        *
        Math.PI
        *
        2;


      const distance =
        minDistance
        +
        Math.random()
        *
        (
          maxDistance
          -
          minDistance
        );


      particle.style.setProperty(
        "--x",
        `${Math.cos(angle) * distance}px`
      );


      particle.style.setProperty(
        "--y",
        `${Math.sin(angle) * distance}px`
      );


      particle.style.setProperty(
        "--size",
        `${3 + Math.random() * 5}px`
      );


      particle.style.setProperty(
        "--delay",
        `${Math.random() * 120}ms`
      );


      particle.style.setProperty(
        "--rotation",
        `${Math.random() * 720}deg`
      );


      particle.style.setProperty(
        "--particle-color",
        fireworkColors[
          Math.floor(
            Math.random()
            *
            fireworkColors.length
          )
        ]
      );


      fragment.appendChild(
        particle
      );
    }


    target.appendChild(
      fragment
    );


    setTimeout(
      () => {

        target.replaceChildren();

      },
      cleanup
    );
  }


  function playPage06Entrance() {

    if (!page06) {

      return;
    }


    clearTimeout(
      page06EntryTimer
    );


    page06
      .classList
      .remove(
        "is-confetti-visible"
      );


    spawnFireworks(
      page06EntryFireworks,
      {
        count:
          145,

        minDistance:
          75,

        maxDistance:
          240,

        cleanup:
          1750
      }
    );


    page06EntryTimer =
      setTimeout(
        () => {

          if (
            page06
              .classList
              .contains(
                "is-active"
              )
          ) {

            page06
              .classList
              .add(
                "is-confetti-visible"
              );
          }

        },
        480
      );
  }


  /* =======================================================
     PAGE ACTIVATION
  ======================================================= */

  function activatePage(index) {

    const safeIndex =
      Math.max(
        0,
        Math.min(
          index,
          pages.length - 1
        )
      );


    pages.forEach(
      (
        page,
        pageIndex
      ) => {

        const active =
          pageIndex ===
          safeIndex;


        page.classList.toggle(
          "is-active",
          active
        );


        if (
          page ===
          page06
          &&
          !active
        ) {

          page
            .classList
            .remove(
              "is-confetti-visible"
            );
        }
      }
    );


    if (
      pages[
        safeIndex
      ] ===
      page02Layout
    ) {

      playPage02Entrance();


      if (
        !guestDataLoaded
      ) {

        loadGuestPersonalization(
          true
        );
      }


      if (
        currentGuestData
        ?.displayName
      ) {

        renderGuestDisplayName(
          currentGuestData
            .displayName
        );
      }
    }


    if (
      pages[
        safeIndex
      ] ===
      page06
    ) {

      requestAnimationFrame(
        playPage06Entrance
      );
    }
  }


  function setNearbyPages(index) {

    const safeIndex =
      Math.max(
        0,
        Math.min(
          index,
          pages.length - 1
        )
      );


    pages.forEach(
      (
        page,
        pageIndex
      ) => {

        page.classList.toggle(
          "is-nearby",
          Math.abs(
            pageIndex
            -
            safeIndex
          ) <=
            1
        );
      }
    );


    loadPage(
      pages[
        safeIndex
      ],
      "high"
    );


    if (
      pages[
        safeIndex + 1
      ]
    ) {

      /*
        Stagger next-page preloading a little so decorative assets
        của page hiện tại không phải cạnh tranh network ngay lập tức.
      */
      runWhenIdle(
        () => {

          loadPage(
            pages[
              safeIndex + 1
            ],
            "low"
          );
        },
        420
      );
    }
  }


  function getCurrentPageIndex() {

    if (
      !pageScroller
    ) {

      return 0;
    }


    return Math.max(
      0,
      Math.min(
        pages.length - 1,
        Math.round(
          pageScroller.scrollTop
          /
          DESIGN_HEIGHT
        )
      )
    );
  }


  function onPageScroll() {

    if (
      scrollRaf
    ) {

      return;
    }


    scrollRaf =
      requestAnimationFrame(
        () => {

          scrollRaf =
            0;


          const index =
            getCurrentPageIndex();


          if (
            index !==
            activePageIndex
          ) {

            activePageIndex =
              index;


            setNearbyPages(
              index
            );


            activatePage(
              index
            );
          }
        }
      );
  }


  pageScroller
    ?.addEventListener(
      "scroll",
      onPageScroll,
      {
        passive: true
      }
    );


  /* =======================================================
     BACKGROUND MUSIC
  ======================================================= */

  function updateMusicToggle(
    playing
  ) {

    if (
      !musicToggle
    ) {

      return;
    }


    musicToggle.hidden =
      false;


    musicToggle
      .classList
      .toggle(
        "is-playing",
        Boolean(
          playing
        )
      );


    musicToggle
      .classList
      .toggle(
        "is-muted",
        !playing
      );


    musicToggle.setAttribute(
      "aria-pressed",
      playing
      ?
      "true"
      :
      "false"
    );


    musicToggle.setAttribute(
      "aria-label",
      playing
      ?
      "Tắt nhạc"
      :
      "Bật nhạc"
    );


    requestAnimationFrame(
      () => {

        musicToggle
          .classList
          .add(
            "is-visible"
          );
      }
    );
  }


  function fadeWeddingMusic(
    targetVolume,
    duration = 800,
    onComplete = null
  ) {

    if (
      !weddingMusic
    ) {

      return;
    }


    cancelAnimationFrame(
      musicFadeRaf
    );


    const from =
      Number(
        weddingMusic.volume
      );


    const target =
      Math.max(
        0,
        Math.min(
          1,
          Number(
            targetVolume
          )
        )
      );


    const start =
      performance.now();


    function step(now) {

      const progress =
        Math.min(
          (
            now - start
          )
          /
          Math.max(
            1,
            duration
          ),
          1
        );


      const eased =
        1
        -
        Math.pow(
          1 - progress,
          3
        );


      weddingMusic.volume =
        from
        +
        (
          target - from
        )
        *
        eased;


      if (
        progress <
        1
      ) {

        musicFadeRaf =
          requestAnimationFrame(
            step
          );

        return;
      }


      if (
        typeof onComplete ===
        "function"
      ) {

        onComplete();
      }
    }


    musicFadeRaf =
      requestAnimationFrame(
        step
      );
  }


  function ensureWeddingMusicSource() {

    if (
      !weddingMusic
      ||
      weddingMusic.getAttribute(
        "src"
      )
    ) {

      return;
    }


    const src =
      String(
        weddingMusic.dataset.src
        ||
        ""
      ).trim();


    if (!src) {

      return;
    }


    weddingMusic.src =
      src;


    weddingMusic.load();
  }


  function startWeddingMusic() {

    if (
      !weddingMusic
    ) {

      return;
    }


    ensureWeddingMusicSource();


    cancelAnimationFrame(
      musicFadeRaf
    );


    weddingMusic.volume =
      .02;


    const playPromise =
      weddingMusic.play();


    musicStarted =
      true;


    updateMusicToggle(
      true
    );


    if (
      playPromise
      &&
      typeof playPromise.then ===
        "function"
    ) {

      playPromise
        .then(
          () => {

            fadeWeddingMusic(
              MUSIC_VOLUME,
              1800
            );
          }
        )
        .catch(
          () => {

            /*
              Một số in-app browser vẫn có thể chặn play().
              Khi đó giữ nút nhạc visible để khách tự chạm bật.
            */

            musicStarted =
              false;


            weddingMusic.pause();


            updateMusicToggle(
              false
            );
          }
        );


    } else {

      fadeWeddingMusic(
        MUSIC_VOLUME,
        1800
      );
    }
  }


  function pauseWeddingMusic() {

    if (
      !weddingMusic
    ) {

      return;
    }


    updateMusicToggle(
      false
    );


    fadeWeddingMusic(
      0,
      320,
      () => {

        weddingMusic.pause();
      }
    );
  }


  function resumeWeddingMusic() {

    if (
      !weddingMusic
    ) {

      return;
    }


    ensureWeddingMusicSource();


    cancelAnimationFrame(
      musicFadeRaf
    );


    weddingMusic.volume =
      Math.min(
        weddingMusic.volume,
        .03
      );


    const playPromise =
      weddingMusic.play();


    updateMusicToggle(
      true
    );


    if (
      playPromise
      &&
      typeof playPromise.then ===
        "function"
    ) {

      playPromise
        .then(
          () => {

            musicStarted =
              true;


            fadeWeddingMusic(
              MUSIC_VOLUME,
              900
            );
          }
        )
        .catch(
          () => {

            musicStarted =
              false;


            updateMusicToggle(
              false
            );
          }
        );


    } else {

      musicStarted =
        true;


      fadeWeddingMusic(
        MUSIC_VOLUME,
        900
      );
    }
  }


  musicToggle
    ?.addEventListener(
      "click",
      () => {

        if (
          weddingMusic
          &&
          !weddingMusic.paused
        ) {

          pauseWeddingMusic();

          return;
        }


        resumeWeddingMusic();
      }
    );


  /* =======================================================
     OPEN INVITATION
  ======================================================= */

  async function enterInvitation() {

    if (
      pageMode
    ) {

      return;
    }


    pageMode =
      true;


    loadGuestPersonalization();


    /*
      V27: Page 02 đã được nén còn khoảng 0.45 MB.

      Vẫn chờ toàn bộ ảnh / sprite load + decode xong trước khi
      activate page để giữ hiển thị tuyệt đối ổn định, nhưng khối
      lượng tải nhỏ hơn rất nhiều so với PNG gốc.
    */

    const fullPage02Promise =
      loadPage(
        pages[0],
        "high"
      );


    const criticalPage02Promise =
      loadPageCritical(
        pages[0],
        "high"
      );


    await Promise.all(
      [
        fullPage02Promise,
        criticalPage02Promise
      ]
    );


    if (
      pageScroller
    ) {

      pageScroller.scrollTop =
        0;


      pageScroller.setAttribute(
        "aria-hidden",
        "false"
      );
    }


    siteShell
      ?.classList
      .add(
        "is-page-02"
      );


    activePageIndex =
      0;


    setNearbyPages(
      0
    );


    activatePage(
      0
    );
}


  openingCardButton
    ?.addEventListener(
      "pointerdown",
      () => {

        loadPage(
          pages[0],
          "high"
        );
      },
      {
        passive: true
      }
    );


  openingCardButton
    ?.addEventListener(
      "click",
      (event) => {

        event.preventDefault();


        /*
          Gọi play() trực tiếp trong user gesture để iPhone,
          Chrome và Messenger cho phép phát audio.
        */
        startWeddingMusic();


        enterInvitation();
      }
    );


  runWhenIdle(
    () => {

      /*
        V27: asset Page 02 sau tối ưu chỉ còn khoảng 0.45 MB.
        Vì vậy có thể preload toàn bộ page ở low priority ngay khi
        opening page đã ổn định. Khi khách bấm mở thiệp, toàn bộ
        background / frame / cloud / confetti / procession thường
        đã có sẵn trong cache và transition sẽ không bị pop/giật.
      */
      loadPage(
        pages[0],
        "low"
      );

    },
    650
  );


  /* =======================================================
     LUCKY STORAGE
  ======================================================= */

  function getLuckyStorageKey() {

    return currentGuestSlug
      ?
      `bach-thu-lucky-${currentGuestSlug}`
      :
      "";
  }


  function readLocalLuckyNumber() {

    if (
      isLuckyTestGuest()
    ) {

      return null;
    }


    const key =
      getLuckyStorageKey();


    if (!key) {

      return null;
    }


    try {

      const value =
        Number(
          localStorage.getItem(
            key
          )
        );


      if (
        Number.isInteger(
          value
        )
        &&
        value >=
          LUCKY_MIN
        &&
        value <=
          LUCKY_MAX
      ) {

        return value;
      }


    } catch (_) {}


    return null;
  }


  function saveLocalLuckyNumber(
    value
  ) {

    if (
      isLuckyTestGuest()
    ) {

      return;
    }


    const key =
      getLuckyStorageKey();


    if (!key) {

      return;
    }


    try {

      localStorage.setItem(
        key,
        String(
          value
        )
      );

    } catch (_) {}
  }


  /* =======================================================
     LUCKY UI
  ======================================================= */

  function randomLuckyNumber() {

    const range =
      LUCKY_MAX
      -
      LUCKY_MIN
      +
      1;


    if (
      window.crypto
      ?.getRandomValues
    ) {

      const array =
        new Uint32Array(
          1
        );


      window.crypto
        .getRandomValues(
          array
        );


      return (
        LUCKY_MIN
        +
        array[0]
        %
        range
      );
    }


    return (
      LUCKY_MIN
      +
      Math.floor(
        Math.random()
        *
        range
      )
    );
  }


  function showLuckyNumber(
    value
  ) {

    if (
      !luckyNumber
    ) {

      return;
    }


    luckyNumber.textContent =
      String(
        value
      )
        .padStart(
          2,
          "0"
        );
  }


  function stopLuckyIdleShuffle() {

    if (
      luckyIdleTimer !==
      null
    ) {

      clearInterval(
        luckyIdleTimer
      );


      luckyIdleTimer =
        null;
    }


    luckyCard
      ?.classList
      .remove(
        "is-idle-shuffling"
      );
  }


  function startLuckyIdleShuffle() {

    if (
      !luckyCard
      ||
      luckyLocked
      ||
      luckyRolling
    ) {

      return;
    }


    stopLuckyIdleShuffle();


    luckyCard
      .classList
      .add(
        "is-idle-shuffling"
      );


    luckyIdleTimer =
      setInterval(
        () => {

          showLuckyNumber(
            randomLuckyNumber()
          );

        },
        116
      );
  }


  function lockLuckyNumber(
    value,
    animate = false
  ) {

    const number =
      Number(
        value
      );


    if (
      !Number.isInteger(
        number
      )
      ||
      number <
        LUCKY_MIN
      ||
      number >
        LUCKY_MAX
    ) {

      return;
    }


    stopLuckyIdleShuffle();


    luckyLocked =
      true;


    luckyRolling =
      false;


    showLuckyNumber(
      number
    );


    saveLocalLuckyNumber(
      number
    );


    luckyCard
      ?.classList
      .remove(
        "is-rolling",
        "is-idle-shuffling"
      );


    if (
      animate
      &&
      luckyCard
    ) {

      luckyCard
        .classList
        .remove(
          "is-revealed"
        );


      void luckyCard.offsetWidth;


      luckyCard
        .classList
        .add(
          "is-revealed"
        );
    }


    if (
      luckyHint
    ) {

      luckyHint.textContent =
        LUCKY_HINT_REVEALED;
    }


    if (
      luckyTrigger
    ) {

      luckyTrigger.disabled =
        true;
    }
  }


  function fireLuckyFireworks() {

    spawnFireworks(
      luckyFireworks,
      {
        count:
          125,

        minDistance:
          65,

        maxDistance:
          210,

        cleanup:
          1850
      }
    );
  }


  function fireLuckyPartyBurst() {

    spawnFireworks(
      luckyFireworks,
      {
        count:
          26,

        minDistance:
          34,

        maxDistance:
          105,

        cleanup:
          780
      }
    );
  }


  /* =======================================================
     READ AUTHORITATIVE LUCKY NUMBER FROM SHEET

     Poll vài lần vì POST có thể ghi xong
     chậm hơn browser một chút.
  ======================================================= */

  async function readLuckyAfterSave(
    candidate
  ) {

    const delays = [
      350,
      700,
      1200,
      1800
    ];


    for (
      const delay of delays
    ) {

      await sleep(
        delay
      );


      try {

        const guest =
          await requestGuestData();


        const number =
          Number(
            guest
              ?.luckyNumber
          );


        if (
          Number.isInteger(
            number
          )
          &&
          number >=
            LUCKY_MIN
          &&
          number <=
            LUCKY_MAX
        ) {

          return number;
        }


      } catch (error) {

        console.warn(
          "[Wedding] lucky readback:",
          error
        );
      }
    }


    /*
      Không fallback candidate.

      Nếu hai thiết bị cùng roll gần như đồng thời,
      backend sẽ chỉ lưu số đầu tiên nhờ LockService.
      Frontend chỉ khóa số sau khi đọc lại cột I từ Sheet.
    */

    return null;
  }


  /* =======================================================
     ROLL LUCKY

     1. Sinh candidate ở browser.
     2. POST saveLucky.
     3. Đọc lại cột I từ Sheet.
     4. Hiện số authoritative.
  ======================================================= */

  async function rollLuckyNumber() {

    if (
      luckyRolling
      ||
      luckyLocked
    ) {

      return;
    }


    if (
      !currentGuestSlug
    ) {

      alert(
        "Link thiệp chưa có mã khách mời."
      );

      return;
    }


    /*
      guest=test bỏ qua khóa để test tự do.

      Khách thật luôn đọc Sheet thêm một lần ngay trước khi roll.
      Điều này chặn trường hợp mở link trên browser/điện thoại khác
      trong khi localStorage của thiết bị đó chưa có số.
    */
    if (
      !isLuckyTestGuest()
    ) {

      setLuckyAuthorityPending(
        "Đang kiểm tra số may mắn..."
      );


      const latestGuest =
        await loadGuestPersonalization(
          true
        );


      if (
        !latestGuest
        ||
        latestGuest.ok !==
          true
      ) {

        setLuckyAuthorityPending(
          "Không thể kiểm tra số may mắn. Vui lòng thử lại sau."
        );

        return;
      }


      const existingLucky =
        Number(
          latestGuest.luckyNumber
        );


      if (
        isValidLuckyValue(
          existingLucky
        )
      ) {

        luckyAuthorityReady =
          true;


        lockLuckyNumber(
          existingLucky,
          false
        );

        return;
      }


      luckyAuthorityReady =
        true;
    }


    if (
      !isLuckyTestGuest()
      &&
      !luckyAuthorityReady
    ) {

      setLuckyAuthorityPending();

      return;
    }


    stopLuckyIdleShuffle();


    luckyRolling =
      true;


    luckyCard
      ?.classList
      .remove(
        "is-revealed"
      );


    luckyCard
      ?.classList
      .add(
        "is-rolling"
      );


    if (
      luckyHint
    ) {

      luckyHint.textContent =
        "Đang tìm số may mắn...";
    }


    const candidate =
      randomLuckyNumber();


    /*
      Backend:
      nếu I đã có -> không overwrite.
      nếu I trống -> lưu candidate.
    */

    const testRoll =
      isLuckyTestGuest();


    const savePromise =
      testRoll
      ?
      Promise.resolve(
        {
          ok: true,
          luckyNumber:
            candidate,
          testMode:
            true
        }
      )
      :
      postToBackend(
        {
          action:
            "saveLucky",

          guest:
            currentGuestSlug,

          luckyNumber:
            candidate
        }
      );


    const start =
      performance.now();


    const duration =
      760;


    /*
      Hai nhịp pháo nhỏ trong lúc random để cảm giác tưng bừng,
      còn pháo lớn vẫn nổ lúc reveal số cuối.
    */

    fireLuckyPartyBurst();


    window.setTimeout(
      () => {

        if (
          luckyRolling
          &&
          luckyCard
            ?.classList
            .contains(
              "is-rolling"
            )
        ) {

          fireLuckyPartyBurst();
        }
      },
      360
    );


    /*
      Giữ nhịp đổi số mượt tới cuối.

      Bản cũ tăng interval lên gần 190ms ở cuối,
      nên mắt thấy số bị khựng/giật trước khi dừng.

      Bản này:
      - random nhanh gần như đều
      - không lặp lại cùng một số ở hai nhịp liên tiếp
      - chỉ chậm rất nhẹ ngay sát điểm dừng
      - khi hết animation sẽ dừng hẳn ở candidate
        trong lúc chờ Sheet trả số authoritative
    */

    let lastUpdate =
      0;


    let finishStarted =
      false;


    let rollingNumber =
      null;


    function nextRollingNumber() {

      let next =
        randomLuckyNumber();


      /*
        Tránh random trùng đúng số vừa hiện.
        Nếu trùng, mắt sẽ thấy như animation bị khựng dù RAF vẫn chạy.
      */

      while (
        next ===
          rollingNumber
      ) {

        next =
          randomLuckyNumber();
      }


      rollingNumber =
        next;


      return next;
    }


    function frame(now) {

      const elapsed =
        now - start;


      const progress =
        Math.min(
          elapsed
          /
          duration,
          1
        );


      /*
        Roll nhanh gần như đều từ đầu tới cuối.
        Chỉ chậm rất nhẹ ở ~15% cuối để người xem kịp cảm nhận
        khoảnh khắc "chốt số", nhưng không còn kiểu khựng dần.
      */

      const interval =
        progress <
          .85
        ?
        30
        :
        38;


      if (
        now - lastUpdate >=
        interval
      ) {

        lastUpdate =
          now;


        showLuckyNumber(
          nextRollingNumber()
        );
      }


      if (
        progress <
        1
      ) {

        requestAnimationFrame(
          frame
        );

        return;
      }


      /*
        Chốt candidate ngay ở cuối animation để UI không
        tiếp tục nhảy số hoặc khựng trong lúc chờ backend.
      */

      showLuckyNumber(
        candidate
      );


      if (
        !finishStarted
      ) {

        finishStarted =
          true;


        finishLucky();
      }
    }


    async function finishLucky() {

      try {

        await savePromise;


        if (
          testRoll
        ) {

          luckyRolling =
            false;


          luckyLocked =
            false;


          luckyCard
            ?.classList
            .remove(
              "is-rolling"
            );


          luckyCard
            ?.classList
            .remove(
              "is-revealed"
            );


          void luckyCard?.offsetWidth;


          luckyCard
            ?.classList
            .add(
              "is-revealed"
            );


          showLuckyNumber(
            candidate
          );


          if (
            luckyHint
          ) {

            luckyHint.textContent =
              "Chế độ test — nhấn để roll lại";
          }


          if (
            luckyTrigger
          ) {

            luckyTrigger.disabled =
              false;
          }


          fireLuckyFireworks();


          return;
        }


        const finalNumber =
          await readLuckyAfterSave(
            candidate
          );


        if (
          !isValidLuckyValue(
            finalNumber
          )
        ) {

          luckyRolling =
            false;


          luckyLocked =
            false;


          luckyAuthorityReady =
            false;


          luckyCard
            ?.classList
            .remove(
              "is-rolling"
            );


          setLuckyAuthorityPending(
            "Đang đồng bộ số may mắn. Nhấn lại sau vài giây."
          );


          return;
        }


        luckyAuthorityReady =
          true;


        lockLuckyNumber(
          finalNumber,
          true
        );


        fireLuckyFireworks();


      } catch (error) {

        console.error(
          "[Wedding] lucky:",
          error
        );


        luckyRolling =
          false;


        luckyCard
          ?.classList
          .remove(
            "is-rolling"
          );


        if (
          luckyHint
        ) {

          luckyHint.textContent =
            "Nhấn để thử lại";
        }


        startLuckyIdleShuffle();
      }
    }


    requestAnimationFrame(
      frame
    );
  }


  luckyTrigger
    ?.addEventListener(
      "click",
      rollLuckyNumber
    );


  /* =======================================================
     RSVP
  ======================================================= */

  function updateCount() {

    if (
      rsvpGuestCount
    ) {

      rsvpGuestCount.textContent =
        String(
          rsvpCount
        );
    }
  }


  function updateAttendanceNoLabel() {

    if (
      !rsvpAttendanceNoText
    ) {

      return;
    }


    rsvpAttendanceNoText.textContent =
      rsvpAttendanceNo
        ?.checked
        ?
        "Kó"
        :
        "Không";
  }


  function setSubmitText(
    text
  ) {

    const span =
      rsvpSubmit
        ?.querySelector(
          "span"
        );


    if (
      span
    ) {

      span.textContent =
        text;
    }
  }


  rsvpMinus
    ?.addEventListener(
      "click",
      () => {

        if (
          rsvpAttendanceNo
            ?.checked
        ) {

          return;
        }


        rsvpCount =
          Math.max(
            1,
            rsvpCount - 1
          );


        updateCount();
      }
    );


  rsvpPlus
    ?.addEventListener(
      "click",
      () => {

        if (
          rsvpAttendanceNo
            ?.checked
        ) {

          return;
        }


        rsvpCount =
          Math.min(
            10,
            rsvpCount + 1
          );


        updateCount();
      }
    );


  rsvpAttendanceNo
    ?.addEventListener(
      "change",
      () => {

        if (
          rsvpAttendanceNo.checked
        ) {

          rsvpCount =
            0;


          updateCount();
        }


        updateAttendanceNoLabel();
      }
    );


  rsvpAttendanceYes
    ?.addEventListener(
      "change",
      () => {

        if (
          rsvpAttendanceYes.checked
          &&
          rsvpCount < 1
        ) {

          rsvpCount =
            1;


          updateCount();
        }


        updateAttendanceNoLabel();
      }
    );


  /* =======================================================
     VIDEO -> FOLDER DRIVE RIÊNG CỦA TỪNG KHÁCH

     Folder đã được tạo sẵn bằng Apps Script và URL đã nằm
     trong cột N. Khi khách bấm, trình duyệt mở link đó ngay.
  ======================================================= */

  function handleVideoLinkClick(event) {

    if (
      !currentGuestSlug
    ) {

      event.preventDefault();

      alert(
        "Link thiệp này chưa có mã khách mời."
      );

      return;
    }


    const videoUrl =
      String(
        currentGuestData
          ?.video
        ||
        rsvpVideoLink
          ?.getAttribute(
            "href"
          )
        ||
        ""
      )
        .trim();


    if (
      isDriveFolderUrl(
        videoUrl
      )
    ) {

      /*
        Không preventDefault ở đây.
        Anchor đã có target=_blank nên folder mở ngay,
        không phải chờ backend và không có popup trung gian.
      */

      return;
    }


    event.preventDefault();

    alert(
      "Thư mục video của bạn chưa được tạo. Cô dâu chú rể vui lòng chạy menu tạo folder video trong Google Sheet."
    );
  }


  if (
    rsvpVideoField
  ) {

    rsvpVideoField.addEventListener(
      "click",
      handleVideoLinkClick
    );
  }


  /* =======================================================
     BACKGROUND REFRESH
  ======================================================= */

  async function backgroundRefreshGuestData() {

    await sleep(
      900
    );


    try {

      const response =
        await requestGuestData();


      if (
        !response
        ||
        response.ok !==
          true
      ) {

        return;
      }


      currentGuestData =
        response;


      if (
        response.displayName
      ) {

        renderGuestDisplayName(
          response.displayName
        );
      }


    } catch (error) {

      console.warn(
        "[Wedding] background refresh:",
        error
      );
    }
  }


  /* =======================================================
     RSVP SUBMIT
  ======================================================= */

  rsvpForm
    ?.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();


        clearTimeout(
          submitResetTimer
        );


        const name =
          normalizeText(
            rsvpGuestName
              ?.value
              .trim()
            ||
            ""
          );


        const message =
          normalizeText(
            rsvpMessage
              ?.value
              .trim()
            ||
            ""
          );


        const isNo =
          Boolean(
            rsvpAttendanceNo
              ?.checked
          );


        const attendance =
          isNo
            ?
            "no"
            :
            "yes";


        const guestCount =
          isNo
            ?
            0
            :
            Math.max(
              1,
              rsvpCount
            );


        if (!name) {

          alert(
            "Bạn nhập tên khách mời giúp chúng mình nhé."
          );

          return;
        }


        if (
          !currentGuestSlug
        ) {

          alert(
            "Link thiệp này chưa có mã khách mời."
          );

          return;
        }


        if (
          !rsvpSubmit
        ) {

          return;
        }


        rsvpSubmit.disabled =
          true;


        setSubmitText(
          "ĐANG GỬI..."
        );


        try {

          await postToBackend(
            {
              action:
                "rsvp",

              guest:
                currentGuestSlug,

              name:
                name,

              attendance:
                attendance,

              guestCount:
                guestCount,

              message:
                message
            }
          );


          rsvpCount =
            guestCount;


          updateCount();


          setSubmitText(
            "ĐÃ GỬI XÁC NHẬN"
          );


          rsvpSubmit.disabled =
            false;


          submitResetTimer =
            setTimeout(
              () => {

                if (
                  !rsvpSubmit.disabled
                ) {

                  setSubmitText(
                    "CẬP NHẬT XÁC NHẬN"
                  );
                }

              },
              1800
            );


          backgroundRefreshGuestData();


        } catch (error) {

          console.error(
            "[Wedding] RSVP:",
            error
          );


          rsvpSubmit.disabled =
            false;


          setSubmitText(
            "GỬI XÁC NHẬN"
          );


          alert(
            "Không thể kết nối để gửi xác nhận. Bạn vui lòng thử lại."
          );
        }
      }
    );


  /* =======================================================
     MARK OPENED
  ======================================================= */

  function markInvitationOpened() {

    if (
      !currentGuestSlug
    ) {

      return;
    }


    postToBackend(
      {
        action:
          "markOpened",

        guest:
          currentGuestSlug
      }
    )
      .catch(
        (error) => {

          console.warn(
            "[Wedding] mark opened:",
            error
          );
        }
      );
  }


  /* =======================================================
     INIT
  ======================================================= */

  updateCount();

  updateAttendanceNoLabel();


  const localLucky =
    readLocalLuckyNumber();


  if (
    isLuckyTestGuest()
  ) {

    luckyAuthorityReady =
      true;


    luckyLocked =
      false;


    if (
      luckyTrigger
    ) {

      luckyTrigger.disabled =
        false;
    }


    startLuckyIdleShuffle();


  } else {

    /*
      Browser hiện tại có cache thì hiển thị nhanh số cũ.
      Browser/device mới không có cache vẫn được xem idle shuffle,
      nhưng nút bị khóa tới khi Sheet xác nhận cột I đang trống.
    */
    if (
      localLucky
    ) {

      lockLuckyNumber(
        localLucky,
        false
      );


    } else {

      startLuckyIdleShuffle();


      setLuckyAuthorityPending(
        "Đang kiểm tra số may mắn..."
      );
    }
  }


  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.hidden
      ) {

        stopLuckyIdleShuffle();

        return;
      }


      if (
        !luckyLocked
        &&
        !luckyRolling
      ) {

        startLuckyIdleShuffle();
      }
    }
  );


  markInvitationOpened();


  /*
    Từ đây trở đi:
    READ = Google Sheet GViz
    WRITE = Apps Script POST
  */

  loadGuestPersonalization()
    .then(
      (guest) => {

        if (
          !guest
          &&
          !isLuckyTestGuest()
          &&
          !luckyLocked
        ) {

          setLuckyAuthorityPending(
            "Không thể kiểm tra số may mắn. Vui lòng thử lại sau."
          );
        }
      }
    );

})();
