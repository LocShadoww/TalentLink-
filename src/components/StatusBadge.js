// src/components/StatusBadge.js
// Component hiển thị Badge trạng thái đơn ứng tuyển

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';

const StatusBadge = ({ status = 'pending' }) => {
  let badgeConfig = colors.statusPending;

  if (status === 'approved') {
    badgeConfig = colors.statusApproved;
  } else if (status === 'rejected') {
    badgeConfig = colors.statusRejected;
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeConfig.bg,
          borderColor: badgeConfig.border,
        },
      ]}
    >
      <Text style={[styles.text, { color: badgeConfig.text }]}>
        {badgeConfig.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.styles.badge,
  },
});

export default StatusBadge;
