import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import { mixins } from '/utils';
import ErrorView from '/components/error-view';


xPage({
  ...mixins,
  ...ErrorView,
  data: {
    errorData: {
      type: 'error',
      title: '',
      content: '',
      button: '',
      onButtonTap: 'handleBack',
      // href: '/pages/list/index'
    },
  },
  onLoad(query = {}) {
    this.onPageInit(query);
  },
  onShow() {
    my.isShowError = true;
    const that = this;
    const query = this.pageQuery;
    setTimeout(() => {
      const length = getCurrentPages().length > 1;
      that.setData({
        [`errorData['title']`]: query.message || '稍等一下，页面一会儿就回来~',
        [`errorData['button']`]: length > 1 ? '返回' : '',
      });
    }, 300)
  },
  onUnload() {
    my.isShowError = false;
  },
  onHide() {
    my.isShowError = false;
  },
  handleBack() {
    this.back();
  },
});
