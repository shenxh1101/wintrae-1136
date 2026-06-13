import { TicketType, TicketOrder, TimeSlot } from '@/types';

export const timeSlots: TimeSlot[] = [
  { id: '1', time: '08:00-10:00', remaining: 128, total: 200 },
  { id: '2', time: '10:00-12:00', remaining: 85, total: 200 },
  { id: '3', time: '12:00-14:00', remaining: 156, total: 200 },
  { id: '4', time: '14:00-16:00', remaining: 92, total: 200 },
  { id: '5', time: '16:00-18:00', remaining: 180, total: 200 }
];

export const ticketTypes: TicketType[] = [
  {
    id: '1',
    name: '成人票',
    price: 80,
    originalPrice: 100,
    description: '适用于18-60岁成人，包含景区大门票',
    remaining: 256,
    total: 500,
    timeSlots: timeSlots
  },
  {
    id: '2',
    name: '儿童票',
    price: 40,
    originalPrice: 50,
    description: '适用于1.2-1.5米儿童，包含景区大门票',
    remaining: 180,
    total: 300,
    timeSlots: timeSlots
  },
  {
    id: '3',
    name: '老人票',
    price: 50,
    originalPrice: 60,
    description: '适用于60岁以上老人，凭有效证件入园',
    remaining: 120,
    total: 200,
    timeSlots: timeSlots
  },
  {
    id: '4',
    name: '亲子套票',
    price: 120,
    originalPrice: 150,
    description: '含1大1小门票，赠送儿童纪念品',
    remaining: 68,
    total: 100,
    timeSlots: timeSlots
  },
  {
    id: '5',
    name: 'VIP票',
    price: 198,
    originalPrice: 268,
    description: '含门票+观光车+专业讲解+优先通道',
    remaining: 32,
    total: 50,
    timeSlots: timeSlots
  }
];

export const ticketOrders: TicketOrder[] = [
  {
    id: 'ORD20240115001',
    spotName: '翠湖公园',
    ticketName: '成人票',
    date: '2024-01-20',
    timeSlot: '10:00-12:00',
    quantity: 2,
    totalPrice: 160,
    status: 'paid',
    qrCode: 'QR20240115001ABC',
    createTime: '2024-01-15 14:30:25'
  },
  {
    id: 'ORD20240110002',
    spotName: '南山风景区',
    ticketName: '亲子套票',
    date: '2024-01-12',
    timeSlot: '08:00-10:00',
    quantity: 1,
    totalPrice: 120,
    status: 'used',
    qrCode: 'QR20240110002DEF',
    createTime: '2024-01-10 09:15:42'
  },
  {
    id: 'ORD20240108003',
    spotName: '科技馆',
    ticketName: '成人票',
    date: '2024-01-08',
    timeSlot: '14:00-16:00',
    quantity: 3,
    totalPrice: 240,
    status: 'cancelled',
    createTime: '2024-01-05 16:45:33'
  }
];

export const getTicketById = (id: string): TicketType | undefined => {
  return ticketTypes.find(ticket => ticket.id === id);
};

export const getOrdersByStatus = (status?: string): TicketOrder[] => {
  if (!status) return ticketOrders;
  return ticketOrders.filter(order => order.status === status);
};
