import { me, xmini, mapState, xPage, mapActions } from '../../config/xmini';
import api from '/api';
import { mixins, dealPrice } from '/utils';
import CountManger from '/utils/CountManger';
import {
  formatCountDown,
  formatCountDownObj,
  formatDate,
  formatLeftTimeObj,
} from '/utils/dateUtil';
import { isEmptyObject } from '/utils/is'
import backHome from '/components/back-home';
import AParse from '../../aparse/aParse';
import authMixin from '/utils/authMixin';
import riskgoMixin from '/utils/riskgoMixin';
import coupon from '../../components/coupon-list/coupon';

import skuMixin from '/components/sku-select/skuMixin';

const app = getApp();
let width = 375;

// let skusKey, dataAttrs;
// let attrDatasList = new Array();

xPage({
  ...mixins,
  ...backHome,
  ...riskgoMixin,
  ...skuMixin,
  ...coupon,
  _data: {
    // 收藏／未收藏的icon
    unLikeImg: 'https://img1.haoshiqi.net/miniapp/unlike_879608c2d8.png',
    likeImg: 'https://img1.haoshiqi.net/miniapp/like_93c1d5ceb0.png',

    pinActivitiesId: 0, // 拼团活动id
  },
  data: {

    isLoading: true, // 控制页面状态

    // sku
    isShowPopup: false, // v-model
    normSelectTag: 0,
    currentSum: 1,
    maxBuySum: 100,
    attrList: [],
    skuStocksList: {}, // 属性ID 对应 sku列表

    currentSkuData: {}, // 当前skuData
    smallCurrentSkuData: {},
    selectedAttrName: [], // 已选择 attr
    notSelectedAttrName: '', // 未选择属性提示

    // sku end
    isShowGoHome: false, // 是否显示返回首页按钮
    shareInfo: true, // 设置分享

    priceObj: {
      // 价格
      price: '',
      point: '',
      marketPrice: '',
    },
    didShowCitySelection: false,
    currentCity: {},
    fastInfo: {}, // 已开团的列表数据

    // pinActivitiesId: -1, // 拼团id
    skuId: -1, // skuid

    promotions: [], // 添加多件优惠的信息
    coupleList: [], //显示领券的信息
    priceExplain:
      '被划去的“价格”指同品牌同种等量规格的商品在国内大陆地区主流电商平台，但不仅限于电商平台上的标示价格、或厂家、供应商的指导价；商品实际售价为本平台实时销售价格\n\n“单独购“为拼团产品中1人单买价格，”X人团“为拼团产品中多人（人数大于或等于2人）拼团购买价格',

    // amountNum: 1, // 当前购买数

    merchantData: {}, // 店铺信息

    singleOnly: false, // 是否是单独购

    // activityTime: {}, // 秒杀活动时间

    isMember: false, // 是否是轻会员商品

    memberCard: {
      isShow: false,
      status: 0,
      title: '',
      getPrice: 0,
      desc: '',
      btnText: '立即开通',
    },
    // memberInfo:{
    //   isLightMember:false,
    //   memberTitle:'',
    //   memberDesc:'',
    //   btnText:'立即开通',
    // },
    userIsMember: false, // 用户是否开通轻会员
    memberStatus: 0, // 轻会员状态   0没有开通 1 已开通 2失效中 3 已失效
    showCoupons: false, //是否显示优惠券列表
    coupons: [], //领券列表
    sucToast: false,

    riskgoAd: {
      // riskgo 广告
      src: '',
      link: '',
    },
    onShowPromotionInfo: false,
    cartNumber: 0,// 购物车icon
    isInit: true,
    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    }),
  },

  onLoad(query) {
    this.onPageInit(query);

    // 目前只有 zt2页面跳转detail 会带 single
    this.setData({
      singleOnly: query.single ? true : false,
    });
    this.initData();
  
    width = my.$getSystemInfo().windowWidth;
  },

  onShow() {
    this.clearCountDown();
    this.updateGoHomeStatus();

    if (!this.data.hideCountDown && this.countDownPSku != 0) {
      this.presaleCountDown();
    }
    if (this.acticityType) {
      this.startActivityCountDown();
    }
  },
  onReady() {
    this.checkNewCurrentCity();
  },
  onHide() {
    this.clearCountDown();
  },
  onUnload() {
    this.clearCountDown();
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
      app.onSubscribeEvent(this, 'LOGIN_SUCCESS', function() {
        that.updatedRiskgoData();
      });
    } else {
      that.updatedRiskgoData();
    }

    this.refresh();
  },

  refresh(query = this.pageQuery) {
    const { id } = query;
    if(id){
      this._data.pinActivitiesId = id;
      this.getSkuInfoDetail(id || this._data.pinActivitiesId);
    }
    this.updateUserCart()
  },
  clearCountDown() {
    if (this.countManger) {
      this.countManger.clear();
    }
    if (this.presaleCountDownManger) {
      this.presaleCountDownManger.clear();
    }
    if (this.activityCountManager) {
      this.activityCountManager.clear();
      this.activityCountManager = null;
    }
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
    this.refresh({id: skuData.pinactivitiesid});
  },
  // 接收sku 点击的事件
  onBtnClick(data) {
    // console.log(data);
    switch(data.type) {
      case 'buyBtn':
        xmini.piwikEvent('c_addcart', { skuid: this.data.skuId });
        this.fetchAddCart();
      break;
      case 'confirmBtn':
        // const type = this.data.btnStatus;  //false 单独购  //true 多人团
        // switch(type) {},
        // if(type) {
          xmini.piwikEvent('c_buy', { skuid: this.data.skuId });
          this.toOrderCommit();
          // this.closeSelect();
          this.setData({
            isShowPopup: false,
          });
        // } else {
        // }
        break;
      case 'addShoppingCart':
        break;
    }
  },
  // 获取商品信息
  getSkuInfoDetail(id) {
    const that = this;
    // this.setData({
    //   isLoading: true,
    // })
    api.getCoupleDetail(
      {
        pinActivitiesId: id,
        isLoading: false,

        scope: this,
        weights: 1,
      },
      res => {
        const data = res.data;
        this.timestamp = res.timestamp;
        const {
          skuId,
          attrKeys = [],
          attrDatas = {},
          coupleIsOnline,
          left_stock = 0,
          startTime = 0,
          productId,
          pics = [],
          shareInfo = {},
          fastJoinList = {}, // 已开团列表
          merchantInfo = {}, // 商家信息
          merchant_type, //商家信息类型

          name = '',
          // thumbnail = '',
          description = '',

          labels = [],

          canDelivery,
          freightInfo = '',

          is_like = false,

          light_member_price = 0,
          light_member_expose_info = {},

          couplePrice = 0,
          singlePrice = 0,
          market_price = 0,

          activityPreheat, // 活动预热的数据

          shopDiscount = [],

          countLimit, // 拼团人数

          maxCartSkuCnt = 100, //

          selled_cnt = 0, // 已销售量

          coupons = []
        } = res.data;

        const hideCountDown = !coupleIsOnline || left_stock < 1 || startTime <= res.timestamp;
        const buyBtnStatus = !coupleIsOnline || left_stock < 1 || startTime > res.timestamp ? 'disabled' : '';
        // 是否显示倒计时
        if (!hideCountDown) {
          this.countDownPID = data.productId;
          this.startTime = data.startTime;
          this.presaleCountDown();
        } else {
          this.countDownPID = 0;
          this.clearCountDown();
        }
        // 产品展示图
        const swiperList = (pics || []).map(item => {
          return {
            image: item,
            url: '',
          };
        });
        // 分享信息
        const { alipay = {} } = shareInfo;

        const noStock = left_stock < 1 ? true : false; // 是否已抢光
        const unLine = coupleIsOnline ? false : true; // 是否已停售

        // 商家信息
        const newMerchantData = {
          ...merchantInfo
        };

        const isMember = light_member_price ? true : false;
        let userIsMember = light_member_expose_info.agreement_status ? true : false; // 用户是否是轻会员

        // is_like 是否收藏
        const collectionImg = is_like ? this._data.likeImg : this._data.unLikeImg;

        // 是否是单品购买
        const singleOnly = this.data.singleOnly || false;
        // 价格的逻辑
        let priceObj = {};
        if (light_member_price && userIsMember) {
          priceObj = {
            rmb: 1,
            price: light_member_price,
            couplePrice: couplePrice,
          };
        } else if (light_member_price) {
          priceObj = {
            rmb: 1,
            price: singleOnly ? singlePrice : couplePrice,
            marketPrice: market_price,
            couplePrice: couplePrice,
          };
        } else {
          priceObj = {
            rmb: 1,
            price: singleOnly ? singlePrice : couplePrice,
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
            pinactivitiesid: item.pinactivitiesid,
            name: item.name,
            thumbnail: item.thumbnail,
            price: item.price,
            priceText: dealPrice(item.price),
            market_price: item.market_price,
            left_stock: item.left_stock,
            skuid: item.id,
            max_buy_num: item.left_stock,
          };
        });


        // 处理活动预热模块数据
        let showAct = false;

        let tempActivityPreheat = {
          activityType: (activityPreheat && activityPreheat.activityType) || 0, // 营销活动类型：1 普通 2 秒杀
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

          if (res.timestamp > activityPreheat.startTime && res.timestamp <= activityPreheat.endTime) {
            // 活动中
            tempActivityPreheat.activityCountTip = '距离结束还有';
            tempActivityPreheat.activityStatus = 'start';
            showAct = true;
          } else if (res.timestamp <= activityPreheat.startTime) {
            // 活动还没开始
            tempActivityPreheat.activityCountTip = '距离开始还有';
            tempActivityPreheat.activityStatus = 'ready';
            showAct = true;
          } else {
            tempActivityPreheat.activityStatus = 'end';
            showAct = false;
          }

          // 活动进度条展示
          tempActivityPreheat.rateNumber = 100 - (parseInt((tempActivityPreheat.activityStock / activityPreheat.allStock) * 100) || 0);

          tempActivityPreheat.activityPrice = activityPreheat.activityPrice || 0;
          tempActivityPreheat.activityStartTimeTip = `${formatDate(activityPreheat.startTime || 0, 'M.D H:F')}开抢`;

          tempActivityPreheat.activityStartTime = activityPreheat.startTime || 0;
          tempActivityPreheat.activityEndTime = activityPreheat.endTime || 0;
        }

// couplePrice = 0,
//           singlePrice = 0,

        const normSelectTag = this.data.normSelectTag

        const smallCurrentSkuData = {
          priceText: normSelectTag == 2 ?  '￥' + dealPrice(singlePrice) : '￥' + dealPrice(couplePrice),
        }

        this.setData(
          {
            isLoading: false,

            smallCurrentSkuData,

            attrList: attrKeys,
            skuStocksList: stocksList,

            maxBuySum: maxCartSkuCnt,

            name,
            desc: description,
            priceObj,
            skuId,
            labels,

            // 多件优惠信息,活动预热倒计时
            showAct,
            activityPreheat: tempActivityPreheat,

            is_like,

            collectionImg,

            // selectPrice: this.type == 2 ? singlePrice : priceObj.price,
            // selectSinglePrice: singlePrice,
            // selectCouplePrice: priceObj.price,
            // selectThumbnail: thumbnail,

            canDelivery,
            freightInfo,

            noStock,
            unLine,
            buyBtnStatus,
            hideCountDown,

            shareInfo: {
              title: alipay.title,
              desc: alipay.content,
              imageUrl: alipay.thumbnail,
              piwikAction: 'c_share',
              piwikData: {
                pinActivitiesId: this._data.pinActivitiesId,
              },
            },
            swiperInfo: {
              list: swiperList || [], // 如果数据不符合格式，可以使用 mapTo 方法
              hwRatio: 1,
              height: width,
            },

            promotions: (merchantInfo && merchantInfo.promotions) || [],

            singlePrice: '￥' + dealPrice(singlePrice),
            couplePrice: '￥' + dealPrice(priceObj.price),
            countLimit: countLimit + '人团',
            limitNum: countLimit,
            rule:
              '支付开团并邀请' +
              (countLimit - 1) +
              '人参团，人数不足自动退款，详见规则',
            dataSuccess: true,
            fastInfo: fastJoinList,
            left_stock,
            merchantData: newMerchantData,
            merchantType: merchant_type,
            // shopDiscount: (shopDiscount && shopDiscount.join(',')) || '',

            isMember,
            memberPrice: light_member_price,

            // maxCartSkuCnt: maxCartSkuCnt, // 最大购买数量 服务端已经根据商品限购数量 - 用户已成功购买的数量  这个值可能会反回0，如果没有限购这个字段会返回剩余库存数量
            selledCnt: selled_cnt, // 销售数量
            coupleList: coupons || [],
          },
          () => {
            my.hideLoading();
            //初始化时获取位置信息
            if (this.data.isInit) {
              this.getGeoLocation();
            }

            if (fastJoinList.list && fastJoinList.list.length) {
              this.countDown(fastJoinList.list, res.timestamp);
            }
            if (showAct && tempActivityPreheat.activityStatus == 'ready') {
              this.acticityType = 1;
              this.startActivityCountDown();
            } else if (showAct && tempActivityPreheat.activityStatus == 'start') {
              this.acticityType = 2;
              this.startActivityCountDown();
            }

          }
        );

        // 计算当前传入价格
        let tempPrice = 0
        if (light_member_price) {
          tempPrice = light_member_price
        } else if (tempActivityPreheat.selfPrice) {
          tempPrice = tempActivityPreheat.selfPrice
        } else {
          tempPrice = priceObj.price;
        }

        this.getMemberInfo({
          price: tempPrice,
        });

        this.getSkuDetailMore(productId);

      },
      err => {
        // console.log(err);
      }
    );
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
    this.diffTime = diffTime;
    const localStartTime = activityPreheat.activityStartTime * 1000 + diffTime;
    this.localStartTime = localStartTime;
    const localEndTime = activityPreheat.activityEndTime * 1000 + diffTime;
    this.localEndTime = localEndTime;

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
        } else {
          this.clear();
          that.refresh();
        }
      },
      callback() {
        let leftEndTimes = that.localEndTime - Date.now();
        let leftStartTimes = that.localStartTime - Date.now();
        // 没开始的状态，且还没到开始时间
        if (leftStartTimes > 0 && type == 1) {
          // 活动还没开始，倒计时
          that.setData({
            'activityPreheat.activityStatus': 'ready',
            'activityPreheat.activityCountTip': '距离开始还有',
            'activityPreheat.activityTime': formatLeftTimeObj(leftStartTimes),
          });
        } else if (leftStartTimes <= 0 && type == 1) {
          // 没开始的状态，且到了开始时间，清除倒计时，重新调接口
          this.clear();
          that.refresh();
        } else if (leftEndTimes > 0 && type != 1) {
          // 活动开始了的状态，且活动还没结束，倒计时
          that.setData({
            'activityPreheat.activityStatus': 'start',
            'activityPreheat.activityCountTip': '距结束还有',
            'activityPreheat.activityTime': formatLeftTimeObj(leftEndTimes),
          });
        } else if (leftEndTimes <= 0 && type != 1) {
          // 活动开始的状态，且活动已结束，清除倒计时，重新调接口
          this.clear();
          that.refresh();
        }
      },
    });
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
        let userIsMember = is_light_member ? true : false; // 用户是否是轻会员
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
  //显示/隐藏 促销信息弹窗
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
    xmini.piwikEvent('c_like', {
      pinActivityId: this.pageQuery.id,
      index: 1,
    });
    api.removeLikeProduct(
      {
        userId: this.userId,
        activityIds: this.pageQuery.id,
      },
      res => {
        this.setData({
          is_like: false,
          collectionImg: this._data.unLikeImg,
        });
      }
    );
  },
  addCollection() {
    xmini.piwikEvent('c_like', {
      pinActivityId: this.pageQuery.id,
      index: 0,
    });
    api.addLikeProduct(
      {
        userId: this.userId,
        activityId: this.pageQuery.id,
        skuIds: this.data.skuId,
      },
      res => {
        this.setData({
          is_like: true,
          collectionImg: this._data.likeImg,
        });
      }
    );
  },


  countDown(list = [], timestamp) {
    const that = this;
    const diffTime = Date.now() - timestamp * 1000;
    this.countManger = new CountManger({
      times: 1000,
      dataList: list || [],
      set() {
        const localEndTime = this.data.endTime * 1000 + diffTime;
        const leftTimes = localEndTime - Date.now();
        if (leftTimes > 0) {
          this.data.localEndTime = localEndTime;
          this.start();
        }
      },
      callback() {
        const leftTimes = this.data.localEndTime - Date.now();
        if (leftTimes > 0) {
          that.setData({
            [`fastInfo.list[${this.index}].countDown`]: `剩余 ${formatCountDown(
              leftTimes
            )} 结束`,
          });
        } else {
          this.clear();
          that.setData({
            [`fastInfo.list[${this.index}].disabled`]: true,
          });
          that.refresh();
        }
      },
    });
  },

  // 获取图文详情
  getSkuDetailMore(pid) {
    let that = this;
    api.getProductDetail(
      {
        productId: pid,
        sourceType: 4,
      },
      res => {
        const detailMore = res.data;
        // 富文本处理
        const tempDetail = detailMore.graphicDetail;
        AParse.aParse('data', 'html', tempDetail, that, 10, 'detail');
      },
      err => {
        // console.log(err);
      }
    );
  },


  // 跳转到在线客服
  toCustomService() {
    xmini.piwikEvent('c_alisv');
    this.forward('service');
  },

  // 跳转到确认订单
  buyBtnClick(e) {
    if (this.data.buyBtnStatus == 'disabled') {
      return;
    }
    const { type } = e.currentTarget.dataset;
    let price, btnStatus;
    if (type == 2) {
      xmini.piwikEvent('c_pinsingle', {
        pinActivityId: this.pageQuery.id,
        orderType: type,
      });
      price = this.data.singlePrice;
      btnStatus = false;
    } else if (type == 3) {
      xmini.piwikEvent('c_pincouples', {
        pinActivityId: this.pageQuery.id,
        orderType: type,
      });
      price = this.data.couplePrice;
      btnStatus = true;
    }
    // this.setData({
    //   // selectPrice: price,
    //   // btnStatus,
    // });
    this.type = type;
    // this.showSelect();


    this.setData({
      normSelectTag: type == 2 ? 2 : 3,
      isShowPopup: true,

      smallCurrentSkuData: {
        priceText: price || '¥0'
      }
    });
    my.pageScrollTo({ scrollTop: 0 });
  },
  toOrderCommit(e) {
    if (this.data.maxBuySum == 0) {
      my.showToast('已达该秒杀品购买上限，去看看其他商品吧~');
      return;
    }
    const left = this.data.left_stock;

    if (this.type == 3 && this.data.limitNum > left) {
      my.showToast('当前库存不足以成团');
      return;
    }
    xmini.piwikEvent('c_buy', {
      pinActivityId: this._data.pinActivitiesId,
      orderType: this.type,
    });
    this.forward('order-commit', {
      pinActivitiesId: this._data.pinActivitiesId,
      skuId: this.data.skuId,
      orderType: this.type || 3,
      amount: this.data.currentSum || 1,
    });
  },

  // 跳转到拼团规则页
  toRule() {
    xmini.piwikEvent('c_rule');
    this.forward('rule');
  },

  // 预售倒计时
  presaleCountDown() {
    const that = this;
    const diffTime = this.diffTime || this.timestamp * 1000 - +new Date();
    const localEndTime = this.localEndTime || this.startTime * 1000 + diffTime;
    this.diffTime = diffTime;
    this.localEndTime = localEndTime;
    let millisecond = 10;
    if (localEndTime - new Date() > 0) {
      this.setData({
        buyBtnStatus: 'disabled',
      });
    }
    this.presaleCountDownManger = new CountManger({
      times: 1000,
      dataList: [{}], // this.data.leftTime,
      set() {
        if (localEndTime - new Date() > 0) {
          this.start();
        } else {
          that.setData({
            leftTime: 0,
          });
        }
      },
      callback() {
        const leftTime = localEndTime - new Date();
        if (leftTime > 0) {
          // console.log(leftTime);
          const count = formatCountDownObj(leftTime, true);
          that.setData({
            count,
            buyBtnStatus: 'disabled',
          });
        } else {
          const count = formatCountDownObj(0, true);
          that.setData({
            count,
            buyBtnStatus: '',
            hideCountDown: true,
          });
          this.clear();
          that.refresh();
        }
      },
    });
  },

  goNext(e) {
    const { id, type, index } = e.currentTarget.dataset;
    const left = this.data.left_stock;
    // const amountNum = this.data.amountNum;
    // const maxCartSkuCnt = this.data.maxBuySum;
    switch (type) {
      case 'couple-share':
        xmini.piwikEvent('c_joinbtn2', {
          pinEventid: id,
          orderType: type,
        });
        this.forward('couple-share', {
          id,
        });
        break;
      default:
        // do nothing...
        break;
    }
  },

  // 跳转到店铺首页
  goStore() {
    xmini.piwikEvent('c_shop');
    let id = this.data.merchantData.id;
    this.forward('merchant', { id });
  },

  showCoupons() {
    // console.log('打开优惠券列表');
    this.setData(
      {
        showCoupons: true,
      },
      () => {
        this.couponParams = {
          merchantId: this.data.merchantData.id,
          skuId: this.data.skuId,
        };
        // console.log(this.couponParams, 'this.couponParams');
        this.getCouponList();
      }
    );
  },
  onHandleItem(data) {
    // console.log(data,'data');
    const { index, type }  = data;
    if (type == 'close') {
      this.setData({
        showCoupons: false,
      });
    }else {
      this.getCoupon(data);
    }
  },
  goCart(e) {
    this.forward('shopping-cart');
  },
  //调购物车接口
  fetchAddCart(){
    // console.log('单独购加入购物车');
    api.addSkuToCart(
      {
        type: 1,
        skuId: this.data.skuId,
        amount: this.data.currentSum,
      },
      res => {
        this.updateUserCart();
        my.showToast('添加购物车成功');
        this.setData({
          isShowPopup: false
        })
      }
    )
  },
  //更新购物车
  updateUserCart(){
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
  //跳转到凑单列表页
  onPinDetail(e){
    console.log();
    const { id,merchantid } = e;
    xmini.piwikEvent('coudanentry',{ activityid:id,merchantid:merchantid,skuid:this.data.skuId });
    this.forward('full-reduction',{id,merchantId:this.data.merchantData.id});
  },
});
