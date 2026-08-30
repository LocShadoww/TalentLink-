// src/utils/imageMapper.js
// Utility Ánh xạ Hình ảnh Local Offline chuẩn xác 100% từ thư mục assets/images/

export const JOB_LOGOS = {
  'Digital Agency Cao Lãnh': require('../../assets/images/job_digital_agency.jpg'),
  'Văn phòng Công nghệ DTHU': require('../../assets/images/job_dthu_tech.png'),
  'Cửa hàng Tin học Cao Lãnh': require('../../assets/images/job_tinhoc_caolanh.jpg'),
  'HighCafe Chợ Cao Lãnh': require('../../assets/images/job_cafe_highcafe.jpg'),
  'Nhà hàng Ẩm thực Vincom Plaza': require('../../assets/images/job_nhahangvincom.jpg'),
  'Căn tin Trung tâm DTHU': require('../../assets/images/job_cantindthu.jpg'),
  'Co.opmart Cao Lãnh': require('../../assets/images/job_co.opmartcaolanh.jpg'),
  'Showroom Thời trang Vincom': require('../../assets/images/job_showroomthoitrangvincom.jpg'),
  'Bách Hóa Xanh Phường 2': require('../../assets/images/job_bachhoaxanh.jpg'),
  'Nhóm Gia sư Sinh viên DTHU': require('../../assets/images/job_nhomgiasu.jpg'),
  'Trung tâm Ngoại ngữ Phường 1': require('../../assets/images/job_trungtamngoaingu.jpg'),
  'Shop Thời trang Trẻ Cao Lãnh': require('../../assets/images/job_shopthoitrangtre.jpg'),
  'Khu Ẩm thực Văn Miếu Studio': require('../../assets/images/job_khuamthucvanmieustudio.jpg'),
  'Dịch vụ Giao vận Bến Xe': require('../../assets/images/job_dichvugiaovanbenxe.jpg'),
  'Kho Vận Bệnh viện ĐK': require('../../assets/images/job_khovanbenhviendk.jpg'),
};

/**
 * Hàm lấy Nguồn Ảnh chuẩn (Local Assets Require hoặc URL String)
 */
export const getJobImageSource = (jobOrCompany, fallbackName = 'Company') => {
  if (!jobOrCompany) {
    return require('../../assets/images/job_digital_agency.jpg');
  }

  // 1. Trường hợp truyền vào 1 object Job
  if (typeof jobOrCompany === 'object') {
    const name = jobOrCompany.company_name || '';
    if (name && JOB_LOGOS[name]) {
      return JOB_LOGOS[name];
    }
    // Thử khớp tên công ty chứa từ khóa
    for (const key of Object.keys(JOB_LOGOS)) {
      if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
        return JOB_LOGOS[key];
      }
    }

    const logo = jobOrCompany.company_logo || jobOrCompany.logo || jobOrCompany.image;
    if (typeof logo === 'number') return logo;
    if (typeof logo === 'string' && (logo.startsWith('http') || logo.startsWith('file:') || logo.startsWith('data:'))) {
      return { uri: logo };
    }
  }

  // 2. Trường hợp truyền trực tiếp require number
  if (typeof jobOrCompany === 'number') {
    return jobOrCompany;
  }

  // 3. Trường hợp truyền trực tiếp Tên công ty string
  if (typeof jobOrCompany === 'string') {
    if (JOB_LOGOS[jobOrCompany]) {
      return JOB_LOGOS[jobOrCompany];
    }
    for (const key of Object.keys(JOB_LOGOS)) {
      if (jobOrCompany.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(jobOrCompany.toLowerCase())) {
        return JOB_LOGOS[key];
      }
    }
    if (jobOrCompany.startsWith('http') || jobOrCompany.startsWith('file:') || jobOrCompany.startsWith('data:')) {
      return { uri: jobOrCompany };
    }
  }

  // 4. Mặc định fallback về ảnh local sắc nét
  return require('../../assets/images/job_digital_agency.jpg');
};
