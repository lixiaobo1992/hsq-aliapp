import api from '/api';
import { getQueryString } from './stringUtil';
import { urlfix } from './index';
import { xmini } from '../config/xmini';

export default {
  getOrderPayInfo({ data, success, fail }) {
    // {type:3,orderIds:orderIds}
    // 花呗渠道限制只能使用花呗支付
    // const app = getApp();
    const appData = xmini.getChannel();
    const credit_huabei = api.isHuabei(appData.channel) ? 1 : 0;
    const newData =  Object.assign({}, data, {
      orderIds: (data.orderIds || []).toString(),
      credit_huabei
    });
    api.orderPay(newData, (res) => {
      // console.log(JSON.stringify(res));
      success && success.call(this, res);
    }, (err) => {
      // console.log(JSON.stringify(err));
      if (err && err.errmsg) {
        const listErr = [230004,210018];
        if(listErr.indexOf(err.errno) > -1){
          this.dealPayErr(err);
        } else {
          wx.showToast(`${err.errmsg}`);
        }
      } else {
        wx.showToast('数据请求失败');
      }
      fail && fail.call(this, err);
      return true;
    });
  },
  // 调起支付
  requestPayment({ data, success, fail }) {
    const that = this;
    my.tradePay({
      tradeNO: data.tradeNO, // 完整的支付参数拼接成的字符串，从服务端获取
      success: (res) => {
        // 9000 订单支付成功。
        if (res.resultCode != 9000) {
          fail && fail.call(this, res);
          return;
        }
        that.postMessage('order-list', {
          needRefresh: true,
        });
        that.postMessage('zl-detail', {
          needRefresh: true,
        });
        // 确认订单
        success && success.call(this, res);
      },
      fail: (err) => {
        fail && fail.call(this, err);
      },
      complete: (res) => {
        console.log(JSON.stringify(res));
      },
    });
  },
  confirmOrder({ data, success, fail }) {
    api.orderPayConfirm(data, (res) => {
      success && success.call(this, res);
    }, (err) => {
      fail && fail.call(this, err);
      return true;
    });
  },
};
