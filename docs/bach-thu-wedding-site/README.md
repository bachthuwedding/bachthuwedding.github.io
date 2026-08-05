# Bách & Thư — Oriental Editorial Wedding Invitation

Bản dựng code theo phương án **tách từng element**, dành cho GitHub Pages.

## Trạng thái

- Template đầu tiên: Oriental Editorial đỏ–kem.
- Canvas chuẩn đối chiếu: **682 × 2048 px**.
- Tự co theo chiều rộng màn hình điện thoại.
- Nội dung, nút và tương tác là HTML/CSS/JavaScript thật.
- Các hình watercolor/phức tạp được tách thành asset trang trí riêng, không dùng toàn trang làm một ảnh nền.

## Chạy local

Yêu cầu Node.js 18+.

```bash
npm run dev
```

Mở:

```text
http://localhost:4173
```

Hoặc chạy bằng Python:

```bash
python3 -m http.server 4173
```

## Chụp ảnh đối chiếu

Máy cần có Chromium/Chrome:

```bash
npm run screenshot
```

Kết quả nằm tại:

```text
artifacts/site.png
```

Ảnh tham chiếu:

```text
reference/oriental-editorial-reference.webp
```

## Deploy GitHub Pages

1. Tạo repository mới trên GitHub.
2. Copy toàn bộ thư mục này vào repository.
3. Commit và push lên nhánh `main`.
4. Vào **Settings → Pages → Source: GitHub Actions**.
5. Workflow `.github/workflows/pages.yml` sẽ tự deploy.

## Thay nội dung

Dữ liệu cơ bản nằm trong:

```text
data/content.json
```

Bản hiện tại vẫn viết nội dung trực tiếp trong `index.html` để ưu tiên kiểm soát pixel. Bước refactor tiếp theo là render toàn bộ nội dung từ JSON.

## Asset

- `assets/images/`: texture và illustration watercolor.
- `assets/icons/`: SVG icon tự dựng.
- `reference/`: ảnh chuẩn dùng cho visual comparison.

Không xóa ảnh reference nếu còn chỉnh pixel.

## Các tương tác đã có

- Mở phong bì.
- Mini game lì xì.
- Gửi lời chúc, lưu localStorage.
- Video modal.
- RSVP, lưu localStorage.
- Sửa `[Nhắn nhủ]` trực tiếp.

## Hướng phát triển tiếp theo

1. Chạy screenshot và tạo ảnh diff.
2. Chỉnh typography, spacing và asset crop theo từng pixel.
3. Tách hero thành nhiều layer watercolor riêng.
4. Kết nối form với Firebase/Supabase/Google Sheets.
5. Thêm video thật.
6. Dựng ba template còn lại bằng chung component system.
