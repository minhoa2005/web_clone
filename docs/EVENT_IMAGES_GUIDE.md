# Hướng dẫn quy chuẩn hình ảnh sự kiện / minh hoạ thuyết minh

Tài liệu này hướng dẫn cách đặt tên file, chuẩn hoá định dạng và danh mục mã ID cho toàn bộ 36 sự kiện lịch sử trong ứng dụng.

---

## 1. Vị trí lưu trữ & Quy ước đặt tên file

- **Thư mục lưu trữ hình ảnh**: `public/assets/events/`
- **Quy tắc đặt tên file**: `<event-id>.<extension>`
- **Định dạng file khuyến nghị**:
  - `.webp` *(khuyến nghị tối ưu nhất về dung lượng và chất lượng hiển thị)*
  - `.jpg` / `.jpeg` hoặc `.png`
- **Độ phân giải & Tỷ lệ tối ưu**:
  - Tỷ lệ: `4:3` hoặc `16:9` hoặc `1:1` (hệ thống tự động điều chỉnh theo khung ruy-băng 3D).
  - Chiều ngang: từ `800px` đến `1400px`.
  - Dung lượng khuyến nghị: dưới `500KB` / mỗi ảnh để tối ưu tốc độ tải và hiệu năng quả cầu 3D.

---

## 2. Cơ chế tự động dò tìm đa định dạng (Format Cascading) & Fallback an toàn

1. **Hỗ trợ đa định dạng tự động:** Hệ thống tự động dò tìm và tải file ảnh theo chuỗi ưu tiên:
   - Thử định dạng WebP: `public/assets/events/<event-id>.webp`
   - Nếu không có, thử JPG: `public/assets/events/<event-id>.jpg`
   - Nếu không có, thử JPEG: `public/assets/events/<event-id>.jpeg`
   - Nếu không có, thử PNG: `public/assets/events/<event-id>.png`
   
   👉 **Bạn có thể lưu ảnh theo bất kỳ đuôi nào trong 4 định dạng trên (`.webp`, `.jpg`, `.jpeg`, `.png`), hệ thống đều tự động nhận diện và hiển thị mượt mà mà không cần đổi đuôi file hay can thiệp code.**

2. **Fallback an toàn về giáo trình:** Nếu một sự kiện chưa kịp có file ảnh mới (cả 4 định dạng trên đều chưa có), hệ thống sẽ tự động hiển thị trang giáo trình đối chiếu tương ứng để giao diện không bao giờ xuất hiện lỗi ảnh hỏng (broken image icon).

---

## 3. Bảng mã ID và danh mục 36 tệp hình ảnh chuẩn

### Giai đoạn 1: Tìm đường cứu nước (1911–1929)

| STT | Năm | Sự kiện (Tiêu đề rút gọn) | Mã ID (`event-id`) | Tên file ảnh chuẩn | Gợi ý hình ảnh tư liệu lịch sử |
|:---:|:---:|:---|:---|:---|:---|
| 01 | 1911 | Ra đi tìm đường cứu nước | `hanh-trinh-1911` | `hanh-trinh-1911.webp` | Tàu Đô đốc Latouche-Tréville hoặc bến cảng Nhà Rồng đầu thế kỷ XX |
| 02 | 1919 | Yêu sách của nhân dân An Nam | `yeu-sach-1919` | `yeu-sach-1919.webp` | Bản thảo Yêu sách của nhân dân An Nam hoặc chân dung Nguyễn Ái Quốc tại Pháp |
| 03 | 1920 | Đại hội Tours | `tours-1920` | `tours-1920.webp` | Ảnh Nguyễn Ái Quốc phát biểu tại Đại hội Tours (tháng 12/1920) |
| 04 | 1923 | Hoạt động tại Liên Xô | `lien-xo-1923` | `lien-xo-1923.webp` | Nguyễn Ái Quốc tại Mátxcơva hoặc tại Đại hội V Quốc tế Cộng sản (1924) |
| 05 | 1925 | Hội Việt Nam Cách mạng Thanh niên | `thanh-nien-1925` | `thanh-nien-1925.webp` | Ngôi nhà số 13-13B đường Văn Minh (Quảng Châu) hoặc báo Thanh niên số 1 |
| 06 | 1927 | Đường Kách mệnh | `duong-kach-menh-1927` | `duong-kach-menh-1927.webp` | Bìa bản gốc tác phẩm Đường Kách mệnh xuất bản năm 1927 (Bảo vật Quốc gia) |

---

### Giai đoạn 2: Đảng ra đời & Đấu tranh giành chính quyền (1930–1945)

| STT | Năm | Sự kiện (Tiêu đề rút gọn) | Mã ID (`event-id`) | Tên file ảnh chuẩn | Gợi ý hình ảnh tư liệu lịch sử |
|:---:|:---:|:---|:---|:---|:---|
| 07 | 1930 | Hội nghị thành lập Đảng | `hoi-nghi-1930` | `hoi-nghi-1930.webp` | Tranh tư liệu Hội nghị thành lập Đảng hoặc hình ảnh bán đảo Cửu Long (Hồng Kông) |
| 08 | 1930 | Cương lĩnh chính trị đầu tiên | `cuong-linh-1930` | `cuong-linh-1930.webp` | Bản thảo bút tích Chánh cương vắn tắt, Sách lược vắn tắt do Nguyễn Ái Quốc soạn |
| 09 | 1931 | Phong trào cách mạng 1930–1931 | `phong-trao-1930` | `phong-trao-1930.webp` | Khí thế đấu tranh của phong trào Xô viết Nghệ - Tĩnh với cờ đỏ búa liềm |
| 10 | 1935 | Đại hội Đảng lần thứ I | `dai-hoi-i-1935` | `dai-hoi-i-1935.webp` | Phố Quan Công (Ma Cao) nơi diễn ra Đại hội I hoặc tài liệu Đại hội |
| 11 | 1941 | Nguyễn Ái Quốc về nước | `tro-ve-1941` | `tro-ve-1941.webp` | Cột mốc 108 biên giới Việt - Trung hoặc suối Lê-nin, hang Cốc Bó (Cao Bằng) |
| 12 | 1941 | Hội nghị Trung ương 8 | `viet-minh-1941` | `viet-minh-1941.webp` | Lán Khuổi Nặm (Pác Bó, Cao Bằng) nơi tổ chức Hội nghị TW 8 hoặc cờ Việt Minh |
| 13 | 1945 | Cách mạng Tháng Tám | `thang-tam-1945` | `thang-tam-1945.webp` | Nhân dân khởi nghĩa đánh chiếm Phủ Khâm sai Bắc Kỳ (Bắc Bộ phủ) ngày 19/8/1945 |
| 14 | 1945 | Tuyên ngôn Độc lập | `doc-lap-1945` | `doc-lap-1945.webp` | Bác Hồ đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình ngày 2/9/1945 |

---

### Giai đoạn 3: Bảo vệ độc lập & Kháng chiến chống Pháp (1945–1954)

| STT | Năm | Sự kiện (Tiêu đề rút gọn) | Mã ID (`event-id`) | Tên file ảnh chuẩn | Gợi ý hình ảnh tư liệu lịch sử |
|:---:|:---:|:---|:---|:---|:---|
| 15 | 1946 | Hiệp định Sơ bộ 6/3 | `so-bo-1946` | `so-bo-1946.webp` | Chủ tịch Hồ Chí Minh và đại diện Pháp ký Hiệp định Sơ bộ tại số 38 Lý Thái Tổ, Hà Nội |
| 16 | 1950 | Quan hệ ngoại giao năm 1950 | `ngoai-giao-1950` | `ngoai-giao-1950.webp` | Chủ tịch Hồ Chí Minh trong chuyến thăm Trung Quốc và Liên Xô đầu năm 1950 |
| 17 | 1950 | Chiến dịch Biên giới | `bien-gioi-1950` | `bien-gioi-1950.webp` | Bức ảnh lịch sử Bác Hồ ngồi trên đỉnh núi quan sát mặt trận Đông Khê năm 1950 |
| 18 | 1951 | Đại hội Đảng lần thứ II | `dai-hoi-ii-1951` | `dai-hoi-ii-1951.webp` | Hội trường Đại hội II của Đảng trong rừng Kim Bình, Chiêm Hóa (Tuyên Quang) |
| 19 | 1954 | Chiến thắng Điện Biên Phủ | `dien-bien-1954` | `dien-bien-1954.webp` | Bộ đội phất cờ Quyết chiến Quyết thắng trên nóc hầm De Castries chiều 7/5/1954 |
| 20 | 1954 | Hội nghị Genève | `geneve-1954` | `geneve-1954.webp` | Phó Thủ tướng Phạm Văn Đồng tại phòng họp đàm phán Hội nghị Genève tháng 7/1954 |

---

### Giai đoạn 4: Thống nhất đất nước (1954–1975)

| STT | Năm | Sự kiện (Tiêu đề rút gọn) | Mã ID (`event-id`) | Tên file ảnh chuẩn | Gợi ý hình ảnh tư liệu lịch sử |
|:---:|:---:|:---|:---|:---|:---|
| 21 | 1960 | Đại hội Đảng lần thứ III | `dai-hoi-iii-1960` | `dai-hoi-iii-1960.webp` | Bác Hồ bắt nhịp bài ca Kết đoàn tại Đại hội lần thứ III của Đảng (Hà Nội, 1960) |
| 22 | 1968 | Tổng tiến công và nổi dậy Mậu Thân | `mau-than-1968` | `mau-than-1968.webp` | Biệt động Sài Gòn chiến đấu hoặc hình ảnh bộ đội tiến vào đô thị dịp Tết Mậu Thân |
| 23 | 1973 | Hiệp định Paris | `paris-1973` | `paris-1973.webp` | Bộ trưởng Nguyễn Duy Trinh ký kết Hiệp định Paris tại Trung tâm Kléber (27/1/1973) |
| 24 | 1975 | Chiến dịch Hồ Chí Minh | `mua-xuan-1975` | `mua-xuan-1975.webp` | Xe tăng quân giải phóng húc đổ cổng Dinh Độc Lập trưa ngày 30/4/1975 |

---

### Giai đoạn 5: Xây dựng & Bảo vệ Tổ quốc (1975–1986)

| STT | Năm | Sự kiện (Tiêu đề rút gọn) | Mã ID (`event-id`) | Tên file ảnh chuẩn | Gợi ý hình ảnh tư liệu lịch sử |
|:---:|:---:|:---|:---|:---|:---|
| 25 | 1976 | Nhà nước Việt Nam thống nhất | `thong-nhat-1976` | `thong-nhat-1976.webp` | Hội trường Ba Đình kỳ họp thứ nhất Quốc hội khóa VI đổi tên nước năm 1976 |
| 26 | 1976 | Đại hội Đảng lần thứ IV | `dai-hoi-iv-1976` | `dai-hoi-iv-1976.webp` | Đoàn Chủ tịch Đại hội IV của Đảng tại Hà Nội đổi tên thành Đảng Cộng sản Việt Nam |
| 27 | 1979 | Hội nghị Trung ương 6 | `tim-toi-1979` | `tim-toi-1979.webp` | Hình ảnh lao động sản xuất hoặc hội nghị tháo gỡ khó khăn cơ chế quản lý năm 1979 |
| 28 | 1981 | Chỉ thị 100 về khoán sản phẩm | `khoan-100-1981` | `khoan-100-1981.webp` | Nông dân hợp tác xã gặt lúa phấn khởi khi áp dụng khoán sản phẩm nông nghiệp |

---

### Giai đoạn 6: Đổi mới & Hội nhập quốc tế (1986–2021)

| STT | Năm | Sự kiện (Tiêu đề rút gọn) | Mã ID (`event-id`) | Tên file ảnh chuẩn | Gợi ý hình ảnh tư liệu lịch sử |
|:---:|:---:|:---|:---|:---|:---|
| 29 | 1986 | Đại hội VI và đường lối Đổi mới | `doi-moi-1986` | `doi-moi-1986.webp` | Đồng chí Nguyễn Văn Linh phát biểu tại Đại hội VI của Đảng (tháng 12/1986) |
| 30 | 1991 | Cương lĩnh năm 1991 | `cuong-linh-1991` | `cuong-linh-1991.webp` | Toàn cảnh Đại hội Đảng lần thứ VII thông qua Cương lĩnh năm 1991 |
| 31 | 1995 | Việt Nam gia nhập ASEAN | `asean-1995` | `asean-1995.webp` | Lễ thượng cờ Việt Nam gia nhập ASEAN tại Bandar Seri Begawan, Brunei (28/7/1995) |
| 32 | 1996 | Đại hội Đảng lần thứ VIII | `dai-hoi-viii-1996` | `dai-hoi-viii-1996.webp` | Khai mạc Đại hội VIII tại Cung Văn hóa Hữu nghị Hà Nội, đẩy mạnh CNH - HĐH |
| 33 | 2007 | Việt Nam gia nhập WTO | `wto-2007` | `wto-2007.webp` | Lễ trao văn kiện kết nạp Việt Nam vào WTO tại trụ sở Genève, Thụy Sĩ (11/1/2007) |
| 34 | 2011 | Cương lĩnh bổ sung, phát triển | `cuong-linh-2011` | `cuong-linh-2011.webp` | Toàn cảnh phiên khai mạc Đại hội XI tại Trung tâm Hội nghị Quốc gia, Hà Nội |
| 35 | 2016 | Đại hội Đảng lần thứ XII | `dai-hoi-xii-2016` | `dai-hoi-xii-2016.webp` | Đoàn Chủ tịch và toàn cảnh Đại hội đại biểu toàn quốc lần thứ XII (tháng 1/2016) |
| 36 | 2021 | Định hướng Đại hội XIII | `dai-hoi-xiii-2021` | `dai-hoi-xiii-2021.webp` | Hội trường Đại hội XIII với phương châm Đoàn kết - Dân chủ - Kỷ cương - Sáng tạo |
