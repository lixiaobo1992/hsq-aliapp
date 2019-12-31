轮播铺品
  复合组件
    swiper
    product-3


const swiperProduct1 = {
  id: 'xxx',
  type: 'c-swiper-product',
  comment: '轮播铺品',
  bg_color: '#f00',
  margin_bottom: 0,
  margin_lr: 0,
  margin_top: 0,
  currentIndex: 0,
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
  productData: {
    bg_color: '#f00',
    list:  [
      {
        eventName: 'detail',
        list: [
          {
            "sku_id": "123",
            "sku_pic": "www.baidu.com",
            "pin_activities_id": "456",
            "couple_title": "这个是商品名称1",
            "couple_price": "123456",
            "market_price": "30", //划线价
            "sub_title": "保质期余1月 约省31.42",
            "can_bought": true,
            "left_stock": 3458,
            "count_limit": 2
          },
          {
            "sku_id": "123",
            "sku_pic": "www.baidu.com",
            "pin_activities_id": "456",
            "couple_title": "这个是商品名称1",
            "couple_price": "123456",
            "market_price": "30", //划线价
            "sub_title": "保质期余1月 约省31.42",
            "can_bought": true,
            "left_stock": 3458,
            "count_limit": 2
          },
          {
            "sku_id": "123",
            "sku_pic": "www.baidu.com",
            "pin_activities_id": "456",
            "couple_title": "这个是商品名称1",
            "couple_price": "123456",
            "market_price": "30", //划线价
            "sub_title": "保质期余1月 约省31.42",
            "can_bought": true,
            "left_stock": 3458,
            "count_limit": 2
          }
        ]
      },
      {
        eventName: 'detail',
        list: [
          {
            "sku_id": "123",
            "sku_pic": "www.baidu.com",
            "pin_activities_id": "456",
            "couple_title": "这个是商品名称2",
            "couple_price": "123456",
            "market_price": "30", //划线价
            "sub_title": "保质期余1月 约省31.42",
            "can_bought": true,
            "left_stock": 3458,
            "count_limit": 2
          },
          {
            "sku_id": "123",
            "sku_pic": "www.baidu.com",
            "pin_activities_id": "456",
            "couple_title": "这个是商品名称2",
            "couple_price": "123456",
            "market_price": "30", //划线价
            "sub_title": "保质期余1月 约省31.42",
            "can_bought": true,
            "left_stock": 3458,
            "count_limit": 2
          },
          {
            "sku_id": "123",
            "sku_pic": "www.baidu.com",
            "pin_activities_id": "456",
            "couple_title": "这个是商品名称2",
            "couple_price": "123456",
            "market_price": "30", //划线价
            "sub_title": "保质期余1月 约省31.42",
            "can_bought": true,
            "left_stock": 3458,
            "count_limit": 2
          }
        ]
      },
    ]
  }
}
