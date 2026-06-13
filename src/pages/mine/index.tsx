import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const orderTypes = [
    { id: 'pending', name: '待付款', icon: '💰', count: 0 },
    { id: 'paid', name: '待使用', icon: '🎫', count: 1 },
    { id: 'used', name: '已使用', icon: '✅', count: 2 },
    { id: 'refund', name: '退款/售后', icon: '↩️', count: 0 }
  ];

  const menuItems = [
    { id: 'favorites', name: '我的收藏', icon: '❤️', path: '' },
    { id: 'footprint', name: '浏览足迹', icon: '👣', path: '' },
    { id: 'coupon', name: '优惠券', icon: '🎟️', path: '' },
    { id: 'invoice', name: '电子发票', icon: '🧾', path: '/pages/invoice/index' },
    { id: 'settings', name: '设置', icon: '⚙️', path: '' }
  ];

  const serviceItems = [
    { id: 'help', name: '服务求助', icon: '💁', color: '#f87171', path: '/pages/service-help/index' },
    { id: 'review', name: '评价打分', icon: '⭐', color: '#fbbf24', path: '/pages/review/index' },
    { id: 'qa', name: '常见问题', icon: '❓', color: '#60a5fa', path: '' },
    { id: 'feedback', name: '意见反馈', icon: '📝', color: '#34d399', path: '' }
  ];

  const handleOrderClick = (type: string) => {
    console.log('[Mine] 查看订单:', type);
    Taro.showToast({ title: `查看${type}订单`, icon: 'none' });
  };

  const handleMenuClick = (item: typeof menuItems[0]) => {
    console.log('[Mine] 点击菜单:', item.name);
    if (item.path) {
      Taro.navigateTo({ url: item.path }).catch(err => {
        console.error('[Mine] 跳转失败:', err);
      });
    } else {
      Taro.showToast({ title: `${item.name}功能开发中`, icon: 'none' });
    }
  };

  const handleServiceClick = (item: typeof serviceItems[0]) => {
    console.log('[Mine] 点击服务:', item.name);
    if (item.path) {
      Taro.navigateTo({ url: item.path }).catch(err => {
        console.error('[Mine] 跳转失败:', err);
      });
    } else {
      Taro.showToast({ title: `${item.name}功能开发中`, icon: 'none' });
    }
  };

  const handleEditProfile = () => {
    console.log('[Mine] 编辑个人信息');
    Taro.showToast({ title: '编辑资料功能开发中', icon: 'none' });
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

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>3</Text>
            <Text className={styles.statLabel}>收藏景点</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>5</Text>
            <Text className={styles.statLabel}>游览记录</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>2</Text>
            <Text className={styles.statLabel}>我的评价</Text>
          </View>
        </View>
      </View>

      <View className={styles.orderSection}>
        <View className={styles.orderHeader}>
          <Text className={styles.orderTitle}>我的订单</Text>
          <Text className={styles.orderMore}>全部订单 ›</Text>
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
                    <Text>{item.count}</Text>
                  </View>
                )}
              </View>
              <Text className={styles.orderIconLabel}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>

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
              </View>
              <Text className={styles.serviceName}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default MinePage;
