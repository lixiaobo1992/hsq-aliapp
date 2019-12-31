import {
  me,
  xmini,
  mapState,
  xPage,
  mapActions
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  mapTo,
  dealPrice,
} from '/utils';
import CountManger from '/utils/CountManger';
import {
  // formatCountDown,
  // formatCountDownObj,
  formatDate,
  formatLeftTimeObj
  } from '/utils/dateUtil';
  import { isEmptyObject } from '/utils/is';
import backHome from '/components/back-home';
import AParse from '../../aparse/aParse';
import authMixin from '/utils/authMixin';
import riskgoMixin from '/utils/riskgoMixin';

import skuMixin from '/components/sku-select/skuMixin';
import coupon from '../../components/coupon-list/coupon';

const app = getApp();
let width;

// let skusKey;
// let dataAttrs;
// let attrDatasList = [];

xPage({
  ...mixins,
  ...skuMixin,
  ...backHome,
  ...riskgoMixin,
  ...coupon,

  _data: {
    // 收藏／未收藏的icon
    unLikeImg: 'https://img1.haoshiqi.net/miniapp/unlike_879608c2d8.png',
    likeImg: 'https://img1.haoshiqi.net/miniapp/like_93c1d5ceb0.png',

  },
  data: {
    isLoading: true,
    // sku
    isShowPopup: false, // v-model


    cartNumber: 0,
    showCoupons: false, //是否显示优惠券列表
    sucToast:false, // 显示领取成功的toast

    normSelectTag: 0,
    currentSum: 1,
    maxBuySum: 100,
    skuBtnStatus: {
      isBtnActive: true, // 按钮否可用
      buyBtnText: '立即购买',
      cartBtnText: '加入购物车',
    },

    attrList: [],
    skuStocksList: {}, // 属性ID 对应 sku列表

    // defaultSelectedIds: [], // 默认已选择id
    // defaultSkuData: {}, // 默认skuData
    currentSkuData: {}, // 当前skuData

    smallCurrentSkuData: {},

    selectedAttrName: [], // 已选择 attr
    notSelectedAttrName: '', // 未选择属性提示

    // sku end
    couponList:[],//显示的券详情
    isShowGoHome: false,
    shareInfo: true,
    priceObj: {
      price: '',
      point: '',
      marketPrice: '',
    },
    didShowCitySelection: false,
    currentCity: {},
    descData: {},
    labels: [],
    coupons: [],//领券列表
    // pinActivitiesId: -1,
    // skuId: -1,
    // showNewUserRule: false, // 显示新人首单立减规则
    // promotions: [],
    priceExplain: '被划去的“价格”指同品牌同种等量规格的商品在国内大陆地区主流电商平台，但不仅限于电商平台上的标示价格、或厂家、供应商的指导价；商品实际售价为本平台实时销售价格\n\n“单独购“为拼团产品中1人单买价格，”X人团“为拼团产品中多人（人数大于或等于2人）拼团购买价格',
    // showSelect: false,
    // amountNum: 1,
    merchantData:{},
    riskgoAd: {  // riskgo 广告
      src: '',
      link:''
    },
    showAct:false,
    onShowPromotionInfo: false,
    isMember: false, // 是否是轻会员商品
    //轻会员card
    memberCard: {
      status: 0,
      title: '',
      getPrice: 0,
      desc: '',
      btnText: '立即开通',
    },
    userIsMember: false, // 用户是否开通轻会员
    isInit: true,
    ...mapState({
      logged: state => state.user.logged,
      // userInfo: state => state.user.userInfo,
    })
  },

  onLoad(query) {
    this.onPageInit(query);
    this.setData({
      skuId: query.id,
    });
    this.initData();
    width = my.$getSystemInfo().windowWidth;
  },

  refresh(query = this.pageQuery){
    const { id = '33988' } = query;
    if (id) {
      // console.log(query.id, 'query.id data');
      this.getItemInfo(query.id);
    }
  },

  onShow(){
    this.setData({
      isInit: true
    })
    this.refresh();
    this.updateUserCart();
    if (this.acticityType) {
      this.startActivityCountDown();
    }
  },
  onReady() {
    this.checkNewCurrentCity();
  },
  clearCountDown() {
    if (this.activityCountManager) {
      this.activityCountManager.clear();
      this.activityCountManager = null;
    }
  },
  ...mapActions([
    'getGeo',
  ]),
  getGeoLocation() {
    this.setData({
      isInit: false
    })
    // 获取地址位置
    this.getGeo({
      name: 'app',
      success: res => {
        console.warn('app.js 定位回调', res);
        let currentAddress = res.province + ' ' + res.city;
        xmini.store.dispatch('setAddressInfo', { "currentProvinceId": res.provinceId, "currentAddress": currentAddress, "addressId": null, "cityId": res.cityId });
        this.setLocation();
        this.checkDelivery();
      },
      fail: err => {
        console.log(err);
        this.setLocation();
        this.checkDelivery();
      },
      hasLocation: () => {
        this.setLocation();
        this.checkDelivery();
      }
    })
  },
  setLocation() {
    const { addressInfo } = xmini.store.state.location;
    this.setData({
      currentCity: addressInfo,
    });
  },
  initData() {
    this.setLocation();
    const { logged } = this.data;
    const that = this;
    if (!logged) {
      app.onSubscribeEvent(this, 'LOGIN_SUCCESS', function(){
        that.updatedRiskgoData()
      })
    } else {
      that.updatedRiskgoData()
    }
  },
  //选择城市
  onSelectCity() {
    this.setData({
      didShowCitySelection: true,
    });
    xmini.piwikEvent('pv_add');
  },
  checkDelivery() {
    api.checkDelivery({
      skuId: this.data.skuId,
      isLoading: !this.data.isInit
    }, res => {
      const { data = {} } = res;
      const { canDelivery, freightInfo = '' } = data;
      this.setData({
        canDelivery,
        freightInfo
      })
    }), err => {
      console.log(err);
    }
  },

  onSelectingNewCity() {
    const { addressInfo } = xmini.store.state.location;
    if (addressInfo.currentAddress != this.data.currentCity.currentAddress) {
      this.setData({
        currentCity: addressInfo,
      });
      this.checkDelivery();
    }
  },

  checkNewCurrentCity() {
    const { addressInfo } = xmini.store.state.location;
    let newAddress = this.data.currentCity.currentAddress != addressInfo.currentAddress;
    if (newAddress) {
      this.setData({
        currentCity: addressInfo,
      });
      this.refresh();
      this.postMessage('index', {
        needRefresh: true,
      });
    }
  },
  // 当前sku 改变时调用
  skuDataOnChange(skuData = {}) {
    if (!skuData.skuid) return;
    this.getItemInfo(skuData.skuid);
  },
  // 获取商品信息
  getItemInfo(id) {
    const that = this;
    // this.setData({
    //   isLoading: true,
    // })
    api.getItemInfo({
      skuId: id,
      // skuId:35136,
      scope: this,
      weights: 1,
    }, (res) => {
      const data = res.data;
      this.timestamp = res.timestamp;

      const {
        id = 0,
        productId = 0,
        pics = [] , // banner 图

        merchantInfo = {}, // 商家信息
        merchant_type, //商家信息类型

        attrs = [],
        attrDatas = {},
        attrKeys = [],

        name = '',
        thumbnail = '',

        description = '',
        restriction_amount = 0,

        pricePrefix = '¥',
        price = 0,
        market_price = 0,
        left_stock = 0,

        enabled = false,

        is_like = false,

        coupons = [],

        labels = [],

        activityPreheat, // // 活动预热的数据

        shareInfo = {},

        canDelivery,
        freightInfo = '',
        maxCartSkuCnt = 100,

        light_member_price = 0,
        is_light_member,
      } = data;

      const swiperList = (pics || []).map((item) => {
        return {
          image: item,
          url: '',
        };
      });

      const { alipay = {} } = shareInfo;

      // const noStock = data.left_stock < 1 ? true: false; // 是否已抢光
      // const unLine = data.coupleIsOnline ? false: true;  // 是否已停售

      // 商家信息
      const newMerchantData = {
        ...merchantInfo
      }
      const isMember = light_member_price ? true : false;
      let userIsMember = is_light_member ? true : false; // 用户是否是轻会员
      // is_like 是否收藏
      const collectionImg = is_like ? this._data.likeImg : this._data.unLikeImg;
      // 价格的逻辑
      let priceObj = {};
      if(light_member_price && userIsMember){
        priceObj = {
          rmb: 1,
          price: light_member_price,
          singlePrice:price,
          marketPrice: market_price,
        };
      }else if(light_member_price){
        priceObj = {
          rmb: 1,
          price: price,
          singlePrice:price,
          marketPrice: market_price,
        };
      }else{
        priceObj = {
          rmb: 1,
          price,
          marketPrice: market_price,
        };
      }

      function mapObj(obj, cb) {
        const result = {};
        const temp = {};
        for (const key in obj) {
          result[key] = cb(obj[key], key);
        }
        return result;
      }

      const stocksList = mapObj((attrDatas || {}), item => {
        return {
          id: item.id,
          name: item.name,
          thumbnail: item.thumbnail,
          price: item.price,
          priceText: dealPrice(item.price),
          market_price: item.market_price,
          left_stock: left_stock?left_stock:item.left_stock,
          skuid: item.id,
          max_buy_num: item.left_stock,
        };
      });

      // 处理活动预热模块数据
      let showAct = false;
      let tempActivityPreheat = {
        activityType: activityPreheat && activityPreheat.activityType || 0, // 营销活动类型：1 普通 2 秒杀
      };
      // 判断是否有秒杀活动
      if (activityPreheat) {
        let tempPrice = activityPreheat.activityPrice || 0;
        if (light_member_price && userIsMember) {
          tempPrice = light_member_price || 0;
        }

        tempActivityPreheat.price = dealPrice(tempPrice).split('.');
        tempActivityPreheat.selfPrice = tempPrice;
        tempActivityPreheat.activityStock = activityPreheat.activityStock || 0;
        tempActivityPreheat.activityMarketPrice = (activityPreheat.marketPrice / 100).toFixed(2);
        showAct = true;
        if (res.timestamp > activityPreheat.startTime && res.timestamp <= activityPreheat.endTime) {
          // 活动中
          tempActivityPreheat.activityCountTip = '距离结束还有'
          tempActivityPreheat.activityStatus = 'start'
        } else if (res.timestamp <= activityPreheat.startTime) {
          // 活动还没开始
          tempActivityPreheat.activityCountTip = '距离开始还有'
          tempActivityPreheat.activityStatus = 'ready'
        } else {
          tempActivityPreheat.activityStatus = 'end'
          showAct = false;
        }

        // 活动进度条展示
        tempActivityPreheat.rateNumber = 100 - (parseInt( tempActivityPreheat.activityStock / activityPreheat.allStock * 100) || 0);

        tempActivityPreheat.activityPrice = activityPreheat.activityPrice || 0;
        tempActivityPreheat.activityStartTimeTip = `${formatDate(activityPreheat.startTime || 0, 'M.D H:F')}开抢`;

        tempActivityPreheat.activityStartTime = activityPreheat.startTime || 0;
        tempActivityPreheat.activityEndTime = activityPreheat.endTime || 0;
      }

      const smallCurrentSkuData = {
        priceText: '￥' + dealPrice(priceObj.price),
      }
      this.setData({
        isLoading: false,

        smallCurrentSkuData,
        attrList: attrKeys,
        skuStocksList: stocksList,

        maxBuySum: maxCartSkuCnt,
        'skuBtnStatus.isBtnActive': enabled && left_stock ? true: false, // 按钮否可用'



        descData: {
          merchant_type: merchant_type,
          title: name,
          pricePrefix: pricePrefix,
          desc: (description || '').replace(/[\r\n]/g, ''),
          restriction_amount: restriction_amount || 0,
          left_stock: left_stock,
          is_show_stock: (left_stock <= 30 && left_stock >= 0) ? true : false,
          // price: data.price,
          // marketPrice: data.market_price,
        },
        priceObj,
        // 多件优惠信息,活动预热倒计时
        showAct,
        activityPreheat: tempActivityPreheat,

        is_like,
        collectionImg,
        // noStock,
        // unLine,
        // showArrow,

        canDelivery,
        freightInfo,

        shareInfo: {
          title: alipay.title,
          desc: alipay.content,
          imageUrl: alipay.thumbnail,
          piwikAction: '详情页分享',
        },
        swiperInfo: {
          list: swiperList || [], // 如果数据不符合格式，可以使用 mapTo 方法
          hwRatio: 1,
          height: width,
        },
        // 促销信息
        promotions: merchantInfo && merchantInfo.promotions || [],
        labels,
        merchantData: newMerchantData,

        coupleList: coupons,
        isMember,
        memberPrice: light_member_price,
      }, () => {
         // 计算当前传入价格
        let tempPrice = 0
        if (light_member_price) {
          tempPrice = light_member_price
        } else if (tempActivityPreheat.selfPrice && tempActivityPreheat.activityType !==2) {
          tempPrice = tempActivityPreheat.selfPrice
        } else {
          tempPrice = priceObj.price;
        }

        this.getMemberInfo({
          price: tempPrice,
        });
      });
      //初始化时获取位置信息
      if (this.data.isInit) {
        this.getGeoLocation();
      }

      this.getSkuDetailMore(productId);
      if (showAct && tempActivityPreheat.activityStatus == 'ready') {
        this.acticityType = 1;
        this.startActivityCountDown()
      } else if (showAct && tempActivityPreheat.activityStatus == 'start') {
        this.acticityType = 2;
        this.startActivityCountDown()
      }
    }, (err) => {
      // console.log(err);
    });
  },

  closeCitySelection() {
    this.setData({
      didShowCitySelection: false
    })
  },

  startActivityCountDown(type = this.acticityType) {
    const { activityPreheat } = this.data;
    const that = this;
    const diffTime = Date.now() - this.timestamp * 1000;
    this.diffTime = diffTime
    const localStartTime = activityPreheat.activityStartTime * 1000 + diffTime;
    this.localStartTime = localStartTime
    const localEndTime = activityPreheat.activityEndTime * 1000 + diffTime;
    this.localEndTime = localEndTime

    if (this.activityCountManager && this.activityCountManager.clear) {
      this.activityCountManager.clear();
    }

    this.activityCountManager = new CountManger({
      times: 1000,
      dataList: [{}],
      set() {
        // 剩余结束时间
        const leftEndTimes = that.localEndTime - Date.now();
        // 剩余开始时间
        const leftStartTimes = that.localStartTime - Date.now();
        if (leftEndTimes > 0 || leftStartTimes > 0) {
          this.start();
        }else{
          this.clear();
          that.refresh();
        }
      },
      callback() {
        let leftEndTimes = that.localEndTime - Date.now();
        let leftStartTimes = that.localStartTime - Date.now()
        // 没开始的状态，且还没到开始时间
        if (leftStartTimes > 0 && type == 1) {
          // 活动还没开始，倒计时
          that.setData({
            'activityPreheat.activityStatus': 'ready',
            'activityPreheat.activityCountTip': '距离开始还有',
            'activityPreheat.activityTime': formatLeftTimeObj(leftStartTimes) || 0,
          })
        } else if (leftStartTimes <= 0 && type == 1) {
          // 没开始的状态，且到了开始时间，清除倒计时，重新调接口
          this.clear();
          that.refresh();
        } else if (leftEndTimes > 0 && type != 1) {
          // 活动开始了的状态，且活动还没结束，倒计时
          that.setData({
            'activityPreheat.activityStatus': 'start',
            'activityPreheat.activityCountTip': '距结束还有',
            'activityPreheat.activityTime': formatLeftTimeObj(leftEndTimes)
          })
        } else if (leftEndTimes <= 0 && type != 1) {
          // 活动开始的状态，且活动已结束，清除倒计时，重新调接口
          this.clear();
          that.refresh();
        }
      },
    })
  },
  //显示优惠券
  showCoupons() {
    this.setData({
      showCoupons: true,
    },() => {
      this.couponParams = {
        merchantId : this.data.merchantData.id,
        skuId: this.data.skuId,
      }
      this.getCouponList();
    });
  },
  onHandleItem(data) {
    const { index, type }  = data;
    if (type == 'close') {
        this.setData({
          showCoupons: false,
        });
    }else {
      this.getCoupon(data);
    }
  },
  onHide() {
    this.clearCountDown();
    this.hideToast();
  },
  onUnload() {
    this.hideToast();
  },

  // 显示/隐藏 店铺优惠
  onShowShopDiscount() {
    const toggleShow = this.data.showshopDiscount
    this.setData({
      showshopDiscount: !toggleShow,
    })
  },
  //显示/隐藏 促销信息弹窗
  onShowPromotionCon() {
    this.setData({
      onShowPromotionInfo: !this.data.onShowPromotionInfo,
    });
  },
  toggleCollection() {
    if (this.data.is_like) {
      this.removeCollection();
    } else {
      this.addCollection();
    }
  },
  removeCollection() {
    api.removeLikeProduct({
      skuIds: this.data.skuId,
    }, (res) => {
      this.setData({
        is_like: false,
        collectionImg: this._data.unLikeImg,
      });
    });
  },
  addCollection() {
    api.addLikeProduct({
      skuIds: this.data.skuId,
    }, (res) => {
      this.setData({
        is_like: true,
        collectionImg: this._data.likeImg,
      });
    });
  },

  // 获取图文详情
  getSkuDetailMore(pid) {
    let that = this;
    api.getProductDetail({
      productId: pid,
      sourceType: 4,
    }, (res) => {
      const detailMore = res.data;
      // 富文本处理
      const tempDetail = detailMore.graphicDetail;
      AParse.aParse('data', 'html', tempDetail, that, 10, 'detail');

    }, (err) => {
      // console.log(err);
    });
  },

  // 跳转到在线客服
  toCustomService() {
    xmini.piwikEvent('详情页点击联系客服');
    this.forward('service');
  },

  goCart() {
    xmini.piwikEvent('c_cartbtn');
    this.forward('shopping-cart');
  },
  onSelectNorm() {
    this.setData({
      normSelectTag: 0,
      isShowPopup: true,
    });
  },
  goAddCart(e) {
    if(!this.data.skuBtnStatus.isBtnActive) return;
    this.setData({
      normSelectTag: 1,
      isShowPopup: true,
    });
    my.pageScrollTo({ scrollTop: 0 });
  },
  goBuyCommit(e) {
    // console.log('goBuyCommit', e);
    if(!this.data.skuBtnStatus.isBtnActive) return;
    this.setData({
      normSelectTag: 2,
      isShowPopup: true,
    });
    my.pageScrollTo({ scrollTop: 0 });
  },
  goOrderCommit(data) {
    const skus_info = [
      {
        s: this.data.currentSkuData.skuid,
        c: this.data.currentSum,
        p: this.data.currentSkuData.price
      }
    ]
    this.forward('order-commit2', {
      skus_info: JSON.stringify(skus_info),
      orderType: 1,
      isFastbuy: 1, // 立即购买
    });
  },
  fetchAddCart() {
    const data = this.data.currentSkuData;
    api.addSkuToCart(
      {
        type: 1,
        skuId: data.skuid,
        amount: this.data.currentSum,
      },
      res => {
        this.updateUserCart();
        my.showToast('添加购物车成功');
        this.clearCountDown();
        this.setData({
          isShowPopup: false,
        });
      }
    )
  },
  updateUserCart() {
    api.getUserCart(
      {
        isLoading: false,
      },
      res => {
        this.setData({
          cartNumber: res.data.total_sku_cnt,
        });
      },
      err => {
        return true;
      }
    );
  },
  // 接收sku 点击的事件
  onBtnClick(data) {
    // console.log(data);
    const { type } = data;
    switch(type) {
      case 'buyBtn':
        xmini.piwikEvent('c_buy', { skuid: this.data.currentSkuData.skuid });
        this.goOrderCommit();
        this.clearCountDown();
        this.setData({
          isShowPopup: false,
        });
        break;
      case 'addShoppingCart':
        xmini.piwikEvent('c_addcart', { skuid: this.data.currentSkuData.skuid });
        this.fetchAddCart();
        break;
    }
  },
  // 跳转到拼团规则页
  toRule() {
    xmini.piwikEvent('详情页点击拼团规则');
    this.forward('rule');
  },

  // 跳转到店铺首页
  goStore(){
    xmini.piwikEvent('c_store_info')
    let id = this.data.merchantData.id;
    this.forward('merchant', { id });
  },
  //获取轻会员信息
  getMemberInfo({price = 0}){
    api.setMemberDiscount(
      {
        price: price || 0,
      },
      res => {
        const {
          desc = '',
          discount_value = 0,
          is_light_member = false,
          to_get_price = 0
        } = res.data;
        let userIsMember = is_light_member ? true : false;; // 用户是否是轻会员
        let isShow = true;
        if (!isEmptyObject(res.data)) {
          isShow = false
        }
        const memberCard = {
          isShow: isShow,
          status: is_light_member,
          title: `${!userIsMember?'加入':''}轻会员立减${ dealPrice(discount_value, 100, false) }元·`,
          getPrice:`¥${dealPrice(to_get_price)}` ,
          desc: desc,
          btnText: is_light_member ? '查看权益' : '立即开通',
        };
        this.setData({
          memberCard,
          userIsMember,
        });
      },
      err => {
        console.log(err, 'err');
      },
    )
  },
  memberBtn() {
    const { logged, userIsMember } = this.data;
    if (userIsMember) {
      xmini.piwikEvent('c_checkmember');
    } else {
      xmini.piwikEvent('c_getmember');
    }
    if (logged) {
      this.forward('member');
    } else {
      const that = this;
      authMixin.userAuthLogin({
        authType: 'auth_base',
        success: res => {
          //从新获取用户信息 会死循环吗
          that.forward('member');
        },
        fail: err => {},
      });
    }
  },
  //跳转到凑单列表页
  onPinDetail(e){
    console.log();
    const { id,merchantid } = e;
    xmini.piwikEvent('coudanentry',{ activityid:id,merchantid:merchantid,skuid:this.data.skuId });
    this.forward('full-reduction',{id,merchantId:this.data.merchantData.id});
  },
});
