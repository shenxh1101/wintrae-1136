import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import { TicketOrder, ServiceHelpItem, Review, Invoice } from '@/types';
import { spotsData } from '@/data/spots';

interface AppState {
  favoriteSpotIds: string[];
  ticketOrders: TicketOrder[];
  serviceHelpList: ServiceHelpItem[];
  reviewList: Review[];
  invoiceList: Invoice[];
  currentOrder: TicketOrder | null;

  toggleFavorite: (spotId: string) => void;
  isFavorite: (spotId: string) => boolean;
  getFavoriteCount: () => number;

  addTicketOrder: (order: TicketOrder) => void;
  setCurrentOrder: (order: TicketOrder | null) => void;

  addServiceHelp: (item: ServiceHelpItem) => void;

  addReview: (review: Review) => void;

  addInvoice: (invoice: Invoice) => void;
}

const initialFavorites = spotsData.filter(s => s.isFavorite).map(s => s.id);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      favoriteSpotIds: initialFavorites,
      ticketOrders: [],
      serviceHelpList: [],
      reviewList: [],
      invoiceList: [],
      currentOrder: null,

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
      }
    }),
    {
      name: 'smart-tourism-storage',
      partialize: (state) => ({
        favoriteSpotIds: state.favoriteSpotIds,
        ticketOrders: state.ticketOrders,
        serviceHelpList: state.serviceHelpList,
        reviewList: state.reviewList,
        invoiceList: state.invoiceList
      })
    }
  )
);
