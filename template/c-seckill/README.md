计时秒杀
  复合模块

  const seckill = {
  "id": "wwww",
  "type": "c-seckill", //秒杀
  "comment": "倒计时会场",
  "margin_bottom": 0,
  "margin_lr": 0,
  "margin_top": 0,
  "bg_color": "",
  timeList: [{
    id: 0,
    start: "26日 9:00",
    status: 2, // 1：即将开始，2：正在，3：结束
  },{
    id: 1,
    start: "27日 9:00",
    status: 1,
  },{
    id: 2,
    start: "28日 9:00",
    status: 1,
  },{
    id: 3,
    start: "29日 9:00",
    status: 1,
  }],
  prodList: [],
  "list": [
    {
      "start_time": "时间戳",
      "end_time": "时间戳 start_time 当天最后一秒",
      "list": [
        {
          "sku_id": "123",
          "sku_pic": "www.baidu.com",
          "pin_activities_id": "456",
          "couple_title": "这个是商品名称",
          "couple_price": "123456",
          "market_price": "30", //划线价
          "sub_title": "保质期余1月 约省31.42",
          "can_bought": true,
          "left_stock": 3458,
          "all_stock":"123456",
          "count_limit": 2
        },
        {
          "sku_id": "123",
          "sku_pic": "www.baidu.com",
          "pin_activities_id": "456",
          "couple_title": "这个是商品名称",
          "couple_price": "123456",
          "market_price": "30", //划线价
          "sub_title": "保质期余1月 约省31.42",
          "can_bought": true,
          "left_stock": 3458,
          "all_stock":"123456",
          "count_limit": 2
        }
      ]
    }
  ]
}
