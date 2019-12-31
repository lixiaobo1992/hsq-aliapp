import {
  me,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '/api';
// import list from '/components/list';
import {
  mixins,
} from '/utils';
import authMixin from '/utils/authMixin';
// console.log('api list:')
// console.log(Object.keys(api))
const app = getApp();

// const qrcode = 'https://qr.alipay.com/c1x06601lqldxvu9cxarm91';
// const alipayScheme = 'alipays://platformapi/startapp?appId=10000007&qrcode=' + encodeURIComponent(qrcode);
// const alipayUrl = 'https://ds.alipay.com/?from=mobilecodec&scheme=' + encodeURIComponent(alipayScheme);
// // https://ds.alipay.com/?from=mobilecodec&scheme=alipays%3A%2F%2Fplatformapi%2Fstartapp%3FappId%3D10000007%26qrcode%3Dhttps%253A%252F%252Fqr.alipay.com%252Fc1x06601lqldxvu9cxarm91

// console.log(Page)
// console.log('Page')

import dealSku from '/components/sku-select1/sku-deal';



// const stocksList = {
//   '539206;539204;539205': {
//     name: '海太蜂蜜黄油薯片',
//     // 缩略图
//     thumbnail: 'http://img2.haoshiqi.net/mabe517dfd1b05e93478d8a12203bf6d49.jpg?imageView2/0/q/70',
//     left_stock: 111, // 库存
//     price: 1111, //sku价格（当前售价）
//     market_price: 111, // 原价（删除价）
//     id: 1112,
//     skuid: 1112, // skuid
//     max_buy_num: 10, // 当前sku限购数
//   },
// };

// const attrList = [
//   {
//     attrId: 4,
//     attrName: '保质期',
//     attrValues: [
//       {
//         id: 539206,
//         value: '2020/03/01',
//       },
//       {
//         id: 333,
//         value: '2020/03/02',
//       },
//     ],
//   },
//   {
//     attrId: 2,
//     attrName: '规格',
//     attrValues: [
//       {
//         id: 539204,
//         value: '120g*2支',
//       },
//       {
//         id: 5153861,
//         value: '120g*2支',
//       },
//     ],
//   },
//   {
//     attrId: 3,
//     attrName: '口味',
//     attrValues: [
//       {
//         id: 539205,
//         value: '臭味',
//       },
//       {
//         id: 515386,
//         value: '煤气味',
//       },
//     ],
//   },
// ];

xPage({
  ...mixins,
  ...dealSku,
  ...authMixin,
  // ...list,
  // ...lifecycle,
  data: {
    // sku
    isShowPopup: false, // v-model
    normSelectTag: 0,
    currentSum: 1,
    maxBuySum: 10,

    skuBtnStatus: {
      isBtnActive: true, // 按钮否可用
      buyBtnText: '立即购买',
      cartBtnText: '加入购物车',
    },

    attrData: [],
    skuStocksList: {}, // 属性ID 对应 sku列表

    defaultSelectedIds: [], // 默认已选择id
    defaultSkuData: {}, // 默认skuData
    currentSkuData: {}, // 当前skuData
    selectedAttrName: [], // 已选择 attr
    notSelectedAttrName: '', // 未选择属性提示

    //
    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    }),

    shareInfo: true,
    pageInfo: {
      pageId: 0,
    },
    debug: true,
    onItemTap: 'handleListItemTap',
    price: {
      // type: '花呗价：',
      price: 12.3,
      point: 88,
      marketPrice: 23.3,
    },
    pages: {
      onItemTap: 'onGridItemTap',
      curIndex: 0,
      list: [
        { text: '首页', page: 'index' },
        { text: '蚂蚁积分首页', page: 'index2' },
        { text: '专题页', page: 'zt' },
        { text: '专题页2', page: 'zt2' },
        { text: '详情页', page: 'detail' },
        { text: '确认订单', page: 'order-commit' },
        { text: '订单结果', page: 'order-result' },
        { text: '订单列表', page: 'order-list', query: { type: 2 } },
        { text: '申请退款', page: 'order-refund' },
        { text: '退款详情', page: 'order-refund-detail' },
        { text: '订单详情', page: 'order-detail' },
        { text: '个人中心', page: 'profile' },
        { text: '地址列表', page: 'address-list' },
        { text: '地址新增/编辑', page: 'address-update' },
        { text: '查看物流', page: 'delivery' },
        { text: '客服', page: 'service' },
        { text: '错误页面', page: 'error' },
        { text: '我的拼团', page: 'couple-order-list' },
        { text: '关注生活号', page: 'service', query: { 'page-type': 'life' } },
        { text: '错误页', page: 'error', query: { message: '错误信息自己定' } },
        { text: '拼团分享', page: 'couple-share' },
        { text: '测试参团', page: 'couple-share', query: { id: 228098 } },
        { text: '专题活动', page: 'topic', query: { url: encodeURIComponent('https://topic.dev.doweidu.com/?id=285f901b39f6ba7d90b05d9f90006e49') } },
        // demo
        { text: '列表页模板', page: 'list', type: 'demo' },
        { text: '上传七牛', page: 'qiniu', type: 'demo' },
        { text: '测试swiper', page: 'swiper', type: 'demo' },
        { text: '主体小程序之间跳转', page: 'pages/index', query: { appname: 'point', chanel: 'Haoshiqi', test1:11 } },
        { text: '白名单小程序之间跳转name', page: 'pages/index', query: { appid: '2018013102119843', chanel: 'Haoshiqi', test1:11 } },
        { text: '白名单小程序之间跳转appid', page: 'pages/index', query: { appname: 'in2', chanel: 'Haoshiqi', test1:11 } },
      ],
    },
  },

  onGridItemTap(e) {
    const {
      page,
      index,
      query = this.data.pages.list[index].query,
    } = e.currentTarget.dataset;
    // const page = this.data.pages.list[e.target.dataset.index].page;
    this.forward(page, query);
  },
  onLoad(query) {
    this.onPageInit(query);

    // my.showLoading();
    // api.getPointIndex({
    // // api.test({
    //   // pointChannelId: 1,
    // }, (res) => {
    //   const { data } = res;
    //   console.log(data);
    //   this.setData({
    //     bannerList: data.bannerList,
    //     skuList: data.skuList.list || [],
    //     subButtonList: data.subButtonList || [],
    //     labels: data.labels,
    //   });
    // }, (err) => {
    //   console.log(err);
    // });
    // console.log(Page);
    // console.log(my);
  },
  onShow() {
    console.log(my);
    console.log(this);
    // this.onMessage();
    // this.setShareMessage();
    // this.setData({ todos: app.todos });


  },
  onReady() {

    // this.dealSKUData({
    //   stocksList: stocksList,
    //   attrList: attrList,
    //   defaultSkuData: {
    //     name: '海太蜂蜜黄油薯片1',
    //     thumbnail: '',
    //     max_buy_num: 10,
    //   },
    //   currentSkuData: {
    //     name: '海太蜂蜜黄油薯片1',
    //     // 缩略图
    //     thumbnail:
    //       'http://img2.haoshiqi.net/mabe517dfd1b05e93478d8a12203bf6d49.jpg?imageView2/0/q/70',
    //     stock: 111, // 库存
    //     price: 1111, //sku价格（当前售价）
    //     market_price: 111, // 原价（删除价）
    //     skuid: 111, // skuid
    //     max_buy_num: 10, // 当前sku限购数
    //   },
    // });
  },
  tempEvent(e) {
    const { url } = e.currentTarget.dataset;

    if (url) {
      this.forward('web-view', { url })
    }
  },
  jumpMiniapp() {
    // console.error('miniUrl', JSON.stringify(miniUrl, null, 2))
    my.navigateToMiniProgram({
      appId: '2018010301537963', // 跳转到的小程序appId
      path:'pages/Activity/JumpUrl/JumpUrl?jumpurl=https%3a%2f%2fzm.igooma.cn%2fActivity%2fSc1000_11379%3ftype%3d4', // 打开的页面路径，如果为空则打开首页
      extraData: {
        channel:'alipayappletsyyhh',
        childid: 6965
      }, // 需要传递给目标小程序的数据
      success: (res) => {
        console.log('navigateToMiniProgram res:',res)
      },
      fail: (err) => {
        console.log('navigateToMiniProgram err:',err)
      },
      complete: (val) => {
        console.log('navigateToMiniProgram complete',val)
      }
    });
  },
  // onTodoChanged(e) {
  //   const checkedTodos = e.detail.value;
  //   app.todos = app.todos.map(todo => ({
  //     ...todo,
  //     completed: checkedTodos.indexOf(todo.text) > -1,
  //   }));
  //   this.setData({ todos: app.todos });
  // },
  onClick(e) {
    const { type } = e.currentTarget.dataset;
    switch (type) {
      // case 'url':
      //   window.location.href = qrcode;
      //   break;
      // case 'schema':
      //   window.location.href = alipayScheme;
      //   break;
      case 'store':
        my.clearStorage({
          success() {
            my.showToast('清除缓存成功');
          },
        });
        api.logout({}, (res) => {
          console.log(res.data);
        }, (err) => {
          console.log(err);
        });
        break;
      case 'test':
        break;
      case 'track-event': {
        my.piwikEvent('test', {
          lable:'aaa'
        });
        // or
        my.piwikEvent('test', 'aaa');
        break;
      }
      default:
        // do nothing...
        break;
    }
  },

  countChangeVal(data) {
    console.log(data);
    const { value } = data;
  },

  //////////sku
  addShoppingCartClick() {
    this.setData({
      normSelectTag: 1,
      isShowPopup: true,
    });
  },
  buyBtnClick() {
    this.setData({
      normSelectTag: 2,
      isShowPopup: true,
    });
  },
  // 点击规格选择
  onSelectNorm() {
    this.setData({
      normSelectTag: 0,
      isShowPopup: true,
    });
  },
  // 接收sku 点击的事件
  onBtnClick(data) {
    console.log(data);
    const { type } = data;
    switch(type) {
      case 'buyBtn':
        //
        break;
      case 'addShoppingCart':
        //
        break;
    }
  },
  ///////////
  testLogin() {
    console.log('sss');
    this.updatedAuthCode({
      authType: 'auth_user',
      success(res) {
        console.log(res);

        this.postLogin({
          data: {
            ...res,
          },
          success(res1) {
            //
            console.log(res1);
          },
          fail(err1){
            //
          }
        });
      },
      fail(err) {
        console.log(err);
      }
    })
  },
  jumpPlugin() {
    const { userInfo } = this.data;
    my.showLoading();
    api.getMemberInfo({},res => {

      this.gotoPlugin(res.data)

    },err => {

    })
  },
  gotoPlugin(data) {
    // status 轻会员状态   0没有开通 1 已开通 2失效中 3 已失效
    const { userInfo } = this.data;
    const status = 0;
    let pageSite = '';
    let extraParam;
    if(status == 1){
      // 用户是否开通，如果开通去请求，拿到去首页要传的一些参数
      pageSite = "pages/easyMember/home/index";                                         // 轻会员首页地址

      extraParam = {
        "alipay.huabei.easyMember.pId": '2088801342252957',                             // 商户id
        "alipay.huabei.easyMember.userId": userInfo.alipay_user_id,                     // 支付宝用户userId
        "alipay.huabei.easyMember.templateId": data.templateId,                      // 轻会员模板id
        "alipay.huabei.easyMember.agreementNo": data.agreementNo,                    // 轻会员协议号
        "alipay.huabei.easyMember.totalDiscountAmount": data.totalDiscountAmount,    // string 累计优惠金额
        "alipay.huabei.easyMember.totalRealPayAmount": data.totalRealPayAmount,      // string 累计⽀付宝实付⾦额(承诺会员模式必 传)， 单位 元
        "alipay.huabei.easyMember.totalPayCount": data.totalPayCount,                // string 累计⽀付宝⽀付次数， 整型数字
        "alipay.huabei.easyMember.vourcher": data.vourcher,                          // map类型 代金券，不传不展示
        "alipay.huabei.easyMember.tradeList": data.tradeList                         // 交易列表。数组+对象
      }

    }else{
      pageSite = "pages/easyMember/sign/index";                                            // 轻会员开通页地址
      extraParam = {
        "alipay.huabei.easyMember.pId": '2088801342252957',                                // 商户id
        "alipay.huabei.easyMember.userId": userInfo.alipay_user_id,                        // 支付宝用户userId
        "alipay.huabei.easyMember.templateId": data.templateId                          // 轻会员模板id
      };
    }
    console.log('===pageSite:', pageSite);
    console.log('===extraParam:', extraParam);
    my.navigateToMiniService({
      serviceId: '2019022363383002',                 // 轻会员插件id，固定值
      servicePage: pageSite,
      extraData: extraParam,
      success: (res) => {
        console.log(res,'插件跳转成功回调')
        // 统计
      },
      fail: (res) => {
        console.log(res,'失败回调')
      },
      complete: (res) => {
        console.log(res,'结束回调')
      }
    })

  }
});
