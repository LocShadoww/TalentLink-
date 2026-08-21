// src/screens/ChatBotScreen.js
// Màn hình Trò chuyện với SenBot - Trợ lý AI Tìm việc DTHU (Modern Teal / Navy UI & Android Keyboard Fixed)

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { useApp } from '../context/AppContext';
import { sendMessageToAI } from '../services/aiChatService';

const QUICK_PROMPTS = [
  { label: '💻 Việc CNTT & React', query: 'Tìm việc làm Lập trình & CNTT tại Cao Lãnh' },
  { label: '☕ Phục vụ Cafe & Trà sữa', query: 'Có việc phục vụ quán cafe hay trà sữa nào không?' },
  { label: '🛒 Bán hàng & Thu ngân', query: 'Tìm việc bán hàng siêu thị Co.opmart hoặc Vincom' },
  { label: '📚 Gia sư Toán & Anh văn', query: 'Tìm việc gia sư dạy kèm cho sinh viên DTHU' },
  { label: '📍 Bản đồ việc làm', query: 'Chỉ đường xem việc làm trên bản đồ GPS' },
];

const ChatBotScreen = ({ navigation }) => {
  const { updateFilters } = useApp();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'bot',
      text: 'Chào bạn! Mình là SenBot - Trợ lý AI Tìm việc Sinh viên DTHU 🪷. Bạn cần SenBot hỗ trợ tìm việc làm thuộc lĩnh vực nào hoặc mẹo phỏng vấn hôm nay?',
      action: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const response = await sendMessageToAI(query);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.text,
        action: response.action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'SenBot đang phản hồi lại một chút. Bạn bấm nút bên dưới để xem vị trí trên bản đồ nhé!',
        action: 'MAP',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = (actionTag) => {
    if (actionTag === 'IT') {
      updateFilters({ category: 'Công nghệ thông tin' });
      navigation.navigate('MainTabs', { screen: 'HomeTab' });
    } else if (actionTag === 'FB') {
      updateFilters({ category: 'Phục vụ & Nhà hàng' });
      navigation.navigate('MainTabs', { screen: 'HomeTab' });
    } else if (actionTag === 'RETAIL') {
      updateFilters({ category: 'Bán hàng & Thu ngân' });
      navigation.navigate('MainTabs', { screen: 'HomeTab' });
    } else if (actionTag === 'TUTOR') {
      updateFilters({ category: 'Gia sư & Giáo dục' });
      navigation.navigate('MainTabs', { screen: 'HomeTab' });
    } else if (actionTag === 'MAP') {
      navigation.navigate('MainTabs', { screen: 'MapTab' });
    }
  };

  const renderActionButton = (actionTag) => {
    if (!actionTag) return null;

    let btnLabel = '';
    let btnIcon = 'arrow-forward-circle';

    if (actionTag === 'IT') {
      btnLabel = '💻 Xem việc Công nghệ thông tin ➔';
    } else if (actionTag === 'FB') {
      btnLabel = '☕ Xem việc Phục vụ & Cafe ➔';
    } else if (actionTag === 'RETAIL') {
      btnLabel = '🛒 Xem việc Bán hàng & Thu ngân ➔';
    } else if (actionTag === 'TUTOR') {
      btnLabel = '📚 Xem việc Gia sư & Giáo dục ➔';
    } else if (actionTag === 'MAP') {
      btnLabel = '📍 Mở bản đồ việc làm GPS ➔';
    } else {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleExecuteAction(actionTag)}
        activeOpacity={0.85}
      >
        <Ionicons name={btnIcon} size={18} color={colors.primaryDark} style={{ marginRight: 6 }} />
        <Text style={styles.actionButtonText}>{btnLabel}</Text>
      </TouchableOpacity>
    );
  };

  const renderMessageItem = ({ item }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
        {!isUser && (
          <View style={styles.botAvatarCircle}>
            <Ionicons name="hardware-chip" size={20} color={colors.primaryMain} />
          </View>
        )}

        <View style={styles.messageGroup}>
          <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
            <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.botMessageText]}>
              {item.text}
            </Text>
            <Text style={[styles.timeText, isUser ? styles.userTimeText : styles.botTimeText]}>
              {item.timestamp}
            </Text>
          </View>

          {/* Render Nút bấm Hành động nếu Bot phản hồi có Tag */}
          {!isUser && renderActionButton(item.action)}
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : (StatusBar.currentHeight || 0)}
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <View style={styles.headerAvatarWrap}>
              <Ionicons name="hardware-chip" size={22} color={colors.primaryMain} />
              <View style={styles.onlineDot} />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.headerTitle}>SenBot - AI Tìm Việc DTHU</Text>
              <Text style={styles.headerStatus}>🟢 Trực tuyến 24/7 (Hybrid AI)</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() =>
              setMessages([
                {
                  id: Date.now().toString(),
                  sender: 'bot',
                  text: 'Đã làm mới cuộc trò chuyện. Bạn cần hỏi SenBot điều gì nữa không?',
                  action: null,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
          >
            <Ionicons name="refresh" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Thẻ Gợi ý câu hỏi nhanh (Quick Prompts) */}
        <View style={styles.promptsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsScroll}>
            {QUICK_PROMPTS.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.promptChip}
                onPress={() => handleSend(item.query)}
                activeOpacity={0.75}
              >
                <Text style={styles.promptChipText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Danh sách Tin nhắn Chat */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.chatListContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            loading ? (
              <View style={styles.loadingTypingRow}>
                <View style={styles.botAvatarCircle}>
                  <Ionicons name="hardware-chip" size={20} color={colors.primaryMain} />
                </View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={colors.primaryMain} />
                  <Text style={styles.typingText}>SenBot đang suy nghĩ...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Ô Nhập tin nhắn & Nút Gửi */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Hỏi SenBot (VD: Tìm việc CNTT, phỏng vấn...)"
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || loading}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
  },
  backBtn: {
    padding: 4,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  headerAvatarWrap: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primaryMain,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  headerTitle: {
    ...typography.styles.h3,
    color: colors.primaryDark,
  },
  headerStatus: {
    ...typography.styles.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  resetBtn: {
    padding: 6,
  },
  promptsContainer: {
    backgroundColor: colors.surfaceVariant,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  promptsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  promptChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promptChipText: {
    ...typography.styles.captionMedium,
    color: colors.primaryDark,
    fontSize: 12,
  },
  chatListContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  botAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primaryMain,
  },
  messageGroup: {
    maxWidth: '78%',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: colors.primaryMain,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...typography.styles.body,
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.textLight,
  },
  botMessageText: {
    color: colors.textPrimary,
  },
  timeText: {
    ...typography.styles.caption,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimeText: {
    color: colors.primaryLight,
  },
  botTimeText: {
    color: colors.textMuted,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMain,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    ...typography.styles.captionMedium,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  loadingTypingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  typingText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'android' ? 12 : 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...typography.styles.body,
    color: colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMain,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    elevation: 2,
  },
  sendBtnDisabled: {
    backgroundColor: colors.textMuted,
    elevation: 0,
  },
});

export default ChatBotScreen;
