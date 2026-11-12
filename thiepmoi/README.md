# Thiệp cưới Anh Thư & Thanh Bách

Thiệp mời lễ thành hôn **Nguyễn Anh Thư & Đồng Thanh Bách**, lúc **7:00, Thứ Ba ngày 24/11/2026**, tức **16 tháng 10 năm Bính Ngọ**.

Tông burgundy, nền kem, hoa màu nước burgundy – hồng phấn – trắng ngà. Phông Lora có chân, được lưu cục bộ và có đầy đủ dấu tiếng Việt. Giữ bìa mở thiệp; sau khi mở, nội dung bắt đầu từ Happy Wedding. Toàn bộ phần chân dung và khung ảnh đầu trang đã được bỏ.

## Nội dung hiện tại

- Hai cột Nhà gái (trái) / Nhà trai (phải), mỗi cột có dòng Ông Bà và hai dòng tên bố mẹ (không hiện địa chỉ), lời mời và họ tên hai bạn (không có nhãn “Cô dâu/Chú rể” dưới họ tên).
- Ngày giờ lễ cưới và ngày âm lịch.
- Timeline: 7:00 lễ ăn hỏi tại nhà gái; 10:00 lễ đón dâu tại nhà trai; 12:00 bữa cơm thân mật.
- Địa chỉ dưới mô tả mỗi mốc; link Google Maps ở hai mốc tại Ocean Park 3.
- Lời kết “Sự hiện diện…” và “Trân trọng cảm ơn!”.

Đã bỏ album, đón khách/khai tiệc, đếm ngược, lịch tháng, nút thêm lịch, khu vực địa điểm/bản đồ riêng và sổ lưu bút. Website không dùng database hoặc localStorage.

## Sửa nội dung

Mở `config.js`:

| Mục | Trường |
| --- | --- |
| Tên và thông tin gia đình | `bride`, `groom` |
| Lời mời | `invitation` |
| Ngày giờ | `date`, có múi giờ `+07:00` |
| Ngày âm lịch | `lunarDate`, nhập thủ công |
| Lịch trình | `timeline`, mỗi mục có `time`, `title`, `address` |
| Google Maps | `mapsQuery` hoặc `mapsUrl` ở từng mục lịch trình |
| Lời kết | `closing` |

Hai link Maps tại mốc 7:00 và 12:00 dùng đúng link vị trí được cung cấp: https://maps.app.goo.gl/aevq6E3Xpa8hscVQ6 . Mốc 10:00 giữ địa chỉ Chùa Bộc, Hà Nội và không gắn link này.

Có thể đặt tên khách mời qua `?guest=Anh%20Ch%E1%BB%8B` hoặc `guestName`. `?open=1` mở thẳng nội dung thiệp.

Không có nhạc, nút phát nhạc hoặc phần tử audio.

## Chuyển động và phông chữ

- Bìa hiện dần, tên/ngày/lời mời/nút xuất hiện theo nhịp; dấu tim và hoa chuyển động nhẹ.
- Bấm mở thiệp: bìa dịch lên và mờ đi, nội dung bắt đầu ở Happy Wedding.
- Hoa nền dịch chuyển theo vị trí cuộn, kết hợp độ đung đưa nhỏ.
- Từng tiêu đề, phần gia đình, họ tên, ngày cưới và mốc timeline hiện dần khi vào khung nhìn; mỗi mục chỉ chạy một lần trong một lượt xem.
- Cánh hoa rơi nhẹ ở bìa và nội dung; không che thao tác với link.
- Tự giảm chuyển động khi thiết bị bật `prefers-reduced-motion`; tự tạm dừng animation khi tab bị ẩn. Nếu trình duyệt không hỗ trợ IntersectionObserver, nội dung vẫn hiển thị đầy đủ.
- Font Lora regular/semibold nằm trong `assets/fonts/`, kèm giấy phép SIL Open Font License. Không tải font từ dịch vụ bên ngoài lúc khách xem thiệp.

Phông chữ: https://fonts.google.com/specimen/Lora

## Chạy và xuất bản

HTML, CSS và JavaScript thuần, không có dependency. Mở `index.html` để xem hoặc dùng Live Server.

```sh
npm run check
npm run build
```

Build sao chép website vào `dist/`. GitHub Pages cũng có thể chạy trực tiếp các file ở thư mục gốc repo.

Để bật GitHub Pages: **Settings → Pages → Source: Deploy from a branch → Branch: main → /(root) → Save**. Giữ nguyên thiết lập nếu đã bật trước đó.

Hướng dẫn chính thức: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Thiết kế và tài nguyên

`assets/decorations/burgundy-flowers.png` là hoa trang trí mới tạo cho thiệp này, nền trong suốt, phong cách màu nước: cosmos màu rượu vang, hoa đậu thơm hồng phấn, hồng trắng ngà và lá màu taupe nhạt. Được dùng lại ở góc bìa và các họa tiết chìm. Không dùng hoa xanh hoặc ảnh chân dung mẫu từ phiên bản trước.

Bố cục ban đầu tham khảo thiệp https://chungdoi.com/i/thuuyen-tunglam; mã ứng dụng được viết riêng. Không dùng API, dữ liệu khách mời hoặc khóa bản đồ từ trang tham chiếu.

