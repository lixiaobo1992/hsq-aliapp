import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
import { mixins } from '/utils';

const MIN_ROWS = 3;

xPage({
  ...mixins,
  data: {
    isLoading: true,

    title: '百世汇通',
    isMore: false,
    number: MIN_ROWS,
    rotate: 90,
    datas: [],
    details: [],
  },

  onLoad(query) {
    this.onPageInit(query);
    this.refresh();
  },

  onShow() {

  },

  refresh() {
    const params = {
      scope: this,
      weights: 1,

      orderId: this.pageQuery.orderId,
    };
    this.setData({
      isLoading: true
    })
    api.getDelivery(params, (response) => {
      const { data } = response;
      const datas = data.msg;
      const lessDetails = datas.slice(0, MIN_ROWS);
      this.setData({
        isLoading: false,
        datas,
        title: data.delivery_com_name + '：' + data.delivery_no,
        details: lessDetails,
      });
      my.hideLoading();
    });
  },

  onMoreOrLess() {
    if (!this.data.isMore) {
      const moreDetails = this.data.datas;
      this.setData({
        isMore: true,
        details: moreDetails,
        rotate: -90,
      });
    } else {
      const lessDetails = this.data.datas.slice(0, MIN_ROWS);
      this.setData({
        isMore: false,
        details: lessDetails,
        rotate: 90,
      });
    }
  },
});
