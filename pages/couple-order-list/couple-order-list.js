import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  pullList,
} from '/utils';
import preData from '/utils/preData';
import CountManger from '/utils/CountManger';
import { formatCountDown } from '../../utils/dateUtil';

const app = getApp();

xPage({
  ...mixins,
  ...pullList,
  data: {
    isLoading: true,
    tabs: [
      '拼团中',
      '拼团成功',
      '拼团失败',
    ],
    clickIndex: 0,
    showFooter: false,
    hideTabs: false,
  },
  onLoad(query) {
    this.onPageInit(query);
    // 1, 2 ,3 分别表示拼团中，拼团成功，拼团失败，默认是1拼团中
    let coupleListType = query.type || 1;
    const { systemInfo = {} } = app.getData();
     if(query.hideTabs) {
      my.setNavigationBar({
        title: '待分享成团',
      });
    }else {
      my.setNavigationBar({
        title: '我的拼团',
      });
    }
    this.setData({
      hideTabs: query.hideTabs || false,
      height: systemInfo.windowHeight,
      type: coupleListType,
      clickIndex: coupleListType - 1
    }, () =>{
      this.refresh()
    });

  },
  onShow() {

  },
  onUnload() {
    this.clearCountDown();

  },
  onHide() {
    this.clearCountDown();
  },

  refresh(){
    this.getCoupleOrderList();
  },

  switchTab(e) {
    const that = this;
    const { index } = e.currentTarget.dataset;
    const switchType = index + 1;
    if (that.data.clickIndex === index) {
      return;
    }
    this.clearCountDown();
    that.setData({
      type: switchType,
      clickIndex: index,
    }, () =>{
      this.refresh();
    });

  },
  getCoupleOrderList() {
    const selectType = this.data.type;
    this.setData({
      isLoading: true,
    });
    this.initPullList();

    this.pullParams.scope = this;
    this.pullParams.weights = 1;

    this.pullParams.pageLimit = 10;
    this.pullParams.type = selectType;
    this.pullParams.listType = 1;
    this.pullModel = api.coupleOrderList;
    this.onScrollToLower();
  },
  afterPull() {
    if (this.pullParams.pageNum == 1) {
      delete this.pullParams.scope;
      delete this.pullParams.weights;
    }
  },
  afterPullData() {
    this.startCountDown();
    this.setData({
      isLoading: false
    })
    switch (this.data.type) {
      case 1:
        this.setData({
          tags: '',
        });
        break;

      case 2:
        this.setData({
          tags: 'https://img1.haoshiqi.net/miniapp/couple-order/pin_success_c91688c05b.png',
        });
        break;

      case 3:
        this.setData({
          tags: 'https://img1.haoshiqi.net/miniapp/couple-order/pin_fail_c5b9682b77.png',
        });
        break;

      default:
        break;
    }
  },

  // onReady(){

  // },

  startCountDown() {
    const that = this;
    if (that.data.type != 1) {
      return;
    }
    const { list = [], diffTime } = this.data;
    // var localEndTime = item.endTime*1000 + diffTime;
    // var localLeftTime = localEndTime - Date.now();
    const countDownOptions = {
      times: 60000,
      dataList: list,
      set() {
        this.localEndTime = this.data.endTime * 1000 + diffTime;
        if (this.localEndTime - Date.now() > 0 && !this.data.isSetCountDown) {
          this.start();
          // this.data.isSetCountDown = true;
        }
        that.setData({
          [`list[${this.index}].isSetCountDown`]: true,
          // [`list[${this.index}].localEndTime`]: this.localEndTime,
        });
      },
      callback() {
        const localLeftTime = this.localEndTime - Date.now();
        if (localLeftTime > 0) {
          const format = localLeftTime > 86400000 ? 'D天 H时F分' : 'H时F分';
          const info = formatCountDown(localLeftTime, format);
          that.setData({
            [`list[${this.index}]`]: Object.assign({}, that.data.list[this.index], { countDownInfo: info }),
          });
        } else {
          const info = '00时00分';
          that.setData({
            [`list[${this.index}]`]: Object.assign({}, that.data.list[this.index], {
              countDownInfo: info,
              // status: 2,
            }),
          });
          this.clear();
        }
      },
    };
    if (!this.countManger) {
      this.countManger = new CountManger(countDownOptions);
    } else {
      this.countManger.add(countDownOptions);
    }
  },

  clearCountDown() {
    const that = this;
    if (this.countManger) {
      this.countManger.clear(function() {
        that.setData({
          [`list[${this.index}].isSetCountDown`]: false,
        });
      });
      this.countManger = null;
    }
  },
  goCoupleShare(e) {
    if (this.data.type == 1) {
      this.initPullList();
    }
    this.forward('couple-share', {
      id: e.target.dataset.eventid,
    });
    // this.clearCountDown();
  },
  goOrderDetail(e) {
    if (this.data.type == 1) {
      this.initPullList();
    }
    this.forward('order-detail', {
      id: e.target.dataset.orderid,
    });
    // this.clearCountDown();
  },
  dealList(list = []) {
    return preData.CoupleOrderListData(list);
  },

  goIndex() {
    my.switchTab({
      url: '../index/index',
    });
  },
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
