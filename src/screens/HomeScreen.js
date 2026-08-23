// src/screens/HomeScreen.js
// Màn hình Trang chủ & Tìm kiếm tin tuyển dụng (FR-01, FR-02 - Strict Filtering & Interactive Banners & TipsModal)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import JobCard from '../components/JobCard';
import BannerCarousel from '../components/BannerCarousel';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import FloatingChatBubble from '../components/FloatingChatBubble';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { useApp } from '../context/AppContext';

const CATEGORIES = [
  'Tất cả',
  'Công nghệ thông tin',
  'Phục vụ & Nhà hàng',
  'Bán hàng & Thu ngân',
  'Gia sư & Giáo dục',
  'Marketing & Truyền thông',
  'Giao hàng & Lao động',
];

const HomeScreen = ({ navigation }) => {
  const {
    jobs,
    loadingJobs,
    errorJobs,
    loadJobs,
    filters,
    updateFilters,
    isFavorite,
    toggleFavorite,
    profile,
    hasMoreJobs,
    loadMoreJobs,
    loadingMoreJobs,
  } = useApp();

  const [searchInput, setSearchInput] = useState(filters.searchQuery || '');
  const [refreshing, setRefreshing] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);

  // Debounce tìm kiếm (800ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.searchQuery) {
        updateFilters({ searchQuery: searchInput });
      }
    }, 800);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };


  // Đếm số lượng bộ lọc đang được kích hoạt
  const activeFilterCount =
    (filters.category !== 'Tất cả' ? 1 : 0) +
    (filters.workType !== 'all' ? 1 : 0) +
    (filters.minSalary > 0 ? 1 : 0);

  const renderJobItem = useCallback(
    ({ item }) => (
      <JobCard
        job={item}
        isFavorite={isFavorite(item.id)}
        onToggleFavorite={toggleFavorite}
        onPress={() => navigation.navigate('JobDetail', { jobId: item.id, job: item })}
      />
    ),
    [isFavorite, toggleFavorite, navigation]
  );

  const firstName = profile?.full_name ? profile.full_name.trim().split(' ').pop() : 'sinh viên';

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        {/* App Header Title & Candidate Avatar */}
        <View style={styles.topHeader}>
          <View style={styles.greetingGroup}>
            <Text style={styles.greetingText}>Chào {firstName} 👋</Text>
            <Text style={styles.appTitle}>Tìm Việc Sinh Viên</Text>
          </View>

          <TouchableOpacity
            style={styles.headerAvatarCircle}
            onPress={() => navigation.navigate('MainTabs', { screen: 'ProfileTab' })}
            activeOpacity={0.8}
          >
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.headerAvatarImage} />
            ) : (
              <Ionicons name="person" size={20} color={colors.primaryMain} />
            )}
          </TouchableOpacity>
        </View>

        {/* Slide Banner Quảng cáo Tự động Trượt (Interactive Banner Carousel) */}
        <BannerCarousel
          navigation={navigation}
          updateFilters={updateFilters}
          onOpenTipsModal={() => setShowTipsModal(true)}
        />

        {/* Thanh Tìm kiếm (Fix tràn chữ) & Nút Lọc */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm việc, công ty, kỹ năng (React, Canva...)"
              placeholderTextColor={colors.textMuted}
              value={searchInput}
              onChangeText={setSearchInput}
              returnKeyType="search"
              numberOfLines={1}
            />
            {searchInput.length > 0 && (
              <TouchableOpacity onPress={() => setSearchInput('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilterCount > 0 && styles.filterButtonActive,
            ]}
            onPress={() => navigation.navigate('Filter')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={activeFilterCount > 0 ? colors.textLight : colors.primaryMain}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Danh mục ngành nghề nằm ngang */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
                onPress={() => updateFilters({ category: cat })}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Tiêu đề danh sách & số lượng chuẩn sau khi lọc */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>
            {filters.category !== 'Tất cả' ? `Việc làm ${filters.category}` : 'Danh sách việc làm tốt nhất'}
          </Text>
          <Text style={styles.jobCountText}>{jobs.length} bài đăng</Text>
        </View>
      </View>
    ),
    [firstName, profile, searchInput, activeFilterCount, filters, updateFilters, jobs.length, navigation]
  );

  if (loadingJobs && !refreshing) {
    return <LoadingState message="Đang tìm kiếm tin tuyển dụng..." />;
  }

  if (errorJobs && !refreshing) {
    return (
      <ErrorState
        title="Lỗi truy vấn CSDL"
        message={errorJobs}
        onRetry={loadJobs}
      />
    );
  }

  return (
    <ScreenWrapper>
      <FlatList
        data={jobs}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderJobItem}
        ListHeaderComponent={renderHeader()}
        onEndReached={loadMoreJobs}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMoreJobs ? <LoadingState /> : null}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="Không tìm thấy việc làm phù hợp"
            message="Thử đổi từ khóa tìm kiếm hoặc chọn danh mục ngành nghề khác."
            actionLabel="Đặt lại bộ lọc"
            onAction={() => {
              setSearchInput('');
              updateFilters({ searchQuery: '', category: 'Tất cả', workType: 'all', minSalary: 0 });
            }}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primaryMain]}
            tintColor={colors.primaryMain}
          />
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />

      {/* Modal Cẩm nang Phỏng vấn & Viết CV (Banner 3 Action) */}
      <Modal
        visible={showTipsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTipsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            {/* Header Modal */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalBadge}>
                <Ionicons name="school" size={16} color={colors.primaryMain} style={{ marginRight: 6 }} />
                <Text style={styles.modalBadgeText}>CẨM NANG DTHU</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowTipsModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={26} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>🎓 Bí quyết Phỏng vấn & Viết CV cho Sinh viên</Text>
            <Text style={styles.modalSubtitle}>
              Mẹo chinh phục nhà tuyển dụng khi phỏng vấn việc part-time & freelance tại Đồng Tháp:
            </Text>

            <ScrollView style={styles.tipsListScroll} showsVerticalScrollIndicator={false}>
              {/* Tip 1 */}
              <View style={styles.tipItemBox}>
                <Text style={styles.tipNumber}>1</Text>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>👔 Trang phục & Thời gian chuẩn xác</Text>
                  <Text style={styles.tipDesc}>
                    Chuẩn bị trang phục lịch sự, gọn gàng và đến sớm 10 phút trước giờ hẹn phỏng vấn.
                  </Text>
                </View>
              </View>

              {/* Tip 2 */}
              <View style={styles.tipItemBox}>
                <Text style={styles.tipNumber}>2</Text>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>💡 Nêu rõ thế mạnh kỹ năng</Text>
                  <Text style={styles.tipDesc}>
                    Tự tin nêu rõ các kỹ năng bạn có (HTML/CSS/JS, Canva, giao tiếp, cẩn thận, trung thực).
                  </Text>
                </View>
              </View>

              {/* Tip 3 */}
              <View style={styles.tipItemBox}>
                <Text style={styles.tipNumber}>3</Text>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>🔍 Tìm hiểu kỹ nhà tuyển dụng</Text>
                  <Text style={styles.tipDesc}>
                    Tra cứu trước thông tin về nơi ứng tuyển (quán cafe, siêu thị, cửa hàng, công ty).
                  </Text>
                </View>
              </View>

              {/* Tip 4 */}
              <View style={styles.tipItemBox}>
                <Text style={styles.tipNumber}>4</Text>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>🤝 Thái độ chủ động & Linh hoạt lịch học</Text>
                  <Text style={styles.tipDesc}>
                    Thể hiện tinh thần chủ động học hỏi và sự linh hoạt sắp xếp ca làm phù hợp với lịch học DTHU.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Nút Đóng Modal */}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowTipsModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCloseBtnText}>Đã hiểu, đóng cẩm nang</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bong bóng Chat Nổi Kéo Thả Tự Do (Draggable Floating Bubble - SenBot AI) */}
      <FloatingChatBubble onPress={() => navigation.navigate('ChatBot')} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerContainer: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  greetingGroup: {
    flex: 1,
  },
  greetingText: {
    ...typography.styles.captionMedium,
    color: colors.textSecondary,
  },
  appTitle: {
    ...typography.styles.h1,
    color: colors.primaryDark,
  },
  headerAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primaryMain,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginLeft: 12,
  },
  headerAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
    ...typography.styles.body,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  filterButtonActive: {
    backgroundColor: colors.primaryMain,
    borderColor: colors.primaryMain,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.accentAmber,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    ...typography.styles.badge,
    fontSize: 10,
    color: colors.textLight,
  },
  categoryScroll: {
    paddingBottom: 14,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: colors.primaryMain,
    borderColor: colors.primaryMain,
  },
  categoryText: {
    ...typography.styles.captionMedium,
    color: colors.textSecondary,
  },
  categoryTextSelected: {
    color: colors.textLight,
    fontWeight: '600',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.textPrimary,
  },
  jobCountText: {
    ...typography.styles.caption,
    color: colors.textMuted,
  },

  /* Styles Modal Cẩm nang */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentCard: {
    width: '100%',
    maxHeight: '82%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    elevation: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalBadgeText: {
    ...typography.styles.badge,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  modalTitle: {
    ...typography.styles.h2,
    color: colors.primaryDark,
    marginBottom: 6,
  },
  modalSubtitle: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  tipsListScroll: {
    marginBottom: 16,
  },
  tipItemBox: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryMain,
    color: colors.textLight,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 10,
    fontSize: 14,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...typography.styles.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  tipDesc: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  modalCloseBtn: {
    backgroundColor: colors.primaryMain,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    ...typography.styles.button,
    color: colors.textLight,
  },
  fabChatBtn: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryMain,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  fabChatText: {
    ...typography.styles.button,
    color: colors.textLight,
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default HomeScreen;
