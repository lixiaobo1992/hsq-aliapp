
import { clone } from '../utils/objectUtil';
/**
 * API 命名规则
 * - 使用 camelCase 命名格式（小驼峰命名）
 * - 命名尽量对应 RESTful 风格，`${动作}${资源}`
 * - 假数据增加 fake 前缀
 * - 便捷易用大于规则，程序是给人看的
 */
let params = {};
let reqHeaders = {};

// api 列表
// https://dapi.cloudai.net/swagger-ui.html
export const modelApis = {
 // 初始化配置
  test: '/test',
  getConfig: '/common/initconfig',
  // 积分兑换
  getPointIndex: '/point/index',
  getPointList: '/point/skulist',
  getPointDetail: '/point/iteminfo',
  getProductDetail: '/product/productdetail',
  getRList: '/point/recommenditems',
  // 专题
  getPointTopicInfo: '/point/topicinfo',
  getPointTopicList: '/point/topicbuskulist',
  getSpecialTopic: '/market/specialtopiccomponentinfo',
  getSpecialSkuList: '/market/specialtopiccomponentgroupskulist',

  // 普通商品
  getItemInfo: '/product/iteminfo',

  // formId
  formidSubmit: 'POST /market/formid/submit',
  // 主站专题
  getTopicInfo: '/product/topicskusinfo',
  getTopicList: '/product/topicskulist',
  // 个人中心
  getProfile: '/user/usercenter',
  getRecommendlist:'/common/getdatasourceinfo',
  // 拼团相关
  getCoupleList: '/product/coupleskulist',
  getCoupleListV1: '/product/coupleskulist_v1',
  getCoupleDetail: '/product/coupleskudetail',
  getMerchantList: '/merchant/coupleskulist',       // 店铺商品列表用的也是这个
  coupleOrderInit: 'POST /order/coupleorderinit',
  coupleOrderList: '/user/usercouplelist',
  coupleOrderDetail: '/user/usercoupleorderdetail',
  coupleUserList: '/market/pinactivitiesuserlist', // 分享页拼团头像列表
  coupleShareDetail: '/user/coupleactivitiedetail', // 分享详情
  coupleRecommend: '/user/recommendpinactivities', // 拼团推荐位
  coupleSearchlist: '/market/pinactivitiessearch', // 拼团搜索、分类结果页

  // getCategoryList:'/category/categoryList', //分类列表
  getCategoryList:'/category/categorylist_v1', //分类列表
  getCategoryAd: '/category/categoryadlist', // 获取分类下的banner

  // 首页
  // getIndex: '/common/index_v1',
  getIndex: '/common/index_v2',
  getRecentpinevents: '/common/recentpinevents', // 首页顶部浮动轮播消息
  // 助力免单
  assistanceDetail: '/activity/assistanceitemdetail',
  assistanceSubscribe: 'POST /activity/subscribe',
  assistanceComplaintType:'/activity/assistancecomplainttype',
  addAssistanceComplaint: '/activity/addassistancecomplaint',
  assistanceuserskuList:'/activity/assistanceuserskulist', // 我的免单
  assistanceskuList:'/activity/assistanceskulist', // 助力商品列表
  subscribeZl:'POST /activity/subscribe', // 订阅助力
  assistanceEventDetail:'/activity/assistanceeventdetail', // 创建助力 or 获取助力
  assistanceShareInfo:'POST /activity/assistanceshareinfo', // 获取分享图片信息
  assistanceOrderInit: 'POST /tradecenter/assistanceorderinit', // 助力免单订单初始化
  assistanceOrderSubmit: 'POST /tradecenter/assistanceordersubmit', // 助力免单订单提交
  alipayEventBack:'POST /assistance/alipayeventback', // 帮忙助力

  // 主流程
  orderInit: 'POST /order/orderinit',
  orderSubmit: 'POST /order/submitorder',
  orderCheck:'POST /order/ordersharediscountcheck', //订单检测

  orderPay: 'POST /order/orderpay',
  orderPayConfirm: '/order/orderpayconfirm', // 确认支付状态
  getUserOrders: '/order/getuserorders', // 订单列表
  getNeedCommentOrders: '/order/waitcommentlist', // 待评论
  getUserRefundorders: '/order/userrefundorder', // 退款
  getUserServiceOrders: '/order/userserviceorders', // 售后
  orderCancel: 'POST /order/cancelorder', // 取消订单
  orderDetail: '/order/orderdetail', // 订单详情
  subOrderInfo: '/tradecenter/suborderinfo', // 子订单详情
  confirmReceived: 'POST /order/userorderconfirm', // 确认收货
  orderComplaint: 'POST /refund/complaint', // 订单申诉
  removeLikeProduct: 'POST /user/unlikeproduct', // 取消收藏商品
  addLikeProduct: 'POST /user/likeproduct', // 收藏商品
  getFavoriteList: '/user/likeproductlist', // 收藏商品列表

  orderInit_v1: 'POST /order/orderinit_v1', // 单独够 订单初始化
  orderSubmit_v1: 'POST /order/submitorder_v1', // 提交订单

  checkDelivery: '/product/checkdelivery', //查询运费信息

  // 优惠券
  checkPromotion: '/order/checkpromotion',   // 确认订单-选择优惠券
  getUserCouponList: '/user/couponlist',     // 我的优惠券列表
  getCouponInfo: '/user/getcouponinfo',      // 获取用户领用的优惠券
  addCoderedeem: 'POST /reward/coderedeem',  // 添加优惠券码
  couponRedeem: 'POST /coupon/couponredeem',  // 添加优惠券
  getCouponSkuList: '/coupon/couponskulist', // 单品sku列表
  getHotSearch: '/common/hotsearchsug',      // 热门搜索
  getSearchSuggest: '/market/searchsuggest',  //搜索建议
  getMerchantCouponlist: '/reward/merchantcouponlist', //优惠券列表
  codeRedeem:'POST /reward/coderedeem', //券码核销

  // 积分订单相关
  pointOrderInit: 'POST /tradecenter/pointorderpreview',
  pointOrderSubmit: 'POST /tradecenter/pointordersubmit',
  pointOrderCancel: 'POST /tradecenter/ordercancel',
  pointOrderList: '/tradecenter/orderlist',
  pointOrderDetail: '/tradecenter/orderinfo',
  pointOrderSuccess: '/tradecenter/ordersuccess',

  // 退款相关
  refundInit: '/refund/init',
  refundDetail: '/refund/detail',
  refundApply: 'POST /refund/apply',
  // 登录注销
  login: 'POST /user/login',
  logout: 'POST /user/logout',
  // 地址管理
  addressList: '/user/addresslist',
  addAddress: 'POST /user/addaddress',
  updateAddress: 'POST /user/updateaddress',
  setDefaultAddress: 'POST /user/setdefaultaddress',
  deleteAddress: 'POST /user/deleteaddress',
  provinceList: '/nation/provincelist',
  cityList: '/nation/citylist',
  districtList: '/nation/districtlist',
  getCityId: '/common/gpstogeo',
  // 查看物流
  getDelivery: '/order/deliverymessage',
  // 获取七牛 token
  getQiniuToken: '/common/qiniutoken',
  // 获取店铺信息
  getMerchantInfo: '/merchant/merchantinfo',
  // 收藏店铺
  userLikeMerchat:'POST /user/likemerchant',
  // 取消店铺收藏
  removeLikeMerchat: 'POST /user/unlikemerchant',
  // 获取公告
  getListMsgboard:'/msgboard/getlistmsgboard',
  // 获取首页自定义弹窗
  getServiceConfig: '/common/serviceconfig',
  getUdesk: '/user/getudesk',
  getOpenIm: 'POST /udesk/openim',

  // 轻会员
  getMemberInfo: '/user/lightmemberdetail',    // 获取用户轻会员信息
  getMemberStatus: '/user/lightmemberinfo',    //获取用户轻会员状态
  getMemberCenter: '/user/lightmembercenter',
  receiveMemberCoupon: 'POST /user/lightmemberbenefitexchange', // 领取会员券
  updatedMemberStatus: '/user/lightmembersync', // 轻会员状态异步回调

  getLightmembercouponlist:'/coupon/lightmembercouponlist', // 下单时可领优惠券列

  getTopicInfo: '/market/specialtopic/topicinfo', // 获取专题信息
  requestErrTest: '/alibaba/alibabacallback',
  setActivitySubscribe: 'POST /activity/subscribe',  // 活动消息提醒

  setMemberDiscount:'/user/lightmemberdiscount', // 商详页轻会员信息

  // 购物车接口
  getOrderResult: '/tradecenter/ordersuccess_v1', // 普通订单完成回调

  addSkuToCart: 'POST /user/addskutocartv1',                 // 添加到购物车和购物车数量修改
  removeInvalidCartSku: 'POST /user/removeinvalidcartsku',   // 清空失效商品
  deleteCartSku: 'POST /user/deletecartskuv1',               // 删除购物车商品
  getUserCart: '/user/getusercartv1',                        // 获取购物车数据
  editCartSku: 'POST /user/editcartsku',                     // 修改购物车sku规格接口
  getCanChooseSku: '/user/getcanchoosesku',                  // 购物车获取sku可选规格
  getNewActivityStauts: '/activity/selectedskusfullreduce', // 获取最新的购物车活动状态

  // 测试支付宝营销反作弊
  getAlipayParams: '/user/riskpreventcheat',
  // 增加及更新用户等级
  addUserGrade: 'POST /user/addusergrade',
  getRiskAdInfo:'/product/riskbanner', // 获取riskgo 广告
  syncAlipayRisk: '/user/syncalipayrisk', // 风险商户数据同步

  getCollectProductList: '/product/collectbillsfullreducelist',//凑单列表
  //红包接口
  getRedPacket:'/welfare/getusewelfare', //获取可使用的红包
  openRedPacket: 'POST /welfare/editwelfarestatus', //拆红包

};

export const commonParams = {
  init(data) {
    params = clone(data);
  },
  set(obj) {
    Object.assign(params, obj);
  },
  get(key) {
    return key ? clone(params[key]) : clone(params);
  },
};

export const headers = {
  init(data) {
    reqHeaders = clone(data);
  },
  set(obj) {
    Object.assign(reqHeaders, obj);
  },
  get(key) {
    return key ? clone(reqHeaders[key]) : clone(reqHeaders);
  },
};

const apiConfig = {
  modelApis,
  commonParams,
  headers,
};

export default apiConfig;
