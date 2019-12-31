import {
  me,
  mapState,
  xPage,
} from '../../config/xmini';
import api from '/api';
// import list from '/components/list';
import {
  mixins,
} from '/utils';
import authMixin from '/utils/authMixin';
// console.log('api list:')
// console.log(Object.keys(api))
const app = getApp();

import dataJson from './data.js'


xPage({
  ...mixins,
  _data: {
    attrMap: {},
    cachedSkuList: {},
    selectdSkuAttrData: [],
  },
  data: {
    currentSkuData: {},


    attrData: [],
  },

  onLoad(query) {
    this.onPageInit(query);
  },
  onShow() {
    this.initSku();
  },
  onReady() {
  },
  attrSelect(e) {
    const { parentIndex, index, disabled = false } = e.currentTarget.dataset;
    const { attrData = [] } = this.data;
    // console.log(e);
    if (!disabled) {
      //
      const parentAttr = attrData[parentIndex] || {};
      const currentAttr = parentAttr.list && parentAttr.list[index] || '';

      if (!currentAttr) return;

      const isBeing = this.getIsSelectAttr(parentAttr.attr_id, currentAttr);

      console.log('isBeing:', isBeing);

      if (isBeing) {
        delete this._data.selectdSkuAttrData[parentAttr.attr_id];
      } else {
        // 判断当前元素是否是同级
        if (this._data.selectdSkuAttrData[parentAttr.attr_id]) {
          delete this._data.selectdSkuAttrData[parentAttr.attr_id];
        }
        this._data.selectdSkuAttrData[parentAttr.attr_id] = {
          attr_id: parentAttr.attr_id,
          attr_name: parentAttr.attr_name,
          ids: currentAttr.ids,
          value: currentAttr.value
        };
      }

      this.dealNewAttr();
      this.getSelectdAttrSkuId();
    }
  },
  dealNewAttr() {
    console.log('this._data == selectdSkuAttrData:', this._data.selectdSkuAttrData);
    // 根据已选属性 更新 attrList
    const { attrData = [] } = this.data;
    const { selectdSkuAttrData = {}, cachedSkuList = {} } = this._data;
    const selectdSkuAttrDataKeys = Object.keys(selectdSkuAttrData);
    const cachedSkuListKeys = Object.keys(cachedSkuList);
    for (let i = 0; i < attrData.length; i++) {
      let attrItem = attrData[i];
      if (!selectdSkuAttrData[attrItem.attr_id]) {
        delete attrItem.active;
      } else {
        attrItem.active = true;
      }
      for(let s = 0; s < attrItem.list.length; s++) {
        let tempItem = attrItem.list[s];
        // 存在已选项
        if (selectdSkuAttrDataKeys.length) {
          // 是否存在
          let isBeing = this.getIsSelectAttr(attrItem.attr_id, tempItem)
          if (isBeing) {
            tempItem.active = true;
          } else {
            delete tempItem.active;

            isDisabled(tempItem);
          }
        } else {
          delete tempItem.active;

          isDisabled(tempItem);
        }
      }

    }
    // 判断 当前项是否可选
    function isDisabled (tempItem) {
      let isDisabled = true;
      // console.log('cachedSkuListKeys:', cachedSkuListKeys);
      if (cachedSkuListKeys.includes(tempItem.value)) {
        isDisabled = false
      }

      if (isDisabled) {
        tempItem.disabled = true;
      } else {
        delete tempItem.disabled;
      }

    }

    console.log('new attrData:', attrData)
    this.setData({
      attrData,
    })
  },
  // 根据已选项获取当前sku
  getSelectdAttrSkuId() {
    const { selectdSkuAttrData = {} } = this._data;

    const selectdSkuAttrDataKeys = Object.keys(selectdSkuAttrData);
    if (!selectdSkuAttrDataKeys.length) return;

    // 排序
    selectdSkuAttrDataKeys.sort((a, b) => {
      return parseInt(a)  - parseInt(b)
    })

    console.log('selectdSkuAttrDataKeys: ', selectdSkuAttrDataKeys);

    let tempstr = [];
    for(let i = 0; i < selectdSkuAttrDataKeys.length; i++) {
      const key = selectdSkuAttrDataKeys[i];

      tempstr.push(selectdSkuAttrData[key].value);
    }

    tempstr = tempstr.join(';');
    console.log('tempstr:', tempstr);
    const currentAttrIds = this._data.cachedSkuList[tempstr];
    const currenSkuData = dataJson.attrDatas[currentAttrIds];
    console.log('currenSkuData:', currenSkuData)
  },
  getIsSelectAttr(key_id, attr) {
    const { selectdSkuAttrData = {} } = this._data;
    const tempAttr = selectdSkuAttrData[key_id] || {};
    if (tempAttr.value == attr.value) {
      return true;
    }
    return false;
  },

  initSku() {

    const { attrKeys, attrDatas } = dataJson;

    let attrMap = {};
    let cachedSkuList = {};
    let selectdSkuAttrData = {};

    // 处理一个新的属性列表
    let attrList = [];

    for(let i = 0; i < attrKeys.length; i++) {
      const attr = attrKeys[i];
      if (!attr || !attr.list) {
        continue;
      }
      // 定义新的属性项
      let attrItem = {};
      attrItem['attr_id'] = i;
      attrItem['attr_name'] = attr.name;
      attrItem['list'] = [];

      let map = {};
      if (attr.name) {
        map['attr_id'] = attrItem['attr_id'];
        map['attr_name'] = attr.name;
        map['value'] = attr.defaultAttr;
        for(let s = 0; s < attr.list.length; s++) {
          let item = attr.list[s]
          for (let entry in item) {
            if (map['value'] == entry) {
              map['ids'] = item[entry];
            }
          }
        }
      }
      // 记录已选项
      selectdSkuAttrData[attrItem['attr_id']] = map;
      // 遍历每一个属性
      for(let s = 0; s < attr.list.length; s++) {
        const tempItem = attr.list[s];
        for(let key in tempItem) {
          attrItem['list'].push({
            ids: tempItem[key],
            value: key
          })
          // 将属性的key&value交换 同时转换为map
          attrMap[tempItem[key]] = key;
        }
      }

      attrList.push(attrItem);
    }

    for(let key in attrDatas) {
      const tempArray = key.split(';');
      let nameList = [];
      for (let i = 0; i < tempArray.length; i++) {
        const attrName = getAttrNameByAttrId(tempArray[i]);
        if (attrName) {
          nameList.push(attrName + '')
        }
      }
      mapAttr('', 0, nameList, key, cachedSkuList)

    }

    this._data.attrMap = attrMap;
    this._data.selectdSkuAttrData = selectdSkuAttrData;
    this._data.cachedSkuList = cachedSkuList;


    console.log('cachedSkuList:', Object.keys(cachedSkuList).length, cachedSkuList);
    console.log('attrMap:', attrMap);
    console.log('selectdSkuAttrData:', selectdSkuAttrData)
    console.log('attrList:', attrList);

    this.getSelectdAttrSkuId();

    this.setData({
      attrData: attrList
    }, () =>{
      this.dealNewAttr();
    })


    function getAttrNameByAttrId(attrid) {
      for (let key in attrMap) {
        if (key.includes(attrid)) {
          return attrMap[key];
        }
      }
      return null;
    }

    function mapAttr(key, index, attrNames, skuKey, map) {
      if (index == attrNames.length){
        return;
      }

      for(let i = index; i < attrNames.length; i++) {
        if (key && !key.endsWith(';')) {
          key += ';';
        }
        let newkey = key + attrNames[i];
        map[newkey] = skuKey;
        index++;
        mapAttr(newkey, index, attrNames,skuKey, map)
      }
    }

  }

});


