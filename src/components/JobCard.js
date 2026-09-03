// src/components/JobCard.js
// Thẻ hiển thị công việc (Tối ưu phong cách Modern Teal, Company Logo & 4 Hình thức làm việc)

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { formatSalary, formatDate, getWorkTypeLabel, getWorkTypeStyle } from '../utils/formatters';
import { getJobImageSource } from '../utils/imageMapper';

const CATEGORY_MAP = {
  all: 'Tất cả',
  it: 'Công nghệ thông tin',
  fnb: 'Phục vụ Cafe & Trà sữa',
  sales: 'Bán hàng & Thu ngân',
  education: 'Gia sư & Trợ giảng',
  delivery: 'Giao hàng & Lao động',
};

const JobCard = ({ job, isFavorite = false, hideFavorite = false, onToggleFavorite, onPress }) => {
  const [localFav, setLocalFav] = React.useState(isFavorite);

  React.useEffect(() => {
    setLocalFav(isFavorite);
  }, [isFavorite]);

  const handleToggle = () => {
    setLocalFav(!localFav);
    if (onToggleFavorite) onToggleFavorite(job.id);
  };

  if (!job) return null;

  const badgeStyle = getWorkTypeStyle(job.work_type, colors);
  const skillList = job.skills_tags
    ? job.skills_tags.split(',').map((s) => s.trim())
    : (Array.isArray(job.tags) ? job.tags : []);

  const categoryDisplayName =
    CATEGORY_MAP[job.category] || job.categoryName || job.category || 'Việc làm sinh viên';

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Top Company Row */}
      <View style={styles.companyRow}>
        <Image
          source={getJobImageSource(job)}
          style={styles.companyLogo}
        />
        <View style={styles.companyInfoGroup}>
          <Text style={styles.companyName} numberOfLines={1}>
            {job.company_name || job.company || 'Nhà tuyển dụng xác thực'}
          </Text>
          <Text style={styles.category}>{categoryDisplayName}</Text>
        </View>

        {!hideFavorite && (
          <TouchableOpacity
            style={styles.favButton}
            onPress={handleToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={localFav ? 'heart' : 'heart-outline'}
              size={24}
              color={localFav ? colors.error : colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Job Title */}
      <Text style={styles.title} numberOfLines={2}>
        {job.title}
      </Text>

      {/* Salary & Work Type Row */}
      <View style={styles.salaryRow}>
        <Text style={styles.salaryText}>
          {formatSalary(job.salary_min, job.salary_max)}
        </Text>
        <View style={[styles.workTypeBadge, { backgroundColor: badgeStyle.bg }]}>
          <Text style={[styles.workTypeText, { color: badgeStyle.text }]}>
            {getWorkTypeLabel(job.work_type)}
          </Text>
        </View>
      </View>

      {/* Skill Tags Row */}
      {skillList.length > 0 && (
        <View style={styles.skillsRow}>
          {skillList.slice(0, 3).map((skill, index) => (
            <View key={index} style={styles.skillPill}>
              <Text style={styles.skillPillText}>{skill}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Card Footer Location & Date */}
      <View style={styles.footerRow}>
        <View style={styles.locationGroup}>
          <Ionicons name="location-outline" size={14} color={colors.primaryMain} />
          <Text style={styles.locationText} numberOfLines={1}>
            {job.location}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(job.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
  },
  companyInfoGroup: {
    flex: 1,
  },
  companyName: {
    ...typography.styles.subtitle,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  category: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  favButton: {
    padding: 8,
    alignSelf: 'flex-start',
    marginTop: -4,
  },
  title: {
    ...typography.styles.h3,
    color: colors.textPrimary,
    marginBottom: 10,
    lineHeight: 22,
  },
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  salaryText: {
    ...typography.styles.h3,
    color: colors.primaryMain,
    fontWeight: '700',
  },
  workTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  workTypeText: {
    ...typography.styles.badge,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  skillPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  skillPillText: {
    ...typography.styles.caption,
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    paddingTop: 10,
  },
  locationGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  dateText: {
    ...typography.styles.caption,
    color: colors.textMuted,
  },
});

export default React.memo(JobCard);
