// src/screens/RegisterScreen.js
// Màn hình Đăng ký tài khoản mới Ứng viên (Modern Teal / Navy UI)

import React, { useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { useApp } from '../context/AppContext';
import {
  validateRegisterForm,
  validateFullName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validate';

const RegisterScreen = ({ navigation }) => {
  const { register } = useApp();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (touched[field]) {
      validateSingleField(field, value, updated);
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateSingleField(field, formData[field], formData);
  };

  const validateSingleField = (field, value, currentForm) => {
    let err = null;
    if (field === 'full_name') err = validateFullName(value);
    if (field === 'email') err = validateEmail(value);
    if (field === 'phone') err = validatePhone(value);
    if (field === 'password') err = validatePassword(value);
    if (field === 'confirmPassword') err = validateConfirmPassword(currentForm.password, value);

    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleRegister = async () => {
    setTouched({
      full_name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    const { isValid, errors: currentErrors } = validateRegisterForm(formData);
    if (!isValid) {
      setErrors(currentErrors);
      return;
    }

    setSubmitting(true);
    const res = await register(formData);
    setSubmitting(false);

    if (res.success) {
      Alert.alert('Thành công 🎉', `Đã tạo tài khoản cho ${res.user.full_name}!`, [
        {
          text: 'Vào trang chủ ngay',
          onPress: () => navigation.navigate('MainTabs'),
        },
      ]);
    } else {
      Alert.alert('Đăng ký thất bại', res.message || 'Không thể tạo tài khoản. Vui lòng thử lại!');
    }
  };

  return (
    <ScreenWrapper edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar Back */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Header Box */}
          <View style={styles.headerBox}>
            <Text style={styles.headerTitle}>Tạo Tài Khoản Mới</Text>
            <Text style={styles.headerSubtitle}>
              Điền thông tin để bắt đầu tìm kiếm & ứng tuyển công việc phù hợp
            </Text>
          </View>

          {/* Register Card */}
          <View style={styles.card}>
            {/* Input 1: Họ tên */}
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
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
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

            {/* Input 2: Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.email && touched.email && styles.inputError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
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

            {/* Input 3: Phone */}
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
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
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

            {/* Input 4: Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Mật khẩu <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password && touched.password && styles.inputError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu tối thiểu 6 ký tự"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(val) => handleChange('password', val)}
                  onBlur={() => handleBlur('password')}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && touched.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Input 5: Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Xác nhận Mật khẩu <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.confirmPassword && touched.confirmPassword && styles.inputError,
                ]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập lại mật khẩu vừa gán"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(val) => handleChange('confirmPassword', val)}
                  onBlur={() => handleBlur('confirmPassword')}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && touched.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Nút Đăng ký */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleRegister}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.textLight} />
              ) : (
                <>
                  <Ionicons
                    name="person-add-outline"
                    size={20}
                    color={colors.textLight}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.submitButtonText}>Đăng Ký Tài Khoản</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Link Chuyển Đăng nhập */}
            <View style={styles.loginLinkRow}>
              <Text style={styles.loginLinkText}>Đã có tài khoản?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLinkHighlight}> Đăng nhập ngay ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    padding: 20,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  headerBox: {
    marginBottom: 20,
  },
  headerTitle: {
    ...typography.styles.h1,
    color: colors.primaryDark,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    ...typography.styles.subtitle,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 6,
  },
  required: {
    color: colors.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  inputIcon: {
    marginRight: 10,
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
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.primaryMain,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textMuted,
    elevation: 0,
  },
  submitButtonText: {
    ...typography.styles.button,
    color: colors.textLight,
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  loginLinkText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
  loginLinkHighlight: {
    ...typography.styles.captionMedium,
    color: colors.primaryMain,
    fontWeight: '700',
  },
});

export default RegisterScreen;
