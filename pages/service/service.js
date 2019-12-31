import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import {
  mixins,
} from '/utils';

xPage({
  ...mixins,
  data: {
    showLifeStyle: false,
  },
  onLoad(query) {
    this.onPageInit(query);

    const isSupportLife = my.canIUse('lifestyle');
    this.setData({
      showLifeStyle: isSupportLife,
    });
    // if (!isSupportLife) {
    //   my.showToast('您的版本不支持直接跳转生活号');
    // }
  },

  onShow() {

  },

  onUnload() {

  },
});
