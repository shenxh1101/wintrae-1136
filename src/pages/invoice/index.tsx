import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { invoiceList } from '@/data/service';
import { ticketOrders } from '@/data/tickets';
import styles from './index.module.scss';

const InvoicePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [invoiceType, setInvoiceType] = useState<'personal' | 'company'>('personal');
  const [title, setTitle] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [email, setEmail] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const tabs = ['申请开票', '开票记录'];

  const paidOrders = ticketOrders.filter(o => o.status === 'paid' || o.status === 'used');

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

  const handleSubmit = () => {
    console.log('[Invoice] 提交开票申请');
    if (selectedOrders.length === 0) {
      Taro.showToast({ title: '请选择需要开票的订单', icon: 'none' });
      return;
    }
    if (!title.trim()) {
      Taro.showToast({ title: '请输入发票抬头', icon: 'none' });
      return;
    }
    if (invoiceType === 'company' && !taxNumber.trim()) {
      Taro.showToast({ title: '请输入税号', icon: 'none' });
      return;
    }
    if (!email.trim()) {
      Taro.showToast({ title: '请输入邮箱', icon: 'none' });
      return;
    }
    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '申请已提交', icon: 'success' });
      setSelectedOrders([]);
      setActiveTab(1);
    }, 1000);
  };

  const handleDownload = (invoiceId: string) => {
    console.log('[Invoice] 下载发票:', invoiceId);
    Taro.showToast({ title: '发票已发送到邮箱', icon: 'success' });
  };

  const handleViewDetail = (invoiceId: string) => {
    console.log('[Invoice] 查看发票详情:', invoiceId);
    Taro.showToast({ title: '查看详情功能开发中', icon: 'none' });
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
            发票抬头
          </Text>
          <View className={styles.formInput}>
            <Text className={title ? '' : styles.formInputPlaceholder}>
              {title || (invoiceType === 'personal' ? '请输入个人姓名' : '请输入公司名称')}
            </Text>
          </View>
        </View>

        {invoiceType === 'company' && (
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>税号</Text>
            <View className={styles.formInput}>
              <Text className={taxNumber ? '' : styles.formInputPlaceholder}>
                {taxNumber || '请输入纳税人识别号'}
              </Text>
            </View>
          </View>
        )}

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>接收邮箱</Text>
          <View className={styles.formInput}>
            <Text className={email ? '' : styles.formInputPlaceholder}>
              {email || '请输入邮箱地址，用于接收电子发票'}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.orderSelector}>
        <Text className={styles.sectionTitle}>
          选择订单（已选{selectedOrders.length}个，合计¥{totalAmount}）
        </Text>
        {paidOrders.map(order => (
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
        ))}
        <View className={styles.submitButton} onClick={handleSubmit}>
          <Text>申请开票</Text>
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
                <Text className={styles.invoiceInfoLabel}>发票金额</Text>
                <Text>¥{invoice.amount}</Text>
              </View>
              <View className={styles.invoiceInfoItem}>
                <Text className={styles.invoiceInfoLabel}>关联订单</Text>
                <Text>{invoice.orderId}</Text>
              </View>
              <View className={styles.invoiceInfoItem}>
                <Text className={styles.invoiceInfoLabel}>申请时间</Text>
                <Text>{invoice.createTime}</Text>
              </View>
            </View>
            {invoice.status === 'issued' && (
              <View className={styles.invoiceActions}>
                <View
                  className={styles.actionBtn + ' ' + styles.actionBtnSecondary}
                  onClick={() => handleViewDetail(invoice.id)}
                >
                  <Text>查看详情</Text>
                </View>
                <View
                  className={styles.actionBtn + ' ' + styles.actionBtnPrimary}
                  onClick={() => handleDownload(invoice.id)}
                >
                  <Text>下载发票</Text>
                </View>
              </View>
            )}
          </View>
        )) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🧾</Text>
            <Text className={styles.emptyText}>暂无开票记录</Text>
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
