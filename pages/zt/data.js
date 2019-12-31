const data = {
  "info": {
    "api_params": {
      "componentGroupId": 44
    },
    "bg_color": "#f00",
    "foot_text": "底部提示文字",
    "left_text": "支付宝X好食期-阿里巴巴战略投资合作伙伴",
    "rule_button": {
      "text": '',
      url: 'https://m.haoshiqi.net/#zt_template?topic_code=34c82cadfc7a7c1948101ff85bff61ab'
    },
    "share_desc": "分享描述",
    "share_img": "https://img2.haoshiqi.net/FhX6uXROCi2GazP8JlaU-7NYjfUo",
    "share_title": "分享标题",
    "title": "专题标题",
  },
  "list": [
    {
      "id": "banner4673764",
      "type": "c-img", //banner,
      "comment": "Banner图片竖向平铺",
      "margin_bottom": 0,
      "margin_lr": 0,
      "margin_top": 0,
      "bg_color": "",
      "width": 320,
      "height": 200,
      "list": [{
        "image": {
          "w": 320,
          "h": 200,
          "url": "http://img2.haoshiqi.net/ma4714b05d19c44784c44fd551242e78b1.jpg"
        },
        "link": "https://m.api.haoshiqi.net/product/productdetail?productId=48447&sourceType=4",
      }]
    },
    {
      "id": "swiper-product45456",
      "type": "c-swiper-product", //轮播铺品
      "comment": "轮播铺品",
      "margin_bottom": 0,
      "margin_lr": 0,
      "margin_top": 0,
      "width": 320,
      "height": 200,
      "bg_color":"",
      "list": [{
          "bg_color":"#f00",
          id: 16,
          "image": {
            "w": 320,
            "h": 200,
            "url": "http://img2.haoshiqi.net/ma4714b05d19c44784c44fd551242e78b1.jpg",
          },
          "link": "https://m.api.haoshiqi.net/product/productdetail?productId=48447&sourceType=4",
          "list": [
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称1",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            },
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称1",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            }
          ]
        },{
          "bg_color":"#0f0",
          id: 18,
          "image": {
            "w": 320,
            "h": 200,
            "url": "http://img2.haoshiqi.net/ma4714b05d19c44784c44fd551242e78b1.jpg",
          },
          "link": "https://m.api.haoshiqi.net/product/productdetail?productId=48447&sourceType=4",
          "list": [
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称2",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            },
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称2",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            }
          ]
        }
      ]
    },
    {
      "id": "anchor38747843",
      "type": "c-anchor", //锚点
      "comment": "锚点组件",
      "margin_bottom": 0,
      "margin_lr": 0,
      "margin_top": 0,
      "bg_color": "",
      "list": [{
          "name": "普通铺品",
          "id": "product-38u9e2eu98"
        },
        {
          "name": "lable标签",
          "id": "tab-productu394r83"
        },
        {
          "name": "秒杀",
          "id": "seckillue2e82e"
        },
        // {
        //   "name": "轮播图",
        //   "id": "swiper38798439"
        // },
        {
          "name": "豆腐块",
          "id": "img-hor893874"
        }]
    },
    {
      "id": "product-38u9e2eu98",
      "type": "c-product-3", //普通铺品
      "comment": "普通铺品-3列",
      "margin_bottom": 0,
      "margin_lr": 0,
      "margin_top": 0,
      "bg_color": "#f00",
      "button_bg_color": "#0f0",
      "width": 320,
      "height": 200,
      "image": {
        "w": 320,
        "h": 200,
        "url": "http://img2.haoshiqi.net/ma4714b05d19c44784c44fd551242e78b1.jpg"
      },
      "link": "https://m.api.haoshiqi.net/product/productdetail?productId=48447&sourceType=4",
      "list": [
        {
          "sku_id": 123,
          "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
          "pin_activities_id": 456,
          "couple_title": "这个是商品名称",
          "couple_price": 1234,
          "market_price": 3000, //划线价
          "sub_title": "保质期余1月 约省31.42",
          "can_bought": true,
          "left_stock": 3458,
          "all_stock": 3456,
          "count_limit": 2,
          corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
          master_label: '我是主标签',
          slave_label: '我是副标题'
        },
        {
          "sku_id": 123,
          "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
          "pin_activities_id": 456,
          "couple_title": "这个是商品名称",
          "couple_price": 1234,
          "market_price": 3000, //划线价
          "sub_title": "保质期余1月 约省31.42",
          "can_bought": true,
          "left_stock": 3458,
          "all_stock": 3456,
          "count_limit": 2,
          corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
          master_label: '我是主标签',
          slave_label: '我是副标题'
        },
        {
          "sku_id": 123,
          "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
          "pin_activities_id": 456,
          "couple_title": "这个是商品名称",
          "couple_price": 1234,
          "market_price": 3000, //划线价
          "sub_title": "保质期余1月 约省31.42",
          "can_bought": true,
          "left_stock": 3458,
          "all_stock": 3456,
          "count_limit": 2,
          corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
          master_label: '我是主标签',
          slave_label: '我是副标题'
        }
      ]
    },
    {
      "id": "tab-productu394r83",
      "type": "c-tab-product", //lable标签
      "comment": "tab铺品",
      "margin_bottom": 0,
      "margin_lr": 0,
      "margin_top": 0,
      "bg_color": "",
      "list": [
        {
          id: 24,
          "bg_color": "#f00",
          "button_bg_color": "#0f0",
          "tab_name": "标签一",
          "list": [
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称1",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            },
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称1",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            }
          ]
        },
        {
          id: 25,
          "bg_color": "#0f0",
          "button_bg_color": "#0f0",
          "tab_name": "标签二",
          "list": [
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称2",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            },
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称2",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            }
          ]
        },
        {
          id: 26,
          "bg_color": "#ff0",
          "button_bg_color": "#0f0",
          "tab_name": "标签三",
          "list": [
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称32",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            },
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称32",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            }
          ]
        }
      ]
    },
    {
      "id": "seckillue2e82e",
      "type": "c-seckill", //秒杀
      "comment": "倒计时会场",
      "margin_bottom": 0,
      "margin_lr": 0,
      "margin_top": 0,
      "bg_color": "",
      "list": [
        {
          id: 24,
          "start_time": 1546131600,
          "end_time": 1546185599,
          "list": [
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称1",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            },
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称1",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            }
          ]
        },
        {
          id: 25,
          "start_time": 1546218000,
          "end_time": 1546271999,
          "list": [
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称2",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            },
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称2",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            }
          ]
        },
        {
          id: 26,
          "start_time": 1546304400,
          "end_time": 1546358399,
          "list": [
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称3",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            },
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称3",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            }
          ]
        },
        {
          id: 27,
          "start_time": 1546390800,
          "end_time": 1546444799,
          "list": [
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称4",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            },
            {
              "sku_id": 123,
              "sku_pic": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg",
              "pin_activities_id": 456,
              "couple_title": "这个是商品名称4",
              "couple_price": 1234,
              "market_price": 3000, //划线价
              "sub_title": "保质期余1月 约省31.42",
              "can_bought": true,
              "left_stock": 3458,
              "all_stock": 3456,
              "count_limit": 2,
              corner_mark_image: 'https://www.baidu.com', // 角标icon 链接
              master_label: '我是主标签',
              slave_label: '我是副标题'
            }
          ]
        }
      ]
    },
    {
      "id": "swiper38798439",
      "type": "c-swiper", //轮播图
      "comment": "轮播图",
      "margin_bottom": 0,
      "margin_lr": 0,
      "margin_top": 0,
      "bg_color": "",
      "width": 320,
      "height": 200,
      "list": [{
        "bg_color": "",
        id: 24,
        "image": {
          "w": 320,
          "h": 200,
          "url": "http://img2.haoshiqi.net/ma4714b05d19c44784c44fd551242e78b1.jpg"
        },
        "link": "https://m.api.haoshiqi.net/product/productdetail?productId=48447&sourceType=4"
      },{
        "bg_color": "",
        id: 25,
        "image": {
          "w": 320,
          "h": 200,
          "url": "http://img2.haoshiqi.net/ma4714b05d19c44784c44fd551242e78b1.jpg"
        },
        "link": "https://m.api.haoshiqi.net/product/productdetail?productId=48447&sourceType=4"
      },{
        "bg_color": "",
        id: 26,
        "image": {
          "w": 320,
          "h": 200,
          "url": "http://img2.haoshiqi.net/ma4714b05d19c44784c44fd551242e78b1.jpg"
        },
        "link": "https://m.api.haoshiqi.net/product/productdetail?productId=48447&sourceType=4"
      }]
    },
    {
      "id": "img-hor893874",
      "type": "c-img-hor", //豆腐块
      "comment": "图片横向均分平铺",
      "margin_bottom": 0,
      "margin_lr": 0,
      "margin_top": 0,
      "bg_color": "",
      "width": 200,
      "height": 200,
      "list": [{
        id: 24,
        "image": {
          "w": 200,
          "h": 200,
          "url": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg"
        },
        "link": "https://m.api.haoshiqi.net/product/productdetail?productId=48447&sourceType=4"
      },{
        id: 25,
        "image": {
          "w": 200,
          "h": 200,
          "url": "http://img2.haoshiqi.net/ma9ab6cf32723a86af05f4498656ba9cb0.jpg"
        },
        "link": "https://m.api.haoshiqi.net/product/productdetail?productId=48447&sourceType=4"
      }]
    },
  ]
}
export default data;
