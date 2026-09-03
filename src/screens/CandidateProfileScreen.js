import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useApp } from '../context/AppContext';

const CandidateProfileScreen = ({ route, navigation }) => {
  const { candidateId } = route.params;
  const { user } = useApp();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidateProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', candidateId));
        if (userDoc.exists()) {
          setCandidate({ id: userDoc.id, ...userDoc.data() });
        } else {
          setError('Không tìm thấy hồ sơ ứng viên.');
        }
      } catch (err) {
        console.error('Lỗi tải hồ sơ:', err);
        setError('Đã xảy ra lỗi khi tải hồ sơ ứng viên.');
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchCandidateProfile();
    }
  }, [candidateId]);

  const handleCall = () => {
    if (candidate?.phone) {
      Linking.openURL(`tel:${candidate.phone}`).catch(() => {
        Alert.alert('Lỗi', 'Không thể mở trình gọi điện.');
      });
    }
  };

  const handleEmail = () => {
    if (candidate?.email) {
      Linking.openURL(`mailto:${candidate.email}`).catch(() => {
        Alert.alert('Lỗi', 'Không thể mở ứng dụng gửi Email.');
      });
    }
  };

  const handleChat = () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('ChatDetail', {
      conversationId: null,
      receiverId: candidate.id,
      receiverName: candidate.full_name || 'Ứng viên',
      receiverAvatar: candidate.avatar || null
    });
  };


  if (error || !candidate) return (
    <ScreenWrapper>
      <ErrorState title="Lỗi" message={error} buttonText="Quay lại" onRetry={() => navigation.goBack()} />
    </ScreenWrapper>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ ứng viên</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          {candidate.avatar ? (
            <Image source={{ uri: candidate.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={colors.primaryMain} />
            </View>
          )}
          <Text style={styles.name}>{candidate.full_name || 'Ứng viên'}</Text>
          <Text style={styles.email}>{candidate.email}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Ionicons name="call" size={20} color={colors.primaryMain} />
            <Text style={styles.actionText}>Gọi điện</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
            <Ionicons name="mail" size={20} color={colors.primaryMain} />
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleChat}>
            <Ionicons name="chatbubble" size={20} color={colors.primaryMain} />
            <Text style={styles.actionText}>Nhắn tin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.infoText}>{candidate.phone || 'Chưa cập nhật'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.infoText}>{candidate.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kỹ năng chuyên môn</Text>
          <Text style={styles.bodyText}>
            {candidate.skills || 'Ứng viên chưa cập nhật kỹ năng chuyên môn.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giới thiệu bản thân</Text>
          <Text style={styles.bodyText}>
            {candidate.bio || 'Ứng viên chưa viết phần tự giới thiệu.'}
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.primaryDark,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    ...typography.styles.h2,
    color: colors.textLight,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    ...typography.styles.h1,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    ...typography.styles.body,
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    ...typography.styles.captionMedium,
    color: colors.primaryMain,
    marginTop: 8,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.primaryDark,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    ...typography.styles.body,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  bodyText: {
    ...typography.styles.body,
    color: colors.textSecondary,
    lineHeight: 24,
  }
});

export default CandidateProfileScreen;
