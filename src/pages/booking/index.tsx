import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/app-store';
import { getTicketById } from '@/data/tickets';
import { TicketType, TicketOrder } from '@/types';
import { generateRandomId, formatTime } from '@/utils';
import styles from './index.module.scss';

const BookingPage: React.FC = () => {
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedTimeSlotText, setSelectedTimeSlotText] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactIdCard, setContactIdCard] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const addTicketOrder = useAppStore(state => state.addTicketOrder);
  const setCurrentOrder = useAppStore(state => state.setCurrentOrder);

  useEffect(() => {
    const ticketId = router.params.ticketId as string;
    const qty = parseInt(router.params.quantity as string) || 1;
    const date = router.params.date as string;
    const timeSlotId = router.params.timeSlotId as string;
    console.log('[Booking] 门票ID:', ticketId, '数量:', qty, '日期:', date, '时段:', timeSlotId);

    if (ticketId) {
      const ticketData = getTicketById(ticketId);
      if (ticketData) {
        setTicket(ticketData);
        setQuantity(qty);
        if (date) setSelectedDate(date);
        if (timeSlotId) {
          setSelectedTimeSlot(timeSlotId);
          const slot = ticketData.timeSlots.find(s => s.id === timeSlotId);
          if (slot) setSelectedTimeSlotText(slot.time);
        } else if (ticketData.timeSlots.length > 0) {
          const firstSlot = ticketData.timeSlots[0];
          setSelectedTimeSlot(firstSlot.id);
          setSelectedTimeSlotText(firstSlot.time);
        }
      }
    }
  }, [router.params]);

  const handleQuantityChange = (delta: number) => {
    const newValue = Math.max(1, Math.min(10, quantity + delta));
    console.log('[Booking] 数量变更:', newValue);
    setQuantity(newValue);
  };

  const handleTimeSlotSelect = (slotId: string, slotTime: string) => {
    console.log('[Booking] 选择时段:', slotTime);
    setSelectedTimeSlot(slotId);
    setSelectedTimeSlotText(slotTime);
  };

  const validateForm = (): boolean => {
    if (!selectedTimeSlot) {
      Taro.showToast({ title: '请选择入园时段', icon: 'none' });
      return false;
    }
    if (!contactName.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' });
      return false;
    }
    if (contactName.trim().length < 2) {
      Taro.showToast({ title: '姓名至少2个字符', icon: 'none' });
      return false;
    }
    if (!contactPhone.trim()) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' });
      return false;
    }
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(contactPhone.trim())) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    console.log('[Booking] 提交预约');
    if (!ticket || !validateForm()) return;

    setSubmitting(true);
    Taro.showLoading({ title: '提交中...' });

    setTimeout(() => {
      const totalPrice = ticket.price * quantity;
      const orderId = generateRandomId('ORD');

      const newOrder: TicketOrder = {
        id: orderId,
        orderNo: orderId.toUpperCase(),
        spotId: '1',
        spotName: '景区通票',
        ticketId: ticket.id,
        ticketName: ticket.name,
        date: selectedDate,
        timeSlot: selectedTimeSlotText,
        timeSlotId: selectedTimeSlot || '',
        quantity,
        price: ticket.price,
        totalPrice,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactIdCard: contactIdCard.trim(),
        status: 'paid',
        qrCode: `qr-${orderId}`,
        createTime: formatTime(new Date())
      };

      addTicketOrder(newOrder);
      setCurrentOrder(newOrder);
      console.log('[Booking] 创建订单成功:', newOrder);

      Taro.hideLoading();
      Taro.showToast({ title: '预约成功', icon: 'success' });
      setTimeout(() => {
        Taro.redirectTo({
          url: `/pages/qr-code/index?orderId=${orderId}`
        }).catch(err => {
          console.error('[Booking] 跳转二维码页失败:', err);
        });
      }, 1000);
    }, 800);
  };

  const totalPrice = useMemo(() => ticket ? ticket.price * quantity : 0, [ticket, quantity]);

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
            src={ticket.image || 'https://picsum.photos/id/1015/200/200'}
            mode="aspectFill"
          />
          <View className={styles.ticketDetail}>
            <View>
              <Text className={styles.ticketName}>{ticket.name}</Text>
              <Text className={styles.ticketDesc}>{ticket.description}</Text>
              {selectedDate && (
                <Text className={styles.ticketDate}>入园日期：{selectedDate}</Text>
              )}
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
          {ticket.timeSlots.map(slot => (
            <View
              key={slot.id}
              className={classnames(
                styles.timeSlot,
                { [styles.active]: selectedTimeSlot === slot.id },
                { [styles.disabled]: slot.remaining <= 0 }
              )}
              onClick={() => slot.remaining > 0 && handleTimeSlotSelect(slot.id, slot.time)}
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
                onClick={() => quantity > 1 && handleQuantityChange(-1)}
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
        <Text className={styles.sectionTitle}>联系人信息 <Text style={{ color: '#ef4444' }}>*</Text></Text>
        <View className={styles.contactForm}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>姓名</Text>
            <Input
              className={styles.formInputReal}
              placeholder="请输入姓名"
              placeholderClass={styles.formInputPlaceholder}
              value={contactName}
              onInput={(e) => setContactName(e.detail.value)}
              maxlength={20}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>手机号</Text>
            <Input
              className={styles.formInputReal}
              type="number"
              placeholder="请输入手机号"
              placeholderClass={styles.formInputPlaceholder}
              value={contactPhone}
              onInput={(e) => setContactPhone(e.detail.value)}
              maxlength={11}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>身份证号</Text>
            <Input
              className={styles.formInputReal}
              placeholder="请输入身份证号（可选）"
              placeholderClass={styles.formInputPlaceholder}
              value={contactIdCard}
              onInput={(e) => setContactIdCard(e.detail.value)}
              maxlength={18}
            />
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.totalInfo}>
          <Text className={styles.totalLabel}>合计</Text>
          <Text className={styles.totalPrice}>¥{totalPrice}</Text>
          <Text className={styles.totalCount}>(共{quantity}张)</Text>
        </View>
        <View
          className={classnames(styles.submitButton, { [styles.submitDisabled]: submitting })}
          onClick={!submitting ? handleSubmit : undefined}
        >
          <Text>{submitting ? '提交中...' : '提交预约'}</Text>
        </View>
      </View>
    </View>
  );
};

export default BookingPage;
