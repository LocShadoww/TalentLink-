// src/screens/EmployerCandidatesScreen.js
// Màn hình Danh sách Ứng viên ứng tuyển (Quản lý hồ sơ)

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../components/ScreenWrapper';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { useApp } from '../context/AppContext';
import { fetchJobCandidates, updateApplicationStatus } from '../db/database';

const EmployerCandidatesScreen = ({ navigation }) => {
  const { user } = useApp();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'accepted', 'rejected'
  const [jobFilter, setJobFilter] = useState('all'); // 'all' or specific job title

  const loadCandidates = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchJobCandidates(user.uid || user.id);
      setApplications(data || []);
    } catch (error) {
      console.error('Lỗi tải danh sách ứng viên:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadCandidates();
    }, [loadCandidates])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCandidates();
    setRefreshing(false);
  };

  // Debounce tìm kiếm (800ms)
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 800);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleUpdateStatus = async (appId, newStatus) => {
    Alert.alert(
      'Xác nhận',
      `Bạn chắc chắn muốn ${newStatus === 'accepted' ? 'Chấp nhận' : 'Từ chối'} ứng viên này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            const res = await updateApplicationStatus(appId, newStatus);
            if (res.success) {
              setApplications((prev) =>
                prev.map((app) =>
                  app.application_id === appId ? { ...app, status: newStatus } : app
                )
              );
            } else {
              Alert.alert('Lỗi', res.message);
            }
          },
        },
      ]
    );
  };

  // Filter and Search logic
  const filteredApplications = useMemo(() => {
    let result = applications;

    if (jobFilter !== 'all') {
      result = result.filter(app => app.job?.title === jobFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(app => app.status === statusFilter);
    }

    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(app => 
        app.candidate?.full_name?.toLowerCase().includes(lowerQuery) ||
        app.candidate?.email?.toLowerCase().includes(lowerQuery) ||
        app.job?.title?.toLowerCase().includes(lowerQuery)
      );
    }

    return result;
  }, [applications, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: filteredApplications.length,
      pending: filteredApplications.filter(a => a.status === 'pending').length,
      accepted: filteredApplications.filter(a => a.status === 'accepted').length,
      rejected: filteredApplications.filter(a => a.status === 'rejected').length,
    };
  }, [filteredApplications]);

  const uniqueJobTitles = useMemo(() => {
    const titles = new Set(applications.map(app => app.job?.title).filter(Boolean));
    return ['all', ...Array.from(titles)];
  }, [applications]);

  const renderApplicationItem = ({ item }) => {
    const { candidate, job, status, applied_at } = item;
    const isPending = status === 'pending';

    const getStatusText = (st) => {
      if (st === 'accepted') return 'Đã chấp nhận';
      if (st === 'rejected') return 'Đã từ chối';
      return 'Chờ duyệt';
    };

    const getStatusColor = (st) => {
      if (st === 'accepted') return colors.success;
      if (st === 'rejected') return colors.error;
      return colors.warning;
    };

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            {candidate?.avatar ? (
              <Image source={{ uri: candidate.avatar }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={24} color={colors.primaryMain} />
            )}
          </View>
          <View style={styles.candidateInfo}>
            <Text style={styles.candidateName}>{candidate?.full_name || 'Ứng viên'}</Text>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.contactText}>{candidate?.phone || 'Chưa cập nhật SĐT'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.contactText}>{candidate?.email}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
              {getStatusText(status)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            Ứng tuyển: {job?.title}
          </Text>
          <Text style={styles.applyDate}>
            Ngày nộp: {new Date(applied_at).toLocaleDateString('vi-VN')}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => {
            navigation.navigate('ChatDetail', {
              conversationId: null,
              receiverId: candidate.id,
              receiverName: candidate.full_name || 'Ứng viên'
            });
          }}
        >
          <Ionicons name="chatbubble-outline" size={16} color={colors.primaryMain} />
          <Text style={styles.chatButtonText}>Nhắn tin</Text>
        </TouchableOpacity>

        {isPending && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleUpdateStatus(item.application_id, 'rejected')}
            >
              <Ionicons name="close-circle-outline" size={18} color={colors.error} />
              <Text style={styles.rejectText}>Từ chối</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleUpdateStatus(item.application_id, 'accepted')}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.textLight} />
              <Text style={styles.acceptText}>Chấp nhận</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Quản lý Ứng viên</Text>
      <Text style={styles.headerSubtitle}>
        Thống kê và xử lý hồ sơ ứng viên.
      </Text>

      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: colors.primaryMain }]}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Tổng số</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: colors.warning }]}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Chờ duyệt</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{stats.accepted}</Text>
            <Text style={styles.statLabel}>Đã nhận</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: colors.error }]}>
            <Text style={[styles.statNumber, { color: colors.error }]}>{stats.rejected}</Text>
            <Text style={styles.statLabel}>Từ chối</Text>
          </View>
        </View>
      </ScrollView>

      {/* Search & Filter */}
      <View style={styles.filterContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tên, email, tên công việc..."
            value={searchInput}
            onChangeText={setSearchInput}
            placeholderTextColor={colors.textMuted}
          />
          {searchInput !== '' && (
            <TouchableOpacity onPress={() => setSearchInput('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        {/* Filter by Job Title */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {uniqueJobTitles.map((title) => (
            <TouchableOpacity
              key={title}
              style={[
                styles.filterChip,
                jobFilter === title && styles.filterChipActive
              ]}
              onPress={() => setJobFilter(title)}
            >
              <Text style={[
                styles.filterChipText,
                jobFilter === title && styles.filterChipTextActive
              ]}>
                {title === 'all' ? 'Tất cả việc làm' : title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Filter by Status */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterScroll, { marginTop: 8 }]}>
          {['all', 'pending', 'accepted', 'rejected'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                statusFilter === status && styles.filterChipActive
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[
                styles.filterChipText,
                statusFilter === status && styles.filterChipTextActive
              ]}>
                {status === 'all' ? 'Tất cả trạng thái' : status === 'pending' ? 'Chờ duyệt' : status === 'accepted' ? 'Đã nhận' : 'Từ chối'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return <LoadingState message="Đang tải danh sách hồ sơ..." />;
  }

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <FlatList
          data={filteredApplications}
          keyExtractor={(item) => String(item.application_id)}
          renderItem={renderApplicationItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="Không tìm thấy ứng viên"
              message="Chưa có ứng viên nào hoặc không khớp với tìm kiếm của bạn."
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primaryMain]}
              tintColor={colors.primaryMain}
            />
          }
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    ...typography.styles.h1,
    color: colors.primaryDark,
  },
  headerSubtitle: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  statsScroll: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  statCard: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    minWidth: 90,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    ...typography.styles.h2,
    color: colors.primaryMain,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
  filterContainer: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    ...typography.styles.body,
    color: colors.textPrimary,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primaryMain,
    borderColor: colors.primaryMain,
  },
  filterChipText: {
    ...typography.styles.captionMedium,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textLight,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    ...typography.styles.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    ...typography.styles.badge,
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  jobInfo: {
    marginBottom: 12,
  },
  jobTitle: {
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  applyDate: {
    ...typography.styles.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  rejectButton: {
    backgroundColor: colors.surface,
    borderColor: colors.error,
  },
  acceptButton: {
    backgroundColor: colors.primaryMain,
    borderColor: colors.primaryMain,
  },
  rejectText: {
    ...typography.styles.button,
    color: colors.error,
    marginLeft: 6,
    fontSize: 13,
  },
  acceptText: {
    ...typography.styles.button,
    color: colors.textLight,
    marginLeft: 6,
    fontSize: 13,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    marginBottom: 12,
  },
  chatButtonText: {
    ...typography.styles.button,
    color: colors.primaryMain,
    marginLeft: 6,
    fontSize: 13,
  },
});

export default EmployerCandidatesScreen;
