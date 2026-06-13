import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { spotsData } from '@/data/spots';
import { reviewList } from '@/data/service';
import styles from './index.module.scss';

const ReviewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [subRatings, setSubRatings] = useState({
    environment: 5,
    service: 5,
    value: 5
  });

  const tabs = ['写评价', '我的评价'];

  const quickTags = [
    '风景优美', '服务周到', '价格实惠', '交通便利',
    '人太多', '排队久', '值得一去', '推荐亲子'
  ];

  const currentSpot = spotsData[0];

  const handleTabChange = (index: number) => {
    console.log('[Review] 切换Tab:', tabs[index]);
    setActiveTab(index);
  };

  const handleRatingClick = (star: number) => {
    console.log('[Review] 评分:', star);
    setRating(star);
  };

  const handleSubRatingClick = (key: keyof typeof subRatings, value: number) => {
    console.log('[Review] 分项评分:', key, value);
    setSubRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleTagToggle = (tag: string) => {
    console.log('[Review] 切换标签:', tag);
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddImage = () => {
    console.log('[Review] 添加图片');
    Taro.showToast({ title: '图片上传功能开发中', icon: 'none' });
  };

  const handleAnonymousToggle = () => {
    console.log('[Review] 切换匿名:', !isAnonymous);
    setIsAnonymous(!isAnonymous);
  };

  const handleSubmit = () => {
    console.log('[Review] 提交评价');
    if (!content.trim()) {
      Taro.showToast({ title: '请输入评价内容', icon: 'none' });
      return;
    }
    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '评价成功', icon: 'success' });
      setActiveTab(1);
    }, 1000);
  };

  const renderStars = (count: number, size: 'small' | 'large' = 'large') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text
          key={i}
          className={size === 'large' ? styles.star : ''}
          style={size === 'small' ? { fontSize: '24rpx' } : {}}
          onClick={size === 'large' ? () => handleRatingClick(i) : undefined}
        >
          {i <= count ? '⭐' : '☆'}
        </Text>
      );
    }
    return stars;
  };

  const renderReviewForm = () => (
    <ScrollView scrollY>
      <View className={styles.spotInfo}>
        <Image
          className={styles.spotImage}
          src={currentSpot.image}
          mode="aspectFill"
        />
        <View className={styles.spotDetail}>
          <Text className={styles.spotName}>{currentSpot.name}</Text>
          <Text className={styles.spotDesc}>{currentSpot.duration} · {currentSpot.address}</Text>
        </View>
      </View>

      <View className={styles.ratingSection}>
        <Text className={styles.ratingTitle}>总体评分</Text>
        <View className={styles.stars}>
          {renderStars(rating)}
        </View>
        <Text className={styles.ratingText}>{rating} 分</Text>

        <View className={styles.subRatings}>
          <View className={styles.subRatingItem}>
            <Text className={styles.subRatingLabel}>环境</Text>
            <View
              className={styles.subRatingStars}
              onClick={() => handleSubRatingClick('environment', subRatings.environment === 5 ? 4 : 5)}
            >
              {renderStars(subRatings.environment, 'small')}
            </View>
          </View>
          <View className={styles.subRatingItem}>
            <Text className={styles.subRatingLabel}>服务</Text>
            <View
              className={styles.subRatingStars}
              onClick={() => handleSubRatingClick('service', subRatings.service === 5 ? 4 : 5)}
            >
              {renderStars(subRatings.service, 'small')}
            </View>
          </View>
          <View className={styles.subRatingItem}>
            <Text className={styles.subRatingLabel}>性价比</Text>
            <View
              className={styles.subRatingStars}
              onClick={() => handleSubRatingClick('value', subRatings.value === 5 ? 4 : 5)}
            >
              {renderStars(subRatings.value, 'small')}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.contentSection}>
        <Text className={styles.sectionTitle}>评价内容</Text>
        <View className={styles.textarea}>
          <Text className={content ? '' : styles.textareaPlaceholder}>
            {content || '分享您的游玩体验，帮助其他游客...'}
          </Text>
        </View>
        <Text className={styles.textareaCount}>{content.length}/500</Text>
      </View>

      <View className={styles.tagSection}>
        <Text className={styles.sectionTitle}>快捷标签</Text>
        <View className={styles.tags}>
          {quickTags.map(tag => (
            <View
              key={tag}
              className={classnames(styles.tagItem, {
                [styles.active]: selectedTags.includes(tag)
              })}
              onClick={() => handleTagToggle(tag)}
            >
              <Text>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.imageSection}>
        <Text className={styles.sectionTitle}>上传图片</Text>
        <View className={styles.imageList}>
          <View className={styles.addImage} onClick={handleAddImage}>
            <Text className={styles.addIcon}>+</Text>
            <Text>添加图片</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderReviewList = () => (
    <ScrollView scrollY className={styles.reviewList}>
      {reviewList.length > 0 ? reviewList.map(review => (
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
        <View style={{ textAlign: 'center', padding: '120rpx 0' }}>
          <Text style={{ fontSize: '80rpx', opacity: 0.5 }}>📝</Text>
          <Text style={{ fontSize: '28rpx', color: '#86909c', marginTop: '16rpx' }}>
            暂无评价记录
          </Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <View className={styles.reviewPage}>
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

      {activeTab === 0 && renderReviewForm()}
      {activeTab === 1 && renderReviewList()}

      {activeTab === 0 && (
        <View className={styles.bottomBar}>
          <View className={styles.anonymous} onClick={handleAnonymousToggle}>
            <View
              className={classnames(styles.anonymousCheck, {
                [styles.active]: isAnonymous
              })}
            >
              {isAnonymous && <Text>✓</Text>}
            </View>
            <Text>匿名评价</Text>
          </View>
          <View className={styles.submitButton} onClick={handleSubmit}>
            <Text>提交评价</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ReviewPage;
