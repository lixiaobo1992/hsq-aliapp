// import Promise from 'bluebird'
import mixins from './mixins';
import { stringify } from './stringUtil';

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

// function checkStatus(res = {}) {
//   console.log('check')
//   const { status } = res
//   if (status >= 200 && status < 300) {
//     res.ok = true;
//     if(res.data && res.data.errno === 0) {
//       return res.data
//     }
//     const error = new Error(res.data)
//     // error.res = res.data
//     throw res.data
//   }
//   if (errCode[status]) {
//     my.showToast(`${status}: ${ errCode[status]}`)
//   }
//   const error = new Error(status)
//   error.res = res
//   throw {
//     error: error,
//     errno: status,
//     errmsg: errCode[status] || '网络请求错误',
//   }
// }
const reject = noop;
export default function request(url, options = {}, success = noop, fail = noop) {
  const { isLoading = true } = options;
  delete options.isLoading;

  const newOptions = Object.assign({ }, defaultOptions, options);
  const method = (newOptions.method || 'GET').toUpperCase();
  newOptions.method = method;
  if (method === 'GET') {
    // newOptions.headers = {
    //   'Content-Type': 'application/json; charset=utf-8',
    // };
    newOptions.data = JSON.stringify(newOptions.data);
  } else if (method === 'POST') {
    // newOptions.headers = {
    //   // 我们的 post 请求，使用的这个，不是 application/json
    //   'Content-Type': 'application/x-www-form-urlencoded',
    // };
    // newOptions.data = JSON.stringify(newOptions.data);
    newOptions.data = `${stringify(newOptions.data)}`;
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
      errmsg = '网络异常，请稍后重试',
      errno = 'err',
    } = err;
    if (errno === 510010) {
      // my.goPage('login');
      mixins.forward('login');
    } else {
      const message = `${errmsg}`;
      my.showToast(message);
      console.log('errmsg:', message);
    }
  };

  // console.log('请求参数：'+ JSON.stringify(newOptions))

  console.time(url);
  if (isLoading) {
    my.showLoading();
  }
  my.request(Object.assign({}, newOptions, {
    url, // 目标服务器 url
    success: (res = {}) => {
      // my.alert({
      //   content: `请求 ${url} ${res.status}`,
      // });
      console.timeEnd(url);
      console.group('api:');
      console.log(`请求 ${url} ${res.status}`);
      console.info(res);
      console.groupEnd('api');
      const { status, data = {} } = res;
      if (status >= 200 && status < 300) {
        res.ok = true;
        if (data.errno === 0) {
          resolve(data);
        } else if (status >= 400) {
          my.showErrPage('抢购火爆,稍候片刻!');
          return;
        } else {
          console.log('err:', data);
          reject(data);
        }
      } else {
        // 小程序未处理过的错误
        console.log('fetch 异常:', res);
        reject(new Error(data));
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
      // my.alert({
      //   title: 'err: ' + JSON.stringify(err),
      // });
      if (err.status >= 400) {
        my.showErrPage('抢购火爆,稍候片刻!');
        return;
      }
      if ([11, 12, 13, 14, 19, 20].indexOf(err.error) > -1) {
        my.showErrPage(err.errorMessage || '抢购火爆,稍候片刻!');
        return;
      }

      reject({
        errno: err.error,
        errmsg: err.errorMessage,
      });
    },
    complete: () => {

    },
  }));


  // 使用 Promise 不爽的地方
  // 统一处理错误信息，没法根据页面错误函数处理的结果来判断
  // 改为回调形式来使用，以支持此能力（Promise 无法实现 finally 最后调用）
  // return new Promise((resolve, reject) => {
  //   // 一个被 reject 的 promise, 后续的 then queue 都不会执行。。。
  //   my.request(Object.assign({}, newOptions, {
  //     url: url, // 目标服务器 url
  //     success: (res = {}) => {
  //       console.info(`请求 ${url} ${res.status}`);
  //       console.info(res);
  //       const { status, data = {} } = res
  //       if (status >= 200 && status < 300) {
  //         res.ok = true;
  //         if (data.errno === 0) {
  //           resolve(data);
  //         } else {
  //           console.log(data);
  //           reject(data);
  //         }
  //       } else {
  //         // 小程序未处理过的错误
  //         reject(new Error(data));
  //       }
  //     },
  //     fail: (err = {}) => {
  //       // 小程序处理过的错误
  //       console.log('request 请求错误', err);
  //       reject(err);
  //     },
  //     complete: () => {
  //       my.hideLoading();
  //     },
  //   }));
  // })
  // // .then(checkStatus)
  // // 等效 catch
  // // .then(undefined, function onRejected(err = {}) {
  // //   console.log('onFulfilled:', err);
  // //   const { errmsg = '接口错误', errno } = err;
  // //   if (errno === 510010) {
  // //     my.goPage("login");
  // //   } else {
  // //     my.showToast(`${errno}: ${errmsg}`);
  // //   }
  // //   const error = new Error(errno);
  // //   error.message = errmsg;
  // //   throw error;
  // // })
  // .catch((err = {}) => {
  //   const { errmsg = '网络异常，请稍后重试', errno } = err;
  //   if (errno === 510010) {
  //     my.goPage("login");
  //   } else {
  //     my.showToast(`${errno}: ${errmsg}`);
  //   }
  //   const error = new Error() || {};
  //   throw {
  //     errno,
  //     errmsg: errmsg || '数据格式化出现错误',
  //   };
  // });
  // // .then(function onFulfilled(res) {
  // //   console.log('onFulfilled:', res);
  // // }, function onRejected(err) {
  // //   console.log('onFulfilled:', err);
  // // })
}
