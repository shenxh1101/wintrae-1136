import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { spotsData } from '@/data/spots';
import { facilities } from '@/data/service';
import { routeTypes } from '@/data/itinerary';
import { getQueueLevelText, getQueueLevelColor } from '@/utils';
import { Spot } from '@/types';
import styles from './index.module.scss';

const MapPage: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState('default');
  const [activeFacility, setActiveFacility] = useState('all');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const facilityTypes = [
    { id: 'all', name: '全部', icon: '📍' },
    { id: 'toilet', name: '厕所', icon: '🚻' },
    { id: 'restaurant', name: '餐饮', icon: '🍜' },
    { id: 'rest', name: '休息', icon: '🛋️' },
    { id: 'shop', name: '商店', icon: '🛍️' }
  ];

  const handleRouteChange = (routeId: string) => {
    console.log('[Map] 切换路线:', routeId);
    setActiveRoute(routeId);
    Taro.showToast({
      title: `已切换至${routeTypes.find(r => r.id === routeId)?.name}`,
      icon: 'none'
    });
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

  const handleViewDetail = () => {
    if (selectedSpot) {
      console.log('[Map] 查看景点详情:', selectedSpot.name);
      Taro.navigateTo({
        url: `/pages/spot-detail/index?id=${selectedSpot.id}`
      }).catch(err => {
        console.error('[Map] 跳转详情失败:', err);
      });
    }
  };

  const handleAudioGuide = () => {
    console.log('[Map] 播放语音讲解');
    Taro.showToast({ title: '语音讲解播放中', icon: 'none' });
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

  return (
    <View className={styles.mapPage}>
      <View className={styles.mapContainer}>
        <View className={styles.mapContent}>
          {spotsData.map(spot => (
            <View
              key={spot.id}
              className={styles.spotMarker}
              style={getSpotPositionStyle(spot)}
              onClick={() => handleSpotClick(spot)}
            >
              <View className={styles.markerDot} />
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
                onClick={handleAudioGuide}
              >
                <Text>🎧 语音讲解</Text>
              </View>
              <View
                className={classnames(styles.popupBtn, styles.popupBtnPrimary)}
                onClick={handleViewDetail}
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
        </View>
      </View>
    </View>
  );
};

export default MapPage;
