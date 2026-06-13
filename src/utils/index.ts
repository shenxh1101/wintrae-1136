export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getQueueLevelText = (level: 'low' | 'medium' | 'high'): string => {
  const map = {
    low: '畅通',
    medium: '适中',
    high: '拥挤'
  };
  return map[level] || '未知';
};

export const getQueueLevelColor = (level: 'low' | 'medium' | 'high'): string => {
  const map = {
    low: '#00B42A',
    medium: '#FF7D00',
    high: '#F53F3F'
  };
  return map[level] || '#86909C';
};

export const getOrderStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待支付',
    paid: '待使用',
    used: '已使用',
    cancelled: '已取消'
  };
  return map[status] || status;
};

export const getOrderStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    pending: '#FF7D00',
    paid: '#2563EB',
    used: '#00B42A',
    cancelled: '#86909C'
  };
  return map[status] || '#86909C';
};

export const getServiceStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决'
  };
  return map[status] || status;
};

export const getServiceTypeText = (type: string): string => {
  const map: Record<string, string> = {
    lost: '失物招领',
    consult: '咨询建议',
    emergency: '紧急求助'
  };
  return map[type] || type;
};

export const getFacilityTypeText = (type: string): string => {
  const map: Record<string, string> = {
    toilet: '卫生间',
    restaurant: '餐饮',
    rest: '休息区',
    shop: '商店'
  };
  return map[type] || type;
};

export const generateRandomId = (prefix?: string): string => {
  const random = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
  return prefix ? `${prefix}${Date.now().toString().slice(-6)}${random}` : random;
};
