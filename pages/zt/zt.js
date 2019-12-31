import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  mapTo,
  pullList,
  versionCompare
} from '/utils';
import { formatDate } from '/utils/dateUtil';
import authMixin from '/utils/authMixin';
import swiperProduct from '/template/c-swiper-product';
import cAnchor from '/template/c-anchor/index';
import cSeckill from '/template/c-seckill/index';
import cProduct3 from '/template/c-product-3';
import cTabProduct from '/template/c-tab-product';

const app = getApp();

let windowWidth; // 当前屏幕宽度
let windowHeight; // 当前屏幕高度


const logTime = {
  logTimeTotal: 0,
  logTimeArray: [],
  logTimeTitile: 'default:',
  logTimeOldTime: 0,

  logTime(title) {
    console.log('title:__________', title);
    if (!this.logTimeOldTime) {
      this.logTimeArray = []
    }
    this.logTimeOldTime = new Date().getTime()
    if (title) {
      this.logTimeTitile = title
    }
  },
  logTimeEnd() {
    let currentTime = new Date().getTime();
    let oftenTime = currentTime - this.logTimeOldTime
    let currentItme = {
      title: this.logTimeTitile,
      startTime: this.logTimeOldTime,
      endTime: currentTime,
      consumingTime: oftenTime + 'ms'
    }
    this.logTimeArray.push(currentItme)
    this.logTimeTotal += oftenTime;
    console.log(this.logTimeTitile + ': ' + currentItme.consumingTime);

    this.logTimeTitile = 'default:';
  },
  alertTimeArray() {
    my.alert({
      content: JSON.stringify(this.logTimeArray) + '总时常:' + this.logTimeTotal + 'ms'
    })
  },
}

xPage({
  ...mixins,
  ...pullList,
  ...swiperProduct, // swiper 铺品
  ...cAnchor, // anchor 锚点
  ...cSeckill, // seckill 倒计时
  ...cProduct3, // 普通铺品-3列
  ...cTabProduct, //  tab铺品
  ...logTime, // test 工具
  pageInfo: {
    pageH: 0,
    anchorId: '', // 记住锚点组件的id
    anchorIndex: 0, // 记住锚点组件在modules的下标
    anchorActiveIndex: -1, // 激活选中下标
    activeIndex: {},
  },
  api_params: null, // 尾页铺品参数

  allDoms: [],
  anchorDoms: {}, // 包含锚点的id和自身的id
  data: {
    isLoading: true,

    isAnimation: true,
    showFavorite: false,
    showLifeStyle: false,
    topLeftText: '',
    ruleButton: {}, // 右上角规则按钮
    offsetY: 0,
    shareInfo: true,
    showBackTop: false,
    modules: [],
    list: [],
    isMember: false,    // 是否是轻会员
    showCoupon: false,
    couponHasMore: false,
    couponList: [],
    memberStatus: 0,    // 轻会员状态   0没有开通 1 已开通 2失效中 3 已失效
    userStatus: true,

    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    })
  },
  onLoad(query = {}) {
    this.logTime('渲染');
    // !!估计用不到了注释掉了
    // console.log(xmini,'xmini')
    // const { spm = '' } = xmini.getChannel();
    // if (spm === 'aliapp' && !query.spm) {
    //   query.spm = 'aliapp/wufuuco3c';
    // }
    const isSupportLife = my.canIUse('lifestyle') && !query.hidelife;
    console.log('isSupportLife ==== ', isSupportLife ? 'true' : 'false')
    this.setData({
      showLifeStyle: isSupportLife,
      isMember: query.isMember || false     // 控制轻会员专题头部隐藏或展示
    });
    // console.log(my.SDKVersion);
    // console.log(versionCompare(my.SDKVersion + '', '1.8.9'))
    if (!versionCompare(my.SDKVersion + '', '1.8.9')) {
      this.setData({
        isAnimation: false,
      });
    }

    this.onPageInit(query);
    windowWidth = my.$getSystemInfo().windowWidth;
    windowHeight = my.$getSystemInfo().windowHeight;

    // 设想
    // 1 重写触发底部加载方法 onScrollToLower 方法

    // if (this.onScrollToLower) {
    //   this.pullUpToLower = this.onScrollToLower;

    //   this.onScrollToLower = function () {
    //     console.log('哈哈到家了');

    //     if(this.api_params) {
    //       this.onScrollToLower();
    //     }
    //   }
    // }
    this.refresh();
  },
  onReady(){
    //
  },
  onShow() {
    // this.refresh();
    this.startTask();
    // setTimeout(()=> {
    //   this.alertTimeArray();
    // }, 10000)
    // if(this.data.isMember){
      // const { logged } = this.data;
      // if (logged) {
      //   this.getMemberStatus();
      // }else{
      //   this.newAuth()
      // }
    // }
  },
  onHide(){
    this.stopTask();
  },
  onUnload() {
    // this.stopTask();
    this.delTask('all');
  },
  refresh() {
    this.delTask('all');
    this.getZtData();
  },
  // 补时间差
  makeUpTime(time) {
    return time + this.timeDifference
  },

  getZtData() { // 请求专题数据
    this.logTimeEnd();

    const { pageQuery } = this;
    // 默认 011d169ff5409f74a63a278669b6feba
    const topicCode = pageQuery.id || pageQuery.topic_code || '011d169ff5409f74a63a278669b6feba';
    this.logTime('请求接口');
    this.setData({
      isLoading: true,
    })
    api.getSpecialTopic({
      scope: this,
      weights: 1,

      topicCode,
    }, res => {
      this.logTimeEnd();

      const currTime = parseInt(new Date().getTime() / 1000);
      this.timeDifference = res.timestamp - currTime;
      const allData = res.data || {};
      const { list = [], info = {} } = allData;
      // console.log('___allData___', allData);
      this.allDoms = ['#lifeStyle'];
      const modules = list.map((item, index) => {
        this.allDoms.push(`#zt${item.id}`);
        let result = {
          id: `zt${item.id}`,
          moduleId: item.id,
          comment: item.comment,
          type: item.type,
          bg_color: item.bg_color,
          margin_top: this.calculateModuleMargin(item.margin_top),
          margin_lr: this.calculateModuleMargin(item.margin_lr),
          margin_bottom: this.calculateModuleMargin(item.margin_bottom),
          padding_top: (+item.height / +item.width) * 100,
          width: +item.width,
          height: this.calculateModuleHeight(+item.width || 0, +item.height || 0),
          piwik: '专题zt_' + item.type + item.id,
        };
        switch(item.type) {
          case 'c-img':
            return Object.assign(result, this.dealCImg(item, index));
          case 'c-swiper-product':
            return Object.assign(result, this.dealCSwiperProduct(item, index));
          case 'c-anchor':
            return Object.assign(result, this.dealCAnchor(item, index));
          case 'c-product-3':
            return Object.assign(result, this.dealCProduct3(item, index));
          case 'c-tab-product':
            return Object.assign(result, this.dealCTabProduct(item, index));
          case 'c-seckill':
            return Object.assign(result, this.dealCSeckill(item, index, res.timestamp));
          case 'c-swiper':
            return Object.assign(result, this.dealCSwiper(item, index));
          case 'c-img-hor':
            return Object.assign(result, this.dealCImgHor(item, index));
          default:
            return result;
        }
      });
      // console.log(modules);
      this.logTime('第一次修改modules');
      this.setData({
        isLoading: false,

        modules: modules,
        shareInfo: {
          title: info.share_title,
          desc: info.share_desc,
          imageUrl: info.share_img,
        },
        bgColor: info.bg_color,

        topLeftText: info.left_text,
        ruleButton: info.rule_button
      }, () => {
        // 优化 低端机 接口请求完，隐藏loading 页面可能空白
        // 原因 setData 数据量大需要时间渲染
        my.hideLoading();

        this.logTimeEnd();

        this.getDomInfo();
        this.anchorOnGetInfo();
      });
      if (info.title) {
        my.setNavigationBar({
          title: info.title,
        });
      }
      // 主动触发加载事件
      const { componentGroupId = 0 } = info.api_params;
      if (componentGroupId) {
        this.api_params = info.api_params;
        this.initPullList();
        this.pullModel = api.getSpecialSkuList;
        this.pullParams = {...this.pullParams, ...info.api_params, topicCode};
        this.onScrollToLower(); // 这里需要加载一下，不然锚点定不到页尾铺品
      }
    }, err => {
      console.log(err);
    });
  },
  dealList(list = []) {
    return this.dealProductList(list);
  },
  // Banner图片竖向平铺模块
  dealCImg(item, index) {
    return {
      eventName: 'onTapZtUrl',
      list: this.dealImgs(item.list, 'c_' + item.type, item)
    }
  },
  // 轮播铺品 模块
  dealCSwiperProduct(item, index) {
    let swiperlist = [];
    let productList = [];
    // console.log('dealCSwiperProduct', item)
    for(let i = 0; i< item.list.length; i++) {
      const tmepItem = item.list[i];
      let tempPro = this.dealProductList(tmepItem.list);
      swiperlist.push({
        id: tmepItem.id,
        image: tmepItem.image,
        link: tmepItem.link
      });
      productList.push({
        bg_color: tmepItem.bg_color,
        eventName: 'onDetailPage',
        list: tempPro, // 需要guolv
      })
    }

    // 取第一张图片宽高
    let firstItem = {
      width: item.width,
      height: item.height
    }
    if (swiperlist.length) {
      firstItem = {
        width: swiperlist[0].image.w,
        height: swiperlist[0].image.h
      }
    }

    let currentIndex = 0;
    console.log('item.id', item.id);
    if (this.pageInfo.activeIndex[item.id]) {
      currentIndex = this.pageInfo.activeIndex[item.id];
    }

    return {
      currentIndex,
      swiper: {
        styleType: 2, // 1 默认样式 2 向内缩进 : 配合 previousMargin | nextMargin 一起使用
        width: item.width,
        height: this.calculateModuleHeight(item.width || 0, item.height || 0),
        padding_top: (firstItem.height / firstItem.width) * 100,

        indicatorDots: true, // 显示指示点
        activeColor: '#FDE044',
        // interval: 6000, // 自动切换间隔
        autoplay: false, // 自动切换
        circular: true, // 无限滑动
        previousMargin: '12px',
        nextMargin: '12px',
        eventName: 'onTapZtUrl', // banner 点击事件名
        onChangeEventName: 'swiperProductOnChenge', // banner 切换回调事件名
        list: this.dealImgs(swiperlist, 'c_zt_lunbopic', item)
      },
      productData: {
        // bg_color: item.bg_color, // 背景色
        list: productList
      }
    }
  },
  // 产品列表 3列 模块
  dealCProduct3(item, index) {
    const {
      image = {},
      link = '',
      list = [],
    } = item;

    const imageList = this.dealImgs([{ image, link }], 'c_zt_product3_img', item);

    let tempList = [];
    if (list.length > 6) {
      tempList = list.slice(0, 6);
    }

    return {
      images: {
        eventName: 'onTapZtUrl',
        list: imageList, // 图
      },
      productData: {
        bg_color: item.bg_color,
        button_bg_color: item.button_bg_color || '',
        isShowMore: tempList.length ? true : false, // 产品list 大于6 显示更多
        eventName: 'onDetailPage',
        moreEventName: 'cProduct3MoreClick',
        // moduleIndex: 0,
        tempList: this.dealProductList(tempList),
        list: this.dealProductList(list),
      },

    }
  },
  // tabs 切换产品模块
  dealCTabProduct(item, index) {

    let tabTag = [];
    let productList = [];
    for(let i = 0; i< item.list.length; i++) {
      const tmepItem = item.list[i];
      tabTag.push({
        tab_name: tmepItem.tab_name,
        id: tmepItem.id,
      });

      let tempList = [];
      if (tmepItem.list.length > 6) {
        tempList = tmepItem.list.slice(0, 6);
      }

      productList.push({
        bg_color: tmepItem.bg_color,
        button_bg_color: tmepItem.button_bg_color || '',
        isShowMore: tempList.length ? true : false, // 产品list 大于6 显示更多
        tempList: this.dealProductList(tempList),
        list: this.dealProductList(tmepItem.list), // 需要过滤
      })
    }

    this.setData({}, () => {
      this.cTabsInit(index);
      // this.cTabsSetActiveTab(index);
    })

    let currentIndex = 0;
    if (this.pageInfo.activeIndex[item.id]) {
      currentIndex = this.pageInfo.activeIndex[item.id];
    }

    return {
      currentIndex, // 当前tab 下标
      eventName: 'onDetailPage', // 产品点击事件名
      moreEventName: 'tabProductMoreClick', // 查看更多事件名
      tabs: {
        // bg_color: '#00f',
        scrollable: true,
        activColor: '#FF8600', // 选中的颜色
        scrollLeft: 0, // 当前滑动都距离
        lineStyle: '', // 当前 tab线的样式
        // currentIndex: 0, // 当前tab 下标
        tabChengeEventName: 'tabProductOnChenge', // tab 切换事件名
        list: tabTag, // tab 数据
      },
      tabProduct: productList, // 产品数据
    }
  },
  // swiper 模块
  dealCSwiper(item, index) {
    const list = this.dealImgs(item.list, 'c_zt_banner', item);
    return {
      styleType: 2, // 1 默认样式 2 向内缩进 : 配合 previousMargin | nextMargin 一起使用
      // width: 200,
      // height: 300,
      // padding_top: (240/680) * 100,

      indicatorDots: true, // 显示指示点
      activeColor: '#FDE044',
      interval: 6000, // 自动切换间隔
      autoplay: true, // 自动切换
      circular: true, // 无限滑动
      previousMargin: '12px',
      nextMargin: '12px',
      eventName: 'onTapZtUrl', // banner 点击事件名

      onChangeEventName: '', // banner 切换回调事件名
      list: list,
    }
  },
  dealCImgHor(item, index) {
    const list = this.dealImgs(item.list, 'c_zt_modulepic', item);
    let width = windowWidth;
    let scale = item.width / item.height;
    if (list.length > 1) {
      width = windowWidth / list.length;
    }
    let height = width / scale;
    return {
      eventName: 'onTapZtUrl',
      height,
      list: list
    }
  },
  // 统一处理图片
  dealImgs(list = [], piwikName, moduleItem) {
    return list.map((item, index) => {
      return {
        "w": item.image.w,
        "h": this.calculateModuleHeight(item.image.w || 0, item.image.h || 0),
        "url": item.image.url,
        "link": item.link,
        'piwik': piwikName,
        'piwikData': {
          id: item.id,
          comment: moduleItem.comment,
          moduleId: moduleItem.id,
          url: item.link
        }
      }
    })
  },
  dealCAnchor(item, index) { // 处理锚点数据
    // console.log(item)
    this.pageInfo.anchorId = `#zt${item.id}`;
    this.pageInfo.anchorIndex = index;
    this.anchorDoms = {
      [`#zt${item.id}`]: {top: 0, height: 0}
    };
    let list = [];
    const tempList = item.list || [];
    for(let i = 0; i < tempList.length; i++){
      let anchor = tempList[i];
      // 坑爹 不支持 for of
    // for (let anchor of tempList) {
      list.push({
        ...anchor,
        active: false,
        moduleIndex: index
      });
      this.anchorDoms[`#zt${anchor.component_id}`] = {top: 0, height: 0};
    }
    return {
      moduleIndex: index,
      switchClass: '',
      positionClass: '',
      equalH: true,
      list: list,
    };
  },
  dealCSeckill(item, index, timestamp) { // 处理秒杀数据
    const timeList = [];
    const outList = item.list;
    let curtIndex = 0; // 当前选中下标
    let seckillingIndex = -1; // 正在秒杀下标
    let curtStatus = 2;
    const ctArr = []; // 倒计时时间
    const soonArr = []; // 即将开始下标
    for (let i = 0; i < outList.length; i++) {
      let status = 1;
      if (timestamp < outList[i]['start_time']) {
        status = 1; // 即将开始
        ctArr.push(outList[i]['start_time']);
        soonArr.push(i);
      }
      if (timestamp >= outList[i]['start_time'] && timestamp <= outList[i]['end_time']) {
        status = 2; // 正在秒杀
        curtIndex = i;
        seckillingIndex = i;
        ctArr.unshift(outList[i]['end_time']);
      }
      if (timestamp > outList[i]['end_time']) {
        status = 3; // 已结束
      }
      timeList.push({
        id: outList[i].id, // 当前秒杀标签id
        start: formatDate(outList[i]['start_time'], 'd日h:F'),
        status: status,
      });
      outList[i]['list'] = this.dealProductList(outList[i]['list']);
    }
    if (seckillingIndex < 0) {
      curtIndex = soonArr[0] || 0;
    }
    if (this.pageInfo.activeIndex[item.id]) {
      curtIndex = this.pageInfo.activeIndex[item.id];
    }
    if (ctArr.length) {
      this.seckillOnStart(item.id, ctArr[0], index);
    }
    curtStatus = timeList[curtIndex]['status'];
    return {
      timeList,
      leftTime: {hour: '00', minute: '00', second: '00'},
      outList,
      curtIndex, // 当前显示下标
      seckillingIndex, // 正在抢购下标
      curtStatus, // 当前状态
      eventName: 'onDetailPage',
    };
  },
  dealProductList(list = []) { // 处理商品信息
    return list.map((item) => {
      return {
        ...item,
        market_price: (item.market_price / 100).toFixed(2),
        couple_price: (item.couple_price / 100).toFixed(2),
        light_member_price: ((item.light_member_price || 0) / 100).toFixed(2),
        rate_percent: item.selled_stock * 100 / (item.left_stock + item.selled_stock) + '%',
        is_member: this.data.isMember
      }
    })
    return list;
  },
  onDetailPage(e) { // 点击跳转商品详情
    const {
      id,
      index,
      moduleIndex,
      canBought,
    } = e.currentTarget.dataset;
    let piwikName = 'c_zt_shopgoods'; // 默认
    let piwikData = {
      id,
      index
    };
    if (moduleIndex) {
      const moduleItem = this.data.modules[moduleIndex]

      switch(moduleItem.type) {
        case 'c-swiper-product':
          piwikName = 'c_zt_lunboproduct';
          break;
        case 'c-product-3':
          piwikName = 'c_zt_shopgoods'
          break;
        case 'c-tab-product':
          piwikName = 'c_zt_tagproductdetail';
          break;
        case 'c-seckill':
          piwikName = 'c_zt_miaoshaprod';
          break;
        default:
          ///
      }
      piwikData.moduleId = moduleItem.moduleId
    }

    if (canBought) {
      xmini.piwikEvent(piwikName, piwikData); // id 拼团id
      this.forward('detail', {
        id,
      });
    }
  },
  onScroll(e) {
    // console.log(e);
    const { scrollTop } = e.detail;
    const { anchorId, anchorIndex, pageH } = this.pageInfo;
    if (anchorId && this.anchorDoms[anchorId]) { // 锚点定位
      const anchorT = this.anchorDoms[anchorId]['top'];
      const oldPositionClass = this.data.modules[anchorIndex]['positionClass'];
      let positionClass = '';
      if (scrollTop > anchorT) {
        positionClass = 'c-anchor-fixed';
      } else {
        positionClass = '';
      }
      if (positionClass != oldPositionClass) {
        this.setData({
          [`modules[${anchorIndex}]['positionClass']`]: positionClass
        });
      }
      this.anchorOnScrollSelect(scrollTop);
    }
    const { showBackTop } = this.data;
    if (scrollTop > 500 && !showBackTop) {
      this.setData({
        showBackTop: true
      });
    } else if(scrollTop < 500 && showBackTop) {
      this.setData({
        showBackTop: false
      });
    }
  },

  // swiper 模块组件 chenge事件监听
  // swiperChengeEvent(e) {
  //   const { moduleIndex } = e.currentTarget.dataset;
  //   const { current = 0 } = e.detail;
  //   const item = this.data.modules[moduleIndex].list[current];
  //   console.log(item)
  //   xmini.piwikEvent('s_zt_banner', item.piwikData);
  // },
  // onPageScroll(e) { // 页面滚动
  //   const { scrollTop } = e;
  //   // console.log('___scrollTop____', scrollTop);

  //   if (pageH > 0 && pageH - scrollTop - windowHeight < 100) {
  //     this.onScrollToLower();
  //   }
  // },
  getDomInfo(callback) { // 获取页面dom信息
    this.getRect('#page-zt').then((result) => {
      this.pageInfo.pageH = result.height;
      const allDoms = [...this.allDoms];
      this.getItemRect(allDoms);
      callback && callback();
    });
  },
  getItemRect(arr = [], len = 0, newHeight = 0) {
    if (len < arr.length) {
      let item = arr[len];
      this.getRect(item).then((rect) => {
        if (rect) {
          if (this.anchorDoms[item]) {
            this.anchorDoms[item]['top'] = newHeight;
            this.anchorDoms[item]['height'] = rect.height;
          }
          newHeight += rect.height;
        }
        this.getItemRect(arr, ++len, newHeight);
      })
    } else {
      const { modules = [] } = this.data;
      for (let i = 0; i < modules.length; i++) {
        let moduleItem = modules[i]
        let id = `#${moduleItem.id}`;
        if (this.anchorDoms[id]) {
          if (id == this.pageInfo.anchorId) {
            this.anchorDoms[id]['padding'] = moduleItem.margin_top + moduleItem.margin_bottom;
          } else {
            this.anchorDoms[id]['padding'] = moduleItem.margin_top;
          }
        }
      }
    }
  },
  getRect(selector, all) { // 获取页面dom信息
    return new Promise((resolve, reject) => {
      my.createSelectorQuery()[all ? 'selectAll' : 'select'](selector).boundingClientRect().exec(ret => {
        // console.log(ret);
        resolve(ret[0]);
      });
    });
  },
  // 单位换算
  calculateModuleMargin(px = 0) {
    return Math.round((windowWidth / 375) * px);
  },
  // 换算高度
  calculateModuleHeight(width = 0, height = 0) {
    let w = width;
    if (!w || w === 0) {
      w = windowWidth;
    }
    return Math.round((height / w) * windowWidth);
  },
  scrollToTop() { // 滚动到顶部
    // console.log('滚动到顶部');
    this.pageScrollTo(0);
  },
  pageScrollTo(num) { // 滚动离顶部距离
    // console.log(num);
    let decimal = new Date().getTime() + '';
    decimal = parseFloat('0.00' + decimal.slice(6));
    num += decimal;
    this.setData({
      offsetY: num,
    });
  },
  memberBtn() {
    const { logged } = this.data;
    if (logged) {
      this.forward('member')
    } else {
      const that = this;
      authMixin.userAuthLogin({
        authType: 'auth_base',
        success: (res) => {
          //从新获取用户信息 会死循环吗
          // console.log('从新获取用户信息')
          that.forward('member')
        },
        fail: (err) => {
        }
      })
    }

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
    } else if(url.indexOf('tpBridge.getMember') >= 0){
      const reg = /javascript\:tpBridge.getMember/;
      let code = url.match(reg)[0];
      if(!code){
        my.alert({
          title: '',
          content: '配置错误',
          buttonText: '确定',
        });
      } else {
        this.memberBtn();
      }
    } else {
      this.onUrlPage(e);
    }
  },

  addCoderedeem(code) {

    my.showLoading();
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
      this.openCoupon(res.data);
    }, (err) => {
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
});
