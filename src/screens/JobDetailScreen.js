// src/screens/JobDetailScreen.js
// Màn hình Chi tiết Công việc & Ứng tuyển nhanh (FR-04, FR-06 - Modern Teal & Mini Map)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { formatSalary, formatDate, getWorkTypeLabel } from '../utils/formatters';
import { getJobImageSource } from '../utils/imageMapper';
import { fetchJobByIdFromDB } from '../db/database';
import { useApp } from '../context/AppContext';

const JobDetailScreen = ({ route, navigation }) => {
  const passedJob = route.params?.job;
  const targetJobId =
    route.params?.jobId ||
    route.params?.job_id ||
    route.params?.id ||
    passedJob?.id ||
    passedJob?.job_id;

  const {
    user,
    profile,
    applyJob,
    cancelApplication,
    hasApplied,
    isFavorite,
    toggleFavorite,
  } = useApp();

  const [job, setJob] = useState(passedJob || null);
  const [loading, setLoading] = useState(!passedJob);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [activeTab, setActiveTab] = useState('jobInfo'); // 'jobInfo' | 'overview' | 'company'

  const loadDetail = async () => {
    if (passedJob && passedJob.title && passedJob.location) {
      setJob(passedJob);
      setLoading(false);
      return;
    }

    if (!targetJobId) {
      setError('Không nhận được mã thông tin công việc.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchJobByIdFromDB(targetJobId);
      if (data) {
        setJob(data);
      } else if (passedJob) {
        setJob(passedJob);
      } else {
        setError('Không tìm thấy tin tuyển dụng này trong cơ sở dữ liệu.');
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết job:', err);
      if (passedJob) {
        setJob(passedJob);
      } else {
        setError('Lỗi khi truy vấn thông tin chi tiết từ CSDL.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [targetJobId]);

  // Mở bản đồ ngoài (Google Maps / Apple Maps) để chỉ đường
  const handleOpenNavigation = () => {
    if (!job) return;
    const lat = job.latitude || 10.7769;
    const lng = job.longitude || 106.7009;
    const label = encodeURIComponent(job.company_name || job.title);

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      web: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    });

    Linking.openURL(url).catch((err) =>
      Alert.alert('Lỗi', 'Không thể mở bản đồ chỉ đường.')
    );
  };

  // Xử lý Ứng tuyển nhanh kèm Popup xác nhận
  const handleApply = () => {
    if (!job) return;

    if (!user) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập tài khoản ứng viên để gửi hồ sơ ứng tuyển.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    if (!profile || !profile.full_name || !profile.phone || !profile.email) {
      Alert.alert(
        'Hồ sơ chưa hoàn thiện',
        'Vui lòng bổ sung đầy đủ thông tin Họ tên, Số điện thoại và Email trong mục Hồ sơ trước khi ứng tuyển.',
        [
          { text: 'Để sau', style: 'cancel' },
          {
            text: 'Cập nhật Hồ sơ',
            onPress: () => navigation.navigate('MainTabs', { screen: 'ProfileTab' }),
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Xác nhận ứng tuyển',
      'Bạn có chắc chắn muốn gửi hồ sơ ứng tuyển cho công việc này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            setApplying(true);
            const res = await applyJob(job.id || targetJobId);
            setApplying(false);

            if (res.success) {
              Alert.alert('Ứng tuyển thành công! 🎉', res.message, [
                {
                  text: 'Xem đơn đã ứng tuyển',
                  onPress: () =>
                    navigation.navigate('MainTabs', { screen: 'ApplicationsTab' }),
                },
                { text: 'Đóng', style: 'cancel' },
              ]);
            } else {
              Alert.alert('Thông báo', res.message);
            }
          },
        },
      ]
    );
  };

  // Xử lý Hủy ứng tuyển
  const handleCancelApplication = () => {
    const currentId = job?.id || targetJobId;
    if (!currentId) return;

    if (!user) {
      navigation.navigate('Login');
      return;
    }

    Alert.alert(
      'Xác nhận hủy ứng tuyển',
      'Bạn có chắc chắn muốn hủy đơn ứng tuyển cho vị trí này không?',
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Đồng ý hủy',
          style: 'destructive',
          onPress: async () => {
            setCanceling(true);
            const res = await cancelApplication(currentId);
            setCanceling(false);

            if (res.success) {
              Alert.alert('Đã hủy đơn!', res.message);
            } else {
              Alert.alert('Thông báo', res.message);
            }
          },
        },
      ]
    );
  };

  const handleToggleFavoriteBtn = () => {
    const currentId = job?.id || targetJobId;
    if (!currentId) return;

    if (!user) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập tài khoản ứng viên để lưu công việc yêu thích.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    toggleFavorite(currentId);
  };

  if (loading) {
    return <LoadingState message="Đang tải chi tiết công việc..." />;
  }

  if (error || !job) {
    return (
      <ScreenWrapper>
        <ErrorState
          title="Không thể mở công việc"
          message={error || 'Tin tuyển dụng này không tồn tại hoặc đã bị xóa.'}
          buttonText="Quay lại"
          onRetry={() => navigation.goBack()}
        />
      </ScreenWrapper>
    );
  }

  const currentJobId = job.id || targetJobId;
  const favorited = isFavorite(currentJobId);
  const applied = hasApplied(currentJobId);
  const skillList = job.skills_tags ? job.skills_tags.split(',').map((s) => s.trim()) : [];

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      {/* Top Deep Teal Header Bar */}
      <View style={styles.topHeaderBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Chi tiết công việc
        </Text>
        {user?.role !== 'employer' && (
          <TouchableOpacity
            style={styles.favHeaderButton}
            onPress={handleToggleFavoriteBtn}
          >
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={24}
              color={favorited ? colors.error : colors.textLight}
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Banner Card với Logo đè Ranh giới Header */}
        <View style={styles.bannerHeroCard}>
          <View style={styles.logoOverlappedBox}>
            <Image
              source={getJobImageSource(job)}
              style={styles.companyLogo}
            />
          </View>

          <Text style={styles.companyNameText}>{job.company_name || 'Nhà tuyển dụng xác thực'}</Text>
          <Text style={styles.jobTitleText}>{job.title}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{job.category}</Text>
            </View>
            <View style={styles.workTypeBadge}>
              <Text style={styles.workTypeText}>
                {getWorkTypeLabel(job.work_type)}
              </Text>
            </View>
          </View>
        </View>

        {/* Thẻ Chỉ số Nhanh Grid 3 ô */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="cash-outline" size={20} color={colors.primaryMain} />
            <Text style={styles.metricLabel}>Mức lương</Text>
            <Text style={styles.metricValue}>
              {formatSalary(job.salary_min, job.salary_max)}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="briefcase-outline" size={20} color={colors.primaryMain} />
            <Text style={styles.metricLabel}>Hình thức</Text>
            <Text style={styles.metricValue}>{getWorkTypeLabel(job.work_type)}</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="school-outline" size={20} color={colors.primaryMain} />
            <Text style={styles.metricLabel}>Kinh nghiệm</Text>
            <Text style={styles.metricValue}>Không yêu cầu</Text>
          </View>
        </View>

        {/* Tab Chuyển đổi 3 mục */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'jobInfo' && styles.tabBtnActive]}
            onPress={() => setActiveTab('jobInfo')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'jobInfo' && styles.tabBtnTextActive]}>
              Mô tả công việc
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'overview' && styles.tabBtnTextActive]}>
              Thông tin chung
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'company' && styles.tabBtnActive]}
            onPress={() => setActiveTab('company')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'company' && styles.tabBtnTextActive]}>
              Công ty
            </Text>
          </TouchableOpacity>
        </View>

        {/* Nội dung theo Tab đang chọn */}
        {activeTab === 'jobInfo' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Chi tiết nhiệm vụ</Text>
            <Text style={styles.paragraphText}>
              {job.description || 'Chưa có thông tin mô tả công việc cụ thể.'}
            </Text>

            {job.requirements ? (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Yêu cầu ứng viên</Text>
                <Text style={styles.paragraphText}>{job.requirements}</Text>
              </>
            ) : null}

            {skillList.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Kỹ năng liên quan</Text>
                <View style={styles.skillsRow}>
                  {skillList.map((skill, index) => (
                    <View key={index} style={styles.skillPill}>
                      <Text style={styles.skillPillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {activeTab === 'overview' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Thông tin tuyển dụng</Text>

            <View style={styles.detailRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="location" size={18} color={colors.primaryMain} />
              </View>
              <View style={styles.detailTextGroup}>
                <Text style={styles.detailLabel}>Địa điểm làm việc</Text>
                <Text style={styles.detailValue}>{job.location}</Text>
              </View>
            </View>

            {job.schedule ? (
              <View style={styles.detailRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="time" size={18} color={colors.primaryMain} />
                </View>
                <View style={styles.detailTextGroup}>
                  <Text style={styles.detailLabel}>Thời gian / Lịch xoay ca</Text>
                  <Text style={styles.detailValue}>{job.schedule}</Text>
                </View>
              </View>
            ) : null}

            {job.created_at ? (
              <View style={styles.detailRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="calendar" size={18} color={colors.primaryMain} />
                </View>
                <View style={styles.detailTextGroup}>
                  <Text style={styles.detailLabel}>Ngày đăng tin</Text>
                  <Text style={styles.detailValue}>{formatDate(job.created_at)}</Text>
                </View>
              </View>
            ) : null}
          </View>
        )}

        {activeTab === 'company' && (
          <View style={[styles.sectionCard, styles.contactCard]}>
            <View style={styles.contactHeader}>
              <Ionicons name="business-outline" size={20} color={colors.primaryDark} />
              <Text style={styles.contactTitle}>{job.company_name || 'Thông tin Nhà tuyển dụng'}</Text>
            </View>
            <Text style={styles.contactText}>
              {job.contact_info || 'Liên hệ trực tiếp qua số tổng đài phòng nhân sự.'}
            </Text>
            {user?.role !== 'employer' && job.employer_id && (
              <TouchableOpacity 
                style={styles.chatButton}
                onPress={() => {
                  if (!user) {
                    navigation.navigate('Login');
                    return;
                  }
                  navigation.navigate('ChatDetail', {
                    conversationId: null,
                    receiverId: job.employer_id,
                    receiverName: job.company_name || 'Nhà tuyển dụng',
                    receiverAvatar: job.company_logo || job.logo || null
                  });
                }}
              >
                <Ionicons name="chatbubble-outline" size={16} color={colors.primaryMain} />
                <Text style={styles.chatButtonText}>Nhắn tin cho Nhà tuyển dụng</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Ô Mini Map Định vị vị trí tuyển dụng */}
        {job.latitude && job.longitude ? (
          <View style={styles.miniMapCard}>
            <View style={styles.miniMapHeader}>
              <View style={styles.miniMapTitleGroup}>
                <Ionicons name="map-outline" size={18} color={colors.primaryMain} />
                <Text style={styles.miniMapTitle}>Vị trí</Text>
              </View>
              <TouchableOpacity style={styles.navigateBtn} onPress={handleOpenNavigation}>
                <Ionicons name="navigate-outline" size={14} color={colors.primaryMain} />
                <Text style={styles.navigateBtnText}>Chỉ đường</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.miniMapPlaceholder}>
              <Ionicons name="location-sharp" size={32} color={colors.primaryMain} />
              <Text style={styles.miniMapAddressText} numberOfLines={2}>
                {job.location}
              </Text>
              <Text style={styles.miniMapCoordText}>
                Tọa độ GPS: {job.latitude}, {job.longitude}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      {user?.role !== 'employer' && (
        <View style={styles.bottomBar}>
          {applied ? (
            <View style={styles.appliedActionBar}>
              <View style={styles.appliedStatusBox}>
                <Ionicons name="checkmark-circle" size={18} color={colors.accentGreen} />
                <Text style={styles.appliedStatusText}>Đã ứng tuyển</Text>
              </View>

              <TouchableOpacity
                style={styles.cancelApplyButton}
                onPress={handleCancelApplication}
                disabled={canceling}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={16} color={colors.error} style={{ marginRight: 6 }} />
                <Text style={styles.cancelApplyText}>
                  {canceling ? 'Đang hủy...' : 'Hủy ứng tuyển'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.applyButton, applying && { opacity: 0.7 }]}
              onPress={handleApply}
              disabled={applying}
              activeOpacity={0.8}
            >
              <Ionicons
                name="paper-plane-outline"
                size={20}
                color={colors.textLight}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.applyButtonText}>
                {applying ? 'Đang gửi đơn...' : 'Ứng tuyển ngay'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.primaryDark,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...typography.styles.h3,
    color: colors.textLight,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  favHeaderButton: {
    padding: 4,
  },
  bannerHeroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    paddingTop: 36,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginTop: 24,
  },
  logoOverlappedBox: {
    position: 'absolute',
    top: -30,
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primaryMain,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  companyNameText: {
    ...typography.styles.captionMedium,
    color: colors.primaryMain,
    fontWeight: '700',
    marginBottom: 4,
  },
  jobTitleText: {
    ...typography.styles.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    ...typography.styles.badge,
    color: colors.primaryDark,
  },
  workTypeBadge: {
    backgroundColor: colors.accentGreenLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  workTypeText: {
    ...typography.styles.badge,
    color: colors.accentGreen,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
  },
  metricLabel: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 2,
  },
  metricValue: {
    ...typography.styles.captionMedium,
    color: colors.primaryDark,
    fontWeight: '700',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    elevation: 2,
  },
  tabBtnText: {
    ...typography.styles.captionMedium,
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.primaryMain,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  paragraphText: {
    ...typography.styles.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillPillText: {
    ...typography.styles.captionMedium,
    color: colors.primaryDark,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextGroup: {
    flex: 1,
  },
  detailLabel: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
  },
  contactCard: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactTitle: {
    ...typography.styles.subtitle,
    color: colors.primaryDark,
    fontWeight: '700',
    marginLeft: 8,
  },
  contactText: {
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 12,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryMain,
    marginTop: 8,
  },
  chatButtonText: {
    ...typography.styles.button,
    color: colors.primaryMain,
    marginLeft: 6,
    fontSize: 14,
  },
  miniMapCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  miniMapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  miniMapTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniMapTitle: {
    ...typography.styles.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
    marginLeft: 6,
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  navigateBtnText: {
    ...typography.styles.captionMedium,
    color: colors.primaryMain,
    marginLeft: 4,
  },
  miniMapPlaceholder: {
    backgroundColor: colors.primaryLight + '50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  miniMapAddressText: {
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
  miniMapCoordText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
  },
  applyButton: {
    flexDirection: 'row',
    backgroundColor: colors.primaryMain,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  applyButtonText: {
    ...typography.styles.button,
    color: colors.textLight,
  },
  appliedActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appliedStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.statusApproved.bg,
    borderColor: colors.statusApproved.border,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
  },
  appliedStatusText: {
    ...typography.styles.button,
    color: colors.statusApproved.text,
    marginLeft: 8,
  },
  cancelApplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.error + '40',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  cancelApplyText: {
    ...typography.styles.button,
    color: colors.error,
  },
});

export default JobDetailScreen;
