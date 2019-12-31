export default {

  // // 展开
  cProduct3MoreClick(e) {
    const { moduleIndex } = e.currentTarget.dataset;
    const { productData, comment, moduleId } = this.data.modules[moduleIndex];
    const isShowMore = productData.isShowMore;
    const dataString = `modules[${moduleIndex}].productData.isShowMore`;
    this.setData({
      [dataString]: !isShowMore,
    })
    // 统计
    xmini.piwikEvent('c_zt_shopgoodsmore', {
      moduleId,
      comment
    });
    // 从新计算各锚点的位置
    if(this.pageInfo.anchorId) {
      this.getDomInfo();
    }
  }
};
