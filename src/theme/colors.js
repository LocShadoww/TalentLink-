// src/theme/colors.js
// Bộ nhận diện màu sắc Modern Deep Teal chuyên nghiệp dành cho ứng dụng Tìm việc Sinh viên

export const colors = {
  // Màu chủ đạo (Primary) - Deep Teal sang trọng, hiện đại, tin cậy
  primary: '#00667C', // Deep Teal Primary
  primaryMain: '#0B7A75', // Teal 600
  primaryLight: '#E0F2F1', // Teal 50
  primaryDark: '#004D5A', // Deep Teal Dark
  primaryBorder: '#B2DFDB', // Teal 200

  // Màu nhấn (Accent) - Emerald Green, Amber, Cyan & Violet
  accentGreen: '#10B981', // Emerald 500
  accentGreenLight: '#ECFDF5', // Emerald 50
  accentAmber: '#F59E0B', // Amber 500
  accentAmberLight: '#FFFBEB', // Amber 50
  accentCyan: '#06B6D4', // Cyan 500
  accentCyanLight: '#ECFEFF', // Cyan 50
  accentPurple: '#8B5CF6', // Purple 500

  // Màu trung tính (Neutral Colors)
  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8', // Slate 400
  textLight: '#FFFFFF',

  // Nền & bề mặt (Background & Surface)
  background: '#F5F7FA', // Cool soft light gray
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9', // Slate 100
  border: '#E2E8F0', // Slate 200
  divider: '#CBD5E1', // Slate 300
  shadow: '#004D5A', // Shadow color for cards

  // Trạng thái ứng tuyển (Application Statuses)
  statusPending: {
    bg: '#FEF3C7',
    text: '#B45309',
    border: '#FDE68A',
    label: 'Đang chờ',
  },
  statusApproved: {
    bg: '#D1FAE5',
    text: '#047857',
    border: '#A7F3D0',
    label: 'Đã duyệt',
  },
  statusRejected: {
    bg: '#FEE2E2',
    text: '#B91C1C',
    border: '#FECACA',
    label: 'Từ chối',
  },

  // 4 Hình thức làm việc (Work Types)
  workTypePartime: {
    bg: '#FFFBEB',
    text: '#B45309',
    label: 'Bán thời gian',
  },
  workTypeFulltime: {
    bg: '#EFF6FF',
    text: '#1D4ED8',
    label: 'Toàn thời gian',
  },
  workTypeFreelance: {
    bg: '#ECFDF5',
    text: '#047857',
    label: 'Làm việc từ xa',
  },
  workTypeInternship: {
    bg: '#F3E8FF',
    text: '#6B21A8',
    label: 'Thực tập sinh',
  },

  // Trạng thái lỗi & cảnh báo
  error: '#EF4444',
  errorLight: '#FEF2F2',
  warning: '#F59E0B',
  success: '#10B981',
};

export default colors;
