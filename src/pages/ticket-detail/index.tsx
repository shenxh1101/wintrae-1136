import React, { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { getTicketById } from '@/data/tickets';
import { TicketType } from '@/types';
import styles from './index.module.scss';

const TicketDetailPage: React.FC = () => {
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketType | null>(null);

  useEffect(() => {
    const ticketId = router.params.id as string;
    console.log('[TicketDetail] 门票ID:', ticketId);
    if (ticketId) {
      const ticketData = getTicketById(ticketId);
      if (ticketData) {
        setTicket(ticketData);
      }
    }
  }, [router.params]);

  const handleBook = () => {
    console.log('[TicketDetail] 立即预订');
    if (ticket) {
      Taro.navigateTo({
        url: `/pages/booking/index?ticketId=${ticket.id}&quantity=1`
      }).catch(err => {
        console.error('[TicketDetail] 跳转预约页失败:', err);
      });
    }
  };

  if (!ticket) {
    return (
      <View className={styles.ticketDetailPage}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View className={styles.ticketDetailPage}>
      <View className={styles.banner}>
        <Image
          className={styles.bannerImage}
          src="https://picsum.photos/id/1015/750/500"
          mode="aspectFill"
        />
        <View className={styles.bannerOverlay}>
          <Text className={styles.spotName}>翠湖公园</Text>
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.ticketType}>{ticket.name}</Text>
        <Text className={styles.ticketDesc}>{ticket.description}</Text>
        <View className={styles.priceRow}>
          <Text className={styles.currentPrice}>
            <small>¥</small>{ticket.price}
          </Text>
          <Text className={styles.originalPrice}>¥{ticket.originalPrice}</Text>
          <Text className={styles.remaining}>剩余 {ticket.remaining} 张</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📋</Text>
          费用说明
        </Text>
        <View className={styles.infoList}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>包含项目</Text>
            <Text className={styles.infoValue}>景区大门票</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>入园方式</Text>
            <Text className={styles.infoValue}>二维码入园</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>有效期限</Text>
            <Text className={styles.infoValue}>购买当日有效</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>退票政策</Text>
            <Text className={styles.infoValue}>未使用可退</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>⏰</Text>
          使用说明
        </Text>
        <View className={styles.noticeList}>
          <View className={styles.noticeItem}>
            <Text className={styles.noticeIcon}>•</Text>
            <Text>请在预约时段内入园，过时需重新预约</Text>
          </View>
          <View className={styles.noticeItem}>
            <Text className={styles.noticeIcon}>•</Text>
            <Text>每人每天最多可预约3次</Text>
          </View>
          <View className={styles.noticeItem}>
            <Text className={styles.noticeIcon}>•</Text>
            <Text>如需取消，请提前24小时操作</Text>
          </View>
          <View className={styles.noticeItem}>
            <Text className={styles.noticeIcon}>•</Text>
            <Text>儿童、老人等优惠票种请携带有效证件</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.priceInfo}>
          <Text className={styles.priceLabel}>单价</Text>
          <Text className={styles.priceValue}>¥{ticket.price}</Text>
        </View>
        <View className={styles.bookButton} onClick={handleBook}>
          <Text>立即预订</Text>
        </View>
      </View>
    </View>
  );
};

export default TicketDetailPage;
