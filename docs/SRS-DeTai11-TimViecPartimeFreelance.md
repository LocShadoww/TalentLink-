# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## Đề tài 11 — Ứng dụng Tìm việc Partime/Freelance
**Nền tảng:** React Native (Expo) — **Lưu trữ:** SQLite
**Phiên bản:** 1.0 — **Ngày:** 24/07/2026

---

## Mục lục
1. [Giới thiệu](#1-giới-thiệu)
2. [Mô tả tổng quan hệ thống](#2-mô-tả-tổng-quan-hệ-thống)
3. [Yêu cầu chức năng](#3-yêu-cầu-chức-năng-functional-requirements)
4. [Yêu cầu phi chức năng](#4-yêu-cầu-phi-chức-năng-non-functional-requirements)
5. [Yêu cầu giao diện người dùng](#5-yêu-cầu-giao-diện-người-dùng-ui-requirements)
6. [Mô hình dữ liệu](#6-mô-hình-dữ-liệu-data-model--sqlite)
7. [Yêu cầu kỹ thuật & cấu trúc dự án](#7-yêu-cầu-kỹ-thuật--cấu-trúc-dự-án)
8. [Tiêu chí nghiệm thu](#8-tiêu-chí-nghiệm-thu-acceptance-criteria)

---

## 1. GIỚI THIỆU

### 1.1 Mục đích tài liệu
Tài liệu này đặc tả chi tiết các yêu cầu chức năng và phi chức năng của ứng dụng di động "Tìm việc Partime/Freelance" (Đề tài 11), làm cơ sở cho việc thiết kế, phát triển, kiểm thử và nghiệm thu sản phẩm. Tài liệu hướng tới nhóm phát triển, giảng viên hướng dẫn/chấm bài và các bên liên quan khác.

### 1.2 Phạm vi sản phẩm
Ứng dụng di động đa nền tảng (iOS/Android) xây dựng bằng Expo (React Native), tập trung các tin tuyển dụng việc làm partime/freelance vào một nơi, cho phép người dùng tìm kiếm, lọc, xem chi tiết, ứng tuyển nhanh và theo dõi trạng thái đơn ứng tuyển. Phạm vi bài tập chọn **Hướng tiếp cận A — chỉ dành cho ứng viên**; dữ liệu tin tuyển dụng được nạp sẵn (seed data), không có vai trò nhà tuyển dụng đăng tin trong hệ thống.

### 1.3 Đối tượng người dùng
- **Ứng viên (Candidate):** sinh viên, lao động tự do có nhu cầu tìm việc làm thêm partime hoặc công việc freelance, cần tra cứu nhanh, lọc theo nhu cầu và ứng tuyển tiện lợi ngay trên di động.

### 1.4 Định nghĩa, từ viết tắt

| Thuật ngữ | Mô tả |
|---|---|
| SRS | Software Requirements Specification – Đặc tả yêu cầu phần mềm |
| FR | Functional Requirement – Yêu cầu chức năng |
| NFR | Non-Functional Requirement – Yêu cầu phi chức năng |
| CV | Hồ sơ ứng viên rút gọn trong ứng dụng |
| Partime | Công việc bán thời gian, có lịch làm việc cố định theo ca |
| Freelance | Công việc tự do, theo dự án/thời vụ, không ràng buộc ca làm cố định |

---

## 2. MÔ TẢ TỔNG QUAN HỆ THỐNG

### 2.1 Bối cảnh bài toán
Sinh viên và lao động tự do thường gặp khó khăn khi tìm việc làm thêm phù hợp với lịch trình cá nhân vì thông tin tuyển dụng partime/freelance nằm rải rác trên nhiều kênh (mạng xã hội, website, truyền miệng...), thiếu công cụ lọc theo nhu cầu và không có nơi theo dõi tập trung trạng thái các đơn đã ứng tuyển.

### 2.2 Hướng tiếp cận đã chọn
**Hướng A — Chỉ dành cho ứng viên:** Tin tuyển dụng là dữ liệu có sẵn (seed sẵn trong SQLite khi khởi chạy lần đầu), ứng dụng tập trung toàn bộ trải nghiệm vào việc tìm kiếm, lọc, xem chi tiết và ứng tuyển việc làm — không xây dựng vai trò/luồng nghiệp vụ cho nhà tuyển dụng.

### 2.3 Kiến trúc tổng quan
- Nền tảng ứng dụng: React Native chạy trên Expo (managed workflow).
- Điều hướng: React Navigation — kết hợp Bottom Tab Navigator (điều hướng chính) và Stack Navigator lồng trong từng tab (điều hướng chi tiết).
- Lưu trữ dữ liệu: SQLite (expo-sqlite) — lưu trữ cục bộ trên thiết bị, không phụ thuộc backend/máy chủ ngoài.
- Quản lý trạng thái: React Context API kết hợp custom hooks, không dùng thư viện quản lý state ngoài (Redux...).
- Kiến trúc phân lớp: Presentation (screens/components) → State/Context → Data Access Layer (db/*.js thao tác SQLite) → SQLite Storage.

### 2.4 Giả định và ràng buộc
- Ứng dụng hoạt động offline-first: toàn bộ dữ liệu (tin tuyển dụng, hồ sơ, đơn ứng tuyển, tin đã lưu) lưu cục bộ trong SQLite trên thiết bị, không đồng bộ máy chủ.
- Trạng thái đơn ứng tuyển (Đang chờ/Đã duyệt/Từ chối) là dữ liệu mô phỏng (mock), không có quy trình duyệt thực tế từ phía nhà tuyển dụng.
- Dữ liệu tin tuyển dụng được seed sẵn khoảng 15–20 bản ghi mẫu, đa dạng ngành nghề, mức lương, hình thức và địa điểm để việc lọc/tìm kiếm có ý nghĩa kiểm thử.

---

## 3. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

Danh sách các yêu cầu chức năng được đánh mã FR-xx, mỗi chức năng mô tả rõ input, xử lý chính và output để làm căn cứ thiết kế và kiểm thử.

### FR-01 → FR-04: Nhóm chức năng Tra cứu việc làm

| ID | Chức năng | Mô tả | Input | Xử lý chính | Output / Kết quả |
|---|---|---|---|---|---|
| FR-01 | Xem danh sách tin tuyển dụng | Hiển thị danh sách công việc dạng card: tên việc, mức lương, thời gian làm việc, địa điểm, hình thức. | Không có (tự động tải khi mở màn hình / tab Home). | Truy vấn bảng `jobs` trong SQLite (`SELECT * ORDER BY created_at DESC`); hiển thị Loading khi đang truy vấn; bắt lỗi truy vấn. | Danh sách card việc làm; Empty State nếu bảng jobs rỗng; Error State nếu truy vấn thất bại. |
| FR-02 | Tìm kiếm tin tuyển dụng | Tìm nhanh theo từ khoá tên công việc/ngành nghề. | Chuỗi từ khoá người dùng nhập vào thanh tìm kiếm. | Debounce input (~300–500ms); truy vấn SQLite với điều kiện LIKE trên `title`/`category`. | Danh sách kết quả khớp từ khoá; Empty State nếu không có kết quả phù hợp. |
| FR-03 | Lọc tin tuyển dụng | Thu hẹp danh sách theo tiêu chí cụ thể. | Ngành nghề (chọn 1/nhiều), khoảng mức lương (min–max), hình thức (partime/freelance). | Kết hợp điều kiện lọc thành câu truy vấn SQL động (`WHERE ... AND ...`); áp dụng lên bảng jobs. | Danh sách jobs đã lọc trả về màn Home; badge hiển thị số điều kiện đang áp dụng. |
| FR-04 | Xem chi tiết công việc | Xem đầy đủ thông tin 1 tin tuyển dụng. | `job_id` được truyền từ danh sách/kết quả tìm kiếm. | Truy vấn SELECT theo id; kiểm tra trạng thái đã lưu yêu thích hay chưa (join bảng favorites). | Màn chi tiết: mô tả, yêu cầu, mức lương, lịch làm, thông tin liên hệ; nút Ứng tuyển & Lưu tin; Error/Loading state. |

### FR-05: Quản lý hồ sơ ứng viên (bao gồm FORM có validate)

| ID | Chức năng | Mô tả | Input | Xử lý chính | Output / Kết quả |
|---|---|---|---|---|---|
| FR-05 | Tạo/chỉnh sửa hồ sơ ứng viên | Form nhập/sửa thông tin cá nhân dùng khi ứng tuyển. | Họ tên, số điện thoại, email, kỹ năng, giới thiệu ngắn (bio/CV rút gọn). | Validate client-side theo bảng quy tắc bên dưới; nếu hợp lệ → INSERT/UPDATE bảng `profile` (id cố định = 1). | Thông báo lưu thành công; nếu có lỗi → hiển thị message lỗi ngay dưới từng trường, disable nút Lưu. |

**Quy tắc validate chi tiết cho Form Hồ sơ ứng viên:**

| Trường | Kiểu dữ liệu | Ràng buộc | Thông báo lỗi |
|---|---|---|---|
| Họ tên | TEXT | Bắt buộc, ≥ 2 ký tự | "Vui lòng nhập họ tên (tối thiểu 2 ký tự)" |
| Số điện thoại | TEXT | Bắt buộc, đúng định dạng số VN (10 chữ số, bắt đầu bằng 0) | "Số điện thoại không hợp lệ (VD: 0912345678)" |
| Email | TEXT | Bắt buộc, đúng định dạng email chuẩn | "Email không đúng định dạng" |
| Kỹ năng | TEXT | Không bắt buộc, tối đa 200 ký tự | Cảnh báo nhẹ nếu vượt quá độ dài cho phép |
| Giới thiệu ngắn | TEXT | Không bắt buộc, tối đa 300 ký tự | Hiển thị bộ đếm ký tự còn lại |

### FR-06 → FR-08: Nhóm chức năng Ứng tuyển & Theo dõi

| ID | Chức năng | Mô tả | Input | Xử lý chính | Output / Kết quả |
|---|---|---|---|---|---|
| FR-06 | Ứng tuyển nhanh | Gửi đơn ứng tuyển cho 1 tin tuyển dụng từ màn chi tiết. | `job_id`; yêu cầu hồ sơ ứng viên đã được tạo trước đó. | Kiểm tra hồ sơ tồn tại (nếu chưa có → điều hướng sang màn Hồ sơ); INSERT bản ghi vào bảng `applications` với status mặc định 'pending'; chặn ứng tuyển trùng lặp trên cùng 1 job. | Thông báo ứng tuyển thành công; cập nhật trạng thái nút thành "Đã ứng tuyển"; job xuất hiện trong tab Đã ứng tuyển. |
| FR-07 | Theo dõi trạng thái đơn ứng tuyển | Xem danh sách các việc đã ứng tuyển kèm trạng thái. | Không có (tự động tải khi mở tab). | JOIN bảng `applications` với `jobs` theo job_id; hiển thị badge màu theo status (Đang chờ/Đã duyệt/Từ chối). | Danh sách đơn ứng tuyển kèm trạng thái; Empty State nếu chưa ứng tuyển tin nào. |
| FR-08 | Lưu / bỏ lưu tin yêu thích | Đánh dấu tin quan tâm để xem lại nhanh. | `job_id`; hành động toggle (lưu/bỏ lưu). | INSERT vào bảng `favorites` nếu chưa có, DELETE nếu đã tồn tại (toggle theo primary key job_id). | Icon trái tim đổi trạng thái tức thời; tin xuất hiện/biến mất khỏi tab Đã lưu; Empty State nếu chưa lưu tin nào. |

---

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

| Nhóm | Mã | Yêu cầu |
|---|---|---|
| Hiệu năng | NFR-01 | Danh sách việc làm (≤ 20 bản ghi seed) phải hiển thị trong dưới 1 giây sau khi truy vấn SQLite; dùng FlatList để tối ưu render danh sách dài. |
| Khả năng sử dụng (Usability) | NFR-02 | Mọi màn hình tải dữ liệu đều phải có 3 trạng thái hiển thị rõ ràng: Loading (spinner/skeleton), Error (thông báo + nút thử lại), Empty (minh hoạ + gợi ý hành động). |
| Tính nhất quán giao diện | NFR-03 | Toàn bộ app dùng chung 1 bộ theme (bảng màu, typography, khoảng cách) định nghĩa tập trung trong thư mục `theme/`, áp dụng thống nhất mọi màn hình. |
| Độ tin cậy dữ liệu | NFR-04 | Dữ liệu hồ sơ, đơn ứng tuyển, tin đã lưu phải được lưu bền vững trong SQLite, không mất khi tắt/mở lại ứng dụng. |
| Khả năng mở rộng | NFR-05 | Data Access Layer (thao tác SQLite) tách biệt khỏi tầng giao diện để dễ dàng thay thế bằng Firebase/REST API nếu mở rộng sang Hướng B/C sau này. |
| Tương thích nền tảng | NFR-06 | Ứng dụng chạy ổn định trên cả Android và iOS thông qua Expo Go / development build. |

---

## 5. YÊU CẦU GIAO DIỆN NGƯỜI DÙNG (UI REQUIREMENTS)

### 5.1 Danh sách màn hình

| Màn hình | Loại | Mô tả |
|---|---|---|
| 1. Home (Tab) | Danh sách | Card danh sách tin tuyển dụng, thanh tìm kiếm, nút mở Bộ lọc, Loading/Error/Empty state. |
| 2. Filter (Modal/Screen) | Form lọc | Chọn ngành nghề, khoảng lương, hình thức; nút Áp dụng / Đặt lại. |
| 3. Job Detail | Chi tiết | Mô tả, yêu cầu, liên hệ, nút Ứng tuyển & Lưu tin. |
| 4. Profile (Tab) | Form | Form hồ sơ ứng viên có validate như mục FR-05. |
| 5. Applications (Tab) | Danh sách | Danh sách đơn đã ứng tuyển kèm badge trạng thái. |
| 6. Saved/Favorites (Tab) | Danh sách | Danh sách tin đã lưu, cho phép bỏ lưu trực tiếp. |

### 5.2 Bộ nhận diện màu sắc & phong cách
- Tông màu chủ đạo: xanh dương chuyên nghiệp (primary) phối cùng xanh lá/vàng năng động (accent) — phù hợp chủ đề tìm việc, gần gũi với đối tượng sinh viên.
- Typography: 1 font chính, phân cấp rõ ràng (tiêu đề, nội dung, phụ chú); cỡ chữ tối thiểu đảm bảo dễ đọc trên di động.
- Trạng thái ứng tuyển dùng màu badge riêng biệt: vàng (Đang chờ), xanh lá (Đã duyệt), đỏ (Từ chối).

### 5.3 Nguyên tắc xử lý trạng thái tải dữ liệu
- **Loading:** hiển thị ngay khi bắt đầu gọi truy vấn, ẩn khi có kết quả (thành công hoặc lỗi).
- **Error:** hiển thị thông báo ngắn gọn, thân thiện + nút "Thử lại".
- **Empty:** hiển thị minh hoạ/icon + câu gợi ý hành động phù hợp ngữ cảnh (VD: "Chưa có tin nào phù hợp, thử bỏ bớt bộ lọc").

---

## 6. MÔ HÌNH DỮ LIỆU (DATA MODEL — SQLite)

### 6.1 Bảng `jobs` — Tin tuyển dụng

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Định danh tin tuyển dụng |
| title | TEXT | NOT NULL | Tên công việc |
| category | TEXT | NOT NULL | Ngành nghề |
| salary_min | INTEGER | — | Mức lương tối thiểu (VNĐ) |
| salary_max | INTEGER | — | Mức lương tối đa (VNĐ) |
| work_type | TEXT | NOT NULL ('partime'\|'freelance') | Hình thức làm việc |
| location | TEXT | NOT NULL | Địa điểm làm việc |
| schedule | TEXT | — | Thời gian làm việc (VD: Thứ 2–6, 8h–17h) |
| description | TEXT | — | Mô tả công việc chi tiết |
| requirements | TEXT | — | Yêu cầu ứng viên |
| contact_info | TEXT | — | Thông tin liên hệ nhà tuyển dụng |
| created_at | TEXT | — | Thời điểm đăng tin (ISO string) |

### 6.2 Bảng `profile` — Hồ sơ ứng viên

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | INTEGER | PRIMARY KEY, CHECK (id = 1) | Chỉ 1 bản ghi duy nhất cho người dùng hiện tại |
| full_name | TEXT | NOT NULL | Họ và tên |
| phone | TEXT | NOT NULL | Số điện thoại liên hệ |
| email | TEXT | NOT NULL | Email liên hệ |
| skills | TEXT | — | Danh sách kỹ năng |
| bio | TEXT | — | Giới thiệu ngắn / CV rút gọn |

### 6.3 Bảng `applications` — Đơn ứng tuyển

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Định danh đơn ứng tuyển |
| job_id | INTEGER | FOREIGN KEY → jobs(id) | Tin tuyển dụng được ứng tuyển |
| status | TEXT | DEFAULT 'pending' | Trạng thái: pending \| approved \| rejected |
| applied_at | TEXT | — | Thời điểm ứng tuyển (ISO string) |

### 6.4 Bảng `favorites` — Tin đã lưu

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| job_id | INTEGER | PRIMARY KEY, FOREIGN KEY → jobs(id) | Tin tuyển dụng được đánh dấu yêu thích |

---

## 7. YÊU CẦU KỸ THUẬT & CẤU TRÚC DỰ ÁN

### 7.1 Công nghệ sử dụng

| Hạng mục | Công nghệ |
|---|---|
| Nền tảng | Expo (React Native, managed workflow) |
| Điều hướng | React Navigation (Stack + Bottom Tab) |
| Lưu trữ | expo-sqlite |
| Quản lý state | React Context API + Hooks |
| Validate form | react-hook-form + yup (hoặc validate thủ công) |
| Icon | @expo/vector-icons |

### 7.2 Cấu trúc thư mục dự án đề xuất

```
src/
  screens/        (Home, Filter, JobDetail, Profile, Applications, Saved)
  components/     (LoadingState, ErrorState, EmptyState, JobCard, ...)
  navigation/      (RootNavigator, TabNavigator, các Stack theo tab)
  db/              (database.js: init + seed + các hàm CRUD SQLite)
  context/         (ProfileContext, FavoritesContext, ...)
  theme/           (colors.js, typography.js)
  utils/           (validate.js, formatters.js)
```

---

## 8. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

Đối chiếu trực tiếp với checklist nộp bài của Đề tài 11:

- [ ] Danh sách và chi tiết tin tuyển dụng hiển thị đầy đủ (FR-01, FR-04).
- [ ] Bộ lọc theo ngành nghề/lương/hình thức hoạt động đúng (FR-03).
- [ ] Hồ sơ ứng viên tạo và chỉnh sửa được, có validate rõ ràng (FR-05).
- [ ] Ứng tuyển và theo dõi trạng thái đơn hoạt động (FR-06, FR-07).
- [ ] Lưu tin yêu thích hoạt động (FR-08).
- [ ] Đã triển khai đầy đủ Hướng tiếp cận A đã chọn.
- [ ] Tối thiểu 5 màn hình chức năng, điều hướng rõ ràng, hợp lý (NFR + mục 5.1).
- [ ] Xử lý đầy đủ Loading/Error/Empty State khi tải dữ liệu (NFR-02).
- [ ] Tối thiểu 1 form nhập liệu có validate rõ ràng (FR-05).
- [ ] Lưu trữ dữ liệu bằng SQLite (mục 6, NFR-04).
- [ ] Giao diện nhất quán, có bộ nhận diện màu sắc/phong cách riêng (mục 5.2, NFR-03).
- [ ] Có tài liệu mô tả kiến trúc dự án, hướng dẫn cài đặt và chạy (README.md).
- [ ] Có video và ảnh chụp demo đầy đủ các luồng chính khi nộp bài.
