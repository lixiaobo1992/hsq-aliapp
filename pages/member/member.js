import {
  me,
  xmini,
  mapState,
  mapActions,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  pullList,
  dealPrice,
} from '/utils';
import authMixin from '/utils/authMixin';
import AParse from '../../aparse/aParse';
import memberMixin from '/utils/memberMixin';

const app = getApp()

// 开卡提示
const openCardTip = ['会员到期未回本可退还差价', '次月需主动开卡，可随时取消，未回本可退还差价'];

const vipRightsList = [
  {
    icon: 'https://img1.haoshiqi.net/miniapp/icon-vip01_4093b8397a.png',
    lable: '25元红包',
    title: '天天送神券',
    content: '开通会员后每天专享会员券领不停'
  },
  {
    icon: 'https://img1.haoshiqi.net/miniapp/icon-vip02_71fae0fe2e.png',
    lable: '最低1.9试吃',
    title: '包邮试吃',
    content: '会员期内可领取至少1张试吃券'
  },
  {
    icon: 'https://img1.haoshiqi.net/miniapp/icon-vip08_b1b3e0caef.png',
    lable: '5元话费券',
    title: '话费福利',
    content: '会员期内可领取1张5元话费充值券'
  },
  {
    icon: 'https://img1.haoshiqi.net/miniapp/icon-vip03_a6d2f7ba00.png',
    lable: '会员价',
    title: '每周五更新',
    content: '专享价是百万会员价在商城价格基础上的专享低价，以超低价格让利给优享会员'
  },
  {
    icon: 'https://img1.haoshiqi.net/miniapp/icon-vip04_f73b4c41a6.png',
    lable: '包邮',
    title: '全场通用',
    content: '全场单件商品免运费'
  },
  {
    icon: 'https://img1.haoshiqi.net/miniapp/icon-vip05_59374e7c55.png',
    lable: '0元购',
    title: '下单免费送',
    content: '每次购物满支付金额29元可抽奖一次，100%中奖'
  },
  {
    icon: 'https://img1.haoshiqi.net/miniapp/icon-vip06_fb40bab207.png',
    lable: '品牌折扣',
    title: '最低享受95折',
    content: '品牌折扣是在商城价格基础上的专享折上折，买得多赚得多'
  },
  {
    icon: 'https://img1.haoshiqi.net/miniapp/icon-vip07_58874fdb9a.png',
    lable: '会员日',
    title: '专属购物节',
    content: '每月10-12日是“会员购物节”，内含有更多的福利可领取'
  },
  {
    icon: 'https://img1.haoshiqi.net/miniapp/icon-vip09_df7b0db242.png',
    lable: '退差价',
    title: '先享后付',
    content: '在会员有效期内未回本（节省优惠金额不足当次开卡价格），结束后会自动退还差价至花呗额度'
  },
  {
    icon: 'https://img1.haoshiqi.net/miniapp/icon-vip10_2db0ebbca7.png',
    lable: '敬请期待',
    title: '敬请期待',
    content: '敬请期待'
  },

]

xPage({
  ...mixins,
  ...pullList,
  ...memberMixin,
  _data: {
    recommend_source_id: 0,
    template_id: 0, // 开通会员后会有一个 template_id

    is_refresh: false,
  },
  data: {
    isLoading: true,

    shareInfo: true,
    isShowOpenPopup: false, // 开通提示弹窗
    isShowRulePopup: false, // 规则弹窗

    openCardTip, // 开卡提示

    isMember: false, // 用户是否是会员
    isShowOpenBtn: false, // 是否显示底部开通按钮

    userCardInfo: {
      userName: '...',
      userAvatar: '',
      is_new_member: true, // 是否是新会员 true 新会员 false 不是新会员
      open_offer: 0, // 开通优惠
      member_use_day: 0, // 会员享受天数
      member_save_amount: 0, // 累计已省金额
      member_end_time: '', // 会员到期时间
    },

    cardListData: [],
    // rightsFirstListData: [], // 会开通会员时只展示 每个权益的首期券
    currentRightsIndex: 0, // 当前权益下标

    rightsListData: [],

    total_coupon: 0, // 总领券金额

    currentVipRightIndex: 0,
    vipRightsList,

    modules: [],
    isModulesLoading: true,
    modules_bg_color: '#fff',

    ...mapState({
      logged: state => state.user.logged,
      userInfo: state => state.user.userInfo,
    })
  },
  ...mapActions(['setUserInfo']),
  onLoad(query) {
    this.onPageInit(query);
    this._data.is_refresh = true;
  },

  onUnload() {

  },

  onShow() {
    // console.log('SDKVersion:', my.SDKVersion);
    if (this._data.is_refresh) {
      this._data.is_refresh = false
      this.refresh();
    }
    // const systemInfo = me.$getSystemInfo();
    // console.log('=============systemInfo',systemInfo);
    // my.getSystemInfo({
    //   success: (res) => {
    //     console.log('=========new====systemInfo',res);
    //   }
    // })
  },
  refresh() {
    const that = this;
    my.showLoading();
    if (!this.data.logged) {
      app.onSubscribeEvent(this, 'LOGIN_SUCCESS', function(){
        that.refresh()
      })
    } else {
      this.getMemberCenter();
    }
  },
  onPullDownRefresh() {
    this.refresh()
  },
  // 会员权益切换
  viprightsChange(e) {
    const { index } = e.currentTarget.dataset;
    if (this.data.currentVipRightIndex == index) return;
    this.setData({
      currentVipRightIndex: index,
    })
  },
  memberScroll(e){
    // console.log(e);
    const { scrollTop = 0 } = e.detail;
    const { isMember, isShowOpenBtn } = this.data;
    if (!isMember) {
      if (scrollTop > 410 && !isShowOpenBtn) {
        this.setData({
          isShowOpenBtn: true
        })
      } else if(scrollTop < 410 && isShowOpenBtn) {
        this.setData({
          isShowOpenBtn: false
        })
      }
    }
  },
  // 领取权益券
  receiveCouponEvent(e) {

    // console.log(e)
    const { index, rightsIndex } = e.currentTarget.dataset;
    const { rightsListData } = this.data;
    const { currentIndex = 0, list = [], user_benefit_Id } = rightsListData[rightsIndex]
    const currentData = list[currentIndex].list[index];
    xmini.piwikEvent('c_member_geticket', {
      user_benefit_Id,
      coupon_code: currentData.coupon_code,
      index,
    });
    // console.log(user_benefit_Id);
    // console.log(currentData);
    if (currentData.status.statusCode != 0) {
      return;
    }
    const params = {
      serialNo: this._data.center_request_no,
      benefitId: user_benefit_Id,
      activityCode: currentData.reward_code,
    }
    api.receiveMemberCoupon(
      params,
      res => {
        console.log(res);
        my.showToast('优惠券领取成功，快去使用吧！');
        if (!currentData.is_allow_repeat_exchange) {
          const newStatus = {
            text: '已领取',
            className: '',
            statusCode: 1,
          }
          this.setData({
            [`rightsListData[${rightsIndex}].list[${currentIndex}].list[${index}].status`]: newStatus,
          })
        }
      },
      err => {

      }
    )
  },
  // 权益周期切换
  rightsTabBtnEvent(e) {
    const { index, rightsIndex } = e.currentTarget.dataset;

    const { currentIndex } = this.data.rightsListData[rightsIndex];
    xmini.piwikEvent('c_member_cycle4');
    my.showLoading();
    this.setData({
      [`rightsListData[${rightsIndex}].currentIndex`]: index,
    }, ()=> {
      my.hideLoading();
    })
  },
  // 显示|隐藏提示弹窗
  setShowPopup(e) {
    // console.log(e);
    const { type } = e.currentTarget.dataset;
    if (type == 'open') {
      xmini.piwikEvent('c_member_ticket');
      this.setData({
        isShowOpenPopup: !this.data.isShowOpenPopup
      })
    } else if(type=='rule') {
      xmini.piwikEvent('c_memberrules');
      this.setData({
        isShowRulePopup: !this.data.isShowRulePopup
      })
    }
  },
  // 打开插件
  openBtnEvent(e) {
    console.log('openBtnEvent:', e);
    // type: entr 已开通点管理  card 页面中心开通按钮 card1 底部浮窗开通按钮 card2 弹窗上开通按钮
    const { type = 'card' } = e.currentTarget.dataset;
    const { cardListData = [], currentRightsIndex = 0, isMember } = this.data;
    let template_id = '';
    if (type == 'card' || type == 'card1' || type == 'card2') {
      const currentCard = cardListData[currentRightsIndex];
      template_id = currentCard.template_id;

      if (type == 'card') {
        xmini.piwikEvent('c_member_get');
      }
      if (type == 'card1') {
        xmini.piwikEvent('c_member_get2');
      }
      if (type == 'card2') {
        xmini.piwikEvent('c_member_get3');
      }

    } else if(type == 'entr') {
      template_id = this._data.template_id;
      xmini.piwikEvent('c_member_manage');
    }

    if (!template_id) return;
    // 隐藏提示弹窗
    this.setData({
      isShowOpenPopup: false,
    })
    this._data.is_refresh = true;
    this.getMemberPluginInfo({
      templateId: template_id,
      memberStatus: isMember
    });
  },
  // 切换卡片
  changeCardEvent(e) {
    const { index } = e.currentTarget.dataset;
    const { cardListData = [], currentRightsIndex = 0 } = this.data;
    const currentCard = cardListData[index];

    if (index == currentRightsIndex) return;

    xmini.piwikEvent(`c_member_cycle${index+1}`);
    my.showLoading();
    this.setData({
      currentRightsIndex: index,
    }, () => {
      my.hideLoading();
    })
  },
  // 获取底部推荐品
  getRecommendList() {
    this.initPullList();
    this.pullParams.sourceId = this._data.recommend_source_id;
    this.pullModel = api.getRecommendlist;
    this.onScrollToLower();
  },
  getMemberCenter() {
    this.setData({
      isLoading: true,
    })
    api.getMemberCenter(
      {
        scope: this,
        weights: 1,
      },
      res => {
        // console.log(res);
        my.stopPullDownRefresh();
        const { user_info = {}, list = [], recommend_source_id, topic_id, total_coupon } = res.data;

        this._data.recommend_source_id = recommend_source_id; // 底部推荐列表

        let isMember = false; // 是否开通会员

        const userCardInfo = {
          userName: user_info.username,
          userAvatar: user_info.avatar,
          is_new_member: Boolean(user_info.is_new_member)
        };

        let dealSuccess = {};
        // 用户是否是会员
        if (user_info.agreement_status) {
          const { performed_day = 0, total_discount_amount = 0, expire_date, center_request_no, agreement_template_id} = user_info;
          isMember = true;
          userCardInfo.member_use_day = performed_day; // 会员享受天数
          userCardInfo.member_save_amount = dealPrice(total_discount_amount, 100, false); // 累计已省金额
          userCardInfo.member_end_time = expire_date; // 会员到期时间

          // 不参与ui 渲染的值不需要放到data内
          this._data.center_request_no = center_request_no;
          this._data.template_id = agreement_template_id

          dealSuccess = this.dealRightsListData(list.gift_list)
        } else {
          // userCardInfo.open_offer = dealPrice(user_info.discount, 100, false) || 0; // 开通优惠
          userCardInfo.total_coupon = total_coupon;

          dealSuccess = this.dealNotOpenRightsListData(list);

        }
        this.setData({
          isLoading: false,
          isMember,
          userCardInfo,
          ...dealSuccess,
        }, () => {

        });

        const that = this;
        const tempDetail = res.data.lm_copy_write;
        AParse.aParse('data', 'html', tempDetail, that, 10, 'detail');
        // 做了一点优化
        const time = (dealSuccess.rightsListData || []).length ? 0 : 500
        setTimeout(function() {
          // 获取底部推荐品
          that.getRecommendList();
          that.getTopicInfo(topic_id);
        }, time)
      },
      err => {
        my.stopPullDownRefresh();
        // console.log(err);
        const that = this;
        if (err.errno === 510010) {
          authMixin.userAuthLogin({
            authType: 'auth_base',
            success: (res) => {
              //从新获取用户信息 会死循环吗
              that.refresh()
            },
            fail: (err) => {
              this.back();
            }
          })
          return;
        }
      }
    )
  },
  // 处理未开通会员展示的券列表
  dealNotOpenRightsListData(rightsList = []) {
    let currentRightsIndex = 0;
    const cardType = {
      '1': '轻会员周卡',
      '2': '轻会员月卡',
      '3': '轻会员季卡',
    }
    const cardListData = [];
    const rightsListData = (rightsList || []).map((item, index) => {
      if (item.is_checked_template) {
        currentRightsIndex = index; // 后台返回当前选中的卡
      }
      const tempCardData = {
        ...item,
        price: dealPrice(item.price,100,false),
        market_price: dealPrice(item.market_price,100, false),
        template_type_name: cardType[item.template_type],
        discount: dealPrice(item.discount, 100, false),
      }
      delete tempCardData.gift_list
      cardListData.push(tempCardData);

      // console.log('item:', item);
      return (item.gift_list || []).map((childItem, childIndex) => {

        const tempList = (childItem.list || []).map((coupon, subIndex) => {
          // console.log('coupon:',coupon);
          return {
            ...coupon,
            value: coupon.value / 100,
          }
        })

        return {
          ...childItem,
          list: tempList
        }
      });
    })

    return {
      currentRightsIndex, // 当前选择
      cardListData,
      rightsListData,
    }
  },
  // 处理已开通会员展示的券列表
  dealRightsListData(list = []) {
    const statusText = {
      '0': {
        text: '立即领取',
        className: ''
      },
      '1': {
        text: '已领取',
        className: ''
      },
      '2': {
        text: '已失效',
        className: 'invalid'
      },
      '3': {
        text: '待领取',
        className: 'wait'
      },
    }
    const rightsListData = (list || []).map((item, index) => {
      let currentIndex = 0;
      const tempList = (item.list || []).map((childItem, childIndex) => {
        if (childItem.is_current) {
          currentIndex = childIndex;
        }
        return {
          ...childItem,
          list: (childItem.list || []).map((coupon, subIndex) => {
            return {
              ...coupon,
              value: coupon.value / 100,
              status: {
                statusCode: coupon.status,
                ...statusText[coupon.status]
              },
            }
          })
        }
      })

      return {
        ...item,
        currentIndex,
        list: tempList
      }
    })

    return {
      rightsListData,
    }
  },

  dealList(list = []) {
    // console.log(list)
    return (list || []).map((item, index) => {
      // console.log(item,'item')
      return {
        ...item,
        tags: (item.tags || []).splice(0, 2),
        market_price: dealPrice(item.market_price),
        price: this.productPrice(dealPrice(item.price)),
        light_member_price: dealPrice(item.light_member_price),
        // link: `https://m.haoshiqi.net/v2/couple-detail?id=${item.biz_id}`,
        piwikEvent: 'c_member_inviteproduct',
        piwikData: {
          url: item.link,
          index,
          pin_id: item.pin_id
        }
      };
    });
  },
  productPrice(price) {
    let priceArray = price.split('.');
    return {
      price_yuan: priceArray[0],
      price_fen: priceArray[1],
    };
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
        // console.log('newModules', newModules);
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
  getModules(res) {
    const { data, timestamp } = res;
    const types = [
      'c-img',
      'c-img-hor',
      'c-swiper',
      'c-category',
      'c-tofu',
      'c-product-col1',
      'c-product-col2',
      'c-product-col3',
      'c-product-slider',
      // 'c-product-seckill'
    ]
    const tempList = (data.list || []).filter(item => {
      return types.includes(item.type);
    })
    // 添加 模块 id
    let tempObj = {};
    tempList.forEach((item) => {
      if (!item.id) {
        if (!tempObj[item.type]) {
          tempObj[item.type] = 1;
        } else {
          tempObj[item.type] = tempObj[item.type] + 1
        }
        item.id = item.type + '_' + tempObj[item.type];
      }
    });
    // 遍历 list
    let Modules = tempList.map((item, index) => {

      let moduleItem = {
        ...item,
      }
      switch(item.type) {
        case 'c-img':
          return Object.assign(moduleItem, this.dealCImg(item));
        case 'c-img-hor':
          return Object.assign(moduleItem, this.dealCImg(item));
        case 'c-swiper':
          return Object.assign(moduleItem, this.dealCSwiper(item));
        case 'c-category':
          return Object.assign(moduleItem, this.dealCImg(item));
        case 'c-tofu':
          return Object.assign(moduleItem, this.dealCImg(item));
        case 'c-product-col1':
          return Object.assign(moduleItem, this.dealCProduct(item));
        case 'c-product-col2':
          return Object.assign(moduleItem, this.dealCProduct(item));
        case 'c-product-col3':
          return Object.assign(moduleItem, this.dealCProduct(item));
        case 'c-product-slider':
          return Object.assign(moduleItem, this.dealCProduct(item));
        default:
          return moduleItem;
      }
    });
    // console.log(Modules)
    return Modules
  },
  dealCImg(item){
    return {
      list: this.dealImgs(item.list, item.type, item)
    }
  },
  dealCSwiper(item) {
    const list = this.dealImgs(item.list, item.type, item);
    return {
      activeColor: '#f00',
      circular: true, // 是否是无限滑动
      list: list,
      // height: this.calculateModuleHeight(+item.width || 0, +item.height || 0),
    }
  },
  // 处理商品数据
  dealCProduct(item) {
    return {
      list: this.dealProductList(item),
    };
  },
  // 处理商品列表数据
  dealProductList(moduleItem) {
    const list = moduleItem.list || [];
    return list.map((item,index) => {
      let retaData = parseInt(((item.all_stock - item.left_stock) / item.all_stock) * 100);
      return {
        ...item,
        tags: (item.tags || []).splice(0, 2),
        market_price: (item.market_price / 100).toFixed(2),
        price: this.productPrice((item.price / 100).toFixed(2)),
        light_member_price: dealPrice(item.light_member_price),
        rate_percent: retaData,
        //添加埋点信息
        piwikEvent: item.id,
        piwikData:{
          index,
          link: item.link,
        }
      };
    });
  },
  // 统一处理图片
  dealImgs(list = [], piwikName, moduleItem) {
    return list.map((item, index) => {
      return {
        ...item,
        'piwikEvent': piwikName,
        'piwikData': {
          index: item.id || index,
          url: item.link,
        }
      }
    })
  },
});
