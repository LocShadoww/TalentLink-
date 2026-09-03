// src/utils/formatters.js
// Tiện ích định dạng dữ liệu (Mức lương, Ngày tháng, Hình thức làm việc, Marker Salary với \u00A0 buffer)

/**
 * Định dạng mức lương đầy đủ (VD: 25.000 - 32.000 VNĐ hoặc 6.5 tr - 8.5 triệu VNĐ)
 */
export const formatSalary = (min, max) => {
  if (!min && !max) return 'Thỏa thuận';

  const formatK = (num) => {
    if (!num) return '0';
    if (num >= 1000) return `${Math.round(num / 1000)}k`;
    return `${num}k`;
  };

  if (min && max) {
    return `${formatK(min)} - ${formatK(max)}/h`;
  }

  if (min) {
    return `Từ ${formatK(min)}/h`;
  }

  return `Tới ${formatK(max)}/h`;
};

/**
 * Định dạng mức lương rút gọn cho Marker Bản đồ có ký tự đệm \u00A0 chống bị xén chữ (VD: "\u00A025k/h\u00A0")
 */
export const formatMarkerSalary = (job) => {
  if (!job) return '\u00A0Thỏa thuận\u00A0';
  const min = job.salary_min;
  const max = job.salary_max;

  if (!min && !max) return '\u00A0Thỏa thuận\u00A0';

  const targetVal = max || min;
  let val = targetVal;
  
  if (targetVal >= 1000) {
    val = Math.round(targetVal / 1000);
  }

  return `\u00A0${val}k/h\u00A0`;
};

/**
 * Định dạng ISO Date string sang ngày Việt Nam (DD/MM/YYYY)
 */
export const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return isoString;
  }
};

/**
 * Nhãn hình thức làm việc (4 Hình thức)
 */
export const getWorkTypeLabel = (workType) => {
  if (workType === 'partime') return 'Bán thời gian';
  if (workType === 'fulltime') return 'Toàn thời gian';
  if (workType === 'freelance') return 'Làm việc từ xa';
  if (workType === 'internship') return 'Thực tập sinh';
  return workType || 'Bán thời gian';
};

/**
 * Style màu sắc hình thức làm việc
 */
export const getWorkTypeStyle = (workType, colors) => {
  if (workType === 'partime') return colors.workTypePartime;
  if (workType === 'fulltime') return colors.workTypeFulltime;
  if (workType === 'freelance') return colors.workTypeFreelance;
  if (workType === 'internship') return colors.workTypeInternship;
  return colors.workTypePartime;
};
