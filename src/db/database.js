// src/db/database.js
// Module Quản trị CSDL - Tích hợp Firebase Auth & Firestore

import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, deleteDoc, addDoc, serverTimestamp, writeBatch, limit, startAfter, orderBy
} from 'firebase/firestore';

export const normalizeString = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Dữ liệu seed 15 tin tuyển dụng mẫu chia đều cho 6 nhóm ngành nghề cố định:
 */
export const SEED_JOBS = [
  // NHÓM 1: CÔNG NGHỆ THÔNG TIN
  {
    id: '1',
    title: 'Lập trình viên Frontend React/JS (Part-time / Remote)',
    company_name: 'Digital Agency Cao Lãnh',
    company_logo: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=150&q=80',
    category: 'Công nghệ thông tin',
    salary_min: 35000,
    salary_max: 60000,
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
    id: '2',
    title: 'Thực tập sinh Thiết kế Web & Hỗ trợ Kỹ thuật IT',
    company_name: 'Văn phòng Công nghệ DTHU',
    company_logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=150&q=80',
    category: 'Công nghệ thông tin',
    salary_min: 25000,
    salary_max: 45000,
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
    id: '3',
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
  // NHÓM 2: PHỤC VỤ & NHÀ HÀNG
  {
    id: '4',
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
    contact_info: 'Hotline / Zalo: 0901 234 567',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: '5',
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
    id: '6',
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
  // NHÓM 3: BÁN HÀNG & THU NGÂN
  {
    id: '7',
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
    id: '8',
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
    id: '9',
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
  // NHÓM 4: GIA SƯ & GIÁO DỤC
  {
    id: '10',
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
    contact_info: 'Hotline / Zalo: 0912 345 678',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: '11',
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
  // NHÓM 5: MARKETING & TRUYỀN THÔNG
  {
    id: '12',
    title: 'Thực tập sinh Sáng tạo Nội dung / Video ngắn TikTok',
    company_name: 'Shop Thời trang Trẻ Cao Lãnh',
    company_logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80',
    category: 'Marketing & Truyền thông',
    salary_min: 20000,
    salary_max: 40000,
    work_type: 'freelance',
    location: 'Khu Di Tích Nguyễn Sinh Sắc, TP. Cao Lãnh',
    latitude: 10.446893862505632,
    longitude: 105.63106992423924,
    skills_tags: 'CapCut, Quay phim bằng Smartphone, Trend TikTok',
    schedule: 'Theo sản phẩm 3 video/tuần',
    description: 'Lên ý tưởng kịch bản, quay clip ngắn tư vấn mặc đẹp bằng điện thoại và dựng video đăng tải TikTok / Reels.',
    requirements: 'Thích sáng tạo nội dung, có gu thẩm mỹ, biết sử dụng phần mềm CapCut.',
    contact_info: 'Zalo: 0977 888 999',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: '13',
    title: 'Cộng tác viên Chụp ảnh & Viết bài Fanpage',
    company_name: 'Khu Ẩm thực Văn Miếu Studio',
    company_logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=150&q=80',
    category: 'Marketing & Truyền thông',
    salary_min: 15000,
    salary_max: 30000,
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
  // NHÓM 6: GIAO HÀNG & LAO ĐỘNG
  {
    id: '14',
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
    id: '15',
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

export const getDBConnection = async () => {
  return true; // Dummy logic to prevent breaking UI imports
};

/**
 * Tự động tìm và xóa sạch các bài đăng test dữ liệu rác (Gia / Đa / Phục vụ...)
 */
export const cleanupTestJobs = async () => {
  try {
    const jobsRef = collection(db, 'jobs');
    const snapshot = await getDocs(query(jobsRef));
    const deletePromises = [];

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const comp = String(data.company_name || data.company || '').trim();
      const title = String(data.title || '').trim();

      // CHỈ xóa đúng 3 bài đăng test rác (Gia / Đa / Phục vụ / Phục vụ cafe)
      const isTest =
        comp === 'Gia' ||
        comp === 'gia' ||
        title === 'Đa' ||
        title === 'đa' ||
        title === 'Phục vụ' ||
        title === 'phục vụ' ||
        title === 'Phục vụ cafe' ||
        title === 'phục vụ cafe' ||
        String(docSnap.id).startsWith('test_');

      if (isTest) {
        console.log('🗑️ Xóa bài đăng test rác khỏi CSDL:', docSnap.id, title, comp);
        deletePromises.push(deleteDoc(doc(db, 'jobs', docSnap.id)));
      }
    });

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`✅ Đã xóa thành công ${deletePromises.length} bài đăng test.`);
    }
  } catch (error) {
    console.warn('cleanupTestJobs error:', error);
  }
};

/**
 * Khởi tạo Database Firebase: Seed & khôi phục đầy đủ 15 tin tuyển dụng chuẩn
 */
export const initDatabase = async () => {
  try {
    // 1. Dọn dẹp các bài đăng test rác
    await cleanupTestJobs();

    // 2. Ép nạp & khôi phục đầy đủ 15 bài đăng chuẩn vào Firestore
    const jobsRef = collection(db, 'jobs');
    const batch = writeBatch(db);
    let seededCount = 0;

    for (const item of SEED_JOBS) {
      const docRef = doc(jobsRef, String(item.id));
      const docSnap = await getDoc(docRef);

      // Khôi phục nếu bài chuẩn bị thiếu hoặc xóa nhầm
      if (!docSnap.exists()) {
        batch.set(docRef, {
          ...item,
          title_normalized: normalizeString(item.title),
          employer_id: 'seed_employer_id',
          status: 'active',
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
        });
        seededCount++;
      }
    }

    if (seededCount > 0) {
      await batch.commit();
      console.log(`✅ Đã khôi phục thành công ${seededCount} bài đăng chuẩn vào CSDL!`);
    } else {
      console.log('--- Firebase Database: Đã đầy đủ 15 bài đăng chuẩn ---');
    }
    return true;
  } catch (error) {
    console.error('Firebase init/seed error:', error);
    return false;
  }
};

/* ==========================================================================
   MODULE AUTHENTICATION (Đăng ký, Đăng nhập, User Session)
   ========================================================================== */

export const registerUserInDB = async ({ email, password, full_name, phone, role = 'candidate', company_name = '' }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile on Firebase Auth
    await updateProfile(user, { displayName: full_name });
    
    // Create document in users collection
    const userData = {
      uid: user.uid,
      email,
      full_name,
      phone,
      role, // 'candidate' or 'employer'
      company_name: role === 'employer' ? company_name : null,
      skills: '',
      bio: '',
      created_at: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    
    return { success: true, message: 'Đăng ký tài khoản thành công!', user: userData };
  } catch (error) {
    console.warn('registerUserInDB error:', error);
    let message = 'Đăng ký thất bại. Vui lòng thử lại!';
    if (error.code === 'auth/email-already-in-use') message = 'Email này đã được đăng ký tài khoản khác!';
    if (error.code === 'auth/weak-password') message = 'Mật khẩu phải có ít nhất 6 ký tự!';
    return { success: false, message };
  }
};

export const loginUserInDB = async (emailOrPhone, password) => {
  try {
    let loginEmail = emailOrPhone;
    
    // Nếu đầu vào không chứa '@', coi như người dùng nhập số điện thoại
    if (!emailOrPhone.includes('@')) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', emailOrPhone));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Lấy email tương ứng với số điện thoại trong DB
        loginEmail = snapshot.docs[0].data().email;
      } else {
        return { success: false, message: 'Số điện thoại này chưa được đăng ký!' };
      }
    }

    const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
    const user = userCredential.user;
    
    // Lấy thông tin role từ collection users
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return { success: true, message: 'Đăng nhập thành công!', user: userDoc.data() };
    }
    return { success: false, message: 'Không tìm thấy thông tin user trong database!' };
  } catch (error) {
    console.warn('loginUserInDB error:', error);
    return { success: false, message: 'Tài khoản hoặc mật khẩu không chính xác!' };
  }
};

/* ==========================================================================
   MODULE JOBS & PROFILES 
   ========================================================================== */

export const fetchJobsFromDB = async (filters = {}, lastDoc = null, pageSize = 10) => {
  try {
    const jobsRef = collection(db, 'jobs');
    let qConstraints = [where('status', '==', 'active')];

    // Lọc Category
    if (filters.category && filters.category !== 'Tất cả') {
      qConstraints.push(where('category', '==', String(filters.category).trim()));
    }
    
    // Lọc Work Type
    if (filters.workType && filters.workType !== 'all') {
      qConstraints.push(where('work_type', '==', filters.workType));
    }

    // Xử lý tìm kiếm và mức lương
    // Lưu ý Firestore: Chỉ được dùng 1 trường cho toán tử bất phương trình (>=, <=)
    const hasSearch = filters.searchQuery && filters.searchQuery.trim() !== '';
    const hasSalary = filters.minSalary && Number(filters.minSalary) > 0;

    if (hasSalary) {
      qConstraints.push(where('salary_max', '>=', Number(filters.minSalary)));
      qConstraints.push(orderBy('salary_max', 'desc'));
    }

    // Luôn sắp xếp theo created_at giảm dần cuối cùng
    qConstraints.push(orderBy('created_at', 'desc'));

    if (lastDoc) {
      qConstraints.push(startAfter(lastDoc));
    }

    // Nếu đang tìm kiếm, lấy nhiều hơn để filter local không bị rỗng
    qConstraints.push(limit(hasSearch ? 50 : pageSize));

    const q = query(jobsRef, ...qConstraints);
    const snapshot = await getDocs(q);
    
    let list = snapshot.docs.map(doc => ({ id: doc.id, docRef: doc, ...doc.data() }));

    // Lọc bỏ bài đăng rác test (chỉ lọc đúng exact name 'Gia', 'Đa', 'Phục vụ', 'Phục vụ cafe')
    list = list.filter((j) => {
      const comp = String(j.company_name || j.company || '').trim();
      const title = String(j.title || '').trim();
      if (comp === 'Gia' || comp === 'gia') return false;
      if (title === 'Đa' || title === 'đa') return false;
      if (title === 'Phục vụ' || title === 'phục vụ') return false;
      if (title === 'Phục vụ cafe' || title === 'phục vụ cafe') return false;
      if (String(j.id).startsWith('test_')) return false;
      return true;
    });

    // Lọc client-side cho trường hợp tìm kiếm
    if (hasSearch) {
      const sq = normalizeString(filters.searchQuery);
      list = list.filter(j => {
          const t = normalizeString(j.title || '');
          const c = normalizeString(j.company_name || j.company || '');
          return t.includes(sq) || c.includes(sq);
      });
    }

    // Lọc client-side cho trường hợp Firestore không hỗ trợ multiple inequality
    if (hasSearch && hasSalary) {
      list = list.filter(j => j.salary_max >= Number(filters.minSalary));
    }

    const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    return { data: list, lastDoc: newLastDoc };
  } catch (error) {
    console.warn('fetchJobsFromDB error:', error);
    return { data: [], lastDoc: null };
  }
};

import { onSnapshot } from 'firebase/firestore';

export const subscribeToJobs = (filters, callback) => {
  const jobsRef = collection(db, 'jobs');
  
  const unsubscribe = onSnapshot(query(jobsRef), (snapshot) => {
    let list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Lọc bỏ bài đăng rác test (chỉ lọc đúng exact name 'Gia', 'Đa', 'Phục vụ', 'Phục vụ cafe')
    list = list.filter((j) => {
      const comp = String(j.company_name || j.company || '').trim();
      const title = String(j.title || '').trim();
      if (comp === 'Gia' || comp === 'gia') return false;
      if (title === 'Đa' || title === 'đa') return false;
      if (title === 'Phục vụ' || title === 'phục vụ') return false;
      if (title === 'Phục vụ cafe' || title === 'phục vụ cafe') return false;
      if (String(j.id).startsWith('test_')) return false;
      return true;
    });
    
    // Client-side filtering logic
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const sq = filters.searchQuery.trim().toLowerCase();
      list = list.filter(j => 
        (j.title && j.title.toLowerCase().includes(sq)) ||
        (j.category && j.category.toLowerCase().includes(sq)) ||
        (j.location && j.location.toLowerCase().includes(sq)) ||
        (j.company_name && j.company_name.toLowerCase().includes(sq)) ||
        (j.skills_tags && j.skills_tags.toLowerCase().includes(sq))
      );
    }
    
    if (filters.category && filters.category !== 'Tất cả') {
      const targetCat = String(filters.category).trim().toLowerCase();
      list = list.filter(j => j.category && j.category.trim().toLowerCase() === targetCat);
    }
    
    if (filters.workType && filters.workType !== 'all') {
      list = list.filter(j => j.work_type === filters.workType);
    }
    
    if (filters.minSalary && Number(filters.minSalary) > 0) {
      list = list.filter(j => j.salary_max >= Number(filters.minSalary));
    }
    
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    callback(list);
  }, (error) => {
    console.warn('subscribeToJobs error:', error);
    callback([]);
  });

  return unsubscribe;
};

export const fetchJobByIdFromDB = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, 'jobs', String(id)));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.warn('fetchJobByIdFromDB error:', error);
    return null;
  }
};

export const fetchProfileFromDB = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.warn('fetchProfileFromDB error:', error);
    return null;
  }
};

export const saveProfileToDB = async (profileData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      full_name: profileData.full_name || '',
      phone: profileData.phone || '',
      email: profileData.email || '',
      skills: profileData.skills || '',
      bio: profileData.bio || '',
      avatar: profileData.avatar || null,
    });
    
    const updatedDoc = await getDoc(userRef);
    return updatedDoc.data();
  } catch (error) {
    console.warn('saveProfileToDB error:', error);
    return profileData;
  }
};

/* ==========================================================================
   MODULE APPLICATIONS
   ========================================================================== */

export const fetchApplicationsFromDB = async (userId = null) => {
  try {
    const appsRef = collection(db, 'applications');
    let q;
    
    const currentUser = auth.currentUser;
    const uid = (userId && userId !== 1) ? String(userId) : (currentUser ? currentUser.uid : null);
    
    if (uid) {
      q = query(appsRef, where('candidate_id', '==', uid));
    } else {
      q = query(appsRef);
    }
    
    const snapshot = await getDocs(q);
    const applications = snapshot.docs.map(doc => ({ application_id: doc.id, ...doc.data() }));
    
    const results = [];
    for (const app of applications) {
      const jobDoc = await getDoc(doc(db, 'jobs', String(app.job_id)));
      if (jobDoc.exists()) {
        results.push({
          ...jobDoc.data(),
          id: jobDoc.id,
          job_id: jobDoc.id,
          application_id: app.application_id,
          status: app.status,
          applied_at: app.applied_at
        });
      }
    }
    
    return results.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
  } catch (error) {
    console.warn('fetchApplicationsFromDB error:', error);
    return [];
  }
};

export const addApplicationToDB = async (jobId, userId = null) => {
  try {
    const currentUser = auth.currentUser;
    const uid = (userId && userId !== 1) ? String(userId) : (currentUser ? currentUser.uid : null);
    if (!uid) return { success: false, message: 'Vui lòng đăng nhập!' };
    
    const appsRef = collection(db, 'applications');
    const q = query(appsRef, where('job_id', '==', String(jobId)), where('candidate_id', '==', uid));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return { success: false, message: 'Bạn đã ứng tuyển công việc này rồi!' };
    }
    
    const jobDoc = await getDoc(doc(db, 'jobs', String(jobId)));
    let employer_id = null;
    if (jobDoc.exists()) {
       employer_id = jobDoc.data().employer_id || null;
    }
    
    await addDoc(appsRef, {
      candidate_id: uid,
      job_id: String(jobId),
      employer_id: employer_id,
      status: 'pending',
      applied_at: new Date().toISOString()
    });
    
    // Gửi Push Notification cho Nhà tuyển dụng
    if (employer_id) {
      import('firebase/firestore').then(({ getDoc, doc }) => {
        getDoc(doc(db, 'users', employer_id)).then((empDoc) => {
          if (empDoc.exists() && empDoc.data().pushToken) {
            import('../hooks/usePushNotifications').then(({ sendPushNotification }) => {
              sendPushNotification(
                empDoc.data().pushToken,
                'Có ứng viên mới!',
                `Một ứng viên vừa nộp đơn vào công việc của bạn.`
              );
            });
          }
        });
      });
    }

    return { success: true, message: 'Ứng tuyển thành công!' };
  } catch (error) {
    console.warn('addApplicationToDB error:', error);
    return { success: false, message: 'Lỗi khi ứng tuyển!' };
  }
};

export const cancelApplicationInDB = async (jobId, userId = null) => {
  try {
    const currentUser = auth.currentUser;
    const uid = (userId && userId !== 1) ? String(userId) : (currentUser ? currentUser.uid : null);
    if (!uid) return { success: false, message: 'Vui lòng đăng nhập!' };
    
    const appsRef = collection(db, 'applications');
    const q = query(appsRef, where('job_id', '==', String(jobId)), where('candidate_id', '==', uid));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      for (const d of snapshot.docs) {
        await deleteDoc(d.ref);
      }
    }
    
    return { success: true, message: 'Đã hủy đơn ứng tuyển thành công!' };
  } catch (error) {
    console.warn('cancelApplicationInDB error:', error);
    return { success: false, message: 'Lỗi khi hủy đơn!' };
  }
};

/* ==========================================================================
   MODULE FAVORITES
   ========================================================================== */

export const fetchFavoritesFromDB = async (userId = null) => {
  try {
    const currentUser = auth.currentUser;
    const uid = (userId && userId !== 1) ? String(userId) : (currentUser ? currentUser.uid : null);
    if (!uid) return [];
    
    const favsRef = collection(db, 'favorites');
    const q = query(favsRef, where('candidate_id', '==', uid));
    const snapshot = await getDocs(q);
    
    const results = [];
    for (const fDoc of snapshot.docs) {
      const jobId = fDoc.data().job_id;
      const jobDoc = await getDoc(doc(db, 'jobs', String(jobId)));
      if (jobDoc.exists()) {
        results.push({ id: jobDoc.id, ...jobDoc.data() });
      }
    }
    
    return results;
  } catch (error) {
    console.warn('fetchFavoritesFromDB error:', error);
    return [];
  }
};

export const fetchFavoriteIdsFromDB = async (userId = null) => {
  try {
    const currentUser = auth.currentUser;
    const uid = (userId && userId !== 1) ? String(userId) : (currentUser ? currentUser.uid : null);
    if (!uid) return [];
    
    const favsRef = collection(db, 'favorites');
    const q = query(favsRef, where('candidate_id', '==', uid));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.data().job_id);
  } catch (error) {
    console.warn('fetchFavoriteIdsFromDB error:', error);
    return [];
  }
};

export const toggleFavoriteInDB = async (jobId, userId = null) => {
  try {
    const currentUser = auth.currentUser;
    const uid = (userId && userId !== 1) ? String(userId) : (currentUser ? currentUser.uid : null);
    if (!uid) return { isFavorite: false, message: 'Vui lòng đăng nhập!' };
    
    const favsRef = collection(db, 'favorites');
    const q = query(favsRef, where('job_id', '==', String(jobId)), where('candidate_id', '==', uid));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      for (const d of snapshot.docs) {
        await deleteDoc(d.ref);
      }
      return { isFavorite: false, message: 'Đã xóa khỏi danh sách yêu thích' };
    } else {
      await addDoc(favsRef, {
        candidate_id: uid,
        job_id: String(jobId),
        created_at: new Date().toISOString()
      });
      return { isFavorite: true, message: 'Đã lưu vào danh sách yêu thích' };
    }
  } catch (error) {
    console.warn('toggleFavoriteInDB error:', error);
    return { isFavorite: false, message: 'Lỗi thao tác!' };
  }
};

/* ==========================================================================
   MODULE EMPLOYER (Nhà tuyển dụng)
   ========================================================================== */

export const addJobToDB = async (jobData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, message: 'Vui lòng đăng nhập!' };

    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    let companyName = jobData.company_name;
    if (userDoc.exists() && userDoc.data().company_name) {
      companyName = userDoc.data().company_name;
    }

    const jobsRef = collection(db, 'jobs');
    const newJob = {
      ...jobData,
      title_normalized: normalizeString(jobData.title),
      company_name: companyName,
      employer_id: currentUser.uid,
      status: 'active',
      created_at: new Date().toISOString()
    };
    
    const docRef = await addDoc(jobsRef, newJob);
    return { success: true, message: 'Đăng tin thành công!', id: docRef.id };
  } catch (error) {
    console.warn('addJobToDB error:', error);
    return { success: false, message: 'Lỗi đăng tin!' };
  }
};

export const fetchEmployerJobs = async (employerId = null) => {
  try {
    const currentUser = auth.currentUser;
    const uid = employerId || (currentUser ? currentUser.uid : null);
    if (!uid) return [];

    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, where('employer_id', '==', uid));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.warn('fetchEmployerJobs error:', error);
    return [];
  }
};

export const fetchJobCandidates = async (employerId = null) => {
  try {
    const currentUser = auth.currentUser;
    const uid = employerId || (currentUser ? currentUser.uid : null);
    if (!uid) return [];

    const appsRef = collection(db, 'applications');
    const q = query(appsRef, where('employer_id', '==', uid));
    const snapshot = await getDocs(q);
    
    const applications = snapshot.docs.map(doc => ({ application_id: doc.id, ...doc.data() }));
    
    const results = [];
    for (const app of applications) {
      const jobDoc = await getDoc(doc(db, 'jobs', String(app.job_id)));
      const candidateDoc = await getDoc(doc(db, 'users', String(app.candidate_id)));
      
      if (jobDoc.exists() && candidateDoc.exists()) {
        results.push({
          application_id: app.application_id,
          status: app.status,
          applied_at: app.applied_at,
          job: { id: jobDoc.id, ...jobDoc.data() },
          candidate: { id: candidateDoc.id, ...candidateDoc.data() }
        });
      }
    }
    
    return results.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
  } catch (error) {
    console.warn('fetchJobCandidates error:', error);
    return [];
  }
};

export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const appRef = doc(db, 'applications', String(applicationId));
    await updateDoc(appRef, { status });
    return { success: true, message: `Đã cập nhật trạng thái thành ${status}` };
  } catch (error) {
    console.warn('updateApplicationStatus error:', error);
    return { success: false, message: 'Lỗi cập nhật trạng thái!' };
  }
};

/* ==========================================================================
   MODULE CHAT (Direct Messaging)
   ========================================================================== */

export const subscribeToChatList = (callback) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    callback([]);
    return () => {};
  }
  
  const convRef = collection(db, 'conversations');
  // Lấy các cuộc trò chuyện mà user hiện tại là thành viên
  const q = query(convRef, where('participants', 'array-contains', currentUser.uid), orderBy('lastUpdatedAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(list);
  }, (error) => {
    console.warn('subscribeToChatList error:', error);
    callback([]);
  });
};

export const subscribeToMessages = (conversationId, callback) => {
  if (!conversationId) return () => {};
  
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(list);
  }, (error) => {
    console.warn('subscribeToMessages error:', error);
    callback([]);
  });
};

export const sendMessageToDB = async (conversationId, text, receiverId = null, receiverName = '', receiverAvatar = null) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    
    let targetConvId = conversationId;
    
    // Nếu chưa có conversationId, tạo mới
    if (!targetConvId && receiverId) {
      const convRef = collection(db, 'conversations');
      // Thử tìm conversation đã tồn tại
      const q = query(convRef, where('participants', 'array-contains', currentUser.uid));
      const snap = await getDocs(q);
      
      let existingDoc = snap.docs.find(d => d.data().participants.includes(receiverId));
      if (existingDoc) {
        targetConvId = existingDoc.id;
      } else {
        const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const currentUserName = currentUserDoc.exists() ? (currentUserDoc.data().full_name || currentUserDoc.data().company_name) : currentUser.displayName;
        const currentUserAvatar = currentUserDoc.exists() ? (currentUserDoc.data().avatar || currentUserDoc.data().logo) : null;

        const newConv = await addDoc(convRef, {
          participants: [currentUser.uid, receiverId],
          participantDetails: {
            [currentUser.uid]: {
              name: currentUserName || 'Khách',
              avatar: currentUserAvatar || null
            },
            [receiverId]: {
              name: receiverName,
              avatar: receiverAvatar || null
            }
          },
          lastMessage: text,
          lastUpdatedAt: serverTimestamp(),
        });
        targetConvId = newConv.id;
      }
    }
    
    if (!targetConvId) return false;
    
    const messagesRef = collection(db, 'conversations', targetConvId, 'messages');
    await addDoc(messagesRef, {
      senderId: currentUser.uid,
      text,
      timestamp: serverTimestamp()
    });
    
    await updateDoc(doc(db, 'conversations', targetConvId), {
      lastMessage: text,
      lastUpdatedAt: serverTimestamp()
    });
    
    // Gửi push notification nếu người nhận có pushToken
    if (receiverId) {
       const userDoc = await getDoc(doc(db, 'users', receiverId));
       if (userDoc.exists() && userDoc.data().pushToken) {
         import('../hooks/usePushNotifications').then(({ sendPushNotification }) => {
           sendPushNotification(
             userDoc.data().pushToken,
             'Tin nhắn mới',
             `${currentUser.displayName || 'Khách'}: ${text}`
           );
         });
       }
    }
    
    return targetConvId;
  } catch (error) {
    console.warn('sendMessageToDB error:', error);
    return false;
  }
};
