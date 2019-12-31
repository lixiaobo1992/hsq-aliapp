import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  orderPay,
} from '/utils';
import { formatDate } from '/utils/dateUtil';
import CountManger from '/utils/CountManger';
import formatNum from '/utils/formatNum';
import { isEmptyObject } from '/utils/is'

let timeStamp;
let endTime;

// const app = getApp();

xPage({
  ...mixins,
  ...orderPay,
  data: {
    isLoading: true,

    shareInfo: false,
    service_img: 'https://img1.haoshiqi.net/miniapp/service/service_43dee1915e.png',
    msgStatus: false,
    isMergePay:false,
    // mergeInfo,
    mergeInfo:{},
    isMemberModal:false,
    errMsg: '',
  },
  onLoad(query) {
    this.onPageInit(query);
    this.refresh();
  },

  onShow() {
    this.onMessage();
  },

  refresh() {
    const params = {
      orderId: this.pageQuery.id,
    };
    this.setData({
      isLoading: true,
      options: params,
    });
    this.getData(params);
  },

  getData(params) {
    const tempParams = Object.assign({}, params, {scope: this, weights: 1})
    api.orderDetail(tempParams, (res) => {
      const { data } = res;

      timeStamp = res.timestamp;
      endTime = data.created_at + 3600;
      let msgEndTime = data.message && data.message.end_time || 0;
      if (endTime * 1000 > timeStamp && data.canPay) {
        this.countDown();
      }
      // 公告展示判断
      if(timeStamp < msgEndTime ){
        this.setData({
          msgStatus: true,
          msgContent: data.message || {}
        })
      }

      let orderStatus = {};
      orderStatus = {
        canPay: data.canPay || false,
        canCancel: data.canCancel || false,
        canRefund: data.canRefund && data.delivery_status === 1,
        canViewDelivery: data.canViewDelivery || false,
        canConfirm: data.canConfirm || false,
        refundId: data.refundId || 0,
      };
      orderStatus.hasBottom = orderStatus.canPay || orderStatus.canCancel || orderStatus.canRefund || (orderStatus.refundId > 0) || orderStatus.canViewDelivery || orderStatus.canConfirm;
      console.log(orderStatus);

      const statusCode = data.statusCode

      let statusDesc = {};
      statusDesc = {
        statusText: data.status || data.statusDesc,
        statusLogo: data.statusLogo,
      };
      let orderDesc = {};
      orderDesc = {
        id: data.id,
        createdAt: formatDate(data.created_at, 'Y-M-D H:F:S'),
      };
      let userDesc = {};
      const city = data.deliveryCity || data.delivery_city;
      let address = data.delivery_province;
      address += city + data.delivery_district;
      address += data.delivery_detail_address;
      userDesc = {
        name: data.order_type === 16 ? '充值手机号' : data.consignee,
        phone: data.consigneePhone || data.consignee_phone,
        address,
      };
      const productDesc = [];
      if (data.skuList) {
        data.skuList.forEach((item) => {
          const price = (item.unit_price / 100).toFixed(2);
          productDesc.push({
            subOrderId: item.id,
            pinId: item.pin_activities_id || data.pin_activities_id,
            skuId: item.sku_id, // 普通商品
            skuName: item.sku_name,
            imgUrl: item.skuThumbnail,
            price,
            amount: item.amount,
            attrs: item.attrs_desc,
            schema: item.schema,
            orderId: item.order_id,
            status: item.status,
            refundId: item.refundId,
            canRefund: item.subCanRefund,
            refundStatus: item.refundStatusDesc || '退款详情',
          });
        });
      }
      const priceDesc = [];
      priceDesc.push({
        name: '商品总额',
        value: ((data.productsPrice) / 100).toFixed(2),
        icon: '￥',
      });
      // data.delivery_price = data.isFreeDelivery ? 0 : data.delivery_price;
      priceDesc.push({
        name: '运费',
        value: (data.delivery_price / 100).toFixed(2),
        icon: '+￥',
      });
      data.merchant_discount = data.merchant_discount || 0;
      priceDesc.push({
        name: '店铺活动',
        value: (data.merchant_discount / 100).toFixed(2),
        icon: '-￥',
      });
      data.platform_discount = data.platform_discount || 0;
      priceDesc.push({
        name: '平台券',
        value: (data.platform_discount / 100).toFixed(2),
        icon: '-￥',
      });
      let invoiceDesc = {};
      let invoiceText;
      if (data.invoice_type === 2) {
        invoiceText = '个人';
      } else if (data.invoice_type === 3) {
        invoiceText = '公司';
      } else {
        invoiceText = '不需要发票';
      }
      invoiceDesc = {
        title: invoiceText,
        type:data.invoice_type,
        desc: data.invoiceTitle || data.invoice_title,
      };

      const savePrice = (data.saved_money / 100).toFixed(2)
      const stepList = data.stepList

      this.setData({
        isLoading: false,
        statusCode,
        savePrice,
        statusDesc,
        orderDesc,
        userDesc,
        merchantName: data.merchantName,
        merchantSchema: data.schema,
        productDesc: productDesc || [],
        userMsg: (data.note) ? data.note : '无留言',
        priceDesc,
        needPayPrice: (data.need_pay_price / 100).toFixed(2),
        orderStatus,
        invoiceDesc,
        stepList,
        orderType: data.orderType,
        pinEventId: data.pin_event_id,
      });
    }, (err) => {
      my.hideLoading();
      console.log(err);
    });
  },
  goCoupleDetail(e) {
    this.forward('detail', {
      id: e.currentTarget.dataset.id,
    });
  },
  // 申请退款
  goRefund(e) {
    const { orderid, suborderid, refundprice } = e.currentTarget.dataset;
    this.forward('order-refund', {
      orderId: orderid,
      subOrderId: suborderid,
      refundPrice: refundprice,
    });
    xmini.piwikEvent('c_refsubm', {
      suborderid: suborderid
    });
  },

  // 查看退款详情
  goRefundDetail(e) {
    const { suborderid, orderstatus, refundid } = e.currentTarget.dataset;
    this.forward('order-refund-detail', {
      refundId: refundid,
    });
    xmini.piwikEvent('c_refview', {
      suborderid: suborderid,
      status: orderstatus,
      refundid: refundid,
    });
  },
  countDown() {
    const that = this;
    const diffTime = (timeStamp * 1000) - (+new Date());
    const localEndTime = (endTime * 1000) + diffTime;

    this.countDownManger = new CountManger({
      times: 1000,
      dataList: [{}], // this.data.leftTime,
      set() {
        if (localEndTime - new Date() > 0) {
          this.start();
        } else {
          that.setData({
            leftTime: 0,
          });
        }
      },
      callback() {
        const leftTime = localEndTime - new Date();
        if (leftTime > 0) {
          const countDown = formatNum(leftTime, true);
          that.setData({
            countDownInfo: `剩余${countDown.minute}分${countDown.second}秒自动关闭`,
          });
        } else {
          const countDown = formatNum(0, true);
          that.setData({
            countDownInfo: `剩余${countDown.minute}分${countDown.second}秒自动关闭`,
          });
          this.clear();
        }
        console.log();
      },
    });
  },
  goDetail(e) {
    const { id } = e.currentTarget.dataset;
    xmini.piwikEvent('c_pddetail',{
      orderid:id
    });
    console.log('去id为：' + id + '的普通商品详情页');
    // my.navigateTo({
    //   url: '../../pages/detail/detail?id='+id,
    // });
  },
  handleCopy() {
    my.setClipboard({
      text: this.data.orderDesc.id + '',
      success: (res) => {
        my.showToast('复制成功');
      }
    });
  },
  goService() {
    xmini.piwikEvent('c_alisv');
    this.forward('service');
  },
  cancelOrder(e) {
    console.log('取消订单号为' + this.data.orderDesc.id + '的订单');
    const{ index,orderid } = e.currentTarget.dataset;
    const me = this;
    xmini.piwikEvent('c_cancelorder',{
      orderid:this.data.orderDesc.id,
      index,
    });
    my.showActionSheet({
      title: '取消订单的理由',
      items: ['我不想买了', '信息填写错误', '商品停售或缺货', '其他原因'], // 菜单按钮的文字数组
      success: (res) => {
        const index = res.index + 1;
        if (index > 0) {
          let params = {};
          params = {
            orderId: me.data.orderDesc.id,
            reason: index,
          };
          api.orderCancel(params, (res) => {
            console.log(res);
            my.showToast({
              content: '订单取消成功',
              duration: 1000,
            });
            me.postMessage('order-list', {
              needRefresh: true,
            });
            setTimeout(() => {
              if (me.countDownManger) {
                me.countDownManger.clear();
              }
              const opt1 = {};
              opt1.orderId = params.orderId;
              me.getData(opt1);
            }, 1000);
          }, (err) => {
            console.log(err);
            my.showToast('订单取消失败');
          });
        }
      },
    });
  },
  //检测订单
  checkOrder(e){
    const { type } = e;
    let id = 0;
    if(type === 'merge'){
      id = e.id;
      this.payOrder(id);
      return;
    } else {
      id = e.currentTarget.dataset.orderid;
    }
    api.orderCheck({
      orderIds: [id],
    }, (res) => {
        console.log(res.data, 'data');
        let data = res.data;
        if(isEmptyObject(data)){
          //当这里有值时，处理合并支付
          this.setData({
            isMergePay: true,
            mergeInfo:data,
          });
        } else {
          this.payOrder(id);  //去支付流程
        }
    }, (err) => {
        if(err.errno === 230004 && err.errmsg){
          this.setData({
            isMemberModal: true,
            isMergePay: false,
            errMsg: err.errmsg,
          });
          return true;
        } else {
            my.showToast({
              duration:3000,
              content: err.errmsg
            });
          return true;
        }
    });
  },
  payOrder(id) {
    const me = this;
    let orderIds = [id];
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
          success: (res1) => { // res1 微信返回的信息
            // 确认支付
            this.confirmOrder({
              data: {
                paymentId: res.data.paymentId,
                mergeType: res.data.mergeType,  // 1普通订单,2单独购,4拼团订单,8抽奖团
              },
              success: (res2) => {
                this.refresh();
                if (res2.data.url) {
                  let urlData = {
                    currentTarget: {
                      dataset: {
                        url: res2.data.url
                      }
                    }
                  }
                  this.onUrlPage(urlData);
                  return;
                }
              },
              fail: err2 =>{
                this.refresh()
              }
            });
          },
          fail: err1 => {
            this.refresh()
          }
        });
      }
    });
    xmini.piwikEvent('c_pay', {
      orderid: id
    });
  },
  //查看物流
  goDelivery() {
    console.log('查看订单号为' + this.data.orderDesc.id + '的物流');
    this.forward('delivery', {
      orderId: this.data.orderDesc.id,
    });
  },
  // 确认收货
  confirmReceipt() {
    console.log('确认收货订单号为' + this.data.orderDesc.id + '的订单');
    const that = this;
    const { id } = this.data.orderDesc;
    my.confirm({
      title: '',
      content: '是否确认收货',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (res) => {
        if (res.confirm) {
          api.confirmReceived({
            orderId: id,
          }, (res) => {
            const opt = {
              needRefresh: true,
            };
            that.postMessage('order-list', opt);
            my.showToast({
              content: '收货成功',
              duration: 1000,
            });
            setTimeout(() => {
              const opt4 = {};
              opt4.orderId = id;
              that.getData(opt4);
            }, 1000);
          }, (err) => {
            my.showToast('确认收货失败');
            console.log(err);
          });
        }
      },
    });
    xmini.piwikEvent('c_pdagree', {
      orderid: that.data.orderDesc.id
    });
  },
  onHide() {
    this.clearPageData();
  },
  onUnload() {
    this.clearPageData();
  },
  clearPageData() {
    console.log('clear');
    if (this.countDownManger) {
      this.countDownManger.clear();
    }
  },
  // 显示/关闭券弹窗
  handlePayModal() {
    const MergePayStatus = !this.data.isMergePay;
    this.setData({
      isMergePay: MergePayStatus,
    })
  },
});
