# 📱 Ứng dụng Tìm việc Partime/Freelance cho Sinh viên (Đề tài 11)

> **Nền tảng:** React Native (Expo SDK 54) — **Lưu trữ CSDL Dual-Engine:** SQLite (`expo-sqlite`) + AsyncStorage (`@react-native-async-storage/async-storage` Fallback)  
> **Giao diện:** Modern Deep Teal (`#00667C`) Soft Shadows & Card rounded 16px — **Bản đồ GPS:** `react-native-maps` & `expo-location`  
> **Điều hướng:** React Navigation (Native Stack + 5 Bottom Tabs) — **Quản lý State:** React Context API  
> **Hướng tiếp cận:** Hướng A — Dành riêng cho Ứng viên (Candidate-only app với CSDL cục bộ & Seed Data)

---

## 📌 1. Giới thiệu tổng quan

Ứng dụng di động **"Tìm việc Partime/Freelance"** được thiết kế phong cách **Modern Deep Teal (`#00667C`)** chuyên nghiệp, dành riêng cho sinh viên và ứng viên tự do. Ứng dụng tích hợp đầy đủ tính năng tra cứu, tìm kiếm lọc theo bán kính khoảng cách, **xem bản đồ tuyển dụng GPS (Map View Tab)**, logo công ty xác thực, chi tiết bài đăng 3 tab, nộp/hủy đơn ứng tuyển và cập nhật ảnh đại diện cá nhân từ Camera/Thư viện ảnh.

Ứng dụng tích hợp cơ chế **Dual-Engine Persistence** độc quyền:
1. **Engine chính (SQLite Local DB):** Lưu trữ trong CSDL `job_finder.db` thông qua `expo-sqlite` modern API (`openDatabaseAsync`, `execAsync`, `runAsync`, `getAllAsync`, `getFirstAsync`).
2. **Engine dự phòng (AsyncStorage Fallback):** Tự động kích hoạt khi chạy ứng dụng trên môi trường Expo Go / thiết bị không hỗ trợ SQLite native bridge, đảm bảo **100% ứng dụng không bao giờ bị văng/crash** và mọi thao tác luôn mượt mà.

---

## 🛠️ 2. Công nghệ & Thư viện sử dụng

| Hạng mục | Công nghệ / Thư viện | Phiên bản | Mô tả vai trò |
|---|---|---|---|
| Framework | **React Native / Expo** | ~54.0.35 | Nền tảng ứng dụng di động đa nền tảng (iOS/Android) |
| Điều hướng | **React Navigation** | ^7.1.8 | Native Stack Navigator & 5 Bottom Tab Navigator |
| CSDL SQLite | **expo-sqlite** | ~16.0.10 | Quản trị CSDL SQLite cục bộ (bảng `jobs`, `profile`, `applications`, `favorites`) |
| Bản đồ GPS | **react-native-maps** | ~1.20.1 | Hiển thị ghim việc làm Marker, bong bóng lương & đường đi |
| Định vị GPS | **expo-location** | ~19.0.7 | Định vị GPS vị trí hiện tại của ứng viên & tính bán kính km |
| Image Picker | **expo-image-picker** | ~17.0.11 | Chọn ảnh đại diện từ Thư viện thiết bị hoặc Chụp trực tiếp từ Camera |
| Fallback Storage | **@react-native-async-storage/async-storage** | ~2.2.0 | Bộ lưu trữ dự phòng an toàn tuyệt đối cho Expo Go |
| Quản lý State | **React Context API** | Built-in | Quản lý & đồng bộ trạng thái ứng dụng toàn cục |
| Biểu tượng | **@expo/vector-icons** | ^15.0.3 | Sử dụng bộ icon Ionicons đồng nhất |

---

## 📁 3. Cấu trúc thư mục dự án

```
BT_NhatKyHT/
├── app/                      # Entry Point cấu hình Expo Router
│   ├── index.tsx             # Bao bọc AppProvider & render AppNavigator
│   └── _layout.tsx           # Layout gốc với SafeAreaProvider
├── docs/                     # Tài liệu thiết kế & Đặc tả SRS
│   ├── SRS-DeTai11-TimViecPartimeFreelance.md
│   └── prompt-de-tai-11-viec-lam.md
├── src/                      # Toàn bộ Mã nguồn Nền tảng & Màn hình Chức năng
│   ├── components/           # Component UI dùng chung
│   │   ├── EmptyState.js     # Trạng thái danh sách rỗng kèm nút gợi ý hành động
│   │   ├── ErrorState.js     # Trạng thái lỗi truy vấn kèm nút Thử lại
│   │   ├── JobCard.js        # Thẻ công việc Modern Teal, Logo 44px, Pill kỹ năng (React.memo)
│   │   ├── LoadingState.js   # Trạng thái màn hình đang tải dữ liệu
│   │   ├── ScreenWrapper.js  # Wrapper bao bọc màn hình chuẩn SafeArea
│   │   └── StatusBadge.js    # Badge nhãn trạng thái đơn (Đang chờ, Đã duyệt, Từ chối)
│   ├── context/
│   │   └── AppContext.js     # Context API quản lý state toàn cục & sync với CSDL
│   ├── db/
│   │   └── database.js       # Module SQLite & AsyncStorage Fallback (Seed 16 việc làm kèm Logo & GPS)
│   ├── navigation/
│   │   └── AppNavigator.js   # Bottom Tab Navigator (5 Tab: Home, Map, Saved, Applications, Profile)
│   ├── screens/              # Các màn hình giao diện người dùng
│   │   ├── ApplicationsScreen.js # Tab Đơn đã ứng tuyển (có Logo & nút Hủy đơn) (FR-07)
│   │   ├── FilterScreen.js       # Modal Bộ lọc nâng cao (FR-03)
│   │   ├── HomeScreen.js         # Tab Trang chủ (Banner Việc hot & Lọc bán kính) (FR-01, FR-02)
│   │   ├── JobDetailScreen.js    # Chi tiết công việc (Header Teal, Logo đè, 3 Tab & Mini Map) (FR-04, FR-06)
│   │   ├── MapViewScreen.js      # Tab Bản đồ GPS (Marker việc làm, khoảng cách km & Card Preview)
│   │   ├── ProfileScreen.js      # Tab Hồ sơ ứng viên (Đổi Avatar Camera/Thư viện & Form Validate) (FR-05)
│   │   └── SavedScreen.js        # Tab Việc làm đã lưu yêu thích (FR-08)
│   ├── theme/
│   │   ├── colors.js         # Palette màu Modern Deep Teal (#00667C), Soft Shadows, Card 16px
│   │   └── typography.js     # Quy chuẩn cỡ chữ, font-weight và phông nền
│   └── utils/
│       ├── formatters.js     # Tiện ích định dạng tiền tệ VNĐ, ngày tháng DD/MM/YYYY
│       └── validate.js       # Validate client-side cho Form Hồ sơ (Tên, SĐT, Email)
├── package.json
└── README.md
```

---

## ⚡ 4. Hướng dẫn Cài đặt & Khởi chạy

### Yêu cầu môi trường:
- Node.js (phiên bản 18+ trở lên)
- Npm hoặc Yarn
- Khuyến nghị sử dụng ứng dụng **Expo Go** trên thiết bị thật (iOS/Android) hoặc Android Studio / iOS Simulator.

### Các bước thực hiện:

1. **Di chuyển vào thư mục dự án:**
   ```bash
   cd d:/Bai-tap-mobile/BT_NhatKyHT
   ```

2. **Cài đặt các gói phụ thuộc (Dependencies):**
   ```bash
   npm install
   ```

3. **Khởi chạy máy chủ phát triển Expo:**
   ```bash
   npx expo start
   ```

4. **Trải nghiệm ứng dụng:**
   - Quét mã QR bằng ứng dụng **Expo Go** trên điện thoại (Android / iOS).
   - Nhấn `a` để mở trên Android Emulator hoặc `i` để mở trên iOS Simulator.
   - Nhấn `w` để chạy thử bản Web Preview.

---

## ✅ 5. Danh sách tính năng & Bảng nghiệm thu (Checklist SRS)

| Mã FR | Chức năng | Mô tả chi tiết | Trạng thái |
|---|---|---|---|
| **FR-01** | Xem danh sách tin tuyển dụng | Tự động tải từ CSDL, hiển thị thẻ JobCard Modern Teal, Logo công ty 44px, Pill kỹ năng, lương nổi bật. | ✅ **Hoàn thành** |
| **FR-02** | Tìm kiếm tin tuyển dụng | Tìm kiếm theo từ khóa tên việc/công ty/kỹ năng với kỹ thuật **Debounce 300ms** mượt mà. | ✅ **Hoàn thành** |
| **FR-03** | Lọc tin tuyển dụng | Form chọn ngành nghề, khoảng lương, hình thức (Part-time/Freelance) thực thi truy vấn SQL động. | ✅ **Hoàn thành** |
| **FR-04** | Xem chi tiết công việc | Header Deep Teal, Logo đè ranh giới, Grid 3 ô chỉ số, Tab 3 mục ("Mô tả", "Thông tin chung", "Công ty") & Mini Map kèm nút Chỉ đường. | ✅ **Hoàn thành** |
| **FR-05** | Quản lý Hồ sơ & Đổi Avatar | Form nhập thông tin có **Client-side Validation chi tiết**. Avatar tròn nổi bật có nút máy ảnh 📷 đổi ảnh từ **Camera** hoặc **Thư viện ảnh** (`expo-image-picker`), đồng bộ góc Trang chủ. | ✅ **Hoàn thành** |
| **FR-06** | Ứng tuyển & Hủy ứng tuyển | Nộp đơn 1-touch kèm Popup xác nhận, ngăn nộp trùng đơn cùng job. Bổ sung tính năng **Hủy ứng tuyển** có Alert xác nhận, giải phóng bài đăng để ứng tuyển lại. | ✅ **Hoàn thành** |
| **FR-07** | Theo dõi trạng thái đơn | Danh sách việc đã ứng tuyển kèm Logo nhà tuyển dụng, **StatusBadge màu sắc** (Đang chờ, Đã duyệt, Từ chối) và nút Hủy đơn nhanh. | ✅ **Hoàn thành** |
| **FR-08** | Lưu / Bỏ lưu tin yêu thích | Toggle lưu việc làm yêu thích bằng icon trái tim, cập nhật thời gian thực trên tab Đã lưu. | ✅ **Hoàn thành** |
| **FR-09** | Bản đồ Tuyển dụng GPS | **Tab Bản đồ (`MapViewScreen`)**: Ghim Marker ghim việc làm kèm mức lương, định vị GPS vị trí hiện tại (`expo-location`), tính khoảng cách km và Preview Card trượt ở đáy. | ✅ **Hoàn thành** |

---
*Tài liệu được hoàn thiện và đóng gói cho Đề tài 11.*
