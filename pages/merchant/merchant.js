import {
  me,
  xmini,
  xPage,
  storage,
} from '../../config/xmini';
import {
  mixins,
  mapTo,
  pullList,
} from '/utils';
import { formatLeftTimeObj } from '/utils/dateUtil';
import CountManger from '/utils/CountManger';
import api from '/api';
import { formatDate } from '/utils/dateUtil';
import coupon from '../../components/coupon-list/coupon';
xPage({
  ...mixins,
  ...pullList,
  ...coupon,
  data:{
    isLoading: true,

    storeId: 0,
    storeData: {},
    skuId: null,
    bizId: null,
    topicId: null,
    shareInfo: true,
    brandData:'',
    isLike: false,
    shopAllBtnStatus: true,
    coupleList:[], //显示领券的信息
    showArrow: false,
    coupleTitle:'店铺领券',
    showdownArrow:false,
    arrowClick:false,
    showCoupons: false, //是否显示优惠券列表
    sucToast:false, // 显示领取成功的toast
    coupons:[],
  },
  onLoad(query = {}) {
    this.onPageInit(query);
    this.setData({
      storeId: query.id,
      skuId: query.sku_id || null,
      topicId: query.topic_id || null,
    });
  },
  onShow() {
    this.refresh();
  },
  onHide() {
    this.clearCountDown();
  },
  onUnload(){
    this.clearCountDown();
  },
  refresh() {
    this.clearCountDown();
    this.getStoreInfo();
    this.initPullList();
    this.pullModel = api.getMerchantList;
    this.pullParams.merchantId = this.data.storeId;
    this.couponParams.merchantId = this.data.storeId;
    // console.log(this.couponParams,'pullParams');
  },
  // 获取店铺信息
  getStoreInfo() {
    this.setData({
      isLoading: true,
    })
    api.getMerchantInfo({
      scope: this,
      weights: 1,

      merchantId: this.data.storeId,
      skuId: this.data.skuId,
      topicId: this.data.topicId,
    }, (res) => {
      let brandList = res.data.brandList || [];
      let brandName = [];
      for (let i = 0; i < brandList.length; i++){
        brandName.push(brandList[i].name)
      }

      // 取一个数据做渲染
      this.setData({
        isLoading: false,
        storeData: res.data,
        isLike: res.data.is_like,
        brandData: brandName.join(' , '),
        coupleList: res.data.coupons,
        activityList: this.dealProductList(res.data.activityList, res.timestamp)
      })
      //判断店铺公告是否需要展开
      if(this.data.brandData.length>24){
        this.setData({
          arrowClick:true,
          showdownArrow:true,
        })
      }
      // 主动触发加载事件
      this.onScrollToLower();
      if(this.data.activityList.length > 0){
        this.startCountDown();
      }
    }, (err) => {
    })
  },
  // 收藏按钮
  collectBtn(e){
    let collectStatus = e.currentTarget.dataset.status;
    if (!collectStatus){
      api.userLikeMerchat({
        merchantId: this.data.storeId,
      },(res)=>{
        my.showToast({
          type: 'none',
          content: '收藏成功',
          duration: 3000,
        });
        this.setData({
          isLike: true
        })
      })
    }else{
      api.removeLikeMerchat({
        merchantIds: this.data.storeId
      }, (res) => {
        my.showToast({
          type: 'none',
          content: '已取消收藏',
          duration: 3000,
        });
        this.setData({
          isLike: false
        })
      }, (err) => {
        console.log(err);
      })
    }
    xmini.piwikEvent('c_collect', {
      merchantid: this.data.storeId,
      index: collectStatus ? 0 : 1,
    });

  },


  // 处理商品列表数据
  dealProductList(list = [], serveTimer) {
    return list.map(item => {
      let retaData = parseInt(((item.all_stock - item.left_stock) / item.all_stock) * 100);
      let serveBtnStatus = item.is_subscribe || false;   // 服务端返回按钮状态模拟   true 提醒、 false 取消提醒和马上抢
      return {
        ...item,
        tags: item.tags || [],
        market_price: (item.market_price / 100).toFixed(2),
        price: this.productPrice((item.price / 100).toFixed(2)),
        rate_percent: retaData,
        can_bought: true,
        hintText: this.seckillBtn(serveTimer, item.start_time, item.end_time, serveBtnStatus),
        // link: `https://m.haoshiqi.net/v2/couple-detail?id=${item.biz_id}`,
        serveTimer,                 // 服务器当前时间
        diffTime: serveTimer * 1000 - Date.now(),
        endTime: item.end_time,
        residueTime: item.start_time - serveTimer || 0,
        serveBtnStatus,
        expired_date_text:item.expired_date_text_one,
        showupArrow:true,
        arrowClick: item.tags.toString().length > 48,
        link:item.link,
      };
    });
  },
  // 处理按钮名称
  seckillBtn(serveTimer, startTimer, endTimer, serveBtnStatus){
    let timeText = {
      btnText: '',
      activityCountTip: '',
      btnType: '',
    };
    if(serveTimer > startTimer && serveTimer < endTimer) {      // 当前时间大于开始时间  并且 当前时间小于结束时间 活动已开始
      timeText.btnText = '马上抢';
      timeText.activityCountTip = '距结束';
      timeText.btnType = '';
    }else if(serveTimer < startTimer && serveTimer < endTimer) {     // 当前时间小于开始时间 并且 当前时间小于结束时间，活动没开始
      if(!serveBtnStatus){
        timeText.btnText = '提醒我';
        timeText.activityCountTip = '距开始';
        timeText.btnType = 'hintmsg';
      }else{
        timeText.btnText = '取消提醒';
        timeText.activityCountTip = '距开始';
        timeText.btnType = 'clearmsg';
      }
    }
    return timeText
  },
  // 开始倒计时
  startCountDown() {
    const that = this;
    const { activityList = [] } = this.data;
    const countDownOptions = {
      times: 1000,
      dataList: activityList,
      set() {
        if( Date.now() >=  (this.data.start_time * 1000)){
          this.localEndTime = this.data.endTime * 1000 + this.data.diffTime;
        }else{
          this.localEndTime = this.data.start_time * 1000 + this.data.diffTime;
        }
        if (this.localEndTime - Date.now() > 0 && !this.data.isSetCountDown) {
          this.start();
        }else{
          this.clear();
          that.refresh();
        }
        that.setData({
          [`activityList[${this.index}].isSetCountDown`]: true,
        });
      },
      callback() {
        const localLeftTime = this.localEndTime - Date.now();
        if (localLeftTime > 0) {
          let timeInfo = formatLeftTimeObj(localLeftTime)
          that.setData({
            [`activityList[${this.index}]`]: Object.assign({}, that.data.activityList[this.index], { countDownInfo: timeInfo }),
          });
        } else {
          this.countManger = null;
          that.setData({
            [`activityList[${this.index}].isSetCountDown`]: false,
          });
          this.clear();
          that.refresh();
        }
      },
    };
    if (!this.countManger) {
      this.countManger = new CountManger(countDownOptions);
    } else {
      this.countManger.add(countDownOptions);
    }
  },
  // 清除到计时
  clearCountDown() {
    const that = this;
    if (this.countManger) {
      this.countManger.clear(function() {
        that.setData({
          [`activityList[${this.index}].isSetCountDown`]: false,
        });
      });
      this.countManger = null;
    }
  },

  // 处理商品价格数据
  productPrice(price) {
    let priceArray = price.split('.');
    return {
      price_yuan: priceArray[0],
      price_fen: priceArray[1],
    };
  },

  dealList(list = []) {
    return mapTo(list, (item) => {
      let isShowLootAll = 0;
      if (!item.onLine) {
        isShowLootAll = 1;
      } else if (!item.inStock) {
        isShowLootAll = 2;
      }
      return {
        id: item.pinActivitiesId,
        title: item.coupleTitle,
        image: item.skuPic,
        priceObj: {
          rmb: 1,
          price: item.couplePrice,
          marketPrice: item.marketPrice,
          memberPrice:item.member_price,
        },
        isShowLootAll,
        tags: item.tags.splice(0,2) || [],
        inStock: item.inStock,
        onLine: item.onLine,
        endTime: item.endTime,
        showCountDownLimit: item.showCountDownLimit,
        merchantType: item.merchant_type,
        expired_date_text: item.expired_date_text_two,
        link:item.link,
      };
    });
  },
  // 去详情
  onTapNext(e){
    const {
      id,
      online,
      instock,
      index,
      url = '',
    } = e.currentTarget.dataset;
    xmini.piwikEvent('c_pdr2',{
      index,
      pinActivitiesId: id,
    });
    if (online && instock && url) {
      this.onUrlPage(e);
    }
  },
  // 锚点到商品列表
  allShopBtn() {
    my.createSelectorQuery().select('#shop-list').boundingClientRect().exec((res) => {
      this.setData({
        scrollTop: res[0].top,
      })
    })
    xmini.piwikEvent('c_dpqbsp',{
      merchantid: this.data.storeId
    });
  },

  onUpdateBtnStatus(e){
    // console.log(e,'updateBtnStatus data');
    let { index , btnType, value,type,status } = e;
    switch (type) {
      case 'arrow':
        this.setData ({
          [`activityList[${index}].showupArrow`]: !status
        })
      break;
      default:
        this.setData({
          [`activityList[${index}].hintText.btnType`]: btnType == 'hintmsg' ? 'clearmsg' : 'hintmsg',
          [`activityList[${index}].hintText.btnText`]: btnType == 'hintmsg' ? '取消提醒' : '提醒我',
          [`activityList[${index}].is_subscribe`]: value
        })
      break;
    }
  },
  onShowAll(){
  this.setData({
    showdownArrow:!this.data.showdownArrow,
  })
  },
  showCoupons() {
    this.setData({
      showCoupons: true,
    }, () => {
      this.getCouponList();
    });
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
  }
});
