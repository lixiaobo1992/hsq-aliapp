import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
} from '/utils';

const listData = {
  onItemTap: 'handleListItemTap',
  // header: 'list1',
  data: [
    {
      title: '用户服务协议',
      arrow: 'horizontal',
      type: 'protocol'
    },
    {
      title: '好食期隐私政策',
      arrow: 'horizontal',
      type: 'privacy'
    },

  ]
};

xPage({
  ...mixins,
  data: {
    listData
  },
  onLoad(query) {
    this.onPageInit(query);
  },

  onUnload() {

  },

  onShow() {
  },

  handleListItemTap(e) {
    const { type } = e.currentTarget.dataset;
    switch (type) {
      case 'protocol': // 跳我的收藏
        // xmini.piwikEvent('c_gerenzhongxin',{
        //   name:'我的收藏',
        // });
        this.forward('web-view',{
          url: 'https://render.doweidu.com/p/hsq/mini-service.html',
          title: '用户服务协议'
        });
        break;
      case 'privacy':
        this.forward('web-view',{
          url: 'https://render.doweidu.com/p/hsq/mini-privacy.html',
          title: '好食期隐私政策'
        });
        break;
    }

    // https://render.dev.doweidu.com/p/hsq/mini-service.html
  }


});
