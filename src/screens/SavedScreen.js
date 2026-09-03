// src/screens/SavedScreen.js
// Màn hình Danh sách Việc đã lưu / Yêu thích (FR-08 - Auth Integrated)

import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../components/ScreenWrapper';
import JobCard from '../components/JobCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { useApp } from '../context/AppContext';

const SavedScreen = ({ navigation }) => {
  const { user, favorites, loadingFavorites, loadFavorites, toggleFavorite, isFavorite } = useApp();

  // Tự động tải lại danh sách việc đã lưu mỗi khi mở Tab này
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadFavorites(user.uid || user.id);
      }
    }, [user?.uid])
  );

  const handleToggleFav = (jobId) => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    toggleFavorite(jobId);
  };

  const renderJobItem = useCallback(
    ({ item }) => (
      <JobCard
        job={item}
        isFavorite={isFavorite(item.id)}
        onToggleFavorite={() => handleToggleFav(item.id)}
        onPress={() => navigation.navigate('JobDetail', { jobId: item.id, job: item })}
      />
    ),
    [isFavorite, handleToggleFav, navigation]
  );




  if (!user) {
    return (
      <ScreenWrapper>
        <View style={styles.stickyHeader}>
          <Text style={styles.stickyHeaderTitle}>Tin tuyển dụng đã lưu</Text>
        </View>
        <EmptyState
          icon="lock-closed-outline"
          title="Bạn chưa đăng nhập"
          message="Vui lòng đăng nhập tài khoản ứng viên để xem và quản lý danh sách việc làm đã lưu."
          actionLabel="Đăng nhập ngay"
          onAction={() => navigation.navigate('Login')}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.stickyHeader}>
        <Text style={styles.stickyHeaderTitle}>Tin tuyển dụng đã lưu</Text>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderJobItem}
        ListEmptyComponent={
          <EmptyState
            icon="heart-dislike-outline"
            title="Chưa lưu tin tuyển dụng nào"
            message="Nhấn vào biểu tượng trái tim ở các tin tuyển dụng để lưu lại các việc làm bạn yêu thích."
            actionLabel="Khám phá việc làm ngay"
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
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default SavedScreen;
