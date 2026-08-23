// src/utils/validate.js
// Tiện ích kiểm tra tính hợp lệ dữ liệu (Validation) cho Hồ sơ ứng viên & Đăng ký / Đăng nhập

/**
 * Validate Họ và tên (Bắt buộc, tối thiểu 2 ký tự)
 */
export const validateFullName = (name) => {
  if (!name || name.trim().length === 0) {
    return 'Vui lòng nhập họ tên!';
  }
  if (name.trim().length < 2) {
    return 'Vui lòng nhập họ tên (tối thiểu 2 ký tự)';
  }
  return null;
};

/**
 * Validate Tên công ty (Bắt buộc nếu là Nhà tuyển dụng)
 */
export const validateCompanyName = (name, role) => {
  if (role === 'employer') {
    if (!name || name.trim().length === 0) {
      return 'Vui lòng nhập tên công ty/cửa hàng!';
    }
    if (name.trim().length < 2) {
      return 'Tên công ty phải có ít nhất 2 ký tự';
    }
  }
  return null;
};

/**
 * Validate Số điện thoại VN (Bắt buộc, đúng định dạng số Việt Nam 10 chữ số bắt đầu bằng 0)
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim().length === 0) {
    return 'Vui lòng nhập số điện thoại!';
  }
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!phoneRegex.test(phone.trim())) {
    return 'Số điện thoại không hợp lệ (VD: 0912345678)';
  }
  return null;
};

/**
 * Validate Email (Bắt buộc, đúng chuẩn email)
 */
export const validateEmail = (email) => {
  if (!email || email.trim().length === 0) {
    return 'Vui lòng nhập email!';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Email không đúng định dạng';
  }
  return null;
};

/**
 * Validate Mật khẩu (Bắt buộc, tối thiểu 6 ký tự)
 */
export const validatePassword = (password) => {
  if (!password || password.trim().length === 0) {
    return 'Vui lòng nhập mật khẩu!';
  }
  if (password.trim().length < 6) {
    return 'Mật khẩu phải chứa ít nhất 6 ký tự';
  }
  return null;
};

/**
 * Validate Xác nhận Mật khẩu
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim().length === 0) {
    return 'Vui lòng xác nhận mật khẩu!';
  }
  if (password !== confirmPassword) {
    return 'Mật khẩu xác nhận không trùng khớp!';
  }
  return null;
};

/**
 * Validate toàn bộ form Đăng nhập
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  const emailErr = validateEmail(formData.email);
  if (emailErr) errors.email = emailErr;

  const passErr = validatePassword(formData.password);
  if (passErr) errors.password = passErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate toàn bộ form Đăng ký
 */
export const validateRegisterForm = (formData) => {
  const errors = {};

  const nameErr = validateFullName(formData.full_name);
  if (nameErr) errors.full_name = nameErr;

  const emailErr = validateEmail(formData.email);
  if (emailErr) errors.email = emailErr;

  const phoneErr = validatePhone(formData.phone);
  if (phoneErr) errors.phone = phoneErr;

  const passErr = validatePassword(formData.password);
  if (passErr) errors.password = passErr;

  const confirmErr = validateConfirmPassword(formData.password, formData.confirmPassword);
  if (confirmErr) errors.confirmPassword = confirmErr;

  const companyErr = validateCompanyName(formData.company_name, formData.role);
  if (companyErr) errors.company_name = companyErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate toàn bộ form Profile
 */
export const validateProfileForm = (formData) => {
  const errors = {};

  const nameErr = validateFullName(formData.full_name);
  if (nameErr) errors.full_name = nameErr;

  const phoneErr = validatePhone(formData.phone);
  if (phoneErr) errors.phone = phoneErr;

  const emailErr = validateEmail(formData.email);
  if (emailErr) errors.email = emailErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
