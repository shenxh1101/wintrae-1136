import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import Tag from '../Tag';
import { Spot } from '@/types';
import { getQueueLevelText, getQueueLevelColor } from '@/utils';
import styles from './index.module.scss';

interface SpotCardProps {
  spot: Spot;
  onClick?: () => void;
  showQueue?: boolean;
  className?: string;
}

const SpotCard: React.FC<SpotCardProps> = ({ spot, onClick, showQueue = false, className }) => {
  return (
    <View
      className={classnames(styles.spotCard, className)}
      onClick={onClick}
    >
      <Image
        className={styles.spotImage}
        src={spot.image}
        mode="aspectFill"
      />
      <View className={styles.spotInfo}>
        <View className={styles.spotHeader}>
          <Text className={styles.spotName}>{spot.name}</Text>
          {showQueue && (
            <View
              className={styles.queueBadge}
              style={{ backgroundColor: getQueueLevelColor(spot.queueLevel) + '20' }}
            >
              <Text
                className={styles.queueText}
                style={{ color: getQueueLevelColor(spot.queueLevel) }}
              >
                {getQueueLevelText(spot.queueLevel)}
              </Text>
            </View>
          )}
        </View>
        <View className={styles.spotMeta}>
          <Text className={styles.rating}>⭐ {spot.rating}</Text>
          <Text className={styles.reviewCount}>{spot.reviewCount}条评价</Text>
        </View>
        <View className={styles.tags}>
          {spot.tags.slice(0, 3).map(tag => (
            <Tag key={tag} text={tag} type="primary" size="small" />
          ))}
        </View>
        <View className={styles.spotFooter}>
          <Text className={styles.duration}>🕐 {spot.duration}</Text>
          <Text className={styles.address}>📍 {spot.address}</Text>
        </View>
      </View>
    </View>
  );
};

export default SpotCard;
