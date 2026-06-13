import { Itinerary, ItineraryItem, RouteType } from '@/types';
import { Spot } from '@/types';

export interface RouteSpots {
  routeId: string;
  name: string;
  description: string;
  color: string;
  spotIds: string[];
  estimatedTime: string;
  distance: string;
}

export const routeTypes: RouteType[] = [
  { id: 'default', name: '经典路线', icon: '', description: '经典景点全覆盖' },
  { id: 'family', name: '亲子路线', icon: '', description: '适合亲子家庭游玩' },
  { id: 'photo', name: '摄影路线', icon: '', description: '最佳拍照打卡点' },
  { id: 'accessible', name: '无障碍路线', icon: '', description: '无障碍设施完善' }
];

export const routeSpotsMap: RouteSpots[] = [
  {
    routeId: 'default',
    name: '经典路线',
    description: '覆盖景区最具代表性的核心景点',
    color: '#2563eb',
    spotIds: ['1', '2', '7', '3'],
    estimatedTime: '约4-6小时',
    distance: '约5公里'
  },
  {
    routeId: 'family',
    name: '亲子路线',
    description: '寓教于乐，适合带小朋友一起游玩',
    color: '#f59e0b',
    spotIds: ['6', '4', '8', '1'],
    estimatedTime: '约5-7小时',
    distance: '约4公里'
  },
  {
    routeId: 'photo',
    name: '摄影路线',
    description: '精选最佳拍摄角度，出片率极高',
    color: '#10b981',
    spotIds: ['3', '1', '2', '7'],
    estimatedTime: '约3-5小时',
    distance: '约4.5公里'
  },
  {
    routeId: 'accessible',
    name: '无障碍路线',
    description: '全程无障碍通道，设施完善',
    color: '#8b5cf6',
    spotIds: ['1', '2', '5', '4'],
    estimatedTime: '约3-4小时',
    distance: '约3公里'
  }
];

const halfDayItinerary: Itinerary = {
  id: 'half-1',
  title: '半日精华游',
  type: 'half-day',
  description: '精选核心景点，轻松半日游',
  totalDuration: '约4小时',
  distance: '约3公里',
  spots: [
    {
      id: 's1',
      spotId: '1',
      spotName: '翠湖公园',
      image: 'https://picsum.photos/id/1015/200/200',
      duration: '1.5小时',
      startTime: '09:00',
      endTime: '10:30',
      order: 1
    },
    {
      id: 's2',
      spotId: '2',
      spotName: '古城墙遗址',
      image: 'https://picsum.photos/id/1018/200/200',
      duration: '1小时',
      startTime: '10:45',
      endTime: '11:45',
      order: 2
    },
    {
      id: 's3',
      spotId: '7',
      spotName: '古寺庙',
      image: 'https://picsum.photos/id/1039/200/200',
      duration: '1.5小时',
      startTime: '12:00',
      endTime: '13:30',
      order: 3
    }
  ]
};

const oneDayItinerary: Itinerary = {
  id: 'one-1',
  title: '一日深度游',
  type: 'one-day',
  description: '深度体验，不错过任何精彩',
  totalDuration: '约8小时',
  distance: '约6公里',
  spots: [
    {
      id: 's1',
      spotId: '3',
      spotName: '南山风景区',
      image: 'https://picsum.photos/id/1036/200/200',
      duration: '3小时',
      startTime: '08:00',
      endTime: '11:00',
      order: 1
    },
    {
      id: 's2',
      spotId: '7',
      spotName: '古寺庙',
      image: 'https://picsum.photos/id/1039/200/200',
      duration: '1小时',
      startTime: '11:30',
      endTime: '12:30',
      order: 2
    },
    {
      id: 's3',
      spotId: '2',
      spotName: '古城墙遗址',
      image: 'https://picsum.photos/id/1018/200/200',
      duration: '1.5小时',
      startTime: '14:00',
      endTime: '15:30',
      order: 3
    },
    {
      id: 's4',
      spotId: '5',
      spotName: '美术馆',
      image: 'https://picsum.photos/id/106/200/200',
      duration: '1.5小时',
      startTime: '16:00',
      endTime: '17:30',
      order: 4
    }
  ]
};

const familyItinerary: Itinerary = {
  id: 'family-1',
  title: '亲子欢乐游',
  type: 'one-day',
  description: '专为亲子家庭设计，寓教于乐',
  totalDuration: '约7小时',
  distance: '约4公里',
  spots: [
    {
      id: 's1',
      spotId: '6',
      spotName: '动物园',
      image: 'https://picsum.photos/id/237/200/200',
      duration: '3小时',
      startTime: '08:30',
      endTime: '11:30',
      order: 1
    },
    {
      id: 's2',
      spotId: '4',
      spotName: '科技馆',
      image: 'https://picsum.photos/id/96/200/200',
      duration: '2.5小时',
      startTime: '13:30',
      endTime: '16:00',
      order: 2
    },
    {
      id: 's3',
      spotId: '8',
      spotName: '植物园',
      image: 'https://picsum.photos/id/1044/200/200',
      duration: '1.5小时',
      startTime: '16:30',
      endTime: '18:00',
      order: 3
    }
  ]
};

export const recommendedItineraries: Itinerary[] = [
  halfDayItinerary,
  oneDayItinerary,
  familyItinerary
];

export const getItineraryById = (id: string): Itinerary | undefined => {
  return recommendedItineraries.find(item => item.id === id);
};
