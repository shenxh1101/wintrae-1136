import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/app-store';
import { spotsData } from '@/data/spots';
import { Review, Spot } from '@/types';
import { formatTime, generateRandomId } from '@/utils';
import styles from './index.module.scss';

const ReviewPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [showSpotPicker, setShowSpotPicker] = useState(false);
  const [subRatings, setSubRatings] = useState({
    environment: 5,
    service: 5,
    value: 5
  });

  const reviewList = useAppStore(state => state.reviewList);
  const addReview = useAppStore(state => state.addReview);
  const markOrderReviewed = useAppStore(state => state.markOrderReviewed);
  const ticketOrders = useAppStore(state => state.ticketOrders);

  const tabs = ['写评价', '我的评价'];

  const quickTags = [
    '风景优美', '服务周到', '价格实惠', '交通便利',
    '人太多', '排队久', '值得一去', '推荐亲子'
  ];

  const usedOrders = ticketOrders.filter(o => o.status === 'used');
  const reviewedOrderIds = new Set(reviewList.filter(r => r.orderId).map(r => r.orderId));
  const unreviewedOrders = usedOrders.filter(o => !reviewedOrderIds.has(o.id));

  useEffect(() => {
    const spotId = router.params.spotId as string;
    const orderId = router.params.orderId as string;
    if (spotId) setSelectedSpotId(spotId);
    if (orderId) setSelectedOrderId(orderId);
  }, [router.params]);

  const currentSpot: Spot | undefined = selectedSpotId
    ? spotsData.find(s => s.id === selectedSpotId)
    : spotsData[0];

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  const handleRatingClick = (star: number) => {
    setRating(star);
  };

  const handleSubRatingClick = (key: keyof typeof subRatings, value: number) => {
    setSubRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSpotSelect = (spotId: string) => {
    setSelectedSpotId(spotId);
    setSelectedOrderId('');
    setShowSpotPicker(false);
  };

  const handleOrderSelect = (orderId: string) => {
    const order = ticketOrders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrderId(orderId);
      if (order.spotId) setSelectedSpotId(order.spotId);
    }
    setShowSpotPicker(false);
  };

  const handleAddImage = () => {
    Taro.showToast({ title: '图片上传功能开发中', icon: 'none' });
  };

  const handleAnonymousToggle = () => {
    setIsAnonymous(!isAnonymous);
  };

  const validateForm = (): boolean => {
    if (rating === 0) {
      Taro.showToast({ title: '请选择评分', icon: 'none' });
      return false;
    }
    if (!reviewTitle.trim()) {
      Taro.showToast({ title: '请输入评价标题', icon: 'none' });
      return false;
    }
    if (reviewTitle.trim().length < 2) {
      Taro.showToast({ title: '标题至少2个字符', icon: 'none' });
      return false;
    }
    if (!content.trim()) {
      Taro.showToast({ title: '请输入评价内容', icon: 'none' });
      return false;
    }
    if (content.trim().length < 5) {
      Taro.showToast({ title: '评价至少5个字符', icon: 'none' });
      return false;
    }
    if (!contact.trim()) {
      Taro.showToast({ title: '请输入联系方式', icon: 'none' });
      return false;
    }
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(contact.trim())) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return false;
    }
    if (email.trim()) {
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailReg.test(email.trim())) {
        Taro.showToast({ title: '请输入正确的邮箱', icon: 'none' });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setSubmitting(true);
    Taro.showLoading({ title: '提交中...' });

    setTimeout(() => {
      const newReview: Review = {
        id: generateRandomId(),
        spotId: currentSpot?.id || '',
        spotName: currentSpot?.name || '',
        userName: isAnonymous ? '匿名用户' : '游客',
        userAvatar: '',
        rating,
        subRatings,
        title: reviewTitle.trim(),
        content: content.trim(),
        images: [],
        tags: [...selectedTags],
        contact: contact.trim(),
        email: email.trim(),
        orderId: selectedOrderId || undefined,
        isAnonymous,
        createTime: formatTime(new Date())
      };

      addReview(newReview);

      if (selectedOrderId) {
        markOrderReviewed(selectedOrderId);
      }

      Taro.hideLoading();
      Taro.showToast({ title: '评价成功', icon: 'success' });

      setReviewTitle('');
      setContent('');
      setContact('');
      setEmail('');
      setRating(5);
      setSelectedTags([]);
      setSubRatings({ environment: 5, service: 5, value: 5 });
      setSelectedOrderId('');
      setActiveTab(1);
      setSubmitting(false);
    }, 800);
  };

  const renderStars = (count: number, size: 'small' | 'large' = 'large', interactive: boolean = true) => {
    const stars: React.ReactNode[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text
          key={i}
          className={size === 'large' ? styles.star : ''}
          style={size === 'small' ? { fontSize: '24rpx' } : {}}
          onClick={interactive && size === 'large' ? () => handleRatingClick(i) : undefined}
        >
          {i <= count ? '⭐' : '☆'}
        </Text>
      );
    }
    return stars;
  };

  const renderSpotPicker = () => {
    if (!showSpotPicker) return null;
    return (
      <View className={styles.spotPicker}>
        <View className={styles.pickerSection}>
          <Text className={styles.pickerTitle}>按景点选择</Text>
          <View className={styles.pickerList}>
            {spotsData.map(spot => (
              <View
                key={spot.id}
                className={classnames(styles.pickerItem, { [styles.active]: selectedSpotId === spot.id && !selectedOrderId })}
                onClick={() => handleSpotSelect(spot.id)}
              >
                <Image className={styles.pickerImage} src={spot.image} mode="aspectFill" />
                <Text className={styles.pickerName}>{spot.name}</Text>
              </View>
            ))}
          </View>
        </View>
        {unreviewedOrders.length > 0 && (
          <View className={styles.pickerSection}>
            <Text className={styles.pickerTitle}>按订单评价</Text>
            <View className={styles.pickerList}>
              {unreviewedOrders.map(order => (
                <View
                  key={order.id}
                  className={classnames(styles.pickerItem, { [styles.active]: selectedOrderId === order.id })}
                  onClick={() => handleOrderSelect(order.id)}
                >
                  <View className={styles.pickerOrderInfo}>
                    <Text className={styles.pickerOrderName}>{order.ticketName}</Text>
                    <Text className={styles.pickerOrderMeta}>{order.date} {order.timeSlot}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderReviewForm = () => (
    <ScrollView scrollY className={styles.formScroll}>
      <View className={styles.spotInfo} onClick={() => setShowSpotPicker(!showSpotPicker)}>
        <Image
          className={styles.spotImage}
          src={currentSpot?.image || 'https://picsum.photos/id/1015/200/200'}
          mode="aspectFill"
        />
        <View className={styles.spotDetail}>
          <Text className={styles.spotName}>{currentSpot?.name || '请选择景点'}</Text>
          <Text className={styles.spotDesc}>
            {selectedOrderId
              ? `订单评价 · ${ticketOrders.find(o => o.id === selectedOrderId)?.ticketName || ''}`
              : `${currentSpot?.duration || ''} · ${currentSpot?.address || ''}`
            }
          </Text>
        </View>
        <Text className={styles.spotPickerArrow}>▼</Text>
      </View>

      {renderSpotPicker()}

      <View className={styles.ratingSection}>
        <Text className={styles.ratingTitle}>总体评分</Text>
        <View className={styles.stars}>
          {renderStars(rating)}
        </View>
        <Text className={styles.ratingText}>{rating} 分</Text>

        <View className={styles.subRatings}>
          <View className={styles.subRatingItem}>
            <Text className={styles.subRatingLabel}>环境</Text>
            <View className={styles.subRatingStars}>
              {[1, 2, 3, 4, 5].map(v => (
                <Text
                  key={v}
                  style={{ fontSize: '24rpx' }}
                  onClick={() => handleSubRatingClick('environment', v)}
                >
                  {v <= subRatings.environment ? '⭐' : '☆'}
                </Text>
              ))}
            </View>
          </View>
          <View className={styles.subRatingItem}>
            <Text className={styles.subRatingLabel}>服务</Text>
            <View className={styles.subRatingStars}>
              {[1, 2, 3, 4, 5].map(v => (
                <Text
                  key={v}
                  style={{ fontSize: '24rpx' }}
                  onClick={() => handleSubRatingClick('service', v)}
                >
                  {v <= subRatings.service ? '⭐' : '☆'}
                </Text>
              ))}
            </View>
          </View>
          <View className={styles.subRatingItem}>
            <Text className={styles.subRatingLabel}>性价比</Text>
            <View className={styles.subRatingStars}>
              {[1, 2, 3, 4, 5].map(v => (
                <Text
                  key={v}
                  style={{ fontSize: '24rpx' }}
                  onClick={() => handleSubRatingClick('value', v)}
                >
                  {v <= subRatings.value ? '⭐' : '☆'}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.contentSection}>
        <Text className={styles.sectionTitle}>评价标题 <Text style={{ color: '#ef4444' }}>*</Text></Text>
        <Input
          className={styles.formInputReal}
          placeholder="请输入评价标题"
          placeholderClass={styles.textareaPlaceholder}
          value={reviewTitle}
          onInput={(e) => setReviewTitle(e.detail.value)}
          maxlength={30}
        />
      </View>

      <View className={styles.contentSection}>
        <Text className={styles.sectionTitle}>评价内容 <Text style={{ color: '#ef4444' }}>*</Text></Text>
        <Textarea
          className={styles.textareaReal}
          placeholder="分享您的游玩体验，帮助其他游客..."
          placeholderClass={styles.textareaPlaceholder}
          value={content}
          onInput={(e) => setContent(e.detail.value)}
          maxlength={500}
          autoHeight
        />
        <Text className={styles.textareaCount}>{content.length}/500</Text>
      </View>

      <View className={styles.tagSection}>
        <Text className={styles.sectionTitle}>快捷标签</Text>
        <View className={styles.tags}>
          {quickTags.map(tag => (
            <View
              key={tag}
              className={classnames(styles.tagItem, { [styles.active]: selectedTags.includes(tag) })}
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

      <View className={styles.contentSection}>
        <Text className={styles.sectionTitle}>联系方式 <Text style={{ color: '#ef4444' }}>*</Text></Text>
        <Input
          className={styles.formInputReal}
          type="number"
          placeholder="请输入手机号"
          placeholderClass={styles.textareaPlaceholder}
          value={contact}
          onInput={(e) => setContact(e.detail.value)}
          maxlength={11}
        />
      </View>

      <View className={styles.contentSection}>
        <Text className={styles.sectionTitle}>邮箱</Text>
        <Input
          className={styles.formInputReal}
          placeholder="请输入邮箱（可选）"
          placeholderClass={styles.textareaPlaceholder}
          value={email}
          onInput={(e) => setEmail(e.detail.value)}
          maxlength={50}
        />
      </View>

      <View style={{ height: '160rpx' }} />
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
              <Text className={styles.reviewerName}>{review.userName}{review.isAnonymous ? '(匿名)' : ''}</Text>
              <Text className={styles.reviewRating}>
                {'⭐'.repeat(review.rating)}
              </Text>
            </View>
          </View>
          {review.title && (
            <Text className={styles.reviewTitle}>{review.title}</Text>
          )}
          {review.tags && review.tags.length > 0 && (
            <View className={styles.reviewTags}>
              {review.tags.map(tag => (
                <Text key={tag} className={styles.reviewTag}>{tag}</Text>
              ))}
            </View>
          )}
          <Text className={styles.reviewContent}>{review.content}</Text>
          {review.spotName && (
            <Text className={styles.reviewSpot}>📍 {review.spotName}</Text>
          )}
          <Text className={styles.reviewTime}>{review.createTime}</Text>
        </View>
      )) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📝</Text>
          <Text className={styles.emptyText}>暂无评价记录</Text>
          <View
            className={styles.emptyAction}
            onClick={() => setActiveTab(0)}
          >
            <Text>去评价</Text>
          </View>
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
            className={classnames(styles.tabItem, { [styles.active]: activeTab === index })}
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
              className={classnames(styles.anonymousCheck, { [styles.active]: isAnonymous })}
            >
              {isAnonymous && <Text>✓</Text>}
            </View>
            <Text>匿名评价</Text>
          </View>
          <View
            className={classnames(styles.submitButton, { [styles.submitDisabled]: submitting })}
            onClick={!submitting ? handleSubmit : undefined}
          >
            <Text>{submitting ? '提交中...' : '提交评价'}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ReviewPage;
