import { storage } from '@xmini/x-mini/lib/core/storage';
import api from '/api';

let userInfo = storage.get('userInfo') || {};

let riskgoData = storage.get('riskgoData') || {
  riskgo1: {},
  riskgo2: {}
};

function isLogin(data = {}) {
  return !!(data.token && data.user_id);
}

export default {
  state: {
    userInfo: userInfo,
    logged: isLogin(userInfo),
    isRefuseAuth: false, // 用户是否拒绝授权了

    memberTemplateId: '', // 轻会员模版id 临时存放

    riskgoOrigin: '', // 
    riskgoData: riskgoData, // 用户riskgoData
    // riskgoData: { // 用户riskgoData
    //   riskgo1: {},
    //   riskgo2: {}
    // },

  },
  mutations: {
    ['SET_USER_INFO']: (state, userData) => {
      console.log('::::::::::::::::::更新用户信息');
      state.userInfo = userData
      state.logged = isLogin(userData);
      api.setCommonParams({
        token: (userData && userData.token) || '',
        uid: (userData && userData.user_id) || '',
        uuid: (userData && userData.user_id) || '',
      })

      storage.set('userInfo', userData)
    },
    ['SET_IS_AUTH_STATUS'](state, flag){
      state.isRefuseAuth = flag;
    },
    ['SET_MEMBER_TEMPLATE_ID'](state, id){
      console.log('=====memberTemplateId', id);
      state.memberTemplateId = id;
    },
    ['SET_RISKGO_DATA'](state, riskgoData){
      const { scene, data = {} } = riskgoData;
      if (!scene) return;

      let tempRiskgoData = state.riskgoData;
      
      tempRiskgoData[`riskgo${scene}`] = data;
      state.riskgoData = tempRiskgoData;
      storage.set('riskgoData', tempRiskgoData)
    },
    ['SET_RISKGO_ORIGIN'](state, origin){
      state.riskgoOrigin = origin;
    },
  },
  actions: {
    // 修改用户信息
    setUserInfo({ commit, state }, userData) {
      console.log('::::::::::::::::::修改用户信息');
      commit('SET_USER_INFO', userData)
    },
    setIsRefuseAuth({ commit, state }, flag) {
      commit('SET_IS_AUTH_STATUS', flag)
    },
    setMemberTemplateId({ commit, state }, id) {
      commit('SET_MEMBER_TEMPLATE_ID', id)
    },
    setRiskgoData({ commit, state }, riskgoData) {
      commit('SET_RISKGO_DATA', riskgoData)
    },
    setRiskgoOrigin({ commit, state }, origin) {
      commit('SET_RISKGO_ORIGIN', origin)
    },
  },
}