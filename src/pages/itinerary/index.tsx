import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { recommendedItineraries } from '@/data/itinerary';
import { getFavoriteSpots } from '@/data/spots';
import { Itinerary } from '@/types';
import styles from './index.module.scss';

const ItineraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ['推荐路线', '我的收藏', '行程规划'];

  const favoriteSpots = getFavoriteSpots();

  const handleTabChange = (index: number) => {
    console.log('[Itinerary] 切换Tab:', tabs[index]);
    setActiveTab(index);
  };

  const handleItineraryClick = (itinerary: Itinerary) => {
    console.log('[Itinerary] 点击行程:', itinerary.title);
    Taro.showToast({ title: `查看${itinerary.title}详情`, icon: 'none' });
  };

  const handleUseItinerary = (itinerary: Itinerary) => {
    console.log('[Itinerary] 使用行程:', itinerary.title);
    Taro.showToast({ title: '已添加到行程', icon: 'success' });
  };

  const handleGenerate = () => {
    console.log('[Itinerary] 生成智能行程');
    Taro.showToast({ title: '正在为您规划行程...', icon: 'loading' });
    setTimeout(() => {
      Taro.showToast({ title: '行程生成成功', icon: 'success' });
    }, 1500);
  };

  const handleSpotClick = (spotId: string) => {
    console.log('[Itinerary] 点击收藏景点:', spotId);
    Taro.navigateTo({
      url: `/pages/spot-detail/index?id=${spotId}`
    }).catch(err => {
      console.error('[Itinerary] 跳转详情失败:', err);
    });
  };

  const renderRecommended = () => (
    <View className={styles.recommendedSection}>
      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>精选路线</Text>
        <Text className={styles.sectionMore}>更多 ›</Text>
      </View>
      {recommendedItineraries.map(itinerary => (
        <View
          key={itinerary.id}
          className={styles.itineraryCard}
          onClick={() => handleItineraryClick(itinerary)}
        >
          <View className={styles.cardHeader}>
            <Image
              className={styles.cardImage}
              src={itinerary.spots[0]?.image || 'https://picsum.photos/750/400'}
              mode="aspectFill"
            />
            <View className={styles.cardType}>
              {itinerary.type === 'half-day' ? '半日游' : '一日游'}
            </View>
            <View className={styles.cardOverlay}>
              <Text className={styles.cardTitle}>{itinerary.title}</Text>
              <View className={styles.cardInfo}>
                <Text className={styles.cardInfoItem}>📍 {itinerary.distance}</Text>
                <Text className={styles.cardInfoItem}>⏱️ {itinerary.totalDuration}</Text>
                <Text className={styles.cardInfoItem}>🎯 {itinerary.spots.length}个景点</Text>
              </View>
            </View>
          </View>
          <View className={styles.cardBody}>
            <Text className={styles.cardDescription}>{itinerary.description}</Text>
            <View className={styles.cardStats}>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{itinerary.spots.length}</Text>
                <Text className={styles.statLabel}>景点数量</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{itinerary.totalDuration}</Text>
                <Text className={styles.statLabel}>总时长</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{itinerary.distance}</Text>
                <Text className={styles.statLabel}>总距离</Text>
              </View>
            </View>
            <View
              className={styles.cardButton}
              onClick={(e) => {
                e.stopPropagation();
                handleUseItinerary(itinerary);
              }}
            >
              <Text>使用此路线</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderFavorites = () => (
    <View className={styles.favoritesSection}>
      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>我的收藏</Text>
        <Text className={styles.sectionMore}>{favoriteSpots.length}个景点</Text>
      </View>
      {favoriteSpots.length > 0 ? (
        <View className={styles.timeline}>
          {favoriteSpots.map((spot, index) => (
            <View key={spot.id} className={styles.timelineItem}>
              <View className={styles.timelineDot} />
              <View
                className={styles.timelineContent}
                onClick={() => handleSpotClick(spot.id)}
              >
                <Text className={styles.timelineTime}>景点 {index + 1}</Text>
                <Text className={styles.timelineTitle}>{spot.name}</Text>
                <Text className={styles.timelineDesc}>⭐ {spot.rating} · {spot.duration}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>❤️</Text>
          <Text className={styles.emptyText}>暂无收藏景点</Text>
        </View>
      )}
    </View>
  );

  const renderPlan = () => (
    <View>
      <View className={styles.generateSection}>
        <Text className={styles.generateIcon}>🤖</Text>
        <Text className={styles.generateTitle}>智能生成行程</Text>
        <Text className={styles.generateDesc}>根据您的偏好和时间，AI智能规划最佳路线</Text>
        <View className={styles.generateButton} onClick={handleGenerate}>
          <Text>立即生成</Text>
        </View>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>选择偏好</Text>
      </View>
      <View className={styles.generateSection}>
        <View className={styles.cardStats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>半日</Text>
            <Text className={styles.statLabel}>行程时长</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>亲子</Text>
            <Text className={styles.statLabel}>路线类型</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>轻松</Text>
            <Text className={styles.statLabel}>体力强度</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className={styles.itineraryPage}>
      <View className={styles.tabBar}>
        {tabs.map((tab, index) => (
          <View
            key={tab}
            className={classnames(styles.tabItem, {
              [styles.active]: activeTab === index
            })}
            onClick={() => handleTabChange(index)}
          >
            <Text>{tab}</Text>
          </View>
        ))}
      </View>

      <View className={styles.content}>
        {activeTab === 0 && renderRecommended()}
        {activeTab === 1 && renderFavorites()}
        {activeTab === 2 && renderPlan()}
      </View>
    </View>
  );
};

export default ItineraryPage;
