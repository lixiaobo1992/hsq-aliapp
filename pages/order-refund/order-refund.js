import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
// import { promisify } from '/utils'
import {
  map,
  mixins,
} from '/utils';

const qnInfo = {
  domain: 'https://img2.haoshiqi.net/',
};
// const app = getApp();
// //退款原因
// let refundReason;
// // const imageMax = 3;//图片数量
// let imageList;
// let showBigPic;


xPage({
  ...mixins,
  // ...lifecycle,

  data: {
    isLoading: true,

    imageList: [],
    imageMax: 3,
    showBigPic: false,
    imgUrl: '',
    product: {
      pay_price: 0,
    },
  },

  onLoad(query) {
    this.onPageInit(query);
    if (query.refundPrice) { // 订单列表主订单退款金额
      this.setData({
        'product.pay_price': query.refundPrice,
      });
    }
    this.refresh();
  },

  onShow() {

  },

  refresh() {
    this.getRefundInit();
  },

  // onShow() {
  //   // this.postMessage('order-list', {
  //   //   needRefresh: true,
  //   // })
  // },

  getImageCount() {
    const count = this.data.imageMax - this.data.imageList.length;
    return count > 0 ? count : 0;
  },

  getSubOrderInfo() { // 获取子订单详情
    const subOrderId = this.pageQuery.subOrderId || '';
    if (!subOrderId) {
      return;
    }
    api.subOrderInfo({
      subOrderId
    }, (res) => {
      this.setData({
        product: {
          imgUrl: res.data.sku_thumbnail || res.data.skuThumbnail,
          skuName: res.data.sku_name,
          attrs: res.data.attrs_desc,
          pay_price: (res.data.pay_price / 100).toFixed(2),
        }
      });
    }, (err) => {
      // console.log(err);
    });
  },

  getRefundInit() {
    // const opt = {
    //     needRefresh: true,
    //   };
    // this.postMessage('order-list',opt);
    const orderId = this.pageQuery.orderId || '';
    const subOrderId = this.pageQuery.subOrderId || '';
    if (!orderId) {
      my.showToast('参数order_id错误');
      return;
    }
    this.setData({
      isLoading: true,
    })
    api.refundInit({
      scope: this,
      weights: 1,

      orderId,
      subOrderId,
    }, (res) => {
      const { data } = res;
      // const data = { ...data2 };
      this.setData({
        isLoading: false,
        orderId,
        subOrderId,
        refundMethodName: data.refundMethodList[0].name || '',
        refundMethod: data.refundMethodList[0].id || '',
        refundReason: data.reasonList || [],
        salesRefundType: data.salesRefundType,
      });

      this.getSubOrderInfo();
    }, (err) => {
      // console.log(err);
    });
  },

  // //选择退款原因
  chooseReason() {
    const that = this;
    my.showActionSheet({
      title: '申请退款的原因',
      items: map(that.data.refundReason, 'name'), // 菜单按钮的文字数组
      success: (res) => {
        const { index } = res;
        if (index !== -1) {
          that.setData({
            reason: that.data.refundReason[index].name,
            reasonId: that.data.refundReason[index].id,
          });
        }
      },
    });
  },


  // //上传图片
  uploadImage() {
    const that = this;
    my.chooseImage({
      count: this.getImageCount(),
      success: (res) => {
        that.setData({
          imageList: [
            ...that.data.imageList,
            ...res.apFilePaths,
          ],
        });
      },
    });
  },

  // //预览图片
  previewImage(e) {
    const that = this;
    const { index } = e.target.dataset;
    my.previewImage({
      current: index,
      urls: that.data.imageList, // 要预览的图片链接列表\
    });
  },

  // //删除图片
  clearImage(e) {
    const that = this;
    const { index } = e.target.dataset;
    const newImgList = [...that.data.imageList];
    newImgList.splice(index, 1);
    that.setData({
      imageList: newImgList,
    });
  },

  // //点击提交
  formSubmit(e) {
    const that = this;
    this.checkSubmitData();
    that.data.comment = e.detail.value.comment;
    xmini.piwikEvent('c_submrefcomf', {
      orderid: this.pageQuery.orderId,
      suborderid: this.pageQuery.subOrderId,
    });
  },

  checkSubmitData() {
    const that = this;
    if (!that.data.reason) {
      my.showToast('请选择退款原因！');
      return;
    }
    if (that.data.salesRefundType === 'AFTER_SALES' && that.data.imageList.length <= 0) {
      my.showToast('请上传图片！');
      return;
    }
    my.confirm({
      title: '提示', // confirm 框的标题
      content: '确认提交？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.upload();
        }
      },
    });
  },

  upload() {
    const that = this;
    if (qnInfo.token) {
      this.uploadQiniu();
    } else {
      api.getQiniuToken({}, (res) => {
        qnInfo.token = res.data.token;
        that.uploadQiniu();
      }, (err) => {
        my.showToast('获取图片上传权限失败，请重新操作');
        // console.log(err);
      });
    }
  },


  uploadFile(file) {
    return new Promise((resolve, reject) => {
      my.uploadFile({
        // 上传七牛使用 https://up.qbox.me
        url: `https://up.qbox.me?token=${qnInfo.token}`,
        fileType: 'image',
        fileName: 'file',
        filePath: file,
        success: (res) => {
          const data = JSON.parse(res.data);
          const url = qnInfo.domain + data.hash + '?imageView2/0/q/70';
          // self.setData({
          //   qnImgList: [
          //     ...self.data.qnImgList,
          //     url,
          //   ],
          // });
          console.log(url);
          resolve(url);
        },
        fail(res) {
          console.log(res);
          // reject({
          //   title: '上传失败',
          // });
          reject(new Error('上传失败'));
          my.alert({ title: '上传失败' });
        },
      });
    });
  },


  uploadQiniu() {
    const imgs = this.data.imageList;
    const uploadTasks = [];
    for (let i = 0; i < imgs.length; i++) {
      uploadTasks.push(this.uploadFile(imgs[i]));
    }

    // 这里有个问题，上传是异步操作，要全部执行完，再继续执行，需要封装下，等待执行完
    // 这里封装为 Promise，使用 Promise.all 执行

    Promise.all(uploadTasks).then((res) => {
      // 全部上传完成后，继续提交动作
      this.afterUploadedImg(res);
    }, (err) => {
      // console.log(err);
    });
  },
  afterUploadedImg(data) {
    const that = this;
    const imgs = data.length > 0 ? JSON.stringify(data) : '';
    const orderId = this.pageQuery.orderId || '';
    const subOrderId = this.pageQuery.subOrderId || '';
    console.log(data);
    console.log(that.data);
    api.refundApply({
      orderId,
      subOrderId,
      refundMethod: that.data.refundMethod,
      reasonId: that.data.reasonId,
      comment: that.data.comment,
      pics: imgs,
    }, (res) => {
      const { id } = res.data.refundInfo;
      const opt = {
        needRefresh: true,
      };
      this.postMessage('order-list', opt);
      this.postMessage('order-detail', opt);
      this.goRefundDetail(id);
    }, (err) => {
      // console.log(err);
    });
  },

  goRefundDetail(id) {
    // 需要跳转的应用内非 tabBar 的页面的路径，路径后可以带参数。参数与路径之间使用
    this.forward('order-refund-detail', {
      refundId: id,
      replace: true,
    });
  },

  // onShow() {
  //   this.setData({ todos: app.todos });
  // },
  // onTodoChanged(e) {
  //   const checkedTodos = e.detail.value;
  //   app.todos = app.todos.map(todo => ({
  //     ...todo,
  //     completed: checkedTodos.indexOf(todo.text) > -1,
  //   });
  //   this.setData({ todos: app.todos });
  // },
  // addTodo() {
  //   // my.navigateTo({ url: '../add-todo/add-todo' });
  // },
});
