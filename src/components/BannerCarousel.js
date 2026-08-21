// src/components/BannerCarousel.js
// Component Slide Banner Quảng cáo Tự động Trượt (Auto-play Carousel 5.5s - Smooth & Touch Responsive)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;

const BANNERS = [
  {
    id: '1',
    badge: 'BẢN ĐỒ VIỆC LÀM',
    title: '🔥 Có công việc phù hợp quanh bạn',
    subtitle: 'Dành riêng cho sinh viên & ứng viên tự do. Tìm việc gần bạn ngay!',
    bgColor: colors.primaryDark, // #004D5A
    btnText: 'Xem trên bản đồ GPS ➔',
    action: 'map',
  },
  {
    id: '2',
    badge: 'CƠ HỘI THỰC TẬP K23-K24',
    title: '💻 Vị trí Thực tập CNTT & Lập trình Web/App',
    subtitle: 'Hỗ trợ đóng dấu mộc thực tập, trợ cấp hấp dẫn từ 3.5 - 6 triệu/tháng.',
    bgColor: '#0F766E', // Teal Cyan Dark
    btnText: 'Xem việc CNTT ngay ➔',
    action: 'it_jobs',
  },
  {
    id: '3',
    badge: 'BÍ QUYẾT TÌM VIỆC',
    title: '🎓 Cẩm nang Phỏng vấn & Viết CV sinh viên DTHU',
    subtitle: 'Mẹo trả lời câu hỏi khó và bí quyết chinh phục nhà tuyển dụng.',
    bgColor: '#047857', // Emerald Green Dark
    btnText: 'Đọc cẩm nang ➔',
    action: 'open_tips_modal',
  },
];

const BannerCarousel = React.memo(({ navigation, updateFilters, onOpenTipsModal }) => {
  const flatListRef = useRef(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isUserDragging, setIsUserDragging] = useState(false);

  // Tự động chuyển slide sau mỗi 5.5 giây (Tạm dừng khi người dùng đang tự tay vuốt)
  useEffect(() => {
    if (isUserDragging) return;

    const timer = setInterval(() => {
      setActiveBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % BANNERS.length;
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({
            offset: nextIndex * BANNER_WIDTH,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 5500); // Đặt 5.5s để người dùng thoải mái đọc và chọn nút

    return () => clearInterval(timer);
  }, [isUserDragging]);

  const handleBannerScroll = useCallback((event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    if (BANNER_WIDTH > 0) {
      const index = Math.round(contentOffsetX / BANNER_WIDTH);
      if (index >= 0 && index < BANNERS.length) {
        setActiveBannerIndex(index);
      }
    }
  }, []);

  const handleBannerAction = useCallback(
    (action) => {
      if (action === 'map') {
        navigation.navigate('MainTabs', { screen: 'MapTab' });
      } else if (action === 'it_jobs') {
        updateFilters({ category: 'Công nghệ thông tin' });
      } else if (action === 'open_tips_modal') {
        if (onOpenTipsModal) onOpenTipsModal();
      }
    },
    [navigation, updateFilters, onOpenTipsModal]
  );

  const renderBannerItem = useCallback(
    ({ item }) => (
      <View style={[styles.bannerSlideCard, { backgroundColor: item.bgColor }]}>
        <View style={styles.bannerBadge}>
          <Text style={styles.bannerBadgeText}>{item.badge}</Text>
        </View>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        <TouchableOpacity
          style={styles.bannerBtn}
          onPress={() => handleBannerAction(item.action)}
          activeOpacity={0.8}
        >
          <Text style={styles.bannerBtnText}>{item.btnText}</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleBannerAction]
  );

  return (
    <View style={styles.carouselWrapper}>
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        keyExtractor={(item) => item.id}
        renderItem={renderBannerItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH}
        snapToAlignment="center"
        decelerationRate="fast"
        onScrollBeginDrag={() => setIsUserDragging(true)}
        onScrollEndDrag={() => setIsUserDragging(false)}
        onMomentumScrollEnd={(e) => {
          setIsUserDragging(false);
          handleBannerScroll(e);
        }}
        getItemLayout={(data, index) => ({
          length: BANNER_WIDTH,
          offset: BANNER_WIDTH * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({
              offset: info.index * BANNER_WIDTH,
              animated: true,
            });
          }, 100);
        }}
      />
      {/* Thanh chỉ số vị trí Pagination Dots */}
      <View style={styles.paginationDotsContainer}>
        {BANNERS.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.paginationDot,
              idx === activeBannerIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  carouselWrapper: {
    marginBottom: 16,
  },
  bannerSlideCard: {
    width: BANNER_WIDTH,
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bannerBadge: {
    backgroundColor: colors.accentAmber,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bannerBadgeText: {
    ...typography.styles.badge,
    fontSize: 10,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  bannerTitle: {
    ...typography.styles.h2,
    color: colors.textLight,
    marginBottom: 4,
  },
  bannerSubtitle: {
    ...typography.styles.body,
    color: colors.primaryLight,
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    ...typography.styles.captionMedium,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  paginationDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  paginationDotActive: {
    width: 22,
    backgroundColor: colors.primaryMain,
  },
});

export default BannerCarousel;
