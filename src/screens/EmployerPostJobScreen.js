// src/screens/EmployerPostJobScreen.js
// Màn hình Đăng tin tuyển dụng mới

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import ScreenWrapper from '../components/ScreenWrapper';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { addJobToDB } from '../db/database';
import { useApp } from '../context/AppContext';

const CATEGORIES = [
  'Công nghệ thông tin',
  'Phục vụ & Nhà hàng',
  'Bán hàng & Thu ngân',
  'Gia sư & Giáo dục',
  'Marketing & Truyền thông',
  'Giao hàng & Lao động',
];

const WORK_TYPES = [
  { id: 'partime', label: 'Bán thời gian (Part-time)' },
  { id: 'fulltime', label: 'Toàn thời gian (Full-time)' },
  { id: 'freelance', label: 'Từ xa (Freelance/Remote)' },
  { id: 'internship', label: 'Thực tập sinh (Internship)' },
];

const EmployerPostJobScreen = ({ navigation }) => {
  const { profile } = useApp();
  
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    work_type: WORK_TYPES[0].id,
    salary_min: '',
    salary_max: '',
    location: '',
    schedule: '',
    description: '',
    requirements: '',
    contact_info: '',
    skills_tags: '',
    company_logo: null,
    latitude: null,
    longitude: null,
  });

  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGetLocation = async () => {
    setFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Ứng dụng cần quyền truy cập vị trí để tự động điền tọa độ.');
        setFetchingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      
      // Reverse geocode to get address string
      const geoCode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      let addressStr = '';
      if (geoCode && geoCode.length > 0) {
        const place = geoCode[0];
        addressStr = [place.streetNumber, place.street, place.subregion, place.city, place.region]
          .filter(Boolean)
          .join(', ');
      }

      setFormData(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        location: addressStr || prev.location
      }));
      Alert.alert('Thành công', 'Đã cập nhật vị trí hiện tại của bạn.');
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại.');
    } finally {
      setFetchingLocation(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh để tải hình minh hoạ.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
        handleChange('company_logo', base64Img);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh.');
    }
  };

  const handlePostJob = async () => {
    // Validate cơ bản
    if (!formData.title || !formData.location || !formData.description) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ Tiêu đề, Địa điểm và Mô tả công việc.');
      return;
    }

    setLoading(true);
    
    // Parse salary to numbers
    const jobData = {
      ...formData,
      salary_min: parseInt(formData.salary_min) || 0,
      salary_max: parseInt(formData.salary_max) || 0,
      company_logo: formData.company_logo || profile?.avatar || null, // Lấy ảnh form, nếu ko có thì lấy logo cty
    };

    const res = await addJobToDB(jobData);
    setLoading(false);

    if (res.success) {
      Alert.alert('Thành công 🎉', 'Tin tuyển dụng của bạn đã được đăng!', [
        {
          text: 'Về danh sách',
          onPress: () => {
            // Reset form
            setFormData({
              title: '',
              category: CATEGORIES[0],
              work_type: WORK_TYPES[0].id,
              salary_min: '',
              salary_max: '',
              location: '',
              schedule: '',
              description: '',
              requirements: '',
              contact_info: '',
              skills_tags: '',
              company_logo: null,
              latitude: null,
              longitude: null,
            });
            navigation.navigate('EmployerJobsTab');
          },
        },
      ]);
    } else {
      Alert.alert('Lỗi', res.message);
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
          <Text style={styles.headerTitle}>Tạo Tin Tuyển Dụng</Text>
          <Text style={styles.headerSubtitle}>Điền thông tin chi tiết để thu hút ứng viên</Text>

          {/* Hình minh họa / Logo công việc */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ảnh minh họa (Tùy chọn)</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage} activeOpacity={0.8}>
              {formData.company_logo ? (
                <Image source={{ uri: formData.company_logo }} style={styles.pickedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={32} color={colors.textMuted} />
                  <Text style={styles.imagePlaceholderText}>Nhấn để tải ảnh lên</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Tiêu đề công việc */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tiêu đề công việc <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Nhân viên phục vụ quán cafe..."
              placeholderTextColor={colors.textMuted}
              value={formData.title}
              onChangeText={(txt) => handleChange('title', txt)}
            />
          </View>

          {/* Danh mục (Category) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngành nghề <Text style={styles.required}>*</Text></Text>
            <View style={styles.chipGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, formData.category === cat && styles.chipSelected]}
                  onPress={() => handleChange('category', cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, formData.category === cat && styles.chipTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Hình thức làm việc */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hình thức <Text style={styles.required}>*</Text></Text>
            <View style={styles.chipGrid}>
              {WORK_TYPES.map((wt) => (
                <TouchableOpacity
                  key={wt.id}
                  style={[styles.chip, formData.work_type === wt.id && styles.chipSelected]}
                  onPress={() => handleChange('work_type', wt.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, formData.work_type === wt.id && styles.chipTextSelected]}>
                    {wt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Mức lương */}
          <View style={styles.rowGroup}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Lương tối thiểu (VNĐ)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 25000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={formData.salary_min}
                onChangeText={(txt) => handleChange('salary_min', txt)}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Lương tối đa (VNĐ)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 50000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={formData.salary_max}
                onChangeText={(txt) => handleChange('salary_max', txt)}
              />
            </View>
          </View>

          {/* Địa điểm */}
          <View style={styles.inputGroup}>
            <View style={styles.locationHeader}>
              <Text style={styles.label}>Địa điểm làm việc <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity onPress={handleGetLocation} disabled={fetchingLocation}>
                {fetchingLocation ? (
                  <ActivityIndicator size="small" color={colors.primaryMain} />
                ) : (
                  <Text style={styles.getLocationText}>📍 Lấy vị trí</Text>
                )}
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="VD: 123 Đường A, Phường B, Cao Lãnh"
              placeholderTextColor={colors.textMuted}
              value={formData.location}
              onChangeText={(txt) => handleChange('location', txt)}
            />
          </View>
          
          {/* Thời gian làm việc */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Thời gian làm việc</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Ca sáng (7h-12h), T2 - T6"
              placeholderTextColor={colors.textMuted}
              value={formData.schedule}
              onChangeText={(txt) => handleChange('schedule', txt)}
            />
          </View>

          {/* Mô tả công việc */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả chi tiết <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nhập mô tả các công việc cần làm..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(txt) => handleChange('description', txt)}
              textAlignVertical="top"
            />
          </View>

          {/* Yêu cầu công việc */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yêu cầu ứng viên</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="VD: Nhanh nhẹn, trung thực, có xe máy..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              value={formData.requirements}
              onChangeText={(txt) => handleChange('requirements', txt)}
              textAlignVertical="top"
            />
          </View>

          {/* Kỹ năng */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Thẻ kỹ năng (Tags)</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Giao tiếp, React, Tiếng Anh"
              placeholderTextColor={colors.textMuted}
              value={formData.skills_tags}
              onChangeText={(txt) => handleChange('skills_tags', txt)}
            />
          </View>

          {/* Liên hệ */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Thông tin liên hệ bổ sung</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: SĐT: 0123... hoặc Email: abc@xyz.com"
              placeholderTextColor={colors.textMuted}
              value={formData.contact_info}
              onChangeText={(txt) => handleChange('contact_info', txt)}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handlePostJob}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <Text style={styles.submitButtonText}>Đang xử lý...</Text>
            ) : (
              <>
                <Ionicons name="paper-plane" size={20} color={colors.textLight} style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>Đăng tin ngay</Text>
              </>
            )}
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
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    ...typography.styles.h1,
    color: colors.primaryDark,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...typography.styles.body,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  imagePicker: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    ...typography.styles.caption,
    color: colors.textMuted,
    marginTop: 8,
  },
  pickedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  getLocationText: {
    ...typography.styles.captionMedium,
    color: colors.primaryMain,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  rowGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.styles.captionMedium,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: '600',
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...typography.styles.body,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primaryMain,
    borderColor: colors.primaryMain,
  },
  chipText: {
    ...typography.styles.captionMedium,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.textLight,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: colors.primaryMain,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 10,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  submitButtonText: {
    ...typography.styles.button,
    color: colors.textLight,
  },
});

export default EmployerPostJobScreen;
