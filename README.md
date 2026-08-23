# 📱 Ứng dụng Tìm việc Partime/Freelance cho Sinh viên (Đề tài 11)

> **Nền tảng:** React Native (Expo SDK 54) — **Lưu trữ CSDL:** Firebase (Cloud Firestore & Authentication)
> **Giao diện:** Modern Deep Teal (`#00667C`) Soft Shadows & Card rounded 16px — **Bản đồ GPS:** `react-native-maps` & `expo-location`
> **Điều hướng:** React Navigation (Native Stack + Bottom Tabs đa vai trò) — **Quản lý State:** React Context API
> **Hướng tiếp cận:** Tích hợp toàn diện Hướng A, B, C (Ứng viên, Nhà tuyển dụng, Vị trí địa lý).

---

## 📌 1. Giới thiệu tổng quan

Ứng dụng di động **"Tìm việc Partime/Freelance"** được thiết kế phong cách **Modern Deep Teal (`#00667C`)** chuyên nghiệp, đóng vai trò như một Sàn giao dịch việc làm thu nhỏ (Marketplace). Ứng dụng tích hợp đầy đủ tính năng tra cứu, tìm kiếm lọc theo bán kính khoảng cách, **xem bản đồ tuyển dụng GPS (Map View Tab)**, nộp/hủy đơn ứng tuyển và quản lý hồ sơ.

Đặc biệt, hệ thống được nâng cấp toàn diện với **Firebase**:
1. **Phân quyền 2 vai trò:** Hỗ trợ song song tài khoản Ứng viên (Candidate) và Nhà tuyển dụng (Employer) với luồng giao diện tách biệt hoàn toàn.
2. **Lưu trữ Đám mây toàn diện:** 
   - **Cloud Firestore:** Dữ liệu ứng tuyển, việc làm, hồ sơ được đồng bộ hóa thời gian thực, có hỗ trợ phân trang (Infinite Scroll).
   - **Cloud Firestore:** Hỗ trợ lưu trữ ảnh đại diện, logo công ty an toàn thông qua chuỗi Base64 Data URI trực tiếp trên bản ghi.
3. **Bảo mật tối đa (Security Rules):** Thiết lập `firestore.rules` và `storage.rules` chặt chẽ, bảo vệ dữ liệu theo vai trò và quyền sở hữu.
4. **Tương tác thời gian thực:**
   - **Thông báo đẩy (Push Notifications):** Sử dụng Expo Push API gửi thông báo client-to-client khi có đơn ứng tuyển hoặc tin nhắn mới.
   - **Nhắn tin 1-1 (Direct Messaging):** Tích hợp tính năng Chat trực tiếp giữa ứng viên và nhà tuyển dụng (Realtime qua Firestore).
5. **Xác thực Đa dạng:** Hỗ trợ đăng nhập linh hoạt bằng Email hoặc Số điện thoại (Firebase Auth).

---

## 🛠️ 2. Công nghệ & Thư viện sử dụng

| Hạng mục | Công nghệ / Thư viện | Phiên bản | Mô tả vai trò |
|---|---|---|---|
| Framework | **React Native / Expo** | ~54.0.35 | Nền tảng ứng dụng di động đa nền tảng (iOS/Android) |
| Điều hướng | **React Navigation** | ^7.1.8 | Native Stack Navigator & Bottom Tab Navigator (Đa nhánh) |
| Máy chủ / CSDL | **Firebase** | ^11.3.1 | Quản trị CSDL (Firestore), Xác thực (Auth), và Lưu trữ (Storage) |
| Bảo mật CSDL | **Firebase Rules** | - | Phân quyền truy cập và giới hạn tải tệp qua Firestore/Storage Rules |
| Bản đồ GPS | **react-native-maps** | ~1.20.1 | Hiển thị ghim việc làm Marker, bong bóng lương & đường đi |
| Định vị GPS | **expo-location** | ~19.0.7 | Định vị GPS vị trí hiện tại của ứng viên & tính khoảng cách |
| Thông báo đẩy | **expo-notifications** | ~0.29.11 | Gửi/Nhận thông báo Push Notification client-to-client qua Expo API |
| Image Picker | **expo-image-picker** | ~17.0.11 | Chọn ảnh tải lên trực tiếp lưu thành Base64 vào Firestore |
| Quản lý State | **React Context API** | Built-in | Quản lý & đồng bộ trạng thái ứng dụng toàn cục (State Bleeding Fix) |
| Biểu tượng | **@expo/vector-icons** | ^15.0.3 | Sử dụng bộ icon Ionicons đồng nhất |

---

## 📁 3. Cấu trúc thư mục dự án

```
BT_NhatKyHT/
├── docs/                     # Tài liệu thiết kế & Đặc tả
│   ├── SRS-DeTai11-TimViecPartimeFreelance.md
│   ├── prompt-de-tai-11-viec-lam.md
│   ├── NguyenVanDeTai11.md
│   └── BaoCaoKyNangReact.md  # Báo cáo áp dụng kỹ thuật React Native
├── src/                      # Toàn bộ Mã nguồn Nền tảng
│   ├── components/           # Component UI dùng chung (JobCard, EmptyState, LoadingState)
│   ├── config/
│   │   └── firebase.js       # Khởi tạo kết nối Firebase
│   ├── context/
│   │   └── AppContext.js     # Context API quản lý Session, Jobs, Profile
│   ├── db/
│   │   └── database.js       # Module tập trung toàn bộ lệnh gọi CRUD tới Firestore
│   ├── navigation/
│   │   └── AppNavigator.js   # Logic rẽ nhánh: Auth ↔ Candidate Tabs ↔ Employer Tabs
│   ├── screens/              # Các màn hình giao diện
│   │   ├── LoginScreen, RegisterScreen # Luồng xác thực
│   │   ├── HomeScreen, MapViewScreen, ApplicationsScreen, SavedScreen # Luồng Ứng viên
│   │   ├── EmployerJobsScreen, EmployerPostJobScreen, EmployerCandidatesScreen # Luồng Tuyển dụng
│   │   └── JobDetailScreen, ProfileScreen, EmployerProfileScreen # Màn hình chung/chi tiết
│   ├── theme/
│   │   └── colors.js, typography.js # Chuẩn hóa Palette Teal & Font
│   └── utils/
│       └── formatters.js, validate.js
├── package.json
└── README.md
```

---

## ⚡ 4. Hướng dẫn Cài đặt & Khởi chạy

### Yêu cầu môi trường:
- Node.js (phiên bản 18+ trở lên)
- Đã cài đặt Expo CLI (`npm install -g expo-cli`)

### Các bước thực hiện:

1. **Cài đặt các gói phụ thuộc (Dependencies):**
   ```bash
   npm install
   ```

2. **Cấu hình Firebase (Tùy chọn):**
   Tạo file `.env` ở thư mục gốc (nếu chưa có) và cấu hình khóa API Firebase tương ứng.

3. **Khởi chạy máy chủ phát triển Expo:**
   ```bash
   npx expo start
   ```

4. **Trải nghiệm ứng dụng:**
   - Quét mã QR bằng ứng dụng **Expo Go** trên điện thoại (Android / iOS).
   - Có thể dùng tài khoản Ứng viên hoặc đăng ký mới tài khoản Nhà Tuyển dụng để test cả 2 luồng.

---

## ✅ 5. Danh sách tính năng (Nghiệm thu)

| Chức năng | Phân luồng | Trạng thái |
|---|---|---|
| **Đăng ký / Đăng nhập** | Chung | ✅ Firebase Auth (Email/SĐT) |
| **Đăng tin tuyển dụng** | Nhà tuyển dụng | ✅ Form tạo tin, GPS tọa độ tự động |
| **Quản lý Ứng viên** | Nhà tuyển dụng | ✅ Lọc trạng thái, Duyệt/Từ chối CV, **Nhắn tin trực tiếp** |
| **Tìm việc & Bản đồ** | Ứng viên | ✅ Danh sách FlatList có **Cuộn vô hạn (Infinite Scroll)**, Tìm kiếm Debounce, Mini-map |
| **Nộp đơn & Lưu tin** | Ứng viên | ✅ Dữ liệu đổ thẳng Firebase, 1 chạm nộp đơn/hủy đơn, **Gửi Thông báo Push tới NTD** |
| **Quản lý Hồ sơ** | Chung | ✅ Tải ảnh Avatar/Logo lên **Cloud Firestore** bằng Base64, Cập nhật thông tin công ty / CV cá nhân |
| **Bảo mật & Phân quyền** | Hệ thống | ✅ **Firestore Rules & Storage Rules** (chặn truy cập trái phép) |
| **Nhắn tin trực tiếp** | Chung | ✅ Màn hình Chat realtime giữa Ứng viên và Nhà tuyển dụng |

---
*Dự án hoàn thiện 100% mục tiêu Đề tài 11.*
