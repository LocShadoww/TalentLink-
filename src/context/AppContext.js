// src/context/AppContext.js
// Context API quản lý state toàn cục & Xác thực (Auth Session) & CSDL & Fallback Storage

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initDatabase,
  registerUserInDB,
  loginUserInDB,
  fetchJobsFromDB,
  fetchProfileFromDB,
  saveProfileToDB,
  fetchApplicationsFromDB,
  addApplicationToDB,
  cancelApplicationInDB,
  fetchFavoritesFromDB,
  fetchFavoriteIdsFromDB,
  toggleFavoriteInDB,
} from '../db/database';

export const AppContext = createContext();

export const DEFAULT_FILTERS = {
  searchQuery: '',
  category: 'Tất cả',
  workType: 'all', // 'all' | 'partime' | 'freelance'
  minSalary: 0,
};

export const AppProvider = ({ children }) => {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  // State User Session (null = Khách chưa đăng nhập)
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // States Dữ liệu
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [errorJobs, setErrorJobs] = useState(null);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  /**
   * Đọc phiên đăng nhập ban đầu từ AsyncStorage
   */
  const loadUserSession = useCallback(async () => {
    setLoadingAuth(true);
    try {
      const rawUser = await AsyncStorage.getItem('@current_user');
      if (rawUser) {
        setUser(JSON.parse(rawUser));
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Lỗi loadUserSession:', e);
      setUser(null);
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  /**
   * Tải danh sách công việc từ DB theo filters hiện tại
   */
  const loadJobs = useCallback(async (customFilters = null) => {
    setLoadingJobs(true);
    setErrorJobs(null);
    try {
      const activeFilters = customFilters || filters;
      const data = await fetchJobsFromDB(activeFilters);
      setJobs(data || []);
    } catch (err) {
      console.error('Lỗi loadJobs:', err);
      setErrorJobs('Không thể kết nối đến dữ liệu việc làm.');
    } finally {
      setLoadingJobs(false);
    }
  }, [filters]);

  /**
   * Tải hồ sơ ứng viên
   */
  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const data = await fetchProfileFromDB();
      setProfile(data);
    } catch (err) {
      console.error('Lỗi loadProfile:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  /**
   * Tải danh sách đơn đã ứng tuyển của user hiện tại
   */
  const loadApplications = useCallback(async (currentUserId = null) => {
    setLoadingApplications(true);
    try {
      const userId = currentUserId || user?.id;
      if (!userId) {
        setApplications([]);
        return;
      }
      const data = await fetchApplicationsFromDB(userId);
      setApplications(data || []);
    } catch (err) {
      console.error('Lỗi loadApplications:', err);
    } finally {
      setLoadingApplications(false);
    }
  }, [user]);

  /**
   * Tải danh sách công việc yêu thích của user hiện tại
   */
  const loadFavorites = useCallback(async (currentUserId = null) => {
    setLoadingFavorites(true);
    try {
      const userId = currentUserId || user?.id;
      if (!userId) {
        setFavorites([]);
        setFavoriteIds([]);
        return;
      }
      const favList = await fetchFavoritesFromDB(userId);
      const favIds = await fetchFavoriteIdsFromDB(userId);
      setFavorites(favList || []);
      setFavoriteIds((favIds || []).map(Number));
    } catch (err) {
      console.error('Lỗi loadFavorites:', err);
    } finally {
      setLoadingFavorites(false);
    }
  }, [user]);

  /**
   * Khởi chạy tự động CSDL / Fallback khi bật ứng dụng
   */
  const initApp = useCallback(async () => {
    try {
      setDbError(null);
      await initDatabase();
      setDbReady(true);

      await loadUserSession();

      // Tải dữ liệu ban đầu
      await Promise.all([
        loadJobs(DEFAULT_FILTERS),
        loadProfile(),
      ]);
    } catch (err) {
      console.error('Lỗi khởi tạo ứng dụng:', err);
      setDbReady(true);
    }
  }, [initDatabase, loadUserSession, loadJobs, loadProfile]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  // Cập nhật lại đơn ứng tuyển và tin lưu mỗi khi user thay đổi
  useEffect(() => {
    if (user?.id) {
      loadApplications(user.id);
      loadFavorites(user.id);
    } else {
      setApplications([]);
      setFavorites([]);
      setFavoriteIds([]);
    }
  }, [user]);

  /* ==========================================================================
     AUTH ACTIONS (Đăng nhập, Đăng ký, Đăng xuất)
     ========================================================================== */

  /**
   * Action: Đăng nhập
   */
  const login = async (emailOrPhone, password) => {
    const res = await loginUserInDB(emailOrPhone, password);
    if (res.success && res.user) {
      setUser(res.user);
      await AsyncStorage.setItem('@current_user', JSON.stringify(res.user));
      await loadApplications(res.user.id);
      await loadFavorites(res.user.id);
    }
    return res;
  };

  /**
   * Action: Đăng ký
   */
  const register = async (userData) => {
    const res = await registerUserInDB(userData);
    if (res.success && res.user) {
      setUser(res.user);
      await AsyncStorage.setItem('@current_user', JSON.stringify(res.user));
      await loadApplications(res.user.id);
      await loadFavorites(res.user.id);
    }
    return res;
  };

  /**
   * Action: Đăng xuất
   */
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@current_user');
      setUser(null);
      setApplications([]);
      setFavorites([]);
      setFavoriteIds([]);
      return { success: true, message: 'Đã đăng xuất thành công!' };
    } catch (e) {
      console.error('Lỗi đăng xuất:', e);
      return { success: false, message: 'Đăng xuất thất bại!' };
    }
  };

  /* ==========================================================================
     JOB & USER ACTIONS
     ========================================================================== */

  const updateFilters = (newFilters) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
    loadJobs(merged);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    loadJobs(DEFAULT_FILTERS);
  };

  const updateProfile = async (profileData) => {
    try {
      const updated = await saveProfileToDB(profileData);
      setProfile(updated);
      return { success: true, message: 'Đã lưu hồ sơ thành công!' };
    } catch (err) {
      console.error('Lỗi updateProfile:', err);
      return { success: false, message: 'Lưu hồ sơ thất bại!' };
    }
  };

  const applyJob = async (jobId) => {
    if (!user) {
      return { success: false, requireAuth: true, message: 'Bạn cần đăng nhập để ứng tuyển công việc này!' };
    }

    const numId = Number(jobId);
    try {
      const res = await addApplicationToDB(numId, user.id);
      await loadApplications(user.id);
      return res;
    } catch (err) {
      console.error('Lỗi applyJob:', err);
      return { success: false, message: 'Ứng tuyển không thành công!' };
    }
  };

  const cancelApplication = async (jobId) => {
    if (!user) {
      return { success: false, requireAuth: true, message: 'Vui lòng đăng nhập!' };
    }

    const numId = Number(jobId);
    try {
      const res = await cancelApplicationInDB(numId, user.id);
      await loadApplications(user.id);
      return res;
    } catch (err) {
      console.error('Lỗi cancelApplication:', err);
      return { success: false, message: 'Hủy ứng tuyển không thành công!' };
    }
  };

  const toggleFavorite = async (jobId) => {
    if (!user) {
      return { isFavorite: false, requireAuth: true, message: 'Bạn cần đăng nhập để lưu tin yêu thích!' };
    }

    const numId = Number(jobId);
    try {
      const res = await toggleFavoriteInDB(numId, user.id);
      await loadFavorites(user.id);
      return res;
    } catch (err) {
      console.error('Lỗi toggleFavorite:', err);
      return { isFavorite: false, message: 'Lỗi thao tác yêu thích!' };
    }
  };

  const isFavorite = (jobId) => {
    const numId = Number(jobId);
    return favoriteIds.includes(numId);
  };

  const hasApplied = (jobId) => {
    const numId = Number(jobId);
    return applications.some(
      (app) => Number(app.id) === numId || Number(app.job_id) === numId
    );
  };

  return (
    <AppContext.Provider
      value={{
        dbReady,
        dbError,
        initApp,

        // User Auth
        user,
        loadingAuth,
        login,
        register,
        logout,

        // Jobs
        jobs,
        loadingJobs,
        errorJobs,
        loadJobs,

        // Filters
        filters,
        updateFilters,
        resetFilters,

        // Profile
        profile,
        loadingProfile,
        updateProfile,

        // Applications
        applications,
        loadingApplications,
        loadApplications,
        applyJob,
        cancelApplication,
        hasApplied,

        // Favorites
        favorites,
        favoriteIds,
        loadingFavorites,
        loadFavorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp phải được sử dụng bên trong <AppProvider>');
  }
  return context;
};

export default AppContext;
