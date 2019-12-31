import {
  me,
  xmini,
  xPage,
  mapState,
  mapActions,
  storage,
} from '../../config/xmini';

import api from '/api';
import {
  mixins,
  mapTo,
  pullList,
  dealPrice
} from '/utils';
import backtop from '/components/backtop/backtop';
// import tabbar from '/components/tabbar/tabbar';
// import ztPull from '/utils/ztPull';

import authMixin from '/utils/authMixin';
import TimingTask from '/utils/timingTask';
import ViewPortItem from '/utils/viewPortItem';
import { getArrayBeMixed, getArrayDiff } from '/utils/arrayUtil';
import riskgoMixin from '/utils/riskgoMixin';
import dealData from '/utils/dealData';
// import { formatCountDown,formatDate } from '../../utils/dateUtil';
// import formatNum from '../../utils/formatNum';
const app = getApp();

// const systemInfo = me.$getSystemInfo();
// const { windowWidth, windowHeight } = systemInfo;


console.log('component2', my.canIUse('component2'))

xPage({
  ...mixins,
  ...pullList,
  ...backtop,

  ...TimingTask,
  ...ViewPortItem,
  ...riskgoMixin,
  ...dealData,
  // ...tabbar, // 底部菜单
  // ...ztPull,
  _data: {
    isFavorite: false,
    riskgoData: null,
  },
  data: {

    isLoading: true,


    showFooter: false,
    isSupportLife: false,
    viewId: '',
    showBackTop: false,
    // currentPage: 'index', // 底部tabbar
    category: 'category',
    listMode: 'card',
    list: [],
    shareInfo: true,
    couponList: [],
    showCouponTip: false,
    showFavorite: false,
    activeShow: false, // 首页自定义弹窗
    couponShow: true,

    modules: [],
    ...mapState({
      newMsg: state => state.msg.newMsg,
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    })
  },
  // ...mapActions(['startPollingMsg', 'stopPollingMsg']),
  onLoad(query) {
    console.warn('index.js onLoad', query)
    this.onPageInit(query);
    this.initData();
  },
  ...mapActions([
    'getGeo',
  ]),
  onShow() {
    // 测试请求失败
    // api.requestErrTest({}, res => {}, err => {})
    this.updatadSpmPage(); // 新增更新spm 三段中的 page

    my.hideLoading();
    // tabbar跳转到圈子时可以通过这个知道是从哪个页面跳转过来的
    storage.set('lastPage', 'index', 86400);
    storage.set('needBack', false, 86400);
    this.setData({
      showFavorite: my.canIUse('favorite'),
    })
    // this.startPollingMsg()
  },

  onUnload() {
    this.closeTip();
    // this.stopPollingMsg();
  },
  onHide() {
    this.closeTip();
    // this.stopPollingMsg();
  },
  initData() {
    const isSupportLife = my.canIUse('lifestyle');
    const that = this;
    this.setData({
      showLifeStyle: isSupportLife,
      shareInfo: {
          piwikAction: '首页分享',
        },
    });

    const { logged } = this.data;

    if (!logged) {
      app.onSubscribeEvent(this, 'LOGIN_SUCCESS', function(){
        that.updatedRiskgoData()
      })
    } else {
      that.updatedRiskgoData()
    }


    // riskgoMixin.getAlipayParams({ scene :1 })
    // 获取当前小程序是否被收藏
    my.isFavorite && my.isFavorite({
      success:(res) => {
        console.log('=========get isFavorite', res);
        this._data.isFavorite = res.isFavorite; // true false
      },
      fail:(error)=>{
        // my.showToast({content: 'fail'+JSON.stringify(error) });
      },
    });
    // this.initViewPort({
    //   viewPortScrollTop:0, //
    //   viewPortHeight: windowHeight, // 当前滑动视口高度
    //   viewPortElement:'.exposure-item', // 类名
    //   scroll:'onScroll' // 滚动监听回调
    // })

    // 统一分享跳转
    this.shareJump();
    this.refresh();
    // this.couponListGet()
    this.getServiceConfig();
  },
  testClick() {
    this.dwdPageComponent.setData({
      isShowError: true,
      title: '',
      content: '1页面出现了一点小问题，重新加载看看~',
      btnText: '点我重试1'
    })
  },
  saveRef(ref) {
    console.log('=========saveRef=========',ref);
    this.dwdPageComponent = ref;
  },
  closeTip() {
    const tipList = this.data.tipList || [];
    // 只有一个活动
    if (tipList.length && tipList.length == 1) {
      this.setData({
        activeShow: false,
        couponShow: false,
      })
    }else if (tipList.length && tipList.length == 2){
      if (this.data.activeShow) {
        this.setData({
          activeShow: false,
        })
      } else {
        this.setData({
          couponShow: false,
        })
      }
    }
  },

  onPullDownRefresh() {
    this.refresh();
  },

  // 更新riskgo 信息
  updatedRiskgoData() {
    const that = this;
    // 获取riskgo
    this.getAlipayParams({
      scene: 2,
      success(res) {
        console.log('getAlipayParams====success:',  res);

        that._data.riskgoData = res;

        if (that.data.modules.length) {
          // that.set
        }

      },
      fail(err){
        console.log('getAlipayParams====err:', err)
      }
    })
  },

  // 获取首页广告模块数据
  getIndex() {
    console.warn('this:=======', this)
    this.setData({
      isLoading: true,
    })
    api.getIndex({
      scope: this,
      weights: 1,
    }, (res) => {
      my.stopPullDownRefresh();
      // res.data = JSON.parse(test);
      const { info = {} } = res.data;
      const newModules = this.getModules(res);
      // console.log('newModules', newModules);
      // console.log(this);

      this.setData({
        modules: newModules,
        floats: info.floats || [],
        isLoading: false,
      }, () => {
        console.log('newModules setData');
        // this.updatadViewPortTempListData();
        // this.getViewPortListLoact();
      });


      // 主动触发加载事件
      this.onScrollToLower();
    });
  },
  clearClick() {
    my.removeStorageSync({
      key: 'x-mini',
    });
  },
  refresh() {
    this.getIndex();
    this.initPullList();
    this.pullModel = api.getCoupleListV1;
    setTimeout(() => {
      const { hotSearch } = app.getData();
      this.setData({
        hotSearch: hotSearch || {},
      })
    }, 1000);
  },
  onShowAll(data){
    const { index,id,status } = data;
    const moduleIndex = this.data.modules.findIndex((item,index) => {return item.id == id});
    this.setData ({
      [`modules[${moduleIndex}].list[${index}].showupArrow`]: !status
    })
  },
  dealList(list) {
    return mapTo(list, (item) => {
      return {
        ...item,
        tags: (item.tags || []).splice(0, 2),
        market_price: (item.market_price / 100).toFixed(2),
        price: this.productPrice((item.price / 100).toFixed(2)),
        // link: `https://m.haoshiqi.net/v2/couple-detail?id=${item.biz_id}`,
        light_member_price: dealPrice(item.light_member_price),
        expired_date_text: item.expired_date_text_two,
        link: item.link,
        // 这里可以添加统计信息
        piwikEvent:'c_pdr2',
        piwikData:{
          pinActivitiesId: item.biz_id,
        },
      };
    });
  },
  afterPullData(list, res) {
    //
    // 从新获取数据 曝光
    // this.setData({}, () => {
    //   this.updatadViewPortTempListData();
    //   this.getViewPortListLoact();
    // })

  },
  onDetailPage(e) {
    const {
      id,
      index,
      canBought,
    } = e.currentTarget.dataset;
    if (canBought) {
      xmini.piwikEvent('c_pdr2', {
        index: (index && index + 1) || 0,
        id: id,
      })
      this.forward('detail', {
        id,
      });
    }
  },

  onTapNext(e) {
    const {
      id,
      online,
      instock,
      index,
    } = e.currentTarget.dataset;
    xmini.piwikEvent('首页点击列表', {
      index: (index && index + 1) || 0,
      id: id,
    })
    if (online && instock) {
      this.forward('detail', {
        id,
      });
    }
  },

  closeCoupon(){
    this.setData({
      showCouponTip: false
    })
  },
  // calculateModuleHeight(width, height) {
  //   let w = width;
  //   if (!w || w === 0) {
  //     w = windowWidth;
  //   }
  //   return Math.round((height / w) * windowWidth);
  // },

  // calculateModuleMargin(margin = 0) {
  //   return Math.round((windowWidth / 375) * margin);
  // },
  getServiceConfig() {
    api.getServiceConfig({}, res => {
      const { list = [] } = res.data;
      // console.log(list);

      // const tempList = [
      //   {
      //     type: 'active',
      //     schema: 'miniapp://pages/index/index?appid=2018122562686742&originAppId=2017112000051610&newUserTemplate=20190415000000158252',
      //     imageUrl: 'https://img2.haoshiqi.net/Fq1J4GgX21bOe9Tfl2cbm6HBbTf-'
      //   }
      // ]
      // console.log('=========获取到弹窗信息', this._data.isFavorite, res.data)

      const that = this;

      if (my.isFavorite) {
        my.isFavorite({
          success:(res) => {
            that._data.isFavorite = res.isFavorite; // true false
            isShowFavorite();
            // let isShowFavorite = false;
            // const tempRegExp = /^miniapp:\/\/pages\/index\/index\?appid=2018122562686742/i
            // list.forEach(item => {
            //   if (item.type == 'active') {
            //     isShowFavorite = true;
            //     //判断 是否是已收藏 && 判断链接
            //     if (tempRegExp.test(item.schema) && that._data.isFavorite) {
            //       isShowFavorite = false
            //     }
            //   }
            // })

            // that.setData({
            //   activeShow: isShowFavorite,
            // })
          },
          fail:(error)=>{
            // my.showToast({content: 'fail'+JSON.stringify(error) });
            // let isShowFavorite = false;
            // list.forEach(item => {
            //   if (item.type == 'active') {
            //     isShowFavorite = true;
            //   }
            // })
            // this.setData({
            //   activeShow: isShowFavorite,
            // })
            isShowFavorite();
          },
        });
      } else {
        isShowFavorite();
      }

      function isShowFavorite() {

        let isShowFavorite = false;
        const tempRegExp = /^miniapp:\/\/pages\/index\/index\?appid=2018122562686742/i
        list.forEach(item => {
          if (item.type == 'active') {
            isShowFavorite = true;
            //判断 是否是已收藏 && 判断链接
            if (tempRegExp.test(item.schema) && that._data.isFavorite) {
              isShowFavorite = false
            }
          }
        })

        that.setData({
          activeShow: isShowFavorite,
        })

      }


      this.setData({
        // activeShow: isShowFavorite,
        tipList: list.slice(0, 2)
      })
    }, err => {
      return true;
    })
  },
  closeActiveTip(e) {
    const { type } = e.currentTarget.dataset;
    switch (type) {
      case '1':
        this.setData({
          activeShow: false,
        })
        break;
      case '2':
        this.setData({
          couponShow: false,
        })
        break;
      default:
        // do nothing
        break;
    }
  },
  // 首页弹窗上的绑定跳转
  popupOnUrlPage(e) {
    const { tiptype } = e.currentTarget.dataset;
    if (tiptype == 'active') {
      this.setData({
        activeShow: false,
      })
    }else {
      this.setData({
        couponShow: false,
      })
    }
    this.onUrlPage(e);
  },
  couponItemClick(e) {
    const { couponindex, tipindex, code } = e.currentTarget.dataset;
    this.coderedeem(tipindex, couponindex, code)
  },
  coderedeem(tipindex, couponindex, code) {
    api.couponRedeem({
      code,
    }, (res) => {
      my.showToast('领取成功');
      this.setData({
        [`tipList[${tipindex}].list[${couponindex}].receiveType`]: 2,
      })
    }, (err) => {
      if (err.errno === 510010 || err.errno === 210013) {
        // 主动授权
        const that = this;
        authMixin.userAuthLogin({
          authType: 'auth_user',
          success: (res) => {
            this.coderedeem(code)
          },
          fail: (err) => {
          }
        })
        return true;
      } else {
        my.hideLoading();
      }
    });
  },
  // 轻会员跳转到支付宝插件
  async memberBtn() {
    console.log('轻会员跳转到支付宝插件')
    me.showLoading();
    const { userInfo } = this.data;
    let memberInfo = await memberFn(userInfo);
    console.log(memberInfo,'接收return返回');


    my.navigateToMiniService({
      serviceId: '2019022363383002',                 // 轻会员插件id，固定值
      servicePage: memberInfo.pageSite,
      extraData: memberInfo.extraParam,
      success: (res) => {
        console.log(res,'成功回调')
      },
      fail: (res) => {
        console.log(res,'失败回调')
      },
      complete: (res) => {
        console.log(res,'结束回调')
      }
    })
  },

  // 搜索功能
  onSearch(){
    xmini.piwikEvent('c_schbox');
    this.forward('search');
  },

//////自动曝光////////
  // swiper onChange 事件处理
  /**
   * swiperOnChangeExposure
   * @param {*} e
   * 这里有个隐性的数据处理
   * 首先在页面接口请求完数据之后
   * 通过 updatadViewPortTempListData 方法 得到一个数组 viewPortTempListData 把二维数组转成了一维数组
   *
   * 渲染完节点以后 通过 getViewPortListLoact 获取页面节点位置信息，这里拿到的是个数组
   * 通过遍历，同 viewPortTempListData 数据进行合并 得到 viewPortTagArray
   * viewPortTagArray 是所有平面节点所有对应的信息 包含当前 节点对应 的位置数据，模块id 等附加数据
   */
  swiperOnChangeExposure(e) {
    return false;
    const { moduleId } = e.currentTarget.dataset;
    const { current } = e.detail;
    // console.log('moduleId', moduleId, current);
    const moduleKey = `${moduleId}_${current}`

    //
    const currentData = this.viewPortTempObjectData[moduleKey];

    // 轮播时遍历所有 数据查到是否存在对应模块, 有就替换其内容
    if (currentData) {
      this.viewPortTagArray.forEach((item)=>{
        if (item.moduleId == moduleId) {
          Object.assign(item, currentData)
        }
      })
      // console.log(this.viewPortTagArray)
    }

    // 查询当前视口内的元素是否是当前模块
    let insideViewPortItemDataKeys = Object.keys(this.insideViewPortItem);
    if (insideViewPortItemDataKeys.length) {
      // 去掉 banner_1_0 下标 ==> banner_1
      insideViewPortItemDataKeys = insideViewPortItemDataKeys.map((it) => {
        let i = it.lastIndexOf('_');
        it = it.substr(0, i);
        return it;
      })
      // console.log(insideViewPortItemDataKeys);
      if (insideViewPortItemDataKeys.indexOf(moduleId) > -1) {
        if (currentData) {
          const currentExposureData = {
            [moduleKey]: currentData
          }
          // console.log(currentExposureData)
          // 上报
          xmini.piwikEvent('index_exposure', currentExposureData)
        }

      }

    }

  },

  getViewPortListLoact() {
    clearTimeout(this.getViewPortListLoactTimeout);
    this.getViewPortListLoactTimeout = setTimeout(()=>{
      this.getViewPortListItemLoact((ret)=>{
        if (!ret[0] || !ret[0].length) {
          return
        }
        // console.log('getViewPortListItemLoact: ', ret)
        this.viewPortTagArray = []
        ret[0].forEach((item,index)=>{
          const tempItem = this.viewPortTempListData[index];
          this.viewPortTagArray.push({
            // index,
            ...tempItem,
            top: Math.round(item.top) + this.viewPortScrollOptions.viewPortScrollTop, // 再次获取时 需要加上当前已滑动的距离
            bottom: Math.round(item.bottom) + this.viewPortScrollOptions.viewPortScrollTop
          })
        })
        // console.log(this.viewPortTagArray)
        this.filterView()
      })
    },300);
  },
  updatadViewPortTempListData() {

    // 同步一份数据映射 当前视口内的数据
    let viewPortTempListData = []; // 一维数据

    let viewPortTempObjectData = {}; // 二维数据

    const { modules = [] } = this.data;
    // console.log('modules:', modules)

    // 模块 扁平的数据
    viewPortTempListData = this.getViewPortTempListData(modules);

    // 模块 以 moduleId 为Key 的数据数组
    // 方便使用 moduleId && index(下标)找到数据
    // 目前这个数据只给c-swiper 这个特殊模块使用了
    viewPortTempObjectData = this.getViewPortTempObjectData(modules);

    // 底部 产品列表
    const { list = [] } = this.data;

    for (let i = 0; i < list.length; i++) {
      let tempItem = list[i];
      let tempObj = {
        moduleId: 'pinActivitie-list_1',
        id: tempItem.id,
        index: i,
        value: { pinActivitiesId: tempItem.id },
        comment: '首页底部拼团产品列表'
      }

      viewPortTempListData.push(tempObj)
    }

    // console.log('viewPortTempListData', viewPortTempListData);
    // console.log('viewPortTempObjectData',viewPortTempObjectData);
    this.viewPortTempListData = viewPortTempListData;
    this.viewPortTempObjectData = viewPortTempObjectData;

  },
  getViewPortTempListData(modules) {
    const viewPortTempListData = []; // 一维数据 [1,2,3]
    for (let i = 0; i < modules.length; i++){
      let item = modules[i];
      for (let j = 0; j < item.list.length; j++) {
        let tempItem = item.list[j];
        // console.log(tempItem);
        let tempObj = {
          moduleId: item.id,
          id: tempItem.id,
          index: j,
          value: '',
          comment: item.comment
        }

        switch (item.type) {
          case 'c-img':
          case 'c-img-hor':
          case 'c-swiper':
          case 'c-tofu':
            tempObj.value = tempItem.link;
            tempObj.image = tempItem.image.url;
            break;
          case 'c-category':
            tempObj.value = tempItem.link;
            tempObj.label = tempItem.label;
            break;
          case 'c-product-col1':
          case 'c-product-col2':
          case 'c-product-col3':
          case 'c-product-slider':
            const tempType = {'pin': 'pinActivitiesId'};
            tempObj.value = { [`${tempType[tempItem.type]}`]: tempItem.biz_id }
            break;
          default:
        }

        viewPortTempListData.push(tempObj);
        //
        let tempArr = ['c-swiper']
        if (tempArr.indexOf(item.type) > -1 && j == 0) {
          break;
        }
      }
    }
    return viewPortTempListData;
  },
  getViewPortTempObjectData (modules) {
    const viewPortTempObjectData = {}; // 二维数据
    let tempArr = ['c-swiper']
    for (let i = 0; i < modules.length; i++){
      let item = modules[i];
      for (let j = 0; j < item.list.length; j++) {
        if (tempArr.indexOf(item.type) > -1) {
          let tempItem = item.list[j];
          let tempObj = {
            moduleId: item.id,
            id: tempItem.id,
            index: j,
            value: tempItem.link,
            image: tempItem.image.url,
            comment: item.comment
          }
          viewPortTempObjectData[`${item.id}_${j}`] = tempObj
        }
      }
    }

    return viewPortTempObjectData;
  },
  // 特殊处理 处理筛选出来的结果
  dealInsideViewPortItem(viewPortData = []) {
    let insideViewPortItem = {}
    viewPortData.forEach((item, index) => {
      // 有些模块没有id
      insideViewPortItem[`${item.moduleId}_${item.index}`] = item;
    })
    return insideViewPortItem; // 新的
  },
  // 筛选完成当前视口元素
  filterViewCallBack(){
    // console.log('insideViewPortItem', this.insideViewPortItem)
    // console.log('oldInsideViewPortItem', this.oldInsideViewPortItem)
    if (Array.isArray(this.oldInsideViewPortItem)) this.oldInsideViewPortItem = {};
    const oldInsideViewPortItemKeys = Object.keys(this.oldInsideViewPortItem);
    const insideViewPortItemKeys = Object.keys(this.insideViewPortItem);
    // A ∩ B
    const beMixedArray = getArrayBeMixed(oldInsideViewPortItemKeys, insideViewPortItemKeys)
    // B - (A ∩ B)
    const diffArray = getArrayDiff(insideViewPortItemKeys, beMixedArray)
    // console.log('哈哈哈', diffArray);

    let currentData = {};
    for (let i=0; i < diffArray.length; i++){
      if (this.insideViewPortItem[diffArray[i]]) {
        currentData[diffArray[i]] = JSON.parse(JSON.stringify(this.insideViewPortItem[diffArray[i]]));
        delete currentData[diffArray[i]].bottom;
        delete currentData[diffArray[i]].top;
      }
    }

    if (Object.keys(currentData).length) {
      this.currentExposureData = currentData;
      xmini.piwikEvent('index_exposure', currentData)
    }

    // console.log('currentExposureData', this.currentExposureData);
  },
  //去主动授权登录登录
  // goLogin(){
  //   authMixin.userAuthLogin({
  //     authType: 'auth_base',
  //     success: res => {
  //       console.log('登录成功！');
  //     },
  //     fail: err => {},
  //   });
  // },

});
