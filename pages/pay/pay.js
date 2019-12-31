import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
import { urlfix } from '../../utils/stringUtil';
import {
  mixins,
  orderPay,
} from '../../utils/index';

xPage({
  ...mixins,
  ...orderPay,
  data: {},
  onLoad(query) {
    this.onPageInit(query);
    this.goPay();
  },
  onShow() {

  },
  goPay() {
    const { orderIds = [] } = this.pageQuery;
    // 根据订单id 获取支付信息
    this.getOrderPayInfo({
      data: {
        type: 3, // 1.微信支付 2.百川支付 3.支付宝支付, 4.支付宝网页支付, 5.公众号支付, 7.微信扫码支付
        orderIds: orderIds,
      },
      success: (res) => {
        // 调起支付
        this.requestPayment({
          data: {
            // orderIds: orderIds,
            tradeNO: res.data.trade_no,
          },
          success: (res1) => { // res1 支付宝返回的信息
            // 确认支付
            this.confirmOrder({
              data: {
                paymentId: res.data.paymentId,
                mergeType: res.data.mergeType,  // 1普通订单,2单独购,4拼团订单,8抽奖团
              },
              success: (res2) => {
                if (res2.data.url) {
                  let urlData = {
                    currentTarget: {
                      dataset: {
                        url: urlfix(res2.data.url, 'replace=true')
                      }
                    }
                  }
                  this.onUrlPage(urlData);
                  return;
                }
                this.forward('order-list', {
                  type: 0,
                  replace: true,
                });
              },
              fail: err2 =>{
                // 去 全部订单列表
                this.forward('order-list', { type: 0, replace: true });
              }
            });
          },
          fail: err1 => {
            // 订单失败默认条订单列表
            // 去待付款列表
            this.forward('order-list', { type: 1, replace: true });
          },
        });
      },
      fail: err => {
        this.forward('order-list', {
          type: 1,
          replace: true,
        });
      },
    });
  },
});
