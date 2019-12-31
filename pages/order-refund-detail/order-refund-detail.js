import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
} from '/utils';

// const app = getApp();

xPage({
  ...mixins,

  data: {
    isLoading: true,
    showBigPic: false,
    imgUrl: '',
    userAvatar: 'https://img1.haoshiqi.net/miniapp/mine_a10ca780ae.png',
    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    })
  },
  onLoad(query) {
    this.onPageInit(query);
    this.refresh();
  },

  onShow() {
    console.warn('order-refund-detail.js')
    const { userInfo } = this.data;
    if (userInfo && userInfo.avatar) {
      this.setData({
        userAvatar: userInfo.avatar
      })
    }
  },

  refresh() {
    const { pageQuery = {} } = this;
    const refundOrderId = pageQuery.refundId;
    // const refundOrderId = "11049";
    this.getRefundDetail(refundOrderId);
  },

  getImageCount() {
    const count = this.data.imageMax - this.data.imageList.length;
    return count > 0 ? count : 0;
  },

  getRefundDetail(id) {
    const refundOrderId = id;
    this.setData({
      isLoading: true,
    })
    api.refundDetail({
      scope: this,
      weights: 1,

      refundOrderId,
    }, (res) => {
      this.setPageData(res);
      // const data = res.data;
      // const applyTime = this.formatDate(data.refundInfo.applyTime);
      // // const imgList = JSON.parse(data.refundInfo.pics);
      // if (data.auditList.length > 0) {
      //   const auditTime = this.formatDate(data.auditList[0].time);
      //   this.setData({
      //   auditList: data.auditList,
      //   auditTime: auditTime,
      // })
      // }
      // this.setData({
      //   title: data.title,
      //   content: data.content,
      //   applyTime: applyTime,
      //   reason: data.refundInfo.reason,
      //   method: data.refundInfo.method,
      //   refundImg: data.refundInfo.pics,
      //   note: data.refundInfo.note,
      //   refundOrderId: refundOrderId,
      //   canComplaint: data.refundInfo.canComplaint,
      // })
    }, (err) => {
      // console.log(err);
    });
  },

  formatDate(date) {
    const timesTamp = date * 1000;
    const nDate = new Date(timesTamp);
    const y = nDate.getFullYear();
    const m = nDate.getMonth() + 1;
    const d = nDate.getDate();
    const h = nDate.getHours();
    const mu = nDate.getMinutes();
    const s = nDate.getSeconds();

    return y + '-' + this.formatNum(m) + '-' + this.formatNum(d) + ' ' + this.formatNum(h) + ':' + this.formatNum(mu) + ':' + this.formatNum(s);
  },

  formatNum(num) {
    const number = num;
    if (number < 10) {
      return '0' + number;
    } else {
      return number;
    }
  },

  setPageData(res) {
    const that = this;
    const { title, content, refundInfo = {}, auditList = []  } = res.data;
    const applyTime = this.formatDate(refundInfo.applyTime);
    // const imgList = JSON.parse(refundInfo.pics);
    if (auditList.length > 0) {
      for (let index = 0; index < auditList.length; index++) {
        const auditTime = this.formatDate(auditList[index].time);
        auditList[index] = Object.assign({ ...auditList[index] }, { auditTime });
      }
    }
    that.setData({
      isLoading: false,

      title: title,
      content: content,
      applyTime,
      reason: refundInfo.reason,
      method: refundInfo.method,
      amountDesc: refundInfo.amountDesc,
      refundImg: refundInfo.pics,
      note: refundInfo.note,
      refundOrderId: refundInfo.id,
      canComplaint: refundInfo.canComplaint,
      auditList: auditList || [],
    });
  },
  // //预览图片
  previewImage(e) {
    const that = this;
    const { index } = e.target.dataset;
    my.previewImage({
      current: index,
      urls: that.data.refundImg, // 要预览的图片链接列表\
    });
  },

  // //申诉
  getCanComplaint(e) {
    const refundId = e.target.dataset.refundid;
    my.confirm({
      title: '提示', // confirm 框的标题
      content: '确认申诉?',
      success: (res) => {
        if (res.confirm) {
          api.orderComplaint({
            refundOrderId: refundId,
          }, (res) => {
            this.setPageData(res);
          }, (err) => {
            // console.log(err);
          });
        }
      },
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
