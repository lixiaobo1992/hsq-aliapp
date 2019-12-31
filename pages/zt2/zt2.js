import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  mapTo,
  pullList,
} from '/utils';
import ztPull from '/utils/ztPull';
import { formatDate } from '/utils/dateUtil';
import authMixin from '/utils/authMixin'
import backHome from '/components/back-home';

const AParse = require('../../aparse/aParse.js');

xPage({
  ...mixins,
  ...backHome,
  ...pullList,
  ...ztPull,
  data: {
    isLoading: true,

    isShowGoHome: false,
    banner: {},
    showFooter: false,
    listMode: 'card',
    list: [],
    shareInfo: true,
    showCoupon: false,
    couponHasMore: false,
    couponList: [],
    singleOnly: false,
  },
  onLoad(query) {
    // console.error('zt onLoad: ' + JSON.stringify(query));
    this.onPageInit(query);
    this.setData({
      shareInfo: {
        piwikAction: '专题页分享'
      },
      showFavorite: my.canIUse('favorite'),
      singleOnly: query.single ? true : false,
    });
    this.fetchData();
  },

  onUnload() {

  },

  onShow() {

    this.updateGoHomeStatus();
  },

  refresh() {
    this.initPullList();
    this.fetchData();
  },

  fetchData() {
    const { pageQuery = {} } = this;
    this.params = {
      scope: this,
      weights: 1,
      // BETA
      // topicCode: pageQuery.topic_code || '6495ab8cc8d15adbb1987e5ab7723cd6',
      // PROD
      topicCode: pageQuery.id || pageQuery.topic_code || '070a1c9cb7046f65db65db3e9e49c70d',
    };
    this.setData({
      isLoading: true,
    })
    api.getTopicInfo({
      ...this.params,
    }, (res) => {
      const { data: { status, detail, title } } = res;
      this.setData({
        isLoading: false,
      })
      if (status && status !== 3) {
        // my.showErrPage('稍等一下，页面一会就回来');
        return;
      }
      // 修改标题
      if (title && title !== '') {
        this.setPageTitle(title)
      }

      if(detail){
        const tempDetail = decodeURIComponent(detail);
        let that = this;
        AParse.aParse('banner', 'html', tempDetail, that);
      }

      // this.ztPullList();
    }, (err) => {
      if (err.errno === 9610024) {
        this.forward('error', {
          message: '稍等一会儿，马上回来',
          replace: true,
        });
        return true;
      }
    });
  },

  // ztPullList() {
  //   const { pageQuery } = this;
  //   this.pullParams = Object.assign({
  //     needPagination: 1,
  //     pageLimit: 10,
  //     pageNum: 1,
  //     topicCode: pageQuery.topic_code || '82e9a32d3c73a0be04d4afb9d7933e92',
  //   });
  //   this.pullModel = api.getTopicList;

  //   my.showLoading();
  //   this.onScrollToLower();
  // };

  dealList(list = []) {
    const singleOnly = this.data.singleOnly || false;
    return mapTo(list, (item) => {
      return {
        id: item.pinActivityId,
        title: item.title,
        image: item.sku_pic,
        priceObj: {
          rmb: 1,
          price: singleOnly ? item.single_price : item.group_price,
          marketPrice: item.market_price,
        },
        tags: item.tags || [],
        merchantType: item.merchant_type,
      };
    });
  },

  onTapZtUrl(e) {
    let { url, index } = e.currentTarget.dataset;
    xmini.piwikEvent('专题点击banner', url);
    if(url.indexOf('tpBridge.getCoupon') >= 0){
      const reg = /javascript\:tpBridge.getCoupon\(\'(.*?)\'\)/;
      let code = url.match(reg)[1];
      if(!code){
        my.alert({
          title: '',
          content: '领券出错，无效的活动码',
          buttonText: '确定',
        });
      } else {
        this.addCoderedeem(code)
      }
    } else {
      this.onUrlPage(e);
    }
  },

  addCoderedeem(code) {

    api.addCoderedeem({
      code: code
    }, (res) => {
      this.getCoupons(code);
    }, (err) => {
      if (err.errno === 510010 || err.errno === 210013) {
        // 主动授权
        const that = this;
        authMixin.userAuthLogin({
          authType: 'auth_user',
          success: (res) => {
            that.addCoderedeem(code)
          },
          fail: (err) => {
            my.hideLoading();
          }
        })
        return true;
      } else {
        my.hideLoading();
      }

    });

  },

  getCoupons(code) {
    api.getCouponInfo({
      rewardCode: code
    }, (res) => {
      my.hideLoading();
      this.openCoupon(res.data);
    }, (err) => {
      my.hideLoading();
      my.showToast({
        type: 'none',
        content: '领取成功',
        duration: 3000,
      });
      return true;
    });
  },

  openCoupon(data = {}) {
    let couponList = data.couponList || [];
    let couponHasMore = false;
    if(couponList.length > 3){
      couponList = couponList.slice(0,3);
      couponHasMore = true;
    }
    for(let i = 0; i< couponList.length; i++){
      let item = couponList[i];
      if(/^[0-9]*$/.test(item.value)){
        item.value = item.value / 100;
        item.isNum = true;
      } else {
        item.isNum = false;
      }
      item.start_at = formatDate(item.start_at, 'Y.M.D');
      item.end_at = formatDate(item.end_at, 'Y.M.D');
    }
    this.setData({
      showCoupon: true,
      couponHasMore: couponHasMore,
      couponList: couponList
    })
  },

  closeCoupon() {
    this.setData({
      showCoupon: false
    })
  },

  stopProp() {

  },

  goCoupon() {
    xmini.piwikEvent('专题点击优惠券列表');
    this.closeCoupon();
    this.forward('coupon-list');
  },

  onTapNext(e) {
    const { index, id } = e.target.dataset;
    xmini.piwikEvent('专题点击列表', {
      index: (index && index + 1) || 0,
      id,
    });
    this.forward('detail', {
      id,
      single: this.data.singleOnly
    });
  },
});
