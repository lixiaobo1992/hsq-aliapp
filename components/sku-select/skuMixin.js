export default {
  // 提供给子组件 修改父组件data 的方法
  setCurrentData(data) {
    console.log('setCurrentData', data);
    const { currentSkuData } = data;
    // // const { data }
    // 对 currentSkuData 做特殊处理
    if (currentSkuData) {
      const { currentSkuData: oldCurrentSkuData } = this.data;

      if (oldCurrentSkuData.skuid && currentSkuData.skuid && currentSkuData.skuid !== oldCurrentSkuData.skuid) {
        this.skuDataOnChange && this.skuDataOnChange(currentSkuData);
      }
    }

    this.setData({
      ...data
    })
  },
}
