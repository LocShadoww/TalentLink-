// src/components/LoadingState.js
// Component hiển thị trạng thái đang tải dữ liệu

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';

const LoadingState = ({ message = 'Đang tải dữ liệu...' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primaryMain} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  content: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  message: {
    ...typography.styles.bodyMedium,
    color: colors.textSecondary,
    marginTop: 14,
    textAlign: 'center',
  },
});

export default LoadingState;
