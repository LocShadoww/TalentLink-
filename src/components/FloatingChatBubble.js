// src/components/FloatingChatBubble.js
// Component Bong bóng Chat nổi Kéo thả Tự do (Draggable Floating Bubble & Snap to Edge) cho SenBot AI

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import typography from '../theme/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUBBLE_SIZE = 58;
const INITIAL_X = SCREEN_WIDTH - BUBBLE_SIZE - 16;
const INITIAL_Y = SCREEN_HEIGHT - BUBBLE_SIZE - 100;

const FloatingChatBubble = ({ onPress }) => {
  const pan = useRef(new Animated.ValueXY({ x: INITIAL_X, y: INITIAL_Y })).current;
  const lastOffset = useRef({ x: INITIAL_X, y: INITIAL_Y });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: lastOffset.current.x,
          y: lastOffset.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();

        // 1. Kiểm tra nếu chạm nhẹ (Tap < 6px) -> Mở Chatbot Modal
        if (Math.abs(gestureState.dx) < 6 && Math.abs(gestureState.dy) < 6) {
          if (onPress) onPress();
          return;
        }

        // 2. Tính toán vị trí thả tay & Tự động Hít mép lề (Snap to Edge)
        const currentX = lastOffset.current.x + gestureState.dx;
        const currentY = lastOffset.current.y + gestureState.dy;

        // Giới hạn y không vượt quá màn hình
        const clampedY = Math.max(60, Math.min(SCREEN_HEIGHT - BUBBLE_SIZE - 80, currentY));

        // Xác định lề gần nhất (Mép trái 16px hoặc Mép phải SCREEN_WIDTH - BUBBLE_SIZE - 16px)
        const targetX = currentX < (SCREEN_WIDTH - BUBBLE_SIZE) / 2 ? 16 : SCREEN_WIDTH - BUBBLE_SIZE - 16;

        lastOffset.current = { x: targetX, y: clampedY };

        Animated.spring(pan, {
          toValue: { x: targetX, y: clampedY },
          useNativeDriver: false,
          bounciness: 8,
          speed: 12,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.bubbleContainer,
        {
          transform: pan.getTranslateTransform(),
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.bubbleInner}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <Ionicons name="hardware-chip" size={26} color={colors.textLight} />
        <View style={styles.lotusBadge}>
          <Text style={styles.lotusBadgeText}>🪷 AI</Text>
        </View>
        <View style={styles.onlinePulse} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bubbleInner: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: colors.primaryMain,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: colors.surface,
    position: 'relative',
  },
  lotusBadge: {
    position: 'absolute',
    top: -5,
    right: -4,
    backgroundColor: colors.accentAmber,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  lotusBadgeText: {
    ...typography.styles.badge,
    fontSize: 9,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  onlinePulse: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});

export default FloatingChatBubble;
