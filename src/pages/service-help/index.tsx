import React, { useState } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/app-store';
import { getServiceStatusText, getServiceTypeText, formatTime, generateRandomId } from '@/utils';
import { ServiceHelpItem } from '@/types';
import styles from './index.module.scss';

const ServiceHelpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedType, setSelectedType] = useState('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const serviceHelpList = useAppStore(state => state.serviceHelpList);
  const addServiceHelp = useAppStore(state => state.addServiceHelp);

  const tabs = ['提交求助', '我的求助'];

  const serviceTypes = [
    { id: 'lost', name: '失物招领', icon: '🔍', color: '#f59e0b' },
    { id: 'consult', name: '咨询建议', icon: '💬', color: '#3b82f6' },
    { id: 'emergency', name: '紧急求助', icon: '🚨', color: '#ef4444' }
  ];

  const handleTabChange = (index: number) => {
    console.log('[ServiceHelp] 切换Tab:', tabs[index]);
    setActiveTab(index);
  };

  const handleTypeSelect = (typeId: string) => {
    console.log('[ServiceHelp] 选择类型:', typeId);
    setSelectedType(typeId);
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' });
      return false;
    }
    if (title.trim().length < 2) {
      Taro.showToast({ title: '标题至少2个字符', icon: 'none' });
      return false;
    }
    if (!description.trim()) {
      Taro.showToast({ title: '请输入详细描述', icon: 'none' });
      return false;
    }
    if (description.trim().length < 5) {
      Taro.showToast({ title: '描述至少5个字符', icon: 'none' });
      return false;
    }
    if (!contact.trim()) {
      Taro.showToast({ title: '请输入联系方式', icon: 'none' });
      return false;
    }
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(contact.trim())) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return false;
    }
    if (email.trim()) {
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailReg.test(email.trim())) {
        Taro.showToast({ title: '请输入正确的邮箱', icon: 'none' });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    console.log('[ServiceHelp] 提交求助');
    if (!validateForm()) return;

    setSubmitting(true);
    Taro.showLoading({ title: '提交中...' });

    setTimeout(() => {
      const newItem: ServiceHelpItem = {
        id: generateRandomId(),
        type: selectedType as ServiceHelpItem['type'],
        title: title.trim(),
        description: description.trim(),
        contact: contact.trim(),
        email: email.trim(),
        status: 'pending',
        createTime: formatTime(new Date())
      };

      addServiceHelp(newItem);
      console.log('[ServiceHelp] 提交成功:', newItem);

      Taro.hideLoading();
      Taro.showToast({ title: '提交成功', icon: 'success' });

      setTitle('');
      setDescription('');
      setContact('');
      setEmail('');
      setActiveTab(1);
      setSubmitting(false);
    }, 800);
  };

  const handleItemClick = (item: ServiceHelpItem) => {
    console.log('[ServiceHelp] 查看求助详情:', item.title);
    const contactInfo = [
      item.contact ? `联系方式：${item.contact}` : '',
      item.email ? `邮箱：${item.email}` : ''
    ].filter(Boolean).join('\n');
    Taro.showModal({
      title: item.title,
      content: `${item.description}${contactInfo ? `\n\n${contactInfo}` : ''}\n\n状态：${getServiceStatusText(item.status)}\n提交时间：${item.createTime}`,
      showCancel: false,
      confirmText: '知道了'
    });
  };

  const renderSubmitForm = () => (
    <View>
      <View className={styles.formSection}>
        <Text className={styles.formTitle}>选择类型</Text>
        <View className={styles.serviceTypes}>
          {serviceTypes.map(type => (
            <View
              key={type.id}
              className={classnames(styles.serviceTypeItem, {
                [styles.active]: selectedType === type.id
              })}
              onClick={() => handleTypeSelect(type.id)}
            >
              <View
                className={styles.serviceTypeIcon}
                style={{ backgroundColor: type.color + '20' }}
              >
                <Text>{type.icon}</Text>
              </View>
              <Text className={styles.serviceTypeName}>{type.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.formTitle}>填写信息</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>标题 <Text style={{ color: '#ef4444' }}>*</Text></Text>
          <Input
            className={styles.formInputReal}
            placeholder="请输入标题（如：丢失黑色钱包）"
            placeholderClass={styles.formPlaceholder}
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={30}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>详细描述 <Text style={{ color: '#ef4444' }}>*</Text></Text>
          <Textarea
            className={styles.formTextareaReal}
            placeholder="请详细描述您遇到的问题、地点、特征等信息..."
            placeholderClass={styles.formPlaceholder}
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={500}
            autoHeight
          />
          <Text className={styles.textareaCount}>{description.length}/500</Text>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>联系方式 <Text style={{ color: '#ef4444' }}>*</Text></Text>
          <Input
            className={styles.formInputReal}
            type="number"
            placeholder="请输入手机号，方便我们联系您"
            placeholderClass={styles.formPlaceholder}
            value={contact}
            onInput={(e) => setContact(e.detail.value)}
            maxlength={11}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>邮箱</Text>
          <Input
            className={styles.formInputReal}
            placeholder="请输入邮箱（可选）"
            placeholderClass={styles.formPlaceholder}
            value={email}
            onInput={(e) => setEmail(e.detail.value)}
            maxlength={50}
          />
        </View>
      </View>

      <View
        className={classnames(styles.submitButton, { [styles.submitDisabled]: submitting })}
        onClick={!submitting ? handleSubmit : undefined}
      >
        <Text>{submitting ? '提交中...' : '提交求助'}</Text>
      </View>
    </View>
  );

  const renderHelpList = () => (
    <View className={styles.listSection}>
      <Text className={styles.listTitle}>我的求助 ({serviceHelpList.length})</Text>
      {serviceHelpList.length > 0 ? (
        serviceHelpList.map(item => (
          <View
            key={item.id}
            className={styles.helpItem}
            onClick={() => handleItemClick(item)}
          >
            <View className={styles.helpHeader}>
              <Text className={styles.helpTitle}>{item.title}</Text>
              <View
                className={classnames(
                  styles.helpStatus,
                  styles[`status${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`]
                )}
              >
                <Text>{getServiceStatusText(item.status)}</Text>
              </View>
            </View>
            <Text className={styles.helpDesc}>{item.description}</Text>
            <Text className={styles.helpTime}>
              {getServiceTypeText(item.type)} · {item.createTime}
            </Text>
          </View>
        ))
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>暂无求助记录</Text>
          <View
            className={styles.emptyAction}
            onClick={() => setActiveTab(0)}
          >
            <Text>去提交</Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View className={styles.serviceHelpPage}>
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

      <ScrollView className={styles.content} scrollY enhanced showScrollbar={false}>
        {activeTab === 0 && renderSubmitForm()}
        {activeTab === 1 && renderHelpList()}
      </ScrollView>
    </View>
  );
};

export default ServiceHelpPage;
