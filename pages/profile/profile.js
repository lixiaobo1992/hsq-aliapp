import {
  me,
  xmini,
  mapState,
  mapActions,
  xPage,
  storage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  mapTo,
  pullList,
  dealPrice,
} from '/utils';
import authMixin from '/utils/authMixin';
// import tabbar from '/components/tabbar/tabbar';
import { version } from '/app.json';


const app = getApp()


const orderInfo = [
  {
    image: 'https://img1.haoshiqi.net/miniapp/icon-not-pay_9419c46aa7.png',
    text: '待付款',
    type: 1,
    num: 0,
  },
  {
    image: 'https://img1.haoshiqi.net/miniapp/icon-not-ship_b01b458f79.png',
    text: '待收货',
    type: 2,
    num: 0,
  },
  // {
  //   image:https://img1.haoshiqi.net/wxapp/img/profile/wait_to_evaluate_f914e0c0ea.png',
  //   text:'待评价',
  //   type: 3
  // },
  {
    image: 'https://img1.haoshiqi.net/miniapp/icon-after-sale_ed3f5bc6bf.png',
    text: '售后',
    type: 4,
    num: 0,
  },
];
const serviceInfo =[
  {
    image:"https://img1.haoshiqi.net/miniapp/icon-integral-order_b17ff93515.png",
    type: 'point',
    text:'积分订单',
    num:0,
  },
  {
    image:"https://img1.haoshiqi.net/miniapp/icon-pin-order_86d4488481.png",
    type: 'couple',
    text:'我的拼团',
    num:0,
  },
  {
    image:"https://img1.haoshiqi.net/miniapp/icon-serve_366eb07a9d.png",
    type: 'server',
    text:'在线客服',
    num:0,
  },
  {
    image:"https://img1.haoshiqi.net/miniapp/icon-address_c270283e75.png",
    type: 'address',
    text:'收货地址',
    num:0,
  },
];

xPage({
  ...mixins,
  ...pullList,
  // ...tabbar, // 底部菜单
  data: {
    isLoading: true,
    // currentPage: 'profile', // 底部tabbar
    scale: 'aspectFit',
    orderInfo: orderInfo,
    serviceInfo: serviceInfo,
    // listData,
    shareInfo: true,
    numInfo:{
      favoritesProductCnt:0,
      favoritesMerchantCnt:0,
      couponCnt:0,
    },
    memberInfo:{},
    listMode: 'card',
    sourcelist: [],
    pullLoading:false,
    showFooter: false,
    recommend_source_id:0,
    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    }),
  },
  ...mapActions(['setUserInfo']),
  onLoad(query) {
    this.onPageInit(query);
    // this.refresh();
    // console.log(this.data,'userInfo data');
    this.setData({
      version,
      shareInfo: {
        piwikAction: '个人中心分享',
      },
    });
  },
  onPullDownRefresh() {
    this.refresh();
  },
  onShow() {

    this.updatadSpmPage(); // 新增更新spm 三段中的 page

    // tabbar跳转到圈子时可以通过这个知道是从哪个页面跳转过来的
    storage.set('lastPage', 'profile', 86400);
    storage.set('needBack', false, 86400);

    this.refresh();
  },
  refresh() {
    const { logged, userInfo } = this.data;
    if (logged) {
      this.getProfile();
    } else {
      this.newAuth()
    }
  },
  newAuth(){
    const that = this;
    authMixin.userAuthLogin({
      authType: 'auth_base',
      success: (res) => {
        //从新获取用户信息 会死循环吗
        // console.log('从新获取用户信息')
        that.getProfile()
      },
      fail: (err) => {
        console.log(err);
        that.setData({
          isLoading: false,
        })
      }
    })
  },

  getProfile() {
    this.setData({
      isLoading: true,
    })
    api.getProfile({
      scope: this,
      weights: 1,
    }, (res) => {
      const { data = {} } = res;
      this.setUserInfo(data.userInfo);
      // app.updateData({
      //   userInfo: data.userInfo,
      // });
      // console.log(data,'data.userInfo');
      let orderInfo = this.data.orderInfo || [];
      for (let i = 0; i < orderInfo.length; i++) {
        let item = orderInfo[i];
        switch (item.type) {
          case 1:
            item.num = data.toPayNum;
            break;
          case 2:
            item.num = data.toReceiptNum;
            break;
          case 3:
            //
            break;
          case 4:
            item.num = data.toRefundNum;
            break;
          default:
            // do
        }
      }

      const {
        pinOrderCnt,
        couponCnt,
        favoritesProductCnt,
        favoritesMerchantCnt,
        userInfo: tempUser,
        light_member_expose_info:memberInfo,
        recommend_source_id,
      } = data;
      const { listData,serviceInfo } =  this.data
      let numInfo = {couponCnt,favoritesProductCnt,favoritesMerchantCnt};
      this.data.recommend_source_id = recommend_source_id;
      console.log(memberInfo,'numInfo data',this.data);
      // 我的拼团订单
      if (pinOrderCnt) {
        serviceInfo[1].num = pinOrderCnt;
      }

      this.setData({
        isLoading: false,
        orderInfo,
        serviceInfo, //工具与服务信息
        numInfo, //数量信息
        memberInfo,//会员信息
        recommend_source_id,
      },() => {
        recommend_source_id && this.getRecommendList();
      });
      // console.log(this,'this data');
    }, (err) => {
      this.setData({
        isLoading: false,
      })
      // 需要登录时，返回
      if (err.errno === 510010) {
        //
        this.newAuth()
        return;
      }
    });
    //this.onScrollToLower();
  },
  getRecommendList(){
    this.initPullList();
    this.pullParams.sourceId = this.data.recommend_source_id;
    // console.log(this.pullParams,'this.pullParams');
    this.pullModel = api.getRecommendlist;
    this.onScrollToLower();
  },
  dealList(list) {
    // console.log(list, 'list')
    return mapTo(list, (item,index) => {
      // console.log(item,'item')
      return {
        ...item,
        tags: (item.tags || []).splice(0, 2),
        market_price: (item.market_price / 100).toFixed(2),
        price: this.productPrice((item.price / 100).toFixed(2)),
        light_member_price: dealPrice(item.light_member_price),
        // link: `https://m.haoshiqi.net/v2/couple-detail?id=${item.biz_id}`,
        expired_date_text: item.expired_date_text_two,
        link:item.link,
        // 这里可以添加统计信息
        piwikEvent: 'c_member_inviteproduct2',
        piwikData: {
          url: item.link,
          index,
          pin_id: item.pin_id
        }
      };
    });
    // this.data.list = list;
    // console.log(this.data.list, 'this.data.list');
  },
  // 处理商品价格数据
  productPrice(price) {
    let priceArray = price.split('.');
    return {
      price_yuan: priceArray[0],
      price_fen: priceArray[1],
    };
  },
  afterPullData(list, res) {},
  handleListItemTap: function (e) {
    const { index, type } = e.currentTarget.dataset;
    // console.log(type,'type')
    // console.log(index,'index type')
    switch (type) {
      case 'favorite': // 跳我的收藏
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'我的收藏',
        });
        this.forward('favorite-list',{
          type: index || 0,
        });
        break;

      case 'coupon': // 跳我到优惠券
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'我的优惠券',
        });
        this.forward('coupon-list');
        break;
      case 'couple': // 拼团订单
        xmini.piwikEvent('个人中心点击拼团订单');
        this.forward('couple-order-list', {
          type: 1,
        });
        break;
      case 'point': // 拼团积分订单
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'我的拼团',
        });
        let jumpTaobao = my.getStorageSync({ key: 'joinTaobao' });
        if(jumpTaobao.data){
          this.forward('pages/jump/jump', {
            appname: 'point',
          })
        }else{
          this.forward('pages/order-list/order-list', {
            appname: 'point',
          })
        }
        break;
      case 'address': // 收货地址
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'收货地址',
        });
        this.forward('address-list');
        break;
      case 'server': //客服
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'官方客服',
        });
        this.goService();
        break;
      case 'vip':
        // console.log('跳转开通会员！');
        xmini.piwikEvent('c_membercentre',{
          name:'会员中心',
        });
        this.forward('member');
        break;
      case 'setup':
        xmini.piwikEvent('c_gerenzhongxin', {
          name: '设置'
        });
        this.forward('setup');
        break;

    }
  },

  goOrderList(e) {
    const type = e.currentTarget.dataset.orderType || 0;
    // console.log(e.currentTarget);
    this.forward('order-list', {
      type,
    });
    switch (type) {
      case 0:
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'个人订单',
        });
        break;
      case 1:
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'待付款',
        });
        break;
      case 2:
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'待收货',
        });
        break;
      case 3:
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'待评论',
        });
        break;
      case 4:
        xmini.piwikEvent('c_gerenzhongxin',{
          name:'售后',
        });
        break;
      default:
        break;
    }

  },

  goService() {
    this.forward('service');
  },

});
