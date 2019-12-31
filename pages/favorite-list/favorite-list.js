// pages/favorite-list/favorite-list.js
import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '../../api';
import {
  mixins,
  mapTo,
  pullList,
} from '../../utils/index';
import CountManger from '../../utils/CountManger';
import formatNum from '../../utils/formatNum';

let tabsType = 1;

xPage({
  ...mixins,
  ...pullList,
  data: {
    isLoading: true,

    noEditState: true,
    priceInt: 10,
    priceFloat: 12,
    selectImg: 'https://img1.haoshiqi.net/miniapp/select_77a73f975f.png',
    selectedImg: 'https://img1.haoshiqi.net/miniapp/selected_f4e98109b4.png',
    editText: '编辑',
    tabsType: 1,
    tabsStatus: 1,
    tabData: [
      {
        name: '空',
        id: 2
      },
      {
        name: '商品',
        hint: '商品',
        id: 0,
      },
      {
        name: '店铺',
        hint: '没有更多店铺了',
        id: 1
      }
    ]
  },

  onLoad(options) {
    this.onPageInit(options);
    console.log(options.type,'options type');
    let type = options.type || 1;
    this.setData({
      tabsType: type ,
      tabsStatus: type ,
    })
    this.data.tabsType = type;
    console.log(this.data, 'data type');
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    this.pinList = [];
    this.skuIdList = [];
    this.collectList= [];
    console.log(this.pinList,"this.pinList = [];")
    this.setData({
      isLoading: true,
      list: []
    })
    this.initPullList();
    this.pullParams.type = parseInt(this.data.tabsType);
    this.pullParams.scope = this;
    this.pullParams.weights = 1;
    this.pullParams.pageLimit = 10;
    // console.log(this.pullParams,'type');
    this.pullModel = api.getFavoriteList;
    this.onScrollToLower();
    console.log('refresh----------------------')
  },
  dealList(list) {
    this.difftime = Date.now() - this.data.timestamp * 1000;
    let tabsType = this.data.tabsType;
    if (tabsType == 1){
      xmini.piwikEvent('c_collect_product')
      console.log('处理数据')
      this.setData({
        tabsStatus: 1,
      })
      this.difftime = Date.now() - this.data.timestamp * 1000;
      return mapTo(list, item => {
        let tipState = 0;
        let localEndTime = item.end_time * 1000 + this.difftime;
        // 限时
        if (item.product_status == 0 && (localEndTime - new Date()) < 60 * 60 * 24 * 3 * 1000 && (localEndTime > new Date())) {
          tipState = 1
        }
        if (item.left_stock <= 30 && item.product_status == 0) {
          tipState = 2;
        }
        return{
          countDown: '',
          isSelect: false,
          tipState,
          left: item.left_stock,
          id: item.activity_id,
          skuId: item.skuId,
          limit: item.count_limit,
          thumbnail: item.thumbnail,
          title: item.product_name,
          priceInt: parseInt(item.produce_price / 100),
          priceFloat: item.produce_price % 100 < 10 ? ('0' + item.produce_price % 100) : item.produce_price % 100,
          schema: item.schema,
          endTime: item.end_time,
          noStock: item.left_stock < 1 ? true : false,
          marketPrice: (item.market_price/100).toFixed(2),
          expired_date_text: item.expired_date_text_two,
        }
      })
    } else if (tabsType == 2){
      xmini.piwikEvent('c_collect_store')
      this.setData({
        tabsStatus: 2,
      })
      return mapTo(list, item => {
        return{
          isSelect: false,
          logo: item.logo,
          id: item.id,
          userId: item.user_id,
          name: item.name,
          createdAt: item.created_at,
          province: item.province,
          city: item.city
        }
      })
    }
  },
  afterPull() {
    if (this.pullParams.pageNum == 1) {
      delete this.pullParams.scope;
      delete this.pullParams.weights;
    }
  },
  afterPullData() {
    this.setData({
      isLoading: false
    })
    this.countDown();
  },
  goNext(e) {
    const { id, skuid, type, index } = e.currentTarget.dataset;
    switch (type) {
      case 'detail':
        xmini.piwikEvent('c-pd',{
          pinActivitiesId:id
        });
        if (this.data.noEditState == true) {
          if(this.data.list[index].noStock) {
            return;
          }
          if(id == 0) {
            this.forward('detail2', { id: skuid })
            return;
          }
          this.forward('detail', { id })
          // this.onUrlPage(e);
        } else {
          this.selectEdit(index);
        }
        break;
      case 'detail2':

        break;
      case 'edit':
        this.toggleEdit();
        break;
      case 'cancel':
        this.cancelFavoriteSkus();
        break;
      case 'collect':
      if (this.data.noEditState == true) {
          if(this.data.list[index].noStock) {
            return;
          }
          this.forward('merchant', { id })
        } else {
          this.selectEdit(index);
        }
        xmini.piwikEvent('c_shop',{
          merchantid:id
        });
        break;
      default:
        // do nothing...
        break;
    }
  },
  cancelFavoriteSkus() {

    if (tabsType == 1){
      if (!this.pinList.length || !this.skuIdList.length) {
        my.showToast('请选择要取消收藏的商品');
        return;
      }
    } else if (tabsType == 2 && !this.collectList.length){
      my.showToast('请选择要取消收藏的店铺');
      return;
    }
    const that = this;
    my.confirm({
      title: '温馨提示',
      content: '确定不再收藏吗？',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      success: (result) => {
        console.log(result);
        if(result.confirm) {
          that.sureCancelSkus();
        }
      },
    });
  },
  sureCancelSkus() {
    const that = this;
    my.showLoading()
    if (tabsType == 1){
      // 取消收藏商品
      xmini.piwikEvent('c_cancelpd',{
        pinActivitiesId: this.pinList.join(','),
      });
      api.removeLikeProduct({
        skuIds: this.skuIdList.join(','),
        activityIds: this.pinList.join(','),
      }, (res) => {
        my.showToast({
          content: '取消成功',
          success(){
            that.toggleEdit();
            that.refresh();
          }
        })
      }, (err) => {
        console.log(err);
      })
    } else if (tabsType == 2){
      // 取消收藏店铺
      xmini.piwikEvent('c_cancelshop',{
        pinActivitiesId: this.collectList.join(','),
      });
      api.removeLikeMerchat({
        merchantIds: this.collectList.join(','),
      }, (res) => {
        my.showToast({
          content: '取消成功',
          success(){
            that.toggleEdit();
            that.refresh();
          }
        })
      }, (err) => {
        console.log(err);
      })
    }

  },
  selectEdit(index) {
    console.log(index);
    if (tabsType == 1){
      const item = this.data.list[index] || [];
      const isSelect = item.isSelect
      if (isSelect) {
        this.removeSelectList(item.id);
      } else {
        this.pinList.push(item.id);
        this.skuIdList.push(item.skuId)
      }
      this.setData({
        [`list[${index}].isSelect`]: !isSelect,
      });
    } else{
      const item = this.data.list[index] || [];
      const isSelect = item.isSelect
      if (isSelect) {
        this.removeSelectList(item.id);
      } else {
        this.collectList.push(item.id);
      }
      this.setData({
        [`list[${index}].isSelect`]: !isSelect,
      });
    }

  },
  removeSelectList(id) {
    if (tabsType == 1){
      const pinIndex = this.pinList.indexOf(id);
      if (pinIndex > -1) {
        this.pinList.splice(pinIndex, 1);
        this.skuIdList.splice(pinIndex, 1);
      }
    } else {
      const collectIndex = this.collectList.indexOf(id);
      if (collectIndex > -1) {
        this.collectList.splice(collectIndex, 1);
      }
    }

  },
  toggleEdit() {
    this.setData({
      noEditState: !this.data.noEditState,
      editText: this.data.editText == '编辑' ? '完成' : '编辑'
    })
  },
  countDown() {
    this.countManager && this.countManager.clear();
    const { list = [] } = this.data;
    if (!list || !list.length) {
      return;
    }

    const that = this;
    const diffTime = Date.now() - this.data.timestamp * 1000;
    this.countManager = new CountManger({
      times: 1000,
      dataList: list || [],
      set() {
        const localEndTime = this.data.endTime * 1000 + diffTime;
        const leftTimes = localEndTime - Date.now();
        if (leftTimes > 0 && leftTimes <= 259200000 && this.data.tipState == 1) {
          this.data.localEndTime = localEndTime;
          console.log(localEndTime)
          this.start();
        }
      },
      callback() {
        const leftTimes = this.data.localEndTime - Date.now();
        if (leftTimes > 0) {
          let timeObj = formatNum(leftTimes, true);
          let text = timeObj.hour + ':' + timeObj.minute + ':' + timeObj.second;
          if (timeObj.day > 0) {
            text = timeObj.day + '天 ' + text;
          }

          that.setData({
            [`list[${this.index}].countDown`]: `剩余 ${text} 结束`,
          });
        } else {
          this.clear();
          that.setData({
            [`list[${this.index}].tipState`]: 0,
          });
        }
      },
    })
  },
  clearCountDown() {
    if (this.countManger) {
      this.countManger.clear();
    }
    if(this.presaleCountDownManger) {
      this.presaleCountDownManger.clear();
    }
  },
  onHide() {
    this.clearCountDown();
  },
  onUnload() {
    this.clearCountDown();
  },
  // tabs切换
  tabsBtn(e) {
    console.log("Tabs切换")
    const {type,name} = e.currentTarget.dataset;
    tabsType = type;
    console.log(type != this.data.tabsStatus)
    xmini.piwikEvent('c_nav',{ name });
    if (parseInt(type) != this.data.tabsStatus){
      this.setData({
        noEditState: true,
        editText: '编辑',
        tabsType: parseInt(type),
      });
      this.refresh();
    }
    if (this.data.list.length == 0) {
      if (tabsType == 1) {
        this.setData({
          tabsStatus: 1,
        })
      } else {
        this.setData({
          tabsStatus: 2,
        })
      }
    }
  }
})
