import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/app-store';
import styles from './index.module.scss';

const MSG_TYPE_ICON: Record<string, string> = {
  refund: '↩️',
  invoice: '🧾',
  review: '⭐',
  tour: '🗺️'
};

const MinePage: React.FC = () => {
  const [showMessages, setShowMessages] = useState(false);

  const favoriteSpotIds = useAppStore(state => state.favoriteSpotIds);
  const reviewList = useAppStore(state => state.reviewList);
  const ticketOrders = useAppStore(state => state.ticketOrders);
  const invoiceList = useAppStore(state => state.invoiceList);
  const messageList = useAppStore(state => state.messageList);
  const markMessageRead = useAppStore(state => state.markMessageRead);
  const markAllMessagesRead = useAppStore(state => state.markAllMessagesRead);
  const tourHistoryList = useAppStore(state => state.tourHistoryList);

  const pendingReviewCount = useMemo(() => {
    return ticketOrders.filter(o => o.status === 'used' && !o.hasReview).length;
  }, [ticketOrders]);

  const unreadCount = useMemo(() => {
    return messageList.filter(m => !m.read).length;
  }, [messageList]);

  const orderTypes = useMemo(() => {
    return [
      { id: 'pending', name: '待付款', icon: '💰', count: ticketOrders.filter(o => o.status === 'pending').length },
      { id: 'paid', name: '待使用', icon: '🎫', count: ticketOrders.filter(o => o.status === 'paid').length },
      { id: 'used', name: '已使用', icon: '✅', count: ticketOrders.filter(o => o.status === 'used').length },
      { id: 'refund', name: '退款/售后', icon: '↩️', count: ticketOrders.filter(o => o.status === 'refund' || o.status === 'cancelled').length }
    ];
  }, [ticketOrders]);

  const menuItems = useMemo(() => [
    { id: 'favorites', name: '我的收藏', icon: '❤️', path: '/pages/itinerary/index?tab=1', count: favoriteSpotIds.length },
    { id: 'tourHistory', name: '游览记录', icon: '�️', path: '', count: tourHistoryList.length },
    { id: 'coupon', name: '优惠券', icon: '🎟️', path: '' },
    { id: 'invoice', name: '电子发票', icon: '🧾', path: '/pages/invoice/index', count: invoiceList.length },
    { id: 'settings', name: '设置', icon: '⚙️', path: '' }
  ], [favoriteSpotIds.length, tourHistoryList.length, invoiceList.length]);

  const serviceItems = [
    { id: 'help', name: '服务求助', icon: '💁', color: '#f87171', path: '/pages/service-help/index' },
    { id: 'review', name: '评价打分', icon: '⭐', color: '#fbbf24', path: '/pages/review/index', badge: pendingReviewCount },
    { id: 'qa', name: '常见问题', icon: '❓', color: '#60a5fa', path: '' },
    { id: 'feedback', name: '意见反馈', icon: '📝', color: '#34d399', path: '' }
  ];

  const handleOrderClick = (type: string) => {
    Taro.navigateTo({
      url: `/pages/order-list/index?status=${type}`
    }).catch(err => console.error('[Mine] 跳转订单列表失败:', err));
  };

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.id === 'favorites') {
      Taro.switchTab({ url: '/pages/itinerary/index' }).catch(() => {});
    } else if (item.id === 'tourHistory') {
      Taro.navigateTo({ url: '/pages/map/index' }).catch(() => {});
    } else if (item.path) {
      Taro.navigateTo({ url: item.path }).catch(() => {});
    } else {
      Taro.showToast({ title: `${item.name}功能开发中`, icon: 'none' });
    }
  };

  const handleServiceClick = (item: typeof serviceItems[0]) => {
    if (item.path) {
      Taro.navigateTo({ url: item.path }).catch(() => {});
    } else {
      Taro.showToast({ title: `${item.name}功能开发中`, icon: 'none' });
    }
  };

  const handleEditProfile = () => {
    Taro.showToast({ title: '编辑资料功能开发中', icon: 'none' });
  };

  const handleGoReviewReminder = () => {
    Taro.navigateTo({ url: '/pages/order-list/index?status=used' }).catch(() => {});
  };

  const handleMessageClick = (msg: typeof messageList[0]) => {
    if (!msg.read) markMessageRead(msg.id);
    setShowMessages(false);
    setTimeout(() => {
      Taro.navigateTo({ url: msg.targetPath }).catch(() => {});
    }, 200);
  };

  const handleMarkAllRead = () => {
    markAllMessagesRead();
  };

  const formatTimeAgo = (time: string) => {
    const diff = Date.now() - new Date(time).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  };

  const formatTourDuration = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`;
  };

  return (
    <View className={styles.minePage}>
      <View className={styles.header}>
        <View className={styles.userInfo} onClick={handleEditProfile}>
          <View className={styles.avatar}>
            <Text>👤</Text>
          </View>
          <View className={styles.userText}>
            <Text className={styles.nickname}>游客用户</Text>
            <Text className={styles.phone}>点击登录 / 注册</Text>
          </View>
        </View>

        <View className={styles.headerActions}>
          <View
            className={styles.messageEntry}
            onClick={() => setShowMessages(true)}
          >
            <Text className={styles.messageEntryIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View className={styles.messageEntryBadge}>
                <Text>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{favoriteSpotIds.length}</Text>
            <Text className={styles.statLabel}>收藏景点</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{ticketOrders.filter(o => o.status === 'used').length}</Text>
            <Text className={styles.statLabel}>游览记录</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{reviewList.length}</Text>
            <Text className={styles.statLabel}>我的评价</Text>
          </View>
        </View>
      </View>

      {pendingReviewCount > 0 && (
        <View className={styles.reviewReminder} onClick={handleGoReviewReminder}>
          <View className={styles.reviewReminderIcon}>
            <Text>✍️</Text>
          </View>
          <View className={styles.reviewReminderContent}>
            <Text className={styles.reviewReminderTitle}>你有{pendingReviewCount}个订单待评价</Text>
            <Text className={styles.reviewReminderDesc}>评价后可获得积分奖励</Text>
          </View>
          <Text className={styles.reviewReminderArrow}>›</Text>
        </View>
      )}

      <View className={styles.orderSection}>
        <View className={styles.orderHeader}>
          <Text className={styles.orderTitle}>我的订单</Text>
          <Text className={styles.orderMore} onClick={() => handleOrderClick('all')}>全部订单 ›</Text>
        </View>
        <View className={styles.orderIcons}>
          {orderTypes.map(item => (
            <View
              key={item.id}
              className={styles.orderIconItem}
              onClick={() => handleOrderClick(item.id)}
            >
              <View className={styles.orderIcon}>
                <Text>{item.icon}</Text>
                {item.count > 0 && (
                  <View className={styles.orderBadge}>
                    <Text>{item.count > 99 ? '99+' : item.count}</Text>
                  </View>
                )}
                {item.id === 'used' && pendingReviewCount > 0 && (
                  <View className={classnames(styles.orderBadge, styles.pendingReviewBadge)}>
                    <Text>{pendingReviewCount > 99 ? '99+' : pendingReviewCount}</Text>
                  </View>
                )}
              </View>
              <Text className={styles.orderIconLabel}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {tourHistoryList.length > 0 && (
        <View className={styles.tourHistorySection}>
          <View className={styles.tourHistoryHeader}>
            <Text className={styles.tourHistoryTitle}>最近游览</Text>
          </View>
          <ScrollView scrollX className={styles.tourHistoryScroll}>
            {tourHistoryList.slice(0, 3).map(tour => (
              <View key={tour.id} className={styles.tourHistoryCard}>
                <Text className={styles.tourHistoryRoute}>{tour.routeName}</Text>
                <Text className={styles.tourHistoryMeta}>
                  {formatTourDuration(tour.totalMs)} · {tour.completedCount}/{tour.totalCount}景点
                </Text>
                <View className={styles.tourHistorySpots}>
                  {tour.spots.filter(s => s.leaveTime).slice(0, 3).map(spot => (
                    <Text key={spot.spotId} className={styles.tourHistorySpotTag}>
                      {spot.spotName}
                    </Text>
                  ))}
                  {tour.spots.filter(s => s.leaveTime).length > 3 && (
                    <Text className={styles.tourHistorySpotTag}>+{tour.spots.filter(s => s.leaveTime).length - 3}</Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View className={styles.menuSection}>
        {menuItems.map(item => (
          <View
            key={item.id}
            className={styles.menuItem}
            onClick={() => handleMenuClick(item)}
          >
            <View className={styles.menuIcon}>
              <Text>{item.icon}</Text>
            </View>
            <Text className={styles.menuText}>{item.name}</Text>
            {typeof item.count === 'number' && item.count > 0 && (
              <Text className={styles.menuCount}>{item.count}</Text>
            )}
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>

      <View className={styles.serviceSection}>
        <Text className={styles.serviceTitle}>更多服务</Text>
        <View className={styles.serviceGrid}>
          {serviceItems.map(item => (
            <View
              key={item.id}
              className={styles.serviceItem}
              onClick={() => handleServiceClick(item)}
            >
              <View
                className={styles.serviceIcon}
                style={{ backgroundColor: item.color + '20' }}
              >
                <Text>{item.icon}</Text>
                {item.badge && item.badge > 0 && (
                  <View className={styles.serviceBadge}>
                    <Text>{item.badge > 99 ? '99+' : item.badge}</Text>
                  </View>
                )}
              </View>
              <Text className={styles.serviceName}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {showMessages && (
        <View className={styles.messagePopup} onClick={() => setShowMessages(false)}>
          <View className={styles.messageContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.messageHeader}>
              <Text className={styles.messageTitle}>消息中心</Text>
              {unreadCount > 0 && (
                <Text className={styles.markAllRead} onClick={handleMarkAllRead}>全部已读</Text>
              )}
            </View>
            <ScrollView scrollY className={styles.messageScroll}>
              {messageList.length > 0 ? messageList.map(msg => (
                <View
                  key={msg.id}
                  className={classnames(styles.messageItem, { [styles.unread]: !msg.read })}
                  onClick={() => handleMessageClick(msg)}
                >
                  <Text className={styles.messageItemIcon}>{MSG_TYPE_ICON[msg.type] || '📢'}</Text>
                  <View className={styles.messageItemInfo}>
                    <Text className={styles.messageItemTitle}>{msg.title}</Text>
                    <Text className={styles.messageItemDesc}>{msg.desc}</Text>
                    <Text className={styles.messageItemTime}>{formatTimeAgo(msg.time)}</Text>
                  </View>
                  {!msg.read && <View className={styles.messageUnreadDot} />}
                </View>
              )) : (
                <View className={styles.messageEmpty}>
                  <Text>暂无消息</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default MinePage;
