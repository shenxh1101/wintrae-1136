import React, { useState } from 'react';
import { View, Text, Image, Swiper, SwiperItem, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SpotCard from '@/components/SpotCard';
import { spotsData } from '@/data/spots';
import { getQueueLevelText, getQueueLevelColor } from '@/utils';
import { Spot } from '@/types';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [banners] = useState([
    { id: '1', image: 'https://picsum.photos/id/1015/750/400', title: '欢迎来到智慧景区' },
    { id: '2', image: 'https://picsum.photos/id/1018/750/400', title: '春季赏花节开幕' },
    { id: '3', image: 'https://picsum.photos/id/1036/750/400', title: '限时门票优惠' }
  ]);

  const functionList = [
    { id: '1', name: '地图导览', icon: '🗺️', color: '#60a5fa', path: '/pages/map/index' },
    { id: '2', name: '门票预约', icon: '🎫', color: '#34d399', path: '/pages/ticket/index' },
    { id: '3', name: '行程清单', icon: '📋', color: '#fbbf24', path: '/pages/itinerary/index' },
    { id: '4', name: '服务求助', icon: '💁', color: '#f87171', path: '/pages/service-help/index' },
    { id: '5', name: '景点介绍', icon: '🏞️', color: '#a78bfa', path: '/pages/spot-detail/index' },
    { id: '6', name: '语音讲解', icon: '🎧', color: '#fb923c', path: '/pages/spot-detail/index' },
    { id: '7', name: '电子发票', icon: '🧾', color: '#38bdf8', path: '/pages/invoice/index' },
    { id: '8', name: '评价打分', icon: '⭐', color: '#f472b6', path: '/pages/review/index' }
  ];

  const hotSpots = spotsData.slice(0, 4);

  const handleFunctionClick = (item: typeof functionList[0]) => {
    console.log('[Home] 点击功能入口:', item.name);
    Taro.navigateTo({
      url: item.path
    }).catch(err => {
      console.error('[Home] 跳转失败:', err);
    });
  };

  const handleSpotClick = (spot: Spot) => {
    console.log('[Home] 点击景点:', spot.name);
    Taro.navigateTo({
      url: `/pages/spot-detail/index?id=${spot.id}`
    }).catch(err => {
      console.error('[Home] 跳转景点详情失败:', err);
    });
  };

  const handleSearchClick = () => {
    console.log('[Home] 点击搜索');
    Taro.showToast({ title: '搜索功能开发中', icon: 'none' });
  };

  return (
    <View className={styles.homePage}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>智慧旅游</Text>
        <Text className={styles.headerSubtitle}>探索美好旅程，一站式服务</Text>
        <View className={styles.searchBar} onClick={handleSearchClick}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Text className={styles.searchText}>搜索景点、服务...</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.bannerSection}>
          <Swiper
            className={styles.banner}
            indicatorDots
            autoplay
            circular
            indicatorColor="rgba(255,255,255,0.5)"
            indicatorActiveColor="#ffffff"
          >
            {banners.map(banner => (
              <SwiperItem key={banner.id}>
                <View className={styles.bannerItem}>
                  <Image
                    className={styles.bannerImage}
                    src={banner.image}
                    mode="aspectFill"
                  />
                </View>
              </SwiperItem>
            ))}
          </Swiper>
        </View>

        <View className={styles.functionSection}>
          <View className={styles.functionGrid}>
            {functionList.map(item => (
              <View
                key={item.id}
                className={styles.functionItem}
                onClick={() => handleFunctionClick(item)}
              >
                <View
                  className={styles.functionIcon}
                  style={{ backgroundColor: item.color + '20' }}
                >
                  <Text>{item.icon}</Text>
                </View>
                <Text className={styles.functionName}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.hotSpotsSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>热门景点</Text>
            <Text className={styles.sectionMore}>查看更多 ›</Text>
          </View>
          <View className={styles.spotList}>
            {hotSpots.map(spot => (
              <SpotCard
                key={spot.id}
                spot={spot}
                showQueue
                onClick={() => handleSpotClick(spot)}
              />
            ))}
          </View>
        </View>

        <View className={styles.queueSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>排队热度</Text>
            <Text className={styles.sectionMore}>实时更新</Text>
          </View>
          <View className={styles.queueList}>
            {spotsData.slice(0, 5).map(spot => (
              <View key={spot.id} className={styles.queueItem}>
                <View className={styles.queueSpotInfo}>
                  <Text className={styles.queueSpotName}>{spot.name}</Text>
                  <Text className={styles.queueTime}>预计等待 {spot.queueTime} 分钟</Text>
                </View>
                <View className={styles.queueLevel}>
                  <Text
                    className={styles.queueLevelText}
                    style={{ color: getQueueLevelColor(spot.queueLevel) }}
                  >
                    {getQueueLevelText(spot.queueLevel)}
                  </Text>
                  <Text className={styles.queueWaitTime}>{spot.queueTime}分钟</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomePage;
