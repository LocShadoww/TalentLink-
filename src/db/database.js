// src/db/database.js
// Module Quản trị CSDL SQLite & Fallback Storage (AsyncStorage) cho Expo Go (Synced 6 Standard Categories)

import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DB_NAME = 'job_finder.db';
let dbInstance = null;
let useFallbackMode = false;

/**
 * Trợ giúp lấy thể hiện DB Singleton an toàn không bao giờ bị null
 */
export const getDBConnection = async () => {
  if (dbInstance) return dbInstance;
  try {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
    return dbInstance;
  } catch (e) {
    console.warn('⚠️ SQLite Open error:', e);
    return null;
  }
};

// Các Key lưu trữ cho Chế độ Fallback AsyncStorage
const KEYS = {
  JOBS: '@job_finder_jobs',
  USERS: '@job_finder_users',
  CURRENT_USER: '@current_user',
  PROFILE: '@job_finder_profile',
  APPLICATIONS: '@job_finder_applications',
  FAVORITES: '@job_finder_favorites',
};

/**
 * Dữ liệu seed 15 tin tuyển dụng mẫu chia đều cho 6 nhóm ngành nghề cố định:
 * 1. "Công nghệ thông tin" (3 jobs)
 * 2. "Phục vụ & Nhà hàng" (3 jobs)
 * 3. "Bán hàng & Thu ngân" (3 jobs)
 * 4. "Gia sư & Giáo dục" (2 jobs)
 * 5. "Marketing & Truyền thông" (2 jobs)
 * 6. "Giao hàng & Lao động" (2 jobs)
 */
export const SEED_JOBS = [
  // --------------------------------------------------------------------------
  // NHÓM 1: CÔNG NGHỆ THÔNG TIN (3 Jobs)
  // --------------------------------------------------------------------------
  {
    id: 1,
    title: 'Lập trình viên Frontend React/JS (Part-time / Remote)',
    company_name: 'Digital Agency Cao Lãnh',
    company_logo: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=150&q=80',
    category: 'Công nghệ thông tin',
    salary_min: 3500000,
    salary_max: 6000000,
    work_type: 'freelance',
    location: 'TP. Cao Lãnh, Đồng Tháp (Hỗ trợ Remote)',
    latitude: 10.455000,
    longitude: 105.636000,
    skills_tags: 'React Native, JavaScript, HTML/CSS, Git',
    schedule: 'Làm việc linh hoạt 20h/tuần',
    description: 'Phát triển giao diện ứng dụng di động & website bán hàng cho doanh nghiệp địa phương tại TP. Cao Lãnh.',
    requirements: 'Nắm vững JavaScript ES6, React hoặc React Native basic, có tinh thần học hỏi.',
    contact_info: 'Zalo / Email: tech.sadec@digital.vn - SĐT: 0944 111 222',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 2,
    title: 'Thực tập sinh Thiết kế Web & Hỗ trợ Kỹ thuật IT',
    company_name: 'Văn phòng Công nghệ DTHU',
    company_logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=150&q=80',
    category: 'Công nghệ thông tin',
    salary_min: 2500000,
    salary_max: 4500000,
    work_type: 'internship',
    location: 'Trường Đại học Đồng Tháp (DTHU), Cao Lãnh',
    latitude: 10.421068150262151,
    longitude: 105.6440429497817,
    skills_tags: 'WordPress, Figma, Photoshop, Sửa máy tính',
    schedule: 'Đăng ký ca theo lịch rảnh học tập',
    description: 'Hỗ trợ quản trị website trung tâm, xử lý sự cố mạng máy tính phòng máy và thiết kế banner sự kiện.',
    requirements: 'Sinh viên CNTT hoặc Điện tử DTHU từ năm 2 trở lên, cẩn thận, nhiệt tình.',
    contact_info: 'Email: it.dthu@edu.vn - SĐT: 0912 345 678',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 3,
    title: 'Nhân viên Quản trị Website & Cài đặt Hệ thống',
    company_name: 'Cửa hàng Tin học Cao Lãnh',
    company_logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80',
    category: 'Công nghệ thông tin',
    salary_min: 25000,
    salary_max: 35000,
    work_type: 'partime',
    location: 'Siêu thị Co.opmart Cao Lãnh, Đồng Tháp',
    latitude: 10.459814852396988,
    longitude: 105.64077898376208,
    skills_tags: 'Cài Win, Đăng sản phẩm, Chuẩn SEO',
    schedule: 'Ca sáng (8h-12h) hoặc Ca chiều (13h-17h)',
    description: 'Cài đặt phần mềm máy tính cho khách hàng mua sắm, cập nhật giá và hình ảnh linh kiện lên website bán hàng.',
    requirements: 'Thành thạo tháo lắp linh kiện PC cơ bản, giao tiếp thân thiện.',
    contact_info: 'SĐT / Zalo: 0918 222 333 (Anh Hải - Quản lý kỹ thuật)',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },

  // --------------------------------------------------------------------------
  // NHÓM 2: PHỤC VỤ & NHÀ HÀNG (3 Jobs)
  // --------------------------------------------------------------------------
  {
    id: 4,
    title: 'Nhân viên Phục vụ Quán Cafe Trà Sữa',
    company_name: 'HighCafe Chợ Cao Lãnh',
    company_logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=150&q=80',
    category: 'Phục vụ & Nhà hàng',
    salary_min: 25000,
    salary_max: 32000,
    work_type: 'partime',
    location: 'Chợ Cao Lãnh, Đồng Tháp',
    latitude: 10.453966270644129,
    longitude: 105.63848453719581,
    skills_tags: 'Pha chế, Giao tiếp, Xoay ca sinh viên',
    schedule: 'Ca sáng (7h-12h) hoặc Ca tối (17h-22h)',
    description: 'Pha chế đồ uống cơ bản, nhận order từ khách hàng, giữ gìn vệ sinh khu vực làm việc và hỗ trợ thanh toán tại quầy.',
    requirements: 'Nhanh nhẹn, trung thực, ưu tiên sinh viên DTHU có thể xoay ca theo tuần, không yêu cầu kinh nghiệm.',
    contact_info: 'Hotline / Zalo: 0901 234 567 (Anh Hùng - Quản lý HighCafe Chợ Cao Lãnh)',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 5,
    title: 'Phụ bếp & Pha chế Ca Linh Hoạt',
    company_name: 'Nhà hàng Ẩm thực Vincom Plaza',
    company_logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=150&q=80',
    category: 'Phục vụ & Nhà hàng',
    salary_min: 28000,
    salary_max: 35000,
    work_type: 'partime',
    location: 'Vincom Plaza Cao Lãnh, Đồng Tháp',
    latitude: 10.45644330302131,
    longitude: 105.63377815122429,
    skills_tags: 'Phụ bếp, Sơ chế nguyên liệu, Gọn gàng',
    schedule: 'Ca trưa (10h-14h) hoặc Ca tối (17h-21h30)',
    description: 'Sơ chế rau củ quả, chuẩn bị đĩa ăn cho đầu bếp chính và hỗ trợ rửa dọn khu vực bếp.',
    requirements: 'Sạch sẽ, tuân thủ vệ sinh an toàn thực phẩm, chăm chỉ.',
    contact_info: 'Đăng ký tại quầy Lễ tân Nhà hàng - SĐT: 0933 445 566',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 6,
    title: 'Nhân viên Order & Bưng bê Căn tin DTHU',
    company_name: 'Căn tin Trung tâm DTHU',
    company_logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=150&q=80',
    category: 'Phục vụ & Nhà hàng',
    salary_min: 22000,
    salary_max: 28000,
    work_type: 'partime',
    location: 'Khuôn viên ĐH Đồng Tháp (DTHU), Cao Lãnh',
    latitude: 10.421568,
    longitude: 105.644542,
    skills_tags: 'Bưng bê, Thu dọn bàn, Nhanh nhẹn',
    schedule: 'Ca sáng (6h30-10h) hoặc Ca trưa (11h-13h30)',
    description: 'Bưng bê cơm suất và nước uống cho giảng viên sinh viên, thu dọn khay ăn và giữ vệ sinh bàn ghế.',
    requirements: 'Ưu tiên sinh viên DTHU đăng ký ca làm trống giữa các giờ học.',
    contact_info: 'Đăng ký trực tiếp tại Quầy Quản lý Căn tin DTHU - SĐT: 0912 345 678',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },

  // --------------------------------------------------------------------------
  // NHÓM 3: BÁN HÀNG & THU NGÂN (3 Jobs)
  // --------------------------------------------------------------------------
  {
    id: 7,
    title: 'Nhân viên Thu ngân Siêu thị Co.opmart Cao Lãnh',
    company_name: 'Co.opmart Cao Lãnh',
    company_logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80',
    category: 'Bán hàng & Thu ngân',
    salary_min: 30000,
    salary_max: 38000,
    work_type: 'partime',
    location: 'Siêu thị Co.opmart Cao Lãnh, Đồng Tháp',
    latitude: 10.459814852396988,
    longitude: 105.64077898376208,
    skills_tags: 'Thu ngân POS, Quét mã vạch, Cẩn thận',
    schedule: 'Ca 1 (7h30-12h30) / Ca 2 (12h30-17h30)',
    description: 'Quét mã vạch tính tiền đơn hàng cho khách siêu thị Co.opmart, xuất hóa đơn và bàn giao tiền mặt quầy.',
    requirements: 'Tính toán chính xác, cẩn thận, không nợ xấu, ưu tiên sinh viên.',
    contact_info: 'Nộp CV tại Phòng Nhân sự Co.opmart Cao Lãnh - SĐT: 0918 222 333',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 8,
    title: 'Nhân viên Bán hàng & Tư vấn Thời trang',
    company_name: 'Showroom Thời trang Vincom',
    company_logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=150&q=80',
    category: 'Bán hàng & Thu ngân',
    salary_min: 25000,
    salary_max: 35000,
    work_type: 'partime',
    location: 'Vincom Plaza Cao Lãnh, Đồng Tháp',
    latitude: 10.45644330302131,
    longitude: 105.63377815122429,
    skills_tags: 'Tư vấn quần áo, Giao tiếp, Thẩm mỹ',
    schedule: 'Ca xoay chiều tối (13h-18h / 18h-22h)',
    description: 'Đón tiếp khách hàng tham quan mua sắm quần áo, tư vấn chọn size/màu sắc và gấp xếp hàng hóa ngăn nắp.',
    requirements: 'Ngoại hình sáng, giao tiếp tự tin, thích công việc thời trang.',
    contact_info: 'Đăng ký tại Quầy Showroom Vincom - SĐT: 0933 445 566',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 9,
    title: 'Nhân viên Sắp xếp kệ hàng & Kiểm kho',
    company_name: 'Bách Hóa Xanh Phường 2',
    company_logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80',
    category: 'Bán hàng & Thu ngân',
    salary_min: 28000,
    salary_max: 32000,
    work_type: 'partime',
    location: 'Chợ Cao Lãnh, Phường 2, TP. Cao Lãnh',
    latitude: 10.453966270644129,
    longitude: 105.63848453719581,
    skills_tags: 'Sắp xếp kệ hàng, Kiểm hạn dùng, Trung thực',
    schedule: 'Ca sáng (6h-11h) hoặc Ca tối (16h-21h)',
    description: 'Chưng diện thực phẩm rau củ lên kệ hàng Bách Hóa Xanh, kiểm tra hạn sử dụng tem mác sản phẩm.',
    requirements: 'Trung thực, chăm chỉ, có sức khỏe tốt.',
    contact_info: 'Quản lý Cửa hàng Bách Hóa Xanh P2 - SĐT: 0977 888 999',
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
  },

  // --------------------------------------------------------------------------
  // NHÓM 4: GIA SƯ & GIÁO DỤC (2 Jobs)
  // --------------------------------------------------------------------------
  {
    id: 10,
    title: 'Gia sư Dạy kèm Toán - Tin học Cấp 2/3',
    company_name: 'Nhóm Gia sư Sinh viên DTHU',
    company_logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=150&q=80',
    category: 'Gia sư & Giáo dục',
    salary_min: 80000,
    salary_max: 120000,
    work_type: 'partime',
    location: 'Khu vực gần ĐH Đồng Tháp (DTHU), Cao Lãnh',
    latitude: 10.421068150262151,
    longitude: 105.6440429497817,
    skills_tags: 'Kỹ năng sư phạm, Toán cấp 2/3, Kiên nhẫn',
    schedule: 'Tuần 3 buổi tối (18h30 - 20h00)',
    description: 'Kèm kiến thức Toán & Tin học cơ bản cho học sinh THCS/THPT, dò bài tập về nhà và ôn thi cuối kỳ.',
    requirements: 'Sinh viên Sư phạm Toán hoặc CNTT DTHU học lực Khá/Giỏi, kiên nhẫn với học sinh.',
    contact_info: 'Hotline / Zalo: 0912 345 678 (Chị Thảo - Điều phối Gia sư DTHU)',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 11,
    title: 'Trợ giảng Tiếng Anh cho Trẻ em',
    company_name: 'Trung tâm Ngoại ngữ Phường 1',
    company_logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=150&q=80',
    category: 'Gia sư & Giáo dục',
    salary_min: 40000,
    salary_max: 60000,
    work_type: 'partime',
    location: 'Công viên Văn Miếu Cao Lãnh, Đồng Tháp',
    latitude: 10.461376329766749,
    longitude: 105.6342451226954,
    skills_tags: 'Tiếng Anh giao tiếp, Quản trò, Phát âm chuẩn',
    schedule: 'Tối Thứ 7 & Chủ nhật (17h30 - 19h30)',
    description: 'Hỗ trợ giáo viên nước ngoài quản lý lớp học tiếng Anh mầm non/tiểu học, tổ chức trò chơi tương tác tiếng Anh.',
    requirements: 'Tiếng Anh giao tiếp tốt, yêu trẻ em, hoạt náo năng động.',
    contact_info: 'Email: trogiang.english@center.edu.vn - SĐT: 0988 776 655',
    created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
  },

  // --------------------------------------------------------------------------
  // NHÓM 5: MARKETING & TRUYỀN THÔNG (2 Jobs)
  // --------------------------------------------------------------------------
  {
    id: 12,
    title: 'Thực tập sinh Sáng tạo Nội dung / Video ngắn TikTok',
    company_name: 'Shop Thời trang Trẻ Cao Lãnh',
    company_logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80',
    category: 'Marketing & Truyền thông',
    salary_min: 2000000,
    salary_max: 4000000,
    work_type: 'freelance',
    location: 'Khu Di Tích Nguyễn Sinh Sắc, TP. Cao Lãnh',
    latitude: 10.446893862505632,
    longitude: 105.63106992423924,
    skills_tags: 'CapCut, Quay phim bằng Smartphone, Trend TikTok',
    schedule: 'Theo sản phẩm 3 video/tuần',
    description: 'Lên ý tưởng kịch bản, quay clip ngắn tư vấn mặc đẹp bằng điện thoại và dựng video đăng tải TikTok / Reels.',
    requirements: 'Thích sáng tạo nội dung, có gu thẩm mỹ, biết sử dụng phần mềm CapCut.',
    contact_info: 'Zalo: 0977 888 999 (Chị Mai - Chủ Shop)',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 13,
    title: 'Cộng tác viên Chụp ảnh & Viết bài Fanpage',
    company_name: 'Khu Ẩm thực Văn Miếu Studio',
    company_logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=150&q=80',
    category: 'Marketing & Truyền thông',
    salary_min: 1500000,
    salary_max: 3000000,
    work_type: 'freelance',
    location: 'Công viên Văn Miếu Cao Lãnh, Đồng Tháp',
    latitude: 10.461376329766749,
    longitude: 105.6342451226954,
    skills_tags: 'Chụp ảnh món ăn, Viết Content, Lightroom',
    schedule: 'Linh hoạt làm việc tại nhà',
    description: 'Chụp hình các món ăn đặc sản tại nhà hàng, viết bài bài đăng truyền thông giới thiệu khuyến mãi trên Fanpage.',
    requirements: 'Có khả năng viết lách ngắn gọn hấp dẫn, có mắt chụp ảnh căn góc đẹp.',
    contact_info: 'Email: media.vanmieu@studio.vn - SĐT: 0988 776 655',
    created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
  },

  // --------------------------------------------------------------------------
  // NHÓM 6: GIAO HÀNG & LAO ĐỘNG (2 Jobs)
  // --------------------------------------------------------------------------
  {
    id: 14,
    title: 'Nhân viên Giao hàng Ca Sinh Viên',
    company_name: 'Dịch vụ Giao vận Bến Xe',
    company_logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80',
    category: 'Giao hàng & Lao động',
    salary_min: 35000,
    salary_max: 50000,
    work_type: 'partime',
    location: 'Bến xe Cao Lãnh, Đồng Tháp',
    latitude: 10.448288550052059,
    longitude: 105.67313262423923,
    skills_tags: 'Rành đường TP. Cao Lãnh, Xe máy cá nhân, Thật thà',
    schedule: 'Ca sáng (8h-12h) hoặc Ca chiều (13h-17h)',
    description: 'Nhận kiện hàng gửi bưu phẩm từ Bến xe Cao Lãnh và giao tận tay người nhận trong khu vực nội ô TP. Cao Lãnh.',
    requirements: 'Có xe máy cá nhân, thông thuộc đường xá Cao Lãnh, thật thà.',
    contact_info: 'Đăng ký tại Quầy Bến xe Cao Lãnh - SĐT: 0944 111 222',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 15,
    title: 'Đóng gói và Phân loại Bưu kiện Theo Ca',
    company_name: 'Kho Vận Bệnh viện ĐK',
    company_logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=150&q=80',
    category: 'Giao hàng & Lao động',
    salary_min: 25000,
    salary_max: 30000,
    work_type: 'partime',
    location: 'Bệnh viện Đa Khoa Đồng Tháp, Mỹ Phú, Cao Lãnh',
    latitude: 10.47240204126246,
    longitude: 105.62650228191124,
    skills_tags: 'Đóng thùng carton, Dán tem mã vạch, Chăm chỉ',
    schedule: 'Ca đêm (18h-22h) hoặc Ca sáng (7h-11h)',
    description: 'Phân loại hàng hóa theo mã bưu chính, dán phiếu giao hàng lên thùng carton và sắp xếp lên pallet.',
    requirements: 'Sức khỏe tốt, chăm chỉ, có tinh thần trách nhiệm.',
    contact_info: 'Hotline Kho Vận: 0277 3831 999 (Anh Tuấn)',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

const DEFAULT_PROFILE = {
  id: 1,
  full_name: 'Nguyễn Văn Sinh Viên',
  phone: '0912345678',
  email: 'sinhvien.it@gmail.com',
  skills: 'React Native, JavaScript, HTML/CSS, Tiếng Anh giao tiếp',
  bio: 'Sinh viên năm 3 ngành Công nghệ Thông tin, cần tìm việc parttime hoặc dự án freelance phù hợp thời gian học.',
  avatar: null,
};

/**
 * Khởi tạo Database SQLite hoặc Fallback AsyncStorage
 */
export const initDatabase = async () => {
  try {
    console.log('--- Đang khởi tạo SQLite Database ---');
    const db = await getDBConnection();
    if (!db) {
      throw new Error('Khởi tạo SQLite DB thất bại');
    }

    // Luôn DROP TABLE IF EXISTS jobs một lần để ép SQLite nạp 100% danh sách 15 việc làm phân chia 6 ngành nghề chuẩn
    await db.execAsync('DROP TABLE IF EXISTS jobs;');

    // 1. Tạo bảng users
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'candidate',
        created_at TEXT
      );
    `);

    // 2. Tạo bảng jobs với đầy đủ các cột chuẩn
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company_name TEXT,
        company_logo TEXT,
        category TEXT NOT NULL,
        salary_min INTEGER,
        salary_max INTEGER,
        work_type TEXT NOT NULL,
        location TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        skills_tags TEXT,
        schedule TEXT,
        description TEXT,
        requirements TEXT,
        contact_info TEXT,
        created_at TEXT
      );
    `);

    // Thực hiện ALTER TABLE an toàn nếu bảng bị thiếu cột
    const addColumnSafe = async (tableName, colName, type) => {
      try {
        await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${colName} ${type};`);
      } catch (e) {}
    };

    await addColumnSafe('jobs', 'salary_min', 'INTEGER');
    await addColumnSafe('jobs', 'salary_max', 'INTEGER');
    await addColumnSafe('jobs', 'company_name', 'TEXT');
    await addColumnSafe('jobs', 'company_logo', 'TEXT');
    await addColumnSafe('jobs', 'latitude', 'REAL');
    await addColumnSafe('jobs', 'longitude', 'REAL');
    await addColumnSafe('jobs', 'skills_tags', 'TEXT');

    // 3. Tạo bảng profile
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        skills TEXT,
        bio TEXT,
        avatar TEXT
      );
    `);

    await addColumnSafe('profile', 'avatar', 'TEXT');

    // 4. Tạo bảng applications (có user_id)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        job_id INTEGER,
        status TEXT DEFAULT 'pending',
        applied_at TEXT
      );
    `);

    await addColumnSafe('applications', 'user_id', 'INTEGER');

    // 5. Tạo bảng favorites (có user_id)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        job_id INTEGER
      );
    `);

    await addColumnSafe('favorites', 'user_id', 'INTEGER');

    // Luôn làm sạch và seed lại 100% dữ liệu mới nhất chia đều 6 ngành nghề
    await db.execAsync('DELETE FROM jobs;');
    for (const item of SEED_JOBS) {
      await db.runAsync(
        `INSERT INTO jobs (id, title, company_name, company_logo, category, salary_min, salary_max, work_type, location, latitude, longitude, skills_tags, schedule, description, requirements, contact_info, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          Number(item.id),
          String(item.title),
          String(item.company_name || ''),
          String(item.company_logo || ''),
          String(item.category),
          Number(item.salary_min),
          Number(item.salary_max),
          String(item.work_type),
          String(item.location),
          Number(item.latitude),
          Number(item.longitude),
          String(item.skills_tags || ''),
          String(item.schedule || ''),
          String(item.description || ''),
          String(item.requirements || ''),
          String(item.contact_info || ''),
          String(item.created_at || ''),
        ]
      );
    }

    // Seed profile mẫu nếu rỗng
    const profCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM profile;');
    if (!profCount || profCount.count === 0) {
      await db.runAsync(
        `INSERT INTO profile (id, full_name, phone, email, skills, bio, avatar) VALUES (1, ?, ?, ?, ?, ?, ?);`,
        [
          DEFAULT_PROFILE.full_name,
          DEFAULT_PROFILE.phone,
          DEFAULT_PROFILE.email,
          DEFAULT_PROFILE.skills,
          DEFAULT_PROFILE.bio,
          DEFAULT_PROFILE.avatar,
        ]
      );
    }

    useFallbackMode = false;
    console.log('--- SQLite Database khởi tạo THÀNH CÔNG (15 Jobs chia 6 ngành nghề) ---');
    return true;
  } catch (error) {
    console.warn('⚠️ SQLite Native error on Expo Go. Tự động chuyển sang Chế độ Fallback (AsyncStorage):', error);
    useFallbackMode = true;
    await initFallbackStorage();
    return true;
  }
};

/**
 * Khởi tạo dữ liệu Fallback trong AsyncStorage
 */
const initFallbackStorage = async () => {
  try {
    await AsyncStorage.setItem(KEYS.JOBS, JSON.stringify(SEED_JOBS));

    const existingUsers = await AsyncStorage.getItem(KEYS.USERS);
    if (!existingUsers) {
      await AsyncStorage.setItem(KEYS.USERS, JSON.stringify([]));
    }

    const existingProf = await AsyncStorage.getItem(KEYS.PROFILE);
    if (!existingProf) {
      await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    }

    const existingApps = await AsyncStorage.getItem(KEYS.APPLICATIONS);
    if (!existingApps) {
      await AsyncStorage.setItem(KEYS.APPLICATIONS, JSON.stringify([]));
    }

    const existingFavs = await AsyncStorage.getItem(KEYS.FAVORITES);
    if (!existingFavs) {
      await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify([]));
    }
  } catch (e) {
    console.error('Lỗi initFallbackStorage:', e);
  }
};

/* ==========================================================================
   MODULE AUTHENTICATION (Đăng ký, Đăng nhập, User Session)
   ========================================================================== */

export const registerUserInDB = async ({ email, password, full_name, phone }) => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPhone = String(phone || '').trim();
  const cleanName = String(full_name || '').trim();
  const cleanPass = String(password || '').trim();
  const createdAt = new Date().toISOString();

  if (useFallbackMode) {
    return registerUserFallback({ email: cleanEmail, password: cleanPass, full_name: cleanName, phone: cleanPhone, createdAt });
  }

  try {
    const db = await getDBConnection();
    if (!db) {
      return registerUserFallback({ email: cleanEmail, password: cleanPass, full_name: cleanName, phone: cleanPhone, createdAt });
    }

    const existing = await db.getFirstAsync('SELECT * FROM users WHERE LOWER(email) = ?;', [cleanEmail]);
    if (existing) {
      return { success: false, message: 'Email này đã được đăng ký tài khoản khác!' };
    }

    const res = await db.runAsync(
      `INSERT INTO users (email, password, full_name, phone, role, created_at) VALUES (?, ?, ?, ?, 'candidate', ?);`,
      [cleanEmail, cleanPass, cleanName, cleanPhone, createdAt]
    );

    const newUser = {
      id: res.lastInsertRowId,
      email: cleanEmail,
      full_name: cleanName,
      phone: cleanPhone,
      role: 'candidate',
      created_at: createdAt,
    };

    return { success: true, message: 'Đăng ký tài khoản thành công!', user: newUser };
  } catch (err) {
    console.warn('Lỗi registerUser SQLite, chuyển sang fallback:', err);
    return registerUserFallback({ email: cleanEmail, password: cleanPass, full_name: cleanName, phone: cleanPhone, createdAt });
  }
};

const registerUserFallback = async ({ email, password, full_name, phone, createdAt }) => {
  try {
    const rawUsers = await AsyncStorage.getItem(KEYS.USERS);
    let users = rawUsers ? JSON.parse(rawUsers) : [];

    const existing = users.find((u) => String(u.email).toLowerCase() === email);
    if (existing) {
      return { success: false, message: 'Email này đã được đăng ký tài khoản khác!' };
    }

    const newUser = {
      id: Date.now(),
      email,
      password,
      full_name,
      phone,
      role: 'candidate',
      created_at: createdAt,
    };

    users.push(newUser);
    await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));

    const { password: _, ...userWithoutPass } = newUser;
    return { success: true, message: 'Đăng ký tài khoản thành công!', user: userWithoutPass };
  } catch (e) {
    return { success: false, message: 'Đăng ký thất bại. Vui lòng thử lại!' };
  }
};

export const loginUserInDB = async (emailOrPhone, password) => {
  const cleanInput = String(emailOrPhone || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();

  if (useFallbackMode) {
    return loginUserFallback(cleanInput, cleanPass);
  }

  try {
    const db = await getDBConnection();
    if (!db) return loginUserFallback(cleanInput, cleanPass);

    const user = await db.getFirstAsync(
      'SELECT id, email, password, full_name, phone, role, created_at FROM users WHERE (LOWER(email) = ? OR phone = ?) AND password = ?;',
      [cleanInput, cleanInput, cleanPass]
    );

    if (!user) {
      return { success: false, message: 'Email/SĐT hoặc mật khẩu không chính xác!' };
    }

    const { password: _, ...userWithoutPass } = user;
    return { success: true, message: 'Đăng nhập thành công!', user: userWithoutPass };
  } catch (err) {
    console.warn('Lỗi loginUser SQLite, chuyển sang fallback:', err);
    return loginUserFallback(cleanInput, cleanPass);
  }
};

const loginUserFallback = async (input, pass) => {
  try {
    const rawUsers = await AsyncStorage.getItem(KEYS.USERS);
    const users = rawUsers ? JSON.parse(rawUsers) : [];

    const found = users.find(
      (u) => (String(u.email).toLowerCase() === input || String(u.phone) === input) && u.password === pass
    );

    if (!found) {
      return { success: false, message: 'Email/SĐT hoặc mật khẩu không chính xác!' };
    }

    const { password: _, ...userWithoutPass } = found;
    return { success: true, message: 'Đăng nhập thành công!', user: userWithoutPass };
  } catch (e) {
    return { success: false, message: 'Đăng nhập thất bại. Vui lòng thử lại!' };
  }
};

/* ==========================================================================
   MODULE JOBS & PROFILES (Full Categories Matching)
   ========================================================================== */

/**
 * Lấy danh sách jobs (Có bộ lọc ngành nghề chuẩn hóa)
 */
export const fetchJobsFromDB = async (filters = {}) => {
  if (useFallbackMode) {
    return fetchJobsFromFallback(filters);
  }

  try {
    const db = await getDBConnection();
    if (!db) return fetchJobsFromFallback(filters);

    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      query += ' AND (title LIKE ? OR category LIKE ? OR location LIKE ? OR company_name LIKE ? OR skills_tags LIKE ?)';
      const term = `%${filters.searchQuery.trim()}%`;
      params.push(term, term, term, term, term);
    }

    if (filters.category && filters.category !== 'Tất cả') {
      query += ' AND LOWER(TRIM(category)) = LOWER(TRIM(?))';
      params.push(String(filters.category));
    }

    if (filters.workType && filters.workType !== 'all') {
      query += ' AND work_type = ?';
      params.push(String(filters.workType));
    }

    if (filters.minSalary && !isNaN(filters.minSalary) && Number(filters.minSalary) > 0) {
      query += ' AND salary_max >= ?';
      params.push(Number(filters.minSalary));
    }

    query += ' ORDER BY id ASC;';

    const rows = await db.getAllAsync(query, params);
    const result = (rows || []).map((j) => ({
      ...j,
      latitude: Number(j.latitude),
      longitude: Number(j.longitude),
    }));
    return result;
  } catch (err) {
    console.warn('Lỗi fetchJobsFromDB SQLite, chuyển sang fallback:', err);
    useFallbackMode = true;
    await initFallbackStorage();
    return fetchJobsFromFallback(filters);
  }
};

const fetchJobsFromFallback = async (filters = {}) => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.JOBS);
    let list = raw ? JSON.parse(raw) : SEED_JOBS;

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.trim().toLowerCase();
      list = list.filter(
        (j) =>
          (j.title && j.title.toLowerCase().includes(q)) ||
          (j.category && j.category.toLowerCase().includes(q)) ||
          (j.location && j.location.toLowerCase().includes(q)) ||
          (j.company_name && j.company_name.toLowerCase().includes(q)) ||
          (j.skills_tags && j.skills_tags.toLowerCase().includes(q))
      );
    }

    if (filters.category && filters.category !== 'Tất cả') {
      const targetCat = String(filters.category).trim().toLowerCase();
      list = list.filter((j) => j.category && j.category.trim().toLowerCase() === targetCat);
    }

    if (filters.workType && filters.workType !== 'all') {
      list = list.filter((j) => j.work_type === filters.workType);
    }

    if (filters.minSalary && Number(filters.minSalary) > 0) {
      list = list.filter((j) => j.salary_max >= Number(filters.minSalary));
    }

    return list.map((j) => ({
      ...j,
      latitude: Number(j.latitude),
      longitude: Number(j.longitude),
    }));
  } catch (e) {
    return SEED_JOBS.map((j) => ({
      ...j,
      latitude: Number(j.latitude),
      longitude: Number(j.longitude),
    }));
  }
};

/**
 * Lấy chi tiết job theo ID
 */
export const fetchJobByIdFromDB = async (id) => {
  const numericId = Number(id);

  if (useFallbackMode) {
    const list = await fetchJobsFromFallback();
    return list.find((j) => Number(j.id) === numericId) || null;
  }

  try {
    const db = await getDBConnection();
    if (!db) {
      const list = await fetchJobsFromFallback();
      return list.find((j) => Number(j.id) === numericId) || null;
    }

    const job = await db.getFirstAsync('SELECT * FROM jobs WHERE id = ?;', [numericId]);
    if (job) {
      return {
        ...job,
        latitude: Number(job.latitude),
        longitude: Number(job.longitude),
      };
    }

    const fallbackList = await fetchJobsFromFallback();
    return fallbackList.find((j) => Number(j.id) === numericId) || null;
  } catch (err) {
    const list = await fetchJobsFromFallback();
    return list.find((j) => Number(j.id) === numericId) || null;
  }
};

/**
 * Lấy hồ sơ ứng viên
 */
export const fetchProfileFromDB = async () => {
  if (useFallbackMode) {
    return fetchProfileFromFallback();
  }

  try {
    const db = await getDBConnection();
    if (!db) return fetchProfileFromFallback();

    const profile = await db.getFirstAsync('SELECT * FROM profile WHERE id = 1;');
    if (profile) return profile;
    return DEFAULT_PROFILE;
  } catch (err) {
    useFallbackMode = true;
    return fetchProfileFromFallback();
  }
};

const fetchProfileFromFallback = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PROFILE);
    return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
  } catch (e) {
    return DEFAULT_PROFILE;
  }
};

/**
 * Lưu hồ sơ ứng viên
 */
export const saveProfileToDB = async (profileData) => {
  const cleanData = {
    id: 1,
    full_name: String(profileData.full_name || ''),
    phone: String(profileData.phone || ''),
    email: String(profileData.email || ''),
    skills: String(profileData.skills || ''),
    bio: String(profileData.bio || ''),
    avatar: profileData.avatar ? String(profileData.avatar) : null,
  };

  try {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(cleanData));
  } catch (e) {}

  if (!useFallbackMode) {
    try {
      const db = await getDBConnection();
      if (db) {
        await db.runAsync(
          `INSERT OR REPLACE INTO profile (id, full_name, phone, email, skills, bio, avatar) VALUES (1, ?, ?, ?, ?, ?, ?);`,
          [
            cleanData.full_name,
            cleanData.phone,
            cleanData.email,
            cleanData.skills,
            cleanData.bio,
            cleanData.avatar,
          ]
        );
      }
    } catch (err) {
      console.warn('Lỗi saveProfileToDB SQLite, đã lưu qua AsyncStorage fallback:', err);
    }
  }

  return cleanData;
};

/* ==========================================================================
   MODULE APPLICATIONS
   ========================================================================== */

export const fetchApplicationsFromDB = async (userId = null) => {
  let list = [];

  if (!useFallbackMode) {
    try {
      const db = await getDBConnection();
      if (db) {
        let query = `
          SELECT 
            a.id as application_id,
            a.user_id,
            a.job_id,
            a.status,
            a.applied_at,
            j.title,
            j.company_name,
            j.company_logo,
            j.category,
            j.salary_min,
            j.salary_max,
            j.work_type,
            j.location,
            j.latitude,
            j.longitude,
            j.skills_tags,
            j.schedule,
            j.description,
            j.requirements,
            j.contact_info,
            j.created_at
          FROM applications a
          JOIN jobs j ON a.job_id = j.id
        `;
        const params = [];
        if (userId) {
          query += ' WHERE a.user_id = ?';
          params.push(Number(userId));
        }
        query += ' ORDER BY a.id DESC;';

        const rows = await db.getAllAsync(query, params);
        if (rows && rows.length > 0) {
          list = rows.map((r) => ({
            ...r,
            id: Number(r.job_id),
            job_id: Number(r.job_id),
            latitude: Number(r.latitude),
            longitude: Number(r.longitude),
          }));
        }
      }
    } catch (err) {
      console.warn('Lỗi fetchApplicationsFromDB SQLite, chuyển sang fallback:', err);
    }
  }

  if (!list || list.length === 0) {
    list = await fetchApplicationsFromFallback(userId);
  }

  return list;
};

const fetchApplicationsFromFallback = async (userId = null) => {
  try {
    const rawApps = await AsyncStorage.getItem(KEYS.APPLICATIONS);
    let apps = rawApps ? JSON.parse(rawApps) : [];
    if (userId) {
      apps = apps.filter((a) => Number(a.user_id) === Number(userId));
    }
    const jobs = await fetchJobsFromFallback();

    return apps
      .map((app) => {
        const job = jobs.find((j) => Number(j.id) === Number(app.job_id));
        if (!job) return null;
        return {
          ...job,
          id: Number(job.id),
          job_id: Number(job.id),
          application_id: app.id,
          status: app.status || 'pending',
          applied_at: app.applied_at,
        };
      })
      .filter(Boolean);
  } catch (e) {
    return [];
  }
};

export const addApplicationToDB = async (jobId, userId = 1) => {
  const numJobId = Number(jobId);
  const numUserId = Number(userId || 1);
  const appliedAt = new Date().toISOString();

  let apps = [];
  try {
    const raw = await AsyncStorage.getItem(KEYS.APPLICATIONS);
    apps = raw ? JSON.parse(raw) : [];
  } catch (e) {}

  const existsFallback = apps.some((a) => Number(a.job_id) === numJobId && Number(a.user_id) === numUserId);
  if (existsFallback) {
    return { success: false, message: 'Bạn đã ứng tuyển công việc này rồi!' };
  }

  const newApp = {
    id: Date.now(),
    user_id: numUserId,
    job_id: numJobId,
    status: 'pending',
    applied_at: appliedAt,
  };
  apps.unshift(newApp);

  try {
    await AsyncStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
  } catch (e) {}

  if (!useFallbackMode) {
    try {
      const db = await getDBConnection();
      if (db) {
        const existing = await db.getFirstAsync(
          'SELECT * FROM applications WHERE job_id = ? AND (user_id = ? OR user_id IS NULL);',
          [numJobId, numUserId]
        );
        if (existing) {
          return { success: false, message: 'Bạn đã ứng tuyển công việc này rồi!' };
        }
        await db.runAsync(
          'INSERT INTO applications (user_id, job_id, status, applied_at) VALUES (?, ?, ?, ?);',
          [numUserId, numJobId, 'pending', appliedAt]
        );
      }
    } catch (sqliteErr) {
      console.warn('SQLite runAsync lỗi native, đã ứng tuyển thành công qua Fallback Storage:', sqliteErr);
    }
  }

  return { success: true, message: 'Ứng tuyển thành công!' };
};

export const cancelApplicationInDB = async (jobId, userId = 1) => {
  const numJobId = Number(jobId);
  const numUserId = Number(userId || 1);

  try {
    const raw = await AsyncStorage.getItem(KEYS.APPLICATIONS);
    let apps = raw ? JSON.parse(raw) : [];
    apps = apps.filter((a) => !(Number(a.job_id) === numJobId && Number(a.user_id) === numUserId));
    await AsyncStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
  } catch (e) {
    console.error('Lỗi cancelApplicationInDB fallback:', e);
  }

  if (!useFallbackMode) {
    try {
      const db = await getDBConnection();
      if (db) {
        await db.runAsync('DELETE FROM applications WHERE job_id = ? AND (user_id = ? OR user_id IS NULL);', [
          numJobId,
          numUserId,
        ]);
      }
    } catch (sqliteErr) {
      console.warn('SQLite cancelApplication error:', sqliteErr);
    }
  }

  return { success: true, message: 'Đã hủy đơn ứng tuyển thành công!' };
};

/* ==========================================================================
   MODULE FAVORITES
   ========================================================================== */

export const fetchFavoritesFromDB = async (userId = null) => {
  if (useFallbackMode) {
    return fetchFavoritesFromFallback(userId);
  }

  try {
    const db = await getDBConnection();
    if (!db) return fetchFavoritesFromFallback(userId);

    let query = `
      SELECT j.*
      FROM favorites f
      JOIN jobs j ON f.job_id = j.id
    `;
    const params = [];
    if (userId) {
      query += ' WHERE f.user_id = ?';
      params.push(Number(userId));
    }
    query += ' ORDER BY j.id ASC;';

    const rows = await db.getAllAsync(query, params);
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        ...r,
        id: Number(r.id),
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
      }));
    }
    return fetchFavoritesFromFallback(userId);
  } catch (err) {
    return fetchFavoritesFromFallback(userId);
  }
};

const fetchFavoritesFromFallback = async (userId = null) => {
  try {
    const rawFavs = await AsyncStorage.getItem(KEYS.FAVORITES);
    let favs = rawFavs ? JSON.parse(rawFavs) : [];
    if (userId) {
      favs = favs.filter((f) => (typeof f === 'object' ? Number(f.user_id) === Number(userId) : true));
    }
    const favIds = favs.map((f) => (typeof f === 'object' ? Number(f.job_id) : Number(f)));
    const jobs = await fetchJobsFromFallback();

    return jobs.filter((j) => favIds.includes(Number(j.id)));
  } catch (e) {
    return [];
  }
};

export const fetchFavoriteIdsFromDB = async (userId = null) => {
  if (useFallbackMode) {
    return fetchFavoriteIdsFromFallback(userId);
  }

  try {
    const db = await getDBConnection();
    if (!db) return fetchFavoriteIdsFromFallback(userId);

    let query = 'SELECT job_id FROM favorites';
    const params = [];
    if (userId) {
      query += ' WHERE user_id = ?';
      params.push(Number(userId));
    }
    query += ';';

    const rows = await db.getAllAsync(query, params);
    return (rows || []).map((r) => Number(r.job_id));
  } catch (err) {
    return fetchFavoriteIdsFromFallback(userId);
  }
};

const fetchFavoriteIdsFromFallback = async (userId = null) => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.FAVORITES);
    let favs = raw ? JSON.parse(raw) : [];
    if (userId) {
      favs = favs.filter((f) => (typeof f === 'object' ? Number(f.user_id) === Number(userId) : true));
    }
    return favs.map((f) => (typeof f === 'object' ? Number(f.job_id) : Number(f)));
  } catch (e) {
    return [];
  }
};

export const toggleFavoriteInDB = async (jobId, userId = 1) => {
  const numJobId = Number(jobId);
  const numUserId = Number(userId || 1);

  let favs = [];
  try {
    const raw = await AsyncStorage.getItem(KEYS.FAVORITES);
    favs = raw ? JSON.parse(raw) : [];
  } catch (e) {}

  const existsFallbackIndex = favs.findIndex(
    (f) => typeof f === 'object' ? Number(f.job_id) === numJobId && Number(f.user_id) === numUserId : Number(f) === numJobId
  );

  const exists = existsFallbackIndex !== -1;
  if (exists) {
    favs.splice(existsFallbackIndex, 1);
  } else {
    favs.push({ user_id: numUserId, job_id: numJobId });
  }

  try {
    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favs));
  } catch (e) {}

  if (!useFallbackMode) {
    try {
      const db = await getDBConnection();
      if (db) {
        if (exists) {
          await db.runAsync('DELETE FROM favorites WHERE job_id = ? AND (user_id = ? OR user_id IS NULL);', [
            numJobId,
            numUserId,
          ]);
        } else {
          await db.runAsync('INSERT INTO favorites (user_id, job_id) VALUES (?, ?);', [numUserId, numJobId]);
        }
      }
    } catch (sqliteErr) {
      console.warn('SQLite toggleFavorite lỗi native, đã lưu qua Fallback Storage:', sqliteErr);
    }
  }

  return {
    isFavorite: !exists,
    message: !exists ? 'Đã lưu vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích',
  };
};
