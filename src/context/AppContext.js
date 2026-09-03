// src/context/AppContext.js
// Context API quản lý state toàn cục & Xác thực (Auth Session) & CSDL & Fallback Storage

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../config/firebase';
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
  subscribeToJobs,
} from '../db/database';

import { usePushNotifications } from '../hooks/usePushNotifications';

export const AppContext = createContext();

export const DEFAULT_FILTERS = {
  searchQuery: '',
  category: 'Tất cả',
  workType: 'all', // 'all' | 'partime' | 'freelance'
  minSalary: 0,
};

export const AppProvider = ({ children }) => {
  const { expoPushToken } = usePushNotifications();

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

  const [jobsLastDoc, setJobsLastDoc] = useState(null);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  const [loadingMoreJobs, setLoadingMoreJobs] = useState(false);

  /**
   * Tải danh sách công việc từ DB (có phân trang)
   */
  const loadJobs = useCallback(async (customFilters = null) => {
    setLoadingJobs(true);
    setErrorJobs(null);
    try {
      const activeFilters = customFilters || filters;
      const { data, lastDoc } = await fetchJobsFromDB(activeFilters, null, 10);
      setJobs(data || []);
      setJobsLastDoc(lastDoc);
      setHasMoreJobs(data.length === 10); // Nếu fetch được đúng limit thì có thể còn
    } catch (err) {
      console.error('Lỗi loadJobs:', err);
      setErrorJobs('Không thể kết nối đến dữ liệu việc làm.');
    } finally {
      setLoadingJobs(false);
    }
  }, [filters]);

  /**
   * Tải thêm công việc
   */
  const loadMoreJobs = useCallback(async () => {
    if (loadingMoreJobs || !hasMoreJobs || !jobsLastDoc) return;
    
    setLoadingMoreJobs(true);
    try {
      const { data, lastDoc } = await fetchJobsFromDB(filters, jobsLastDoc, 10);
      if (data && data.length > 0) {
        setJobs(prev => [...prev, ...data]);
        setJobsLastDoc(lastDoc);
        setHasMoreJobs(data.length === 10);
      } else {
        setHasMoreJobs(false);
      }
    } catch (err) {
      console.error('Lỗi loadMoreJobs:', err);
    } finally {
      setLoadingMoreJobs(false);
    }
  }, [filters, jobsLastDoc, hasMoreJobs, loadingMoreJobs]);

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
      const userId = currentUserId || user?.uid || user?.id;
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
      const userId = currentUserId || user?.uid || user?.id;
      if (!userId) {
        setFavorites([]);
        setFavoriteIds([]);
        return;
      }
      const favList = await fetchFavoritesFromDB(userId);
      const favIds = await fetchFavoriteIdsFromDB(userId);
      setFavorites(favList || []);
      setFavoriteIds((favIds || []).map(String));
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
      // await initDatabase();
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
    const userId = user?.uid || user?.id;
    if (userId) {
      loadApplications(userId);
      loadFavorites(userId);
      
      // Save push token if available
      if (expoPushToken) {
        import('firebase/firestore').then(({ doc, updateDoc }) => {
          import('../config/firebase').then(({ db }) => {
            updateDoc(doc(db, 'users', userId), { pushToken: expoPushToken }).catch(console.warn);
          });
        });
      }
    } else {
      setApplications([]);
      setFavorites([]);
      setFavoriteIds([]);
    }
  }, [user, expoPushToken]);

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
      const userId = res.user?.uid || res.user?.id;
      await Promise.all([
        loadApplications(userId),
        loadFavorites(userId),
        loadProfile(),
      ]);
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
      const userId = res.user?.uid || res.user?.id;
      await Promise.all([
        loadApplications(userId),
        loadFavorites(userId),
        loadProfile(),
      ]);
    }
    return res;
  };

  /**
   * Action: Đăng xuất
   */
  const logout = async () => {
    try {
      if (user?.uid || user?.id) {
        try {
          const docRef = doc(db, 'users', user.uid || user.id);
          await updateDoc(docRef, { pushToken: null });
        } catch(err) {
          console.warn('Lỗi xoá pushToken khi đăng xuất:', err);
        }
        try {
          await signOut(auth);
        } catch (err) {
          console.warn('Lỗi signOut khi đăng xuất:', err);
        }
      }
      await AsyncStorage.removeItem('@current_user');
      setUser(null);
      setProfile(null);
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

    try {
      const userId = user?.uid || user?.id;
      const res = await addApplicationToDB(jobId, userId);
      await loadApplications(userId);
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

    try {
      const userId = user?.uid || user?.id;
      const res = await cancelApplicationInDB(jobId, userId);
      await loadApplications(userId);
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

    try {
      const userId = user?.uid || user?.id;
      const res = await toggleFavoriteInDB(jobId, userId);
      await loadFavorites(userId);
      return res;
    } catch (err) {
      console.error('Lỗi toggleFavorite:', err);
      return { isFavorite: false, message: 'Lỗi thao tác yêu thích!' };
    }
  };

  const isFavorite = (jobId) => {
    return favoriteIds.includes(jobId) || favoriteIds.includes(String(jobId)) || favoriteIds.includes(Number(jobId));
  };

  const hasApplied = (jobId) => {
    return applications.some(
      (app) => String(app.id) === String(jobId) || String(app.job_id) === String(jobId)
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
        hasMoreJobs,
        loadMoreJobs,
        loadingMoreJobs,

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
