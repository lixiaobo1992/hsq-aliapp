import api from '/api';
import {
  mixins,
  mapTo,
  pullList,
} from '/utils';

export default {
  onPullDownRefresh() {
    console.log('onPullDownRefresh')
    if (typeof this.refresh === 'function') {
      this.refresh();
    }
  },
  ztPullList() {
    const { pageQuery } = this;
    this.pullParams = Object.assign({
      needPagination: 1,
      pageLimit: 10,
      pageNum: 1,
      topicCode: pageQuery.id || pageQuery.topic_code || '82e9a32d3c73a0be04d4afb9d7933e92',
    });
    this.pullModel = api.getTopicList;

    // my.showLoading();
    this.onScrollToLower();
  },

  dealList(list) {
    return mapTo(list, (item) => {
      return {
        id: item.pinActivityId,
        title: item.title,
        image: item.sku_pic,
        priceObj: {
          rmb: 1,
          price: item.group_price,
          marketPrice: item.market_price,
        },
        tags: item.tags || [],
      };
    });
  },
}
