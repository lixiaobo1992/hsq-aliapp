import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
} from '/utils';
import {
  formatDate
} from '/utils/dateUtil'

let pageNum = 1;

xPage({
  ...mixins,
  data: {
    list: [],
  },
  onLoad(query) {
    this.onPageInit(query);
    if (query.skuId) {
      this.skuId = query.skuId;
      my.showLoading();
      this.getCommentList(query.skuId);
    }
  },

  onShow() {

  },

  onUnload() {

  },

  getCommentList(id) {
    api.getUgcList({
      skuId: id,
    }, (res) => {
      my.hideLoading();
      const { list = [] } = res.data;
      for (let s = 0; s < list.length; s++) {
        let item = list[s];
        item.created_at = formatDate(item.created_at * 1000, 'Y-M-D');
        const temp = new Array(5);
        for (let i = 0; i < item.score; i++) {
          temp[i] = 1;
        }
        item.score = temp;
      }
      this.setData({
        list: list || [],
      });
    });
  },
  // 加载更多
  onScrollToLower() {
    if (this.data.loadover) return;

    api.getUgcList({
      pageNum,
      pageLimit: 10,
      skuId: this.skuId,
    }, (res) => {
      const { data } = res;
      const { totalPage } = data;
      if (totalPage > pageNum) {
        pageNum += 1;
      } else {
        this.setData({
          loadover: true,
          showFooter: true,
        });
      }

      for (let s = 0; s < data.list.length; s++) {
        let item = data.list[s]
        item.created_at = formatDate(item.created_at * 1000, 'Y-M-D');
        const temp = new Array(5);
        for (let i = 0; i < item.score; i++) {
          temp[i] = 1;
        }
        item.score = temp;
      }
      this.setData({
        list: this.data.list.concat(data.list),
      });
    });
  },
});
