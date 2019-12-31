

import {
  me,
  xPage
} from '../../config/xmini';

import api from '/api';

import TimingTask from '/utils/timingTask';
import ViewPortItem from '/utils/viewPortItem';

import Exposure from './exposure';

import { getArrayBeMixed, getArrayDiff } from '/utils/arrayUtil';


const app = getApp();

const systemInfo = me.$getSystemInfo();
// console.log(systemInfo);
const { windowWidth, windowHeight } = systemInfo;


const cTofu = {
  moduleId: 'dofu',
  list: [
    {
      "image": {
        "url": "http://img2.haoshiqi.net/mac94d161f86ac6329b7b6c523c83df136.jpg?imageView2/0/q/70",
        "w": 750,
        "h": 320
        },
      "link": "https://topic.doweidu.com/?id=d5095b6964a5a79938181fb3a3f6c9e8&origin=hsq_h5",
      "id": 2207
    },
    {
      "image": {
        "url": "http://img2.haoshiqi.net/ma85ab5615485d802f27b98a7d21b68129.jpg?imageView2/0/q/70",
        "w": 750,
        "h": 320
      },
      "link": "https://topic.doweidu.com/?id=ea6d0003a6863ac1c9c1f8dedd930d56&origin=hsq_h5&channel_id=wechat_sub&spm=wechat_sub/smodv",
      "id": 2212
    },
    {
      "image": {
        "url": "http://img2.haoshiqi.net/ma55034088e74eb4ff0adc2ae6262c1639.jpg?imageView2/0/q/70",
        "w": 750,
        "h": 320
      },
      "link": "https://m.haoshiqi.net/#zt_template?topic_code=e103722995e7324cbd31c8d25981111c&channel_id=hsq_ios&spm=hsq_ios/4425s",
      "id": 2181
    }
  ]
}


let productId = 0;
function createProduct() {
  productId ++;
  return  {
    moduleId: 'product' + productId,
    list: createProductList(10)
  }
}

function createProductList(n) {
  let products = [];
  for(let i = 0; i < n; i++) {
    products.push({
      id: i,
      name: '那么牛逼！！！！！' + i,
      pic: 'http://img2.haoshiqi.net/ma2eabfdb44d9198856c904d0f2ec05e5d.jpg?imageView2/0/q/70'
    })
  }
  return products;
}



xPage({
  ...TimingTask,
  ...ViewPortItem,
  ...Exposure,
  timeDifference: 0,// 服务器时间与本地时间差值
  timestamp: parseInt(new Date().getTime()/1000), // 当前时间 服务器时间

  viewPortTempListData: [],


  data: {
    isLoading: true, // 页面是否loading
    list: [],

    modules: [
      createProduct(),
      cTofu,
      createProduct()
    ]
  },
  onLoad() {
    this.getIndex();
    this.initViewPort({
      viewPortScrollTop:0, //
      viewPortHeight: windowHeight, // 当前滑动视口高度
      viewPortElement:'.exposure-item', // 类名
      // scroll:'onScroll' // 滚动监听回调
    })

  },
  onShow() {


   this.updatadViewPortTempListData()

  },
  onReady() {

    this.getViewPortListLoact();
  },
  getViewPortListLoact() {
    setTimeout(()=>{
      this.getViewPortListItemLoact((ret)=>{
        if (!ret[0] || !ret[0].length) {
          return
        }
        console.log('getViewPortListItemLoact: ', ret)
        this.viewPortTagArray = []
        ret[0].forEach((item,index)=>{
          const tempItem = this.viewPortTempListData[index];
          this.viewPortTagArray.push({
            index,
            ...tempItem,
            top: Math.round(item.top) + this.viewPortScrollOptions.viewPortScrollTop, // 再次获取时 需要加上当前已滑动的距离
            bottom: Math.round(item.bottom) + this.viewPortScrollOptions.viewPortScrollTop
          })
        })
        // console.log(this.viewPortTagArray)
        this.filterView()
      })
    },300)
  },
  updatadViewPortTempListData() {

    // 同步一份数据映射 当前视口内的数据
    const viewPortTempListData = [];
    const { modules = [] } = this.data;
    for (let i = 0; i < modules.length; i++){
      let item = modules[i];
      for (let j = 0; j < item.list.length; j++) {
        let tempItem = item.list[j];
        viewPortTempListData.push({
          moduleId: item.moduleId,
          id: tempItem.id,
          index: j,
          value: '',
          image: ''
        })
      }
    }

    this.viewPortTempListData = viewPortTempListData;

  },
  // 特殊处理
  dealInsideViewPortItem(viewPortData) {
    let insideViewPortItem = {}
    viewPortData.forEach((item, index) => {
      insideViewPortItem[`${item.moduleId}&&${item.id}`] = item;
    })
    return insideViewPortItem; // 新的
  },
  // 筛选完成当前视口元素
  filterViewCallBack(){
    // console.log('insideViewPortItem', this.insideViewPortItem)
    // console.log('oldInsideViewPortItem', this.oldInsideViewPortItem)
    if (Array.isArray(this.oldInsideViewPortItem)) this.oldInsideViewPortItem = {};
    const oldInsideViewPortItemKeys = Object.keys(this.oldInsideViewPortItem);
    const insideViewPortItemKeys = Object.keys(this.insideViewPortItem);
    // A ∩ B
    const beMixedArray = getArrayBeMixed(oldInsideViewPortItemKeys, insideViewPortItemKeys)
    // B - (A ∩ B)
    const diffArray = getArrayDiff(insideViewPortItemKeys, beMixedArray)
    console.log('牛逼', diffArray);

    // 两种方式

  },

  getIndex() {
    // my.showLoading();
    api.getIndex({
    }, (res) => {
      console.log(res);

      const { list = [] } = res.data;

      const modules = list.reduce((modules, item) => {
        if (item.type == 'c-tofu' || item.type == 'rec_pin_activites') {
          let tempItem = {
            typeName: item.type,
            list: item.list || [],
            bg: item.bg || false,
            layout: item.layout,
            width: item.width,
            height: this.calculateModuleHeight(item.width, item.height),
          }
          if (item.type == 'c-tofu') {
            modules.push(tempItem)
          }

          if (item.type == 'rec_pin_activites') {
            tempItem.typeName = 'card-rec-pin';
            tempItem.list = item.list.map(each => {
              const formated = each;
              formated.market_price = (each.market_price / 100).toFixed(2);
              formated.couple_price = (each.couple_price / 100).toFixed(2);
              formated.yuan = parseInt(each.couple_price, 10);
              const splited = each.couple_price ? each.couple_price.split('.') : [];
              formated.fen = splited[1];
              formated.merchantType = each.merchant_type;
              return formated;
            });

            modules.push(tempItem)
          }

        }
        return modules;
      }, [])

      console.log(modules)

    })
  },

  calculateModuleHeight(width, height) {
    let w = width;
    if (!w || w === 0) {
      w = windowWidth;
    }
    return Math.round((height / w) * windowWidth);
  },


});
