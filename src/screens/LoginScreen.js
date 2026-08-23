// src/screens/LoginScreen.js
// Màn hình Đăng nhập ứng dụng Tìm Việc Part-time / Freelance (Modern Teal / Navy UI)

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
import { validateLoginForm, validateEmail, validatePassword } from '../utils/validate';

const LoginScreen = ({ navigation }) => {
  const { login } = useApp();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    if (field === 'email') err = validateEmail(value);
    if (field === 'password') err = validatePassword(value);

    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleLogin = async () => {
    setTouched({ email: true, password: true });

    const { isValid, errors: currentErrors } = validateLoginForm(formData);
    if (!isValid) {
      setErrors(currentErrors);
      return;
    }

    setSubmitting(true);
    const res = await login(formData.email, formData.password);
    setSubmitting(false);

    if (res.success) {
      Alert.alert('Thành công 🎉', `Chào mừng ${res.user.full_name} quay trở lại!`, [
        {
          text: 'Bắt đầu ngay',
          onPress: () => navigation.navigate(res.user.role === 'employer' ? 'EmployerTabs' : 'MainTabs'),
        },
      ]);
    } else {
      Alert.alert('Đăng nhập thất bại', res.message || 'Email hoặc mật khẩu không chính xác.');
    }
  };

  const handleGuestContinue = () => {
    navigation.navigate('MainTabs');
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
          {/* Header Banner */}
          <View style={styles.headerBox}>
            <View style={styles.logoCircle}>
              <Ionicons name="briefcase" size={38} color={colors.primaryMain} />
            </View>
            <Text style={styles.appTitle}>Đồng Tháp Job Finder</Text>
            <Text style={styles.appSubtitle}>Tìm việc part-time & freelance uy tín cho sinh viên</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đăng Nhập Tài Khoản</Text>
            <Text style={styles.cardDesc}>
              Nhập email và mật khẩu của bạn để ứng tuyển & lưu việc làm yêu thích
            </Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email hoặc Số điện thoại</Text>
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

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
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
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
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

            {/* Nút Đăng nhập */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleLogin}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.textLight} />
              ) : (
                <>
                  <Ionicons
                    name="log-in-outline"
                    size={20}
                    color={colors.textLight}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.submitButtonText}>Đăng Nhập</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Link Đăng ký */}
            <View style={styles.registerLinkRow}>
              <Text style={styles.registerLinkText}>Chưa có tài khoản?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLinkHighlight}> Đăng ký ngay ➔</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Guest Button */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestContinue}
            activeOpacity={0.8}
          >
            <Ionicons name="compass-outline" size={18} color={colors.primaryDark} style={{ marginRight: 6 }} />
            <Text style={styles.guestButtonText}>Khám phá việc làm với tư cách Khách ➔</Text>
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
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  headerBox: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryMain,
    marginBottom: 12,
  },
  appTitle: {
    ...typography.styles.h1,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  appSubtitle: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
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
  cardTitle: {
    ...typography.styles.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginBottom: 20,
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
    marginTop: 8,
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
  registerLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  registerLinkText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
  registerLinkHighlight: {
    ...typography.styles.captionMedium,
    color: colors.primaryMain,
    fontWeight: '700',
  },
  guestButton: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guestButtonText: {
    ...typography.styles.button,
    color: colors.primaryDark,
  },
});

export default LoginScreen;
