tab切换产品标签
  复合组件
    tab
    product-3

const tabProduct = {
  id: 'tabx',
  type: 'c-tab-product',
  comment: 'tab铺品',
  bg_color: '#FFBB00',
  margin_bottom: 0,
  margin_lr: 0,
  margin_top: 0,

  currentIndex: 0, // 当前tab 下标
  eventName: 'detail', // 产品点击事件名

  moreEventName: 'tabProductMoreClick', // 查看更多事件名

  tabs: {
    // bg_color: '#00f',
    scrollable: true,
    activColor: '#FF8600', // 选中的颜色
    scrollLeft: 0, // 当前滑动都距离
    lineStyle: '', // 当前 tab线的样式
    // currentIndex: 0, // 当前tab 下标
    tabChengeEventName: 'tabProductOnChenge', // tab 切换事件名
    list: [
      {
        tab_name: '糖果巧克li'
      },
      {
        tab_name: '饼干糕点'
      },
      {
        tab_name: '膨化食品'
      },
      {
        tab_name: '膨化食品1'
      },
      {
        tab_name: '膨化食品2'
      },
      {
        tab_name: '膨化食品3'
      }
    ]
  },
  tabProduct: [
    {
      isShowMore: false,
      bg_color: '',
      button_bg_color: '#f00',
      tempList: [
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
      ],
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
        },

      ],
    },
    {
      isShowMore: false,
      bg_color: '',
      button_bg_color: '#f00',
      tempList: [
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
      ],
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
        },

      ],
    },
    {
      isShowMore: false,
      bg_color: '',
      button_bg_color: '#f00',
      tempList: [
        {
          "sku_id": "123",
          "sku_pic": "www.baidu.com",
          "pin_activities_id": "456",
          "couple_title": "这个是商品名称3",
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
          "couple_title": "这个是商品名称3",
          "couple_price": "123456",
          "market_price": "30", //划线价
          "sub_title": "保质期余1月 约省31.42",
          "can_bought": true,
          "left_stock": 3458,
          "count_limit": 2
        },
      ],
      list: [
        {
          "sku_id": "123",
          "sku_pic": "www.baidu.com",
          "pin_activities_id": "456",
          "couple_title": "这个是商品名称3",
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
          "couple_title": "这个是商品名称3",
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
          "couple_title": "这个是商品名称3",
          "couple_price": "123456",
          "market_price": "30", //划线价
          "sub_title": "保质期余1月 约省31.42",
          "can_bought": true,
          "left_stock": 3458,
          "count_limit": 2
        },

      ],
    },
  ],
}
