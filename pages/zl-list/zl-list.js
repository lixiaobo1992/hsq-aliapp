import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  mapTo,
  pullList,
} from '/utils';
import * as ModelUtil from '/utils/modelUtil';

import authMixin from '/utils/authMixin'

import TimingTask from '/utils/timingTask';
import ViewPortItem from '/utils/viewPortItem';

import { computeTime } from '../../utils/dateUtil';

import backtop from '/components/backtop/backtop';


const app = getApp();

const systemInfo = me.$getSystemInfo();

const windowHeight = systemInfo.windowHeight;


xPage({
  ...mixins,
  ...pullList,
  ...backtop,

  ...TimingTask,
  ...ViewPortItem,
  timeDifference: 0,// 服务器时间与本地时间差值
  timestamp: parseInt(new Date().getTime()/1000), // 当前时间 服务器时间

  isRefreshPage: false, // 是否刷新页面
  data: {
    isLoading: true, // 页面是否loading

    viewId: '',
    showBackTop: false,

    list: [],
    shareInfo: true,

    showFooter: false,
    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    })
  },
  onLoad(query) {

    this.onPageInit(query);

    this.initViewPort({
      viewPortScrollTop:0, //
      viewPortHeight: windowHeight, // 当前滑动视口高度
      viewPortElement:'.zl-list-item', // 类名
      scroll:'onScroll' // 滚动监听回调
    })

    this.delTask('all')

    this.setData({
      shareInfo:{
        title: '助力享免单',
        desc: '邀您一起享0元秒杀～',
        content:'助力享免单,邀您一起享0元秒杀～', // 自定义吱口令文案
        imageUrl: 'https://img1.haoshiqi.net/aliapp/img/share_cba33efb6b.jpg', // 默认可以设置 logo
        // path: pageUrl,
      }
    })


    const that = this
    my.showLoading(); // 第一次进入是，还没有登录完成时
    if (this.data.logged){
      that.refresh()
    } else  {
      app.onSubscribeEvent(this, 'LOGIN_SUCCESS', function(){
        that.refresh()
      })
      // app.onSubscribeEvent(this, 'APP_REFRESH', function(){
      //   that.refresh()
      // })
    }

    // this.refresh();
  },

  onUnload() {

    this.stopTask() // 结束计时任务

  },
  onReady(){

  },
  onShow() {

    // 页面显示

    if (this.isRefreshPage) {
      const { logged } = this.data;

      if (logged) {
        this.refresh(); //获取门店信息
      }
      this.isRefreshPage = false // 当 页面hide 时 设为true  show 的时候设为false
    }

    if (this.data.list.length && this.insideViewPortItem.length) {
      this.filterView()
    }

  },
  onHide() {
    // 页面隐藏
    this.stopTask() // 结束计时任务
    this.isRefreshPage = true // 当 页面hide 时 设为true  show 的时候设为false

  },
  onPullDownRefresh() {
    this.refresh();
  },
  getAuthCode(){
    my.getAuthCode({
    scopes: 'auth_user',
    success: (res) => {
      my.alert({
        content: res.authCode,
      });
    },
  });
  },
  logout(){

    my.clearStorage({
      success() {
        my.showToast('清除缓存成功');
      },
    });
    api.logout({}, (res) => {
      console.log(res.data);
    }, (err) => {
      console.log(err);
    });
  },

  refresh() {
    //
    my.hideLoading();
    this.setData({
      isLoading: true,
    })
    this.initPullList();
    this.pullParams.scope = this;
    this.pullParams.weights = 1;
    this.pullModel = api.assistanceskuList;
    this.onScrollToLower()
  },

  // 补时间差
  makeUpTime(time) {
    return time + this.timeDifference
  },

  afterPull(res){
    // console.log(res)
    if (this.pullParams.pageNum == 1) {
      delete this.pullParams.scope;
      delete this.pullParams.weights;
    }
    // 计算时间差
    const currTime = parseInt(new Date().getTime()/1000);
    this.timeDifference = res.timestamp - currTime
    this.timestamp = res.timestamp // 当前时间

  },
  afterPullData(list = this.data.list || []){
    this.setData({
      isLoading: false
    })
    let tempObj = {}
    list.forEach((item)=>{
      tempObj[item.aid]=item
    })

    this.viewPortListData = tempObj;
    // console.log(this.viewPortListData)

    setTimeout(()=>{
      this.getViewPortListItemLoact((ret)=>{
        if (!ret[0] || !ret[0].length) {
          return
        }
        this.viewPortTagArray = []
        ret[0].forEach((item,index)=>{
          const tempId = this.data.list[index].aid
          this.viewPortTagArray.push({
            index,
            id:tempId,
            top: Math.round(item.top) + this.viewPortScrollOptions.viewPortScrollTop, // 再次获取时 需要加上当前已滑动的距离
            bottom: Math.round(item.bottom) + this.viewPortScrollOptions.viewPortScrollTop
          })
        })
        // console.log(this.viewPortTagArray)
        this.filterView()
      })
    },300)

  },

  // 筛选完成当前视口元素
  filterViewCallBack(){
    // 删除计时任务
    const tempKey = Object.keys(this.taskArray)

    let tempTaskKey = []
    for (let j = 0; j < this.insideViewPortItem.length; j++){
      const insideItme = this.insideViewPortItem[j]
      tempTaskKey.push(`HELP_TASK_LIST_${insideItme.index}`)
    }

    for(let i=0;i<tempKey.length; i++){
      if (tempTaskKey.indexOf(tempKey[i]) == -1) {
        this.delTask(tempKey[i])
      }
    }

    // 添加计时任务
    for (let i = 0; i < this.insideViewPortItem.length; i++ ){
      const insideItme = this.insideViewPortItem[i]

      let tempItem = this.viewPortListData[insideItme.id]
      let timestamp = this.makeUpTime(parseInt(new Date().getTime()/1000))

      if (timestamp < tempItem.startTime) {
        const taskName = `HELP_TASK_LIST_${insideItme.index}`

        const tempFun = ()=>{
          let tempItem = this.viewPortListData[insideItme.id]
          let timestamp = this.makeUpTime(parseInt(new Date().getTime()/1000))
          if (timestamp <= tempItem.startTime) {

            const compute = computeTime(timestamp * 1000, tempItem.startTime * 1000)
            let tempStr = `${compute.hours}:${compute.minutes}:${compute.seconds}开抢`
            if (Number(compute.days)){
              tempStr = `${Number(compute.days)}天 ${tempStr}`
            }
            this.setData({
              [`list[${insideItme.index}].startTimeText`]:tempStr,
            })
          } else {
            this.endTask(taskName); // 结束任务
          }
        }

        this.pushTask(taskName, tempFun, ()=> {

          // console.log(taskName + ' 结束 回调')
          // 计时结束改变按钮状态
          const taskNameArray  = taskName.split('_');
          const index  = Number(taskNameArray[taskNameArray.length-1]);
          let btnStatus = {
            status: 1,
            text: '马上抢',
            btnClass:'hong-btn',
            isDisabled: false,
          }
          this.setData({
            [`list[${index}].btnStatus`]: btnStatus
          })

        });

      }

    }
    // console.log('task list after:',Object.keys(this.taskArray))
    this.startTask();
  },

  dealList(list = []) {
    const that = this;
    return mapTo(list, (item) => {
      const booster_num = ModelUtil.getInt(item, 'booster_num')
      const status = that.zlStatus(item);
      const start_time = ModelUtil.getInt(item, 'start_time')
      let price = ModelUtil.getNumber(item, 'activity_price')
      price = price / 100
      let originalPrice =  ModelUtil.getNumber(item, 'single_price')
      originalPrice = originalPrice / 100
      return {
        aid: ModelUtil.getInt(item, 'activity_id'), // id
        title: ModelUtil.getString(item, 'title'), // 商品名
        image: ModelUtil.getString(item, 'thunbnail'), // 商品图
        totalNumber: ModelUtil.getInt(item, 'booster_num'), //助力人数
        leftStock: ModelUtil.getInt(item, 'left_stock'),// 剩余库存
        price: price.toFixed(2).split('.'), // 价格
        originalPrice:originalPrice.toFixed(2), // 原价
        startTime: start_time,
        // startTime: getTime(),
        startTimeText:'00:00:00', // 1天 00:00:00 开抢
        ...status
      };
    });
  },

  zlStatus(item={}){

    let stockStatus = {
      text: '',
      schedule: 0
    }; // 库存状态
    let btnStatus = {
      status: 0, // 0 无状态 1 马上抢、 2 提醒我、 3 取消提醒、 4 已抢光、 5 已结束
      text: '',
      btnClass:'', // '' 已抢光／已结束 huang-btn 提醒我  cancel-btn 取消提醒 hong-btn 马上抢
      isDisabled: false,
    }

    const {
      start_time, // 活动开始时间
      end_time, // 活动结束时间
      left_stock = 0, // 剩余库存
      activity_stock = 0, // 活动库存
      is_noticed = 2, // 订阅类型（1.已经订阅 2.没有订阅）

    } = item

    const currTime = this.makeUpTime(parseInt(new Date().getTime()/1000));

    // 按钮状态 马上抢
    if (currTime > start_time && currTime < end_time){
      if (left_stock){ // 有库存
        btnStatus.status = 1;
        btnStatus.text = '马上抢'
        btnStatus.btnClass = 'hong-btn'
      } else { // 没有库存
        btnStatus.status = 4;
        btnStatus.text = '已抢光'
        btnStatus.isDisabled = true
      }

    } else {
      if (currTime > end_time) { // 已结束
        btnStatus.status = 5;
        btnStatus.text = '已结束'
        btnStatus.isDisabled = true
      } else { // 未开始

        if(is_noticed == 1){ // 是否订阅
          btnStatus.status = 3;
          btnStatus.text = '取消提醒'
          btnStatus.btnClass = 'cancel-btn'
        } else{
          btnStatus.status = 2;
          btnStatus.text = '提醒我'
          btnStatus.btnClass = 'huang-btn'
        }
      }

    }

    // -----库存状态---------

    const sold = activity_stock - left_stock; // 已售 数量
    if (sold == 0) {
      let tempText = activity_stock>=10000?ModelUtil.getPriceValue(activity_stock/10000) + '万':activity_stock;
      stockStatus.text = `库存${tempText}件`;
    } else {
      let tempStock = sold / activity_stock * 100;
      if (tempStock >= 85) {
        if (left_stock <= 10){
          if (left_stock) {
            stockStatus.text = `仅剩${left_stock}件`
          } else {
            stockStatus.text = '已抢光'
          }
        } else {
          stockStatus.text = '即将售完'
        }
      } else {
        stockStatus.text =  `已抢${sold}件`
      }
      stockStatus.schedule = Number(ModelUtil.getPriceValue(tempStock));
    }

    return {
      btnStatus,
      stockStatus
    }
  },

  gotoNext(e) {
    const { type, position, aid, index } = e.currentTarget.dataset;
    const currItem = this.data.list[index];
    switch(type) {
      case 'rule': // 规则
        xmini.piwikEvent('c_helplist_rules')
        this.forward('zl-rule')
      break;
      case 'share-btn':
        xmini.piwikEvent('c_helplist_share')
      break;
      case 'mytask': // 我的免单
        xmini.piwikEvent('c_helplist_me')
        this.forward('zl-task')
      break;
      case 'zldetail': // 助力详情
        const tempStatus = currItem.btnStatus.status;

        if (position == 'img') { // 主图
          if (tempStatus==1 || tempStatus==2 || tempStatus ==3){
            xmini.piwikEvent('c_helplist_picture',{
              activityId:aid
            })
          } if(tempStatus==4) {
            xmini.piwikEvent('c_helplist_gone',{
              activityId:aid
            })
          } if(tempStatus==5){
            xmini.piwikEvent('c_helplist_end',{
              activityId:aid
            })
          }
        } else { // 商品信息
          xmini.piwikEvent('c_helplist_detail',{
            activityId:aid
          })
        }

        this.forward('zl-detail', {
          id : aid
        })
      break;

      default:
        // do he
    }
  },
  //  form 表单提交
  formBtnEvent(e){

    console.log('zl-list ----------------------- form:',e)

    const { formId, value: { aid, index } } = e.detail;

    const currItem = this.data.list[index];
    const tempStatus = currItem.btnStatus.status;

    if (tempStatus == 1){ // 马上抢
      xmini.piwikEvent('c_helplist_rob',{
        activityId:aid
      })
      this.createZL({
        aid,
        index,
        formId
      })
    } else if(tempStatus==2 || tempStatus==3){ // 提醒／取消提醒
      if (tempStatus == 2) {
        xmini.piwikEvent('c_helplist_remind',{
          activityId:aid
        })
      } else {
        xmini.piwikEvent('c_helplist_cancelremind',{
          activityId:aid
        })
      }
      this.subscribeEvent({
        aid,
        index,
        formId,
        type: tempStatus == 2 ? 1:2
      })
    }

    return;
  },

  // 创建助力
  createZL({ aid, index, formId }){

    const currItem = this.data.list[index];
    api.assistanceEventDetail({
      formId,
      activityId: aid, // 活动ID，创建任务必填
      activityType: 1 // 活动类型：1.助力免单
    }, (res) => {
      console.log(res)
      const {
        assistance_event: {
          event_id
        },
        end_time = 0,
        activity_status,

      } = res.data;
      if (event_id){
        this.forward('zl-invite', {
          eid: event_id
        })
      } else {

        if (activity_status == 3){
          const tempList = [
            ...this.data.list.slice(0,index),
            ...this.data.list.slice(index+1,this.data.list.length)
          ]
          this.setData({
            list: tempList || []
          })
          this.afterPullData(tempList);
          my.showToast('活动已下线！')
        } else if (res.timestamp > end_time) {
          let btnStatus = {
            status: 5,
            text: '已结束',
            btnClass:'',
            isDisabled: true,
          }
          this.setData({
            [`list[${index}].btnStatus`]: btnStatus
          })

          my.showToast('活动已结束！')
        }

      }

    }, (err) => {
      if (err.errno === 510010 || err.errno === 210013) {
        const that = this;
        authMixin.userAuthLogin({
          authType: 'auth_user',
          success: (res) => {
            that.createZL({
              aid,
              formId,
              index,
            })
          },
          fail: (err) => {
            my.hideLoading();
          }
        })
        return true;
      } else {
        my.hideLoading();
      }
    })
  },

  // 订阅
  subscribeEvent({ aid, index, type, formId }){

    api.subscribeZl({
      formId,
      activityId: aid,
      subscribe: type, //	订阅状态：1订阅，2取消订阅
      activityType:1 // 活动类型：1.助力免单
    },(res)=> {
      console.log(res)

      let tip = ['订阅成功！', '已取消订阅！']

      let btnStatus = {
        status: type==1?3:2,
        text: type==1?'取消提醒':'提醒我',
        btnClass: type==1?'cancel-btn':'huang-btn',
        isDisabled: false,
      }
      this.setData({
        [`list[${index}].btnStatus`]: btnStatus
      })

      my.showToast(tip[type-1]);
    },(err)=>{
      if (err.errno === 510010 || err.errno === 210013) {
        // this.forward('login', { authType: 'auth_user'}); // 主动授权
        const that = this;
        authMixin.userAuthLogin({
          authType: 'auth_user',
          success: (res) => {
            that.subscribeEvent({
              aid,
              index,
              formId,
              type
            })
          },
          fail: (err) => {
            my.hideLoading();
          }
        })
        return true;
      } else {
        my.hideLoading();
      }
    })

  },
});
