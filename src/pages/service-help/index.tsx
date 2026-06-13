import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { serviceHelpList } from '@/data/service';
import { getServiceStatusText, getServiceTypeText } from '@/utils';
import styles from './index.module.scss';

const ServiceHelpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedType, setSelectedType] = useState('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');

  const tabs = ['提交求助',
   '我的求助'];

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

  const handleSubmit = () => {
    console.log('[ServiceHelp] 提交求助');
    if (!title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!description.trim()) {
      Taro.showToast({ title: '请输入详细描述', icon: 'none' });
      return;
    }
    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '提交成功', icon: 'success' });
      setTitle('');
      setDescription('');
      setContact('');
      setActiveTab(1);
    }, 1000);
  };

  const handleItemClick = (item: typeof serviceHelpList[0]) => {
    console.log('[ServiceHelp] 查看求助详情:', item.title);
    Taro.showToast({ title: '查看详情功能开发中', icon: 'none' });
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
          <Text className={styles.formLabel}>标题</Text>
          <View className={styles.formInput}>
            <Text className={title ? '' : styles.formPlaceholder}>
              {title || '请输入标题'}
            </Text>
          </View>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>详细描述</Text>
          <View className={styles.formTextarea}>
            <Text className={description ? '' : styles.formPlaceholder}>
              {description || '请详细描述您遇到的问题...'}
            </Text>
          </View>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>联系方式</Text>
          <View className={styles.formInput}>
            <Text className={contact ? '' : styles.formPlaceholder}>
              {contact || '请输入手机号，方便我们联系您'}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.submitButton} onClick={handleSubmit}>
        <Text>提交求助</Text>
      </View>
    </View>
  );

  const renderHelpList = () => (
    <View className={styles.listSection}>
      <Text className={styles.listTitle}>我的求助</Text>
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

      <ScrollView className={styles.content} scrollY>
        {activeTab === 0 && renderSubmitForm()}
        {activeTab === 1 && renderHelpList()}
      </ScrollView>
    </View>
  );
};

export default ServiceHelpPage;
