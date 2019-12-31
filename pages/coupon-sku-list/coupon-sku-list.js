import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import env from '/config/env';
import api from '/api';
import {
  mixins,
  mapTo,
  pullList,
} from '/utils/index';

import backtop from '/components/backtop/backtop';

xPage({
  ...mixins,
  ...pullList,
  ...backtop,
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,

    lowerThreshold: 300,
    list: [], // 优惠券列表
    showFooter: false,
    pullLoading: false,
    showBackTop: false,
    viewId: '',
    listMode: 'card',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onPageInit(options);

    this.setNavigationBarTitle();
    this.refresh();
  },

  onShow() {

  },

  onUnload() {

  },

  // 页面加载完成
  onReady() {
    this.setData({
      lowerThreshold: my.$getSystemInfo().screenHeight / 2,
    });
  },

  setNavigationBarTitle() {
    const params = this.pageQuery;
    let title = '';
    if (params.q) {
      title = params.q;
    } else {
      title = "使用范围";
    }
    my.setNavigationBar({
      title: title,
    });
  },

  refresh() {
    this.onFetchData();
  },

  // 优惠券列表
  onFetchData() {
    this.initPullList();
    const params = this.pageQuery;
    this.pullParams.pageNum= 1;
    this.pullParams.couponId= params.couponId;
    this.pullParams.q= params.q;
    this.pullParams.scope = this;
    this.pullParams.weights = 1;
    this.pullModel = api.getCouponSkuList;
    this.setData({
      isLoading: true,
    })
    // 主动触发加载事件
    this.onScrollToLower();
  },
  afterPull() {
    if (this.pullParams.pageNum == 1) {
      delete this.pullParams.scope;
      delete this.pullParams.weights;
    }
  },
  // dealwith data
  dealList: function (list) {
    return mapTo(list, (item) => {
      const isShowLootAll = !item.onLine || !item.inStock;
      return {
        id: item.pinActivitiesId,
        title: item.coupleTitle,
        image: item.skuPic,
        priceObj: {
          rmb: 1,
          price: item.couplePrice,
          marketPrice: item.marketPrice,
        },
        isShowLootAll,
        tags: item.tags || [],
        inStock: item.inStock,
        onLine: item.onLine,
        endTime: item.endTime,
        showCountDownLimit: item.showCountDownLimit,
        expired_date_text: item.expired_date_text_two,
        link: item.link,
      };
    });
  },
  afterPullData(){
    this.setData({
      isLoading: false
    })
  },
  // click event
  onTapNext: function (e) {
    const {
      id,
      online,
      instock,
      url = '',
    } = e.currentTarget.dataset;
    if(url){
      this.onUrlPage(e);
    }
  },

  // 搜索
  onSearch(e) {
    const { id } = e.currentTarget.dataset;
    this.forward('search', {
      id,
      isPinSku: true,
    });
  },
});
