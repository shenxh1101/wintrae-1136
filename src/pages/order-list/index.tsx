import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/app-store';
import { TicketOrder } from '@/types';
import { getOrderStatusText, getOrderStatusColor } from '@/utils';
import styles from './index.module.scss';

const STATUS_TABS = [
  { id: 'all', name: '全部' },
  { id: 'paid', name: '待使用' },
  { id: 'used', name: '已使用' },
  { id: 'refund', name: '退款/售后' }
];

const INVOICE_STATUS_MAP: Record<string, { text: string; className: string }> = {
  none: { text: '未开票', className: styles.invoiceNone },
  pending: { text: '开票中', className: styles.invoicePending },
  issued: { text: '已开票', className: styles.invoiceIssued }
};

const OrderListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [detailOrder, setDetailOrder] = useState<TicketOrder | null>(null);

  const ticketOrders = useAppStore(state => state.ticketOrders);
  const cancelTicketOrder = useAppStore(state => state.cancelTicketOrder);
  const setCurrentOrder = useAppStore(state => state.setCurrentOrder);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return ticketOrders;
    if (activeTab === 'refund') return ticketOrders.filter(o => o.status === 'refund' || o.status === 'cancelled');
    return ticketOrders.filter(o => o.status === activeTab);
  }, [ticketOrders, activeTab]);

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      pending: styles.statusPending,
      paid: styles.statusPaid,
      used: styles.statusUsed,
      cancelled: styles.statusCancelled,
      refund: styles.statusRefund
    };
    return map[status] || '';
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleViewQrCode = (order: TicketOrder) => {
    setCurrentOrder(order);
    Taro.navigateTo({
      url: `/pages/qr-code/index?orderId=${order.id}`
    }).catch(err => console.error('[OrderList] 跳转二维码失败:', err));
  };

  const handleCancelOrder = (order: TicketOrder) => {
    Taro.showModal({
      title: '确认取消',
      content: `确定要取消订单 ${order.orderNo || order.id} 吗？`,
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm) {
          cancelTicketOrder(order.id);
          setDetailOrder(null);
          Taro.showToast({ title: '订单已取消', icon: 'success' });
        }
      }
    });
  };

  const handleViewDetail = (order: TicketOrder) => {
    setDetailOrder(order);
  };

  const handleCloseDetail = () => {
    setDetailOrder(null);
  };

  const handleReopenQr = (order: TicketOrder) => {
    setDetailOrder(null);
    setTimeout(() => handleViewQrCode(order), 300);
  };

  const handleGoInvoice = () => {
    setDetailOrder(null);
    setTimeout(() => {
      Taro.navigateTo({ url: '/pages/invoice/index' }).catch(() => {});
    }, 300);
  };

  const handleGoReview = (order: TicketOrder) => {
    setDetailOrder(null);
    setTimeout(() => {
      Taro.navigateTo({
        url: `/pages/review/index?spotId=${order.spotId || ''}&spotName=${encodeURIComponent(order.spotName)}&orderId=${order.id}`
      }).catch(() => {});
    }, 300);
  };

  const getInvoiceStatusInfo = (order: TicketOrder) => {
    const status = order.invoiceStatus || 'none';
    return INVOICE_STATUS_MAP[status] || INVOICE_STATUS_MAP.none;
  };

  const renderOrderCard = (order: TicketOrder) => {
    const invoiceInfo = getInvoiceStatusInfo(order);
    return (
      <View key={order.id} className={styles.orderCard} onClick={() => handleViewDetail(order)}>
        <View className={styles.orderHeader}>
          <Text className={styles.orderNo}>{order.orderNo || order.id}</Text>
          <View className={classnames(styles.orderStatus, getStatusClass(order.status))}>
            <Text>{getOrderStatusText(order.status)}</Text>
          </View>
        </View>
        <View className={styles.orderBody}>
          <View className={styles.orderInfoRow}>
            <Text className={styles.orderInfoLabel}>票种</Text>
            <Text className={styles.orderInfoValue}>{order.ticketName}</Text>
          </View>
          <View className={styles.orderInfoRow}>
            <Text className={styles.orderInfoLabel}>日期 / 时段</Text>
            <Text className={styles.orderInfoValue}>{order.date} {order.timeSlot}</Text>
          </View>
          <View className={styles.orderInfoRow}>
            <Text className={styles.orderInfoLabel}>数量</Text>
            <Text className={styles.orderInfoValue}>{order.quantity}张</Text>
          </View>
          <View className={styles.orderInfoRow}>
            <Text className={styles.orderInfoLabel}>金额</Text>
            <Text className={classnames(styles.orderInfoValue, styles.orderPrice)}>¥{order.totalPrice}</Text>
          </View>
          <View className={styles.orderInfoRow}>
            <Text className={styles.orderInfoLabel}>开票状态</Text>
            <View className={classnames(styles.invoiceBadge, invoiceInfo.className)}>
              <Text>{invoiceInfo.text}</Text>
            </View>
          </View>
        </View>
        <View className={styles.orderActions}>
          {order.status === 'paid' && (
            <>
              <View
                className={classnames(styles.actionBtn, styles.actionDanger)}
                onClick={(e) => { e.stopPropagation(); handleCancelOrder(order); }}
              >
                <Text>取消订单</Text>
              </View>
              <View
                className={classnames(styles.actionBtn, styles.actionPrimary)}
                onClick={(e) => { e.stopPropagation(); handleViewQrCode(order); }}
              >
                <Text>查看二维码</Text>
              </View>
            </>
          )}
          {order.status === 'used' && (
            <View
              className={classnames(styles.actionBtn, styles.actionPrimary)}
              onClick={(e) => { e.stopPropagation(); handleGoReview(order); }}
            >
              <Text>去评价</Text>
            </View>
          )}
          {order.status === 'cancelled' && (
            <View className={classnames(styles.actionBtn, styles.actionSecondary)}>
              <Text>已取消</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className={styles.orderListPage}>
      <View className={styles.tabBar}>
        {STATUS_TABS.map(tab => (
          <View
            key={tab.id}
            className={classnames(styles.tabItem, { [styles.active]: activeTab === tab.id })}
            onClick={() => handleTabChange(tab.id)}
          >
            <Text>{tab.name}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.content}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(renderOrderCard)
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🎫</Text>
            <Text className={styles.emptyText}>暂无相关订单</Text>
            <View
              className={styles.emptyAction}
              onClick={() => Taro.switchTab({ url: '/pages/ticket/index' })}
            >
              <Text>去预约门票</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {detailOrder && (
        <View className={styles.detailPopup} onClick={handleCloseDetail}>
          <View className={styles.detailContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.detailHeader}>
              <Text className={styles.detailTitle}>订单详情</Text>
              <View className={styles.detailClose} onClick={handleCloseDetail}>
                <Text>✕</Text>
              </View>
            </View>

            <View className={styles.detailInfo}>
              <View className={styles.detailInfoItem}>
                <Text className={styles.detailInfoLabel}>订单编号</Text>
                <Text className={styles.detailInfoValue}>{detailOrder.orderNo || detailOrder.id}</Text>
              </View>
              <View className={styles.detailInfoItem}>
                <Text className={styles.detailInfoLabel}>景点</Text>
                <Text className={styles.detailInfoValue}>{detailOrder.spotName}</Text>
              </View>
              <View className={styles.detailInfoItem}>
                <Text className={styles.detailInfoLabel}>票种</Text>
                <Text className={styles.detailInfoValue}>{detailOrder.ticketName}</Text>
              </View>
              <View className={styles.detailInfoItem}>
                <Text className={styles.detailInfoLabel}>入园日期</Text>
                <Text className={styles.detailInfoValue}>{detailOrder.date}</Text>
              </View>
              <View className={styles.detailInfoItem}>
                <Text className={styles.detailInfoLabel}>入园时段</Text>
                <Text className={styles.detailInfoValue}>{detailOrder.timeSlot}</Text>
              </View>
              <View className={styles.detailInfoItem}>
                <Text className={styles.detailInfoLabel}>数量</Text>
                <Text className={styles.detailInfoValue}>{detailOrder.quantity}张</Text>
              </View>
              <View className={styles.detailInfoItem}>
                <Text className={styles.detailInfoLabel}>单价</Text>
                <Text className={styles.detailInfoValue}>¥{detailOrder.price || (detailOrder.totalPrice / detailOrder.quantity)}</Text>
              </View>
              <View className={styles.detailInfoItem}>
                <Text className={styles.detailInfoLabel}>总金额</Text>
                <Text className={styles.detailInfoValue} style={{ color: '#ef4444' }}>¥{detailOrder.totalPrice}</Text>
              </View>
              {detailOrder.contactName && (
                <View className={styles.detailInfoItem}>
                  <Text className={styles.detailInfoLabel}>联系人</Text>
                  <Text className={styles.detailInfoValue}>{detailOrder.contactName}</Text>
                </View>
              )}
              {detailOrder.contactPhone && (
                <View className={styles.detailInfoItem}>
                  <Text className={styles.detailInfoLabel}>手机号</Text>
                  <Text className={styles.detailInfoValue}>{detailOrder.contactPhone}</Text>
                </View>
              )}
              <View className={styles.detailInfoItem}>
                <Text className={styles.detailInfoLabel}>下单时间</Text>
                <Text className={styles.detailInfoValue}>{detailOrder.createTime}</Text>
              </View>
              <View className={styles.detailInfoItem}>
                <Text className={styles.detailInfoLabel}>订单状态</Text>
                <Text className={styles.detailInfoValue} style={{ color: getOrderStatusColor(detailOrder.status) }}>
                  {getOrderStatusText(detailOrder.status)}
                </Text>
              </View>
              <View className={styles.detailInfoItem}>
                <Text className={styles.detailInfoLabel}>开票状态</Text>
                <View className={classnames(styles.invoiceBadge, getInvoiceStatusInfo(detailOrder).className)}>
                  <Text>{getInvoiceStatusInfo(detailOrder).text}</Text>
                </View>
              </View>
            </View>

            <View className={styles.detailActions}>
              {detailOrder.status === 'paid' && (
                <>
                  <View
                    className={classnames(styles.detailActionBtn, styles.actionDanger)}
                    onClick={() => handleCancelOrder(detailOrder)}
                  >
                    <Text>取消订单</Text>
                  </View>
                  <View
                    className={classnames(styles.detailActionBtn, styles.actionPrimary)}
                    onClick={() => handleReopenQr(detailOrder)}
                  >
                    <Text>入园二维码</Text>
                  </View>
                </>
              )}
              {detailOrder.status === 'used' && (
                <>
                  <View
                    className={classnames(styles.detailActionBtn, styles.actionSecondary)}
                    onClick={() => handleGoInvoice()}
                  >
                    <Text>申请开票</Text>
                  </View>
                  <View
                    className={classnames(styles.detailActionBtn, styles.actionPrimary)}
                    onClick={() => handleGoReview(detailOrder)}
                  >
                    <Text>写评价</Text>
                  </View>
                </>
              )}
              {detailOrder.status === 'cancelled' && (
                <View className={classnames(styles.detailActionBtn, styles.actionSecondary)}>
                  <Text>订单已取消</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default OrderListPage;
