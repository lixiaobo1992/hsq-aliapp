
import {
  me,
  xmini,
} from '../config/xmini';

import api from '/api';
import { MY_APPID, WHITE_APPID_KEY_VAL } from '/config/index'

// {
//   success: true,
//   riskResultDesc: '{"rank1":"等级1"}',
//   uniqueId: 'xx',
//   riskResult: {
//     riskinfo_anticheat_common: 'rank1',
//     riskinfo_anticheat_common_infocode: '2278'
//   }
// }


export default {
  // scene:
  // 异业联盟: RISKGO_CROSSOVER
  // 营销反作弊: RISKGO_MARKETANTICHEAT
  getAlipayParams({ scene, success, fail }) {
    const { logged, userInfo } = xmini.store.state.user;
    // 判断是否支持营销反作弊功能
    if (!my.canIUse("ap.preventCheat")) {
      console.log('不支持营销功能')
      return;
    }

    if (!logged) return;
    if (!scene) {
      my.showToast('缺少 scene');
      return;
    }
    const that = this;

    // scene 1 2

    const tempScene = {
      1: 'RISKGO_MARKETANTICHEAT', // 营销反作弊
      2: 'RISKGO_CROSSOVER',  // 异业联盟
    }

    api.getAlipayParams({
      isLoading: false,
    }, res => {
      const riskgo_switch = res.data.riskgo_switch;
      const tempParams = {...res.data, scene: tempScene[scene]};
      const data = that.dealAlipayParams(tempParams)
      console.log('preventCheat:data:', data);
      my.ap.preventCheat({
        ...data,
        success(res) {
          console.log('====preventCheat', res);
          const tempData = {
            scene: tempScene[scene],
            data: res,
          }

          let isUpData = false
          let riskgoData = xmini.store.state.user.riskgoData;
          // 本地数据
          let tempRiskgoData = riskgoData[`riskgo${scene}`];

          const newRank = that.getRankVal(res);
          const oldRank = that.getRankVal(tempRiskgoData);
          console.log(newRank, oldRank);
          if (newRank != oldRank) {
            isUpData = true;
          }
          // riskgo_switch 一个开关
          if (isUpData && riskgo_switch) {
            xmini.store.dispatch('setRiskgoData', {...tempData, scene });
            that.updateRiskgoUserInfo(tempData);
          }
          success && success(tempData);
        },
        fail(err) {
          console.log(" err ====== ",err);
          fail && fail({
            errname: 'api:my.ap.preventCheat',
            errdata: err,
          });
        },
      })

    }, err => {
      console.log(err);
      fail && fail({
        errname: 'api:api.getAlipayParams',
        errdata: err,
      });
      return true;
    })
  },
  getRankVal(data) {
    let rankVal = '';
    let riskResult = data.riskResult || '';
    if (riskResult) {
      riskResult = JSON.parse(riskResult);
      rankVal = (riskResult.riskinfo_anticheat_common || '');
    }
    return rankVal;
  },
  dealAlipayParams(data) {
    const { pid = "", biz_context = {}, scene } = data;
    const { logged, userInfo } = xmini.store.state.user;

    let params = {
      pid,
      appId: MY_APPID,
      bizContext: {
        scene,
        service: biz_context.service,
        risk_type: biz_context.risk_type,
        mobile_no: "null",
        user_id: userInfo.alipay_user_id,
        pid: biz_context.pid,
      }
    };
    return params;
  },
  // 更新 riskgo 用户信息
  updateRiskgoUserInfo({ data, scene }) {
    api.addUserGrade({
      isLoading: true,
      scene,
      risk_result: data.riskResult,
      unique_id: data.uniqueId
    },res => {
      //
    },err => {
      console.log(err,'上报');
      return true;
    })
  },


  // 更新riskgo 信息
  updatedRiskgoData() {
    const that = this;
    // 获取riskgo
    this.getAlipayParams({
      scene: 2,
      success(res) {
        console.log('detail.js getAlipayParams====success:',  res);

        let riskResult = res.data.riskResult
        if (riskResult) {
          riskResult = JSON.parse(riskResult);
          const testRiskgo = (riskResult.riskinfo_anticheat_common || '');
          that.getRiskgoAdInfo(testRiskgo);
        }

      },
      fail(err){
        console.log('detail.js getAlipayParams====err:', err)
      }
    })
  },
  // 获取riskgo 广告信息
  getRiskgoAdInfo(riskinfo) {
    //
    console.log('api:getRiskAdInfo==', riskinfo)
    api.getRiskAdInfo(
      {
        isLoading: false,
        riskRank: riskinfo
      },
      res => {

        const { banner = '', link = '', rank = '' } = res.data;
        console.log('riskgo:banner', banner);
        if (banner) {
          this.setData({
            riskgoAd: {
              src: banner,
              link,
              piwikEvent: 'c_riskgo_banner',
              piwikData: {
                rank: rank,
                image: banner,
                link,
              }
            },
          })
          // 广告投放场景回传
          this.syncAlipayRiskAdReport(rank);
        }
      },
      err => {
        return true;
      }
    );
  },
  // 广告投放场景回传
  syncAlipayRiskAdReport(riskinfo) {
    const ranks = ['rank4', 'rank5', 'rank6'];
    if (!ranks.includes(riskinfo)) return;
    api.syncAlipayRisk(
      {
        isLoading: false,
        processCode: 16,
        rank:riskinfo
      },
      res => {
        //
      },
      err => {
        return true;
      }
    )
  },
  // 风险商户数据同步 流量回传
  syncAlipayRiskFlowReport() {
    const { logged, riskgoOrigin } = xmini.store.state.user;
    if (!logged || !riskgoOrigin) return;

    const tmepAppId = WHITE_APPID_KEY_VAL[riskgoOrigin];
    if (!tmepAppId) return;
    xmini.store.dispatch('setRiskgoOrigin', '');
    api.syncAlipayRisk(
      {
        isLoading: false,
        processCode: 17,
        appChannelId: tmepAppId,
      },
      res => {
        //
      },
      err => {
        return true;
      }
    )
  },
}
