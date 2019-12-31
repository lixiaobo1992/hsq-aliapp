import {
  me,
  xmini,
  xPage,
  mapState,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  dealPrice
} from '../../utils/index';
import dealData from '/utils/dealData';
import riskgoMixin from '/utils/riskgoMixin';

const app = getApp();

xPage({
  ...mixins,
  ...dealData,
  ...riskgoMixin,
  _data: {
    riskgoData: null,
  },
  data: {
    payPrice: '',
    higePage: true,
    id: '',
    packetPopStatus: false, //是否显示红包弹层
    welfare_id: 0, //红包id
    cover_title: '', //红包文案
    redPacket: {
      price: 0, //拆开红包的金额
      isOpened: false, //是否已打开红包
    },
    ...mapState({
      logged: state => state.user.logged,
    })
  },
  onLoad(query) {
    this.onPageInit(query);
    const { id = '' } = query;
    this.setData({
      id,
    });
  },
  onShow() {
    if (!this.data.id) {
      setTimeout(() => {
        // 这里竟然不能直接调用展示
        my.showToast({
          content: '参数错误, 返回首页', // 文字内容
        });
      }, 300);
      setTimeout(() => {
        this.forward('index');
      }, 2000);
      return;
    }
    this.refresh();
  },
  refresh() {
    this.getOrderResult()
  },
  initData(){
    const that = this;
    const { logged } = this.data;

    if (!logged) {
      app.onSubscribeEvent(this, 'LOGIN_SUCCESS', function(){
        that.updatedRiskgoData()
      })
    } else {
      that.updatedRiskgoData()
    }
  },
  getOrderResult() {
    // 这里最后调用一个接口获得
    api.getOrderResult(
      {
        scope: this,
        weights: 1,
        orderIds: this.data.id,
      },
      res => {
        const totalPrice = res.data.totalPrice ? res.data.totalPrice : 0
        const topic_id =  res.data.topicId
        this.setData({
          payPrice: (totalPrice / 100).toFixed(2),
          higePage: false,
        },() => {
          this.getTopicInfo(topic_id);
          this.initData();
          this.initUserWelfare();
        });
      },
      err => {

      },
    );
  },

  goOrderList() {
    xmini.piwikEvent('c_orderlist');
    this.forward('order-list');
  },
  goContinue() {
    xmini.piwikEvent('c_backhp');
    this.forward('index');
  },
  setIsModulesLoading(flag) {
    this.setData({
      isModulesLoading: flag,
    })
  },
  getTopicInfo(code) {
    if (!code) {
      this.setIsModulesLoading(false);
      return;
    }
    this.setIsModulesLoading(true);
    api.getTopicInfo(
      {
        code,
      },
      res => {
        this.setIsModulesLoading(false);
        const { info } = res.data;
        const newModules = this.getModules(res);
        this.setData({
          modules: newModules,
          modules_bg_color: info.bg_color || ''
        })
      },
      err => {
        return true;
      }
    )
  },
  onShowAll(data){
    const { index,id,status } = data;
    const moduleIndex = this.data.modules.findIndex((item,index) => {return item.id == id});
    console.log(this.data, 'index data', moduleIndex);
    this.setData ({
      [`modules[${moduleIndex}].list[${index}].showupArrow`]: !status
    })
  },
  // 更新riskgo 信息
  updatedRiskgoData() {
    const that = this;
    // 获取riskgo
    this.getAlipayParams({
      scene: 2,  //场景值
      success(res) {
        console.log('getAlipayParams====success:',  res);
        that._data.riskgoData = res;
        console.log(that._data.riskgoData, 'riskgoData', res.data.riskResult);
        // let rankLevel = this.getRankVal(res.data);
        // console.log(rankLevel, 'rankLevel');
      },
      fail(err){
        console.log('getAlipayParams====err:', err);
      }
    })
  },
  //是否有可用的红包
  initUserWelfare(){
    api.getRedPacket(
      {
        orderId: this.data.id,
        scene: 'AlipayAddRedPacket',
      },
      res => {
        console.log('初始化红包信息', res);
        const { m_status = false , transfer_id = 0, cover_title = ''} = res.data;
        this.setData({
          packetPopStatus:m_status,
          welfare_id: transfer_id,
          cover_title,
        });
      },
      err => {
        // my.showToast({
        //   duration:3000,
        //   content:err.errmsg
        // });
        return true;
      }
    )
  },
  //拆红包
  openRedPacket(){
    const params = {
      orderId: this.data.id || 0,
      id: this.data.welfare_id,
    }; //拆红包需要展示的参数
    if(!params.id) return;
    api.openRedPacket(
        params,
      res => {
        const { is_used = false, money = 0 } = res.data;
        const redPacket = {
          isOpened: is_used,
          price: dealPrice(money),
        };
        this.setData({
          redPacket,
        });
      },
      err => {
        console.log(err,'err');
      }
    )
  },
  //关闭红包弹窗
  closePop(){
    this.setData({
      packetPopStatus: false,
    });
  }
});

