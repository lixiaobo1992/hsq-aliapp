import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
  pullList,
  mapTo,
  dealPrice,
} from '/utils';

const app = getApp();
xPage({
  ...mixins,
  ...pullList,
  data:{
    isLoading: true,
    pullLoading: false,
    showFooter: false,
    activity_detail:'',
    list: [],
    merchantId: 0,
    id: 0,
  },
  onLoad(query){
    this.onPageInit(query);
    const { merchantId = 138, id = 1 } = query;
    this.setData({
      merchantId:merchantId,
      id:id,
    });
  },
  onShow() {
    this.refresh();
  },
  onPullDownRefresh() {
    this.refresh();
  },
  refresh(){
    this.setData({
      isLoading: true,
    })
    this.initPullList();
    this.pullParams.activityId = this.data.id;
    this.pullParams.merchantId = this.data.merchantId;
    this.pullParams.scope = this;
    this.pullParams.weights =1;
    this.pullModel = api.getCollectProductList;
    // 主动触发加载事件
    this.onScrollToLower();
    console.log('refresh----------------------')
  },
  onUnload(){},
  dealList(list=[]){
    return mapTo(list, (item,index) => {
      return {
        ...this.dealItem(item),
        tags:this.dealTags(item.tags || []),
        market_price: dealPrice(item.market_price),
        price: dealPrice(item.price),
        expired_date_text: item.expired_date_text_one,
        member_price:dealPrice(item.member_price),
        'piwikName':'coudanaddbtn',//暂无
        'piwikData':{
          activityid:item.biz_id,
          merchantid:this.data.merchantId,
        },
      };
    });
  },
  //处理逻辑标签
  dealTags(tags){
    return tags;
  },
  //收缩/展开逻辑
  onShowAll(e){
    const { index } = e.currentTarget.dataset;
    const status = this.data.list[index].showupArrow;
    this.setData ({
      [`list[${index}].showupArrow`]: !status
    })
  },
  //处理item
  dealItem(item){
    return Object.assign(item, {showupArrow:true},{ arrowClick: item.tags.toString().length > 48});
  },
  afterPull(res) {
    const { activity_detail = ''} = res.data;
    this.setData({
      activity_detail,
      isLoading: false
    });
    // console.log(res);
    if (this.pullParams.pageNum == 1) {
      delete this.pullParams.scope;
      delete this.pullParams.weights;
    }
  },
  afterPullData() {
    this.setData({
      isLoading: false
    })
  },
  goDetail(e){
    console.log('去商详页',this.data);
    const { index } = e.currentTarget.dataset;
      const currentItem = this.data.list[index] || {};
      const { can_bought, link } = currentItem;
      console.log(currentItem,'currentItem');
      if (link) {
        this.onUrlPage(e);
      };
  },
  addCart(e){
    const { skuid = "" } = e.currentTarget.dataset;
    xmini.piwikEvent('coudanaddbtn',{
      activityid:this.data.activityid,
      merchantid:this.data.merchantid,
    });
    api.addSkuToCart(
      {
        type: 1,
        skuId: skuid,
        amount: 1,
      },
      res => {
        this.updateUserCart();
        my.showToast('添加购物车成功');
      }
    )
  },
  updateUserCart(){
    api.getUserCart(
      {
        isLoading: false,
      },
      res => {
        // this.setData({
        //   cartNumber: res.data.total_sku_cnt,
        // });
      },
      err =>{
        return true;
      }
    );
  }
});
