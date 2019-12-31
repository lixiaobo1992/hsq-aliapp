import xm, { storage, Storage } from '@xmini/x-mini/lib/index';
// import { App, Page } from '@xmini/x-mini/lib/utils/mockMini';
// import * as adaptor from '@xmini/x-mini/lib/adaptors/adaptor-aliapp';
import * as adaptor from './adaptor';
import { appConfig } from './adaptor';

import PluginErrorReport from '@xmini/x-mini/lib/plugins/plugin-error-report';
import PluginChannel from '@xmini/x-mini/lib/plugins/plugin-channel';
import PluginStore, {
  Store,
  mapState,
  mapMutations,
  mapActions,
} from '@xmini/x-mini/lib/plugins/plugin-store/index';

import PluginStat from '@xmini/x-mini/lib/plugins/plugin-stat/index';
import PluginPiwik from '@xmini/x-mini/lib/plugins/plugin-piwik/index';
import PluginRoute from '@xmini/x-mini/lib/plugins/plugin-route';
import PluginA from '../plugins/PluginA';

import storeConfig from '../store/index';

console.log(storage);

// xm.init()
//   .use()
//   .use()
//   .use();

xm.init({
  adaptor,
  appId: '2017112000051610',
  appName: 'hsq-aliapp',

  store: new Store(storeConfig),

  // mixins: {
  //   app: [],
  //   page: [
  //     {
  //       tt() {
  //         console.log('tt');
  //       },
  //     },
  //   ],
  //   component: [],
  // },

  plugins: [
    new PluginStore(),
    new PluginErrorReport({
      reportURI: 'https://tongji.doweidu.com/log.php',
    }),
    new PluginChannel({
      // spm: 'aliapp',
      channel: 'aliapp',
      channel_id: 'aliapp',
    }),
    new PluginStat({}),
    new PluginRoute({
      appConfig,
    }),
    new PluginPiwik({
      size: 10,
      category: 'aliapp',
      // time: '', // 上报时间间隔
      siteId: 5, // 测试用 2，本站点使用 5
      reportURI: 'https://tongji.doweidu.com/piwik.php',
      authToken: '5db85cb262e7423aa6bdca05a0283643',
    }),
    new PluginA(),
  ],
});

export {
  mapState,
  mapMutations,
  mapActions,
  storage,
  Storage,
};

export const xmini = xm;
export const me = xm.me;
export const xApp = xm.xApp;
export const xPage = xm.xPage;

/*

### plugin-piwik 使用

plugin-piwik 向外暴露三个方法：

- piwikInit （参数受限，只允许接收以下值）
```js
{
  size: 1,
  siteId: 1,
  reportURI: 1,
  authToken: 1,
}
```
- piwikUpdate （参数受限，只允许接收以下值）
```js
{
  openId: 1,
  location: 1,
  userId: 1,
  screen: 1,
  cityName: 1,
  path: 1,
  refer: 1,
  以及 channel 相关参数
}
```
- piwikEvent(action, [value], [category])


*/
