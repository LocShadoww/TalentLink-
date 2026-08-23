// src/screens/EmployerJobsScreen.js
// Màn hình Danh sách tin tuyển dụng đã đăng của Nhà tuyển dụng

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../components/ScreenWrapper';
import JobCard from '../components/JobCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { useApp } from '../context/AppContext';
import { fetchEmployerJobs } from '../db/database';

const EmployerJobsScreen = ({ navigation }) => {
  const { user } = useApp();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchEmployerJobs(user.uid || user.id);
      setJobs(data || []);
    } catch (error) {
      console.error('Lỗi tải tin tuyển dụng:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [loadJobs])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Quản lý tin tuyển dụng</Text>
      <Text style={styles.headerSubtitle}>
        Bạn đã đăng {jobs.length} tin tuyển dụng.
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return <LoadingState message="Đang tải danh sách tin tuyển dụng..." />;
  }

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <FlatList
          data={jobs}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
              <JobCard
                job={item}
                hideFavorite={true}
                onPress={() => navigation.navigate('JobDetail', { jobId: item.id, job: item })}
              />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title="Chưa có tin tuyển dụng nào"
              message="Bạn chưa đăng tin tuyển dụng nào. Hãy tạo tin mới để thu hút ứng viên!"
              actionLabel="Đăng tin ngay"
              onAction={() => navigation.navigate('EmployerPostJobTab')}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primaryMain]}
              tintColor={colors.primaryMain}
            />
          }
        />
        
        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('EmployerPostJobTab')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={30} color={colors.textLight} />
        </TouchableOpacity>
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
    paddingBottom: 80, // Để chừa chỗ cho FAB
  },
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    ...typography.styles.h1,
    color: colors.primaryDark,
  },
  headerSubtitle: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryMain,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default EmployerJobsScreen;
