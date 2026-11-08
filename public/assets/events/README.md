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

## Cơ chế tự động dò tìm đa định dạng (Cascading) & Fallback an toàn

- **Hỗ trợ 4 định dạng phổ biến:** Hệ thống tự động kiểm tra lần lượt:
  1. `<event-id>.webp` (ưu tiên hàng đầu)
  2. `<event-id>.jpg`
  3. `<event-id>.jpeg`
  4. `<event-id>.png`
  
  Do đó, bạn có thể lưu file ảnh theo bất kỳ định dạng nào (`.webp`, `.jpg`, `.jpeg` hoặc `.png`), hệ thống đều tự động nhận và hiển thị ngay lập tức.
- **Fallback an toàn:** Nếu sự kiện chưa có bất kỳ file ảnh mới nào trong 4 định dạng trên, hệ thống sẽ tự động hiển thị trang giáo trình đối chiếu tương ứng để đảm bảo trải nghiệm luôn liền mạch, không bao giờ bị lỗi ảnh hỏng (broken image).

Xem danh sách đầy đủ 36 mã ID và gợi ý hình ảnh chi tiết tại: `docs/EVENT_IMAGES_GUIDE.md`
