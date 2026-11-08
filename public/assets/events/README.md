# Thư mục hình ảnh sự kiện / minh hoạ thuyết minh (Event Illustrations)

Thư mục này chứa hình ảnh tư liệu, sự kiện và minh hoạ lịch sử thay thế cho các ảnh scan giáo trình cũ trong phần thuyết minh theo dòng thời gian (Guided Timeline Narration) và thẻ hiển thị tư liệu.

## Quy tắc đặt tên file chuẩn (Naming Convention)

Mỗi file ảnh cần được đặt tên **chính xác theo mã ID** của sự kiện (`<event-id>.<extension>`):

```
public/assets/events/<event-id>.webp
```
*(Hỗ trợ các định dạng: `.webp` [khuyến nghị tối ưu hiệu năng], `.jpg` / `.jpeg`, `.png`)*

Ví dụ:
- Sự kiện 1911 (Bác Hồ ra đi tìm đường cứu nước): `hanh-trinh-1911.webp` (hoặc `hanh-trinh-1911.jpg`)
- Sự kiện 1930 (Hội nghị thành lập Đảng): `hoi-nghi-1930.webp`
- Sự kiện 1945 (Tuyên ngôn Độc lập): `doc-lap-1945.webp`
- Sự kiện 1954 (Chiến thắng Điện Biên Phủ): `dien-bien-1954.webp`
- Sự kiện 1975 (Chiến dịch Hồ Chí Minh): `mua-xuan-1975.webp`

## Cơ chế tự động nhận diện & Fallback an toàn

- **Tự động nhận diện**: Ngay khi bạn sao chép file ảnh vào thư mục này với tên chuẩn `<event-id>.<ext>`, hệ thống sẽ tự động hiển thị hình ảnh sự kiện minh hoạ trong dải ruy-băng 3D, khi phóng to thuyết minh và trong thẻ tư liệu.
- **Fallback an toàn**: Nếu một sự kiện chưa có file ảnh mới trong thư mục này, hệ thống sẽ tự động hiển thị trang giáo trình đối chiếu tương ứng để đảm bảo trải nghiệm luôn liền mạch, không bao giờ bị lỗi ảnh hỏng (broken image).

Xem danh sách đầy đủ 36 mã ID và gợi ý hình ảnh chi tiết tại: `docs/EVENT_IMAGES_GUIDE.md`
