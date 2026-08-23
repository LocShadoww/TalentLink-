// src/screens/EmployerProfileScreen.js
// Màn hình Hồ sơ Nhà tuyển dụng & Cài đặt

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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
  validateCompanyName,
} from '../utils/validate';
import { uploadImageAsync } from '../utils/uploadImage';

const EmployerProfileScreen = ({ navigation }) => {
  const { user, profile, loadingProfile, updateProfile, logout } = useApp();

  const [formData, setFormData] = useState({
    company_name: '',
    full_name: '',
    phone: '',
    email: '',
    avatar: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user || profile) {
      setFormData({
        company_name: profile?.company_name || user?.company_name || '',
        full_name: profile?.full_name || user?.full_name || '',
        email: profile?.email || user?.email || '',
        phone: profile?.phone || user?.phone || '',
        avatar: profile?.avatar || null,
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
    if (field === 'company_name') err = validateCompanyName(value, 'employer');
    if (field === 'full_name') err = validateFullName(value);
    if (field === 'phone') err = validatePhone(value);
    if (field === 'email') err = validateEmail(value);

    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const validateForm = () => {
    const newErrors = {};
    const companyErr = validateCompanyName(formData.company_name, 'employer');
    if (companyErr) newErrors.company_name = companyErr;
    
    const nameErr = validateFullName(formData.full_name);
    if (nameErr) newErrors.full_name = nameErr;

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    return newErrors;
  };

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handlePickAvatar = async () => {
    Alert.alert(
      'Đổi Logo/Avatar',
      'Vui lòng chọn phương thức:',
      [
        {
          text: '🖼️ Chọn từ thư viện',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện.', [{ text: 'Mở Cài đặt', onPress: openAppSettings }]);
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.4,
            });
            if (!result.canceled && result.assets?.[0]) {
              saveNewAvatar(result.assets[0].uri);
            }
          },
        },
        {
          text: '📸 Chụp ảnh mới',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Lỗi', 'Cần cấp quyền truy cập Camera.', [{ text: 'Mở Cài đặt', onPress: openAppSettings }]);
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.4,
            });
            if (!result.canceled && result.assets?.[0]) {
              saveNewAvatar(result.assets[0].uri);
            }
          },
        },
        { text: 'Hủy', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const saveNewAvatar = async (imageUri) => {
    setUploadingAvatar(true);
    
    // Upload hình lên Firebase Storage (thư mục company-logos)
    let finalUrl = imageUri;
    if (imageUri.startsWith('file://')) {
      const uploadedUrl = await uploadImageAsync(imageUri, 'company-logos');
      if (uploadedUrl) {
        finalUrl = uploadedUrl;
      } else {
        setUploadingAvatar(false);
        Alert.alert('Lỗi', 'Không thể tải ảnh lên máy chủ. Vui lòng thử lại.');
        return;
      }
    }

    const updatedForm = { ...formData, avatar: finalUrl };
    setFormData(updatedForm);
    const res = await updateProfile(updatedForm);
    setUploadingAvatar(false);
    if (res.success) {
      Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện/logo!');
    }
  };

  const handleSubmit = async () => {
    const currentErrors = validateForm();
    setTouched({ company_name: true, full_name: true, phone: true, email: true });

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      Alert.alert('Thông tin chưa hợp lệ', 'Vui lòng kiểm tra và sửa các ô báo lỗi màu đỏ.');
      return;
    }

    setSaving(true);
    const res = await updateProfile(formData);
    setSaving(false);

    if (res.success) {
      Alert.alert('Thành công', res.message);
    } else {
      Alert.alert('Lỗi', res.message);
    }
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Đăng xuất', 
        style: 'destructive',
        onPress: async () => {
          await logout();
        }
      },
    ]);
  };

  if (loadingProfile) {
    return <LoadingState message="Đang tải hồ sơ doanh nghiệp..." />;
  }

  const isValid = Object.keys(validateForm()).length === 0;

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Profile */}
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
                  <Ionicons name="business" size={44} color={colors.primaryMain} />
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
              {formData.company_name || 'Chưa cập nhật Công Ty'}
            </Text>
            <View style={styles.roleBadge}>
              <Ionicons name="briefcase-outline" size={14} color={colors.accentAmber} style={{ marginRight: 4 }} />
              <Text style={styles.roleBadgeText}>Tài khoản Doanh nghiệp</Text>
            </View>
            <Text style={styles.headerEmail}>{formData.email}</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Chỉnh sửa thông tin</Text>

            {/* Tên công ty */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên công ty / Cửa hàng <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, errors.company_name && touched.company_name && styles.inputError]}>
                <Ionicons name="business-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="VD: Công ty TNHH ABC"
                  placeholderTextColor={colors.textMuted}
                  value={formData.company_name}
                  onChangeText={(val) => handleChange('company_name', val)}
                  onBlur={() => handleBlur('company_name')}
                />
              </View>
              {errors.company_name && touched.company_name && <Text style={styles.errorText}>{errors.company_name}</Text>}
            </View>

            {/* Người đại diện */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên người đại diện <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, errors.full_name && touched.full_name && styles.inputError]}>
                <Ionicons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="VD: Nguyễn Văn A"
                  placeholderTextColor={colors.textMuted}
                  value={formData.full_name}
                  onChangeText={(val) => handleChange('full_name', val)}
                  onBlur={() => handleBlur('full_name')}
                />
              </View>
              {errors.full_name && touched.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}
            </View>

            {/* Số điện thoại */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, errors.phone && touched.phone && styles.inputError]}>
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
              {errors.phone && touched.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email liên hệ <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, errors.email && touched.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="VD: contact@abc.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(val) => handleChange('email', val)}
                  onBlur={() => handleBlur('email')}
                />
              </View>
              {errors.email && touched.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, (!isValid || saving) && styles.saveButtonDisabled]}
              onPress={handleSubmit}
              disabled={!isValid || saving}
              activeOpacity={0.8}
            >
              <Ionicons name="save-outline" size={20} color={colors.textLight} style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>
                {saving ? 'Đang lưu...' : 'Lưu hồ sơ doanh nghiệp'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Nút Đăng xuất */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text style={styles.logoutButtonText}>Đăng xuất tài khoản</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
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
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentAmber + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  roleBadgeText: {
    ...typography.styles.captionMedium,
    color: colors.accentAmber,
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
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
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
  errorText: {
    ...typography.styles.caption,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutButtonText: {
    ...typography.styles.button,
    color: colors.error,
    marginLeft: 8,
  },
});

export default EmployerProfileScreen;
