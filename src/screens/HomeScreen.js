// src/screens/HomeScreen.js
// Màn hình Trang chủ & Tìm kiếm tin tuyển dụng (Strict Filtering & Smooth useMemo Category Filter)

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
import { JOBS_DATA } from '../data/jobsData';

const CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'it', name: 'Công nghệ thông tin' },
  { id: 'fnb', name: 'Phục vụ Cafe & Trà sữa' },
  { id: 'sales', name: 'Bán hàng & Thu ngân' },
  { id: 'education', name: 'Gia sư & Trợ giảng' },
  { id: 'delivery', name: 'Giao hàng & Lao động' },
];

const CATEGORY_MAP = {
  all: 'Tất cả',
  it: 'Công nghệ thông tin',
  fnb: 'Phục vụ Cafe & Trà sữa',
  sales: 'Bán hàng & Thu ngân',
  education: 'Gia sư & Trợ giảng',
  delivery: 'Giao hàng & Lao động',
};

const HANDBOOK_ARTICLES = [
  {
    id: '1',
    title: '1. Bí Quyết Viết CV Dành Cho Sinh Viên Chưa Có Kinh Nghiệm',
    icon: 'document-text-outline',
    content: [
      '• Làm nổi bật kỹ năng mềm: Giao tiếp, làm việc nhóm, quản lý thời gian và khả năng thích ứng nhanh.',
      '• Nêu rõ các hoạt động ngoại khóa, đề án môn học hoặc câu lạc bộ bạn từng tham gia.',
      '• Trình bày ngắn gọn, súc tích trong 1 trang A4, kiểm tra kỹ chính tả và định dạng file PDF.'
    ]
  },
  {
    id: '2',
    title: '2. Cách Cân Bằng Lịch Học Và Công Việc Bán Thời Gian (Part-time)',
    icon: 'time-outline',
    content: [
      '• Ưu tiên việc học lên hàng đầu: Chọn các ca làm việc linh hoạt hoặc xoay ca phù hợp thời khóa biểu.',
      '• Không nên làm quá 20-25 giờ/tuần để tránh ảnh hưởng đến sức khỏe và kết quả học tập.',
      '• Trao đổi rõ ràng với quản lý/chủ quán về lịch thi cử trước ít nhất 1-2 tuần.'
    ]
  },
  {
    id: '3',
    title: '3. Lưu Ý Phòng Tránh Lừa Đảo Tuyển Dụng',
    icon: 'shield-checkmark-outline',
    content: [
      '• Tuyệt đối KHÔNG đóng bất kỳ khoản phí nào: Phí đặt cọc giữ chỗ, phí hồ sơ, phí đồng phục bất hợp lý.',
      '• Cảnh giác với các bài đăng lương cao bất thường nhưng không yêu cầu kỹ năng cụ thể.',
      '• Luôn ký hợp đồng lao động hoặc thỏa thuận rõ ràng về mức lương và ngày nhận lương hàng tháng.'
    ]
  },
  {
    id: '4',
    title: '4. Kỹ Năng Giao Tiếp & Gây Ấn Tượng Khi Đi Phỏng Vấn',
    icon: 'chatbubbles-outline',
    content: [
      '• Đến sớm trước giờ hẹn 10-15 phút, trang phục lịch sự và chỉn chu.',
      '• Chủ động chào hỏi, tự tin giới thiệu bản thân và lắng nghe người phỏng vấn.',
      '• Chuẩn bị sẵn một vài câu hỏi để hỏi lại nhà tuyển dụng về môi trường làm việc.'
    ]
  }
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
    loadMoreJobs,
    loadingMoreJobs,
  } = useApp();

  const [searchInput, setSearchInput] = useState(filters.searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);

  // Debounce tìm kiếm
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.searchQuery) {
        updateFilters({ searchQuery: searchInput });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  // Lọc danh sách công việc bằng useMemo (Đảm bảo luôn hiển thị 15 bài đăng chuẩn)
  const displayedJobs = useMemo(() => {
    const rawJobs = (jobs && jobs.length >= 15) ? jobs : JOBS_DATA;

    return rawJobs.filter((job) => {
      // 1. Lọc theo Ngành nghề
      const matchCategory =
        !selectedCategory ||
        selectedCategory === 'all' ||
        selectedCategory === 'Tất cả' ||
        job.category === selectedCategory ||
        job.categoryName === selectedCategory ||
        (selectedCategory === 'it' && (job.category === 'it' || (job.categoryName && job.categoryName.includes('Công nghệ')))) ||
        (selectedCategory === 'fnb' && (job.category === 'fnb' || (job.categoryName && (job.categoryName.includes('Phục vụ') || job.categoryName.includes('Cafe'))))) ||
        (selectedCategory === 'sales' && (job.category === 'sales' || (job.categoryName && job.categoryName.includes('Bán hàng')))) ||
        (selectedCategory === 'education' && (job.category === 'education' || (job.categoryName && job.categoryName.includes('Gia sư')))) ||
        (selectedCategory === 'delivery' && (job.category === 'delivery' || (job.categoryName && job.categoryName.includes('Giao hàng'))));

      // 2. Lọc theo Từ khóa tìm kiếm
      const query = (searchInput || '').trim().toLowerCase();
      const matchSearch =
        !query ||
        (job.title && job.title.toLowerCase().includes(query)) ||
        (job.company && job.company.toLowerCase().includes(query)) ||
        (job.company_name && job.company_name.toLowerCase().includes(query)) ||
        (job.tags && Array.isArray(job.tags) && job.tags.some((tag) => tag.toLowerCase().includes(query))) ||
        (job.skills_tags && job.skills_tags.toLowerCase().includes(query));

      return matchCategory && matchSearch;
    });
  }, [jobs, selectedCategory, searchInput]);

  // Đếm số lượng bộ lọc đang được kích hoạt
  const activeFilterCount =
    (selectedCategory !== 'all' && selectedCategory !== 'Tất cả' ? 1 : 0) +
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
            <Text style={styles.greetingText}>Chào {firstName}</Text>
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

        {/* Slide Banner Quảng cáo Tự động Trượt */}
        <BannerCarousel
          navigation={navigation}
          updateFilters={updateFilters}
          onSelectCategory={(catId) => setSelectedCategory(catId)}
          onOpenTipsModal={() => setShowTipsModal(true)}
        />

        {/* Thanh Tìm kiếm & Nút Lọc */}
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
            const isSelected = selectedCategory === cat.id || (selectedCategory === 'all' && cat.id === 'all');
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Tiêu đề danh sách & số lượng chuẩn sau khi lọc */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>
            {selectedCategory !== 'all' && selectedCategory !== 'Tất cả'
              ? `Việc làm ${CATEGORIES.find((c) => c.id === selectedCategory)?.name || selectedCategory}`
              : 'Danh sách việc làm tốt nhất'}
          </Text>
          <Text style={styles.jobCountText}>{displayedJobs.length} bài đăng</Text>
        </View>
      </View>
    ),
    [firstName, profile, searchInput, activeFilterCount, selectedCategory, updateFilters, displayedJobs.length, navigation]
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
        data={displayedJobs}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderJobItem}
        ListHeaderComponent={renderHeader}
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
              setSelectedCategory('all');
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
      />

      {/* Bong bóng Chat Nổi Kéo Thả Tự Do (SenBot AI) */}
      <FloatingChatBubble onPress={() => navigation.navigate('ChatBot')} />

      {/* Modal Cẩm Nang Tìm Việc Sinh Viên (Handbook Modal) */}
      <Modal
        visible={showTipsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTipsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            {/* Header Modal */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleGroup}>
                <Ionicons name="school" size={24} color={colors.primaryMain} style={{ marginRight: 8 }} />
                <Text style={styles.modalMainTitle}>Cẩm Nang Tìm Việc Sinh Viên</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowTipsModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Bí quyết phỏng vấn, tạo CV ấn tượng & lưu ý an toàn cho sinh viên DTHU
            </Text>

            {/* Danh sách 4 bài viết cẩm nang */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollBody}>
              {HANDBOOK_ARTICLES.map((article) => (
                <View key={article.id} style={styles.articleCard}>
                  <View style={styles.articleTitleRow}>
                    <Ionicons name={article.icon} size={20} color={colors.primaryMain} style={{ marginRight: 8 }} />
                    <Text style={styles.articleTitleText}>{article.title}</Text>
                  </View>

                  {article.content.map((bullet, idx) => (
                    <Text key={idx} style={styles.articleBulletText}>
                      {bullet}
                    </Text>
                  ))}
                </View>
              ))}
            </ScrollView>

            {/* Bottom Action Button */}
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
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContentCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalMainTitle: {
    ...typography.styles.h2,
    fontSize: 18,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  modalSubtitle: {
    ...typography.styles.caption,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  modalScrollBody: {
    marginBottom: 16,
  },
  articleCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  articleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  articleTitleText: {
    ...typography.styles.captionMedium,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  articleBulletText: {
    ...typography.styles.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  modalCloseBtn: {
    backgroundColor: colors.primaryMain,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    ...typography.styles.captionMedium,
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '700',
  },
  headerContainer: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingGroup: {
    flex: 1,
  },
  greetingText: {
    ...typography.styles.caption,
    fontSize: 13,
    color: colors.textSecondary,
  },
  appTitle: {
    ...typography.styles.h1,
    color: colors.primaryDark,
    fontSize: 22,
  },
  headerAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primaryMain,
    overflow: 'hidden',
  },
  headerAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.styles.body,
    fontSize: 14,
    color: colors.textPrimary,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryMain,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.primaryMain,
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
    color: colors.primaryDark,
  },
  categoryScroll: {
    paddingVertical: 4,
    paddingRight: 16,
    marginBottom: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.primaryMain,
    borderColor: colors.primaryMain,
  },
  categoryText: {
    ...typography.styles.captionMedium,
    color: colors.textSecondary,
    fontSize: 13,
  },
  categoryTextSelected: {
    color: colors.textLight,
    fontWeight: '700',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.styles.h2,
    color: colors.textPrimary,
    fontSize: 16,
  },
  jobCountText: {
    ...typography.styles.captionMedium,
    color: colors.primaryMain,
    fontWeight: '700',
  },
});

export default HomeScreen;
