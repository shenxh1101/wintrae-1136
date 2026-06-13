export interface Spot {
  id: string;
  name: string;
  description: string;
  image: string;
  openTime: string;
  closeTime: string;
  duration: string;
  rating: number;
  reviewCount: number;
  address: string;
  tags: string[];
  isFavorite: boolean;
  queueLevel: 'low' | 'medium' | 'high';
  queueTime: number;
  hasAudio: boolean;
  position: {
    x: number;
    y: number;
  };
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  remaining: number;
  total: number;
  image?: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  time: string;
  remaining: number;
  total: number;
}

export interface TicketOrder {
  id: string;
  orderNo?: string;
  spotId?: string;
  spotName: string;
  ticketId?: string;
  ticketName: string;
  date: string;
  timeSlot: string;
  timeSlotId?: string;
  quantity: number;
  price?: number;
  totalPrice: number;
  contactName?: string;
  contactPhone?: string;
  contactIdCard?: string;
  status: 'pending' | 'paid' | 'used' | 'cancelled' | 'refund';
  invoiceStatus?: 'none' | 'pending' | 'issued';
  qrCode?: string;
  createTime: string;
  hasReview?: boolean;
  refundId?: string;
}

export interface RefundRecord {
  id: string;
  orderId: string;
  orderNo?: string;
  reason: string;
  method: 'original' | 'balance';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createTime: string;
  processTime?: string;
  remark?: string;
}

export interface TourSpotRecord {
  spotId: string;
  spotName: string;
  arriveTime: string;
  leaveTime?: string;
  dwellMs?: number;
}

export interface TourHistory {
  id: string;
  routeId: string;
  routeName: string;
  startTime: string;
  endTime: string;
  totalMs: number;
  spots: TourSpotRecord[];
  completedCount: number;
  totalCount: number;
}

export interface MessageItem {
  id: string;
  type: 'refund' | 'invoice' | 'review' | 'tour';
  title: string;
  desc: string;
  time: string;
  read: boolean;
  targetId: string;
  targetPath: string;
}

export interface ItineraryItem {
  id: string;
  spotId: string;
  spotName: string;
  image: string;
  duration: string;
  startTime: string;
  endTime: string;
  order: number;
}

export interface Itinerary {
  id: string;
  title: string;
  type: 'half-day' | 'one-day';
  description: string;
  spots: ItineraryItem[];
  totalDuration: string;
  distance: string;
}

export interface Facility {
  id: string;
  type: 'toilet' | 'restaurant' | 'rest' | 'shop';
  name: string;
  distance: string;
  position: {
    x: number;
    y: number;
  };
}

export interface RouteType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface ServiceHelpItem {
  id: string;
  type: 'lost' | 'consult' | 'emergency';
  title: string;
  description: string;
  contact?: string;
  email?: string;
  status: 'pending' | 'processing' | 'resolved';
  createTime: string;
}

export interface Review {
  id: string;
  spotId: string;
  spotName: string;
  rating: number;
  subRatings?: {
    environment: number;
    service: number;
    value: number;
  };
  content: string;
  images: string[];
  tags?: string[];
  contact?: string;
  isAnonymous?: boolean;
  userAvatar?: string;
  createTime: string;
  userName: string;
  title?: string;
  email?: string;
  orderId?: string;
}

export interface Invoice {
  id: string;
  orderId?: string;
  orderIds?: string[];
  title: string;
  taxNumber?: string;
  email?: string;
  contact?: string;
  amount: number;
  status: 'pending' | 'issued';
  createTime: string;
  type: 'personal' | 'company';
}

export interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  phone: string;
}
