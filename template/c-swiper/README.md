轮播图 切换
  独立模块



  swiper: {
    styleType: 2, // 1 默认样式 2 向内缩进 : 配合 previousMargin | nextMargin 一起使用
    width: 200,
    height: 300,
    padding_top: (240/680) * 100,
    indicatorDots: true, // 显示指示点
    // interval: 6000, // 自动切换间隔
    autoplay: false, // 自动切换
    circular: true, // 无限滑动
    previousMargin: '12px',
    nextMargin: '12px',
    eventName: '', // banner 点击事件名
    onChangeEventName: 'swiperProductOnChenge', // banner 切换回调事件名
    list: [
      {
        "w": "200",
        "h": "300",
        "url": "http://img2.haoshiqi.net/ma5976ef3ae7ac784e8c4732715b4c5f47.jpg",
        "link": "",
      },
      {
        "w": "200",
        "h": "300",
        "url": "http://img2.haoshiqi.net/mab9385517054cb6cec0e511deda617ab8.jpg",
        "link": "",
      }
    ],
  },