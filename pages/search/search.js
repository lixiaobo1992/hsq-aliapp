// pages/search/search.js
import parse from 'mini-html-parser2';
import api from '../../api';
import {
  mixins,
} from '../../utils/index';
import { debounce } from '/utils/index';

const app = getApp();
let localHistory = [];

import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';

xPage({
  ...mixins,
  /**
   * 页面的初始数据
   */
  data: {
    pullLoading: false,
    historyList: [], // 历史搜索记录
    inputValue: '',
    couponId: '',
    focus: true,
    isPinSku: false, // 从单品sku列表跳转过来为true，其它情况为false
    hotSearchList: [],
    hotSearch:{},   // 推荐热词
    placeholder: '',
    modalOpened: false,
    searchList: [],     //原始搜索建议列表
    searchSuggestList: [],  //富文本化后搜索建议列表
    searchSuggest: {
      keywords: {},
      num: {}
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onPageInit(options);
    const { hotSearch } = app.getData();
    let placeholder = '';
    if (options.isPinSku) {
      const { skuHistoryList } = app.getData();
      localHistory = skuHistoryList || [];
      placeholder = '搜索可使用券的商品';
    }else {
      const { historyList } = app.getData();
      localHistory = historyList || [];
      this.onFecthData();
      placeholder = hotSearch.value || '搜索您想找的商品';
    }

    this.setData({
      historyList: localHistory,
      couponId: options.id || '',
      isPinSku: options.isPinSku || false,
      hotSearch: hotSearch || {},
      placeholder,
    });
  },

  onShow() {

    this.setData({
      focus: true,
    });
  },

  onUnload() {

  },

  // dealwith data
  onFecthData() {
    api.getHotSearch({
    }, (res) => {
      this.setData({
        hotSearchList: res.data.list,
      });
    }, (err) => {
      me.hideLoading();
      return true;
    });
  },
  clearInput() {
    this.setData({
      inputValue: '',
      focus: true,
      searchList: [],
      searchSuggestList: [],
    });
  },
  inputFocus() {
    this.setData({
      focus: true,
    });
  },
  // 获取input value
  onInputValue(e) {
    this.setData({
      inputValue: e.detail.value,
    });
    if (e.detail.value) {
      debounce(this.getSearchSuggest.bind(this), 300)();
    } else {
      this.setData({
        searchList: [],
        searchSuggestList: [],
        pullLoading: false
      })
    }
  },
  goBack() {
    my.navigateBack();
  },
  getSearchSuggest() {
    api.getSearchSuggest({
      isLoading: false,
      keywords: this.data.inputValue
    }, res => {
      let { data: {list} } = res;
      this.setData({
        searchList: list
      });
      this.handleHighlight(list);
    }, err => {
      console.log(err);
    })
  },

  //处理高亮数据
  handleHighlight(list) {
    let that = this;
    let searchSuggestList = [];
    this.setData({
      pullLoading: true
    })
    list && list.map((suggest, suggestIndex) => {
      if (suggest.highlight && suggest.highlight.keywords) {
        let searchSuggest = {};
        parse(suggest.highlight.keywords, (err, nodes) => {
          if (!err) {
            searchSuggest.keywords = nodes
          }
        })
        parse(suggest.highlight['item_num'], (err, nodes) => {
          if (!err) {
            searchSuggest.num = nodes
          }
        })
        searchSuggestList.push(searchSuggest);
        this.setData({
          searchSuggestList: searchSuggestList
        })
      }
    })
    this.setData({
      pullLoading: false
    })
  },

  // 热门搜索
  onHotSearch(e) {
    const { value, url, index } = e.currentTarget.dataset;
    xmini.piwikEvent('c_hotsch',{
      link: url,
      value: value,
      index,
    });
    this.forward('couple-search-list', {
      q: value,
    });
    this.onSaveLocal(false, value);
  },

  // 搜索
  onInputSearch(e) {
    let piwikEvent = 'c_schbox_dfsch';
    let value = this.data.inputValue;
    const { isPinSku } = this.data;
    const hotSearch = e.currentTarget.dataset.hotsearch;
    if (!hotSearch.url && hotSearch.value && !value) {
      value = hotSearch.value;
      piwikEvent = 'c_schbox_textsch';
    }

    if (!value.length) {
      me.showToast("关键字不能为空");
      return;
    }
    xmini.piwikEvent(piwikEvent,{
      name: value,
    });

    this.onSaveLocal(isPinSku, value);
    this.onForward(e.currentTarget.dataset.id, value, isPinSku);
  },

  // 保存在本地
  onSaveLocal(isPinSku, value) {
    if (localHistory.length) {
      let index = localHistory.indexOf(value);
      if (index > -1) {
        localHistory.splice(index, 1);
      }
      /* index: 数组开始下标
         len: 替换 / 删除的长度
         item: 替换的值，删除操作的话 item为空
      */
      localHistory.splice(0, 0, value);
    }else {
      localHistory.push(value);
    }

    // 取前10个
    if (localHistory.length > 10) {
      const array = localHistory.slice(0, 10);
      localHistory = array;
    }

    if (isPinSku) {
      app.updateData({ skuHistoryList: localHistory });
    }else {
      app.updateData({ historyList: localHistory });
    }

    this.setData({
      historyList: localHistory,
    });
  },

  // 点击历史记录跳转
  onClickHistory(e) {
    const { id, value } = e.currentTarget.dataset;
    const isPinSku = e.currentTarget.dataset.ispinsku;
    let index = localHistory.indexOf(value);
    if (index > -1) {
      localHistory.splice(index, 1);
    }
    /* index: 数组开始下标
       len: 替换 / 删除的长度
       item: 替换的值，删除操作的话 item为空
    */
    localHistory.splice(0, 0, value);
    app.updateData({ historyList: localHistory });
    xmini.piwikEvent('c_hissch', {
      name: value,
    });

    this.setData({
      historyList: localHistory,
    });
    this.onForward(id, value, isPinSku);
  },

  onForward(couponId, q, isPinSku) {
    if (isPinSku) {
      this.forward('coupon-sku-list', {
        couponId,
        q,
      });
    }else {
      this.forward('couple-search-list', {
        q,
      });
    }
  },

  // 清空历史记录
  onGarbage(e) {
    const isPinSku = e.currentTarget.dataset.ispinsku;
    this.setData({
      modalOpened: true,
    });
    // me.showModal({
    //   title: '提示',
    //   content: '确定清空搜索历史吗？',
    //   success:(res) => {
    //     if (res.confirm) {
    //       if (isPinSku) {
    //         app.updateData({ skuHistoryList: null });
    //       }else {
    //         app.updateData({ historyList: null });
    //       }

    //       localHistory = [];
    //       this.setData({
    //         historyList: [],
    //       });
    //     }
    //   }
    // })
  },
  onModalClick(){
    console.log('ok')
    app.updateData({ historyList: null });
    localHistory = [];
    this.setData({
      modalOpened: false,
      historyList: [],
    });
    xmini.piwikEvent('c_hissch_delebtn');
  },
  onModalClose(){
    console.log('close')
    this.setData({
      modalOpened: false,
    });
  },
});
