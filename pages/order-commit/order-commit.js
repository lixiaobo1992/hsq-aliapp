import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  orderPay,
  urlfix,
  dealPrice,
} from '/utils';
import { clone } from '/utils/objectUtil'
import {
  Trim,
} from '/utils/stringUtil'
import authMixin from '/utils/authMixin'

import animModal from '/components/order-commit-pop';

import urlParams from '/utils/urlParams';
const app = getApp();

const statusIconArray = { // 商品标签
  restriction: 'https://img1.haoshiqi.net/miniapp/order-confirm/limit_buy_73e41b6a47.png', // 限购
  noDelivery: 'https://img1.haoshiqi.net/miniapp/order-confirm/order_no_delivery_62e02eccc4.png', // 无法配送
  lowstock: 'https://img1.haoshiqi.net/miniapp/order-confirm/order_no_enouth_left_24246f95aa.png', // 库存不足
  outstock: 'https://img1.haoshiqi.net/miniapp/order-confirm/order_no_left_768caaf448.png', // 已抢光
  offline: 'https://img1.haoshiqi.net/miniapp/order-confirm/order_off_shelf_d4c20a5bf0.png', // 已停售
};

xPage({
  ...mixins,
  ...orderPay,
  ...animModal.animOp,
  ...urlParams,
  _data: {
    tempInputTime: null,

    initParams: {},

    listenAddressResult: false, // 去选地址了
    listenCoupons: false, // 去选券了
  },
  data: {
    ...animModal.data,

    isLoading: true,

    orderType: 0,             // 订单类型：2单人购 3拼团
    isFastbuy: true, // 直接购买

    // 可用平台券列表
    platformCouponList: [],
    // 当前使用的平台券
    currentPlatformCoupon: {
      value: 0
    },
    // 商家优惠券
    merchantCoupon: {},

    savePrice: 0, // 省的金额
    savePriceText: '',

    totalPrice: 0, // 订单总金额
    needPayPrice: 0, // 支付金额
    needPayPriceText: '',
    totalAmount: 0, // 总件数
    discountTotal: 0, // 优惠的金额
    discountTotalText: '',

    productList: [],

    notes: {}, // 买家留言

    windowHidden: true, // 默认隐藏弹窗
    popWindowData: {},

    msgboard: {  // 公告
      title: ''
    },

    currentMerchantIndex: 0,
    isOfferPopupShow: false, // 多件优惠

    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
      address: state => state.order_commit.address,
    })
  },

  onLoad(query) {
    this.onPageInit(query);
    // 保存订单数据
    let orderType = query.orderType || 3
    if (this.pageQuery.zlFlag) {
      orderType = 7
    }
    this.setData({
      orderType: orderType, // 默认拼团
    });

    this.refresh();
    // 获取公共信息
    this.getMsgboard();
  },

  onUnload() {

  },

  refresh() {
    this.updateInitParams();
    if(this.pageQuery.zlFlag){
      this.zlOrderInit()
    }else{
      this.orderInit();
    }
  },

  // 生命周期函数--监听页面显示
  onShow() {

    const { listenAddressResult, selectCouponType } = this._data;

    // 选完地址|选完券刚回来
    if (listenAddressResult || selectCouponType) {
      this.refresh()
      return;
    }

    this.onMessage();
  },
  // 显示隐藏多件优惠
  setOfferPopup() {
    this.setData({
      isOfferPopupShow: !this.data.isOfferPopupShow,
    })
  },

  // 更新 初始化参数
  updateInitParams() {
    let params = {...this.pageQuery};

    this._data.listenAddressResult = false;

    // 更新券参数
    if (this._data.selectCouponType) {

      const { type, merchantId } = this._data.selectCouponType


      // 处理一个需求 当选择券回来时需要在init order 接口传券的信息参数，当加减 商品数量，改变地址时不需要传递
      this._data.selectCouponType = null;

      const { currentCoupon } = xmini.store.state.order_commit;

      let currentPlatformCoupon = clone(this.data.currentPlatformCoupon || '');
      let merchantCoupon = clone(this.data.merchantCoupon);

      let jsonInfo = [];


      // 选择门店券刚回来
      if (type == 1 && merchantId) {
        merchantCoupon[merchantId].currentMerchantCoupon = currentCoupon;
      } else if (type == 2) {
        currentPlatformCoupon = currentCoupon;
      }

      jsonInfo = this.getCouponInfo({ currentPlatformCoupon, merchantCoupon });

      params.jsonInfo = jsonInfo;

    } else {
      // jsonInfo
    }
    console.log('===params:', params);
    this._data.initParams = params;
  },
  getCouponInfo({currentPlatformCoupon, merchantCoupon}) {
    const jsonInfo = [];
    const merchantCouponKeys = Object.keys(merchantCoupon);
    for(let i = 0; i < merchantCouponKeys.length; i++){
      const key = merchantCouponKeys[i];
      const currentMerchantCoupon = merchantCoupon[key].currentMerchantCoupon;
      let status = 1;
      if (!currentMerchantCoupon || !currentMerchantCoupon.coupon_code) {
        status = 0
      }
      jsonInfo.push({
        merchantId: key,
        couponCode: status ? currentMerchantCoupon.coupon_code : '',
        status
      })
    }

    // 平台券
    if (currentPlatformCoupon) {
      let status = 0;
      if(currentPlatformCoupon.coupon_code) {
        status = 1;
      }
      jsonInfo.push({
        couponCode: currentPlatformCoupon.coupon_code || '',
        status
      })
    }

    return jsonInfo;
  },
  // 选择优惠券
  selectCouponEvent(e) {
    const { type, merchantId } = e.currentTarget.dataset;

    let couponList = [];
    let couponType = 0
    let currentCoupon = {};
    // 选择商家券
    if (type == 'merchant' && merchantId) {
      const currentMerchant = this.data.merchantCoupon[merchantId]
      couponList = currentMerchant.list || [];
      currentCoupon = currentMerchant.currentMerchantCoupon
      couponType = 1; // 商家券
    } else if(type == 'platform') {
      couponList = this.data.platformCouponList || [];
      currentCoupon = this.data.currentPlatformCoupon;
      couponType = 2; // 平台券
    }

    // if (!couponList.length || !couponType) return;

    if (!couponType) {
      return;
    } else if(couponType == 1 && !couponList.length){
      return;
    }

    this._data.selectCouponType = {
      type: couponType,
      merchantId,
    }

    xmini.store.dispatch('setCurrentCoupon', currentCoupon);
    xmini.store.dispatch('setSelectCouponList', couponList);


    let tempQuery = {
      coupon_type: couponType,
      source: 'couple'
    }
    // 当用户选择平台券时 需要在可选券列表调用 轻会员可用券列表;
    if (couponType == 2) tempQuery.price = this.data.productList[0].needPayPrice || 0

    this.forward('availabel-coupon-list', tempQuery);
  },

  // 去选择地址
  onAddressBtnClicked(e) {
    xmini.piwikEvent('c_addaddress');
    this._data.listenAddressResult = true;
    const page = this.data.address.id ? 'address-list' : 'address-update';
    this.forward(page, {
      refresh: true,
      orderAddress: 1, // 说明是从订单确认页去的
    });
  },

  // 数量的改变
  countChangeVal(data) {
    // console.log(data);
    if (!this.data.isFastbuy) {
      return;
    }
    // data.oldVal
    // data.value
    let tempVal = 1; // 0 是增加 1减少
    if (data.value > data.oldVal) {
      tempVal = 0;
    }
    // xmini.piwikEvent('c_num', { skuid: this._data.skuInfo[0].skuId, index: tempVal, name: data.value });
    if (this.pageQuery.amount != data.value ){
      // 立即购买过来的 只有一个品
      this.pageQuery.amount = data.value;
      this.refresh();
    }
  },

  // 留言
  bindMessageInput(e) {
    // console.log(e);
    const { id } = e.currentTarget.dataset;
    const { value } = e.detail;
    clearTimeout(this._data.tempInputTime);
    this._data.tempInputTime = setTimeout(() => {
      this.setData({
      [`notes.${id}`]: Trim(value)
    })
    }, 500)
  },
  // 助力免单订单初始化
  zlOrderInit() {
    const initParams = this._data.initParams;
    const { address } = this.data;
    const that = this;
    this.setData({
      isLoading: true,
    })

    api.assistanceOrderInit({
      scope: this,
      weights: 1,

      activityId: initParams.id,
      activityEventId: initParams.eventId,
      orderType: 7,
      amount: initParams.amount || 1,
      addressId: address.id || 0,
    }, (res) => {
      this.dealInitData(res);
    }, (err) => {
      if (err.errno === 510010 || err.errno === 210013) {
          // this.forward('login', { authType: 'auth_user'}); // 主动授权
          authMixin.userAuthLogin({
            authType: 'auth_user',
            success: (res) => {
              that.refresh()
            },
            fail: (err) => {
              // my.hideLoading();
            }
          })
          return true;
        }
      if (err.errno === 910012) { // 还有未支付的订单
        this.forward('order-list', { type: 1, replace: true, isNotClick: true });
        return true
      }
      if (err.errno === 910112) { // 助力任务已支付
        this.forward('order-list', { type: 2, replace: true, isNotClick: true });
        return true
      }

      if (err.errno == 610021) {
        this.dealInitData(err);
        return true;
      }
    })
  },
  // 订单初始化
  orderInit() {
    const that = this;
    const initParams = this._data.initParams || {};
    const { address } = xmini.store.state.order_commit;
    if (!initParams.pinActivitiesId || !initParams.skuId) {
      my.showErrPage('无效商品Id');
      return;
    }
    this.setData({
      isLoading: true,
    })
    const params = {
      scope: this,
      weights: 1,

      orderType: this.data.orderType,
      pinActivitiesId: initParams.pinActivitiesId,
      skuId: initParams.skuId,
      amount: initParams.amount || 1,
      pinEventId: initParams.pinEventId,

      addressId: address.id || 0,

      couponCodeInfo: JSON.stringify(initParams.jsonInfo),
    };

    api.coupleOrderInit(
      params,
      (res) => {
        this.dealInitData(res);
      },
      (err) => {
        // console.log(JSON.stringify(err));
        if (err.errno === 510010 || err.errno === 210013) {
          // this.forward('login', { authType: 'auth_user'}); // 主动授权
          authMixin.userAuthLogin({
            authType: 'auth_user',
            success: (res) => {
              that.refresh()
            },
            fail: (err) => {
              // my.hideLoading();
            }
          })
          return true;
        }
        if (err.errno === 320007) {
          // 你不能参加自己的团
          my.showToast(`${err.errno}: ${err.errmsg}`);
          this.postMessage('couple-share', {
            needRefresh: true,
          });
          // this.back();
          setTimeout(() => {
            that.back();
          }, 1000);
          return true;
        }
        if (err.errno === 610021) {

          this.dealInitData(err);
          // this.setData({}, ()=>{
          //   // 是否有不可购买的商品
          //   if (this.data.canNotBuyList && this.data.canNotBuyList.length > 0) {
          //     this.onShowPopupWindow(this.data.canNotBuyList, true);
          //   }
          // })
          return true;
        }
      }
    );
  },

  // 提交订单
  orderSubmit() {
    const that = this;

    const {
      confirmSid= '',
      productList = [],
      address = {},
      needPayPrice = 0,
    } = this.data;

    xmini.piwikEvent('c_sumit',{
      pinActivitiesId: this.data.pinActivitiesId,
      orderType: this.data.orderType,
    });

    if (!confirmSid) {
      my.alert({
        title: '',
        content: `订单初始化失败！`,
        buttonText: '我知道了',
        success: () => {
        },
      });
      return;
    }


    // 是否有不可购买的商品
    if (this.data.canNotBuyList && this.data.canNotBuyList.length > 0) {
      this.onShowPopupWindow(this.data.canNotBuyList);
      return;
    }

    if (!address.id) {
      my.confirm({
        title: '提示',
        content: '您的收货地址为空，是否添加收货地址？',
        confirmButtonText: '添加',
        cancelButtonText: '取消',
        success: (result) => {
          if (result.confirm) {
            that.onAddressBtnClicked();
          }
        },
      });
      return;
    }

    let merchant_name = '';
    for(let i = 0; i< productList.length; i++){
      let tempPro = productList[i];
      if (!tempPro.canDelivery) {
        merchant_name = tempPro.merchant_name;
        break;
      }
    }

    if (merchant_name) {
      my.alert({
        title: '',
        content: `店铺${merchant_name}不支持配送您选择的收货区域`,
        buttonText: '我知道了',
        success: () => {
        },
      });
      return;
    }

    if (!needPayPrice) {
      my.confirm({
        content: '是否确认提交？',
        success: (result) => {
          if (result.confirm) {
            that.createOrder();
          }
        },
      });
      return
    }

    this.createOrder();

  },

  createOrder() {

    const {
      confirmSid= '',
      notes = {},
      productList = [],
      address = {},
      orderType,

      currentPlatformCoupon,
      merchantCoupon,
    } = this.data;

    const initParams = this._data.initParams || {};

    //这个临时处理下
    // const notesKey = Object.keys(notes);
    // const tempNotes = [];
    // if (notesKey.length) {
    //   for(let i = 0; i < notesKey.length; i++) {
    //     let tempKey = notesKey[i]
    //     tempNotes.push({
    //       merchantId: tempKey,
    //       note: notes[tempKey],
    //     })
    //   }
    // }

    const jsonInfo = this.getCouponInfo({ currentPlatformCoupon, merchantCoupon });

    let params

    my.showLoading();
    if(!this.pageQuery.zlFlag){
      params = {
        confirmOrderSerialId: confirmSid,
        couponCodeInfo: JSON.stringify(jsonInfo),
        notes: JSON.stringify(notes),
        addressId: address.id,
        orderType: orderType,

        conformNewUser: 0,
        isLoading: false,
      };

      // console.log("params ====== ", params);
      // 拼团订单提交
      this.orderSubmitNormal(params);

    }else{

      params = {
        confirmOrderSerialId: confirmSid,
        activityId: initParams.id,
        activityEventId: initParams.eventId,
        orderType: 7,
        amount: initParams.amount || 1,
        addressId: address.id,
        notes: JSON.stringify(this.data.notes),
        isLoading: false,
      }
      this.orderSubmitAssistance(params);
    }

  },
  // 助力免单提单
  orderSubmitAssistance(params) {
    api.assistanceOrderSubmit(params, (res) => {
      // console.log(JSON.stringify(res));
      this.payAction(res);
    }, (err) => {
      return this.payError(err);
    })
  },
  // 拼团订单提交
  orderSubmitNormal(params){
    api.orderSubmit(params, (res) => {
      // console.log(JSON.stringify(res));
      this.payAction(res);
    }, (err) => {
      return this.payError(err);
    });
  },
  payError(err){
    if (err.errno === 510010 || err.errno === 210013) {
      // 主动授权
      const that = this;
      authMixin.userAuthLogin({
        authType: 'auth_user',
        success: (res) => {
          that.orderSubmit()
        },
        fail: (err) => {
          my.hideLoading();
        }
      })
      return true;
    } else {
      my.hideLoading();
    }
    if (err.errno == "9210032" || err.errno == "9210033" || err.errno == "9910002") {
      this.refresh();
      return true;
    }
    if (err.errno == '9610020' || err.errno == '9610019' || err.errno == '210003' || err.errno == '9210003') {
      this.refresh();
      return true;
    }
  },
  payAction(res){
    // console.log('payAction res', res);
    // false 零元购
    const { needPay, orderIds, order_ids } = res.data;
    if (!needPay) {
      // 是否是助力免单
      if(!this.pageQuery.zlFlag){
        if (res.data.url) {
          let urlData =this.urlParams(res2.data.url);
          this.onUrlPage(urlData);
        } else {
          this.forward('order-list', { type: 0, replace: true });
        }
        return;
      }else{
        this.forward('order-list', { type: 2, replace: true });
        return
      }
    }
    // 根据订单id 获取支付信息
    this.getOrderPayInfo({
      data: {
        type: 3, // 1.微信支付 2.百川支付 3.支付宝支付, 4.支付宝网页支付, 5.公众号支付, 7.微信扫码支付
        orderIds: orderIds || order_ids,
      },
      success: (res) => {
        // 调起支付
        this.requestPayment({
          data: {
            // orderIds: orderIds,
            tradeNO: res.data.trade_no,
          },
          success: (res1) => { // res1 微信返回的信息
            // 确认支付
            this.confirmOrder({
              data: {
                paymentId: res.data.paymentId,
                mergeType: res.data.mergeType,  // 1普通订单,2单独购,4拼团订单,8抽奖团
              },
              success: (res2) => {
                if (res2.data.url) {
                  let urlData = this.urlParams(res2.data.url);
                  this.onUrlPage(urlData);
                  return;
                }
                this.forward('order-list', {
                  type: 0,
                  replace: true,
                });
              },
              fail: err2 =>{
                // 去 全部订单列表
                this.forward('order-list', { type: 0, replace: true });
              }
            });
          },
          fail: err1 => {
            // 订单失败默认条订单列表
            // 去待付款列表
            this.forward('order-list', { type: 1, replace: true });
          }
        });
      },
      fail: err => {
        //
        this.forward('order-list', {
          type: 1,
          replace: true,
        });
      }
    });

  },

  // 不能购买的商品
  initOrderCanNotBuy(data = {}) {
    const needRemoveGoods = [];

    const itemList = data.itemList || [];
    for (let i = 0; i < itemList.length; i++) {
      const merchant = itemList[i];
      const { skuList } = merchant;

      skuList.canNotBuyCount = 0;
      for (let j = 0; j < skuList.length; j++) {
        const item = skuList[j];
        item.uiItemStatus = 'normal';

        let canNotBuy = false;
        if (!item.canDelivery) { // 无法配送
          item.itemBackText = '更换收货地址';
          item.itemStatusMsg = '商品无法配送至' + (this.data.address.id ? this.data.address.province || '' : '');
          item.uiItemStatus = 'canotdelivery';
          item.statusIcon = statusIconArray.noDelivery;
          canNotBuy = true;
        }
        if (item.restriction_amount && item.orderAmount > item.restriction_amount) { // 超出限购数
          item.itemBackText = '返回';
          item.itemStatusMsg = '超出限购数量';
          item.uiItemStatus = 'restriction';
          item.statusIcon = statusIconArray.restriction;
          canNotBuy = true;
        }
        if (item.enabled === 0 || (item.expired_date - item.offline_before_expired - this._data.timestamp) <= 0) { // 已停售
          item.itemBackText = '返回';
          item.uiItemStatus = 'offline';
          item.itemStatusMsg = '商品无法购买';
          item.statusIcon = statusIconArray.offline;
          canNotBuy = true;
        }
        if (item.left_stock < item.orderAmount) { // 库存不足
          item.itemBackText = '返回';
          item.itemStatusMsg = '商品已抢光';
          item.uiItemStatus = 'lowstock';
          item.statusIcon = statusIconArray.outstock; // 库存不足打上已抢光
          canNotBuy = true;
        }
        if (item.outOfStock) { // 已抢光
          item.itemBackText = '返回';
          item.itemStatusMsg = '商品已抢光';
          item.uiItemStatus = 'outstock';
          item.statusIcon = statusIconArray.outstock;
          canNotBuy = true;
        }

        if (!canNotBuy) {
          skuList.canNotBuyCount += 1;
        }
        // 将过滤掉的商品存入变量中
        if (item.uiItemStatus !== 'normal') {
          // isDisabled = true;
          needRemoveGoods.push(item);
        } else {
          // isDisabled = false;
        }
        this.setData({
          isDisabled: item.uiItemStatus !== 'normal',
          orderStatus: item.uiItemStatus,
        });
        // orderStatus = item.itemStatus;
      }
    }

    return needRemoveGoods;
  },

  // 接口数据
  dealInitData(res) {
    // console.log(res);
    const {
      lightMemberDiscountDesc = '', // 轻会员提示文案

      itemList = [],
      platformDiscount = 0, // 实际平台优惠金额
      platformCouponList = [], // 平台优惠券

      totalPrice = 0, // 订单总金额
      needPayPrice = 0, // 支付金额
      totalAmount = 0, // 总件数

      savePrice = 0, // 节省的价格

      orderType, // 订单类型
    } = res.data.packageInfo;

    this._data.timestamp = res.timestamp;

    let {
      address = {},
      confirmSid,
    } = res.data;

    //
    // 当前默认选中的平台券
    let currentPlatformCoupon = (platformCouponList || []).find((item) => {
      return item.selected;
    })
    if (!currentPlatformCoupon) {
      currentPlatformCoupon = null;
    } else {
      currentPlatformCoupon.platformDiscount = platformDiscount || 0;
    }

    let notes = {};
    let merchantCoupon = {}; // 商家可用券
    const productList = itemList.map((item, index) => {
      let canDelivery = true;
      const newSkuList = (item.skuList || []).map((sku, i) => {
        if (!sku.canDelivery) canDelivery = false;
        const attrs = sku.attrs.map((it) => {
          return it.name + ':' + it.value;
        })

        // sku多件优惠
        let discount_activity = sku.discount_activity || {
            discount_price: 0,
            shop_discount: []
          }
        discount_activity.discount_price = dealPrice(discount_activity.discount_price)


        return {
          'id': sku.id,
          'product_id': sku.product_id,
          'name': sku.name,
          'thumbnail': sku.thumbnail,
          'price': dealPrice(sku.orderPrice), // 单价
          'market_price': sku.market_price, // 原价
          'left_stock': sku.left_stock,
          'enabled': sku.enabled, // 是否已停售 0 已停售 1未停售
          'amount': sku.orderAmount, //sku.amount, // 数量
          'attrs': attrs ,// sku.attrs_desc, // 规格信息
          'expired_date': sku.expired_date,
          'max_cart_nums': sku.maxCartSkuCnt, //
          // 'canDelivery': sku.canDelivery, // 是否支持配送
          // sku 多件优惠
          discount_activity
        };
      })
      //处理店铺优惠信息
      item.shop_reduce = item.shop_reduce || [];
      let newShopReduce = this.dealShopReduce(item.shop_reduce);

      notes[item.merchantId] = ''; //存储 几率哪些门店 后面存储留言信息

      // 记录商家优惠券
      if (item.merchantCouponList && item.merchantCouponList.length) {
        let currentMerchantCoupon = item.merchantCouponList.find((it) => {
          return it.selected;
        })
        merchantCoupon[item.merchantId] = {
          list: item.merchantCouponList,
          currentMerchantCoupon,
          merchantDiscount: dealPrice(item.merchantDiscount)
        }
      }

      // const discountActivity = item.discountActivity || {};

      let deliveryPriceText = '';
      if (canDelivery) {
        if (item.deliveryPrice) {
          deliveryPriceText = `¥${dealPrice(item.deliveryPrice)}`
        } else {
          deliveryPriceText = '免运费';
        }
      } else {
        deliveryPriceText = '此店铺不支持配送您选择的收货区域';
      }

      return {
        // maxCartSkuCnt,
        canDelivery, // true 支持配送
        deliveryPrice: item.deliveryPrice, // 配送费
        isFreeDelivery: item.isFreeDelivery, // 是否免运费 1 免费
        deliveryPriceText, // 运费文案

        lately_double_tips: item.lately_double_tips || '', // 商家优惠活动

        total_double_discount_price: dealPrice(item.total_double_discount_price),
        // amount, // 购买数量
        'merchant_id': item.merchantId,
        'merchant_name': item.merchantName,
        'totalAmount': item.totalAmount, // 小计件数
        needPayPrice: item.needPayPrice, // 小计实付金额 未处理的价格
        needPayPriceText: dealPrice(item.needPayPrice), // 小计实付金额
        'totalPrice': dealPrice(item.totalPrice), // 小计总金额价格
        skuList: newSkuList,
        shop_activity_discount_price: dealPrice(item.shop_activity_discount_price),    //优惠总金额
        shopReduce: newShopReduce,                    //商家优惠
      }
    })


    // 订单总金额
    let tempTotalPrice = totalPrice;

    // if(!this.pageQuery.zlFlag){
    //   // 现在拼团每单只能购买一个商品，所以取第一项的价格，如果有购物车需要修改这块逻辑
    //   let merchantItem = itemList[0] || {}
    //   totalPrice = data.newUserBenefit && data.newUserBenefit.length ? (merchantItem.needPayPrice/100.).toFixed(2) : (merchantItem.needPayWithoutPlatformDiscount/100.).toFixed(2)
    //   availabelCoupons = this.availabelCouponList(data.avaliableCoupons && data.avaliableCoupons.list || []);
    //   app.updateData({ availabelCoupons: availabelCoupons });
    //   if (availabelCoupons.length) {
    //     couponPriceText = availabelCoupons.length + '张可用';
    //   }else {
    //     couponPriceText = "";
    //   }
    // }else{
    //   tempTotalPrice = (data.packageInfo && data.packageInfo.totalPrice && data.packageInfo.totalPrice/100).toFixed(2)
    // }


    // 暂无商家优惠（没有做修改商家优惠券之后的计算逻辑）
    // 节省金额公式：（划线价-商品单价）*商品数量+平台优惠金额+商户优惠金额
    // 对应字段：
    // 划线价 packageInfo.itemList.skuList.market_price
    // 商品单价 packageInfo.itemList.skuList.orderPrice
    // 商品数量 packageInfo.itemList.skuList.orderAmount
    // 平台优惠金额 packageInfo.platformDiscount
    // 商户优惠金额 packageInfo.itemList.merchantDiscount

    // 处理 不能购买的商品
    let canNotBuyList = this.initOrderCanNotBuy(res.data.packageInfo);


    if (address.id) {
      xmini.store.dispatch('setOrderCommitAddress', address);
    }

    this.setData({
      isLoading: false,

      productList,

      savePrice, // 省的金额
      savePriceText: dealPrice(savePrice),

      lightMemberDiscountDesc, // 轻会员提示文案

      totalPrice: tempTotalPrice, // 订单总金额
      needPayPrice, // 支付金额
      needPayPriceText: dealPrice(needPayPrice),

      totalAmount,

      notes, // 留言

      merchantCoupon,

      currentPlatformCoupon: currentPlatformCoupon,
      platformCouponList,

      // 筛选无法购买的商品列表
      canNotBuyList,

      confirmSid: confirmSid,

      orderType,
      // id: data.packageInfo && data.packageInfo.pinActivitiesId,
    });
    if (canNotBuyList && canNotBuyList.length > 0) {
      this.onShowPopupWindow(canNotBuyList);
    }
  },
   //处理店铺优惠信息
  dealShopReduce(shopReduce) {
    return shopReduce.map(reduce => {
      let reduceDetail = '';
      reduce.detail_list.map(detail => reduceDetail += ('，' + detail.text));
      reduceDetail = reduceDetail.substring(1);
      return {
        tips: reduce.tips,
        price: dealPrice(reduce.price),
        reduceDetail: reduceDetail,
      }
    })
  },
  // 商品信息弹窗
  onShowPopupWindow(e = []) {
    const popWindowData = {};
    popWindowData.title = e[0].itemStatusMsg; // '商品停售';
    popWindowData.backText = e[0].itemBackText;
    popWindowData.itemList = e;
    popWindowData.listenBack = 'onHidePopupWindow';

    this.setData({
      popWindowData,
      windowHidden: false, // !this.data.windowHidden,
    });
    this.createMaskShowAnim();
    this.createContentShowAnim();
  },

  onHidePopupWindow(e) {
    if (e.target.dataset.actionId === '更换收货地址') {
      this.onAddressBtnClicked();
    } else if (e.target.dataset.actionId === '返回') {
      // this.back();
    }
    this.createMaskHideAnim();
    this.createContentHideAnim();
    setTimeout(() => {
      this.setData({
        windowHidden: true,
      });
    }, 210);
  },

  // 控制公告弹层
  setModalBtn(){
    my.alert({
      title: '',
      content: this.data.msgboard.content,
      buttonText: '我知道了',
      success: () => {
      },
    });
  },
  // 获取公告
  getMsgboard(){
    const params = {
      channelId: 1
    }
    api.getListMsgboard(params, (res) => {
      // console.log('msgres',res)

      const { list = [] } = res.data;
      let msgboard = {};
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        if (item.position == 2) {
          msgboard = {
            content: item.content || '',
            title: item.title || ''
          }
        }
      }
      this.setData({
        msgboard,
      })
    }, err => {
      return true;
    })
  },
  // 显示/隐藏 多件优惠弹窗
  onShowShopDiscount(e) {
    if (e) {
      const { index } = e.currentTarget.dataset;
      if (typeof index != 'undefined') {
        const currentItem = this.data.productList[index];
        if (!currentItem || !currentItem.lately_double_tips) return;
      }

      this.setData({
        currentMerchantIndex: index,
      });
      xmini.piwikEvent('c_coupon');
      this.setOfferPopup();
    }
  },
});
