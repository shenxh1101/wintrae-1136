import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAppStore } from '@/store/app-store';
import { TicketOrder } from '@/types';
import styles from './index.module.scss';

const QrCodePage: React.FC = () => {
  const router = useRouter();
  const [order, setOrder] = useState<TicketOrder | null>(null);

  const ticketOrders = useAppStore(state => state.ticketOrders);
  const currentOrder = useAppStore(state => state.currentOrder);

  useEffect(() => {
    const orderId = router.params.orderId as string;
    console.log('[QRCode] 订单ID:', orderId, 'Store订单数:', ticketOrders.length);

    let foundOrder: TicketOrder | null = null;
    if (orderId) {
      foundOrder = ticketOrders.find(o => o.id === orderId) || null;
    }
    if (!foundOrder && currentOrder) {
      foundOrder = currentOrder;
    }
    if (!foundOrder && ticketOrders.length > 0) {
      foundOrder = ticketOrders[ticketOrders.length - 1];
    }
    if (foundOrder) {
      console.log('[QRCode] 匹配到订单:', foundOrder);
      setOrder(foundOrder);
    }
  }, [router.params, ticketOrders, currentOrder]);

  const handleSaveQr = () => {
    console.log('[QRCode] 保存二维码');
    Taro.showToast({ title: '已保存到相册', icon: 'success' });
  };

  const handleViewOrder = () => {
    console.log('[QRCode] 查看订单详情');
    if (!order) return;
    Taro.showModal({
      title: '订单详情',
      content: `景点：${order.spotName}
票种：${order.ticketName}
日期：${order.date}
时段：${order.timeSlot}
数量：${order.quantity}张
金额：¥${order.totalPrice}
姓名：${order.contactName}
手机：${order.contactPhone}
下单时间：${order.createTime}`,
      showCancel: false,
      confirmText: '知道了'
    });
  };

  if (!order) {
    return (
      <View className={styles.qrCodePage}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View className={styles.qrCodePage}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>入园凭证</Text>
        <Text className={styles.headerSubtitle}>请向工作人员出示此二维码</Text>
      </View>

      <View className={styles.qrCard}>
        <Text className={styles.spotName}>{order.spotName}</Text>
        <Text className={styles.ticketType}>{order.ticketName} · {order.quantity}张</Text>

        <View className={styles.qrCodeContainer}>
          <View className={styles.qrCode}>
            <View className={styles.qrCodeCenter}>
              <Text>🎫</Text>
            </View>
          </View>
        </View>

        <Text className={styles.qrCodeText}>{order.qrCode || order.id}</Text>
      </View>

      <View className={styles.infoSection}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>入园日期</Text>
          <Text className={styles.infoValue}>{order.date}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>入园时段</Text>
          <Text className={styles.infoValue}>{order.timeSlot}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>订单编号</Text>
          <Text className={styles.infoValue}>{order.orderNo || order.id}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>购票数量</Text>
          <Text className={styles.infoValue}>{order.quantity}张</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>订单金额</Text>
          <Text className={styles.infoValue}>¥{order.totalPrice}</Text>
        </View>
        {order.contactName && (
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>联系人</Text>
            <Text className={styles.infoValue}>{order.contactName}</Text>
          </View>
        )}
      </View>

      <View className={styles.tipSection}>
        <Text className={styles.tipTitle}>
          <Text>💡</Text>
          温馨提示
        </Text>
        <View className={styles.tipContent}>
          <Text>1. 请在预约时段内入园，过时需重新预约</Text>
          <Text>{`\n`}2. 每人每天最多可预约3次</Text>
          <Text>{`\n`}3. 如需取消，请提前24小时操作</Text>
        </View>
      </View>

      <View className={styles.actionButtons}>
        <View className={styles.actionBtn + ' ' + styles.actionBtnSecondary} onClick={handleSaveQr}>
          <Text>保存二维码</Text>
        </View>
        <View className={styles.actionBtn + ' ' + styles.actionBtnPrimary} onClick={handleViewOrder}>
          <Text>查看订单</Text>
        </View>
      </View>
    </View>
  );
};

export default QrCodePage;
