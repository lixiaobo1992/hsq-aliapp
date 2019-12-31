import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  mapTo
} from '/utils';

import authMixin from '/utils/authMixin'
import { isFastClick } from '/utils/is';
import { formatCountDown } from '/utils/dateUtil'
import { addPoint } from '/utils/stringUtil'

import TimingTask from '/utils/timingTask';

const app = getApp();

xPage({
  ...mixins,
  ...TimingTask,
  openUpMultiple:1, // 助力列表一次展开的倍数
  showNumBer: 5,

  msgTime: null, // 消息滚动效果计时器
  msgCurrentTop:100, // 当前移动的位置

  helpUserList:[], // 全部的助力人信息

  totalNumber: 0, // 需要助力的总人数 包含自己，助力人数不包含自己

  timeDifference: 0,// 服务器时间与本地时间差值
  timestamp: parseInt(new Date().getTime()/1000), // 当前时间 服务器时间

  isRefreshPage: false, // 是否刷新页面


  listIsNot: true, // 助力列表是否还有活动

  data: {
    isLoading: true, // 页面loading状态
    tempHelpUserList:[], // 显示的助力人信息

    isMore: false,
    isShowUp: false,
    helpUserListClass:'', // 助力列表样式

    msgList:[], // 底部滚动消息列表
    isZlPopups: false, // 助力成功弹窗
    isSharePopups: false, // 分享弹窗
    shareInfo: true,

    isStockPopups: false, // 库存为0时 弹窗

    activityCardInfo:{},
    isOwner: 0, // 是否任务发起者 0 未知 1 是 2 不是

    isJoin: false, // 是否助力过

    tipBox: {
      tip3: {
        btnText:'立即领取',
        btnEventType:'receive-btn',
        title: '助力成功！',
        subText: '好友已助力成功啦～快去领取吧'
      },
      tip5: {
        btnText:'查看订单',
        btnEventType:'look-btn',
        title: '领取成功！',
        subText: '已助力成功领取啦～快去查看吧'
      },
      tip4: {
        btnText:'其他好物',
        btnEventType:'zl-home',
        title: '助力失败！',
        subText: '免单失败，下次要努力邀请更多好友助力哦'
      }
    },
    aid: 0,
    eventType: false,
    setButStatus: false,
    eventId: 0,
    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    })
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
  onLoad(query) {
    console.log(query,'--------query');
    this.onPageInit(query);

    console.log(this.pageQuery)
    this.setData({
      eventId: this.pageQuery.eid
    })

    const msgAnim = my.createAnimation({
      duration: 500,
      // delay:0,
      timeFunction: 'ease-in',
      // timingFunction: 'cubic-bezier(.55, 0, .55, .2)',
      // transformOrigin: "50% 50% 0"
    });

    this.msgAnim = msgAnim;

    const that = this
    my.showLoading(); // 第一次进入是，还没有登录完成时
    if(this.data.logged) {
      that.refresh()
    } else  {
      app.onSubscribeEvent(this, 'LOGIN_SUCCESS', function(){
        that.refresh()
      })
      // app.onSubscribeEvent(this, 'APP_REFRESH', function(){
      //   that.refresh()
      // })
    }
    // this.pageQuery.eid = 552
  },
  onShow(){

    if (this.isRefreshPage) {
      const { logged } = this.data;

      if (logged) {
        this.refresh(); //获取门店信息
      }
      this.isRefreshPage = false // 当 页面hide 时 设为true  show 的时候设为false
    }

  },
  onReady(){
    //
  },
  onHide(){

    this.isRefreshPage = true // 当 页面hide 时 设为true  show 的时候设为false
    this.stopTask()
    this.stopSnimSetTimeout();
  },
  onUnload() {

    this.stopTask()
    this.stopSnimSetTimeout() // 停止动画
  },
  onPullDownRefresh(){
    this.refresh();
  },
  refresh() {
    this.delTask('all')
    this.getData();

  },
  // 补时间差
  makeUpTime(time) {
    return time + this.timeDifference
  },
  // 处理数据
  dealData(res){
    console.log(res,'dealData');
    const {
      name = '',  // 商品名称
      main_pic = '', // 商品主图
      activity_price = 0,
      activity_title= '',
      single_price = 0,
      title = '', // 帮忙助力标题
      sub_title = '', // 帮忙助力标题
      end_time: activityEndTime, // 活动结束时间
      activity_status, //活动上线下线
      assistance_event:{
        eventUser=[], // 参与助力用户信息
        event_id = 0, // 任务ID
        activity_id = 0, // 活动ID
        owner, // 是否任务发起者，是true 否false
        status, // 任务状态（1.初始 2.助力中 3.助力成功 4.助力失败）
        booster_num = 0, // 助力人数
        is_join, // 是否已助力
        join_count = 0, // 已助力人数
        end_time: tempEndTime, // 结束时间，任务未开始时不使用
        order_id // 任务订单
      },

      success_event = [], // 其他成功任务列表
    } = res.data;
    // 当前世间
    const currTime = this.makeUpTime(parseInt(new Date().getTime()/1000));

    // 跳转至 来晚了
    // 不是任务发起者 活动时间是否应结束 助力时间是否结束
    // 如果活动已下线
    // 助力失败
    if(!owner && activityEndTime < currTime && tempEndTime < currTime || activity_status == 3 ){
      this.forward('zl-late', { replace: true, isNotClick: true })
      return false;
    }

    if(res.data.assistance_event.status == 2 && res.data.left_stock == 0){
      this.setData({
        isStockPopups: true
      })
    }

    this.totalNumber = booster_num + 1; // 需要把自己算上

    const tempMsgList = this.dealMsgList(success_event?success_event:[])

    if (owner) { // 是否任务发起者
      this.helpUserList  = this.dealHelpUserList(eventUser?eventUser:[])
      this.supplementHelpUser(); // 处理现实助力成好友列表
    }else{
      this.helpUserList = []
    }

    // 判断是否添加 计时任务
    const lastTime = tempEndTime - currTime;
    let lastTimeText = ''
    if (lastTime > 0 && status == 2) { // 助力限时内 且在助力中
      lastTimeText = formatCountDown(lastTime*1000)
      lastTimeText = lastTimeText ? lastTimeText.split(':') : [];
      this.addTimingTask(tempEndTime)
    }

    let tempIsJoin = false

    let tempStatus = status // 助力状态

    if (status == 3) { // 助力完成
      tempIsJoin = true;
      this.setData({
        setButStatus: false
      })

      if (order_id) {
        tempStatus = 5 // 助力成功且已购买
      }

    } else if (status == 2){ // 助力中
      tempIsJoin = is_join
    } else if (status == 4) { // 助力失败
      this.setData({
        setButStatus: true
      })
      // //其他好物
      // this.otherGoodThings()
    }
    this.setData({
      isLoading: false, // 页面loading

      msgList: tempMsgList, // 其他成功任务列表

      isJoin: tempIsJoin, // 是否已助力
      isOwner: owner?1:2, // 是否任务发起者

      helpTitle: title,
      helpSubTitle: sub_title,
      activityCardInfo:{ // 活动详情
        title: activity_title,
        image: main_pic,
        price: (activity_price/100).toFixed(2).split('.'), // 价格
        originalPrice: (single_price/100).toFixed(2), // 原价
        booster_num, // 助力人数
        join_count,
        lastNumber: booster_num - join_count, // 剩余助力人数

        endTime: tempEndTime,
        endTimeText: lastTimeText,

        status: tempStatus,
        order_id,
        activity_id
      },
      shareInfo:{ // 分享信息
        title: activity_title,
        desc: '在吗？拜托助我一臂之力，帮我助力免费领(╯﹏╰)',
        content:'助力享免单,邀您一起享0元秒杀～', // 自定义吱口令文案
        imageUrl: main_pic!='' ? main_pic : 'https://img1.haoshiqi.net/aliapp/img/share_cba33efb6b.jpg', // 默认可以设置 logo
        // path: pageUrl,
        piwikAction: '助力免单助力邀请页分享',
      }
    })

    if (tempMsgList.length>3) {
      setTimeout(()=>{
        this.animSetTimeout();
      },200)
    }

  },
  dealHelpUserList(list=[]){
    const that = this;
    return mapTo(list, (item) => {
      return {
        isMy: item.owner,
        isNot: false,
        userName: item.username,
        userPic: item.avatar
      };
    });
  },
  dealMsgList(list=[]){
    const that = this;
    let tempList = mapTo(list, (item) => {
      return {
        tiem: item.success_time + '前成功领取',
        userName: item.userInfo && addPoint(item.userInfo.username || '',6),
        userPic: item.userInfo && item.userInfo.avatar
      };
    });

    return tempList.filter((item)=>{
      return item.userName && item.userPic && item.tiem
    })
  },

  addTimingTask(tempEndTime){
    const taskName = `HElP_TIME_TASK`

    const tempFun = ()=>{
      let timestamp = this.makeUpTime(parseInt(new Date().getTime()/1000))
      const tempItem = this.data.activityCardInfo

      const lastTime = tempEndTime - timestamp;
      if (lastTime > 0) {
        const compute = formatCountDown(lastTime*1000)
        const lastTimeText = compute.split(':');

        this.setData({
          [`activityCardInfo.endTimeText`]:lastTimeText,
        })
      } else {
        this.endTask(taskName); // 结束任务
      }
    }

    this.pushTask(taskName, tempFun, ()=> {
      // console.log(taskName + ' 结束 回调')
      // 计时结束改变按钮状态
      this.refresh(); // 倒计时完刷新页面

    });

    this.startTask()
  },

  // 获取助力任务详情
  getData(){
    const { eid } = this.pageQuery;
    // console.log(this.pageQuery)
    // console.log(eid)
    if (!eid) {
      my.alert({
        content: '缺少eid',
      });
      return
    }
    this.setData({
      isLoading: true,
    })
    api.assistanceEventDetail({
      scope: this,
      weights: 1,

      isLoading: false,
      eventId: this.data.eventId, // 活动ID，创建任务必填
      activityType: 1 // 活动类型：1.助力免单
    }, (res) => {
      my.stopPullDownRefresh();
      my.hideLoading();
      console.log(res,"助力助力助力助力助力助力助力助力助力助力助力助力助力助力")
      if(res.timestamp > res.data.end_time){
        my.showToast('活动已结束！')
        this.setData({
          eventType: true
        })
      }
      this.setData({
        aid: res.data.activity_id
      })
      // 计算时间差
      const currTime = parseInt(new Date().getTime()/1000);
      this.timeDifference = res.timestamp - currTime
      this.timestamp = res.timestamp // 当前时间

      this.dealData(res)

    }, (err) => {
      if (err.errno === 510010 || err.errno === 210013) {
        // this.forward('login', { authType: 'auth_user'}); // 主动授权
        const that = this;
        authMixin.userAuthLogin({
          authType: 'auth_base',
          success: (res) => {
            // console.log(res)
            that.getData()
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
  //
  stopSnimSetTimeout(){
    clearInterval(this.msgTime)
  },
  animSetTimeout(){
    this.stopSnimSetTimeout();
    this.msgCurrentTop = 100;
    this.msgTime=setInterval(()=>{
      // console.log(this.msgCurrentTop/100)
      const len = this.msgCurrentTop/100
      if (len == this.data.msgList.length - 2) {
        // this.stopSnimSetTimeout();
        // console.log('结束了')
        this.msgCurrentTop = 100;
        this.msgAnim.top(0).step({
          duration: 0,
        })
        this.setData({
          msgAnim: this.msgAnim.export(),
        });

        // this.animSetTimeout();
        // return ;
      }
      this.msgAnim.top(`-${this.msgCurrentTop}rpx`).step();
      this.msgCurrentTop+=100;
      this.setData({
        msgAnim: this.msgAnim.export(),
      });

    },2000)
  },

  //
  supplementHelpUser(){
    // console.log('supplementHelpUser:',this.helpUserList)
    if (this.helpUserList.length < this.totalNumber){
      let suppNum = this.totalNumber - this.helpUserList.length;
      for(let i = 0 ; i < suppNum; i++){
        this.helpUserList.push({
          isNot: true
        })
      }
    }

    this.openUpMultiple = 1 // 初始 倍数
    this.openUp({isFrist: true})

    // 助力列表样式
    let tempClass=''
    if (this.totalNumber<3){
      tempClass = 'one';
    } else if (this.totalNumber<5){
      tempClass = 'two';
    } else {
      tempClass = 'box';
    }

    this.setData({
      helpUserListClass: tempClass, // 助力列表样式
    })

  },

  // 收起
  packUp(){
    const { tempHelpUserList = [] } = this.data;
    if (tempHelpUserList.length > this.showNumBer) {
      this.openUpMultiple = 2 // 初始 倍数
      this.setData({
        isMore: true,
        isShowUp: false,
        tempHelpUserList: this.helpUserList.slice(0,this.showNumBer)
      })
    }
  },
  // 展开
  openUp({isFrist} = e){
    const { tempHelpUserList = [] } = this.data;

    // 当刷新页面时  isFrist 不需要对比长度 return 差点坑到
    if (!isFrist && tempHelpUserList.length == this.totalNumber){
      return;
    }
    // 如果总助力人数大于 允许显示数量 做截取
    let newArray

    let showNum = this.showNumBer * this.openUpMultiple ; // 显示的数量
    // console.log(showNum)
    let isMore = false
    let isShowUp = false;
    if(this.totalNumber - showNum > 0){ // 还有未展开
      isMore = true;
    }

    if(this.totalNumber >= showNum){
      newArray = this.helpUserList.slice(0, showNum)
    } else {
      newArray = this.helpUserList.concat()
    }
    // 显示条数大于基数
    if(newArray.length > this.showNumBer){
      isShowUp = true
    }
    if (tempHelpUserList.length){
      this.openUpMultiple *=2; // 累加倍数
    } else {
      this.openUpMultiple = 2
    }
    // console.log('tempHelpUserList:',newArray)
    this.setData({
      tempHelpUserList: newArray,
      isMore,// 显示展开按钮
      isShowUp, // 显示收起
    })

  },
  // 跳转
  gotoNext(e) {
    const { type } = e.currentTarget.dataset;

    switch(type) {
      case 'share-wechat': // 微信分享
        this.wechatBtnEvent();
        xmini.piwikEvent('c_helpinvite_wechat')
        break;
      case 'download': // 下载
        this.download()
        xmini.piwikEvent('c_helpinvite_popup_download')
        break;
      case 'share-alipay':
        xmini.piwikEvent('c_helpinvite_friend')
        break;
      case 'again-order':       // 重新发起助力
        console.log('重新发起助力');
        if(this.data.eventType){
          my.showToast('活动已结束！')
        }else{
          this.createZL(this.data.aid)
        }
        break;
      case 'share-erwei': // 二维码
        xmini.piwikEvent('c_helpinvite_qr')
        console.log(this.pageQuery.eid,"this.pageQuery.eid");
        this.forward('zl-codeimg',{
          eid: this.pageQuery.eid
        })
      break;
      case 'zldetail': // 助力详情
        const { isOwner, activityCardInfo: { status } } = this.data
        if(isOwner==1){
          xmini.piwikEvent('c_helpinvite_detail',{
            status
          })
        } else {
          xmini.piwikEvent('c_helpinvitee_detail',{
            status
          })
        }

        this.forward('zl-detail', {
          id : this.data.activityCardInfo.activity_id
        })
        break;
      case 'receive-btn': // 下单
        xmini.piwikEvent('c_helpinvite_receive')
        this.forward('order-commit', {
					id: this.data.activityCardInfo.activity_id,
					eventId: this.pageQuery.eid,
					zlFlag: 1
				});
        break;
      case 'look-btn': // 去查看订单
        const { activity_id, order_id } = this.data.activityCardInfo
        xmini.piwikEvent('c_helpinvite_order',{
          eventId: this.pageQuery.eid,
          activity_id,
          order_id
        })
        // 去订单详情
        if (order_id) {
          this.forward('order-detail', {
            id : order_id
          })
        }
        break;
      case 'zl-home': // 去助力列表
        xmini.piwikEvent('c_helpinvite_other')

        if (this.listIsNot) {
          this.forward('zl-list')
        } else {
          this.forward('index')
        }
        break;

      default:
        // do he
    }
  },

  otherGoodThings(){
    api.assistanceskuList({
      pageNum: 1,
      pageLimit: 20,
      needPagination: 1,
    },(res)=>{
      console.log(res)
      const { list } = res.data
      if (!list.length) {
        this.listIsNot = false
      }
    }, (err) =>{
      return true;
    })
  },

  // 表单
  formBtnEvent(e){
    const { formId, value: { type, post } } = e.detail;
    console.log('zl-invite form:', e)
    if (type == 'my-want-zl') {
      if (post) {
        xmini.piwikEvent('c_helpinvitee_popup_receive')
      } else {
        xmini.piwikEvent('c_helpinvitee_receive')
      }

      this.myWantZl({formId})
    } else if (type == 'zl-btn') {
      xmini.piwikEvent('c_helpinvitee_help')
      this.helpRequest({formId})
    }

  },

  // 助力
  helpRequest({ formId } = params){
    if (!isFastClick()) {
      console.warn('慢着点，别着急')
      return;
    }
    my.showLoading();
    api.alipayEventBack({
      formId,
      eventId: this.pageQuery.eid,
      activityType: 1
    },(res)=>{

      const join_count = this.data.activityCardInfo.join_count + 1
      const lastNumber = this.data.activityCardInfo.lastNumber - 1;

      if (!lastNumber) {
        this.endTask('HElP_TIME_TASK'); // 停止任务
      }

      this.setData({
        isJoin: true,
        'activityCardInfo.join_count' : join_count,
        'activityCardInfo.lastNumber' : lastNumber
      })

      this.setZlPopups()

    },(err)=>{
      if (err.errno === 510010 || err.errno === 210013) {
        // this.forward('login', { authType: 'auth_user'}); // 主动授权
        const that = this;
        authMixin.userAuthLogin({
          authType: 'auth_user',
          success: (res) => {
            // console.log(res)
            that.helpRequest({formId})
          },
          fail: (err) => {
            my.hideLoading();
          }
        })
        return true;
      } else {
        my.hideLoading();
      }

      if (err.errno === 910017) { // 活动已下线
        this.refresh()
      }

    })
  },
  // 我也要助力
  myWantZl({ formId } = params){
    const { activity_id } = this.data.activityCardInfo
    api.assistanceEventDetail({
      formId,
      activityId: activity_id, // 活动ID，创建任务必填
      activityType: 1 // 活动类型：1.助力免单
    }, (res) => {
      // console.log(res)
      this.setData({
        isZlPopups: false
      })
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
        if (this.timestamp > end_time){
          my.showToast('活动已结束！')
        } else if (activity_status == 3) {
          my.showToast('活动已下线！')
        }
        this.refresh();
      }

    }, (err) => {
      if (err.errno === 510010 || err.errno === 210013) {
        // this.forward('login', { authType: 'auth_user'}); // 主动授权
        const that = this;
        authMixin.userAuthLogin({
          authType: 'auth_user',
          success: (res) => {
            // console.log(res)
            that.myWantZl({formId})
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

  // 微信分享
  wechatBtnEvent(){
    console.log('11')
    if (!isFastClick()) {
      console.warn('慢着点，别着急')
      return;
    }
    api.assistanceShareInfo({
      eventId: this.pageQuery.eid
    },(res)=>{
      console.log(res)

      const { share_image_url='' } = res.data
      if (share_image_url!=''){
        this.tempShareImg = share_image_url

        this.setSharePopups()
      } else {
        my.showToast('请稍后在试。')
      }
    }, (err)=>{

    })

  },
  // 下载
  download(){
    if (!isFastClick()) {
      console.warn('慢着点，别着急')
      return;
    }
    if (!this.tempShareImg) {
      console.log('缺少图片url')
      return
    }
    my.saveImage({
      url: this.tempShareImg,
      success: (res) => {
        this.setSharePopups();
        my.showToast('保存成功')
        console.log('res:'+JSON.stringify(res))
      },
      fail: (err)=>{
        const { error } = err
        let errTip = ''
        switch(parseInt(error)){
          case 2:
            errTip = '缺少 url 参数'
            break;
          case 2001:
          case 15:
            errTip = '请开启相册权限后下载分享'
            break;
          case 16:
            errTip = '手机相册存储空间不足'
            break;
          default:
        }
        if (errTip!=''){
          my.showToast(errTip + error);
        }
        console.log('err:'+JSON.stringify(err))
      },
      complete:(ret)=>{
        console.log('ret:'+JSON.stringify(ret))
      }
    });


  },

  // 显示或隐藏 分享弹窗
  setSharePopups(){
    if (this.data.isSharePopups){
      xmini.piwikEvent('c_helpinvite_popup_cancel')
    }
    this.setData({
      isSharePopups: !this.data.isSharePopups
    })
  },
  // 显示或隐藏 助力成功弹窗
  setZlPopups(e){
    const { type } = e.currentTarget.dataset;
    console.log(type,'type')
    switch (type) {
      case 'share':
        this.setData({
          isZlPopups: !this.data.isZlPopups
        })
        break;
      case 'stock':
        this.setData({
          isStockPopups: !this.data.isStockPopups
        })
        break;
      case 'zllist':
        this.forward('zl-list')
        this.setData({
          isStockPopups: !this.data.isStockPopups
        })
        break;

      default:
        break;
    }

  },

  createZL(id){

    my.showLoading();
    api.assistanceEventDetail({
      activityId: id,
      activityType: 1 // 活动类型：1.助力免单
    }, (res) => {
      my.hideLoading();
      const {
        assistance_event: {
          event_id
        },
        end_time = 0,
        activity_status,

      } = res.data;
      this.setData({
        eventId: event_id
      })
      if (event_id){
        this.refresh()
      } else {
        if (activity_status == 3){
          my.showToast('活动已下线！')
        } else if (res.timestamp > end_time) {
          my.showToast('活动已结束！')
        }
      }
    }, (err) => {
      if (err.errno === 510010 || err.errno === 210013) {
        const that = this;
        authMixin.userAuthLogin({
          authType: 'auth_user',
          success: (res) => {
            that.createZL(id)
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
