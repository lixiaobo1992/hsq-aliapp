import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import { mixins } from '/utils';
import api from '/api';
let localToken = '';

xPage({
  ...mixins,
  data: {
    url: '',
    shareUrl: '',
    shareInfo: true,
  },
  onLoad(query = {}) {
    this.onPageInit(query);
    // console.log(query.url);
    const { token } = api.getCommonParams();
    localToken = token;
    const prefix = query.url.indexOf('?') > -1 ? '&' : '?';
    this.setData({
      url: query.url + prefix + 'd_aliapp=1&token=' + token,
      shareUrl: encodeURIComponent(query.url),
    });
  },
  onShow() {
    // console.log(this.pageQuery);
    const query = this.pageQuery;
    const { token } = api.getCommonParams();
    if (localToken != token) {
      this.forward('topic', { url: encodeURIComponent(query.url), replace: true });
    }
  },
  getMsg(e) {
    // console.log(e);
    if (!e || !e.detail) {
      console.log('未获取H5页面消息');
      return;
    }
    const data = e.detail;
    if (data.type == 'url') { //跳转url
      const result = { currentTarget: { dataset: data } };
      this.onUrlPage(result);
    } else if (data.type == 'share_info') { //设置分享信息，与一元餐不同
      const path = 'pages/topic/topic?url=' + this.data.shareUrl;
      // const jumplink = 'topic?url=' + this.data.shareUrl;
      // const path = 'pages/index/index?jumplink=' + encodeURIComponent(jumplink) + '&minishare=1';
      this.setData({
        shareInfo: {
          title: data.share_title,
          desc: data.share_desc,
          imageUrl: data.share_img,
          path: path,
        }
      })
      // console.log('设置分享信息', this.data.shareInfo);
    } else if (data.type == 'alipay-render') {
      my.ap.navigateToAlipayPage({
        path: data.url,
        success:(res) => {
          console.log('___navigateToAlipayPage success___', res);
        },
        fail:(err) => {
          console.log('___navigateToAlipayPage fail___', err);        
        }
      });
    }
  }
});
