import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
// 此页面作为一个权限检测页面
import { mixins } from '/utils';
import api from '/api';
import authMixin from '/utils/authMixin';

const app = getApp();

xPage({
  ...mixins,
  data: {
    content: '正在登录中...',
    cantry: false,
  },
  onLoad(query) {
    // my.alert({
    //   title: JSON.stringify(query),
    // });
    this.onPageInit(query);
  },
  onShow() {

    my.showLoading();
    this.goLogin();
  },
  onUnload() {
    // 页面被关闭时
  },
  sendRefreshMessage() {
    const { ref, needRefresh } = this.pageQuery;
    if (ref && needRefresh) {
      this.postMessage(ref, {
        needRefresh: true,
      });
    }
  },
  goLogin() {
    // 获取授权type
    const { authType } = this.pageQuery

    const that = this;
    authMixin.updatedAuthCode({
      authType,
      success(res) {
        // 登录前，先清除下之前登录相关的缓存数据
        app.resetData();
        // 用户同意了授权
        authMixin.postLogin({
          data: res,
          success(res1) {
            //
            that.sendRefreshMessage();
            that.setData({
              content: '登录成功!',
              cantry: false,
            });

            setTimeout(() => {
              // console.log('登录成功回退')
              my.navigateBack();
              // my.goBack()
            }, 800);
          },
          fail(err){
            //
            console.log('login页登录失败', err);
            if (err.data) {
              if (!err.data.user_id) { // 登录成功没拿到userid
                that.setData({
                  content: '用户登录信息有误!',
                  cantry: true,
                });
              }
            } else {
              that.setData({
                content: `登录失败! ${err.errmsg}`,
                cantry: true,
              });
            }
          }
        });
      },
      fail(err) {
        console.log(err);
        const step = parseInt(that.data.step || 2, 10);
        that.back(step > 1 ? step : null);
      }
    })

  },

  onClick(e) {
    const { type } = e.currentTarget.dataset;
    switch (type) {
      case 'login':
        this.goLogin();
        break;
      default:
        // do nothing
        break;
    }
  },
});
