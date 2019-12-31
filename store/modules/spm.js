// import { storage } from '@xmini/x-mini/lib/core/storage';
import api from '/api';


const setArray = ['spm', 'page', 'block'];
export default {
  state: {
    pre_spm: '',

    spm: 'aliapp',
    page: '',
    block: '',

    currentSpm: 'aliapp',
  },
  mutations: {
    ['SET_SPM']: (state, spmData = {}) => {
      console.log('SET_SPM', spmData)
      for (let key in spmData) {
        if (setArray.includes(key)) {
          // 不等于时更新
          if (state[key] != spmData[key]) {
            state[key] = spmData[key];
          }
        }
      }

      const currentSpm = getNewSPM(state);
      if (currentSpm != state.currentSpm) {
        state.pre_spm = state.currentSpm;
      }
      state.currentSpm = currentSpm;

      console.log('state.currentSpm:',state.currentSpm);
    },
    ['REPLACE_SPM']:  (state, newSpm = {}) => {
      // 替换spm
      if (state.currentSpm != newSpm) {
        const tempSpm = state.currentSpm
        state.currentSpm = newSpm;
        state.pre_spm = tempSpm;
      }
    }
  },
  actions: {
    // 修改spm
    updatedSPM({ commit, state }, spmData) {
      console.log('::::::::::::::::::修改spm');
      commit('SET_SPM', spmData);
    },
    replaceSPM({ commit, state }, newSpm) {
      console.log('::::::::::::::::::修改spm');
      commit('REPLACE_SPM', newSpm);
    }
  },
}



function getNewSPM(state) {
  const {
    spm= 'aliapp',
    page= '',
    block= '', } = state;
  let tempSpmArray = [spm];

  if (page) {
    tempSpmArray.push(page);
    if (block) {
      tempSpmArray.push(block);
    }
  }

  return tempSpmArray.join('.')
}
