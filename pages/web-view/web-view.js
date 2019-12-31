import {
  me,
  xmini,
  mapState,
  xPage,
} from '../../config/xmini';
import { mixins } from '/utils';
import { urlfix, getQueryString } from '/utils/stringUtil';
import api from '/api';

xPage({
  ...mixins,
  data: {
    url: '',
    ...mapState({
      logged: state => state.user.logged,
    }),
  },
  onLoad(query = {}) {
    this.onPageInit(query);
    // console.log(query.url);
    const { title } = query;

    if (title) {
      this.setPageTitle(title);
    }

  },
  onShow() {

    const { need_login = 0 } = this.pageQuery;
    const { token } = api.getCommonParams();

    // 如果webview页面需要前置登录，则在url后拼接参数 need_login=1
    if (need_login == 1 && !this.data.logged && !token) {
      this.forward('login');
      return;
    }
    let { url = '' } = this.pageQuery;
    if (!url) return;
    url = decodeURIComponent(url);
    url = urlfix(url, 'd_aliapp=1');
    const hasToken = !!getQueryString(url, 'token');
    if (!hasToken) {
      url = urlfix(url, 'token=' + token);
    }
    console.log('web-view url:', url)
    this.setData({
      url: url,
    });

  },
  getMsg(e) {
    if (!e || !e.detail) {
      console.log('未获取H5页面消息');
      return;
    }
    const data = e.detail;
    if (data.type == 'url') { //跳转url
      const result = { currentTarget: { dataset: data } };
      this.onUrlPage(result);
    }
  }
});
