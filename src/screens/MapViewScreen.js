// src/screens/MapViewScreen.js
// Màn hình Bản đồ Định vị Tìm kiếm Việc làm (Map View Tab - 9 User Direct Google Maps Coordinates & Center 10.4550, 105.6360, Delta 0.08)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import LoadingState from '../components/LoadingState';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { formatSalary, getWorkTypeLabel } from '../utils/formatters';
import { fetchJobsFromDB } from '../db/database';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

// Tọa độ gốc mặc định: Trung tâm TP. Cao Lãnh (Bao phủ mượt 9 địa điểm thực tế từ DTHU đến KDL Gáo Giồng)
const DEFAULT_CENTER = {
  latitude: 10.4550,
  longitude: 105.6360,
};

const DEFAULT_REGION = {
  ...DEFAULT_CENTER,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// Tính khoảng cách giữa 2 tọa độ GPS (Haversine Formula) an toàn
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  try {
    const nLat1 = Number(lat1);
    const nLon1 = Number(lon1);
    const nLat2 = Number(lat2);
    const nLon2 = Number(lon2);
    if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null;

    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
    const dLon = ((nLon2 - nLon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((nLat1 * Math.PI) / 180) *
        Math.cos((nLat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return isNaN(d) ? null : d.toFixed(1);
  } catch (e) {
    return null;
  }
};

const MapViewScreen = ({ navigation }) => {
  const { jobs: contextJobs } = useApp();
  const mapRef = useRef(null);

  const [allMapJobs, setAllMapJobs] = useState([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [radiusFilter, setRadiusFilter] = useState(0); // 0 = tất cả, 5 = 5km, 10 = 10km, 20 = 20km

  // Tải danh sách tất cả việc làm từ CSDL độc lập để không bị ảnh hưởng bởi bộ lọc từ khóa của Trang chủ
  const loadAllMapJobs = useCallback(async () => {
    setLoadingMap(true);
    try {
      const response = await fetchJobsFromDB({});
      if (response && response.data && response.data.length > 0) {
        setAllMapJobs(response.data);
      } else if (contextJobs && contextJobs.length > 0) {
        setAllMapJobs(contextJobs);
      } else {
        setAllMapJobs([]);
      }
    } catch (err) {
      console.error('Lỗi nạp jobs cho bản đồ:', err);
      setAllMapJobs(contextJobs || []);
    } finally {
      setLoadingMap(false);
    }
  }, [contextJobs]);

  useFocusEffect(
    useCallback(() => {
      loadAllMapJobs();
    }, [loadAllMapJobs])
  );

  // Xin quyền và lấy tọa độ GPS hiện tại của người dùng
  const getCurrentLocation = async () => {
    setLoadingGPS(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Cần định vị GPS',
          'Vui lòng bật dịch vụ vị trí GPS để ứng dụng hiển thị khoảng cách đến các công việc xung quanh bạn.',
          [{ text: 'Đã hiểu' }]
        );
        setLoadingGPS(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userCoords);

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            ...userCoords,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          },
          1000
        );
      }
    } catch (error) {
      console.error('Lỗi định vị GPS:', error);
    } finally {
      setLoadingGPS(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Danh sách tin tuyển dụng từ CSDL chuẩn 9 tọa độ Google Maps trực tiếp từ người dùng
  const rawList = allMapJobs.length > 0 ? allMapJobs : contextJobs;
  const mapJobs = rawList.map((j) => ({
    ...j,
    latitude: Number(j.latitude),
    longitude: Number(j.longitude),
  }));

  // Gốc tính khoảng cách chuẩn: Vị trí người dùng (nếu có) hoặc mặc định Trung tâm TP. Cao Lãnh (10.4550, 105.6360)
  const baseOrigin = userLocation || DEFAULT_CENTER;

  // Lọc theo bán kính chuẩn xác so với gốc tính khoảng cách:
  // - radiusFilter = 0 ("Tất cả"): Trả về 100% 12 việc làm rải rác toàn tỉnh Đồng Tháp (Cao Lãnh, Sa Đéc, Lai Vung, Hồng Ngự, Gáo Giồng)
  // - radiusFilter = 5 ("< 5 km"): CHỈ trả về các việc quanh trung tâm Cao Lãnh (< 5km)
  // - radiusFilter = 20 ("< 20 km"): Trả về các việc ở Cao Lãnh, Lai Vung, Sa Đéc, Gáo Giồng
  const filteredMapJobs = mapJobs.filter((j) => {
    if (radiusFilter <= 0) return true;
    const dist = calculateDistance(
      baseOrigin.latitude,
      baseOrigin.longitude,
      j.latitude,
      j.longitude
    );
    return dist ? Number(dist) <= radiusFilter : true;
  });

  if (loadingMap && mapJobs.length === 0) {
    return <LoadingState message="Đang tải bản đồ tuyển dụng..." />;
  }

  return (
    <ScreenWrapper edges={['top']}>
      <View style={styles.container}>
        {/* Top Floating Control Bar */}
        <View style={styles.topControlBar}>
          <View style={styles.titleGroup}>
            <Text style={styles.headerTitle}>Bản đồ việc làm xung quanh</Text>
            <Text style={styles.headerSubtitle}>
              Hiển thị {filteredMapJobs.length}/{mapJobs.length} việc làm {userLocation ? 'quanh vị trí GPS' : 'quanh Trung tâm Cao Lãnh'}
            </Text>
          </View>

          {/* Quick Radius Filter Pills */}
          <View style={styles.radiusPillsRow}>
            {[0, 5, 10, 20].map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.radiusPill,
                  radiusFilter === r && styles.radiusPillActive,
                ]}
                onPress={() => setRadiusFilter(r)}
              >
                <Text
                  style={[
                    styles.radiusPillText,
                    radiusFilter === r && styles.radiusPillTextActive,
                  ]}
                >
                  {r === 0 ? 'Tất cả' : `< ${r} km`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interactive MapView (Full Flex 1 Layout & Safe MapPadding) */}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={DEFAULT_REGION}
          showsUserLocation={true}
          showsMyLocationButton={false}
          mapPadding={{
            top: 16,
            right: 16,
            bottom: selectedJob ? 200 : 30,
            left: 16,
          }}
          onPress={() => setSelectedJob(null)}
        >
          {/* Render Job Markers (Native Pin Đỏ pinColor="#E11D48" - Chuẩn Google Maps 100%) */}
          {filteredMapJobs.map((job, index) => {
            const isSelected = selectedJob?.id === job.id;
            const distanceStr = calculateDistance(
              baseOrigin.latitude,
              baseOrigin.longitude,
              job.latitude,
              job.longitude
            );

            return (
              <Marker
                key={job.id || `marker-${index}`}
                coordinate={{
                  latitude: Number(job.latitude),
                  longitude: Number(job.longitude),
                }}
                title={job.title}
                description={job.company_name}
                pinColor={isSelected ? '#004D5A' : '#E11D48'}
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedJob(job);
                }}
              >
                {/* Callout Bubble cho người dùng xem nhanh */}
                <Callout
                  tooltip
                  onPress={() =>
                    navigation.navigate('JobDetail', { jobId: job.id, job })
                  }
                >
                  <View style={styles.calloutBubble}>
                    <Text style={styles.calloutTitle} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <Text style={styles.calloutCompany}>{job.company_name}</Text>
                    <Text style={styles.calloutSalary}>
                      💰 {formatSalary(job.salary_min, job.salary_max)}
                    </Text>
                    {distanceStr ? (
                      <Text style={styles.calloutDistance}>
                        📍 Cách trung tâm {distanceStr} km
                      </Text>
                    ) : null}
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>

        {/* GPS My Location Button */}
        <TouchableOpacity
          style={[
            styles.gpsButton,
            selectedJob && { bottom: 205 },
          ]}
          onPress={getCurrentLocation}
          disabled={loadingGPS}
          activeOpacity={0.8}
        >
          <Ionicons
            name={loadingGPS ? 'sync-outline' : 'locate'}
            size={24}
            color={colors.primaryMain}
          />
        </TouchableOpacity>

        {/* Bottom Job Card (Bottom Sheet UI khi bấm chọn Marker) */}
        {selectedJob && (
          <View style={styles.bottomPreviewCard}>
            <TouchableOpacity
              style={styles.closeCardBtn}
              onPress={() => setSelectedJob(null)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={24} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.previewCardContent}>
              <Image
                source={{
                  uri:
                    selectedJob.company_logo ||
                    'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=150&q=80',
                }}
                style={styles.previewLogo}
              />
              <View style={styles.previewInfoGroup}>
                <View style={styles.badgeRow}>
                  <Text style={styles.previewCategory}>{selectedJob.category}</Text>
                  <View style={styles.workTypePill}>
                    <Text style={styles.workTypePillText}>
                      {getWorkTypeLabel(selectedJob.work_type)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.previewTitle} numberOfLines={1}>
                  {selectedJob.title}
                </Text>
                <Text style={styles.previewCompany} numberOfLines={1}>
                  {selectedJob.company_name}
                </Text>

                <View style={styles.previewMetricsRow}>
                  <Text style={styles.previewSalary}>
                    {formatSalary(selectedJob.salary_min, selectedJob.salary_max)}
                  </Text>
                  <Text style={styles.previewDistanceText}>
                    • Cách {calculateDistance(
                      baseOrigin.latitude,
                      baseOrigin.longitude,
                      selectedJob.latitude,
                      selectedJob.longitude
                    )}{' '}
                    km
                  </Text>
                </View>

                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {selectedJob.location}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.detailActionBtn}
              onPress={() =>
                navigation.navigate('JobDetail', {
                  jobId: selectedJob.id,
                  job: selectedJob,
                })
              }
              activeOpacity={0.85}
            >
              <Ionicons name="eye-outline" size={18} color={colors.textLight} style={{ marginRight: 6 }} />
              <Text style={styles.detailActionText}>Xem chi tiết công việc ➔</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topControlBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    zIndex: 10,
  },
  titleGroup: {
    marginBottom: 8,
  },
  headerTitle: {
    ...typography.styles.h2,
    color: colors.primaryDark,
  },
  headerSubtitle: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
  radiusPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radiusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  radiusPillActive: {
    backgroundColor: colors.primaryMain,
    borderColor: colors.primaryMain,
  },
  radiusPillText: {
    ...typography.styles.captionMedium,
    color: colors.textSecondary,
  },
  radiusPillTextActive: {
    color: colors.textLight,
    fontWeight: '600',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  calloutBubble: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    width: 190,
  },
  calloutTitle: {
    ...typography.styles.captionMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  calloutCompany: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
  calloutSalary: {
    ...typography.styles.captionMedium,
    color: colors.primaryMain,
    marginTop: 2,
    fontWeight: '600',
  },
  calloutDistance: {
    ...typography.styles.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  gpsButton: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: colors.surface,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 5,
  },
  bottomPreviewCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    elevation: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
  },
  closeCardBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 2,
    zIndex: 2,
  },
  previewCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  previewLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.surfaceVariant,
    marginRight: 12,
    marginTop: 2,
  },
  previewInfoGroup: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  previewCategory: {
    ...typography.styles.captionMedium,
    color: colors.primaryMain,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  workTypePill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  workTypePillText: {
    ...typography.styles.caption,
    fontSize: 10,
    color: colors.primaryDark,
  },
  previewTitle: {
    ...typography.styles.h3,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  previewCompany: {
    ...typography.styles.captionMedium,
    color: colors.textSecondary,
  },
  previewMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  previewSalary: {
    ...typography.styles.subtitle,
    color: colors.primaryMain,
    fontWeight: '700',
  },
  previewDistanceText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginLeft: 3,
  },
  detailActionBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primaryMain,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  detailActionText: {
    ...typography.styles.button,
    color: colors.textLight,
  },
});

export default MapViewScreen;
