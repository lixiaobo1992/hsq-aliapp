import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mapTo,
  mixins,
  orderPay,
  urlfix,
  dealPrice,
} from '/utils';
import {
  Trim,
} from '/utils/stringUtil'
import { clone } from '/utils/objectUtil'

import authMixin from '/utils/authMixin'
import { stringify } from '/utils/stringUtil';
import urlParams from '/utils/urlParams';
const app = getApp();

xPage({
  ...mixins,
  ...orderPay,
  ...urlParams,
  // 支付宝没有优惠券展示
  _data: {
    skuInfo: [],
    tempInputTime: null,
    initParams: {

    },

    listenAddressResult: false, // 去选地址了
    listenCoupons: false, // 去选券了
  },
  data: {
    isLoading: true,

    isFastbuy: 0, // 是否是立即购买
    orderType: 1, // 订单类型,普通购订单:1,默认:1

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

    productList: [],

    notes: {}, //留言信息

    msgboard: {  // 公告
      title: ''
    },

    currentMerchantIndex: 0,
    isOfferPopupShow: false, // 多件优惠
    errMsg: '',
    mergeInfo:{
      isMergePay: true,
      isMemberModal:false,
      mergePayList:[],
      orderIds:[],//合并支付的id
    },

    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
      address: state => state.order_commit.address,
    })
  },

  onLoad(query) {
    this.onPageInit(query);

    const tempSkuInfo = JSON.parse(decodeURIComponent(query.skus_info || ''));

    let skuInfo = [];
    let skuKey = { s: 'skuId', c: 'amount', p: 'price' };
    for(let i = 0; i < tempSkuInfo.length; i++) {
      let tempSku = tempSkuInfo[i];
      let sku = {}
      const tempSkuKey = Object.keys(tempSku)
      for(let s = 0; s < tempSkuKey.length; s++) {
        let key = skuKey[tempSkuKey[s]];
        sku[key] = tempSku[tempSkuKey[s]];
      }
      skuInfo.push(sku);
    }
    // console.log(skuInfo);

    this._data.skuInfo = skuInfo;

    this.setData({
      isFastbuy: query.isFastbuy ? 1: 0
    })
    // 获取订单数据
    this.refresh();

    // 公告
    this.getMsgboard();
  },

  onUnload() {

  },

  refresh() {
    this.updateInitParams();
    this.orderInit();
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

    }

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
      source: 'single'
    }
    // 当用户选择平台券时 需要在可选券列表调用 轻会员可用券列表;
    if (couponType == 2) tempQuery.price = this.data.totalPrice || 0

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
    xmini.piwikEvent('c_num', { skuid: this._data.skuInfo[0].skuId, index: tempVal, name: data.value });
    if (this._data.skuInfo[0].amount != data.value ){
      // 立即购买过来的 只有一个品
      this._data.skuInfo[0].amount = data.value;
      this.refresh();
    }
  },

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

  // 订单初始化
  orderInit() {
    const initParams = this._data.initParams || {};
    const { address } = xmini.store.state.order_commit;
    this.setData({
      isLoading: true,
    })
    const params = {
      scope: this,
      weights: 1,

      skusInfo: JSON.stringify(this._data.skuInfo), // 下单商品信息,skuId,amount,price
      note: '',
      orderType: 1, // 订单类型,普通购订单:1,默认:1
      addressId: address.id, // 收货地址ID,默认为用户默认收货地址
      isFastbuy: initParams.isFastbuy ? 1 : 0, // 是否直接购买，1-是，0-否 默认0

      couponCodeInfo: JSON.stringify(initParams.jsonInfo),
    };
    api.orderInit_v1(
      params,
      res => {
        //
        this.dealInitData(res);

      },
      err => {
        if (err.errno === 510010 || err.errno === 210013) {
          const that = this;
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
        if( err.errno == 610028 || err.errno == 610029 ){
          // my.showErrPage(err.errmsg)

        }
      }
    );

  },
  dealInitData(res) {
    const {
      lightMemberDiscountDesc = '',

      itemList = [],

      platformDiscount = 0, // 实际平台优惠金额
      platformCouponList = [], // 平台优惠券

      totalPrice = 0, // 订单总金额
      needPayPrice = 0, // 支付金额
      totalAmount = 0, // 总件数

      savePrice = 0, // 节省的价格

    } = res.data.packageInfo;

    this._data.timestamp = res.timestamp;

    let {
      address = {},
      confirmSid,
    } = res.data;

    // 当前默认选中的平台券
    let currentPlatformCoupon = (platformCouponList || []).find((item) => {
      return item.selected;
    })
    if (!currentPlatformCoupon) {
      currentPlatformCoupon = null;
    } else {
      currentPlatformCoupon.platformDiscount = platformDiscount || 0;
    }

    let notes = {}; // 公告
    let merchantCoupon = {}; // 商家可用券
    const productList = itemList.map((item, index) => {
      let canDelivery = true;
      const newSkuList = (item.skuList || []).map((sku, i) => {
        if (!sku.canDelivery) canDelivery = false;

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
          'amount': sku.amount, // 数量
          'attrs': sku.attrs_desc, // 规格信息
          'expired_date': sku.expired_date,
          'max_cart_nums': sku.max_cart_nums,
          // 'canDelivery': sku.canDelivery, // 是否支持配送
          // sku 多件优惠
          discount_activity,
        };
      })

      //处理店铺优惠信息
      item.shop_reduce = item.shop_reduce || [];
      let newShopReduce = this.dealShopReduce(item.shop_reduce);


      notes[item.merchant_id] = ''; //存储 几率哪些门店 后面存储留言信息

      // 记录商家优惠券
      if (item.merchantCouponList && item.merchantCouponList.length) {
        let currentMerchantCoupon = item.merchantCouponList.find((it) => {
          return it.selected;
        })
        merchantCoupon[item.merchant_id] = {
          list: item.merchantCouponList,
          currentMerchantCoupon,
          merchantDiscount: dealPrice(item.merchantDiscount)
        }
      }

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
        canDelivery, // true 支持配送
        deliveryPrice: item.deliveryPrice, // 邮费
        isFreeDelivery: item.isFreeDelivery, // 是否免运费 1 免费
        deliveryPriceText, // 运费文案

        lately_double_tips: item.lately_double_tips || '', // 商家优惠活动
        total_double_discount_price: dealPrice(item.total_double_discount_price),
        // shopDiscount: (discountActivity.shopDiscount || []).join(','), // 商家优惠详情
        'merchant_id': item.merchant_id,
        'merchant_name': item.merchant_name,

        'totalAmount': item.totalAmount, // 小计件数
        needPayPrice: dealPrice(item.needPayPrice), // 小计实付金额
        'totalPrice': dealPrice(item.totalPrice), // 小计总金额价格
        skuList: newSkuList,
        shop_activity_discount_price: dealPrice(item.shop_activity_discount_price),    //优惠总金额
        shopReduce: newShopReduce,                    //商家优惠
      }
    })


    if (address.id) {
      xmini.store.dispatch('setOrderCommitAddress', address);
    }

    // 订单总金额
    let tempTotalPrice = totalPrice;

    this.setData({
      isLoading: false,

      productList,

      savePrice, // 省的金额
      savePriceText: dealPrice(savePrice),

      lightMemberDiscountDesc, // 轻会员提示文案

      totalPrice: tempTotalPrice, // 订单总金额
      needPayPrice, // 支付金额
      needPayPriceText: dealPrice(needPayPrice),

      totalAmount, // 总件数

      notes, // 留言

      merchantCoupon,

      currentPlatformCoupon: currentPlatformCoupon,
      platformCouponList,

      confirmSid, // 临时订单id
    })

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
  // 提交订单
  orderSubmit() {
    xmini.piwikEvent('c_sumit');
    //判断是否有不支持配送的品
    //
    const that = this;

    const {
      confirmSid= '',
      productList = [],
      address = {},
      needPayPrice = 0,
    } = this.data;

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
      merchantCoupon
    } = this.data;
    const notesKey = Object.keys(notes);
    const tempNotes = [];
    if (notesKey.length) {
      for(let i = 0; i < notesKey.length; i++) {
        let tempKey = notesKey[i]
        tempNotes.push({
          merchantId: tempKey,
          note: notes[tempKey],
        })
      }
    }

    const jsonInfo = this.getCouponInfo({ currentPlatformCoupon, merchantCoupon });

    let params = {
      confirmOrderSerialId: confirmSid,
      notes: JSON.stringify(tempNotes),
      addressId: address.id,
      orderType: orderType,
      couponCodeInfo: JSON.stringify(jsonInfo),
    };
    api.orderSubmit_v1(
      params,
      res => {
        this.payAction(res);
      },
      err => {
        return this.payError(err);
      }
    )
  },
  payError(err){
    if (err.errno === 510010 || err.errno === 210013) {
      // this.forward('login', { authType: 'auth_user'}); // 主动授权
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
    const tempErrno = [9910002, 9210074, 9210075, 9210076, 9210077, 9210078, 9210079];
    const that = this;
    if (tempErrno.indexOf(err.errno)>-1) {
      my.alert({
        title: '',
        content: err.errmsg || '',
        buttonText: '我知道了',
        success: (res) => {
          xmini.piwikEvent('c_popup', { errno: err.errno });
          if (err.errno == 9910002) that.refresh();
        },
      });
      return true;
    }
    const tempErrno1 = [9210032, 9210033, 9910002, 9610020, 9610019, 210003, 9210003]
    if (tempErrno1.indexOf(err.errno) > -1) {
      this.refresh();
      return true;
    }
  },
  payAction(res){
    // console.log(res);
    const {
      needPay,
      orderIds,
    } = res.data;
    if (!needPay) {
      if (res.data.url) {
        let urlData = this.urlParams(res2.data.url);
        this.onUrlPage(urlData);
      } else {
        this.forward('order-result', { id: orderIds, replace: true });
      }
      return;
    }

    // 根据订单id 获取支付信息
    this.getOrderPayInfo({
      data: {
        type: 3, // 1.微信支付 2.百川支付 3.支付宝支付, 4.支付宝网页支付, 5.公众号支付, 7.微信扫码支付
        orderIds: orderIds,
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
                console.log(err2, 'err2');
                this.forward('order-list', { type: 0, replace: true });
              }
            });
          },
          fail: err1 => {
            // 订单失败默认条订单列表
            // 去待付款列表
            console.log(err1,'err1')
            this.forward('order-list', { type: 1, replace: true });
          }
        });
      },
      fail: err => {
        console.log(err,'err order-list')
        this.forward('order-list', {
          type: 1,
          replace: true,
        });
      }
    });

  },
  dealPayErr(err){
    switch(err.errno){
      case 210018:
        this.setData({
          errMsg: err.errmsg,
          mergeInfo:{
            mergePayList: this.dealPayList(err.data.list),
            isMergePay: true,
          },
        });
      break;
      case 230004:
        this.setData({
          mergeInfo:{
            isMemberModal: true,
          },
          errMsg: err.errmsg,
        });
      break;
      default:
        console.log('没处理');
      break;
    }
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
      channelId: 1,
      isLoading: false,
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
  handlePayModal(){
    const mergePayStatus = this.data.mergeInfo.isMergePay;
    // let orderIds = this.data.mergeInfo.mergePayList.map( (item) =>{ return item.orderId });
    this.setData({
      mergeInfo:{
        isMergePay:!mergePayStatus,
        // orderIds:orderIds,
      }
    });
  },
  handleMemberModal(){
    const memberModalStatus = this.data.mergeInfo.isMemberModal;
    this.setData({
      mergeInfo:{
        isMemberModal:!memberModalStatus,
      }
    });
  },
});
