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
    }, [user?.uid])
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

  // Base filter (Job and Search Query) - Used for stats
  const baseApplications = useMemo(() => {
    let result = applications;

    if (jobFilter !== 'all') {
      result = result.filter(app => app.job?.title === jobFilter);
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
  }, [applications, jobFilter, searchQuery]);

  // Final filter (Applying Status) - Used for list rendering
  const filteredApplications = useMemo(() => {
    if (statusFilter !== 'all') {
      return baseApplications.filter(app => app.status === statusFilter);
    }
    return baseApplications;
  }, [baseApplications, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: baseApplications.length,
      pending: baseApplications.filter(a => a.status === 'pending').length,
      accepted: baseApplications.filter(a => a.status === 'accepted').length,
      rejected: baseApplications.filter(a => a.status === 'rejected').length,
    };
  }, [baseApplications]);

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
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('CandidateProfile', { candidateId: candidate.id })}
      >
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

        <View style={styles.bottomRow}>
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              Ứng tuyển: {job?.title}
            </Text>
            <Text style={styles.applyDate}>
              Ngày nộp: {new Date(applied_at).toLocaleDateString('vi-VN')}
            </Text>
          </View>

          {isPending && (
            <View style={styles.actionRowCompact}>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: colors.error + '15' }]}
                onPress={() => handleUpdateStatus(item.application_id, 'rejected')}
              >
                <Ionicons name="close" size={24} color={colors.error} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: colors.success + '15' }]}
                onPress={() => handleUpdateStatus(item.application_id, 'accepted')}
              >
                <Ionicons name="checkmark" size={24} color={colors.success} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>


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

        {/* Filter by Status */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
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

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <View style={styles.stickyHeader}>
        <Text style={styles.stickyHeaderTitle}>Hồ sơ Ứng tuyển</Text>
      </View>
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
  stickyHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  stickyHeaderTitle: {
    ...typography.styles.h2,
    color: colors.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...typography.styles.h2,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    fontSize: 11,
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
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  jobInfo: {
    flex: 1,
    marginRight: 12,
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
  actionRowCompact: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EmployerCandidatesScreen;
