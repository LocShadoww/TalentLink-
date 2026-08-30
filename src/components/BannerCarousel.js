// src/components/BannerCarousel.js
// Component Slide Banner Quảng cáo Tự động Trượt (Bản đồ, Công nghệ IT & Cẩm nang)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;

const BANNER_LIST = [
  {
    id: '1',
    image: require('../../assets/images/banner1.png'),
    tag: 'BẢN ĐỒ GPS',
    tagColor: '#10B981',
    title: 'Tìm Việc Làm Xung Quanh',
    subtitle: 'Xem vị trí các quán & công ty gần bạn nhất',
    type: 'MAP',
    btnText: 'Xem trên bản đồ ➔',
  },
  {
    id: '2',
    image: require('../../assets/images/banner2.png'),
    tag: 'CÔNG NGHỆ IT',
    tagColor: '#0EA5E9',
    title: 'Cơ Hội Việc Làm CNTT & Thực Tập',
    subtitle: 'Lập trình, Web, Thiết kế đồ họa tại Cao Lãnh',
    type: 'CATEGORY_IT',
    btnText: 'Xem việc IT ➔',
  },
  {
    id: '3',
    image: require('../../assets/images/banner3.jpg'),
    tag: 'CẨM NANG',
    tagColor: '#F59E0B',
    title: 'Cẩm Nang Tìm Việc Sinh Viên',
    subtitle: 'Kinh nghiệm phỏng vấn, tạo CV và lưu ý an toàn',
    type: 'HANDBOOK',
    btnText: 'Đọc cẩm nang ➔',
  },
];

const BannerCarousel = React.memo(({ navigation, updateFilters, onSelectCategory, onOpenTipsModal }) => {
  const flatListRef = useRef(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isUserDragging, setIsUserDragging] = useState(false);

  // Tự động chuyển slide sau mỗi 5 giây
  useEffect(() => {
    if (isUserDragging) return;

    const timer = setInterval(() => {
      setActiveBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % BANNER_LIST.length;
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({
            offset: nextIndex * BANNER_WIDTH,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [isUserDragging]);

  const handleBannerScroll = useCallback((event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    if (BANNER_WIDTH > 0) {
      const index = Math.round(contentOffsetX / BANNER_WIDTH);
      if (index >= 0 && index < BANNER_LIST.length) {
        setActiveBannerIndex(index);
      }
    }
  }, []);

  const handleBannerAction = useCallback(
    (type) => {
      if (type === 'MAP') {
        navigation.navigate('MainTabs', { screen: 'MapTab' });
      } else if (type === 'CATEGORY_IT') {
        if (onSelectCategory) {
          onSelectCategory('it');
        } else if (updateFilters) {
          updateFilters({ category: 'Công nghệ thông tin' });
        }
      } else if (type === 'HANDBOOK') {
        if (onOpenTipsModal) onOpenTipsModal();
      }
    },
    [navigation, onSelectCategory, updateFilters, onOpenTipsModal]
  );

  const renderBannerItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.bannerSlideCard}
        onPress={() => handleBannerAction(item.type)}
        activeOpacity={0.9}
      >
        <ImageBackground
          source={item.image}
          style={styles.bannerImageBackground}
          imageStyle={styles.bannerImageStyle}
          resizeMode="cover"
        >
          {/* Lớp phủ bóng mờ nhẹ giúp chữ nổi bật và sắc nét */}
          <View style={styles.darkGradientOverlay}>
            <View style={styles.bannerContentContainer}>
              <View style={[styles.bannerTagBadge, { backgroundColor: item.tagColor }]}>
                <Text style={styles.bannerTagText}>{item.tag}</Text>
              </View>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
              
              <View style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>{item.btnText}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    ),
    [handleBannerAction]
  );

  return (
    <View style={styles.carouselWrapper}>
      <FlatList
        ref={flatListRef}
        data={BANNER_LIST}
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
      />

      {/* Pagination Dots */}
      <View style={styles.paginationDotsContainer}>
        {BANNER_LIST.map((_, idx) => (
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
    height: 160,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  bannerImageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bannerImageStyle: {
    borderRadius: 18,
  },
  darkGradientOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  bannerContentContainer: {
    justifyContent: 'flex-end',
  },
  bannerTagBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  bannerTagText: {
    ...typography.styles.badge,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    ...typography.styles.h2,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    ...typography.styles.caption,
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    elevation: 2,
  },
  bannerBtnText: {
    ...typography.styles.captionMedium,
    color: colors.primaryDark,
    fontSize: 12,
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
