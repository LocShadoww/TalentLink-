// src/components/FloatingChatBubble.js
// Component Bong bóng Chat nổi Kéo thả Tự do (Draggable Floating Bubble & Emerald Teal Theme Glow)

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUBBLE_SIZE = 60;
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
        activeOpacity={0.85}
        onPress={onPress}
      >
        <View style={styles.outerGlow}>
          <View style={styles.avatarWrapper}>
            {/* Hình ảnh Avatar Bé Sen bo tròn hoàn hảo */}
            <Image
              source={require('../../assets/images/senbot_float_icon.jpg')}
              style={styles.avatarImage}
              resizeMode="cover"
            />

            {/* Badge AI nhận diện trợ lý thông minh đồng bộ Teal */}
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>

            {/* Chấm tròn trạng thái Online hoạt động góc dưới */}
            <View style={styles.onlineDot} />
          </View>
        </View>
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
  },
  outerGlow: {
    padding: 2,
    borderRadius: 32,
    backgroundColor: '#006D5B', // Màu thương hiệu Emerald Teal đồng bộ tab bar
    shadowColor: '#006D5B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    position: 'relative',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  aiBadge: {
    position: 'absolute',
    top: -5,
    right: -4,
    backgroundColor: '#0D9488', // Teal sang trọng đồng bộ hệ sinh thái
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 2,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default FloatingChatBubble;
