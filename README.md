# Wedding Invitations V2 — Bách & Thư

Bộ source được viết lại theo 4 tài liệu thiết kế:

- Mẫu 01 — Oriental Editorial Đỏ–Kem
- Mẫu 02 — Oriental Rich Red
- Mẫu 03 — Botanical Sage Green & Cream
- Mẫu 04 — Folk Celebration Việt

## URL sau khi upload

```text
https://<username>.github.io/
https://<username>.github.io/mau-1/
https://<username>.github.io/mau-2/
https://<username>.github.io/mau-3/
https://<username>.github.io/mau-4/
```

## Cách cập nhật GitHub

1. Giải nén ZIP.
2. Trong repository `<username>.github.io`, xóa hoặc thay thế bộ file cũ.
3. Upload toàn bộ nội dung bên trong thư mục giải nén.
4. Giữ nguyên cấu trúc các thư mục `mau-1`, `mau-2`, `mau-3`, `mau-4`, `shared`.
5. Commit vào nhánh `main`.
6. Chờ GitHub Pages deploy lại.

## Cấu trúc chính

```text
/
├── index.html
├── .nojekyll
├── mau-1/
│   ├── index.html
│   └── theme.css
├── mau-2/
├── mau-3/
├── mau-4/
└── shared/
    ├── css/base.css
    ├── js/app.js
    └── assets/
```

## Cá nhân hóa tên khách

```text
https://<username>.github.io/mau-1/?guest=Nguyễn%20Văn%20An
```

## Nội dung cần thay sau

- Ngày giờ, địa điểm, câu chuyện trong từng file `mau-x/index.html`.
- Thay các `href="#"` của bản đồ bằng Google Maps.
- Nối form lời chúc và RSVP với Google Form hoặc Google Apps Script.
- Thay video demo bằng video thật.
- Đặt nhạc tại `shared/assets/music.mp3`.
- Thay illustration/ảnh placeholder bằng ảnh cưới thật khi có.

## Tính năng đã có

- Mở phong bì.
- Hiện dần khi cuộn.
- Animation mây, hoa, tua rua, sóng và đoàn rước.
- Parallax nhẹ.
- Mini game/lì xì.
- Modal video và RSVP.
- Cá nhân hóa tên khách qua URL.
- Hỗ trợ `prefers-reduced-motion`.
