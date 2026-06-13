import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { spotsData } from '@/data/spots';
import { facilities } from '@/data/service';
import { routeTypes, routeSpotsMap } from '@/data/itinerary';
import { getQueueLevelText, getQueueLevelColor } from '@/utils';
import { Spot } from '@/types';
import styles from './index.module.scss';

const MapPage: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState('default');
  const [activeFacility, setActiveFacility] = useState('all');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  const facilityTypes = [
    { id: 'all', name: '全部', icon: '📍' },
    { id: 'toilet', name: '厕所', icon: '🚻' },
    { id: 'restaurant', name: '餐饮', icon: '🍜' },
    { id: 'rest', name: '休息', icon: '🛋️' },
    { id: 'shop', name: '商店', icon: '🛍️' }
  ];

  const currentRoute = useMemo(
    () => routeSpotsMap.find(r => r.routeId === activeRoute) || routeSpotsMap[0],
    [activeRoute]
  );

  const routeSpots = useMemo(() => {
    return currentRoute.spotIds
      .map(id => spotsData.find(s => s.id === id))
      .filter((s): s is Spot => !!s);
  }, [currentRoute]);

  const handleRouteChange = (routeId: string) => {
    console.log('[Map] 切换路线:', routeId);
    setActiveRoute(routeId);
    setSelectedSpot(null);
  };

  const handleFacilityFilter = (type: string) => {
    console.log('[Map] 筛选设施:', type);
    setActiveFacility(type);
  };

  const handleSpotClick = (spot: Spot) => {
    console.log('[Map] 点击景点标记:', spot.name);
    setSelectedSpot(spot);
  };

  const handleClosePopup = () => {
    setSelectedSpot(null);
  };

  const handleViewDetail = (spot: Spot) => {
    console.log('[Map] 查看景点详情:', spot.name);
    Taro.navigateTo({
      url: `/pages/spot-detail/index?id=${spot.id}`
    }).catch(err => {
      console.error('[Map] 跳转详情失败:', err);
    });
  };

  const handleAudioGuide = (spot: Spot) => {
    console.log('[Map] 播放语音讲解:', spot.name);
    if (isPlayingAudio === spot.id) {
      setIsPlayingAudio(null);
      Taro.showToast({ title: '已暂停', icon: 'none' });
    } else {
      setIsPlayingAudio(spot.id);
      Taro.showToast({ title: '语音讲解播放中', icon: 'none' });
    }
  };

  const handleLocate = () => {
    console.log('[Map] 定位当前位置');
    Taro.showToast({ title: '已定位到当前位置', icon: 'none' });
  };

  const handleZoomIn = () => {
    console.log('[Map] 放大地图');
  };

  const handleZoomOut = () => {
    console.log('[Map] 缩小地图');
  };

  const getSpotPositionStyle = (spot: Spot) => {
    return {
      left: `${spot.position.x / 8}%`,
      top: `${spot.position.y / 7}%`
    };
  };

  const getFacilityPositionStyle = (facility: typeof facilities[0]) => {
    return {
      left: `${facility.position.x / 8}%`,
      top: `${facility.position.y / 7}%`
    };
  };

  const filteredFacilities = activeFacility === 'all'
    ? facilities
    : facilities.filter(f => f.type === activeFacility);

  const getRouteLinePath = () => {
    if (routeSpots.length < 2) return '';
    const points = routeSpots.map(spot => {
      const x = spot.position.x / 8;
      const y = spot.position.y / 7;
      return `${x}% ${y}%`;
    });
    return `linear-gradient(135deg, ${currentRoute.color}, ${currentRoute.color}88)`;
  };

  return (
    <View className={styles.mapPage}>
      <View className={styles.mapContainer}>
        <View className={styles.routeHeader}>
          <View className={styles.routeHeaderLeft}>
            <Text className={styles.routeHeaderName}>{currentRoute.name}</Text>
            <Text className={styles.routeHeaderDesc}>{currentRoute.description}</Text>
          </View>
          <View className={styles.routeHeaderStats}>
            <View className={styles.routeStatItem}>
              <Text className={styles.routeStatValue}>{routeSpots.length}</Text>
              <Text className={styles.routeStatLabel}>景点</Text>
            </View>
            <View className={styles.routeStatItem}>
              <Text className={styles.routeStatValue}>{currentRoute.estimatedTime}</Text>
              <Text className={styles.routeStatLabel}>时长</Text>
            </View>
            <View className={styles.routeStatItem}>
              <Text className={styles.routeStatValue}>{currentRoute.distance}</Text>
              <Text className={styles.routeStatLabel}>距离</Text>
            </View>
          </View>
        </View>

        <View className={styles.mapContent}>
          {routeSpots.length >= 2 && (
            <View
              className={styles.routeLineOverlay}
              style={{
                background: getRouteLinePath(),
                opacity: 0.3
              }}
            />
          )}

          {routeSpots.map((spot, index) => (
            <View
              key={spot.id}
              className={classnames(styles.spotMarker, {
                [styles.selected]: selectedSpot?.id === spot.id
              })}
              style={{
                ...getSpotPositionStyle(spot),
                backgroundColor: currentRoute.color,
                borderColor: currentRoute.color
              }}
              onClick={() => handleSpotClick(spot)}
            >
              <View className={styles.markerIndex}>{index + 1}</View>
              <View className={styles.markerLabel}>{spot.name}</View>
            </View>
          ))}

          {filteredFacilities.map(facility => (
            <View
              key={facility.id}
              className={styles.facilityMarker}
              style={getFacilityPositionStyle(facility)}
            >
              <Text>
                {facilityTypes.find(f => f.id === facility.type)?.icon || '📍'}
              </Text>
            </View>
          ))}

          <View className={styles.currentLocation} style={{ left: '45%', top: '50%' }}>
            <View className={styles.locationDot}>
              <View className={styles.locationInner} />
            </View>
          </View>

          <View className={styles.floatingButtons}>
            <View className={styles.floatBtn} onClick={handleLocate}>
              <Text>📍</Text>
            </View>
            <View className={styles.floatBtn} onClick={handleZoomIn}>
              <Text>➕</Text>
            </View>
            <View className={styles.floatBtn} onClick={handleZoomOut}>
              <Text>➖</Text>
            </View>
          </View>
        </View>

        {selectedSpot && (
          <View className={styles.spotPopup}>
            <View className={styles.popupHeader}>
              <Text className={styles.popupTitle}>{selectedSpot.name}</Text>
              <Text className={styles.popupClose} onClick={handleClosePopup}>✕</Text>
            </View>
            <View className={styles.popupInfo}>
              <Text className={styles.popupInfoItem}>⭐ {selectedSpot.rating}</Text>
              <Text className={styles.popupInfoItem}>
                <Text style={{ color: getQueueLevelColor(selectedSpot.queueLevel) }}>
                  ● {getQueueLevelText(selectedSpot.queueLevel)}
                </Text>
              </Text>
              <Text className={styles.popupInfoItem}>🕐 {selectedSpot.duration}</Text>
            </View>
            <View className={styles.popupActions}>
              <View
                className={classnames(styles.popupBtn, styles.popupBtnSecondary)}
                onClick={() => handleAudioGuide(selectedSpot)}
              >
                <Text>{isPlayingAudio === selectedSpot.id ? '⏸ 暂停讲解' : '🎧 语音讲解'}</Text>
              </View>
              <View
                className={classnames(styles.popupBtn, styles.popupBtnPrimary)}
                onClick={() => handleViewDetail(selectedSpot)}
              >
                <Text>查看详情</Text>
              </View>
            </View>
          </View>
        )}

        <View className={styles.bottomPanel}>
          <View className={styles.routeTabs}>
            {routeTypes.map(route => (
              <View
                key={route.id}
                className={classnames(styles.routeTab, {
                  [styles.active]: activeRoute === route.id
                })}
                style={activeRoute === route.id ? {
                  backgroundColor: (routeSpotsMap.find(r => r.routeId === route.id)?.color || '#2563eb') + '15',
                  color: routeSpotsMap.find(r => r.routeId === route.id)?.color || '#2563eb',
                  borderColor: routeSpotsMap.find(r => r.routeId === route.id)?.color || '#2563eb'
                } : {}}
                onClick={() => handleRouteChange(route.id)}
              >
                <Text>{route.name}</Text>
              </View>
            ))}
          </View>

          <View className={styles.facilityFilter}>
            {facilityTypes.map(item => (
              <View
                key={item.id}
                className={classnames(styles.facilityItem, {
                  [styles.active]: activeFacility === item.id
                })}
                onClick={() => handleFacilityFilter(item.id)}
              >
                <Text className={styles.facilityIcon}>{item.icon}</Text>
                <Text className={styles.facilityName}>{item.name}</Text>
              </View>
            ))}
          </View>

          <View className={styles.routeSpotsList}>
            <Text className={styles.routeSpotsTitle}>
              路线景点（{routeSpots.length}个）
            </Text>
            <View className={styles.routeSpotsScroll}>
              {routeSpots.map((spot, index) => (
                <View
                  key={spot.id}
                  className={classnames(styles.routeSpotItem, {
                    [styles.selected]: selectedSpot?.id === spot.id
                  })}
                  onClick={() => handleSpotClick(spot)}
                >
                  <View
                    className={styles.routeSpotIndex}
                    style={{ backgroundColor: currentRoute.color }}
                  >
                    <Text>{index + 1}</Text>
                  </View>
                  <View className={styles.routeSpotInfo}>
                    <Text className={styles.routeSpotName}>{spot.name}</Text>
                    <Text className={styles.routeSpotDesc}>
                      ⭐{spot.rating} · {spot.duration}
                    </Text>
                  </View>
                  <View className={styles.routeSpotActions}>
                    <View
                      className={styles.routeSpotAction}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAudioGuide(spot);
                      }}
                    >
                      <Text>{isPlayingAudio === spot.id ? '⏸' : '🎧'}</Text>
                    </View>
                    <View
                      className={styles.routeSpotAction}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(spot);
                      }}
                    >
                      <Text>›</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MapPage;
