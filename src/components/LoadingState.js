// src/components/LoadingState.js
// Component màn hình Loading Bé Sen AI khi nạp dữ liệu ứng dụng

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';

const LoadingState = ({
  title = 'TalentLink Xin Chào!',
  subtitle = 'Bé Sen đang kết nối các cơ hội việc làm tốt nhất cho bạn...',
  message = 'Đang tải dữ liệu',
}) => {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        {/* Khung ảnh Bé Sen bo tròn có đổ bóng */}
        <View style={styles.senImageWrapper}>
          <Image
            source={require('../../assets/images/besen_loading.jpeg')}
            style={styles.senLoadingImage}
            resizeMode="cover"
          />
        </View>

        {/* Thông điệp chào đón sinh viên */}
        <Text style={styles.loadingTitle}>{title}</Text>
        <Text style={styles.loadingSubtitle}>{subtitle}</Text>

        {/* Chỉ báo tải trang tinh gọn */}
        <View style={styles.indicatorBox}>
          <ActivityIndicator color="#006D5B" size="small" />
          <Text style={styles.loadingDots}>{message}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  loadingContent: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 24,
    width: '100%',
    maxWidth: 320,
    elevation: 8,
    shadowColor: '#006D5B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  senImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0FDF4',
    borderWidth: 3,
    borderColor: '#006D5B',
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#006D5B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  senLoadingImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  loadingTitle: {
    ...typography.styles.h2,
    fontSize: 20,
    fontWeight: '800',
    color: '#006D5B',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    ...typography.styles.body,
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  indicatorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  loadingDots: {
    ...typography.styles.captionMedium,
    fontSize: 12,
    color: '#006D5B',
    fontWeight: '700',
  },
});

export default LoadingState;
