
import {
  me,
  xmini,
} from '../config/xmini';
// import { versionCompare } from './index'

import api from '../api'

// let systemInfo = null;
// my.getSystemInfo({
//   success: (res) => {
//     systemInfo = res;
//     // console.log('=========new====systemInfo',res);
//   }
// })

export default {

  getMemberPluginInfo({ templateId, memberStatus,  }) {
    const { logged, userInfo } = xmini.store.state.user;

    if (!logged) {
      return
    }
    if (!templateId) {
      my.showToast('缺少 templateId');
    }

    // const systemInfo = me.$getSystemInfo();
    // version = '10.1.65.6000'
    // '10.1.70.6001'
    api.getMemberInfo(
      {
        templateId
      },
      res => {
        console.log('getMemberInfo:', res);
        const {
          isNewAgreement = false, // 新老用户
        } = res.data;

        const data = this.getPluginJson({
          ...res.data,
          userType: !isNewAgreement ? 1 : 2,
          memberStatus,
        });

        console.log('plugin:', data);
        // const SDKVersion = my.SDKVersion;
        // 新用户 1.18.4. 1.19.0
        // console.log('systemInfo===:', systemInfo);
        // debugger
        // if (isNewAgreement && systemInfo.version) {
        //   if (!versionCompare(systemInfo.version, '10.1.69')) {
        //     my.alert({
        //       title: '亲',
        //       content: '请升级支付宝版本吧',
        //       buttonText: '我知道了',
        //       success: () => {
        //         //
        //       },
        //     });
        //     return;
        //   }
        // }

        xmini.store.dispatch('setMemberTemplateId', templateId)
        my.navigateToMiniService({
          // serviceId: '2019022363383002',                 // 轻会员插件id，固定值
          // servicePage: memberInfo.pageSite,
          // extraData: memberInfo.extraParam,
          ...data,
          success: (res) => {
            console.log('open miniService success:', res)
          },
          fail: (err) => {
            console.log('open miniService fail:', err)
            xmini.store.dispatch('setMemberTemplateId', '')
            xmini.piwikEvent('member_err', err);
            my.showToast('请稍后在试！');
          },
          complete: (res) => {
            console.log('open miniService complete:', res)
          }
        })

      },
      err => {

      }
    )


  },
  getPluginJson(data) {
    const { logged, userInfo } = xmini.store.state.user;
    const { userType, memberStatus } = data;
      //serviceId: '2019022363383002',                 // 轻会员插件id，固定值
  //     servicePage: memberInfo.pageSite,
  //     extraData: memberInfo.extraParam,

    // 老插件id serviceId: '2019022363383002'
    //
    let serviceId = '';
    let servicePage = '';
    let extraData = {};

    // userType 用户类型 [2新|1老]
    if (userType == 1) {
      serviceId = '2019022363383002';
      // 会员状态 [已开通|未开通]
      if (memberStatus) {
        // servicePage = 'pages/easyMember/sign/index'; // 插件的已开通页
        servicePage = 'pages/easyMember/home/index'; // 插件的已开通页
        extraData = {
          "alipay.huabei.easyMember.pId": data.pid,                                    // 商户id
          "alipay.huabei.easyMember.userId": userInfo.alipay_user_id,                  // 支付宝用户userId
          "alipay.huabei.easyMember.templateId": data.templateId,                      // 轻会员模板id

          "alipay.huabei.easyMember.agreementNo": data.agreementNo,                    // 轻会员协议号
          "alipay.huabei.easyMember.totalDiscountAmount": data.totalDiscountAmount,    // string 累计优惠金额
          "alipay.huabei.easyMember.totalRealPayAmount": data.totalRealPayAmount,      // string 累计⽀付宝实付⾦额(承诺会员模式必 传)， 单位 元
          "alipay.huabei.easyMember.totalPayCount": data.totalPayCount,                // string 累计⽀付宝⽀付次数， 整型数字
          "alipay.huabei.easyMember.vourcher": data.vourcher,                          // map类型 代金券，不传不展示
          "alipay.huabei.easyMember.tradeList": data.tradeList                         // 交易列表。数组+对象
        }
      } else {
        servicePage = 'pages/easyMember/sign/index'; // 未开通页
        extraData = {
          "alipay.huabei.easyMember.pId": data.pid,                             // 商户id
          "alipay.huabei.easyMember.userId": userInfo.alipay_user_id,                     // 支付宝用户userId
          "alipay.huabei.easyMember.templateId": data.templateId,                      // 轻会员模板id
        }
      }

    } else {
      serviceId = '2019072365974237';
      // servicePage = 'pages/hz-enjoy/main/index';
      servicePage = 'pages/hz-enjoy/main/index';
      extraData = {
        "alipay.huabei.hz-enjoy.templateId": data.templateId, // 轻会员模板id
        "alipay.huabei.hz-enjoy.partnerId": data.pid, // 商户id
        "alipay.huabei.hz-enjoy.vourcher": data.vourcher, //商户惠券数量
        // "alipay.huabei.hz-enjoy.userId": userInfo.alipay_user_id,

      }
    }


    return {
      serviceId,
      servicePage,
      extraData
    }

  },



}
