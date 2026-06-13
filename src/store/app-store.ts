import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TicketOrder, ServiceHelpItem, Review, Invoice, RefundRecord } from '@/types';
import { spotsData } from '@/data/spots';

interface AppState {
  favoriteSpotIds: string[];
  ticketOrders: TicketOrder[];
  serviceHelpList: ServiceHelpItem[];
  reviewList: Review[];
  invoiceList: Invoice[];
  refundList: RefundRecord[];
  currentOrder: TicketOrder | null;
  activeRouteTour: { routeId: string; currentSpotIndex: number; startTime: string } | null;

  toggleFavorite: (spotId: string) => void;
  isFavorite: (spotId: string) => boolean;
  getFavoriteCount: () => number;

  addTicketOrder: (order: TicketOrder) => void;
  setCurrentOrder: (order: TicketOrder | null) => void;
  updateTicketOrder: (orderId: string, updates: Partial<TicketOrder>) => void;
  cancelTicketOrder: (orderId: string) => void;
  markOrderReviewed: (orderId: string) => void;

  addServiceHelp: (item: ServiceHelpItem) => void;

  addReview: (review: Review) => void;

  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void;

  createRefund: (refund: Omit<RefundRecord, 'id' | 'createTime' | 'status'>) => void;
  updateRefund: (refundId: string, updates: Partial<RefundRecord>) => void;

  setActiveRouteTour: (tour: { routeId: string; currentSpotIndex: number; startTime: string } | null) => void;
  advanceRouteTour: () => void;
}

const initialFavorites = spotsData.filter(s => s.isFavorite).map(s => s.id);

const now = new Date();
const dateStr = (d: Date) => d.toISOString().slice(0, 10);

const historyOrders: TicketOrder[] = [
  {
    id: 'hist-001',
    orderNo: 'TK202506010001',
    spotId: spotsData[0].id,
    spotName: spotsData[0].name,
    ticketId: 'tk-adult',
    ticketName: '成人票',
    date: dateStr(new Date(now.getTime() - 7 * 24 * 3600 * 1000)),
    timeSlot: '09:00-10:00',
    quantity: 2,
    price: 80,
    totalPrice: 160,
    contactName: '张先生',
    contactPhone: '13800138001',
    status: 'used',
    invoiceStatus: 'issued',
    qrCode: 'QR-HIST-001',
    createTime: new Date(now.getTime() - 8 * 24 * 3600 * 1000).toISOString(),
    hasReview: true
  },
  {
    id: 'hist-002',
    orderNo: 'TK202506080002',
    spotId: spotsData[1].id,
    spotName: spotsData[1].name,
    ticketId: 'tk-adult',
    ticketName: '成人票',
    date: dateStr(new Date(now.getTime() - 1 * 24 * 3600 * 1000)),
    timeSlot: '14:00-15:00',
    quantity: 1,
    price: 60,
    totalPrice: 60,
    contactName: '李女士',
    contactPhone: '13800138002',
    status: 'used',
    invoiceStatus: 'none',
    qrCode: 'QR-HIST-002',
    createTime: new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString(),
    hasReview: false
  },
  {
    id: 'hist-003',
    orderNo: 'TK202506120003',
    spotId: spotsData[2].id,
    spotName: spotsData[2].name,
    ticketId: 'tk-family',
    ticketName: '家庭套票',
    date: dateStr(new Date(now.getTime() + 2 * 24 * 3600 * 1000)),
    timeSlot: '10:00-11:00',
    quantity: 3,
    price: 120,
    totalPrice: 360,
    contactName: '王小姐',
    contactPhone: '13800138003',
    status: 'paid',
    invoiceStatus: 'none',
    qrCode: 'QR-HIST-003',
    createTime: new Date(now.getTime() - 1 * 24 * 3600 * 1000).toISOString(),
    hasReview: false
  },
  {
    id: 'hist-004',
    orderNo: 'TK202505200004',
    spotId: spotsData[0].id,
    spotName: spotsData[0].name,
    ticketId: 'tk-adult',
    ticketName: '成人票',
    date: dateStr(new Date(now.getTime() - 20 * 24 * 3600 * 1000)),
    timeSlot: '09:00-10:00',
    quantity: 2,
    price: 80,
    totalPrice: 160,
    contactName: '赵先生',
    contactPhone: '13800138004',
    status: 'cancelled',
    invoiceStatus: 'none',
    qrCode: 'QR-HIST-004',
    createTime: new Date(now.getTime() - 21 * 24 * 3600 * 1000).toISOString(),
    hasReview: false,
    refundId: 'refund-001'
  }
];

const historyInvoices: Invoice[] = [
  {
    id: 'inv-001',
    orderId: 'hist-001',
    orderIds: ['hist-001'],
    title: '个人',
    email: 'zhang@example.com',
    contact: '13800138001',
    amount: 160,
    status: 'issued',
    createTime: new Date(now.getTime() - 6 * 24 * 3600 * 1000).toISOString(),
    type: 'personal'
  }
];

const historyReviews: Review[] = [
  {
    id: 'review-001',
    spotId: spotsData[0].id,
    spotName: spotsData[0].name,
    rating: 5,
    subRatings: { environment: 5, service: 4, value: 5 },
    content: '非常棒的景点，设施完善，工作人员态度很好！',
    images: [],
    tags: ['值得去', '设施完善'],
    contact: '13800138001',
    isAnonymous: false,
    userAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20avatar&image_size=square',
    createTime: new Date(now.getTime() - 6 * 24 * 3600 * 1000).toISOString(),
    userName: '张先生',
    title: '不虚此行',
    email: 'zhang@example.com',
    orderId: 'hist-001'
  }
];

const historyRefunds: RefundRecord[] = [
  {
    id: 'refund-001',
    orderId: 'hist-004',
    orderNo: 'TK202505200004',
    reason: '行程变更，无法前往',
    method: 'original',
    amount: 160,
    status: 'completed',
    createTime: new Date(now.getTime() - 19 * 24 * 3600 * 1000).toISOString(),
    processTime: new Date(now.getTime() - 18 * 24 * 3600 * 1000).toISOString(),
    remark: '退款已原路退回'
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      favoriteSpotIds: initialFavorites,
      ticketOrders: historyOrders,
      serviceHelpList: [],
      reviewList: historyReviews,
      invoiceList: historyInvoices,
      refundList: historyRefunds,
      currentOrder: null,
      activeRouteTour: null,

      toggleFavorite: (spotId: string) => {
        set(state => {
          const exists = state.favoriteSpotIds.includes(spotId);
          const newFavorites = exists
            ? state.favoriteSpotIds.filter(id => id !== spotId)
            : [...state.favoriteSpotIds, spotId];
          console.log('[Store] 切换收藏:', spotId, exists ? '取消' : '添加', '总数:', newFavorites.length);
          return { favoriteSpotIds: newFavorites };
        });
      },

      isFavorite: (spotId: string) => {
        return get().favoriteSpotIds.includes(spotId);
      },

      getFavoriteCount: () => {
        return get().favoriteSpotIds.length;
      },

      addTicketOrder: (order: TicketOrder) => {
        console.log('[Store] 添加订单:', order.id);
        set(state => ({
          ticketOrders: [order, ...state.ticketOrders]
        }));
      },

      setCurrentOrder: (order: TicketOrder | null) => {
        console.log('[Store] 设置当前订单:', order?.id || null);
        set({ currentOrder: order });
      },

      updateTicketOrder: (orderId: string, updates: Partial<TicketOrder>) => {
        set(state => ({
          ticketOrders: state.ticketOrders.map(order =>
            order.id === orderId ? { ...order, ...updates } : order
          )
        }));
      },

      cancelTicketOrder: (orderId: string) => {
        set(state => ({
          ticketOrders: state.ticketOrders.map(order =>
            order.id === orderId ? { ...order, status: 'cancelled' } : order
          )
        }));
      },

      markOrderReviewed: (orderId: string) => {
        set(state => ({
          ticketOrders: state.ticketOrders.map(order =>
            order.id === orderId ? { ...order, hasReview: true } : order
          )
        }));
      },

      addServiceHelp: (item: ServiceHelpItem) => {
        console.log('[Store] 添加求助:', item.id);
        set(state => ({
          serviceHelpList: [item, ...state.serviceHelpList]
        }));
      },

      addReview: (review: Review) => {
        console.log('[Store] 添加评价:', review.id);
        set(state => ({
          reviewList: [review, ...state.reviewList]
        }));
      },

      addInvoice: (invoice: Invoice) => {
        console.log('[Store] 添加发票:', invoice.id);
        set(state => ({
          invoiceList: [invoice, ...state.invoiceList]
        }));
      },

      updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => {
        set(state => ({
          invoiceList: state.invoiceList.map(invoice =>
            invoice.id === invoiceId ? { ...invoice, ...updates } : invoice
          )
        }));
      },

      createRefund: (refund) => {
        const newRefund: RefundRecord = {
          ...refund,
          id: 'refund-' + Date.now(),
          createTime: new Date().toISOString(),
          status: 'pending'
        };
        set(state => ({
          refundList: [newRefund, ...state.refundList],
          ticketOrders: state.ticketOrders.map(order =>
            order.id === refund.orderId
              ? { ...order, status: 'refund', refundId: newRefund.id, invoiceStatus: order.invoiceStatus === 'issued' ? 'pending' : order.invoiceStatus }
              : order
          )
        }));
      },

      updateRefund: (refundId: string, updates: Partial<RefundRecord>) => {
        set(state => ({
          refundList: state.refundList.map(r =>
            r.id === refundId ? { ...r, ...updates } : r
          )
        }));
      },

      setActiveRouteTour: (tour) => {
        set({ activeRouteTour: tour });
      },

      advanceRouteTour: () => {
        const current = get().activeRouteTour;
        if (current) {
          set({ activeRouteTour: { ...current, currentSpotIndex: current.currentSpotIndex + 1 } });
        }
      }
    }),
    {
      name: 'smart-tourism-storage',
      partialize: (state) => ({
        favoriteSpotIds: state.favoriteSpotIds,
        ticketOrders: state.ticketOrders,
        serviceHelpList: state.serviceHelpList,
        reviewList: state.reviewList,
        invoiceList: state.invoiceList,
        refundList: state.refundList,
        activeRouteTour: state.activeRouteTour
      })
    }
  )
);
