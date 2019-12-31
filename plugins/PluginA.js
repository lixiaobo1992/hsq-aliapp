import xmini from '@xmini/x-mini/lib/index';

export default class PluginA {
  // 监听生命周期事件 接收两个参数, (query?, context)
  events = {
    // 'app.onLaunch.before': 'preAppOnLaunch',
    // 'app.onShow.after': 'afterAppOnShow',
    'page.onShow.after': 'pageOnShow',
  };

  constructor(config = {}) {
    this.config = config
  }
  pageOnShow(query = {}, ctx) {
    // 自定义
    const app = getApp();
    if (ctx && ctx.pageName && ctx.pagePath) {
      app.sensors.track(ctx.pageName, {
        pagePath: ctx.pagePath,
      });
    }
  }
}
