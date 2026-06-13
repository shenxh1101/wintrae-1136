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
  spotName: string;
  ticketName: string;
  date: string;
  timeSlot: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'paid' | 'used' | 'cancelled';
  qrCode?: string;
  createTime: string;
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
  status: 'pending' | 'processing' | 'resolved';
  createTime: string;
}

export interface Review {
  id: string;
  spotId: string;
  spotName: string;
  rating: number;
  content: string;
  images: string[];
  createTime: string;
  userName: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  title: string;
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
