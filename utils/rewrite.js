// 针对 my 挂载的方法进行覆写或扩展，优化增强调用方法
import { stringify } from './stringUtil';
import { allPages, tabPages } from './pages';
import { xmini } from '/config/xmini';


export function delayPromise(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function myRewrite(func, opts, funcName) {
  const funcTemp = func;
  return (options) => {
    let op = options;
    if (funcName === 'showToast' && !op) {
      // showToast content 必须要有值
      op = '数据出错';
    }
    if (typeof op === 'string') {
      op = Object.assign({
        content: op,
      }, opts);
    }
    funcTemp(op);
  };
}

function rewrite() {
  console.log('覆写 my.showToast，my.showLoading 方法');
  my.showToast = myRewrite(my.showToast, {
    duration: 2000,
  }, 'showToast');
  my.showLoading = myRewrite(my.showLoading, {
    delay: 2000,
  }, 'showLoading');

  my.showErrPage = (message = '', replace = true) => {
    if (!my.isShowError) {
      my.isShowError = true;
      my.goPage('error', {
        message,
        replace,
      });
    }
  };

  my.getCurPageUrl = (url = '', params = {}) => {
    let query = { ...params };
    let urlArr = url ? url.split('?') : [];
    let pageName = urlArr[0];
    if (!pageName) return;
    let pagePath = allPages[pageName]; // || ''; 这里暂时不要适配空的情况，收藏有礼会失败
    query = !urlArr[1] ? stringify(query) :
         [stringify(query), urlArr[1]].join('&');
    if (!pagePath) {
      if(url == '/') {
        pagePath = '';
      }

      // return {};
      // 提取处理 外部 url 数据
      // const { hash, search } = new URL(url);
      // console.log(search);
      // page = hash;
      // if (/\?/.test(hash)) {
      //   [page] = hash.split('?');
      // }
      // const mapPage = h5Map[page.replace(/#/g, '')];
      // page = allPages[mapPage];
    }
    query = query ? `?${query}` : '';
    return {
      pageName,
      query,
      pagePath: `${pagePath}`,
      pageUrl: `${pagePath}${query}`,
    };
  };
  my.goBack = (step, query = {}) => {
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
    console.log('当前页：' + getCurrentPages().length, step)
    if (getCurrentPages().length > step) {
      console.log('自带回退')
      my.navigateBack(opts);
    } else {
      // 必须得写参数大括号
      my.navigateBackMiniProgram({});
    }
  };
  /**
   * 扩展页面跳转方法，支持内部跳转以及H5 url 映射到小程序内部跳转
   *
   * @param {any} url
   * @param {any} [query={}]
   * @returns
   */
  my.goPage = (url, query = {}) => {
    if (!url) return;
    const { replace, back, appname, appid } = query;
    // const app = getApp();
    const params = xmini.getChannel();
    query = Object.assign({
      // spm: params.spm,
      channel_id: params.channel,
    }, query);

    let page = url;
    let type = '';

    const { pageName, pagePath, pageUrl } = my.getCurPageUrl(url, query) || {};
    if (appname || appid) {
      type = 'miniapp'
    } else {

      type = replace ? 'replace' : (back ? 'back' : '');

      if (type !== 'miniapp' && !pagePath) return

      page = { url: `/${pageUrl}` };

      if (tabPages[pageName]) {
        type = 'switch';
        page = { url: `/${pagePath}` };
      }
    }

    // 测试  TODO
    // if (env.host != "m.haoshiqi.net" && url == 'coupon-sku-list') {
    //   my.redirectTo(page);
    //   return;
    // }

    /* eslint no-param-reassign: 0 */
    delete query.replace;
    delete query.back;
    delete query.appname;

    switch (type) {
      case 'replace':
        // 上传formid事件没办法触发，需要一点时间延迟
        setTimeout(() => {
          my.redirectTo(page);
        },200)
        break;
      case 'back':
        my.navigateBack(page);
        break;
      case 'switch':
        // my.switchTab: url 不支持 queryString
        // 上传formid事件没办法触发，需要一点时间延迟
        setTimeout(() => {
          my.switchTab(page);
        },200)
        break;
      case 'miniapp': // 跳小程序
        const { appid, miniAppType } = query
        delete query.appid;
        delete query.miniAppType;

        let tempPath = `/${page}`
        const tempQuery = stringify(query)
        if (tempQuery || tempQuery !== '') {
          tempPath += '?' + tempQuery
        }
        console.log('miniapp:',appid,tempPath,query,miniAppType)
        // 1 // 同主体下小程序
        // 2 // 白名单内小程序

        // if (parseInt(miniAppType) === 1) {
        if(true) {
          const miniUrl = {
            appId: appid, // 跳转到的小程序appId
            // path, // 打开的页面路径，如果为空则打开首页
            extraData: query, // 需要传递给目标小程序的数据
            success: (res) => {
              console.log('navigateToMiniProgram res:',res)
            },
            fail: (err) => {
              console.log('navigateToMiniProgram err:',err)
            },
            complete: (val) => {
              console.log('navigateToMiniProgram complete',val)
            }
          };
          if(!!pagePath) {
            miniUrl.path = tempPath;
          }
          // console.error('miniUrl', JSON.stringify(miniUrl, null, 2))
          my.navigateToMiniProgram(miniUrl);
        // } else {
          // 白名单小程序
          // 1.调用API为 my.call('startApp', {})
          // 2. 白名单小程序互调 path 前面要加 /，同主体不能加 /
          // try {
          //   my.call('startApp', {
          //     appId: appid,
          //     param: {
          //       page: tempPath,
          //       query: query
          //     },
          //     success: (res) => {
          //       console.log('startApp res:', res)
          //     },
          //     fail: (err) => {
          //       console.log('startApp err:', err)
          //     },
          //   })
          // } catch (e) {
          //   // Do something when catch error
          //   console.log(e)
          // }
        }

        break;
      default:
        /* eslint no-undef: 0 */
        if (getCurrentPages().length === 10) {
          setTimeout(() => {
            my.redirectTo(page);
          }, 200);
        } else {
          // navigateTo, redirectTo 只能打开非 tabBar 页面。
          // switchTab 只能打开 tabBar 页面。
          my.navigateTo(page);
        }
        break;
    }
  };
}

export default rewrite;


// // es6 Promise.done() / Promise.finally()
// Promise.prototype.finally = function (callback) {
//   let P = this.constructor;
//   return this.then(
//     value  => P.resolve(callback()).then(() => value),
//     reason => P.resolve(callback()).then(() => { throw reason })
//   );
// };
// if (typeof Promise.prototype.done === 'undefined') {
//   Promise.prototype.done = function (onFulfilled, onRejected) {
//     this.then(onFulfilled, onRejected).catch(function (error) {
//       setTimeout(function () {
//         throw error;
//       }, 0);
//     });
//   };
// }
// var promise = Promise.resolve();
// promise.done(function () {
//   JSON.parse('this is not json');    // => SyntaxError: JSON.parse
// });
