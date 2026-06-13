import React, { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/app-store';
import { getSpotById } from '@/data/spots';
import { reviewList } from '@/data/service';
import { Spot } from '@/types';
import styles from './index.module.scss';

const SpotDetailPage: React.FC = () => {
  const router = useRouter();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const spotId = router.params.id as string;
  const isFavorite = useAppStore(state => state.isFavorite(spotId));
  const toggleFavorite = useAppStore(state => state.toggleFavorite);

  useEffect(() => {
    const id = router.params.id as string;
    console.log('[SpotDetail] 景点ID:', id);
    if (id) {
      const spotData = getSpotById(id);
      if (spotData) {
        setSpot(spotData);
      }
    }
  }, [router.params.id]);

  const handleFavorite = () => {
    if (!spotId) return;
    console.log('[SpotDetail] 切换收藏状态:', !isFavorite);
    toggleFavorite(spotId);
    Taro.showToast({
      title: isFavorite ? '已取消收藏' : '已加入收藏',
      icon: 'success'
    });
  };

  const handlePlayAudio = () => {
    console.log('[SpotDetail] 播放语音讲解');
    setIsPlaying(!isPlaying);
    Taro.showToast({
      title: isPlaying ? '已暂停' : '开始播放',
      icon: 'none'
    });
  };

  const handleBookTicket = () => {
    console.log('[SpotDetail] 预约门票');
    Taro.navigateTo({
      url: '/pages/ticket/index'
    }).catch(err => {
      console.error('[SpotDetail] 跳转门票页失败:', err);
    });
  };

  const handleWriteReview = () => {
    console.log('[SpotDetail] 写评价');
    Taro.navigateTo({
      url: '/pages/review/index'
    }).catch(err => {
      console.error('[SpotDetail] 跳转评价页失败:', err);
    });
  };

  const spotReviews = reviewList.filter(r => r.spotId === router.params.id);

  if (!spot) {
    return (
      <View className={styles.spotDetailPage}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View className={styles.spotDetailPage}>
      <View className={styles.banner}>
        <Image
          className={styles.bannerImage}
          src={spot.image}
          mode="aspectFill"
        />
        <View className={styles.bannerOverlay}>
          <Text className={styles.spotName}>{spot.name}</Text>
          <View className={styles.spotTags}>
            {spot.tags.map(tag => (
              <Text key={tag} className={styles.spotTag}>{tag}</Text>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.infoSection}>
        <View className={styles.ratingRow}>
          <View className={styles.ratingInfo}>
            <Text className={styles.ratingScore}>{spot.rating}</Text>
            <Text className={styles.ratingStars}>⭐⭐⭐⭐⭐</Text>
            <Text className={styles.ratingCount}>{spot.reviewCount}条评价</Text>
          </View>
          <View
            className={classnames(styles.favoriteBtn, { [styles.active]: isFavorite })}
            onClick={handleFavorite}
          >
            <Text>{isFavorite ? '❤️ 已收藏' : '🤍 收藏'}</Text>
          </View>
        </View>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>开放时间</Text>
            <Text className={styles.infoValue}>{spot.openTime} - {spot.closeTime}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>建议游玩</Text>
            <Text className={styles.infoValue}>{spot.duration}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>景点地址</Text>
            <Text className={styles.infoValue}>{spot.address}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>排队情况</Text>
            <Text className={styles.infoValue}>预计等待 {spot.queueTime} 分钟</Text>
          </View>
        </View>
      </View>

      {spot.hasAudio && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🎧</Text>
            语音讲解
          </Text>
          <View className={styles.audioPlayer}>
            <View className={styles.audioPlayBtn} onClick={handlePlayAudio}>
              <Text>{isPlaying ? '⏸' : '▶'}</Text>
            </View>
            <View className={styles.audioInfo}>
              <Text className={styles.audioTitle}>{spot.name} - 景点讲解</Text>
              <View className={styles.audioProgress}>
                <View className={styles.audioProgressBar} />
              </View>
              <Text className={styles.audioTime}>01:23 / 05:30</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📖</Text>
          景点介绍
        </Text>
        <Text className={styles.description}>{spot.description}</Text>
      </View>

      <View className={styles.section}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24rpx' }}>
          <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>
            <Text className={styles.sectionIcon}>💬</Text>
            用户评价
          </Text>
          <Text style={{ fontSize: '24rpx', color: '#86909c' }} onClick={handleWriteReview}>
            写评价 ›</Text>
        </View>
        <View className={styles.reviewList}>
          {spotReviews.length > 0 ? spotReviews.map(review => (
            <View key={review.id} className={styles.reviewItem}>
              <View className={styles.reviewHeader}>
                <View className={styles.reviewerAvatar}>
                  <Text>👤</Text>
                </View>
                <View className={styles.reviewerInfo}>
                  <Text className={styles.reviewerName}>{review.userName}</Text>
                  <Text className={styles.reviewRating}>
                    {'⭐'.repeat(review.rating)}
                  </Text>
                </View>
              </View>
              <Text className={styles.reviewContent}>{review.content}</Text>
              <Text className={styles.reviewTime}>{review.createTime}</Text>
            </View>
          )) : (
            <Text style={{ fontSize: '28rpx', color: '#86909c', textAlign: 'center', padding: '40rpx 0' }}>
              暂无评价，快来抢沙发吧~
            </Text>
          )}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.bottomActions}>
          <View className={styles.bottomAction} onClick={handleFavorite}>
            <Text className={styles.bottomActionIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
            <Text className={styles.bottomActionText}>收藏</Text>
          </View>
          <View className={styles.bottomAction} onClick={handleWriteReview}>
            <Text className={styles.bottomActionIcon}>💬</Text>
            <Text className={styles.bottomActionText}>评价</Text>
          </View>
        </View>
        <View className={styles.bookButton} onClick={handleBookTicket}>
          <Text>立即预约</Text>
        </View>
      </View>
    </View>
  );
};

export default SpotDetailPage;
