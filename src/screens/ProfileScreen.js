// src/screens/ProfileScreen.js
// Màn hình Hồ sơ ứng viên & Quản lý Tài khoản / Đăng xuất (Auth Integrated)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ScreenWrapper from '../components/ScreenWrapper';
import LoadingState from '../components/LoadingState';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { useApp } from '../context/AppContext';
import {
  validateFullName,
  validatePhone,
  validateEmail,
  validateProfileForm,
} from '../utils/validate';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, profile, loadingProfile, updateProfile } = useApp();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    skills: '',
    bio: '',
    avatar: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Load thông tin hồ sơ hiện tại từ DB / User state vào form
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.full_name || profile?.full_name || '',
        email: user.email || profile?.email || '',
        phone: user.phone || profile?.phone || '',
        skills: profile?.skills || '',
        bio: profile?.bio || '',
        avatar: profile?.avatar || null,
      }));
    } else if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        skills: profile.skills || '',
        bio: profile.bio || '',
        avatar: profile.avatar || null,
      });
    }
  }, [user, profile]);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (touched[field]) {
      validateSingleField(field, value);
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateSingleField(field, formData[field]);
  };

  const validateSingleField = (field, value) => {
    let err = null;
    if (field === 'full_name') err = validateFullName(value);
    if (field === 'phone') err = validatePhone(value);
    if (field === 'email') err = validateEmail(value);

    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const { isValid, errors: currentErrors } = validateProfileForm(formData);

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handleLaunchLibrary = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(
          'Thông báo',
          'Bạn cần cấp quyền truy cập Thư viện ảnh trong Cài đặt để sử dụng tính năng này.',
          [
            { text: 'Để sau', style: 'cancel' },
            { text: 'Mở Cài đặt', onPress: openAppSettings },
          ]
        );
        return;
      }

      const mediaTypeOption = ImagePicker.MediaTypeOptions
        ? ImagePicker.MediaTypeOptions.Images
        : ['images'];
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaTypeOption,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        await saveNewAvatar(imageUri);
      }
    } catch (error) {
      console.error('Lỗi Thư viện ảnh:', error);
      Alert.alert('Lỗi Thư viện ảnh', 'Không thể mở thư viện ảnh. Vui lòng thử lại!');
    }
  };

  const handleLaunchCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(
          'Thông báo',
          'Bạn cần cấp quyền truy cập Camera trong Cài đặt để sử dụng tính năng này.',
          [
            { text: 'Để sau', style: 'cancel' },
            { text: 'Mở Cài đặt', onPress: openAppSettings },
          ]
        );
        return;
      }

      const mediaTypeOption = ImagePicker.MediaTypeOptions
        ? ImagePicker.MediaTypeOptions.Images
        : ['images'];
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: mediaTypeOption,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        await saveNewAvatar(imageUri);
      }
    } catch (error) {
      console.error('Lỗi Camera:', error);
      Alert.alert('Lỗi Camera', 'Không thể mở ứng dụng Camera. Vui lòng thử lại!');
    }
  };

  const saveNewAvatar = async (imageUri) => {
    setUploadingAvatar(true);
    const updatedForm = { ...formData, avatar: imageUri };
    setFormData(updatedForm);

    const res = await updateProfile(updatedForm);
    setUploadingAvatar(false);

    if (res.success) {
      Alert.alert('Thành công 🎉', 'Đã cập nhật ảnh đại diện mới!');
    } else {
      Alert.alert('Thông báo', 'Cập nhật ảnh đại diện không thành công.');
    }
  };

  const handlePickAvatar = () => {
    Alert.alert(
      'Đổi ảnh đại diện',
      'Vui lòng chọn phương thức cập nhật ảnh đại diện:',
      [
        {
          text: '🖼️ Chọn từ thư viện ảnh',
          onPress: handleLaunchLibrary,
        },
        {
          text: '📸 Chụp ảnh mới từ Camera',
          onPress: handleLaunchCamera,
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleSubmit = async () => {
    setTouched({ full_name: true, phone: true, email: true });

    if (!isValid) {
      setErrors(currentErrors);
      Alert.alert('Thông tin chưa hợp lệ', 'Vui lòng kiểm tra và sửa các ô báo lỗi màu đỏ.');
      return;
    }

    setSaving(true);
    const res = await updateProfile(formData);
    setSaving(false);

    if (res.success) {
      Alert.alert('Thành công 🎉', res.message);
    } else {
      Alert.alert('Thông báo', res.message);
    }
  };

  const handleConfirmLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Alert.alert('Thông báo', 'Đã đăng xuất tài khoản thành công!');
          },
        },
      ]
    );
  };

  if (loadingProfile) {
    return <LoadingState message="Đang tải hồ sơ ứng viên..." />;
  }

  // Nếu Khách chưa đăng nhập -> Hiển thị Banner Chế độ Khách
  if (!user) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right']}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          <View style={styles.guestBannerCard}>
            <View style={styles.guestIconCircle}>
              <Ionicons name="person-outline" size={48} color={colors.primaryMain} />
            </View>
            <Text style={styles.guestTitle}>Chào mừng bạn đến với Đồng Tháp Job Finder!</Text>
            <Text style={styles.guestDesc}>
              Bạn đang ở Chế độ Khách. Đăng nhập ngay để mở khóa trọn vẹn các tính năng:
            </Text>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="flash" size={18} color={colors.primaryMain} style={{ marginRight: 8 }} />
                <Text style={styles.featureText}>Ứng tuyển công việc siêu tốc với 1 chạm</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="heart" size={18} color={colors.error} style={{ marginRight: 8 }} />
                <Text style={styles.featureText}>Lưu danh sách công việc yêu thích cá nhân</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="document-text" size={18} color={colors.secondaryMain} style={{ marginRight: 8 }} />
                <Text style={styles.featureText}>Theo dõi trạng thái đơn đã nộp theo thời gian thực</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.loginActionBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Ionicons name="log-in-outline" size={20} color={colors.textLight} style={{ marginRight: 8 }} />
              <Text style={styles.loginActionText}>Đăng Nhập / Đăng Ký Ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenWrapper>
    );
  }

  const bioLength = formData.bio ? formData.bio.length : 0;
  const skillsLength = formData.skills ? formData.skills.length : 0;

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Header Card với Avatar Tròn & Icon Máy ảnh & Role Badge */}
          <View style={styles.profileHeaderCard}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity
                style={styles.avatarCircle}
                onPress={handlePickAvatar}
                activeOpacity={0.8}
              >
                {formData.avatar ? (
                  <Image source={{ uri: formData.avatar }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={44} color={colors.primaryMain} />
                )}

                {uploadingAvatar && (
                  <View style={styles.avatarLoadingOverlay}>
                    <ActivityIndicator size="small" color={colors.textLight} />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cameraBadge}
                onPress={handlePickAvatar}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="camera" size={16} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            <Text style={styles.headerName}>
              {user.full_name || formData.full_name || 'Ứng Viên'}
            </Text>
            <View style={styles.roleBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.primaryMain} style={{ marginRight: 4 }} />
              <Text style={styles.roleBadgeText}>Tài khoản Ứng viên</Text>
            </View>
            <Text style={styles.headerEmail}>{user.email}</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

            {/* Input 1: Họ và tên */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Họ và tên <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.full_name && touched.full_name && styles.inputError,
                ]}
              >
                <Ionicons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="VD: Nguyễn Văn Sinh Viên"
                  placeholderTextColor={colors.textMuted}
                  value={formData.full_name}
                  onChangeText={(val) => handleChange('full_name', val)}
                  onBlur={() => handleBlur('full_name')}
                />
              </View>
              {errors.full_name && touched.full_name && (
                <Text style={styles.errorText}>{errors.full_name}</Text>
              )}
            </View>

            {/* Input 2: Số điện thoại */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Số điện thoại <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.phone && touched.phone && styles.inputError,
                ]}
              >
                <Ionicons name="call-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="VD: 0912345678"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={formData.phone}
                  onChangeText={(val) => handleChange('phone', val)}
                  onBlur={() => handleBlur('phone')}
                />
              </View>
              {errors.phone && touched.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            {/* Input 3: Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email liên hệ <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.email && touched.email && styles.inputError,
                ]}
              >
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="VD: sinhvien@gmail.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(val) => handleChange('email', val)}
                  onBlur={() => handleBlur('email')}
                />
              </View>
              {errors.email && touched.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Kỹ năng & Giới thiệu thêm</Text>

            {/* Input 4: Kỹ năng */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Kỹ năng sở trường</Text>
                <Text style={styles.counterText}>{skillsLength}/200</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="build-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="VD: Giao tiếp, Tiếng Anh B1, React Native, Canva"
                  placeholderTextColor={colors.textMuted}
                  maxLength={200}
                  value={formData.skills}
                  onChangeText={(val) => handleChange('skills', val)}
                />
              </View>
            </View>

            {/* Input 5: Giới thiệu ngắn / Bio */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Giới thiệu bản thân (Bio / CV rút gọn)</Text>
                <Text style={styles.counterText}>{bioLength}/300</Text>
              </View>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Giới thiệu về kinh nghiệm, lịch rảnh học tập hoặc mong muốn công việc..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={300}
                  value={formData.bio}
                  onChangeText={(val) => handleChange('bio', val)}
                />
              </View>
            </View>

            {/* Nút Lưu Hồ Sơ */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!isValid || saving) && styles.saveButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isValid || saving}
              activeOpacity={0.8}
            >
              <Ionicons name="save-outline" size={20} color={colors.textLight} style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>
                {saving ? 'Đang lưu CSDL...' : 'Lưu thông tin hồ sơ'}
              </Text>
            </TouchableOpacity>

            {/* Nút Đăng xuất */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleConfirmLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} style={{ marginRight: 8 }} />
              <Text style={styles.logoutButtonText}>Đăng Xuất Tài Khoản</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  guestBannerCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
  },
  guestIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    ...typography.styles.h2,
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  guestDesc: {
    ...typography.styles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  featureList: {
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: 12,
    borderRadius: 12,
  },
  featureText: {
    ...typography.styles.captionMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  loginActionBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primaryMain,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 3,
  },
  loginActionText: {
    ...typography.styles.button,
    color: colors.textLight,
  },
  profileHeaderCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primaryMain,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.primaryMain,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    elevation: 3,
  },
  headerName: {
    ...typography.styles.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
  },
  roleBadgeText: {
    ...typography.styles.captionMedium,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  headerEmail: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    ...typography.styles.subtitle,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: 6,
  },
  required: {
    color: colors.error,
  },
  counterText: {
    ...typography.styles.caption,
    color: colors.textMuted,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    ...typography.styles.body,
    color: colors.textPrimary,
  },
  textAreaWrapper: {
    height: 100,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  textArea: {
    height: 80,
  },
  errorText: {
    ...typography.styles.caption,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: colors.primaryMain,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textMuted,
    elevation: 0,
  },
  saveButtonText: {
    ...typography.styles.button,
    color: colors.textLight,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.error,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  logoutButtonText: {
    ...typography.styles.button,
    color: colors.error,
    fontWeight: '700',
  },
});

export default ProfileScreen;
