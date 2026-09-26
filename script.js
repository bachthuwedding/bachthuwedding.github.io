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

  const GVIZ_QUERY =
    "select D,F,G,H,I,J,K,L,M,N";

  const LUCKY_HINT_REVEALED =
    "Hãy giữ con số may mắn của bạn tới ngày cưới của chúng mình nhé!";

  const VIDEO_FOLDER_WAIT_DELAYS = [
    350,
    650,
    1000,
    1500,
    2200
  ];


  /* =======================================================
     GUEST FROM URL
  ======================================================= */

  const urlParams =
    new URLSearchParams(
      window.location.search
    );

  const currentGuestSlug =
    normalizeGuestSlug(
      urlParams.get("guest") || ""
    );


  function normalizeGuestSlug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
  }


  function slugifyGuestName(value) {
    return String(value || "")
      .trim()
      .replace(/Đ/g, "D")
      .replace(/đ/g, "d")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-");
  }


  function normalizeText(value) {
    return String(value ?? "")
      .normalize("NFC");
  }


  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }


  function isDriveFolderUrl(value) {
    return /^https:\/\/drive\.google\.com\/drive\/folders\/[A-Za-z0-9_-]+/i
      .test(String(value || "").trim());
  }


  /* =======================================================
     DOM
  ======================================================= */

  const root =
    document.documentElement;

  const siteShell =
    document.getElementById("siteShell");

  const openingCardButton =
    document.getElementById("openingCardButton");

  const pageScroller =
    document.getElementById("page02");

  const page02Layout =
    document.getElementById("page02Layout");

  const page03 =
    document.getElementById("page03");

  const page04 =
    document.getElementById("page04");

  const page05 =
    document.getElementById("page05");

  const page06 =
    document.getElementById("page06");

  const page07 =
    document.getElementById("page07");

  const page08 =
    document.getElementById("page08");

  const pages = [
    page02Layout,
    page03,
    page04,
    page05,
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


  /*
    index.html mới có:

    id="rsvpVideoLink"
  */

  const rsvpVideoLink =
    document.getElementById(
      "rsvpVideoLink"
    );

  const rsvpVideoField =
    rsvpVideoLink ||
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

  let resizeRaf = 0;

  let scrollRaf = 0;

  let activePageIndex = -1;

  let luckyIdleTimer = null;

  let luckyRolling = false;

  let luckyLocked = false;

  let rsvpCount = 1;

  let page06EntryTimer = null;

  let submitResetTimer = null;

  let currentGuestData = null;

  let guestDataLoaded = false;

  let guestLoadPromise = null;


  /* =======================================================
     GOOGLE SHEET GVIZ

     READ:
     D,F,G,H,I,J,K,L,M,N

     D = tên khách
     F = tên hiển thị trên thiệp
     G = link thiệp
     H = đã đọc
     I = số may mắn
     J = tên RSVP
     K = attendance
     L = guest count
     M = lời nhắn
     N = folder video
  ======================================================= */

  function gvizRequest(timeout = 20000) {
    return new Promise(
      (resolve, reject) => {

        const callbackName =
          "__bachThuSheet" +
          Date.now() +
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
          if (finished) {
            return;
          }

          finished = true;

          if (timer !== null) {
            clearTimeout(timer);
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
        ] = (response) => {

          cleanup();

          if (!response) {
            reject(
              new Error(
                "Google Sheet không trả dữ liệu."
              )
            );
            return;
          }

          if (
            response.status &&
            response.status !== "ok"
          ) {
            console.error(
              "[Wedding] GViz:",
              response
            );

            reject(
              new Error(
                "Google Sheet trả về lỗi truy vấn."
              )
            );

            return;
          }

          resolve(response);
        };


        script.onerror = () => {
          cleanup();

          reject(
            new Error(
              "Không tải được dữ liệu trực tiếp từ Google Sheet."
            )
          );
        };


        const tqx =
          `responseHandler:${callbackName}`;

        const url =
          "https://docs.google.com/spreadsheets/d/" +
          encodeURIComponent(
            SPREADSHEET_ID
          ) +
          "/gviz/tq" +
          "?sheet=" +
          encodeURIComponent(
            SHEET_NAME
          ) +
          "&headers=1" +
          "&tq=" +
          encodeURIComponent(
            GVIZ_QUERY
          ) +
          "&tqx=" +
          encodeURIComponent(
            tqx
          ) +
          "&t=" +
          Date.now();


        script.async = true;

        script.src = url;


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


  function getGvizCell(
    row,
    columnIndex
  ) {
    if (
      !row ||
      !Array.isArray(row.c)
    ) {
      return "";
    }

    const cell =
      row.c[columnIndex];

    if (!cell) {
      return "";
    }

    if (
      cell.v !== undefined &&
      cell.v !== null
    ) {
      return cell.v;
    }

    if (
      cell.f !== undefined &&
      cell.f !== null
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
      !row ||
      !Array.isArray(row.c)
    ) {
      return "";
    }

    const cell =
      row.c[columnIndex];

    if (!cell) {
      return "";
    }

    if (
      cell.f !== undefined &&
      cell.f !== null
    ) {
      return cell.f;
    }

    if (
      cell.v !== undefined &&
      cell.v !== null
    ) {
      return cell.v;
    }

    return "";
  }


  function extractGuestSlugFromLink(
    link
  ) {
    const match =
      String(link || "")
        .match(
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
     FIND GUEST
  ======================================================= */

  function findGuestInGvizResponse(
    response
  ) {
    const rows =
      response
        ?.table
        ?.rows;

    if (!Array.isArray(rows)) {
      throw new Error(
        "Google Sheet không có danh sách khách."
      );
    }


    /*
      Ưu tiên tìm theo link thiệp cột G.
    */

    for (
      let i = 0;
      i < rows.length;
      i += 1
    ) {
      const row = rows[i];

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
        slug &&
        slug === currentGuestSlug
      ) {
        return parseGuestRow(
          row,
          i
        );
      }
    }


    /*
      Fallback theo D.
    */

    const duplicateCounter =
      Object.create(null);


    for (
      let i = 0;
      i < rows.length;
      i += 1
    ) {
      const row = rows[i];

      const guestName =
        String(
          getGvizDisplayCell(
            row,
            0
          ) || ""
        ).trim();

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
          ] || 0
        ) + 1;


      const occurrence =
        duplicateCounter[
          baseSlug
        ];


      const slug =
        occurrence === 1
          ? baseSlug
          : `${baseSlug}-${occurrence}`;


      if (
        slug === currentGuestSlug
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


  function parseGuestRow(
    row,
    rowIndex
  ) {
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

    const luckyNumberValue =
      Number(
        luckyRaw
      );

    const guestCount =
      Number(
        guestCountRaw
      );


    return {
      ok: true,

      guest:
        currentGuestSlug,

      row:
        rowIndex + 2,

      /*
        D
      */

      name:
        normalizeText(
          getGvizDisplayCell(
            row,
            0
          )
        ).trim(),

      /*
        F
      */

      displayName:
        normalizeText(
          getGvizDisplayCell(
            row,
            1
          )
        ).trim(),

      displayNameSource:
        "F / Google Sheet GViz",

      /*
        G
      */

      inviteLink:
        String(
          getGvizDisplayCell(
            row,
            2
          ) || ""
        ),

      /*
        I
      */

      luckyNumber:
        Number.isInteger(
          luckyNumberValue
        )
          ? luckyNumberValue
          : "",

      /*
        J
      */

      rsvpName:
        normalizeText(
          getGvizDisplayCell(
            row,
            5
          )
        ).trim(),

      /*
        K
      */

      attendance:
        normalizeText(
          getGvizDisplayCell(
            row,
            6
          )
        ).trim(),

      /*
        L
      */

      guestCount:
        Number.isFinite(
          guestCount
        )
          ? guestCount
          : "",

      /*
        M
      */

      message:
        normalizeText(
          getGvizDisplayCell(
            row,
            8
          )
        ),

      /*
        N
      */

      video:
        String(
          getGvizDisplayCell(
            row,
            9
          ) || ""
        ).trim()
    };
  }


  async function requestGuestData() {
    if (!currentGuestSlug) {
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
  ======================================================= */

  async function postToBackend(
    data
  ) {
    const body =
      new URLSearchParams();


    Object.entries(data)
      .forEach(
        ([key, value]) => {

          if (
            value === undefined ||
            value === null
          ) {
            return;
          }

          body.append(
            key,
            String(value)
          );
        }
      );


    await fetch(
      WEDDING_API_URL,
      {
        method: "POST",

        mode: "no-cors",

        cache: "no-store",

        redirect: "follow",

        credentials: "omit",

        body
      }
    );
  }


  /* =======================================================
     SCALE
  ======================================================= */

  function updateScale() {
    const viewport =
      window.visualViewport;

    const viewportWidth =
      viewport?.width ||
      window.innerWidth;

    const viewportHeight =
      viewport?.height ||
      window.innerHeight;

    const scale =
      Math.min(
        viewportWidth /
          DESIGN_WIDTH,

        viewportHeight /
          DESIGN_HEIGHT
      );


    root.style.setProperty(
      "--design-scale",
      String(scale)
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


  updateScale();


  window.addEventListener(
    "resize",
    scheduleScale,
    {
      passive: true
    }
  );


  window.visualViewport
    ?.addEventListener(
      "resize",
      scheduleScale,
      {
        passive: true
      }
    );


  /* =======================================================
     SCROLL OUTSIDE INVITATION
  ======================================================= */

  window.addEventListener(
    "wheel",
    (event) => {

      if (
        !pageMode ||
        !pageScroller
      ) {
        return;
      }

      if (
        event.target &&
        pageScroller.contains(
          event.target
        )
      ) {
        return;
      }

      if (
        Math.abs(event.deltaY) <=
        Math.abs(event.deltaX)
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
     IMAGE PRELOAD
  ======================================================= */

  function preloadUrl(
    url,
    priority = "low"
  ) {
    if (!url) {
      return Promise.resolve();
    }

    if (
      urlPromises.has(url)
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
                  .catch(() => {})
                  .finally(resolve);
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

          image.src = url;

          if (image.complete) {
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
      imagePromises.has(image)
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
                  .catch(() => {})
                  .finally(resolve);
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

          if (image.complete) {
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


  function loadPage(
    page,
    priority = "low"
  ) {
    if (!page) {
      return Promise.resolve();
    }

    if (
      pagePromises.has(page)
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
            (image) =>
              loadImage(
                image,
                priority
              )
          );


        const spriteHost =
          page.querySelector(
            "[data-sprite-src]"
          );


        if (spriteHost) {
          const spriteUrl =
            spriteHost
              .dataset
              .spriteSrc;


          jobs.push(
            preloadUrl(
              spriteUrl,
              priority
            )
              .then(() => {

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
              })
          );
        }


        await Promise.allSettled(
          jobs
        );


        page.classList.add(
          "is-assets-ready"
        );
      })();


    pagePromises.set(
      page,
      promise
    );

    return promise;
  }


  /* =======================================================
     PAGE 02 PERSONALIZED GUEST
  ======================================================= */

  function ensureGuestNameElement() {
    if (
      personalizedGuestName
    ) {
      return personalizedGuestName;
    }

    if (!page02Layout) {
      return null;
    }


    const invite =
      page02Layout
        .querySelector(
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
      ).trim();


    if (!text) {
      element.textContent = "";

      element.hidden = true;

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
      Giữ nguyên style đã test thành công.
    */

    element.style.cssText =
      [
        "position:absolute",
        "z-index:25",
        "left:50%",
        "top:82px",
        "width:300px",
        "margin:0",
        "padding:0",
        "transform:translateX(-50%)",
        "display:block",
        "opacity:1",
        "visibility:visible",
        "pointer-events:none",
        "text-align:center",
        "color:#405948",
        'font-family:"Times New Roman",Times,serif',
        "font-size:12px",
        "font-weight:400",
        "font-style:italic",
        "line-height:1.25",
        "letter-spacing:0",
        "white-space:normal"
      ].join(";") + ";";


    console.log(
      "[Wedding] Page 2 F:",
      text
    );
  }


  /* =======================================================
     APPLY GUEST DATA
  ======================================================= */

  function applyGuestData(
    response
  ) {
    if (
      !response ||
      response.ok !== true
    ) {
      return;
    }


    currentGuestData =
      response;

    guestDataLoaded =
      true;


    /*
      PAGE 2
      F = personalized name
    */

    const displayName =
      normalizeText(
        response.displayName || ""
      ).trim();


    renderGuestDisplayName(
      displayName
    );


    if (displayName) {
      document.title =
        `${displayName} | Bách & Thư`;
    }


    /*
      RSVP NAME

      J nếu đã RSVP.
      Nếu J trống thì lấy D.
    */

    if (rsvpGuestName) {
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


    /*
      LUCKY NUMBER
    */

    const existingLucky =
      Number(
        response.luckyNumber
      );


    if (
      Number.isInteger(
        existingLucky
      ) &&
      existingLucky >= LUCKY_MIN &&
      existingLucky <= LUCKY_MAX
    ) {
      lockLuckyNumber(
        existingLucky,
        false
      );
    }


    /*
      ATTENDANCE
    */

    if (
      response.attendance ===
      "Không"
    ) {
      if (rsvpAttendanceNo) {
        rsvpAttendanceNo.checked =
          true;
      }

      if (rsvpAttendanceYes) {
        rsvpAttendanceYes.checked =
          false;
      }

    } else if (
      response.attendance ===
      "Có"
    ) {
      if (rsvpAttendanceYes) {
        rsvpAttendanceYes.checked =
          true;
      }

      if (rsvpAttendanceNo) {
        rsvpAttendanceNo.checked =
          false;
      }
    }


    /*
      GUEST COUNT
    */

    if (
      response.guestCount !== "" &&
      response.guestCount !== null &&
      response.guestCount !== undefined
    ) {
      const savedCount =
        Number(
          response.guestCount
        );

      if (
        Number.isInteger(
          savedCount
        ) &&
        savedCount >= 0 &&
        savedCount <= 10
      ) {
        rsvpCount =
          savedCount;
      }
    }


    /*
      MESSAGE
    */

    if (rsvpMessage) {
      rsvpMessage.value =
        normalizeText(
          response.message || ""
        );
    }


    /*
      VIDEO

      N chứa link folder riêng.
    */

    const videoFolderUrl =
      String(
        response.video || ""
      ).trim();


    if (rsvpVideoLink) {
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
      response.attendance === "Có" ||
      response.attendance === "Không"
    ) {
      setSubmitText(
        "CẬP NHẬT XÁC NHẬN"
      );
    }
  }


  /* =======================================================
     LOAD GUEST PERSONALIZATION
  ======================================================= */

  async function loadGuestPersonalization(
    force = false
  ) {
    if (!currentGuestSlug) {
      return null;
    }


    if (
      guestDataLoaded &&
      !force
    ) {
      return currentGuestData;
    }


    if (
      guestLoadPromise &&
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
    if (!page02Layout) {
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
      cleanup = 1500
    } = {}
  ) {
    if (!target) {
      return;
    }


    target.replaceChildren();


    const fragment =
      document.createDocumentFragment();


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
        Math.random() *
        Math.PI *
        2;

      const distance =
        minDistance +
        Math.random() *
        (
          maxDistance -
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
        `${2 + Math.random() * 4}px`
      );

      particle.style.setProperty(
        "--delay",
        `${Math.random() * 150}ms`
      );

      particle.style.setProperty(
        "--rotation",
        `${Math.random() * 720}deg`
      );

      particle.style.setProperty(
        "--particle-color",
        fireworkColors[
          Math.floor(
            Math.random() *
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
        count: 115,
        minDistance: 60,
        maxDistance: 170,
        cleanup: 1500
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
        600
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
          pageIndex === safeIndex;


        page.classList.toggle(
          "is-active",
          active
        );


        if (
          page === page06 &&
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
      pages[safeIndex] ===
      page02Layout
    ) {
      playPage02Entrance();


      if (!guestDataLoaded) {
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
      pages[safeIndex] ===
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
            pageIndex -
            safeIndex
          ) <= 1
        );
      }
    );


    loadPage(
      pages[safeIndex],
      "high"
    );


    if (
      pages[
        safeIndex + 1
      ]
    ) {
      loadPage(
        pages[
          safeIndex + 1
        ],
        "low"
      );
    }
  }


  function getCurrentPageIndex() {
    if (!pageScroller) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(
        pages.length - 1,
        Math.round(
          pageScroller.scrollTop /
          DESIGN_HEIGHT
        )
      )
    );
  }


  function onPageScroll() {
    if (scrollRaf) {
      return;
    }


    scrollRaf =
      requestAnimationFrame(
        () => {

          scrollRaf = 0;


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
     OPEN INVITATION
  ======================================================= */

  async function enterInvitation() {
    if (pageMode) {
      return;
    }


    pageMode = true;


    loadGuestPersonalization();


    await loadPage(
      pages[0],
      "high"
    );


    if (pageScroller) {
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


    runWhenIdle(
      () => {
        if (pages[1]) {
          loadPage(
            pages[1],
            "low"
          );
        }
      },
      600
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

        enterInvitation();
      }
    );


  runWhenIdle(
    () => {
      loadPage(
        pages[0],
        "low"
      );
    },
    450
  );


  /* =======================================================
     LUCKY STORAGE
  ======================================================= */

  function getLuckyStorageKey() {
    return currentGuestSlug
      ? `bach-thu-lucky-${currentGuestSlug}`
      : "";
  }


  function readLocalLuckyNumber() {
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
        ) &&
        value >= LUCKY_MIN &&
        value <= LUCKY_MAX
      ) {
        return value;
      }

    } catch (_) {}

    return null;
  }


  function saveLocalLuckyNumber(
    value
  ) {
    const key =
      getLuckyStorageKey();

    if (!key) {
      return;
    }

    try {
      localStorage.setItem(
        key,
        String(value)
      );
    } catch (_) {}
  }


  /* =======================================================
     LUCKY UI
  ======================================================= */

  function randomLuckyNumber() {
    const range =
      LUCKY_MAX -
      LUCKY_MIN +
      1;


    if (
      window.crypto
        ?.getRandomValues
    ) {
      const array =
        new Uint32Array(1);

      window.crypto
        .getRandomValues(
          array
        );

      return (
        LUCKY_MIN +
        array[0] % range
      );
    }


    return (
      LUCKY_MIN +
      Math.floor(
        Math.random() *
        range
      )
    );
  }


  function showLuckyNumber(value) {
    if (!luckyNumber) {
      return;
    }

    luckyNumber.textContent =
      String(value)
        .padStart(
          2,
          "0"
        );
  }


  function stopLuckyIdleShuffle() {
    if (
      luckyIdleTimer !== null
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
      !luckyCard ||
      luckyLocked ||
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
        145
      );
  }


  function lockLuckyNumber(
    value,
    animate = false
  ) {
    const number =
      Number(value);


    if (
      !Number.isInteger(
        number
      ) ||
      number < LUCKY_MIN ||
      number > LUCKY_MAX
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
      animate &&
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


    if (luckyHint) {
      luckyHint.textContent =
        LUCKY_HINT_REVEALED;
    }


    if (luckyTrigger) {
      luckyTrigger.disabled =
        true;
    }
  }


  function fireLuckyFireworks() {
    spawnFireworks(
      luckyFireworks,
      {
        count: 102,
        minDistance: 55,
        maxDistance: 155,
        cleanup: 1700
      }
    );
  }


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
      await sleep(delay);

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
          ) &&
          number >= LUCKY_MIN &&
          number <= LUCKY_MAX
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


    return candidate;
  }


  /* =======================================================
     ROLL LUCKY
  ======================================================= */

  function rollLuckyNumber() {
    if (
      luckyRolling ||
      luckyLocked
    ) {
      return;
    }


    if (!currentGuestSlug) {
      alert(
        "Link thiệp chưa có mã khách mời."
      );
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


    if (luckyHint) {
      luckyHint.textContent =
        "Đang tìm số may mắn...";
    }


    const candidate =
      randomLuckyNumber();


    const savePromise =
      postToBackend(
        {
          action: "saveLucky",

          guest:
            currentGuestSlug,

          luckyNumber:
            candidate
        }
      );


    const start =
      performance.now();

    const duration =
      1850;

    let lastUpdate =
      0;


    function frame(now) {
      const progress =
        Math.min(
          (
            now -
            start
          ) / duration,
          1
        );


      const interval =
        45 +
        Math.pow(
          progress,
          3
        ) * 145;


      if (
        now -
        lastUpdate >=
        interval
      ) {
        lastUpdate =
          now;

        showLuckyNumber(
          randomLuckyNumber()
        );
      }


      if (
        progress < 1
      ) {
        requestAnimationFrame(
          frame
        );
        return;
      }


      finishLucky();
    }


    async function finishLucky() {
      try {
        await savePromise;

        const finalNumber =
          await readLuckyAfterSave(
            candidate
          );

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

        if (luckyHint) {
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
     RSVP UI
  ======================================================= */

  function updateCount() {
    if (rsvpGuestCount) {
      rsvpGuestCount.textContent =
        String(
          rsvpCount
        );
    }
  }


  function updateAttendanceNoLabel() {
    if (!rsvpAttendanceNoText) {
      return;
    }


    /*
      UI:
      Không -> Kó khi selected.

      Sheet vẫn lưu "Không".
    */

    rsvpAttendanceNoText.textContent =
      rsvpAttendanceNo
        ?.checked
        ? "Kó"
        : "Không";
  }


  function setSubmitText(text) {
    const span =
      rsvpSubmit
        ?.querySelector(
          "span"
        );

    if (span) {
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
          rsvpAttendanceYes.checked &&
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
     VIDEO FOLDER

     Mỗi khách dùng folder riêng.
     URL nằm ở cột N.
  ======================================================= */

  async function waitForVideoFolderUrl() {
    for (
      const delay of
      VIDEO_FOLDER_WAIT_DELAYS
    ) {
      await sleep(delay);


      try {
        const response =
          await requestGuestData();


        if (
          response &&
          response.ok === true
        ) {
          currentGuestData =
            response;


          const videoUrl =
            String(
              response.video || ""
            ).trim();


          if (
            isDriveFolderUrl(
              videoUrl
            )
          ) {
            if (rsvpVideoLink) {
              rsvpVideoLink.href =
                videoUrl;

              rsvpVideoLink.dataset.ready =
                "true";
            }

            return videoUrl;
          }
        }

      } catch (error) {
        console.warn(
          "[Wedding] video folder readback:",
          error
        );
      }
    }


    return "";
  }


  async function openVideoDrive(
    event
  ) {
    event
      ?.preventDefault();


    if (!currentGuestSlug) {
      alert(
        "Link thiệp này chưa có mã khách mời."
      );

      return;
    }


    /*
      Nếu cột N đã có folder,
      mở luôn.
    */

    const existingUrl =
      String(
        currentGuestData
          ?.video ||
        rsvpVideoLink
          ?.getAttribute(
            "href"
          ) ||
        ""
      ).trim();


    if (
      isDriveFolderUrl(
        existingUrl
      )
    ) {
      window.open(
        existingUrl,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }


    /*
      Mở tab trắng trước để browser
      không chặn popup sau khi await.
    */

    const uploadTab =
      window.open(
        "about:blank",
        "_blank"
      );


    if (!uploadTab) {
      alert(
        "Trình duyệt đang chặn tab mới. Bạn cho phép pop-up rồi thử lại giúp chúng mình nhé."
      );

      return;
    }


    try {
      uploadTab.document.title =
        "Đang chuẩn bị thư mục video...";

      uploadTab.document.body.innerHTML =
        `
          <div
            style="
              font-family:Arial,sans-serif;
              padding:32px;
              text-align:center;
              color:#405948;
            "
          >
            Đang chuẩn bị thư mục Google Drive dành riêng cho bạn...
          </div>
        `;
    } catch (_) {}


    try {
      /*
        Backend tạo folder riêng
        nếu N đang trống.
      */

      await postToBackend(
        {
          action:
            "ensureVideoFolder",

          guest:
            currentGuestSlug
        }
      );


      /*
        Chờ GViz thấy URL mới ở N.
      */

      const videoUrl =
        await waitForVideoFolderUrl();


      if (!videoUrl) {
        try {
          uploadTab.close();
        } catch (_) {}


        alert(
          "Chưa tạo được thư mục video. Bạn vui lòng thử lại sau ít phút."
        );

        return;
      }


      currentGuestData =
        {
          ...(
            currentGuestData || {}
          ),

          video:
            videoUrl
        };


      uploadTab.location.href =
        videoUrl;


    } catch (error) {
      console.error(
        "[Wedding] video folder:",
        error
      );


      try {
        uploadTab.close();
      } catch (_) {}


      alert(
        "Không thể mở thư mục video lúc này. Bạn vui lòng thử lại."
      );
    }
  }


  if (rsvpVideoField) {
    rsvpVideoField
      .addEventListener(
        "click",
        openVideoDrive
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
        !response ||
        response.ok !== true
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


      /*
        Nếu backend vừa tạo folder,
        cập nhật href luôn.
      */

      const videoUrl =
        String(
          response.video || ""
        ).trim();


      if (
        rsvpVideoLink &&
        isDriveFolderUrl(
          videoUrl
        )
      ) {
        rsvpVideoLink.href =
          videoUrl;

        rsvpVideoLink.dataset.ready =
          "true";
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
              .trim() || ""
          );


        const message =
          normalizeText(
            rsvpMessage
              ?.value
              .trim() || ""
          );


        const isNo =
          Boolean(
            rsvpAttendanceNo
              ?.checked
          );


        const attendance =
          isNo
            ? "no"
            : "yes";


        const guestCount =
          isNo
            ? 0
            : Math.max(
                1,
                rsvpCount
              );


        if (!name) {
          alert(
            "Bạn nhập tên khách mời giúp chúng mình nhé."
          );

          return;
        }


        if (!currentGuestSlug) {
          alert(
            "Link thiệp này chưa có mã khách mời."
          );

          return;
        }


        if (!rsvpSubmit) {
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

              name,

              attendance,

              guestCount,

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


          /*
            Refresh ngầm,
            không block UI.
          */

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
    if (!currentGuestSlug) {
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


  if (localLucky) {
    lockLuckyNumber(
      localLucky,
      false
    );
  } else {
    startLuckyIdleShuffle();
  }


  document.addEventListener(
    "visibilitychange",
    () => {

      if (document.hidden) {
        stopLuckyIdleShuffle();

        return;
      }


      if (
        !luckyLocked &&
        !luckyRolling
      ) {
        startLuckyIdleShuffle();
      }
    }
  );


  /*
    Đánh dấu khách đã mở thiệp.
  */

  markInvitationOpened();


  /*
    READ = Google Sheet GViz
    WRITE = Apps Script POST
  */

  loadGuestPersonalization();

})();
