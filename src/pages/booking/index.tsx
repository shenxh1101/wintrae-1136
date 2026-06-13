import React, { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { getTicketById, timeSlots } from '@/data/tickets';
import { TicketType, TimeSlot } from '@/types';
import styles from './index.module.scss';

const BookingPage: React.FC = () => {
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    const ticketId = router.params.ticketId as string;
    const qty = parseInt(router.params.quantity as string) || 1;
    console.log('[Booking] 门票ID:', ticketId, '数量:', qty);

    if (ticketId) {
      const ticketData = getTicketById(ticketId);
      if (ticketData) {
        setTicket(ticketData);
        setQuantity(qty);
      }
    }
  }, [router.params]);

  const handleQuantityChange = (delta: number) => {
    const newValue = Math.max(1, Math.min(10, quantity + delta));
    console.log('[Booking] 数量变更:', newValue);
    setQuantity(newValue);
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (slot.remaining <= 0) return;
    console.log('[Booking] 选择时段:', slot.time);
    setSelectedTimeSlot(slot.id);
  };

  const handleSubmit = () => {
    console.log('[Booking] 提交预约');
    if (!selectedTimeSlot) {
      Taro.showToast({ title: '请选择入园时段', icon: 'none' });
      return;
    }
    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '预约成功', icon: 'success' });
      setTimeout(() => {
        Taro.redirectTo({
          url: '/pages/qr-code/index?orderId=ORD20240115001'
        }).catch(err => {
          console.error('[Booking] 跳转二维码页失败:', err);
        });
      }, 1500);
    }, 1000);
  };

  const totalPrice = ticket ? ticket.price * quantity : 0;

  if (!ticket) {
    return (
      <View className={styles.bookingPage}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View className={styles.bookingPage}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>门票信息</Text>
        <View className={styles.ticketInfo}>
          <Image
            className={styles.ticketImage}
            src="https://picsum.photos/id/1015/200/200"
            mode="aspectFill"
          />
          <View className={styles.ticketDetail}>
            <View>
              <Text className={styles.ticketName}>{ticket.name}</Text>
              <Text className={styles.ticketDesc}>{ticket.description}</Text>
            </View>
            <View className={styles.ticketPrice}>
              <small>¥</small>{ticket.price}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择时段</Text>
        <View className={styles.timeSlots}>
          {timeSlots.map(slot => (
            <View
              key={slot.id}
              className={classnames(
                styles.timeSlot,
                { [styles.active]: selectedTimeSlot === slot.id },
                { [styles.disabled]: slot.remaining <= 0 }
              )}
              onClick={() => handleTimeSlotSelect(slot)}
            >
              <View className={styles.timeSlotTime}>{slot.time}</View>
              <View className={styles.timeSlotRemaining}>
                余{slot.remaining}张
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>购买数量</Text>
        <View className={styles.infoList}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>{ticket.name}</Text>
            <View className={styles.quantitySelector}>
              <View
                className={classnames(styles.quantityBtn, {
                  [styles.disabled]: quantity <= 1
                })}
                onClick={() => handleQuantityChange(-1)}
              >
                <Text>−</Text>
              </View>
              <Text className={styles.quantityValue}>{quantity}</Text>
              <View
                className={styles.quantityBtn}
                onClick={() => handleQuantityChange(1)}
              >
                <Text>+</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>联系人信息</Text>
        <View className={styles.contactForm}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>姓名</Text>
            <View className={styles.formInput}>
              <Text
                className={contactName ? styles.formInputText : styles.formInputPlaceholder}
              >
                {contactName || '请输入姓名'}
              </Text>
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>手机号</Text>
            <View className={styles.formInput}>
              <Text
                className={contactPhone ? styles.formInputText : styles.formInputPlaceholder}
              >
                {contactPhone || '请输入手机号'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.totalInfo}>
          <Text className={styles.totalLabel}>合计</Text>
          <Text className={styles.totalPrice}>¥{totalPrice}</Text>
        </View>
        <View className={styles.submitButton} onClick={handleSubmit}>
          <Text>提交预约</Text>
        </View>
      </View>
    </View>
  );
};

export default BookingPage;
