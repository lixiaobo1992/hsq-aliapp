### 接入说明

- sku-select 组件
- props
> - 属性
> - isPopupShow: false, // 控制
> - normSelectTag: 0, // 0 显示两个按钮 1 添加购物车 2 立即购买
> - currentSum: 1, // 当前 已选产品数量
> - attrData: [], // 规格信息
> - skuStocksList: {}, // 可用skulist
> - 
> - defaultSelectedIds: [], // 默认选择 id
> - defaultSkuData: {}, // 默认skuData
> - isBtnActive: false, // 按钮否可用
> - maxBuySum: 100, // 最大限购数
> - props事件:
> - onSetParentData: (data) => {},
> - onBtnClick: (data) => {},


##### 页面引入

- sku-deal.js

``` js
  // 老专题
  import dealSku from '/components/sku-select/sku-deal';

  {
    ...dealSku,
    data: {
      // sku
      isShowPopup: false, // v-model
      normSelectTag: 0,
      currentSum: 1, //!!保留字段，sku-select 内会修改当前字段
      maxBuySum: 10,

      attrData: [], // !!保留字段
      skuStocksList: {}, // 属性ID 对应 sku列表 !!保留字段

      defaultSelectedIds: [], // 默认已选择id !!保留字段
      defaultSkuData: {}, // 默认skuData !!保留字段
      
      currentSkuData: {}, // 当前skuData !!保留字段，sku-select 内会修改当前字段
      selectedAttrName: [], // 已选择 attr !!保留字段，sku-select 内会修改当前字段
      notSelectedAttrName: '', // 未选择属性提示 !!保留字段，sku-select 内会修改当前字段
    }
  }
```


##### 提供一个按钮的事件
- onBtnClick 接收一个对象，{ type: '' }

- skuDataOnChenge // 页面要提供一个监听sku 数据变更