import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface TagProps {
  text: string;
  type?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
  className?: string;
}

const Tag: React.FC<TagProps> = ({ text, type = 'default', size = 'small', className }) => {
  return (
    <View
      className={classnames(
        styles.tag,
        styles[`tag${type.charAt(0).toUpperCase() + type.slice(1)}`],
        styles[`tag${size.charAt(0).toUpperCase() + size.slice(1)}`],
        className
      )}
    >
      <Text className={styles.tagText}>{text}</Text>
    </View>
  );
};

export default Tag;
