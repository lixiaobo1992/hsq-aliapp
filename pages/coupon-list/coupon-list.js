import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  mapTo,
  pullList,
  dealPrice,
} from '/utils/index';
import { formatDate } from '/utils/dateUtil';
import authMixin from '/utils/authMixin'

const couponType = [
  {
    name: '未使用',
    num: 0
  },
  {
    name: '已过期',
    num: 0
  },
  {
    name: '已使用',
    num: 0
  }
]

xPage({
  ...mixins,
  ...pullList,
  // 页面的初始数据
  data: {
    isLoading: true,

    list: [], // 优惠券列表
    showFooter: false,
    pullLoading: false,
    inputValue: '',

    type: 1,
    couponType,
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    this.onPageInit(options);
    this.refresh();
  },

  onUnload() {

  },

  refresh() {
    this.onFetchData();
  },

  onShow() {

    this.onMessage();
  },

  // 页面加载完成
  onReady() {

  },
  onTabTypeChange(e){
    const { type } = e.currentTarget.dataset;
    console.log('type:', type);
    this.setData({
      type,
    }, () => {
      this.refresh();
    })
  },
  // 优惠券列表
  onFetchData() {
    this.initPullList();
    // 1: 可使用 2: 已过期 3已使用
    this.pullParams.pageNum = 1
    this.pullParams.type= this.data.type; // 类型：1可用优惠券
    this.pullParams.scope = this;
    this.pullParams.weights = 1;
    this.pullModel = api.getUserCouponList;

    this.setData({
      isLoading: true,
    })
    // 主动触发加载事件
    this.onScrollToLower();
  },

  dealList(list = []){

    return (list || []).map((item, index) => {

      const usage_desc = (item.usage_desc || '').replace('\\r\\n', '\n');
      let status = 0;
      let btnText = '...'
      const {
        is_expired, //
        is_used,
      } = item;

      if(is_expired) {
        status = 2;
        btnText = '已过期'
      }
      if(is_used) {
        status = 3;
        btnText = '已使用'
      }
      if (!is_expired && !is_used) {
        status = 1;
        btnText = '立即使用'
      }

      return {
        ...item,
        value: dealPrice(item.value, 100, false),
        startStr: formatDate(item.start_at, 'Y.M.D'),
        endStr: formatDate(item.end_at, 'Y.M.D'),
        coupon_status: status,
        btnText,
        usage_desc,
        isShowRule: false, // 是否显示详细信息
        piwikEvent: 'c_use',
        piwikData: {
          id: item.coupon_id,
          name: item.title
        }
      }
    })
  },
  afterPull(res) {
    this.setData({
      isLoading: false
    })
    if (this.pullParams.pageNum != 1) return
    delete this.pullParams.scope;
    delete this.pullParams.weights;
    const { couponCnt } = res.data;
    this.setData({
      [`couponType[0].num`]:  couponCnt.avaliableCnt || 0,
      [`couponType[1].num`]:  couponCnt.expiredCnt || 0,
      [`couponType[2].num`]:  couponCnt.usedCnt || 0
    })
  },
  // 扫码
  onScan() {
    xmini.piwikEvent('c_scanadd');
    my.scan({
      success:(res) => {
        this.coderedeem(res.code);
      },
      fail:(err) => {
        if (err.error == 2001) {
          my.alert({
            title: "提示",
            content: "点击右上角的三个点，选择“关于”，点击关于页面右上角的三个点，选择“设置”，即可开启相机权限。",
            buttonText: "我知道了",
          });
        }
      },
    })
  },

  // 添加券码
  onSubmit(e) {
    const { code } = e.currentTarget.dataset;
    if (!code) {
      my.showToast('请输入活动码')
      return;
    }
    xmini.piwikEvent('c_addcoupon');
    this.coderedeem(code);
  },

  // 获取input value
  onInputValue(e) {
    this.setData({
      inputValue: e.detail.value,
    });
  },

  // 添加券码接口
  coderedeem(code) {

    api.addCoderedeem({
      code,
    }, (res) => {
      my.showToast('添加成功');
      this.onFetchData();
      this.setData({
        inputValue: '',
      });
    }, (err) => {
      if (err.errno === 510010 || err.errno === 210013) {
        const that = this;
        // 主动授权
        authMixin.userAuthLogin({
          authType: 'auth_user',
          success: (res) => {
            that.coderedeem(code)
          },
          fail: (err) => {
          }
        })
        return true;
      } else {
        my.hideLoading();
      }
    });
  },

  // 使用说明
  onDesc() {
    xmini.piwikEvent('c_info');
    this.forward('coupon-desc');
  },

  // 已失效优惠券
  // onInvalid() {
  //   xmini.piwikEvent('c_couponloseeffect');
  //   this.forward('coupon-invalid-list');
  // },

  // 详情信息
  onRule(e) {
    const { index, name } = e.currentTarget.dataset;
    xmini.piwikEvent('c_coupon_detail', {
      'index': index,
      name,
    });
    console.log(index);
    this.setData({
      [`list[${index}].isShowRule`]: !this.data.list[index].isShowRule,
    });
  },
});
