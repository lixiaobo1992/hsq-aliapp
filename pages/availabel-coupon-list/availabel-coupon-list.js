import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  dealPrice,
} from '/utils/index';
import { formatDate } from '/utils/dateUtil';
import memberMixin from '/utils/memberMixin';
import { clone } from '/utils/objectUtil';

const app = getApp();

xPage({
  ...mixins,
  ...memberMixin,
  /**
   * 页面的初始数据
   */
  _data: {
    template_id: 0,
  },
  data: {
    isShowOpenPopup: false, //
    isShowMemberCoupon: false, // 是否显示轻会员优惠券信息
    memberCouponListData: [], // 当前可用轻会员券列表

    member_price: 0, // 轻会员卡的价格
    member_discount: 0,

    listData: [],          // 可用优惠券列表  已处理数据
    // availabelList: [], // 可用优惠券列表  未处理数据
    // info: {},          // 使用优惠金额相关信息
    ...mapState({
      // logged: state => state.user.logged,
      // userInfo: state => state.user.userInfo,
      currentCoupon: state => state.order_commit.currentCoupon,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (query) {
    this.onPageInit(query);



  },

  onShow() {
    const { couponList } = xmini.store.state.order_commit;
    if (couponList.length) {
      const listData = this.dealList(couponList);
      this.setData({
        listData,
      })
    }

    if (['single', 'couple'].includes(this.pageQuery.source) && this.pageQuery.coupon_type == 2) {
      this.setData({
        isShowMemberCoupon: true,
      })
      this.getMemberCoupon();
    }
  },

  onUnload() {

  },
  gotoMember() {
    xmini.piwikEvent('c_membercentre_youhui');
    this.forward('member', {});
  },
  // 显示|隐藏提示弹窗
  setShowPopup(e) {
    this.setData({
      isShowOpenPopup: !this.data.isShowOpenPopup
    })
  },
  // 打开插件
  openBtnEvent(e) {
    console.log('openBtnEvent:', e);
    // type: entr 已开通点管理  card 页面中心开通按钮 card1 底部浮窗开通按钮 card2 弹窗上开通按钮
    xmini.piwikEvent('c_youhui_get4');
    let template_id = this._data.template_id;

    if (!template_id) return;
    // 隐藏提示弹窗
    this.setData({
      isShowOpenPopup: false,
    })
    this.getMemberPluginInfo({
      templateId: template_id,
      memberStatus: false, // 用户不是会员
    });
  },
  // 领取权益券
  receiveCouponEvent(e) {
    const { index } = e.currentTarget.dataset;

    if (!this._data.is_light_member) {
      // 获取轻会员状态
      api.getMemberStatus({}, (res) => {
        const { agreement_status } = res.data;
        if (agreement_status == 1) {
          this._data.is_light_member = true;
          this.receiveCouponEvent(e);
        } else {
          xmini.piwikEvent('c_member_duihuan');

          this.setData({
            isShowOpenPopup: true
          })
        }
      })
      return;
    }

    xmini.piwikEvent('c_member_duihuan');

    const memberCouponListData = clone(this.data.memberCouponListData);
    const currentData = memberCouponListData[index] || {};

    // if (currentData.status.statusCode != 0) {
    //   return;
    // }

    const params = {
      serialNo: currentData.serial_no,
      benefitId: currentData.benefit_id,
      activityCode: currentData.activity_code,

      isShowDetail: 1,
    }
    api.receiveMemberCoupon(
      params,
      res => {
        console.log(res);
        my.showToast('优惠券领取成功，快去使用吧！');
        if (!currentData.is_allow_repeat_exchange) {
          // ==1 代表还可以继续领取

          memberCouponListData.splice(index,1);

          this.setData({
            memberCouponListData,
          });
        }

        const { coupon_list = [] } = res.data;

        if (coupon_list && coupon_list.length) {

          const { couponList } = xmini.store.state.order_commit;

          const newCouponList = [].concat(couponList, coupon_list);
          // 排序
          newCouponList.sort((a, b) =>{
            return b.value - a.value;
          })
          xmini.store.dispatch('setSelectCouponList', newCouponList);

          // 选择优惠金额最大的券
          const selectCouponEvent = {
            currentTarget: {
              dataset: {
                index: 0,
                tag: 1
              }
            }
          }

          this.onSelectedCoupon(selectCouponEvent);

          if (newCouponList.length) {
            const listData = this.dealList(newCouponList);
            this.setData({
              listData,
            })
          }
        }
      },
      err => {
        //
        // if (err.errno == 920100202){
        //   memberCouponListData.splice(index,1);
        //   this.setData(
        //     memberCouponListData,
        //   );
        // }
      }
    )
  },
  getMemberCoupon() {
    my.showLoading();
    api.getLightmembercouponlist({
      isLoading: false,
      price: this.pageQuery.price || 0,
    }, (res) => {
      console.log(res);
      const { list = [], template_id, is_light_member = false, member_price = 0, member_discount = 0 } = res.data;
      const memberCouponListData = (res.data.list || []).map((item, index) => {
        return {
          ...item,
          value: dealPrice(item.value, 100, false),
        };
      })
      this._data.template_id = template_id;
      this._data.is_light_member = is_light_member;
      this.setData({
        memberCouponListData,
        member_price: dealPrice(member_price, 100, false),
        member_discount: dealPrice(member_discount, 100, false),
      }, () => {
        my.hideLoading();
      })
    })
  },

  // 选择优惠券
  onSelectedCoupon(e) {
    const { index, tag = 0 } = e.currentTarget.dataset;
    const { couponList, currentCoupon } = xmini.store.state.order_commit;
    let tempCurrentCoupon = couponList[index] || {};

    // tag 选择来源，0用户主动选择 1领券后自动选择
    if (!tag && currentCoupon && currentCoupon.coupon_code == tempCurrentCoupon.coupon_code) {
      tempCurrentCoupon = {}
    }
    console.log('tempCurrentCoupon: ', tempCurrentCoupon)
    xmini.store.dispatch('setCurrentCoupon', tempCurrentCoupon);
  },
  // dealwith data
  dealList(list = []){
    return (list || []).map((item, index) => {
      return {
        ...item,
        value: dealPrice(item.value, 100, false),
        // startStr: formatDate(item.start_at, 'Y.M.D'),
        // endStr: formatDate(item.end_at, 'Y.M.D'),
      }
    })
  },
  // 确定
  onConfirm(e) {
    this.back();
  },
});
