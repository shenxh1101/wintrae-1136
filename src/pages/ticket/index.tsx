import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { ticketTypes } from '@/data/tickets';
import { TicketType, TimeSlot } from '@/types';
import styles from './index.module.scss';

const TicketPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const dates = useMemo(() => {
    const result = [];
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      result.push({
        day: date.getDate(),
        weekday: i === 0 ? '今天' : weekdays[date.getDay()],
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      });
    }
    return result;
  }, []);

  const handleDateSelect = (index: number) => {
    console.log('[Ticket] 选择日期:', dates[index].date);
    setSelectedDate(index);
    setSelectedTimeSlot(null);
  };

  const handleTicketSelect = (ticket: TicketType) => {
    console.log('[Ticket] 选择票种:', ticket.name);
    setSelectedTicket(ticket.id);
    setSelectedTimeSlot(null);
    if (!quantities[ticket.id]) {
      setQuantities(prev => ({ ...prev, [ticket.id]: 1 }));
    }
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (slot.remaining <= 0) return;
    console.log('[Ticket] 选择时段:', slot.time);
    setSelectedTimeSlot(slot.id);
  };

  const handleQuantityChange = (ticketId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[ticketId] || 1;
      const newValue = Math.max(1, Math.min(10, current + delta));
      console.log('[Ticket] 数量变更:', ticketId, newValue);
      return { ...prev, [ticketId]: newValue };
    });
  };

  const handleBuyNow = (ticket: TicketType) => {
    console.log('[Ticket] 立即购票:', ticket.name);
    const qty = quantities[ticket.id] || 1;
    const timeSlotId = selectedTimeSlot || ticket.timeSlots[0]?.id;
    if (!timeSlotId) {
      Taro.showToast({ title: '请选择时段', icon: 'none' });
      return;
    }
    Taro.navigateTo({
      url: `/pages/booking/index?ticketId=${ticket.id}&quantity=${qty}&date=${dates[selectedDate].date}&timeSlotId=${timeSlotId}`
    }).catch(err => {
      console.error('[Ticket] 跳转预约页失败:', err);
    });
  };

  const totalPrice = useMemo(() => {
    if (!selectedTicket) return 0;
    const ticket = ticketTypes.find(t => t.id === selectedTicket);
    if (!ticket) return 0;
    const qty = quantities[selectedTicket] || 1;
    return ticket.price * qty;
  }, [selectedTicket, quantities]);

  const selectedCount = useMemo(() => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  }, [quantities]);

  return (
    <View className={styles.ticketPage}>
      <View className={styles.dateSelector}>
        {dates.map((date, index) => (
          <View
            key={index}
            className={classnames(styles.dateItem, {
              [styles.active]: selectedDate === index
            })}
            onClick={() => handleDateSelect(index)}
          >
            <Text className={styles.dateDay}>{date.day}</Text>
            <Text className={styles.dateWeekday}>{date.weekday}</Text>
          </View>
        ))}
      </View>

      <View className={styles.content}>
        {ticketTypes.map(ticket => (
          <View
            key={ticket.id}
            className={styles.ticketCard}
            onClick={() => handleTicketSelect(ticket)}
          >
            <View className={styles.ticketHeader}>
              <Text className={styles.ticketName}>{ticket.name}</Text>
              <View className={styles.ticketPrice}>
                <View className={styles.priceCurrent}>
                  <small>¥</small>{ticket.price}
                </View>
                <View className={styles.priceOriginal}>¥{ticket.originalPrice}</View>
              </View>
            </View>

            <Text className={styles.ticketDesc}>{ticket.description}</Text>

            <View className={styles.ticketInfo}>
              <View className={styles.ticketInfoItem}>
                <Text className={styles.infoLabel}>剩余票数</Text>
                <Text
                  className={classnames(styles.infoValue, styles.infoValueHighlight)}
                >
                  {ticket.remaining}张
                </Text>
              </View>
              <View className={styles.ticketInfoItem}>
                <Text className={styles.infoLabel}>总票数</Text>
                <Text className={styles.infoValue}>{ticket.total}张</Text>
              </View>
            </View>

            {selectedTicket === ticket.id && (
              <>
                <Text className={styles.timeSlotsTitle}>选择时段</Text>
                <View className={styles.timeSlots}>
                  {ticket.timeSlots.map(slot => (
                    <View
                      key={slot.id}
                      className={classnames(
                        styles.timeSlot,
                        { [styles.active]: selectedTimeSlot === slot.id },
                        { [styles.disabled]: slot.remaining <= 0 }
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTimeSlotSelect(slot);
                      }}
                    >
                      <View className={styles.timeSlotTime}>{slot.time}</View>
                      <View className={styles.timeSlotRemaining}>
                        余{slot.remaining}张
                      </View>
                    </View>
                  ))}
                </View>

                <View className={styles.quantitySelector}>
                  <Text className={styles.quantityLabel}>购买数量</Text>
                  <View className={styles.quantityControl}>
                    <View
                      className={classnames(styles.quantityBtn, {
                        [styles.disabled]: (quantities[ticket.id] || 1) <= 1
                      })}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(ticket.id, -1);
                      }}
                    >
                      <Text>−</Text>
                    </View>
                    <Text className={styles.quantityValue}>
                      {quantities[ticket.id] || 1}
                    </Text>
                    <View
                      className={styles.quantityBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(ticket.id, 1);
                      }}
                    >
                      <Text>+</Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            <View
              className={styles.buyButton}
              onClick={(e) => {
                e.stopPropagation();
                handleBuyNow(ticket);
              }}
            >
              <Text>立即预约</Text>
            </View>
          </View>
        ))}
      </View>

      {selectedCount > 0 && (
        <View className={styles.bottomBar}>
          <View className={styles.bottomTotal}>
            <Text className={styles.bottomTotalLabel}>合计</Text>
            <Text className={styles.bottomTotalPrice}>¥{totalPrice}</Text>
          </View>
          <View className={styles.bottomButton}>
            <Text>去结算</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default TicketPage;
