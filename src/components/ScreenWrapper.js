// src/components/ScreenWrapper.js
// Component bao bọc layout màn hình tiêu chuẩn, xử lý SafeArea (né Notch, Status Bar & Bottom Navigation)

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import colors from '../theme/colors';

const ScreenWrapper = ({
  children,
  style,
  backgroundColor = colors.background,
  statusBarStyle = 'dark',
  edges = ['top', 'left', 'right'], // Giữ bottom edge linh hoạt cho Bottom Tabs
}) => {
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.container, { backgroundColor }, style]}
    >
      <StatusBar style={statusBarStyle} backgroundColor={backgroundColor} />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default ScreenWrapper;
