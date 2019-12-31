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
  regImgs,
} from '/utils';

import authMixin from '/utils/authMixin'
import TimingTask from '/utils/timingTask';


// import CountManger from '/utils/CountManger';
import { computeTime } from '/utils/dateUtil';

// const app = getApp();
let width;
// let timeStamp, serverEndTime, firstDiffTime;

xPage({
	...mixins,
  ...TimingTask,

  timeDifference: 0,// 服务器时间与本地时间差值
  timestamp: parseInt(new Date().getTime()/1000), // 当前时间 服务器时间

  isRefreshPage: false, // 是否刷新页面

  data: {
		isLoading: true,

		shareInfo: true,

    btnStatus: {
      type:1,
      status: 0, // 0 无状态 1 马上抢、 2 提醒我、 3 取消提醒、4、助力中、5、立即抢购(助力成功)，6 已抢光、 7 已结束
      text: '',
      btnClass:'', // '' 已抢光／已结束
      isDisabled: false,
    },
    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    })
  },

  onLoad(options) {
		this.onPageInit(options);
		this.refresh();
  },

  onUnload() {

    this.stopTask()
  },
  onShow() {

    if (this.isRefreshPage) {
      const { logged } = this.data;

      if (logged) {
        this.refresh(); //获取门店信息
      }
      this.isRefreshPage = false // 当 页面hide 时 设为true  show 的时候设为false
    }
  },
	onHide(){
    this.isRefreshPage = true // 当 页面hide 时 设为true  show 的时候设为false

    this.stopTask()
	},
  onPullDownRefresh(){
    this.refresh();
  },
  refresh(){
    this.delTask('all')
		this.getData({
      scope: this,
      weights: 1,

			activityType: 1,
			activityId: this.pageQuery.id || 201,
		});
	},

  // 补时间差
  makeUpTime(time) {
    return time + this.timeDifference
  },
	getData(params){
    this.setData({
      isLoading: true,
    })
		api.assistanceDetail(params,
		(res) => {
      my.stopPullDownRefresh();
      // 计算时间差
      const currTime = parseInt(new Date().getTime()/1000);
      this.timeDifference = res.timestamp - currTime
      this.timestamp = res.timestamp // 当前时间
      console.log(this.timestamp,"服务器时间")
      console.log(currTime,"本地时间")
      console.log(this.timeDifference,"服务器时间减去本地时间");
			this.dealData(res.data);
      console.log(res,"--------detail-----------")
			// this.getGraphicDetail();
		}, (err) => {
			// console.log(err)
			my.hideLoading();
		})
	},
	dealData(data = {}){

		width = my.$getSystemInfo().windowWidth;
    const swiperList = mapTo((data.pics || []), (item) => {
      return {
        image: item,
        url: '',
      };
    });

    const {
      assistance_event = {}
    } = data;

		this.eventId = data.assistance_event.event_id ? data.assistance_event.event_id : '';

    const status = this.zlStatus(data);

    let { btnStatus, btnEndTime, btnEndTimeText, btnEndTimeTit } = status;
    if (btnStatus.status == 2 || btnStatus.status == 3 || btnStatus.status == 4 || btnStatus.status == 5) {
      const currTime = this.makeUpTime(parseInt(new Date().getTime()/1000));
       // 判断是否添加 计时任务
      if (btnEndTime > currTime) {
        const compute = computeTime(currTime * 1000, btnEndTime * 1000)
        let tempStr = `${compute.hours}:${compute.minutes}:${compute.seconds}`
        if (Number(compute.days)){
          tempStr = `${Number(compute.days)}天 ${tempStr}`
        }
        btnEndTimeText = tempStr

        this.addTimingTask(btnEndTime)
      }
    }

		// const attrs = this.addAttrOptions(data.attrs);
    this.setData({

			isLoading: false,

      swiperInfo: { // banner
        list: swiperList, // 如果数据不符合格式，可以使用 mapTo 方法
        hwRatio: 1,
        height: width,
      },
      name: data.name, // 商品名
      desc: data.activity_rule, // 活动规则
      promotions: data.promotions, // 促销信息
      attrs: data.attrs, // 产品规格
      labels: data.labels, // 质保标签
			graphicDetail: regImgs(data.graphicDetail, true), // 详情富文本  不是？？
			boosterNum: data.booster_num, // 助力人数
			priceInt: (data.activity_price / 100).toFixed(2),
			marketPrice: (data.single_price / 100).toFixed(2),

      activity_id: data.activity_id,

      btnStatus,
      btnEndTime,
      btnEndTimeText,
      btnEndTimeTit,

			shareInfo: {
				title: data.name,
				desc: '在吗？拜托助我一臂之力，帮我助力免费领(╯﹏╰)',
				imageUrl: data.pics && data.pics[0],
				piwikAction: '助力免单详情页分享',
			},
    });
		my.hideLoading();
	},

  zlStatus(item={}){

    let btnStatus = {
      type:1, // 1 2 按钮类型
      status: 0, // 0 无状态 1 马上抢、 2 提醒我、 3 取消提醒、4、助力中、5、立即抢购(助力成功)，6 已抢光、 7 已结束、 8 已参与
      text: '',
      btnClass:'', // '' 已抢光／已结束
      isDisabled: false,
    }

    let btnEndTimeTit = '';
    let btnEndTimeText =  '';
    let btnEndTime = 0;

    const {
      booster_num, // 助力人数
      join_times_limit = 0, // 限定参与次数
      status: activityStatus, // 活动状态（1：正常，2：结束）
      activity_status, // 活动上线下线（1：未上线，2：上线，3：下线，4：作废）
      start_time: activity_start_time, // 活动开始时间
      end_time: activity_end_time, // 活动结束时间
      left_stock = 0, // 剩余库存
      is_noticed = 2, // 订阅类型（1.已经订阅 2.没有订阅）
      assistance_event = {}

    } = item

    const {
      event_id = 0,
      status: event_status, // 助力任务状态（1.初始 2.助力中 3.助力成功 4.助力失败）
      join_count = 0, // 已助力人数
      join_times = 0, // 已参与次数
      end_time = 0, // 结束时间，任务未开始时不使用
      order_id = 0, // 订单ID
    } = assistance_event
    const currTime = this.makeUpTime(parseInt(new Date().getTime()/1000));

    // 活动上线下线（1：未上线，2：上线，3：下线，4：作废）
    if (activity_status == 2){ // 上线

      // 是否在活动时间内
      let isActivityTime = currTime > activity_start_time && currTime < activity_end_time
      let isExpired = currTime > activity_end_time // 活动是否已结束
      let isHelp = false; // 是否已助力

      console.log(assistance_event,"assistance_event")

      if (assistance_event && event_status) { // 有助力过 仅是有助力过
        isHelp = true;
        // 助力失败
        // 助力成功 有支付过订单
        // 助力时间已过期
        // 库存为零 助力中
        if ((event_status == 3 && order_id) || currTime > end_time || (!left_stock && event_status !== 2)) {
          isHelp = false;
        }
      }
      // 活动时间内 没有助力过
      if (isActivityTime && !isHelp) {
        // 有剩余库存 且未到达购买上限
        if (left_stock && join_times < join_times_limit) {
          btnStatus.status = 1 // 马上抢
          btnStatus.text = `需要${booster_num?booster_num:0}人助力，限时免费抢`
          btnStatus.btnClass = 'btn-red' //
          // 商品有库存，参与次数与活动上线相等，已经购买过了。
        } else if (left_stock && join_times == join_times_limit && order_id){
          btnStatus.status = 8 // 已参与
          btnStatus.text = '已达活动参与上限哦'
          btnStatus.isDisabled = true;
        } else {
          btnStatus.status = 6 // 已抢光
          btnStatus.text = '已抢光'
          btnStatus.isDisabled = true;
        }
      } else if ((isActivityTime && isHelp) || (isExpired && isHelp)) {
        // 活动时间内 助力过 || 活动已结束 助力过
        const surplusNum = booster_num-join_count
        // 助力中
        if (event_status == 2 && surplusNum) {
          btnStatus.status = 4 //
          btnStatus.text = `还需${surplusNum}人助力，继续邀请`
        }
        // 助力成功
        if (event_status == 3){
          btnStatus.status = 5
          btnStatus.text = '立即抢购'
        }
        // 助力中 || 助力成功
        if (event_status == 2 || event_status == 3) {
          btnEndTime = end_time
          btnEndTimeTit= '剩余: '
          btnStatus.btnClass = 'btn-red' //
          btnStatus.type = 2
        }
        // 助力成功并且有支付订单并且参与次数等于限定次数
        if (event_status == 3 && order_id){
          btnStatus.type = 1
          btnStatus.status = 8   // 已参与
          btnStatus.isDisabled = true
          btnStatus.text = '已达活动参与上限哦'
        }
      } else if (isExpired) { // 活动已结束
        btnStatus.status = 7;
        btnStatus.text = '已结束'
        btnStatus.isDisabled = true
      } else {
        // 未开始
        btnEndTime = activity_start_time
        btnEndTimeTit= '距离开始: '
        btnStatus.type = 2
        if(is_noticed == 1){ // 是否订阅
          btnStatus.status = 3;
          btnStatus.text = '取消提醒'
          btnStatus.btnClass = 'has-subscribe'
        } else{
          btnStatus.status = 2;
          btnStatus.text = '提醒我'
          btnStatus.btnClass = 'no-subscribe'
        }
      }

    } else {
      //无论什么状态，若商详页中，该活动已下线，刷新时，按钮置灰，标记已抢光
      btnStatus.status = 6 // 已抢光
      btnStatus.text = '已抢光'
      btnStatus.isDisabled = true;
    }
    // console.log(btnStatus)

    return {
      btnEndTimeTit,
      btnEndTimeText,
      btnEndTime,
      btnStatus
    }
  },



  // 拼接已选字符串
  addAttrOptions(attrs = []) {
    let options = '';
    let i;
    for (i = 0; i < attrs.length; i++) {
      options += `【${attrs[i].name}】${attrs[i].value}、\n `;
    }

    return options.substr(0, options.length - 4);
  },
	// 跳转到在线客服
  toCustomService() {
    xmini.piwikEvent('详情页点击联系客服');
    this.forward('service');
  },

  addTimingTask(tempEndTime = 0){
    const taskName = `DETAIL_TIME_TASK`

    const tempFun = ()=>{
      let timestamp = this.makeUpTime(parseInt(new Date().getTime()/1000))
      // const btnEndTime = this.data.btnEndTime
      if (tempEndTime > timestamp) {
        const compute = computeTime(timestamp * 1000, tempEndTime * 1000)
        let tempStr = `${compute.hours}:${compute.minutes}:${compute.seconds}`
        if (Number(compute.days)){
          tempStr = `${Number(compute.days)}天 ${tempStr}`
        }

        this.setData({
          'btnEndTimeText':tempStr,
        })
      } else {
        this.endTask(taskName); // 结束任务
      }
    }

    this.pushTask(taskName, tempFun, ()=> {
      console.log(taskName + ' 结束 回调')
      // 计时结束改变按钮状态
      this.refresh(); // 倒计时完刷新页面
    });
    this.startTask()
  },

  formBtnEvent(e){

    console.log('zl-detail form:',e)

    const { formId } = e.detail;
    const { btnStatus = {}, activity_id } = this.data
    switch(btnStatus.status){
      case 1:
        // xmini.piwikEvent('c_productd_helpc');
        this.createZL({
          formId
        });
        break;
      case 2:
        xmini.piwikEvent('c_productd_remind')
        this.subscribeEvent({
          aid: activity_id,
          type: 1
        })
      break;
      case 3:
        xmini.piwikEvent('c_productd_unremind')
        this.subscribeEvent({
          aid: activity_id,
          type: 2
        })
      break;
      default:
        // do nothing....
    }

  },


	// 创建助力
  createZL({ formId } = params){
		const aid = this.pageQuery.id || 107;
    api.assistanceEventDetail({
      isLoading: false,
      activityId: aid, // 活动ID，创建任务必填
      activityType: 1, // 活动类型：1.助力免单
			formId
    }, (res) => {
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

        let btnStatus = {
          type:1, // 1 2 按钮类型
          status: 0, // 0 无状态 1 马上抢、 2 提醒我、 3 取消提醒、4、助力中、5、立即抢购(助力成功)，6 已抢光、 7 已结束
          text: '',
          btnClass:'', // '' 已抢光／已结束
          isDisabled: true,
        }

        if (activity_status == 3){
          btnStatus.text = '已抢光'
          btnStatus.isDisabled = true
          my.showToast('活动已下线！')
        } else if (res.timestamp > end_time) {
          btnStatus.status = 5
          btnStatus.text = '已结束'
          btnStatus.isDisabled = true
          my.showToast('活动已结束！')
        }

        this.setData({
          'btnStatus': btnStatus
        })
      }
    }, (err) => {
      if (err.errno === 510010 || err.errno === 210013) {
        // this.forward('login', { authType: 'auth_user'}); // 主动授权
        const that = this;
        authMixin.userAuthLogin({
          authType: 'auth_user',
          success: (res) => {
            that.createZL({formId})
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
  subscribeEvent({ aid, type }){

    my.showLoading();
    api.subscribeZl({
      formId: this.formId,
      isLoading: false,
      activityId: aid,
      subscribe: type, //	订阅状态：1订阅，2取消订阅
      activityType:1 // 活动类型：1.助力免单
    },(res)=> {
      // console.log(res)
      my.hideLoading();

      let tip = ['订阅成功！', '已取消订阅！']

      let btnStatus = {
        type:2,
        status: type==1?3:2,
        text: type==1?'取消提醒':'提醒我',
        btnClass: type==1?'has-subscribe':'no-subscribe',
        isDisabled: false,
      }
      this.setData({
        btnStatus: btnStatus
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
	goNext(e){
		const { type } = e.currentTarget.dataset;
		switch (type) {
      // case 'assistanceClick':
      //   this.assistanceClick();
      //   break;
      case 'footer-btn':
        this.footerBtnEvent();
        break;
      default:
        // do nothing...
        break;
    }
	},

  footerBtnEvent(){

    const { btnStatus = {}, activity_id } = this.data

    // 0 无状态 1 马上抢、 2 提醒我、 3 取消提醒、4、助力中、5、立即抢购(助力成功)，6 已抢光、 7 已结束
    console.log(btnStatus.status,"btnStatus.status")
    switch(btnStatus.status){
      // case 1:
      //   // xmini.piwikEvent('c_productd_helpc');
      //   this.createZL();
      //   break;
      // case 2:
      //   xmini.piwikEvent('c_productd_remind')
      //   this.subscribeEvent({
      //     aid: activity_id,
      //     type: 1
      //   })
      // break;
      // case 3:
      //   xmini.piwikEvent('c_productd_unremind')
      //   this.subscribeEvent({
      //     aid: activity_id,
      //     type: 2
      //   })
      // break;
      case 4:
        xmini.piwikEvent('c_productd_helpc');
				this.forward('zl-invite', {
					eid: this.eventId
				})
      break;
      case 5:
        xmini.piwikEvent('c_productd_done');
				this.forward('order-commit', {
					id: this.pageQuery.id || 107,
					eventId: this.eventId,
					zlFlag: 1
				});
        break;
      case 6:

      break;
      case 7:

      break;

    }
  }
});
