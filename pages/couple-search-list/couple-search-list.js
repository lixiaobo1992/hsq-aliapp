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
  dealPrice
} from '/utils/index';
import { clone } from '/utils/objectUtil';

const app = getApp();

const sortIcons = {
  normal: 'https://img1.haoshiqi.net/miniapp/couple-search-list/category_normal_edc58e8934.png',
  select: 'https://img1.haoshiqi.net/miniapp/couple-search-list/icon_selected_f4e98109b4.png',
  active: 'https://img1.haoshiqi.net/miniapp/couple-search-list/category_down_60852c36b2.png',
  disabled: 'https://img1.haoshiqi.net/miniapp/couple-search-list/category_disabled_533c061ded.png',
}
let paramers
let tabSelected;

const tabs = [
  {
    id: 0,
    name:'综合排序',
    sort: '',
    sortType:'',
    isIcon: true,
  },
  {
    name: '销量',
    sort: 'selled',
    sortType:'',
    isIcon: false,
  }
]
const sortArray = [
  {
    id: 0,
    name:'综合排序',
    sort: '',
    sortType:''
  },
  {
    id: 1,
    name: '价格从低到高',
    sort: 'price',
    sortType: '0'
  },
  {
    id: 2,
    name: '价格从高到低',
    sort: 'price',
    sortType: '1'
  }
]



xPage({
  ...mixins,
  ...pullList,
  /**
   * 页面的初始数据
   */

  currentChooseIndex: 0,
  currentChoose:{
    id: 0,
    name:'综合排序',
    sort: '',
    sortType:'',
    isIcon: true,
  },
  data: {
    isLoading: true,

    list: [],
    showFooter: false,
    listMode: 'card',
    pullLoading: false,

    sortIcons,
    tabs,
    sortArray,

    currentChooseIndex: 0,
    showSort: false,    // 是否显示综合排序选择项页面

    tab: [
      {
        text:"综合",
      },
      {
        text:"价格",
        topImg: sortIcons.normal,
        botImg: sortIcons.active,
      },
      {
        text:'折扣',
        topImg: sortIcons.normal,
        botImg: sortIcons.active,
      }
    ],
    lastTab: {
      text: '效期',
      botImg: sortIcons.normal,
      topImg: sortIcons.active,
    },
    sort: ["全部", "1个月效期", "2~3个月效期", "4~5个月效期", "6个月及以上效期"],
    icons: sortIcons.normal,
    expiryIndex: 0,
    categoryIndex: -1,
    iconSelected: sortIcons.select,
    sortClickIndex: 0,
    viewId: '',
    clickIndex: 0,
    recommendList: [],                       //推荐商品
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(query) {
    console.log(query,'search-query')
    tabSelected = true;
    paramers = {...query};

    this.onPageInit(paramers);

    this.setPageTitle(query.category || query.q || '好食期');

    this.refresh();
  },

  onShow() {

  },

  onUnload() {

  },
  onPullDownRefresh(){
    this.refresh();
  },
  // 综合排序、销量
  onClickTab: function (e) {
    const { index } = e.currentTarget.dataset;

    if (index == this.data.clickIndex && index == 0) {
      return;
    } else if (index == this.data.clickIndex) {
      const bottomImg = this.data.tab[index].botImg == sortIcons.normal ? sortIcons.active : sortIcons.normal
      const topImg = this.data.tab[index].topImg == sortIcons.normal ? sortIcons.active : sortIcons.normal
      this.setData({
        clickIndex: index,
        [`tab[${index}].botImg`]: bottomImg,
        [`tab[${index}].topImg`]: topImg,
      });

      let sortPriceType = paramers.sortPriceType;
      let sortDiscountType = paramers.sortDiscountType
      if(index == 1) {
        paramers.sortPriceType = sortPriceType == '0' ? '1' : '0'
        paramers.sort = 'price';
        paramers.sortType = paramers.sortPriceType;
        this.refresh()
      } else if (index == 2 ){
        paramers.sortDiscountType = sortDiscountType == '0' ? '1' : '0'
        paramers.sort = 'discount';
        paramers.sortType = paramers.sortDiscountType;
        this.refresh()
      }
    } else {
      this.setData({
        clickIndex: index,
      });
      paramers.sortPriceType = paramers.sortPriceType || '1';
      paramers.sortDiscountType = paramers.sortDiscountType || '1';
      switch (index){
        case 0:
          paramers.sort = '';
          paramers.sortType = '';
          paramers.piwikData = {
            name:'综合',
          };
          break;
        case 1:
          paramers.sort = 'price';
          paramers.sortType = paramers.sortPriceType;
          paramers.piwikData = {
            name:'价格',
            index:paramers.sortType ? paramers.sortType : 1,
          };
          break;
        case 2:
          paramers.sort = 'discount';
          paramers.sortType = paramers.sortDiscountType;
          paramers.piwikData = {
            name:'折扣',
            index: paramers.sortType ? paramers.sortType : 1,
          };
          break;
      }
      xmini.piwikEvent('c_fttab', paramers.piwikData);
      this.refresh();
    }
  },
  toggleViewSort() {
    // console.log(this.data.searchHasExpiryDate)
    if (this.data.searchHasExpiryDate == 1) {
      return;
    }
    this.setData({
      showSort: this.data.showSort ? false : true
    })
  },

  // 综合排序、价格从低到高、价格从高到低
  onClickSort(e) {
    const { index } = e.currentTarget.dataset;
    // this.setData({


    //   icons: sortIcons.down,
    //   selectedTitle: this.data.sort[index],
    // });

    // tab 重置
    tabSelected = true;
    let botImg = this.data.lastTab.botImg
    if (index == 0) {
      botImg = sortIcons.normal
    } else {
      botImg = sortIcons.active
    }
    switch (index) {
      case 0:
        // 全部
        paramers.expiryDate = '';
        break;
      case 1:
        // 1个月效期
        paramers.expiryDate = 1;
        break;
      case 2:
        // 2-3个月效期
        paramers.expiryDate = 2;
        break;
      case 3:
        // 4-5个月效期,
        paramers.expiryDate = 3;
        break;
      case 4:
        // 6个月及以上效期
        paramers.expiryDate = 4;
        break;
    }
    this.setData({
      sortClickIndex: index,
      showSort: false,
      expiryIndex: index,
      [`lastTab.botImg`]: botImg
    })
    this.refresh();
  },


  setCurrentChooseIndex(index){
    this.currentChooseIndex = index
    this.setData({
      currentChooseIndex: index
    })
  },
  // pull refresh
  refresh() {
    this.initPullList();
    // my.showLoading();
    // console.log(encodeURI(this.pageQuery.q));
    this.setData({
      viewId: 'scrollTop',
      isLoading: true,
    })

    this.pullParams.scope = this;
    this.pullParams.weights = 1;

    this.pullParams.q = this.pageQuery.q && decodeURIComponent(this.pageQuery.q);
    this.pullParams.category = paramers.category && decodeURIComponent(paramers.category);
    this.pullParams.sort = paramers.sort;
    this.pullParams.sortType = paramers.sortType;
    this.pullParams.expiryDate = paramers.expiryDate;

    //
    this.pullParams.frontCategoryId = paramers.categoryid;
    this.pullModel = api.coupleSearchlist;
    // 主动触发加载事件
    this.onScrollToLower();
  },

  // dealwith data
  dealList(list = []) {
    return mapTo(list, (item) => {
      let isShowLootAll = 0;
      if(!item.onLine){
        isShowLootAll = 1;
      } else if(!item.inStock) {
        isShowLootAll = 2;
      }
      return {
        id: item.pinActivitiesId,
        title: item.coupleTitle,
        image: item.skuPic,
        priceObj: {
          rmb: 1,
          price: item.couplePrice,
          marketPrice: item.marketPrice,
          memberPrice: item.member_price,
        },
        isShowLootAll,
        tags: item.tags.splice(0,2) || [],
        inStock: item.inStock,
        onLine: item.onLine,
        endTime: item.endTime,
        showCountDownLimit: item.showCountDownLimit,
        remainTime: item.remainTime || '',
        merchantType: item.merchant_type,
        expired_date_text:item.expired_date_text_two,
        link:item.link,

      };
    });
  },
  dealRecList(list) {
    return mapTo(list, (item) => {
      let isShowLootAll = 0;
      if(!item.onLine){
        isShowLootAll = 1;
      } else if(!item.inStock) {
        isShowLootAll = 2;
      }
      return {
        ...item,
        id: item.pinActivitiesId,
        title: item.coupleTitle || item.title,
        image: item.skuPic,
        thumbnail: item.thumbnail,
        market_price: (item.market_price / 100).toFixed(2),
        light_member_price: dealPrice(item.light_member_price),
        price: this.productPrice(((item.price || item.couplePrice) / 100).toFixed(2)),
        isShowLootAll,
        // link: `https://m.haoshiqi.net/v2/couple-detail?id=${item.biz_id}`,
        tags: item.tags.splice(0,2) || [],
        inStock: item.inStock,
        onLine: item.onLine,
        endTime: item.endTime,
        showCountDownLimit: item.showCountDownLimit,
        remainTime: item.remainTime || '',
        merchant_type: item.merchant_type,
        expired_date_text:item.expired_date_text_two,
        link: item.link,
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
  afterPull(res) {
    var { data } = res;
    this.setData({
      isLoading: false
    })
    if (this.pullParams.pageNum > 1) {
      return;
    }
    // 第二页不属于主接口
    delete this.pullParams.scope;
    delete this.pullParams.weights;
    if(data.category) {
      const { banner = {}, category = [], searchHasExpiryDate } = data;
      const swiperList = mapTo(banner.list || [], (item) => {
        return {
          image: item.image.url,
          url: item.link,
        };
      });
      const hwRatio = banner.height / banner.width;
      const paddingTop = hwRatio.toFixed(2) * 100;
      const width = my.$getSystemInfo().windowWidth;
      const swiperInfo = {
        list: swiperList, // 如果数据不符合格式，可以使用 mapTo 方法
        goUrlPage: 'goUrlPage',
        height: width * hwRatio,
        paddingTop,
      }

      let lastTab = this.data.lastTab
      lastTab.botImg = searchHasExpiryDate != 1 ? sortIcons.normal : sortIcons.disabled

      this.setData({
        lastTab,
        searchHasExpiryDate,
        category,
        swiperInfo,
        viewId: ''
      })
    }
  },

  goSearchText(e) {
    const { text, index } = e.currentTarget.dataset;
    this.setData({
      categoryIndex: index
    })
    paramers.category = text;
    this.refresh()
  },

  // click event
  onTapNext(e) {
    const {
      id,
      index,
      online,
      instock,
      url = ""
    } = e.currentTarget.dataset;
    if (online && instock) {
      xmini.piwikEvent('搜索结果页点击列表', {
        index: (index && index + 1) || 0,
        id: id,
      })
      if (!url) return;
      this.onUrlPage(e);
    }
  },

  //数据处理完成后判断是否需要请求推荐商品
  afterPullData(list) {
    if (this.data.totalCnt <= 20) {
      this.getRecommendProduct();
    }
  },
  getRecommendProduct() {
    api.getCoupleListV1({
      personalization: true,
      pageNum: 1,
      pageLimit: 20,
      needPagination: 1
    }, res => {
      const { data } = res;
      const { list } = data;
      let recommendList = this.dealRecList(list);
      this.setData({
        recommendList
      })
    }, err => {
      console.log(err);
    })
  }
});
