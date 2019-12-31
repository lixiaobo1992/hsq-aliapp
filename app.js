import {
  me,
  xmini,
  xApp,
  storage,
  // mapState,
  // mapMutations,
  // mapActions,
} from './config/xmini';

import api from '/api';
import rewrite from '/utils/rewrite';
import authMixin from '/utils/authMixin';
import riskgoMixin from '/utils/riskgoMixin';
import { isRedDot } from '/utils/index';
import gioInit from '/utils/gio/index';

gioInit();

import sa from './utils/shence/sensorsdata.min.js'

my.isShowError = false;

// 覆写 my 内部分方法(要启动时就调用执行)
rewrite();

const eventListenerCache = {};
const defalutGlobalData = {
  systemInfo: {}, // 系统信息
  netInfo: {},    // 网络信息
  addressId: null,
  qnInfo: {}, // 七牛 token 等
  location: '',
  track: true,
};
let globalData = { ...defalutGlobalData };
// 初始化
// 获取本地缓存全局数据

try {
  let storageData = my.getStorageSync({ key: 'globalData' });
  if (storageData) {
    Object.assign(globalData, storageData.data);
  }
} catch (e) {
  // Do something when catch error
  console.error("error my.getStorageSync('globalData')")
}

// console.log('globalData',globalData);

xApp($global.trackApp({
  // api,

  onError(msg) {
    console.error(msg);
  },
  onLaunch(options = {}) {
    console.warn('App onLaunch: ' + JSON.stringify(options));
    this.sensors = sa
    sa.quick('appLaunch', options);
    // my.alert({
    //   title: 'onLaunch:' + JSON.stringify(options),
    // });
    // this.updatedMemberStatus(options);
    // 更新公共参数
    // this.updateData();
    // https://tower.im/projects/9dc0e68edc64436aa73e8f0fa0a8ffad/docs/738f14ee9afa45df8d01846e3f3e0010/
    // 配置默认渠道参数等

    let { query, scene } = options;
    const { extraData } = (options.referrerInfo || {});
    this.updateChannel(query || extraData);
    this.updateOrigin(options)


    // xmini.piwikInit({
    //   siteId: 5,  // 2 用来测试
    //   uuid: me.$uuid(),
    //   appName: 'aliapp',
    //   category: 'aliapp',   // 默认事件分类
    //   // channel: 'aliapp',          // 默认channelId
    //   // spm: 'point-aliapp',        // 默认spm
    //   ...this.bizParams,
    // });

    const systemInfo = me.$getSystemInfo();
    const { screenWidth, screenHeight } = systemInfo;
    this.updateData({
      systemInfo
    });
    xmini.piwikUpdate({
      screen: `${screenWidth}x${screenHeight}`,
      // userId: '',
      // openId: '',
    });

    // 是否登录
    const { logged, userInfo } = xmini.store.state.user;
    if (!logged || !userInfo.authPhone) {
      this.defalutLogin();
    }

    xmini.store.dispatch('getZones');
    xmini.store.dispatch('setAddresses');
    // this.setBarRedDot();
  },
  onShow(options = {}) {
    console.warn('App onShow: ' + JSON.stringify(options));
    sa.quick('appShow', options);
    const { userInfo, logged } = xmini.store.state.user;

    // console.log(userInfo);
    this.updatedMemberStatus(options);

    xmini.piwikUpdate({
      isTrackWorking: true,
      userId: userInfo.user_id || '',
      openId: userInfo.alipay_user_id || '',
    });
    // !!!如果当前已经打开蚂蚁会员小程序，在钉钉跳转到积分小程序，触发两次这个onShow();
    // 第一次为从后台切到前台，参数为空
    // 第二次为schema唤醒，传入参数
    // 支付宝 schema 传参在 options.query 这里取
    // alipay://platformapi/startApp?appId=2018051160096372&query=channel_id%3Dalipay_ant
    // 小程序间跳转，在 referrerInfo，结构如下：
    // options = {path: '', referrerInfo: {appId: '', extraData: {channel_id: '', spm: ''} }};
    // my.alert({
    //   title: 'onShow:' + JSON.stringify(options),
    // });
    let { query, scene } = options;
    const { extraData } = (options.referrerInfo || {});
    this.updateChannel(query || extraData);
    this.dealOptionsSpm(options);
    this.updateOrigin(options)
    // my.showToast('demo testing');
    my.getNetworkType({
      success: (res) => {
        // 从另一个小程序到当前小程序，偶尔会触发网络不可用
        if (!res.networkAvailable) {
          // my.showToast('网络不可用，请稍后重试...');
        }
        this.updateData({
          netInfo: res,
        });
      },
    });

    this.initConfig();

    if (!logged) {
      this.onSubscribeEvent('app', 'LOGIN_SUCCESS', ()=> {
        this.offSubscribeEvent('LOGIN_SUCCESS', 'app');
      });
    } else {
      riskgoMixin.syncAlipayRiskFlowReport();

      this.setBarRedDot();
    }

    const isFavorite = storage.get('isFavorite') || 2; //
    // 获取当前小程序是否被收藏
    my.isFavorite && my.isFavorite({
      success:(res) => {
        // console.log('=========app.js get isFavorite',isFavorite, res);
        // this._data.isFavorite = res.isFavorite; // true false
        if (parseInt(isFavorite) != Number(res.isFavorite)) {
          xmini.piwikEvent('c_alishoucang', {
            index: Number(res.isFavorite)
          })
        }
        storage.set('isFavorite', Number(res.isFavorite));
      },
      fail:(error)=>{
        // my.showToast({content: 'fail'+JSON.stringify(error) });
      },
    });
  },

  // 更新来源
  // 主要记录riskgo 的来源
  updateOrigin(options = {}) {
    let { query } = options;
    const { extraData } = (options.referrerInfo || {});
    let origin = '';
    if (extraData && extraData.origin) {
      origin = extraData.origin
    }
    if (query && query.origin) {
      origin = query.origin
    }
    if (origin) {
      xmini.piwikEvent('riskgo_divorce_origin', {
        origin
      })
      xmini.store.dispatch('setRiskgoOrigin', origin);
    } else {
      xmini.store.dispatch('setRiskgoOrigin', '');
    }
  },
  updatedMemberStatus(options) {
    console.log('App onShow:updatedMemberStatus:', options);
    // 是否登录
    const { logged, userInfo, memberTemplateId = '' } = xmini.store.state.user;
    // !! 目前支付宝还不支持这种方式
    // if (logged && options.referrerInfo && options.referrerInfo.appId ===
    // '2019072365974237') {
    //   // TO DO ... 从轻会员插件中退出
    //   // 建议在退出插件时回调查询轻会员开通结果
    //   console.log('onShow======从轻会员插件中退出', options.referrerInfo)
    // }
    console.log('app onShow logged: ', logged);
    console.log('app onShow memberTemplateId: ', memberTemplateId);
    if (logged && memberTemplateId != '') {
      api.updatedMemberStatus(
        {
          isLoading: false,
          templateId: memberTemplateId
        },
        res => {
          console.log('异步回调成功', res);
          xmini.store.dispatch('setMemberTemplateId', '')
        }
      )
    }
  },
  // getCurPage() {
  //   const length = getCurrentPages().length;
  //   if (!length) {
  //     return {};
  //   }
  //   const currentPage = getCurrentPages()[length - 1] || {};
  //   return currentPage;
  // },
  // getChannel() {
  //   // 获取业务渠道参数，由全局参数以及page参数运算得出
  //   // 提供给API、forward以及统计使用
  //   const { pageQuery = {} } = this.getCurPage();
  //   const current = {};
  //   if (pageQuery.spm) current.spm = pageQuery.spm;
  //   if (pageQuery.channel_id) current.channel = pageQuery.channel_id;
  //   return Object.assign({}, this.config, this.bizParams, current);
  // },
  dealOptionsSpm(options) {
    console.log('app.js updatedSpm: ', options);
    let { query } = options;
    const { extraData } = (options.referrerInfo || {});
    let tempSpm = 'aliapp'
    if (extraData && extraData.spm) {
      tempSpm = extraData.spm
    }
    if (query && query.spm) {
      tempSpm = query.spm
    }

    const newSpm = this.parsingSpm(tempSpm);

    this.updatedSpm(newSpm)
  },
  // 解析spm
  parsingSpm(tempSpm = ''){
    const setArray = ['spm', 'page', 'block'];
    const spmObj = tempSpm.split('.');
    let newSpm = {};
    // 这里在解析三段spm
    if (spmObj.length > 1) {
      for (let i = 0; i < spmObj.length; i++) {
        newSpm[setArray[i]] = spmObj[i];
      }
    } else {
      newSpm['spm'] = tempSpm
    }

    return newSpm;
  },
  updatedSpm(newSpm) {

    xmini.store.dispatch('updatedSPM', newSpm);

    const { currentSpm, pre_spm } = xmini.store.state.spm;

    api.setCommonParams({
      spm: currentSpm || 'aliapp'
    })
    xmini.piwikUpdate({
      spm: currentSpm || 'aliapp',
      preSpm: pre_spm || ''
    })
  },
  updateChannel(options) {
    // 内部变量全是用channel 而不要用channel_id
    if (typeof options !== 'object') return;
    // 此参数，在切换到后台后，再切换回来，参数丢失了
    // 更新业务渠道参数
    // 每次启动时，获取参数设置为默认值，之后透传当前页面的配置，若无则使用默认值替代
    // 其值为api、分享或页面使用
    let { channel_id = 'aliapp'} = options;

    // if (channel_id) {
    //   this.bizParams.channel = channel_id;
    // }
    const oldParams = xmini.getChannel();
    if(channel_id != oldParams.channel ){
      this.updateCurrentPage();
    }
  },
  updateCurrentPage() {
    // my.alert({
    //   title: '刷新当前页面' + length,
    // });
    // 从钉钉进来如果渠道变更，需要刷新下
    const currentPage = this.getCurPage();
    if (currentPage.pageId && currentPage.refresh) {
      currentPage.refresh();
    };
  },
  onHide() {
    console.log('App Hide');
    sa.quick('appHide');
  },

  initConfig() {
    // 请求初始化配置接口
    api.getConfig({
      isLoading: false,
    }, (res) => {
      xmini.piwikUpdate({
        isTrackWorking: res.data.track,
      });
      my.setStorage({
        key: 'joinTaobao',
        data: res.data.joinTaobaoConfig,
        success() {
          console.log('写入数据成功,joinTaobao');
        },
      });
      const { hotSearch } = res.data;
      this.updateData({'hotSearch': hotSearch});
      storage.set("couponList", res.data.couponList, 86400);
    }, err=>{
      return true;
    });
  },

  defalutLogin() {
    const that = this;
    authMixin.updatedAuthCode({
      authType: 'auth_user',
      authOption: ['auth_life_msg'], // 自定义授权项
      success(res) {
        // 用户同意了授权
        authMixin.postLogin({
          data: res,
          success(res1) {
            //
            console.log('登录成功', res1);
            // 流量效果标识回传
            riskgoMixin.syncAlipayRiskFlowReport()
            // 触发订阅
            that.onPublishEvent('LOGIN_SUCCESS')
          },
          fail(err1){
            //
            console.log('登录失败', err1);
          }
        });
      },
      fail(err) {
        console.log('app.js err', err);
        // 用户拒绝了授权 使用静默授权
        authMixin.updatedAuthCode({
          authType: 'auth_base',
          success(res) {
            authMixin.postLogin({
              data: res,
              success(res1) {
                console.log('静默登录成功', res1);
                // 流量效果标识回传
                riskgoMixin.syncAlipayRiskFlowReport()
                // 触发订阅
                that.onPublishEvent('LOGIN_SUCCESS')
              },
              fail(err1){
                console.log('静默登录失败', err1);
              }
            });
          },
          fail(err1) {
            //
          }
        })
      }
    })

  },

  updateData(options = {}, reset) {
    if (reset) {
      globalData = { ...defalutGlobalData };
      my.removeStorageSync({
        key: 'globalData',
        success() {
          console.log('reset 数据成功');
        },
      });
    } else {
      Object.assign(globalData, options);
      my.setStorageSync({
        key: 'globalData',
        data: globalData,
        success() {
          console.log('写入数据成功');
        },
      });
    }
    const data = this.getData();
    this.updateCommonParams(data);
    return data;
  },
  updateCommonParams(data = {}) {
    const {
      userInfo = {},
      systemInfo = {},
      netInfo = {},
    } = data;
    api.setCommonParams({
      terminal: 'aliapp', // 系统版本，用于获取最新版数据
      device: systemInfo.brand,      // 设备
      swidth: systemInfo.windowWidth,      // 屏幕宽度
      sheight: systemInfo.windowHeight,    // 屏幕高度
      net: netInfo.networkType,        // 网络
    });
  },
  resetData() {
    this.updateData(null, true);
  },
  getData(key) {
    return (key && globalData[key]) ? { ...globalData[key] } : { ...globalData };
  },
  // 订阅通知
  onSubscribeEvent(that = '', key, fun) {
    console.log('订阅通知:', key)
    if(!fun && typeof fun != 'function'){
      console.warn('缺少订阅参数！')
      return;
    }
    let array = eventListenerCache[key] && eventListenerCache[key].slice(0);
    if (!array) {
      array = [];
    }
    let index = -1;
    let currPageName = ''

    if ( typeof that === 'string') {
      currPageName = that === '' ? 'app': that
    } else {
      currPageName = that.getPageName()
    }

    for (let i = 0; i < array.length; i++) { // 检查是否存在重复订阅
      if (array[i]['pagename'] === currPageName) {
        index = i;
        break;
      }
    }
    if (index !== -1) { //  删除重复订阅
      array.splice(index, 1);
    }
    array.push({pagename: currPageName, fun: fun});
    eventListenerCache[key] = array;
    console.log('订阅事件列表：', eventListenerCache)
  },
  // 发送订阅通知
  onPublishEvent(key, ...args) {
    console.log('发送订阅通知: ', key)
    const array = eventListenerCache[key] && eventListenerCache[key].slice(0);
    if (!array) {
      console.warn('未查到订阅项！')
      return;
    }
    for (let i = 0; i < array.length; i++) {
      if (array[i]["fun"]) {
        array[i]["fun"].call(this, ...args);
      }
    }
  },
  // 取消订阅
  offSubscribeEvent(key, pageName) {
    if (!pageName) {
      delete eventListenerCache[key];
    } else {
      let array = eventListenerCache[key] && eventListenerCache[key].slice(0);
      if (array && array.length > 1) {
        let index = -1;
        for (let i = 0; i < array.length; i++) {
          if (array[i]['pagename'] === pageName) {
            index = i;
            break;
          }
        }
        if (index !== -1) { //  删除重复订阅
          array.splice(index, 1);
        }
        eventListenerCache[key] = array
      } else {
        delete eventListenerCache[key];
      }
    }
  },
  //设置底部购物车红点
  setBarRedDot(){
    console.log(my, 'showTabBarRedDot data');
    api.getUserCart(
      {
        isLoading: false,
      },
      res => {
        isRedDot(res.data.total_sku_cnt);
      },
      err => {
        return true;
      }
    );
  },
}));
