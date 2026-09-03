// src/screens/ApplicationsScreen.js
// Màn hình Quản lý Đơn đã ứng tuyển (FR-07 - Auth Integrated)

import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { formatSalary, formatDate, getWorkTypeLabel } from '../utils/formatters';
import { getJobImageSource } from '../utils/imageMapper';
import { useApp } from '../context/AppContext';

const ApplicationsScreen = ({ navigation }) => {
  const { user, applications, loadingApplications, loadApplications, cancelApplication } = useApp();

  // Tự động tải lại danh sách đơn ứng tuyển mỗi khi mở Tab này
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadApplications(user.uid || user.id);
      }
    }, [user?.uid])
  );

  const handleCancelApp = (jobId, title) => {
    Alert.alert(
      'Xác nhận hủy ứng tuyển',
      `Bạn có chắc chắn muốn hủy đơn ứng tuyển cho vị trí "${title || 'này'}" không?`,
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Đồng ý hủy',
          style: 'destructive',
          onPress: async () => {
            const res = await cancelApplication(jobId);
            if (res.success) {
              Alert.alert('Thành công', res.message);
            } else {
              Alert.alert('Thông báo', res.message);
            }
          },
        },
      ]
    );
  };

  const renderApplicationItem = useCallback(
    ({ item }) => {
      const isPartime = item.work_type === 'partime';
      const badgeStyle = isPartime ? colors.workTypePartime : colors.workTypeFreelance;
      const targetJobId = item.id || item.job_id;

      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('JobDetail', {
              jobId: targetJobId,
              job: item,
            })
          }
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Image
              source={getJobImageSource(item)}
              style={styles.companyLogo}
            />
            <View style={styles.titleGroup}>
              <Text style={styles.companyName} numberOfLines={1}>
                {item.company_name || 'Nhà tuyển dụng xác thực'}
              </Text>
              <Text style={styles.jobTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
            <StatusBadge status={item.status} />
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.salaryText}>
              {formatSalary(item.salary_min, item.salary_max)}
            </Text>
            <View style={[styles.workTypeBadge, { backgroundColor: badgeStyle.bg }]}>
              <Text style={[styles.workTypeText, { color: badgeStyle.text }]}>
                {getWorkTypeLabel(item.work_type)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardFooter}>
            <Text style={styles.appliedDate}>
              Ứng tuyển: {formatDate(item.applied_at)}
            </Text>

            <View style={styles.actionGroup}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancelApp(targetJobId, item.title)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={14} color={colors.error} style={{ marginRight: 4 }} />
                <Text style={styles.cancelBtnText}>Hủy đơn</Text>
              </TouchableOpacity>

              <Text style={styles.viewDetailText}>Chi tiết ➔</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, cancelApplication]
  );




  if (!user) {
    return (
      <ScreenWrapper>
        <View style={styles.stickyHeader}>
          <Text style={styles.stickyHeaderTitle}>Đơn đã ứng tuyển</Text>
        </View>
        <EmptyState
          icon="lock-closed-outline"
          title="Bạn chưa đăng nhập"
          message="Vui lòng đăng nhập tài khoản ứng viên để quản lý và theo dõi tiến độ đơn ứng tuyển."
          actionLabel="Đăng nhập ngay"
          onAction={() => navigation.navigate('Login')}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.stickyHeader}>
        <Text style={styles.stickyHeaderTitle}>Đơn đã ứng tuyển</Text>
      </View>
      <FlatList
        data={applications}
        keyExtractor={(item, index) => String(item.application_id || item.id || index)}
        renderItem={renderApplicationItem}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="Chưa nộp đơn ứng tuyển nào"
            message="Bạn chưa gửi đơn ứng tuyển công việc nào. Hãy chọn công việc phù hợp và bấm Ứng tuyển ngay!"
            actionLabel="Tìm việc làm ngay"
            onAction={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  stickyHeader: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  stickyHeaderTitle: {
    ...typography.styles.h2,
    color: colors.textPrimary,
  },
  title: {
    ...typography.styles.h1,
    color: colors.primaryDark,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surfaceVariant,
    marginRight: 10,
  },
  titleGroup: {
    flex: 1,
    marginRight: 8,
  },
  companyName: {
    ...typography.styles.captionMedium,
    color: colors.primaryMain,
    fontWeight: '700',
  },
  jobTitle: {
    ...typography.styles.h3,
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  salaryText: {
    ...typography.styles.subtitle,
    color: colors.primaryMain,
    fontWeight: '700',
  },
  workTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  workTypeText: {
    ...typography.styles.badge,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceVariant,
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedDate: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.error + '40',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  cancelBtnText: {
    ...typography.styles.captionMedium,
    color: colors.error,
    fontWeight: '600',
  },
  viewDetailText: {
    ...typography.styles.captionMedium,
    color: colors.primaryMain,
    fontWeight: '600',
  },
});

export default ApplicationsScreen;
