import { ServiceHelpItem, Invoice, Review, Facility } from '@/types';

export const serviceHelpList: ServiceHelpItem[] = [
  {
    id: '1',
    type: 'lost',
    title: '丢失黑色钱包',
    description: '在翠湖公园附近丢失黑色皮质钱包，内有身份证和银行卡',
    status: 'processing',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: '2',
    type: 'consult',
    title: '咨询门票优惠政策',
    description: '想了解学生票和团体票的优惠政策',
    status: 'resolved',
    createTime: '2024-01-12 14:20:00'
  }
];

export const invoiceList: Invoice[] = [
  {
    id: 'INV001',
    orderId: 'ORD20240110002',
    title: '个人',
    amount: 120,
    status: 'issued',
    createTime: '2024-01-13 09:00:00',
    type: 'personal'
  }
];

export const reviewList: Review[] = [
  {
    id: '1',
    spotId: '1',
    spotName: '翠湖公园',
    rating: 5,
    content: '非常漂亮的公园，湖水很清澈，散步很舒服。推荐大家去看看，特别是春天花开的时候特别美。',
    images: [],
    createTime: '2024-01-10 15:30:00',
    userName: '旅行者小王'
  },
  {
    id: '2',
    spotId: '1',
    spotName: '翠湖公园',
    rating: 4,
    content: '环境不错，人有点多，但总体体验很好。',
    images: [],
    createTime: '2024-01-08 11:20:00',
    userName: '爱旅行的猫'
  }
];

export const facilities: Facility[] = [
  { id: 'f1', type: 'toilet', name: '东门卫生间', distance: '150米', position: { x: 350, y: 380 } },
  { id: 'f2', type: 'toilet', name: '西门卫生间', distance: '300米', position: { x: 200, y: 450 } },
  { id: 'f3', type: 'restaurant', name: '湖畔餐厅', distance: '200米', position: { x: 280, y: 420 } },
  { id: 'f4', type: 'restaurant', name: '观景茶社', distance: '400米', position: { x: 450, y: 280 } },
  { id: 'f5', type: 'rest', name: '休息亭', distance: '100米', position: { x: 320, y: 400 } },
  { id: 'f6', type: 'shop', name: '纪念品商店', distance: '250米', position: { x: 380, y: 350 } },
  { id: 'f7', type: 'toilet', name: '南门卫生间', distance: '500米', position: { x: 500, y: 550 } },
  { id: 'f8', type: 'restaurant', name: '美食广场', distance: '600米', position: { x: 150, y: 550 } }
];

export const getFacilitiesByType = (type: string): Facility[] => {
  if (type === 'all') return facilities;
  return facilities.filter(f => f.type === type);
};
