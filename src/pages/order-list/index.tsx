import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/app-store';
import { TicketOrder, RefundRecord } from '@/types';
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

const REFUND_STATUS_MAP: Record<string, { text: string; className: string }> = {
  pending: { text: '待处理', className: styles.refundPending },
  processing: { text: '处理中', className: styles.refundProcessing },
  completed: { text: '已完成', className: styles.refundCompleted },
  rejected: { text: '已拒绝', className: styles.refundRejected }
};

const REFUND_REASONS = [
  '行程变更，无法前往',
  '身体不适，不能出行',
  '天气原因，不宜游玩',
  '买错了票，需要重买',
  '其他原因'
];

const OrderListPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [detailOrder, setDetailOrder] = useState<TicketOrder | null>(null);
  const [showRefundPopup, setShowRefundPopup] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundMethod, setRefundMethod] = useState<'original' | 'balance'>('original');
  const [customReason, setCustomReason] = useState('');

  const ticketOrders = useAppStore(state => state.ticketOrders);
  const refundList = useAppStore(state => state.refundList);
  const cancelTicketOrder = useAppStore(state => state.cancelTicketOrder);
  const setCurrentOrder = useAppStore(state => state.setCurrentOrder);
  const createRefund = useAppStore(state => state.createRefund);
  const updateRefund = useAppStore(state => state.updateRefund);
  const updateTicketOrder = useAppStore(state => state.updateTicketOrder);

  useEffect(() => {
    const status = router.params.status as string;
    if (status && STATUS_TABS.some(t => t.id === status)) {
      setActiveTab(status);
    }
  }, [router.params]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return ticketOrders;
    if (activeTab === 'refund') return ticketOrders.filter(o => o.status === 'refund' || o.status === 'cancelled');
    return ticketOrders.filter(o => o.status === activeTab);
  }, [ticketOrders, activeTab]);

  const getRefundByOrder = (orderId: string): RefundRecord | undefined => {
    return refundList.find(r => r.orderId === orderId);
  };

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
      content: `确定要取消订单 ${order.orderNo || order.id} 吗？取消后可申请退款。`,
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

  const handleOpenRefund = () => {
    setRefundReason('');
    setCustomReason('');
    setRefundMethod('original');
    setShowRefundPopup(true);
  };

  const handleSubmitRefund = () => {
    if (!detailOrder) return;
    const reason = refundReason === '其他原因' ? customReason : refundReason;
    if (!reason || reason.trim().length < 2) {
      Taro.showToast({ title: '请填写退款原因', icon: 'none' });
      return;
    }
    createRefund({
      orderId: detailOrder.id,
      orderNo: detailOrder.orderNo,
      reason: reason.trim(),
      method: refundMethod,
      amount: detailOrder.totalPrice
    });
    setShowRefundPopup(false);
    setDetailOrder(null);
    Taro.showToast({ title: '退款申请已提交', icon: 'success' });
    setTimeout(() => {
      const order = ticketOrders.find(o => o.refundId);
      if (order && order.refundId) {
        updateRefund(order.refundId, {
          status: 'processing',
          processTime: new Date().toISOString(),
          remark: '财务审核中...'
        });
      }
    }, 2000);
    setTimeout(() => {
      const order = ticketOrders.find(o => o.refundId);
      if (order && order.refundId) {
        updateRefund(order.refundId, {
          status: 'completed',
          processTime: new Date().toISOString(),
          remark: '退款已原路退回'
        });
        updateTicketOrder(order.id, { invoiceStatus: 'none' });
      }
    }, 5000);
  };

  const handleSimulateProcess = (refundId: string) => {
    updateRefund(refundId, {
      status: 'processing',
      processTime: new Date().toISOString(),
      remark: '财务审核中...'
    });
    setTimeout(() => {
      updateRefund(refundId, {
        status: 'completed',
        processTime: new Date().toISOString(),
        remark: '退款已原路退回'
      });
      const order = ticketOrders.find(o => o.refundId === refundId);
      if (order) updateTicketOrder(order.id, { invoiceStatus: 'none' });
    }, 3000);
  };

  const getInvoiceStatusInfo = (order: TicketOrder) => {
    const status = order.invoiceStatus || 'none';
    return INVOICE_STATUS_MAP[status] || INVOICE_STATUS_MAP.none;
  };

  const renderOrderCard = (order: TicketOrder) => {
    const invoiceInfo = getInvoiceStatusInfo(order);
    const refund = getRefundByOrder(order.id);
    const refundInfo = refund ? REFUND_STATUS_MAP[refund.status] : null;

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
          {refund && refundInfo && (
            <View className={styles.orderInfoRow}>
              <Text className={styles.orderInfoLabel}>退款状态</Text>
              <View className={classnames(styles.refundBadge, refundInfo.className)}>
                <Text>{refundInfo.text}</Text>
              </View>
            </View>
          )}
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
          {order.status === 'used' && !order.hasReview && (
            <View
              className={classnames(styles.actionBtn, styles.actionPrimary)}
              onClick={(e) => { e.stopPropagation(); handleGoReview(order); }}
            >
              <Text>去评价</Text>
            </View>
          )}
          {order.status === 'used' && order.hasReview && (
            <View className={classnames(styles.actionBtn, styles.actionSecondary)}>
              <Text>✓ 已评价</Text>
            </View>
          )}
          {order.status === 'cancelled' && !order.refundId && (
            <View
              className={classnames(styles.actionBtn, styles.actionPrimary)}
              onClick={(e) => { e.stopPropagation(); setDetailOrder(order); setTimeout(() => handleOpenRefund(), 100); }}
            >
              <Text>申请退款</Text>
            </View>
          )}
          {order.status === 'refund' && refund && refund.status === 'pending' && (
            <View
              className={classnames(styles.actionBtn, styles.actionSecondary)}
              onClick={(e) => { e.stopPropagation(); handleSimulateProcess(refund.id); }}
            >
              <Text>模拟处理</Text>
            </View>
          )}
          {order.status === 'refund' && refund && (refund.status === 'completed' || refund.status === 'rejected') && (
            <View className={classnames(styles.actionBtn, styles.actionSecondary)}>
              <Text>{refund.status === 'completed' ? '✓ 退款完成' : '退款已拒绝'}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderRefundPopup = () => {
    if (!showRefundPopup || !detailOrder) return null;
    return (
      <View className={styles.refundPopup} onClick={() => setShowRefundPopup(false)}>
        <View className={styles.refundContent} onClick={(e) => e.stopPropagation()}>
          <View className={styles.refundHeader}>
            <Text className={styles.refundTitle}>申请退款</Text>
            <View className={styles.refundClose} onClick={() => setShowRefundPopup(false)}>
              <Text>✕</Text>
            </View>
          </View>
          <ScrollView scrollY className={styles.refundBody}>
            <View className={styles.refundInfoBox}>
              <Text className={styles.refundInfoLabel}>退款金额</Text>
              <Text className={styles.refundAmount}>¥{detailOrder.totalPrice}</Text>
            </View>
            <View className={styles.refundSection}>
              <Text className={styles.refundSectionTitle}>退款原因</Text>
              {REFUND_REASONS.map(reason => (
                <View
                  key={reason}
                  className={classnames(styles.refundReasonItem, { [styles.active]: refundReason === reason })}
                  onClick={() => setRefundReason(reason)}
                >
                  <Text>{reason}</Text>
                  <Text className={styles.refundRadio}>{refundReason === reason ? '●' : '○'}</Text>
                </View>
              ))}
              {refundReason === '其他原因' && (
                <Input
                  className={styles.refundReasonInput}
                  placeholder="请输入具体原因"
                  value={customReason}
                  onInput={(e) => setCustomReason(e.detail.value)}
                />
              )}
            </View>
            <View className={styles.refundSection}>
              <Text className={styles.refundSectionTitle}>退款方式</Text>
              <View
                className={classnames(styles.refundMethodItem, { [styles.active]: refundMethod === 'original' })}
                onClick={() => setRefundMethod('original')}
              >
                <View>
                  <Text className={styles.refundMethodName}>原路退回</Text>
                  <Text className={styles.refundMethodDesc}>1-3个工作日退回到原支付账户</Text>
                </View>
                <Text className={styles.refundRadio}>{refundMethod === 'original' ? '●' : '○'}</Text>
              </View>
              <View
                className={classnames(styles.refundMethodItem, { [styles.active]: refundMethod === 'balance' })}
                onClick={() => setRefundMethod('balance')}
              >
                <View>
                  <Text className={styles.refundMethodName}>退回余额</Text>
                  <Text className={styles.refundMethodDesc}>即时到账，下次购票可用</Text>
                </View>
                <Text className={styles.refundRadio}>{refundMethod === 'balance' ? '●' : '○'}</Text>
              </View>
            </View>
          </ScrollView>
          <View className={styles.refundFooter}>
            <View
              className={classnames(styles.refundSubmitBtn, { [styles.disabled]: !refundReason })}
              onClick={refundReason ? handleSubmitRefund : undefined}
            >
              <Text>提交申请</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderRefundProgress = (refund: RefundRecord) => {
    const steps = [
      { key: 'apply', label: '提交申请', done: true, time: refund.createTime },
      { key: 'process', label: '处理中', done: refund.status !== 'pending', time: refund.processTime },
      { key: 'complete', label: '退款完成', done: refund.status === 'completed' }
    ];
    if (refund.status === 'rejected') {
      steps[2] = { key: 'reject', label: '已拒绝', done: true, time: refund.processTime };
    }
    return (
      <View className={styles.refundProgress}>
        <Text className={styles.refundProgressTitle}>退款进度</Text>
        {steps.map((step, index) => (
          <View key={step.key} className={styles.refundStep}>
            <View className={classnames(styles.refundStepDot, { [styles.done]: step.done })} />
            <View className={styles.refundStepLine}>
              {index < steps.length - 1 && (
                <View className={classnames(styles.refundStepLineInner, { [styles.done]: step.done })} />
              )}
            </View>
            <View className={styles.refundStepContent}>
              <Text className={classnames(styles.refundStepLabel, { [styles.done]: step.done })}>{step.label}</Text>
              {step.time && <Text className={styles.refundStepTime}>{step.time}</Text>}
              {step.key === 'process' && step.done && refund.remark && (
                <Text className={styles.refundStepRemark}>{refund.remark}</Text>
              )}
              {step.key === 'complete' && step.done && (
                <Text className={styles.refundStepRemark}>退款金额 ¥{refund.amount}</Text>
              )}
            </View>
          </View>
        ))}
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

      {detailOrder && !showRefundPopup && (
        <View className={styles.detailPopup} onClick={handleCloseDetail}>
          <View className={styles.detailContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.detailHeader}>
              <Text className={styles.detailTitle}>订单详情</Text>
              <View className={styles.detailClose} onClick={handleCloseDetail}>
                <Text>✕</Text>
              </View>
            </View>

            <ScrollView scrollY className={styles.detailScroll}>
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
              {detailOrder.refundId && (
                <View className={styles.detailSection}>
                  {(() => {
                    const refund = refundList.find(r => r.id === detailOrder.refundId);
                    return refund ? renderRefundProgress(refund) : null;
                  })()}
                </View>
              )}
            </ScrollView>

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
                  {!detailOrder.hasReview ? (
                    <View
                      className={classnames(styles.detailActionBtn, styles.actionPrimary)}
                      onClick={() => handleGoReview(detailOrder)}
                    >
                      <Text>写评价</Text>
                    </View>
                  ) : (
                    <View className={classnames(styles.detailActionBtn, styles.actionSecondary)}>
                      <Text>✓ 已评价</Text>
                    </View>
                  )}
                </>
              )}
              {detailOrder.status === 'cancelled' && !detailOrder.refundId && (
                <View
                  className={classnames(styles.detailActionBtn, styles.actionPrimary)}
                  onClick={handleOpenRefund}
                >
                  <Text>申请退款</Text>
                </View>
              )}
              {detailOrder.status === 'refund' && detailOrder.refundId && (
                <View className={classnames(styles.detailActionBtn, styles.actionSecondary)}>
                  <Text>退款处理中</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {renderRefundPopup()}
    </View>
  );
};

export default OrderListPage;
