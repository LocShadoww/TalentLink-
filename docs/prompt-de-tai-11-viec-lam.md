# PROMPT — Xây dựng App "Tìm việc Partime/Freelance" bằng Expo (Đề tài 11)

Bạn là một lập trình viên React Native/Expo senior. Hãy xây dựng hoàn chỉnh một ứng dụng di động theo đặc tả chi tiết dưới đây. Viết code sạch, có cấu trúc thư mục rõ ràng, comment ngắn gọn ở những chỗ phức tạp.

## 1. Bối cảnh & mục tiêu
Sinh viên/lao động tự do khó tìm việc làm thêm phù hợp vì thông tin nằm rải rác. Ứng dụng tập trung các tin tuyển dụng partime/freelance, cho phép người dùng lọc, xem chi tiết và ứng tuyển nhanh.

**Hướng tiếp cận:** Hướng A — chỉ dành cho ứng viên (không có vai trò nhà tuyển dụng). Tin tuyển dụng là dữ liệu có sẵn (seed data), trọng tâm là trải nghiệm tìm và ứng tuyển việc.

## 2. Tech stack bắt buộc
- **Expo** (managed workflow, dùng `npx create-expo-app`)
- **React Navigation** — kết hợp Stack Navigator (điều hướng chi tiết) + Bottom Tab Navigator (điều hướng chính: Trang chủ, Tìm kiếm, Đã lưu, Hồ sơ)
- **expo-sqlite** làm lớp lưu trữ dữ liệu chính (danh sách việc làm seed sẵn, hồ sơ ứng viên, đơn ứng tuyển, việc đã lưu đều lưu trong SQLite — không dùng AsyncStorage/localStorage cho dữ liệu chính)
- State management: Context API + hooks (không cần Redux)
- Form validation: viết validate thủ công hoặc dùng `react-hook-form` + `zod`/`yup`
- Icon: `@expo/vector-icons`

## 3. Cấu trúc màn hình (tối thiểu 5 màn hình, có luồng điều hướng rõ ràng)

1. **Home / Danh sách tin tuyển dụng** (Tab)
   - Danh sách card: tên công việc, mức lương, thời gian làm việc, địa điểm, hình thức (partime/freelance)
   - Thanh tìm kiếm + nút mở Bộ lọc
   - Loading state (skeleton hoặc spinner) khi tải dữ liệu từ SQLite
   - Empty state khi không có kết quả phù hợp
   - Error state nếu query SQLite lỗi

2. **Bộ lọc (Filter)** — màn hình hoặc modal
   - Lọc theo: ngành nghề, khoảng mức lương, hình thức (partime/freelance)
   - Áp dụng bộ lọc → quay lại Home với danh sách đã lọc

3. **Chi tiết công việc (Job Detail)**
   - Mô tả công việc, yêu cầu, mức lương, thời gian, địa điểm, thông tin liên hệ nhà tuyển dụng (dữ liệu tĩnh)
   - Nút "Ứng tuyển ngay" + nút "Lưu tin" (toggle yêu thích)
   - Loading/Error state khi load chi tiết theo id

4. **Hồ sơ ứng viên (Profile) — có FORM nhập liệu bắt buộc**
   - Form: Họ tên, số điện thoại, email, kỹ năng, giới thiệu ngắn (CV rút gọn)
   - **Validation rõ ràng:** bắt buộc nhập họ tên, số điện thoại đúng định dạng VN (10 số), email đúng định dạng, hiển thị thông báo lỗi thân thiện dưới từng trường, disable nút Lưu khi form invalid
   - Lưu hồ sơ vào SQLite, cho phép chỉnh sửa lại

5. **Đã ứng tuyển / Trạng thái đơn (Applications)** (Tab)
   - Danh sách các việc đã ứng tuyển kèm trạng thái: Đang chờ / Đã duyệt / Từ chối (mock trạng thái, có thể random hoặc set mặc định "Đang chờ")
   - Empty state khi chưa ứng tuyển tin nào

6. **Việc đã lưu (Saved/Favorites)** (Tab)
   - Danh sách tin đã lưu yêu thích, cho phép bỏ lưu
   - Empty state khi chưa lưu tin nào

> Điều hướng: Bottom Tab (Home, Đã lưu, Đã ứng tuyển, Hồ sơ) → mỗi tab là 1 Stack Navigator riêng để push sang Job Detail / Filter.

## 4. Data model (SQLite)

```sql
-- jobs (seed sẵn ~15-20 bản ghi mẫu)
CREATE TABLE jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,       -- ngành nghề
  salary_min INTEGER,
  salary_max INTEGER,
  work_type TEXT NOT NULL,      -- 'partime' | 'freelance'
  location TEXT NOT NULL,
  schedule TEXT,                -- thời gian làm việc
  description TEXT,
  requirements TEXT,
  contact_info TEXT,
  created_at TEXT
);

-- profile (chỉ 1 bản ghi, hồ sơ người dùng hiện tại)
CREATE TABLE profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  full_name TEXT,
  phone TEXT,
  email TEXT,
  skills TEXT,
  bio TEXT
);

-- applications (đơn ứng tuyển)
CREATE TABLE applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER REFERENCES jobs(id),
  status TEXT DEFAULT 'pending', -- pending | approved | rejected
  applied_at TEXT
);

-- favorites (việc đã lưu)
CREATE TABLE favorites (
  job_id INTEGER PRIMARY KEY REFERENCES jobs(id)
);
```

## 5. Yêu cầu kỹ thuật chung (bắt buộc theo đề — phải đảm bảo đủ)
- [x] React Native (Expo) + React Navigation (Stack + Tab)
- [x] Tối thiểu 5 màn hình chức năng, luồng điều hướng rõ ràng
- [x] Xử lý đầy đủ **Loading / Error / Empty State** ở mọi màn hình tải dữ liệu (dùng component tái sử dụng `<LoadingState />`, `<ErrorState />`, `<EmptyState />`)
- [x] Tối thiểu 1 form nhập liệu có validate rõ ràng (màn Hồ sơ)
- [x] Lưu trữ dữ liệu bằng SQLite (expo-sqlite)
- [x] Giao diện nhất quán, có bộ nhận diện màu sắc/phong cách riêng phù hợp chủ đề "tìm việc" (gợi ý: tông xanh dương/xanh lá chuyên nghiệp, năng động, thân thiện với sinh viên)

## 6. Yêu cầu triển khai cụ thể cho AI
1. Khởi tạo project Expo, cài đặt đầy đủ dependencies cần thiết (liệt kê rõ lệnh `npx expo install ...`)
2. Tạo cấu trúc thư mục: `src/screens`, `src/components`, `src/navigation`, `src/db` (khởi tạo & seed SQLite), `src/context`, `src/utils` (validate), `src/theme` (màu sắc, typography dùng chung)
3. Viết file `src/db/database.js` xử lý init DB, tạo bảng, seed dữ liệu mẫu (chỉ seed nếu bảng jobs rỗng)
4. Viết đầy đủ các component `LoadingState`, `ErrorState`, `EmptyState` dùng chung cho toàn bộ app
5. Viết toàn bộ 5+ màn hình theo mô tả ở mục 3, kết nối thật với SQLite (không hardcode dữ liệu trong component)
6. Áp dụng theme màu sắc nhất quán (tạo file `theme/colors.js`, `theme/typography.js`) và dùng xuyên suốt
7. Sau khi code xong, viết ngắn gọn file `README.md` mô tả kiến trúc dự án, hướng dẫn cài đặt và chạy (`npm install`, `npx expo start`)

## 7. Output mong muốn
Trả về đầy đủ code từng file (đường dẫn rõ ràng), theo đúng thứ tự: cấu hình project → database → theme → components dùng chung → navigation → từng màn hình. Không rút gọn hay dùng "..." trong code, viết đầy đủ để có thể chạy được ngay.
