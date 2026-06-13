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
  const ticketOrders = useAppStore(state => state.ticketOrders);

  const tabs = ['申请开票', '开票记录'];

  const paidOrders = useMemo(
    () => ticketOrders.filter(o => o.status === 'paid' || o.status === 'used'),
    [ticketOrders]
  );

  const handleTabChange = (index: number) => {
    console.log('[Invoice] 切换Tab:', tabs[index]);
    setActiveTab(index);
  };

  const handleTypeChange = (type: 'personal' | 'company') => {
    console.log('[Invoice] 切换发票类型:', type);
    setInvoiceType(type);
  };

  const handleOrderSelect = (orderId: string) => {
    console.log('[Invoice] 选择订单:', orderId);
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
    console.log('[Invoice] 提交开票申请');
    if (!validateForm()) return;

    setSubmitting(true);
    Taro.showLoading({ title: '提交中...' });

    setTimeout(() => {
      const amount = paidOrders
        .filter(o => selectedOrders.includes(o.id))
        .reduce((sum, o) => sum + o.totalPrice, 0);

      const newInvoice: Invoice = {
        id: generateRandomId(),
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
      console.log('[Invoice] 提交成功:', newInvoice);

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

  const handleDownload = (invoiceId: string) => {
    console.log('[Invoice] 下载发票:', invoiceId);
    Taro.showToast({ title: '发票已发送到邮箱', icon: 'success' });
  };

  const handleViewDetail = (invoice: Invoice) => {
    console.log('[Invoice] 查看发票详情:', invoice.id);
    const orderCount = invoice.orderIds ? invoice.orderIds.length : 1;
    Taro.showModal({
      title: invoice.title,
      content: `类型：${invoice.type === 'personal' ? '个人' : '企业'}
金额：¥${invoice.amount}
邮箱：${invoice.email}
关联订单：${orderCount}个
申请时间：${invoice.createTime}
状态：${invoice.status === 'issued' ? '已开具' : '开具中'}`,
      showCancel: false,
      confirmText: '知道了'
    });
  };

  const totalAmount = paidOrders
    .filter(o => selectedOrders.includes(o.id))
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const renderApplyForm = () => (
    <ScrollView scrollY>
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>发票类型</Text>
        <View className={styles.typeSelector}>
          <View
            className={classnames(styles.typeOption, {
              [styles.active]: invoiceType === 'personal'
            })}
            onClick={() => handleTypeChange('personal')}
          >
            <Text className={styles.typeIcon}>👤</Text>
            <Text className={styles.typeName}>个人发票</Text>
          </View>
          <View
            className={classnames(styles.typeOption, {
              [styles.active]: invoiceType === 'company'
            })}
            onClick={() => handleTypeChange('company')}
          >
            <Text className={styles.typeIcon}>🏢</Text>
            <Text className={styles.typeName}>企业发票</Text>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            发票抬头 <Text style={{ color: '#ef4444' }}>*</Text>
          </Text>
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
          选择订单（已选{selectedOrders.length}个，合计¥{totalAmount}）
        </Text>
        {paidOrders.length > 0 ? paidOrders.map(order => (
          <View
            key={order.id}
            className={styles.orderItem}
            onClick={() => handleOrderSelect(order.id)}
          >
            <View
              className={classnames(styles.orderCheck, {
                [styles.active]: selectedOrders.includes(order.id)
              })}
            >
              {selectedOrders.includes(order.id) && <Text>✓</Text>}
            </View>
            <View className={styles.orderInfo}>
              <Text className={styles.orderName}>{order.spotName} - {order.ticketName}</Text>
              <Text className={styles.orderMeta}>{order.date} {order.timeSlot} · {order.quantity}张</Text>
            </View>
            <Text className={styles.orderAmount}>¥{order.totalPrice}</Text>
          </View>
        )) : (
          <View className={styles.emptyOrders}>
            <Text className={styles.emptyOrdersIcon}>🎫</Text>
            <Text className={styles.emptyOrdersText}>暂无可开票订单</Text>
          </View>
        )}
        <View
          className={classnames(styles.submitButton, { [styles.submitDisabled]: submitting || paidOrders.length === 0 })}
          onClick={!submitting && paidOrders.length > 0 ? handleSubmit : undefined}
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
                  onClick={() => handleDownload(invoice.id)}
                >
                  <Text>下载发票</Text>
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
            className={classnames(styles.tabItem, {
              [styles.active]: activeTab === index
            })}
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
