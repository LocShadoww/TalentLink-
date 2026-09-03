// src/screens/FilterScreen.js
// Màn hình Bộ Lọc Nâng Cao (FR-03 - Synced 6 Categories)

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { useApp } from '../context/AppContext';

const CATEGORIES = [
  'Tất cả',
  'Công nghệ thông tin',
  'Phục vụ & Nhà hàng',
  'Bán hàng & Thu ngân',
  'Gia sư & Giáo dục',
  'Marketing & Truyền thông',
  'Giao hàng & Lao động',
];

const WORK_TYPES = [
  { id: 'all', label: 'Tất cả hình thức' },
  { id: 'partime', label: '🟡 Bán thời gian (Part-time)' },
  { id: 'fulltime', label: '🔵 Toàn thời gian (Full-time)' },
  { id: 'freelance', label: '🟢 Làm việc từ xa (Remote / Freelance)' },
  { id: 'internship', label: '🟣 Thực tập sinh (Internship)' },
];

const SALARY_OPTIONS = [
  { value: 0, label: 'Tất cả mức lương' },
  { value: 20000, label: 'Từ 20.000đ / giờ' },
  { value: 25000, label: 'Từ 25.000đ / giờ' },
  { value: 30000, label: 'Từ 30.000đ / giờ' },
  { value: 50000, label: 'Từ 50.000đ / giờ' },
];

const FilterScreen = ({ navigation }) => {
  const { filters, updateFilters, resetFilters } = useApp();

  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'Tất cả');
  const [selectedWorkType, setSelectedWorkType] = useState(filters.workType || 'all');
  const [selectedMinSalary, setSelectedMinSalary] = useState(filters.minSalary || 0);

  // Áp dụng bộ lọc và quay lại Home
  const handleApply = () => {
    updateFilters({
      category: selectedCategory,
      workType: selectedWorkType,
      minSalary: selectedMinSalary,
    });
    navigation.goBack();
  };

  // Đặt lại bộ lọc
  const handleReset = () => {
    setSelectedCategory('Tất cả');
    setSelectedWorkType('all');
    setSelectedMinSalary(0);
    resetFilters();
    navigation.goBack();
  };

  return (
    <ScreenWrapper>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bộ lọc tìm kiếm</Text>
        <TouchableOpacity style={styles.resetHeaderButton} onPress={handleReset}>
          <Text style={styles.resetHeaderText}>Đặt lại</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Ngành nghề */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ngành nghề tuyển dụng</Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 2: Hình thức làm việc (4 loại) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hình thức làm việc</Text>
          <View style={styles.radioList}>
            {WORK_TYPES.map((wt) => {
              const isSelected = selectedWorkType === wt.id;
              return (
                <TouchableOpacity
                  key={wt.id}
                  style={[styles.radioOption, isSelected && styles.radioOptionSelected]}
                  onPress={() => setSelectedWorkType(wt.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radioDot, isSelected && styles.radioDotSelected]} />
                  <Text style={[styles.radioText, isSelected && styles.radioTextSelected]}>
                    {wt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 3: Mức lương tối thiểu (Theo giờ) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mức lương mong muốn (Theo giờ)</Text>
          <View style={styles.radioList}>
            {SALARY_OPTIONS.map((sal) => {
              const isSelected = selectedMinSalary === sal.value;
              return (
                <TouchableOpacity
                  key={sal.value}
                  style={[styles.radioOption, isSelected && styles.radioOptionSelected]}
                  onPress={() => setSelectedMinSalary(sal.value)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radioDot, isSelected && styles.radioDotSelected]} />
                  <Text style={[styles.radioText, isSelected && styles.radioTextSelected]}>
                    {sal.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Submit Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.8}>
          <Text style={styles.applyButtonText}>Áp dụng bộ lọc</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    ...typography.styles.h2,
    color: colors.textPrimary,
  },
  resetHeaderButton: {
    padding: 4,
  },
  resetHeaderText: {
    ...typography.styles.button,
    color: colors.primaryMain,
    fontSize: 14,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
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
    fontWeight: '600',
  },
  radioList: {
    gap: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  radioOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.textMuted,
    marginRight: 10,
  },
  radioDotSelected: {
    borderColor: colors.primaryMain,
    backgroundColor: colors.primaryMain,
  },
  radioText: {
    ...typography.styles.bodyMedium,
    color: colors.textPrimary,
  },
  radioTextSelected: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  applyButton: {
    backgroundColor: colors.primaryMain,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 2,
  },
  applyButtonText: {
    ...typography.styles.button,
    color: colors.textLight,
  },
});

export default FilterScreen;
