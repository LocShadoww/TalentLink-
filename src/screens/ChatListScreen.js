import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useApp } from '../context/AppContext';
import { subscribeToChatList } from '../db/database';
import ScreenWrapper from '../components/ScreenWrapper';
import colors from '../theme/colors';
import typography from '../theme/typography';

const ChatListScreen = ({ navigation }) => {
  const { user, profile } = useApp();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToChatList((list) => {
      setConversations(list);
    });
    return () => unsubscribe();
  }, [user]);

  const renderItem = ({ item }) => {
    // Find the other participant
    const otherUserId = item.participants.find(id => id !== user?.uid);
    const otherUser = item.participantDetails?.[otherUserId] || { name: 'Người dùng' };

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatDetail', { 
          conversationId: item.id,
          receiverId: otherUserId,
          receiverName: otherUser.name 
        })}
      >
        {otherUser.avatar ? (
          <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{otherUser.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.chatInfo}>
          <Text style={styles.userName}>{otherUser.name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'Bắt đầu cuộc trò chuyện'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 8,
  },
  headerTitle: {
    ...typography.styles.h2,
    color: '#1e293b',
  },
  listContent: {
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryMain,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: colors.textLight,
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
  },
  userName: {
    ...typography.styles.subtitle,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  lastMessage: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.styles.body,
    color: colors.textMuted,
  }
});

export default ChatListScreen;
