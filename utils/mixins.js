import {
  me,
  xmini,
  storage,
} from '../config/xmini';
import { allPages, defaultPage, tabPages } from './pages';
import urlMap, { getUrlType } from './urlMap';
import { stringify, Trim } from './stringUtil';
import { clone } from './objectUtil';
import urlParse from './url-parse/index';
import { isFastClick } from './is';
import { MY_APPID } from '/config'

import api from '/api';

import dealMiniAppJump from './miniapp'

const { qs } = urlParse;
let pageUUID = 1;
const messages = {};
let msgPages = {};
let udeskData;
let reTry = 3;

const app = getApp();


// mixin 方法，提供混入
// 绑定事件或触发类事件 全用 on 开头
// 自调用事件，不用 on 开头
export default {
  onLog() {
    // 日志方法
    console.log('log');
  },
  toAlipayPage(params = '') {
    // console.log('https://doweidu.udesk.cn/im_client/?' + url);
    // return;
    params = encodeURIComponent(encodeURIComponent(params))
    console.log('alipays://platformapi/startapp?appId=20000691&url=%2Fwww%2Fsrc%2Fxmada.html%3Fscene%3Dapp_haoshiqi%26extra%3D' + params);

    my.ap.navigateToAlipayPage({
      path: `alipays://platformapi/startapp?appId=20000691&url=%2Fwww%2Fsrc%2Fxmada.html%3Fscene%3Dapp_haoshiqi%26extra%3D${params}`,
      success: res => {
        console.log(res);
      },
      fail: err => {
        console.log(err);
      }
    })
  },
  initUdesk(cb) {
    reTry = 3;
    udeskData = storage.get("UDESK_DATA") || {};
    if(udeskData && udeskData.uuid) {
      my.hideLoading();
      cb && cb();
      return;
    }
    api.getUdesk({},
      res => {
        udeskData = res.data;
        storage.set("UDESK_DATA", udeskData, 86400);
        cb && cb();
      },
      err => {
        udeskData = {};
        // my.showToast('udesk 初始化失败');
      }
    );
  },
  goUdesk(e = {}) {
    if (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.log) {
      const log = e.currentTarget.dataset.log;
      console.log(log)
      xmini.piwikEvent(log)
    }
    if (udeskData && udeskData.uuid) {
      let udeskParams = this.getUdeskParams();
      // let productParams = {};
      const { userInfo, logged } = xmini.store.state.user;
      console.log('用户信息:');
      console.log(userInfo);
      if(!logged) {
        my.goPage('login');
        return;
      }
      // udeskParams.c_name = udeskParams.customer_name + '--' + userInfo.user_id;
      udeskParams.c_name = userInfo.user_id;
      this.getOpenIm(udeskParams);
    }else{
      // 简单的重试
      console.log(reTry);
      if(reTry-- > 0) {
        setTimeout(() => {
          this.initUdesk(() => this.goUdesk());
        }, 100);
      } else {
        // this.showToast('初始化客服数据失败');
        my.showToast('初始化客服数据失败')
      }
    }
  },
  getOpenIm(imParams, pluginId = '40456') {
    api.getOpenIm({},
      res => {
        const { data = {} } = res;
        imParams = Object.assign({}, imParams, data);

        let udeskParams = this.getUrlParams(imParams) + `&web_plugin_id=${pluginId}`;
        console.log('alipays://platformapi/startapp?appId=20000691&url=%2Fwww%2Fsrc%2Fxmada.html%3Fscene%3Dapp_haoshiqi%26extra%3D' + udeskParams);

        this.toAlipayPage(udeskParams);
      },
      err => {
        console.log(err);
      }
    )
  },
  getUrlParams(data = {}) {
    let flag = false;
    let paramsString = '';
    for(let key in data) {
      console.log(key);
      if (!flag) {
        paramsString += `${key}=${data[key]}`;
        flag = true;
      }else {
        paramsString += `&${key}=${data[key]}`;
      }
    }
    return paramsString;
  },
  getUdeskParams() {
    return {
      tenant_id: udeskData.uuid, // 租户ID，是平台的ID
      merchant_euid: udeskData.merchant_id, // 商户euid，是要链接的商户的id，这个是商户的唯一标识，平台在创建商户的时候指定的这个id
      customer_euid: udeskData.euid, // userId
      customer_name: udeskData.name, // userName
    };
  },
  makePhoneCall() {
    const page = this.getPageName();
    let log = '';
    switch(page) {
      case 'index':
        log = 'c_advice_home';
        break;
      case 'detail':
        log = 'c_advice_detail';
        break;
      case 'zt2':
        log = 'c_advice_project';
        break;
      case 'order-detail':
        log = 'c_tel';
        break;
      default:
        // do nothing...
    }
    xmini.piwikEvent(log);
    const number = '4001858058';
    my.makePhoneCall({ number });
  },
  setPageTitle(title = '', callback) {
    my.setNavigationBar({
      title,
      success() {
        callback && callback();
      },
    });
  },
  formidSubmit(e) {
    // 有效期7天，一天提交一次即可
    // 必须登录状态
    if (!e) return;
    // console.time('formId');
    const pageName = this.getPageName();
    const pageFormId = `formid-${pageName}`;
    // const cacheFormId = storage.get(pageFormId);
    // if (cacheFormId) {
    //   console.log(`已存在 ${cacheFormId}`);
    //   console.timeEnd('formId');
    //   return cacheFormId;
    // }
    const { formId } = e.detail;
    console.log('formId:', formId)
    if (typeof formId === 'number') {
      console.log('这是IDE，formId是假的');
      return;
    }
    this.formId = formId;
    api.formidSubmit({
      isLoading: false,
      formId: formId,
      page: pageName,
    }, (res) => {
      // console.log('上传formId success',formId);
      // console.log(res.data);
      storage.set(pageFormId, formId, 86400);
      // console.timeEnd('formId');
      // my.showToast('上传formId success')
    }, (err) => {
      // console.log('上传formId fail');
      // console.log(err);
      storage.set(pageFormId, 'api 401 stop', 10);
      // my.showToast('上传formId fail')
      // console.timeEnd('formId');
      return true;
    });
    // my.showToast(e.detail.formId)
    // console.log(Date.now())
    // console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },

  /**
   * onLoad 内调用，会检测 pageName 以及 query
   *
   * - 保存 query 数据(数据全保存在 this.data 下)
   * - 初始化分享信息
   *   - 先设置 shareInfo 为 true; 启用分享
   *   - 随后可以更新分享信息保存在 this.shareInfo
   *
   * @param {any} query
   */
  onPageInit(query = {}) {
    console.log('onPageInit', JSON.stringify(query));
    const params = xmini.getChannel();
    query = Object.assign({
      // spm: params.spm,
      channel_id: params.channel,
    }, query);

    this.setQuery(query);

    // 判断当前query 上有没有spm
    if (this.pageQuery.spm) {
      console.log('this.pageQuery.spm',this.pageQuery.spm);
      const app = getApp();
      const newSpm = app.parsingSpm(this.pageQuery.spm);
      app.updatedSpm(newSpm)
    }

    // console.log('after query' + JSON.stringify(query));

    // 是否要所有页面全开启分享信息
    if (this.data.shareInfo) {
      this.onShareAppMessage = () => {
        console.log('设置分享信息');
        console.log(this.getShareInfo());
        return this.getShareInfo();
      };
    } else {
      delete this.onShareAppMessage;
      my.hideShareMenu && my.hideShareMenu() // 隐藏分享
    }

    // 这里有问题
    const pagesArr = getCurrentPages() || [];
    msgPages = {};
    pagesArr.forEach((pageItem, index) => {
      const { pageName, pageId, route } = pageItem;
      // 修改支持多个页面
      const msgKey = `${pageName}:${pageId}`;
      if (!msgPages[pageName]) {
        msgPages[pageName] = [msgKey]
        // msgPages[pageName] = msgKey;
        // const message = messages[msgKey];
        // if (message && message.needRefresh) {
        //   pageItem.refresh();
        //   delete messages[msgKey];
        // }
      } else {
        msgPages[pageName].push(msgKey);
      }
    });
    // console.log(msgPages);

  },

  setQuery(query = {}) {
    const pageName = this.getPageName();
    Object.assign(this, {
      pageName,
      pageId: pageUUID++,
      pageQuery: query,
      pagePath: 'pages/' + pageName + '/' + pageName,
    });
    if (!pageName) {
      console.error('页面不存在');
    }
  },
  updatadSpmPage(){
    console.log('updatadSpmPage: pageName', this.pageName);
    // 判断当前页是否是 tab 页
    const tabPagesKeys = Object.keys(tabPages);
    const pageName = this.pageName;
    if (tabPagesKeys.includes(pageName)) {
      const app = getApp();
      // console.log('updatadSpmPage:',app);
      app.updatedSpm({
        page: pageName
      })
    }
  },
  // page.json 支持 optionMenu 配置导航图标，点击后触发 onOptionMenuClick
  onOptionMenuClick(e) {
    console.log('optionMenu', e);
  },

  getPageName() {
    const { pageName } = me.$getPageInfo();
    return pageName;
    // const { pageName, route = '' } = this;
    // return pageName || route.split('/').reverse()[0] || defaultPage;
  },


  getShareInfo() {
    const { shareInfo } = this.data;

    const { currentSpm } = xmini.store.state.spm;

    const tempQuery = {...this.pageQuery, spm: currentSpm};
    // const { spm, channel_id} = tempQuery
    // delete tempQuery.spm
    // delete tempQuery.channel_id

    // let currentQuery = {
    //   spm,
    //   channel_id,
    //   minishare: 1,
    // };

    const currentPageName = this.getPageName();

    // pages/index/index?spm=xxx&channel_id=xxx&minishare=1&jumplink=zl-list?eid=1


    // pages/zl-list/zl-list??eid=1&spm=xxx&channel_id=xxx

    // 排除首页
    // if (currentPageName !== 'index') {
    //   // 首页通过 分享页 区分跳转位置
    //   currentQuery.jumplink = encodeURIComponent(`${currentPageName}?${stringify(tempQuery)}`)
    // }
    // 统一分享首页 页面query不变
    let { pageUrl } = my.getCurPageUrl(currentPageName, tempQuery);
    // let { pageUrl } = my.getCurPageUrl('index', currentQuery);
    // if (!shareInfo || shareInfo === false) {
    //   pageUrl = defaultPage;
    // }
    // !!!分享带的参数只能在页面的onLoad里拿到
    // !!!在页面onLoad里拿到如果有channel_id参数且有minishare参数时，则更新公共参数channel
    let imageUrl;
    if (currentPageName === 'index') {
      imageUrl = 'https://img1.haoshiqi.net/aliapp/img/share_cba33efb6b.jpg';
    }
    if (shareInfo.piwikAction) {
      xmini.piwikEvent(shareInfo.piwikAction, shareInfo.piwikData || '');
    }
    return Object.assign({
      title: '好食期',
      desc: '专注食品特卖平台，品牌食品2折起～',
      // content:'专注食品特卖平台，品牌食品2折起～', // 自定义吱口令文案
      imageUrl,
      // imageUrl: 'https://static.doweidu.com/static/hsq/images/logo_fdfe8f30f2.png', // 默认可以设置 logo
      path: pageUrl,
      success() {
        // my.showToast('分享成功');
      },
      fail() {
        // my.showToast('分享失败');
      },
    }, shareInfo);
  },
  // 统一分享跳转
  shareJump(){
    // 区分分享链接，确定分享位置跳转
    const { jumplink } = this.pageQuery

    // console.log('index.js pageQuery1', this.pageQuery);
    if (jumplink) {
      // my.alert({
      //   content: JSON.stringify(jumplink),
      // })
      delete this.pageQuery.jumplink
      const temp = jumplink.split('?');
      let tempQuery = temp[1] ? qs.parse(temp[1]) : {};
      // tempQuery.minishare = 1;
      const typeH5 = /^(https|http):\/\//i;
      for (let key in tempQuery) { // qs.parse会将url解析出来，这里检测value是h5链接重新encode
        if (typeH5.test(tempQuery[key])) {
          tempQuery[key] = encodeURIComponent(tempQuery[key]);
        }
      }
      delete tempQuery.replace; //删除分享中replace
      this.forward(temp[0], { ...tempQuery, isNotClick: true })
    }
  },

  goHome() {
    // tarbar 的页面不支持 queryString, 先将SPM信息加入队列
    // my.addSPM(my.getSPM());
    this.forward('index');
  },
  // 绑定跳转
  onUrlPage(e) {
    if (!isFastClick()) {
      console.warn('慢着点，别着急')
      return;
    }
    // moduleId 主要是首页模块记录
    let { url, moduleId, index, piwikEvent, piwikData } = e.currentTarget.dataset;
    // url = 'miniapp://pages/zt2/zt2?appname=point&topic_code=7657134e4d70839222854b2bc01705f6';
    // url = 'miniapp://?appid=2018100960315234&activityId=181022952954438'
    // url = 'miniapp://?appid=2017111409929370&_s=haoshiqi'
    // url = 'https://m.haoshiqi.net/v2/couple-detail?id=52130'
    // console.error(url);

    // 测试分享有礼
    // url = 'miniapp://?appid=2018121862587354&appId=2017112000051610&shareTemplateId=V2MS20190320000001351234';
    // url = 'https://m.haoshiqi.net/v2';
    // 收藏有礼
    // url = 'miniapp://pages/index/index?appid=2018122562686742&originAppId=2017112000051610&newUserTemplate=20190522000000183279';

    if (piwikEvent) {
      xmini.piwikEvent(piwikEvent, piwikData);
    }

    url = Trim(url+'');
    if (!url || url == 'undefined' || url == 'null') {
      return;
    }
    console.log(`${(url || '无需跳转')}, ${index}`);
    const currentPage = this.getPageName();
    const type = getUrlType(url);

    // debugger
    if (type == 'miniapp') {
      let urlInfo = url.split('?');
      let tempQuery = urlInfo[1]
      tempQuery = qs.parse(tempQuery)


      if (!tempQuery.appname && !tempQuery.appid) {
        console.log('小程序之间跳转, 缺少appname,appid');
        return
      }

      let currAppId = null;

      const { tempQuery: newQuery, currAppId: newAppId } = dealMiniAppJump(tempQuery)
      if (newQuery && newAppId) {
        tempQuery = newQuery
        currAppId = newAppId
      } else {
        return;
      }

      if (currAppId !== MY_APPID) {
        // 添加appid
        tempQuery.appid = currAppId

        url = `${urlInfo[0]}?${stringify(tempQuery)}`
      } else { // 当前小程序 处理当前
        // delete tempQuery.appname
        // delete tempQuery.channel_id
        // const localUrl = urlParse(url);
        // if (localUrl.pathname !== '' ) {
        //   let tempPage = localUrl.pathname.split('/')
        //   tempPage = tempPage[tempPage.length - 1]
        //   url = `/${tempPage}?${stringify(tempQuery)}`
        // } else {
        //   return;
        // }

        // console.log('当前小程序跳转')
        // url = `${urlInfo[0]}?${stringify(tempQuery)}`

        // 存在跳转是渠道问题
        console.log('暂不支持当前小程序跳转到当前小程序');
        return;
      }
    }

    // urlMap(url); 为什么要放在这里, 处理完小程序链接需要把它转换一下
    // topic 链接需要它前置先转换
    // !! 需要考虑一下统一
    const map = urlMap(url);
    // !!map.page === 'phone-cost' 临时处理
    if(type == 'topic' || map.page === 'phone-cost') {
      const { pageQuery } = this;

      let urlInfo = url.split('?');
      // 需要跳的topic 链接上有spm

      let tempQuery = this.setSpm(map.query, moduleId);

      if (!tempQuery.channel_id && pageQuery && pageQuery.channel_id) {
        tempQuery.channel_id = pageQuery.channel_id;
      }

      url = `${urlInfo[0]}?${stringify(tempQuery)}`


      let tempPageName = 'topic'
      if (map.page == 'phone-cost') {
        tempPageName = 'web-view'
      }

      my.goPage(tempPageName, {url: encodeURIComponent(url)});
      return;
    }

    // if(!map.page && currentPage !== defaultPage) {
    //   map.page = defaultPage;
    // }
    console.log(`jump: ${map.page} <- ${url}`)
    if (!map.page) {
      console.log('暂不支持跳转此页面');
      return;
    }

    if (map.page === 'couponskulist' || map.page === 'sku') {
      my.showToast('亲，此优惠券小程序暂不支持哦~');
      return;
    }

    if (map.page === 'phone-cost') {
      const { token } = api.getCommonParams();
      url = urlfix(url, 'token=' + token);
      this.forward('web-view', { url });
    }
    // if(map.page === 'order-result'){
    //   const { token = '' } = api.getCommonParams();
    //   url = urlfix(url, 'token=' + token);
    //   this.forward('web-view', { url });
    // }
    if(map.page === currentPage && map.page != 'zt' && map.query){
      map.query.replace = true;
      if (map.page == 'index') {
        console.log('首页跳转首页无需跳转');
        if (tiptype == 'active') {
          this.setData({
            activeShow: false,
          })
        }else {
          this.setData({
            couponShow: false,
          })
        }
        return;
      }
    }

    // !! 有个问题， 这个模块需要在点击统计之后在修改
    // 更新spm 第三段
    let tempQuery = this.setSpm(map.query, moduleId);

    // my.goPage(map.page, map.query);
    this.realGoPage(map.page, tempQuery);

  },

  // 页面跳转
  forward(page, query = {}) {
    if (query.isNotClick || query.authType) { //授权链接不处理
      delete query.isNotClick;
      if (!isFastClick()) {
        console.warn('慢着点，别着急')
        return;
      }
    }

    let tempPage = page, tempQuery = query

    if (page === 'login' || query.refresh) {
      Object.assign(tempQuery, {
        ref: this.getPageName(),
        needRefresh: true,
      });
    }
    if (tempQuery.appname || tempQuery.appid) {
      // delete query.miniapp
      let currAppId = null;

      const { tempQuery: newQuery, currAppId: newAppId } = dealMiniAppJump(tempQuery)
      if (newQuery && newAppId) {
        tempQuery = newQuery
        currAppId = newAppId
      } else {
        return;
      }
      // const channel = api.getChannel('channel')
      // if (!tempQuery.channel_id && channel !== '') {
      //   tempQuery.channel_id = channel
      // }
      if (currAppId !== MY_APPID) { // 当前小程序
        tempQuery.appid = currAppId;

        tempPage = page.split('?')[0] || ''; // 过滤页面路径后附带参数
        const url = `miniapp://${tempPage}?${stringify(tempQuery)}`;
        const map = urlMap(url);
        tempPage = map.page;
        tempQuery = map.query;
      } else {
        delete tempQuery.appname;
        delete tempQuery.channel_id;
        let tempPage = page.split('/');
        tempPage = tempPage[tempPage.length - 1];
      }
      if(tempQuery.appname == 'point'){
        tempQuery.channel_id = 'point'
      }
    }

    // 更新spm 第三段
    tempQuery = this.setSpm(tempQuery);
    // my.goPage(tempPage, tempQuery);
    this.realGoPage(tempPage, tempQuery);
  },

  // 统一添加spm
  setSpm(query, moduleId) {

    const app = getApp();
    let tempTag = false;
    let newSpm = {}
    if (query.spm) {
      tempTag = true;
      // 更新spm
      newSpm = app.parsingSpm(query.spm);
    }
    // 更新spm 第三段
    if (moduleId) {
      tempTag = true;
      newSpm.block = moduleId
    }
    // 这里主要 需要一起更新
    if (tempTag) {
      app.updatedSpm(newSpm)
    }

    let tempQuery = clone(query);
    const { currentSpm, pre_spm } = xmini.store.state.spm;
    tempQuery.spm = currentSpm;
    tempQuery.pre_spm = pre_spm;

    return tempQuery
  },
  realGoPage(page, query) {
    // piwik统计数据, 如果当前URL没有携带统计数据则使用上页数据
    const { pageQuery } = this;
    // if (!query.spm) {
    //   query.spm = (pageQuery && pageQuery.spm) || 'aliapp';
    // }

    if (!query.channel_id) {
      query.channel_id = (pageQuery && pageQuery.channel_id);
    }
    const pageName = this.getPageName();
    // 当前路径
    query.refer = 'pages/' + pageName + '/' + pageName;

    console.log('====page:' + page + ', query:' + JSON.stringify(query));

    my.goPage(page, query);
  },

  back(step, query = {}) {
    let opts;
    if (typeof step === 'number' || typeof step === 'undefined') {
      opts = {
        delta: step || 1,
      };
    } else if (typeof step === 'string') {
      opts = {
        url: `${step}?${stringify(query)}`,
      };
    }
    my.navigateBack(opts);
  },

  refresh() {
    console.info('need refresh => do onLoad();');
    // 不要直接使用onLoad，会丢失query参数以及导致页面初始化重置onPageInit
    // this.onLoad();
  },

  postMessage(page, opts = {}) {
    if (!allPages[page] && !msgPages[page] || page === this.getPageName() ) {
      console.error(`无法给 ${page} 页面发消息`);
      return;
    }
    const msgKeys = msgPages[page] || [];
    msgKeys.forEach((msgKey, index) => {
      if (!messages[msgKey]) messages[msgKey] = {};
      Object.assign(messages[msgKey], opts);
    });
  },

  onMessage() {
    const page = this.getPageName();
    const msgKey = `${page}:${this.pageId}`;
    let message;
    if (allPages[page] || messages[msgKey]) {
      message = messages[msgKey] || {};
      delete messages[msgKey];
      if (message.needRefresh) {
        // my.showToast('触发刷新');
        // delete messages[msgKey];
        this.refresh();
        // my.trigger({
        //   hsq: 'refresh',
        // });
      }
    }
    return message || {};
  },
};
