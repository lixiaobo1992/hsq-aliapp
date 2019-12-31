import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  pullList,
  orderPay,
  mapTo,
} from '/utils';
import { isEmptyObject } from '/utils/is'

const app = getApp();

xPage({
  ...mixins,
  // ...backHome,
  ...orderPay,
  ...pullList,
  // ...lifecycle,

  data: {
    isLoading: true,
    // isShowGoHome: false,
    showFooter: false,
    hideHeader: true,
    list: [],
    pageType: '0',
    isMergePay:false,
    // mergeInfo,
    mergeInfo: {},
    isMemberModal:false,
    errMsg: '',
  },

  onLoad(query = {}) {
    this.onPageInit(query);
    const { systemInfo = {} } = app.getData();
    this.setData({
      height: systemInfo.windowHeight,
      pageType: query.type || '0'
    }, () =>{
      this.getOrderList();
    })


    app.onSubscribeEvent('orderList', () => {
      this.refresh();
    })
  },

  onShow() {
    this.getHeaderData();
    this.onMessage();
  },
  refresh() {
    this.getHeaderData();
    // this.initPullList();
    this.getOrderList();
  },
  getHeaderData() {
    api.getProfile({
      isLoading: false
    }, (res) => {
      const { data } = res;
      const toPayNum = data.toPayNum
      const toReceiptNum = data.toReceiptNum
      const toRefundNum = data.toRefundNum
      const pinOrderNum = data.pinOrderCnt
      this.setData({
        pinOrderNum,
        toPayNum,
        toReceiptNum,
        toRefundNum,
        hideHeader: false,
      })
    }, (err) => {
      return true;
    })
  },

  getOrderList() {
    this.initPullList();
    const listType = this.data.pageType
    this.pullParams = Object.assign({
      scope: this,
      weights: 1,

      type: listType,
      needPagination: 1,
      pageLimit: 10,
      pageNum: 1,
    });

    switch (listType) {
      case '0': // 全部订单
      case '1': // 待付款
      case '2': // 待收货
        this.pullModel = api.getUserOrders;
        break;
      case '3': // 待评论
        // this.pullModel = api.getNeedCommentOrders;
        break;
      case '4': // 售后
        this.pullModel = api.getUserServiceOrders;
        break;

      default:
        this.pullModel = api.getUserOrders;
        break;
    }
    this.setData({
      isLoading: true,
    })
    this.changePageTitle();
    this.onScrollToLower();

  },

  refreshList(index){
    this.setData({
      pageType: index,
    }, ()=>{
      this.refresh();
    })

  },
  switchHeader(e) {
    const index = e.currentTarget.dataset.index;
    if (this.data.pageType == index) {
      return;
    }
    switch (index) {
      case '0'://全部
      case '1'://待付款
      case '2'://待收货
      // case '3'://待评价
      case '4':// 售后
        this.refreshList(index);
        break;
      case '5':
        this.forward('couple-order-list', {
          type: 1,
          listType: 1,  // 拼团
          hideTabs: true,
        });
        break;
    }
  },
  initPullList() {
    this.pullParams.pageNum = 1;
    this.hasMore = true;
    this.setData({
      list: [],
    });
  },
  afterPull() {
    if (this.pullParams.pageNum == 1) {
      delete this.pullParams.scope;
      delete this.pullParams.weights;
    }
  },
  afterPullData() {
    this.setData({
      isLoading: false,
    })
  },
  dealList(list) {
    return mapTo(list, item => {
      const products = mapTo(item.skuList, it => {
        return {
          name: it.name,
          thumbnail: it.sku_thumbnail,
          price: (it.unit_price*0.01).toFixed(2),
          amount: it.amount,
          refundId: it.refundId,
          refundStatusDesc: it.refundStatusDesc,
          id: it.subOrderId,
          skus: it.attrs_desc,
        };
      });
      return {
        id: item.orderId,
        merchantId: item.merchantId,
        merchantName: item.merchantName,
        total_amount: item.total_amount,
        statusDesc: item.status,
        list: products,
        payPrice: (item.need_pay_price*0.01).toFixed(2),
        status: item.order_status || item.statusCode,
        canCancel: item.canCancel,
        canPay: item.canPay,
        canRefund: item.canRefund,
        canViewDelivery: item.canViewDelivery,
        canConfirm: item.canConfirm,
        canComment: item.canComment,
        canApplyRefund: item.canApplyRefund,
        refundId: item.refundId || 0,
        refundStatusDesc: item.refundStatusDesc
      };
    });
  },
  goMerchant(e) {
    this.forward('merchant', {
      id: e.currentTarget.dataset.id,
    });
  },
  // 订单详情
  goOrderDetail(e) {
    const { index, orderid } = e.currentTarget.dataset;
    xmini.piwikEvent('c_pddetail', {
      index,
    });
    this.forward('order-detail', {
      refresh: true,
      id: orderid,
    });
  },
  //检测订单
  checkOrder(e){
    const { type } = e;
    let id = 0;
    if(type === 'merge'){
      id = e.id;
      this.goPay(id);
      return;
    } else {
      id = e.currentTarget.dataset.orderid;
    }
    //2190227885 2190227936 2190227890 2190227962
    api.orderCheck({
      orderIds: [id],
    }, (res) => {
        console.log(res.data, 'data');
        let data = res.data;
        if(isEmptyObject(data)){
          //当这里有值时，处理合并支付
          this.setData({
            isMergePay: true,
            // mergeInfo:this.dealPay(data),
            mergeInfo:data,
          });
        } else {
          this.goPay(id);  //去支付流程
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
  // 付款
  goPay(id) {
    const that = this;
    my.showLoading();
    let orderIds = [id];
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
                // 去 全部订单列表
                this.refresh();
              }
            });
          },
          fail: err1 => {
            // 订单失败默认条订单列表
            // 去待付款列表
            this.refresh();
          }
        });
      },
      fail: err => {
        //
        this.forward('order-list', {
          type: 1,
          replace: true,
        });
      }
    });
  },
  // 确认收货
  goConfirm(e) {
    const that = this;
    let listType = this.data.pageType
    const { orderid: id, index: clickIndex } = e.currentTarget.dataset;
    const newDataList = [...this.data.list];
    my.confirm({
      title: '确认已经收到货了吗？', // confirm 框的标题
      content: '请务必在已收货的情况下进行确认！',
      confirmButtonText: '确认收货',
      cancelButtonText: '取消',
      success: (res) => {
        if (res.confirm) {
          xmini.piwikEvent('c_pdagreecomf',{
            orderid: id,
            index: clickIndex,
          });
          api.confirmReceived({
            orderId: id,
          }, (res) => {
            my.showToast({
              content: '确认收货成功！', // 文字内容
            });
            if (listType === '2') {
              this.refresh();
            } else {
              const data = mapTo([res.data], (item) => {
                return {
                  id: item.id,
                  statusDesc: item.status,
                  status: item.statusCode,
                  canCancel: item.canCancel,
                  canPay: item.canPay,
                  canRefund: item.canRefund,
                  refundId: item.refundId,
                  canViewDelivery: item.canViewDelivery,
                  canConfirm: item.canConfirm,
                  canComment: item.canComment,
                  refundStatusDesc: item.refundStatusDesc,
                };
              })[0];
              const newData = Object.assign({}, newDataList[clickIndex], data);
              that.setData({
                [`list[${clickIndex}]`]: newData,
              });
            }
          }, (err) => {
            my.showToast({
              type: 'success',
              content: '确认收货失败',
            });
          });
        }
      },
    });
  },

  // 查看物流
  goDelivery(e) {
    const { orderid, index, status } = e.currentTarget.dataset
    xmini.piwikEvent('c_logview',{
      index,
      status: status,
      orderid: orderid,
    });
    this.forward('delivery', {
      orderId: orderid,
    });
  },

  // 取消订单
  goCancelOrder(e) {
    const that = this;
    let listType = this.data.pageType
    const clickIndex = e.currentTarget.dataset.index;
    const newDataList = [...this.data.list];
    const id = e.currentTarget.dataset.orderid;
    const reasons = ['我不想买了', '信息填写错误', '商品停售或缺货','其他原因'];
    my.showActionSheet({
      title: '取消订单的理由',
      items: reasons,
      cancelButtonText: '取消',
      success: (res) => {
        const index = res.index + 1;
        if (!(index === 0)) {
          my.showLoading({
            content: '订单正在取消...',
            delay: '0',
          });
          xmini.piwikEvent('c_cancelorderres',{
            orderid:id,
            index:clickIndex,
            reasons:reasons[index],
          });
          api.orderCancel({
            orderId: id,
            reason: index,
          }, (res) => {
            my.hideLoading();
            my.showToast('订单取消成功');
            if (listType === '1') {
              this.refresh();
            } else {
              const data = mapTo([res.data], (item) => {
                return {
                  statusDesc: item.status,
                  status: item.statusCode,
                  canCancel: item.canCancel,
                  canPay: item.canPay,
                  canRefund: item.canRefund,
                  refundId: item.refundId,
                  refundId: item.refundId,
                  canViewDelivery: item.canViewDelivery,
                  canConfirm: item.canConfirm,
                  canComment: item.canComment,
                  refundStatusDesc: item.refundStatusDesc,
                };
              })[0];
              const newData = Object.assign({}, newDataList[clickIndex], data);
              that.setData({
                [`list[${clickIndex}]`]: newData,
              });
            }
          }, (err) => {
            // console.log(err);
            my.showToast('订单取消失败');
          });
        }
      },
    });
  },

  // 申请退款
  goRefund(e) {
    const {
      orderid: orderId,
      orderstatus: orderStatus,
      refundprice: refundPrice,
      suborderid,
      index,
    } = e.currentTarget.dataset;
    const subOrderId = (orderStatus == 3) ? suborderid : '';

    xmini.piwikEvent('c_refsubm', {
      orderid: orderId,
      status: orderStatus,
      index,
    });

    this.forward('order-refund', {
      orderId,
      subOrderId,
      refundPrice,
    });
  },

  // 查看退款详情
  goRefundDetail(e) {
    const { refundid: refundId, index } =  e.currentTarget.dataset;
    if (!refundId) {
      my.showToast(`参数错误 refundId: ${refundId}`);
      return;
    }
    xmini.piwikEvent('c_refview',{
      refundid: refundId,
      index,
    });
    this.forward('order-refund-detail', {
      refundId,
    });
  },

  // 修改页面title
  changePageTitle() {
    let title;
    let listType = this.data.pageType;
    switch (listType) {
      case '1':
        title = '待付款';
        break;
      case '2':
        title = '待收货';
        break;
      case '3':
        title = '待评价';
        break;
      case '4':
        title = '售后';
        break;
      case '0':
      default:
        title = '全部订单';
        break;
    }
    my.setNavigationBar({
      title,
    });
  },
  // 显示/关闭券弹窗
  handlePayModal() {
    const MergePayStatus = !this.data.isMergePay;
    this.setData({
      isMergePay: MergePayStatus,
    })
  },


});
