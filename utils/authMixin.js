import {
  me,
  xmini,
} from '../config/xmini';
import api from '/api';


// 用户授权 分为两种： 1 静默授权、2 主动授权（弹窗授权）
//

const authMixin = {

  // 用户授权登录
  userAuthLogin({ authType = 'auth_base', success, fail }){

    const that = this;
    authMixin.updatedAuthCode({
      authType,
      success(res) {
        // 用户同意了授权
        authMixin.postLogin({
          authType,
          data: res,
          success(res1) {
            //
            console.log('登录成功', res1);
            success && success(res1)
          },
          fail(err1){
            //
            console.log('登录失败', err1);
            fail && fail(err1)
          }
        });
      },
      fail(err) {
        console.log(err);
        fail && fail(err)
      }
    })

  },
  ////////////
  // authCode: 0,
  updatedAuthCode({ authType = 'auth_base', authOption = [], success, fail }) {
    console.log( '===授权方式:' + authType)
    // scopes: [
    //   authType,
    //   // 'auth_base', // 静默授权
    //   // 'auth_user', // 主动授权
    //   // 'auth_zhima', // 芝麻信用
    //   'ant_member_info', // 蚂蚁会员积分
    //   // 支付宝收货地址 需要服务端支持
    //   // https://docs.alipay.com/mini/api/choose-address
    //   // 'user_address',
    // ],
    let scopes = [
      authType,
    ]

    // 这里有个坑，权限列表内有需要主动授权才能得到权限时候，设置静默授权无用（部分机型）
    // 现在模拟器不支持 另外两个授权项 真机为准
    if (authType !== 'auth_base') {
      if (authOption && authOption.length) {
        scopes = scopes.concat(authOption);
      } else {
        scopes = scopes.concat(['ant_member_info','auth_life_msg'])
      }
    }
    console.log('===权限列表 scopes:', scopes);
    const that = this;
    my.getAuthCode({
      scopes,
      success(res) {
        console.warn('my.getAuthCode:', res);
        // ios
        // res:{
        //   authErrorScopes: {},
        //   authSuccessScopes: [
        //     'ant_member_info',
        //     'auth_user',
        //     'auth_life_msg'
        //   ],
        //   authCode: 'xxxx',
        // }
        // and
        // res:{
        //   NBPageUrl: 'https://2017112000051610.hyhrid.alipay-eco.com/index.html#demo/test/test',
        //   authCode: 'xxx',
        //   authcode: '',
        //   authErrorScopes: {},
        //   authSuccessScopes: [
        //     'ant_member_info',
        //     'auth_user',
        //     'auth_life_msg'
        //   ]
        // }
        // 模拟器
        // res:{
        //   authCode: 'xxxx',
        //   authSuccessScope: [

        //   ]
        // }

        // 这里有坑， IDE 返回字段名 authSucessScope or authSuccessScope 真机 返回字段名 authSuccessScopes
        // IDE 主动授权时 authSuccessScopes 一个长度为2的数组 ['auth_base','auth_user,...']
        // 真机 主动授权时 authSuccessScopes 一个长度为1的数组 ['auth_user,...']
        if (res.authCode) {
          // that.authCode = res.authCode;
          const {
            authCode, authSuccessScopes, authSuccessScope, authSucessScope
          } = res;

          let authScope = []

          // 处理
          if (authSuccessScopes) {
            authScope = authSuccessScopes.concat()
          } else if (authSucessScope) {
            authScope = authSucessScope.concat()
            if (authScope.length > 1) {
              authScope = [].concat(authScope[authScope.length-1])
            }
          } else if (authSuccessScope) {
            authScope = authSuccessScope.concat()
          }

          success && success({
            authCode,
            authSuccessScopes: authScope
          });
        } else {
          my.showToast('未获取到授权码');
        }
      },
      fail(err) {
        fail && fail(err);
      },
      complete(val){}
    });
  },
  postLogin({ authType = 'auth_base', data = {}, success, fail }){
    const that = this;

    api.login({
      isLoading: authType == 'auth_base' ? false :true,
      type: 3,
      authCode: data.authCode,
      authSuccessScopes: (data.authSuccessScopes || []).toString()
    }, (res) => {
      const { data } = res;
      const userId = data.user_id;
      // data.userId = userId;
      if (userId) {
        // this.sendRefreshMessage();
        console.log('登录成功');
        xmini.piwikUpdate({
          userId: data.user_id || '',
          openId: data.alipay_user_id || '',
        });
        // 更新store
        xmini.store.dispatch('setUserInfo', data)
        success && success(res);
      } else {
        my.showToast('用户登录信息有误，请重新登录');
        fail && fail(res);
      }
      xmini.store.dispatch('setAddresses');
    }, (err) => {
      console.log(err);
      xmini.store.dispatch('setAddresses');
      fail && fail(err);
      return true;
    });

  },
  ////////

}

export default authMixin
