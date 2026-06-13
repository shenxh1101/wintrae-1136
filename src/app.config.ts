export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/map/index',
    'pages/ticket/index',
    'pages/itinerary/index',
    'pages/mine/index',
    'pages/spot-detail/index',
    'pages/ticket-detail/index',
    'pages/booking/index',
    'pages/qr-code/index',
    'pages/service-help/index',
    'pages/review/index',
    'pages/invoice/index',
    'pages/order-list/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '智慧旅游',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f7fa'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#2563eb',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/map/index',
        text: '地图'
      },
      {
        pagePath: 'pages/ticket/index',
        text: '门票'
      },
      {
        pagePath: 'pages/itinerary/index',
        text: '行程'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
