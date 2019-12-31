import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  pullList,
  mapTo
} from '/utils';
import * as ModelUtil from '/utils/modelUtil';

// import authMixin from '/utils/authMixin'

import TimingTask from '/utils/timingTask';
import ViewPortItem from '/utils/viewPortItem';

import { computeTime } from '../../utils/dateUtil';

const app = getApp();
let listType = 2; // 1.初始 2.助力中 3.助力成功 4.助力失败

const systemInfo = me.$getSystemInfo();

const windowHeight = systemInfo.windowHeight;

xPage({
  ...mixins,
  ...pullList,
  ...TimingTask,
  ...ViewPortItem,
  timeDifference: 0,// 服务器时间与本地时间差值
  timestamp: parseInt(new Date().getTime()/1000), // 当前时间 服务器时间

  isRefreshPage: false, // 是否刷新页面

  listIsNot: true, // 其他好物
  data: {
    isLoading: true, // 页面是否loading

    tabs: [
      {
        type: 2,
        name:'助力中'
      },
      {
        type: 3,
        name:'助力成功'
      },
      {
        type: 4,
        name:'助力失败'
      }
    ],
    listType, // 列表类型 1.初始 2.助力中 3.助力成功 4.助力失败
    list:[],
    statusImg:{ // 状态图章图标
      s2:'https://img1.haoshiqi.net/miniapp/zl/zl-success_4500f9e07b.png', // 2助力成功
      s3:'https://img1.haoshiqi.net/miniapp/zl/zl-buy-success_9975c250c7.png', // 3抢购成功
      s4:'https://img1.haoshiqi.net/miniapp/zl/zl-fail_292de45467.png' // 4失败
    },

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
      viewPortElement:'.couple-content', // 类名
      scroll:'onTaskScroll' // 滚动监听回调
    })

    this.delTask('all')

    listType = query.type || 2;
    const { systemInfo = {} } = app.getData();
    this.setData({
      height: systemInfo.windowHeight,
      listType
    });

    this.refresh();
  },
  onReady(){

    this.setViewPortHeight()

  },
  onShow() {
    console.log('main onShow')


    if (this.isRefreshPage) {
      const { logged } = this.data;

      if (logged) {
        this.refresh(); //获取门店信息
      }
      this.isRefreshPage = false // 当 页面hide 时 设为true  show 的时候设为false
    }
    if(listType == 2 || listType == 3){
      if (this.data.list.length && this.insideViewPortItem.length) {
        this.filterView()
      }
    }
    // this.getMyBoostList(listType);
  },

  onUnload() {
    this.stopTask() // 结束计时任务

  },
  onHide() {
    this.isRefreshPage = true // 当 页面hide 时 设为true  show 的时候设为false
    this.stopTask() // 结束计时任务
  },
  onPullDownRefresh() {
    this.refresh();
  },

  refresh() {
    //
    // my.showLoading()
    this.setData({
      isLoading: true,
    })
    this.stopTask() // 结束计时任务
    this.initPullList();
    this.getMyBoostList();
  },

  //获取并修改滑动视口的高度
  setViewPortHeight(){
    const box = my.createSelectorQuery()
    box.select('#tabs-box').boundingClientRect().exec((ret)=>{
      console.log('tabs-box:',ret)
      this.viewPortTopHeight = parseInt(ret[0].height) // 视口上方高度
      this.viewPortScrollOptions.viewPortHeight = parseInt(windowHeight - ret[0].height)
    })
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
    console.log(res)
  },
  afterPullData(list = this.data.list || []){
    this.setData({
      isLoading: false
    })
    let tempObj = {}
    list.forEach((item)=>{
      tempObj[item.event_id]=item
    })

    this.viewPortListData = tempObj;
    console.log('viewPortListData',this.viewPortListData)

    setTimeout(()=>{
      this.getViewPortListItemLoact((ret)=>{
        if (!ret[0] || !ret[0].length) {
          return
        }
        this.viewPortTagArray = []
        ret[0].forEach((item,index)=>{
          const tempId = this.data.list[index].event_id
          this.viewPortTagArray.push({
            index,
            id:tempId,
            top: Math.round(item.top) + this.viewPortScrollOptions.viewPortScrollTop, // 再次获取时 需要加上当前已滑动的距离
            bottom: Math.round(item.bottom) + this.viewPortScrollOptions.viewPortScrollTop
          })
        })
        console.log('viewPortTagArray',this.viewPortTagArray)
        this.filterView()
      })
    },300)
  },

  // 筛选完成当前视口元素
  filterViewCallBack(){

    console.log('ssss',this.insideViewPortItem);
    console.log('this',this)
    // 删除计时任务
    const tempKey = Object.keys(this.taskArray)

    let tempTaskKey = []
    for(let j = 0; j < this.insideViewPortItem.length; j++){
      const insideItme = this.insideViewPortItem[j]
      tempTaskKey.push(`TASK_LIST_ITEM_${insideItme.index}`)
    }

    for(let i=0;i<tempKey.length; i++){
      if (tempTaskKey.indexOf(tempKey[i]) == -1) {
        this.delTask(tempKey[i])
      }
    }
    console.log(this.taskArray)
    // 添加计时任务
    for(let i = 0; i < this.insideViewPortItem.length; i++ ){
      const insideItme = this.insideViewPortItem[i]

      let tempItem = this.viewPortListData[insideItme.id]
      let timestamp = this.makeUpTime(parseInt(new Date().getTime()/1000))
      console.log(tempItem)
      if (timestamp < tempItem.endTime) {
      // if (timestamp < tempItem.endTime && tempItem.activity_status!=3) {
        const taskName = `TASK_LIST_ITEM_${insideItme.index}`
        const tempFun = ()=>{
          let tempItem = this.viewPortListData[insideItme.id]
          let timestamp = this.makeUpTime(parseInt(new Date().getTime()/1000))
          if (timestamp <= tempItem.endTime) {

            const compute = computeTime(timestamp * 1000, tempItem.endTime * 1000)
            let tempStr = `${compute.hours}:${compute.minutes}:${compute.seconds}`
            this.setData({
              [`list[${insideItme.index}].endTimeText`]:tempStr,
            })
          } else {
            this.endTask(taskName); // 结束任务
          }
        }

        this.pushTask(taskName, tempFun, ()=> {
          console.log(taskName + ' 结束 回调')
          // 计时结束改变按钮状态
          const taskNameArray  = taskName.split('_');
          const index  = Number(taskNameArray[taskNameArray.length-1]);
          this.setData({
            [`list[${index}].endTimeText`]:'',
          })

        });

      }

    }

    this.startTask();

  },

  dealList(list = {}) {
    const that = this;
    console.log(list,'list--------')
    return mapTo(list, (item) => {

      const booster_num = ModelUtil.getInt(item, 'booster_num')
      const join_count = ModelUtil.getInt(item, 'join_count')
      const launch_end_time = ModelUtil.getInt(item, 'launch_end_time')

      const status = that.zlStatus(item);

      let price = ModelUtil.getNumber(item, 'activity_price')
      price = price / 100

      let originalPrice =  ModelUtil.getNumber(item, 'single_price')
      originalPrice = originalPrice / 100
      return {
        aid: ModelUtil.getInt(item, 'activity_id'),
        event_id: ModelUtil.getInt(item, 'event_id'), // id
        order_id: ModelUtil.getInt(item, 'order_id'), // 订单id
        activity_status: ModelUtil.getInt(item,'activity_status'), // 活动状态
        title: ModelUtil.getString(item, 'title'), // 商品名
        image: ModelUtil.getString(item, 'thunbnail'), // 商品图
        totalNumber: booster_num, //助力人数
        differNumber: booster_num - join_count, // 还差助力人数
        price: price.toFixed(2).split('.'), // 价格
        originalPrice: originalPrice.toFixed(2), // 原价
        leftStock: item.left_stock,
        endTime: launch_end_time, // 助力结束时间
        endTimeText:'',

        ...status // 状态
      };
    });
  },

  zlStatus(item={}){

    let status = 1;
    let btnStatus = {
      text: '',
      btnClass:'btn-red', // btn-red  btn-white
      isDisabled: false
    }

    const event_status = ModelUtil.getInt(item, 'event_status')

    switch(event_status){
      //状态（1.初始 2.助力中 3.助力成功 4.助力失败）
      // 1助力中(继续邀请)  2助力成功(立即抢购) 3抢购成功(查看订单) 4 失败
      case 1: // 初始

        break;
      case 2: // 助力中
        status = 1

        if(item.activity_status == 2 && item.left_stock > 0){
          btnStatus.text= '继续邀请' // 继续邀请  立即抢购 查看订单
        } else if (item.activity_status == 3){
          btnStatus.text= '已抢光' //
          btnStatus.isDisabled = true
        }else if( item.activity_status == 2 && item.left_stock == 0){
          btnStatus.isDisabled = false
          btnStatus.text= '继续邀请'
          btnStatus.btnClass = 'disabled'
        }

        break;
      case 3: // 助力成功
        status = 2
        btnStatus.text= '立即抢购' // 继续邀请  立即抢购 查看订单

        if (item.order_id){ // 是否购买过
          status = 3;
          btnStatus.text = '查看订单'
          btnStatus.btnClass = 'btn-white' // btn-red  btn-white
        } else if (item.activity_status == 3 || item.can_buy != 1){ // 未购买过 不可购买
          btnStatus.isDisabled = true
        }

        break;
      case 4: // 助力失败
        status = 4
        btnStatus.text= '去看其他好物' // 继续邀请  立即抢购 查看订单
        btnStatus.btnClass= 'btn-red' // btn-red  btn-white
        break;
      default:
        // do nothing...
    }

    return {
      status,
      btnStatus
    }
  },

  switchTab(e) {
    const that = this;
    const { type } = e.currentTarget.dataset;

    if (listType === type) {
      return;
    }
    my.showLoading();

    listType = type;

    if (listType == 2) {
      xmini.piwikEvent('c_myhelp_inhelp')
    }
    if (listType == 3) {
      xmini.piwikEvent('c_myhelp_tab_success')
    }
    if (listType == 4) {
      xmini.piwikEvent('c_myhelp_tab_fail')
    }


    this.setData({
      isLoading: true,
      listType: type,
      list:[]
    });
    this.delTask('all') // 清除所有任务
    this.stopTask() // 结束计时任务
    this.refresh();
  },

  getMyBoostList() {
    console.log(listType,'listType')
    this.pullParams = Object.assign({
      needPagination: 1,
      pageLimit: 10,
      pageNum: 1,
      eventStatus: listType,
      // listType: 1,
      activityType:1,

      scope: this,
      weights: 1
    });
    this.pullModel = api.assistanceuserskuList;
    this.onScrollToLower();
    if (listType==4){
      this.otherGoodThings()
    }
  },

  otherGoodThings(){
    api.assistanceskuList({
      pageNum: 1,
      pageLimit: 20,
      needPagination: 1,
    },(res)=>{
      console.log(res,'助力商品列表接口返回')
      const { list } = res.data
      if (!list.length) {
        this.listIsNot = false
      }
    }, (err) =>{
      return true;
    })
  },

  gotoNext(e) {
    const { type, index } = e.currentTarget.dataset;
    const item = this.data.list[index];
    switch(type) {

      case 'zldetail': // 助力详情
        xmini.piwikEvent('c_myhelp_detail',{
          status: item.status,
          event_id: item.event_id,
          activity_id: item.aid
        })
        this.forward('zl-detail', {
          id : item.aid
        })
      break;
      case 'zlbtn':
        // this.forward('zl-detail')
        this.zlBtnEvent(item);
      break;
      case 'complaint':
        xmini.piwikEvent('c_myhelp_complaint')
        this.forward('complaint')
      break;

      case 'zllist':
        this.forward('zl-list')
      break;

      default:
        // do he
    }
  },


  zlBtnEvent(item = {}){
    const { status, order_id, btnStatus } = item;
    console.log(item)
    if (status==1 || status ==2 ) {
      if (status ==1){
        xmini.piwikEvent('c_myhelp_invite',{
          event_id: item.event_id,
          activity_id: item.aid
        })
      } else {
        xmini.piwikEvent('c_myhelp_buy',{
          event_id: item.event_id,
          activity_id: item.aid
        })
      }
      if (!btnStatus.isDisabled){
        // 去助力详情
        this.forward('zl-invite', {
          eid : item.event_id
        })
      }

    }

    if (status == 3){
      xmini.piwikEvent('c_myhelp_order',{
        event_id: item.event_id,
        activity_id: item.aid
      })
      // 去订单详情
      this.forward('order-detail', {
        id : item.order_id
      })
    }

    if(status == 4){
      xmini.piwikEvent('c_myhelp_other',{
        event_id: item.event_id,
        activity_id: item.aid
      })

      if (this.listIsNot) {
        this.back()
      } else {
        this.forward('index')
      }
    }
  },

});

