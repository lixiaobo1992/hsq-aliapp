// import Promise from 'bluebird'
import mixins from '/utils/mixins';
import { stringify } from '/utils/stringUtil';

function noop() {
  console.log('默认流程');
}

// 跨域设置默认好像已经设定
const defaultOptions = {
  // silent
  method: 'GET',   // 使用的HTTP动词，GET, POST, PUT, DELETE, HEAD
  url: '',         // 请求地址，URL of the request
  headers: {
    // Accept: 'application/json',
    // 'content-type': 'application/json' // 默认值
    // 'Content-Type': 'application/x-www-form-urlencoded',
    'content-type': 'application/x-www-form-urlencoded',
  },
  dataType: 'json',
  // data: '',
  mode: 'cors',           // 请求的模式，主要用于跨域设置，cors, no-cors, same-origin
  timeout: 30000,
  credentials: 'include', // 是否发送Cookie omit, same-origin
  // redirect // 收到重定向请求之后的操作，follow, error, manual
  // integrity // 完整性校验
  // cache: 'default', // 缓存模式(default, reload, no-cache)
};

// response
// type – basic, cors
// url
// useFinalURL – 是否为最终地址
// status – 状态码 (ex: 200, 404, etc.)
// ok – 是否成功响应 (status in the range 200-299)
// statusText – status code (ex: OK)
// headers – 响应头

// const errCode = {
//   11: '无权跨域',
//   12: '网络出错',
//   13: '超时',
//   14: '解码失败',
//   19: 'HTTP错误',
// };

function request({
  weights = 0,
  isLoading = true,

  url,
  method,
  header,
  options = {},
  success = noop,
  fail = noop,
}) {

  const scope = this;

  let newOptions = Object.assign({}, defaultOptions);
  newOptions.url = url;
  newOptions.headers = {
    ...newOptions.headers,
    ...header,
  };

  // 请求方式
  newOptions.method = (method || 'GET').toUpperCase();

  if (newOptions.method == 'GET') {
    newOptions.headers['content-type'] = 'application/json; charset=utf-8';
    newOptions.data = options;
  } else if(newOptions.method === 'POST'){
    // header['content-type'] 默认就是 'application/x-www-form-urlencoded'
    newOptions.data = options;
  }

  const resolve = (data) => {
    isLoading && my.hideLoading();
    if (typeof success === 'function') {
      success(data);
    }
  };

  const reject = (err = {}) => {
    isLoading && my.hideLoading();
    if (typeof fail === 'function' && fail(err)) {
      return;
    }
    const {
      errmsg = '抢购火爆，稍候片刻！',
      errno = 'err',
    } = err;
    if (errno === 510010) {
      // my.goPage('login');
      mixins.forward('login');
    } else if (weights) {
      let type = '';
      let errorMessage = errmsg;
      if ([11, 12, 13, 14, 19, 20].indexOf(err.errno) > -1) {
        type = 'net';
        errorMessage = '网络不给力，请检查你的网络设置~'
      }
      scopeError({
        type,
        errorMessage
      })
    } else {
      const message = `${errmsg}`;
      console.log('errmsg:', message);
      my.showToast(message);
    }
  };

  function scopeError(err = {}) {
    isLoading && my.hideLoading();
    setTimeout(() => {
      console.log(scope);
      if (scope && scope.pageName) {
        if (scope.dwdPageComponent) {
          scope.dwdPageComponent.setData({
            isShowError: true,
            type: err.type || '',
            title: '',
            content: err.errorMessage || '网络不给力，请检查你的网络设置~',
            btnText: '点我重试'
          }, () => {
            scope.setData({
              isLoading: false,
            })
          })
        } else {
          my.showToast(err.errorMessage || '网络不给力，请检查你的网络设置~');
          scope.setData({
            isLoading: false,
          })
        }
      }
    }, 0)
  }

  console.time(url);
  if (isLoading) {
    my.showLoading();
  }

  my.request(Object.assign({}, newOptions, {
    // url, // 目标服务器 url
    success: (res = {}) => {
      console.timeEnd(url);
      console.group('api:');
      console.log(`请求 ${url} ${res.status}`);
      console.info(res);
      console.groupEnd('api');
      let { status, data = {} } = res;

      // status = 100;

      if (status >= 200 && status < 399) {
        res.ok = true;
        if (data.errno === 0) {
          resolve(data);
        } else {
          console.log('err:', data);
          reject(data);
        }
      }else if (status >= 400) {
        // my.showErrPage('抢购火爆,稍候片刻!');
        // if (weights) {
        //   scopeError({type: 'net'});
        // } else {
          reject({
            errmsg: '抢购火爆，稍候片刻！',
            errno: 'err',
          });
        // }
      } else {
        // 小程序未处理过的错误
        console.log('fetch 异常:', res);
        reject({
          errmsg: '抢购火爆，稍候片刻！',
          errno: 'err',
        });
      }
    },
    fail: (err = {}) => {
      console.timeEnd(url);
      // 小程序处理过的错误
      console.log('fail:', err);
      // err: {
      //   error: 12,
      //   errorMessage: '',
      // }
      if (err.status >= 400) {
        // 这里会跳错误页
        // my.showErrPage('抢购火爆,稍候片刻!');
        // if (weights) {
        //   scopeError({type: 'net'});
        // } else {
          reject({
            errmsg: '抢购火爆，稍候片刻！',
            errno: 'err',
          });
        // }
        return;
      }
      // if ([11, 12, 13, 14, 19, 20].indexOf(err.error) > -1) {
      //   // 这里会跳错误页
      //   if (weights) {
      //     scopeError({...err, errorMessage: '网络不给力，请检查你的网络设置~', type: 'net'});
      //     return;
      //   }
      //   // my.showErrPage(err.errorMessage || '抢购火爆,稍候片刻!');
      // }

      reject({
        errno: err.error,
        errmsg: '网络不给力，请检查你的网络设置~' //err.errorMessage,
      });
    },
    complete: () => {

    },
  }));
}


export default request;
