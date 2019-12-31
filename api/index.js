import env from '/config/env';
import { MY_APPID } from '/config/index'
import { modelApis, commonParams, headers } from './api.config';
import request from './request';
import { compact } from '/utils/objectUtil'
import { storage } from '@xmini/x-mini/lib/index';
import { version } from '/app.json';

import {
  xmini,
} from '/config/xmini';
// 公共参数
headers.init({
  // token: getToken(),
  // userId: userInfo.userId || '', // 用户唯一标志
});

let userInfo = storage.get('userInfo') || {};

commonParams.init({
  token: userInfo.token,
  uid: userInfo.user_id,
  zoneId: '857',  // 当前收货省份
  uuid: userInfo.user_id,       // 用户唯一标志
  udid: '',       // 设备唯一标志
  timestamp: '',  // 时间
  channel: 'aliapp', // 渠道
  // cpsName: '',    // 废弃
  spm: 'aliapp',
  v: version,  // 系统版本，用于获取最新版数据
  terminal: 'aliapp',// 系统版本，用于获取最新版数据
  device: '',     // 设备
  swidth: '',     // 屏幕宽度
  sheight: '',    // 屏幕高度
  /* eslint appx/no-appx-globals: 0 */
  location: '',   // 地理位置
  net: '',        // 网络
  appId: MY_APPID,
});
const regHttp = /^https?/i;
const apiList = Object.keys(modelApis).reduce((api, key) => {
  const val = modelApis[key];
  const [url, methodType = 'GET'] = val.split(/\s+/).reverse();
  const method = methodType.toUpperCase();

  // 调用方式 api.apiName(this)({}, ()=>, ()=>{});
  api[key] = function postRequest(params, success, fail) {
    // url
    // console.log('=====', this)

    // const app = getApp();

    const originUrl = regHttp.test(url)
      ? url
      : `${env.apiBaseUrl}${url}`;

    // weights 接口权重 0没有 1
    const { isLoading = true, weights = 0, scope } = params;
    delete params.isLoading;
    delete params.weights;
    delete params.scope;

    // console.log(xmini.getChannel())
    const {
      channel
    } = xmini.getChannel()

    const temp = compact(Object.assign({}, commonParams.get(), { channel }, params));

    const header = headers.get();
    return request.call((scope || null), {
      weights,
      isLoading,
      url: originUrl,
      method,
      header,
      options: temp,
      success,
      fail,
    }); // bind this
  }
  return api;
}, {})


apiList.setCommonParams = commonParams.set;
apiList.getCommonParams = commonParams.get;
apiList.setHeader = headers.set;
apiList.getHeader = headers.get;

// apiList.getChannel = function getChannel(key) {
//   const params = commonParams.get(key);
//   return (['channel', 'spm'].indexOf(key) > -1) ? params : {
//     channel: params.channel,
//     spm: params.spm,
//   };
// };

// apiList.isChannel = function isChannel(id) {
//   return id === commonParams.get('channel') ? true : false;
// };
apiList.isHuabei = function isHuabei(data) {
  return data === 'huabei' ? true : false;
};



export default apiList;
