// src/theme/typography.js
// Quy chuẩn font chữ & kiểu dáng chữ dùng chung trong ứng dụng

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 26,
  },

  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },

  styles: {
    h1: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 32,
    },
    h2: {
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 28,
    },
    h3: {
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 24,
    },
    subtitle: {
      fontSize: 15,
      fontWeight: '500',
      lineHeight: 22,
    },
    body: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    bodyMedium: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    captionMedium: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
    button: {
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 20,
    },
    badge: {
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 16,
    },
  },
};

export default typography;
