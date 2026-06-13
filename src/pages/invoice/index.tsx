import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/app-store';
import { Invoice } from '@/types';
import { formatTime, generateRandomId } from '@/utils';
import styles from './index.module.scss';

const InvoicePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [invoiceType, setInvoiceType] = useState<'personal' | 'company'>('personal');
  const [title, setTitle] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const invoiceList = useAppStore(state => state.invoiceList);
  const addInvoice = useAppStore(state => state.addInvoice);
  const updateInvoice = useAppStore(state => state.updateInvoice);
  const ticketOrders = useAppStore(state => state.ticketOrders);
  const updateTicketOrder = useAppStore(state => state.updateTicketOrder);

  const tabs = ['申请开票', '开票记录'];

  const paidOrders = useMemo(
    () => ticketOrders.filter(o => (o.status === 'paid' || o.status === 'used') && o.invoiceStatus !== 'issued'),
    [ticketOrders]
  );

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  const handleTypeChange = (type: 'personal' | 'company') => {
    setInvoiceType(type);
  };

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const validateForm = (): boolean => {
    if (selectedOrders.length === 0) {
      Taro.showToast({ title: '请选择需要开票的订单', icon: 'none' });
      return false;
    }
    if (!title.trim()) {
      Taro.showToast({ title: '请输入发票抬头', icon: 'none' });
      return false;
    }
    if (invoiceType === 'company' && !taxNumber.trim()) {
      Taro.showToast({ title: '请输入税号', icon: 'none' });
      return false;
    }
    if (invoiceType === 'company' && taxNumber.trim().length < 15) {
      Taro.showToast({ title: '税号格式不正确', icon: 'none' });
      return false;
    }
    if (!email.trim()) {
      Taro.showToast({ title: '请输入邮箱', icon: 'none' });
      return false;
    }
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email.trim())) {
      Taro.showToast({ title: '邮箱格式不正确', icon: 'none' });
      return false;
    }
    if (!contact.trim()) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' });
      return false;
    }
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(contact.trim())) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setSubmitting(true);
    Taro.showLoading({ title: '提交中...' });

    setTimeout(() => {
      const amount = ticketOrders
        .filter(o => selectedOrders.includes(o.id))
        .reduce((sum, o) => sum + o.totalPrice, 0);

      const newInvoice: Invoice = {
        id: generateRandomId('INV'),
        type: invoiceType,
        title: title.trim(),
        taxNumber: taxNumber.trim(),
        email: email.trim(),
        contact: contact.trim(),
        orderIds: [...selectedOrders],
        amount,
        status: 'pending',
        createTime: formatTime(new Date())
      };

      addInvoice(newInvoice);

      selectedOrders.forEach(orderId => {
        updateTicketOrder(orderId, { invoiceStatus: 'pending' });
      });

      Taro.hideLoading();
      Taro.showToast({ title: '申请已提交', icon: 'success' });

      setTitle('');
      setTaxNumber('');
      setEmail('');
      setContact('');
      setSelectedOrders([]);
      setActiveTab(1);
      setSubmitting(false);
    }, 800);
  };

  const handleResendEmail = (invoice: Invoice) => {
    Taro.showLoading({ title: '发送中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: `已重新发送至 ${invoice.email}`, icon: 'success' });
    }, 600);
  };

  const handleViewDetail = (invoice: Invoice) => {
    const orderCount = invoice.orderIds ? invoice.orderIds.length : 1;
    const relatedOrders = invoice.orderIds
      ? ticketOrders.filter(o => invoice.orderIds!.includes(o.id))
      : [];
    const orderInfo = relatedOrders.length > 0
      ? relatedOrders.map(o => `${o.ticketName} ¥${o.totalPrice}`).join('\n')
      : `${orderCount}个订单`;

    Taro.showModal({
      title: invoice.title,
      content: `类型：${invoice.type === 'personal' ? '个人' : '企业'}
${invoice.taxNumber ? `税号：${invoice.taxNumber}\n` : ''}金额：¥${invoice.amount}
邮箱：${invoice.email}
${invoice.contact ? `联系电话：${invoice.contact}\n` : ''}关联订单：
${orderInfo}
申请时间：${invoice.createTime}
状态：${invoice.status === 'issued' ? '已开具' : '开具中'}`,
      showCancel: false,
      confirmText: '知道了'
    });
  };

  const handleSimulateIssued = (invoiceId: string) => {
    updateInvoice(invoiceId, { status: 'issued' });
    const invoice = invoiceList.find(i => i.id === invoiceId);
    if (invoice && invoice.orderIds) {
      invoice.orderIds.forEach(orderId => {
        updateTicketOrder(orderId, { invoiceStatus: 'issued' });
      });
    }
    Taro.showToast({ title: '发票已开具', icon: 'success' });
  };

  const totalAmount = ticketOrders
    .filter(o => selectedOrders.includes(o.id))
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const getOrderInvoiceStatus = (orderId: string) => {
    const order = ticketOrders.find(o => o.id === orderId);
    return order?.invoiceStatus || 'none';
  };

  const renderApplyForm = () => (
    <ScrollView scrollY>
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>发票类型</Text>
        <View className={styles.typeSelector}>
          <View
            className={classnames(styles.typeOption, { [styles.active]: invoiceType === 'personal' })}
            onClick={() => handleTypeChange('personal')}
          >
            <Text className={styles.typeIcon}>👤</Text>
            <Text className={styles.typeName}>个人发票</Text>
          </View>
          <View
            className={classnames(styles.typeOption, { [styles.active]: invoiceType === 'company' })}
            onClick={() => handleTypeChange('company')}
          >
            <Text className={styles.typeIcon}>🏢</Text>
            <Text className={styles.typeName}>企业发票</Text>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>发票抬头 <Text style={{ color: '#ef4444' }}>*</Text></Text>
          <Input
            className={styles.formInputReal}
            placeholder={invoiceType === 'personal' ? '请输入个人姓名' : '请输入公司名称'}
            placeholderClass={styles.formInputPlaceholder}
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={invoiceType === 'personal' ? 20 : 50}
          />
        </View>

        {invoiceType === 'company' && (
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>税号 <Text style={{ color: '#ef4444' }}>*</Text></Text>
            <Input
              className={styles.formInputReal}
              placeholder="请输入纳税人识别号（15-20位）"
              placeholderClass={styles.formInputPlaceholder}
              value={taxNumber}
              onInput={(e) => setTaxNumber(e.detail.value)}
              maxlength={20}
            />
          </View>
        )}

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>接收邮箱 <Text style={{ color: '#ef4444' }}>*</Text></Text>
          <Input
            className={styles.formInputReal}
            placeholder="请输入邮箱地址，用于接收电子发票"
            placeholderClass={styles.formInputPlaceholder}
            value={email}
            onInput={(e) => setEmail(e.detail.value)}
            maxlength={50}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>联系电话 <Text style={{ color: '#ef4444' }}>*</Text></Text>
          <Input
            className={styles.formInputReal}
            type="number"
            placeholder="请输入手机号"
            placeholderClass={styles.formInputPlaceholder}
            value={contact}
            onInput={(e) => setContact(e.detail.value)}
            maxlength={11}
          />
        </View>
      </View>

      <View className={styles.orderSelector}>
        <Text className={styles.sectionTitle}>
          选择可开票订单（已选{selectedOrders.length}个，合计¥{totalAmount}）
        </Text>
        {paidOrders.length > 0 ? paidOrders.map(order => {
          const invStatus = getOrderInvoiceStatus(order.id);
          return (
            <View
              key={order.id}
              className={styles.orderItem}
              onClick={() => invStatus !== 'issued' && handleOrderSelect(order.id)}
            >
              <View
                className={classnames(styles.orderCheck, {
                  [styles.active]: selectedOrders.includes(order.id),
                  [styles.disabled]: invStatus === 'issued'
                })}
              >
                {selectedOrders.includes(order.id) && <Text>✓</Text>}
              </View>
              <View className={styles.orderInfo}>
                <Text className={styles.orderName}>{order.spotName} - {order.ticketName}</Text>
                <Text className={styles.orderMeta}>{order.date} {order.timeSlot} · {order.quantity}张</Text>
                {invStatus !== 'none' && (
                  <Text className={classnames(styles.orderInvoiceStatus, {
                    [styles.invoicePending]: invStatus === 'pending',
                    [styles.invoiceIssued]: invStatus === 'issued'
                  })}>
                    {invStatus === 'pending' ? '开票中' : '已开票'}
                  </Text>
                )}
              </View>
              <Text className={styles.orderAmount}>¥{order.totalPrice}</Text>
            </View>
          );
        }) : (
          <View className={styles.emptyOrders}>
            <Text className={styles.emptyOrdersIcon}>🎫</Text>
            <Text className={styles.emptyOrdersText}>暂无可开票订单</Text>
          </View>
        )}
        <View
          className={classnames(styles.submitButton, { [styles.submitDisabled]: submitting || paidOrders.length === 0 || selectedOrders.length === 0 })}
          onClick={!submitting && paidOrders.length > 0 && selectedOrders.length > 0 ? handleSubmit : undefined}
        >
          <Text>{submitting ? '提交中...' : '申请开票'}</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderInvoiceList = () => (
    <ScrollView scrollY>
      <View className={styles.invoiceList}>
        {invoiceList.length > 0 ? invoiceList.map(invoice => (
          <View key={invoice.id} className={styles.invoiceItem}>
            <View className={styles.invoiceHeader}>
              <Text className={styles.invoiceTitle}>{invoice.title}</Text>
              <View
                className={classnames(
                  styles.invoiceStatus,
                  invoice.status === 'issued' ? styles.statusIssued : styles.statusPending
                )}
              >
                <Text>{invoice.status === 'issued' ? '已开具' : '开具中'}</Text>
              </View>
            </View>
            <View className={styles.invoiceInfo}>
              <View className={styles.invoiceInfoItem}>
                <Text className={styles.invoiceInfoLabel}>发票类型</Text>
                <Text>{invoice.type === 'personal' ? '个人' : '企业'}</Text>
              </View>
              <View className={styles.invoiceInfoItem}>
                <Text className={styles.invoiceInfoLabel}>发票金额</Text>
                <Text style={{ color: '#ef4444', fontWeight: 500 }}>¥{invoice.amount}</Text>
              </View>
              <View className={styles.invoiceInfoItem}>
                <Text className={styles.invoiceInfoLabel}>接收邮箱</Text>
                <Text>{invoice.email}</Text>
              </View>
              <View className={styles.invoiceInfoItem}>
                <Text className={styles.invoiceInfoLabel}>关联订单</Text>
                <Text>{invoice.orderIds ? invoice.orderIds.length : 1}个</Text>
              </View>
              <View className={styles.invoiceInfoItem}>
                <Text className={styles.invoiceInfoLabel}>申请时间</Text>
                <Text>{invoice.createTime}</Text>
              </View>
            </View>
            <View className={styles.invoiceActions}>
              <View
                className={classnames(styles.actionBtn, styles.actionBtnSecondary)}
                onClick={() => handleViewDetail(invoice)}
              >
                <Text>查看详情</Text>
              </View>
              {invoice.status === 'issued' && (
                <View
                  className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
                  onClick={() => handleResendEmail(invoice)}
                >
                  <Text>重发邮件</Text>
                </View>
              )}
              {invoice.status === 'pending' && (
                <View
                  className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
                  onClick={() => handleSimulateIssued(invoice.id)}
                >
                  <Text>模拟开票</Text>
                </View>
              )}
            </View>
          </View>
        )) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🧾</Text>
            <Text className={styles.emptyText}>暂无开票记录</Text>
            <View
              className={styles.emptyAction}
              onClick={() => setActiveTab(0)}
            >
              <Text>去开票</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <View className={styles.invoicePage}>
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

      <View className={styles.content}>
        {activeTab === 0 && renderApplyForm()}
        {activeTab === 1 && renderInvoiceList()}
      </View>
    </View>
  );
};

export default InvoicePage;
