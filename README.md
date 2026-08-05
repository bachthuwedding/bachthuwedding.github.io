# Bộ source 4 thiệp cưới Bách & Thư

## Đường dẫn sau khi upload vào repository `<username>.github.io`

- Trang chọn mẫu: `https://<username>.github.io/`
- Mẫu 1: `https://<username>.github.io/mau-1/`
- Mẫu 2: `https://<username>.github.io/mau-2/`
- Mẫu 3: `https://<username>.github.io/mau-3/`
- Mẫu 4: `https://<username>.github.io/mau-4/`

## Cấu trúc

```text
/
├── index.html
├── .nojekyll
├── mau-1/
├── mau-2/
├── mau-3/
├── mau-4/
└── shared/
    ├── css/base.css
    ├── js/app.js
    └── assets/icons.svg
```

## Upload lên GitHub

1. Giải nén file ZIP.
2. Mở repository `<username>.github.io`.
3. Chọn **Add file → Upload files**.
4. Kéo toàn bộ nội dung bên trong thư mục đã giải nén vào GitHub. Không kéo nguyên một thư mục bọc bên ngoài.
5. Commit trực tiếp vào nhánh `main`.
6. Trong **Settings → Pages**, chọn `Deploy from a branch`, nhánh `main`, thư mục `/(root)`.

## Cá nhân hóa tên khách

Thêm tham số `guest` vào URL:

```text
https://<username>.github.io/mau-1/?guest=Nguyen%20Van%20An
```

## Những chỗ cần thay trong bản hoàn thiện

- Nội dung ngày giờ và địa điểm trong từng `mau-x/index.html`.
- Link bản đồ: tìm nút có `data-rsvp-demo` ở phần địa điểm và thay `href="#"`.
- Link Google Form RSVP: thay `href="#"` ở nút “Xác nhận tham dự”.
- Link video: thay `href="#"` ở phần `data-video-demo`.
- Form lời chúc hiện là demo, chưa lưu dữ liệu. Cần nối Google Form, Google Apps Script hoặc dịch vụ form.
- Thêm nhạc tại `shared/assets/music.mp3`.
- Thay các khối ảnh placeholder bằng ảnh thật sau khi tối ưu WebP/AVIF.

## Animation đã có

- Mở phong bì.
- Hiện dần khi cuộn.
- Mây trôi nhẹ.
- Hoa sen nhún và lắc nhẹ.
- Parallax nhẹ theo con trỏ.
- Mở lì xì và sinh lời chúc ngẫu nhiên.
- Nút nhạc xoay khi phát.
- Tôn trọng cài đặt giảm chuyển động của thiết bị.
