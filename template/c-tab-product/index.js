import cTabs from '/template/c-tabs';

export default {
  ...cTabs,
  // onChange
  // 暂时没有用到
  tabProductOnChenge(e) {
    console.log('tabProductOnChenge', e)
    // const { moduleIndex, index } = e.currentTarget.dataset;
    // const dataString = `modules[${moduleIndex}].currentIndex`;
    // this.setData({
    //   [dataString]: current,
    // })
  },
  // // 展开
  tabProductMoreClick(e) {
    // console.log(e)
    const { moduleIndex, index } = e.currentTarget.dataset;
    const { tabs = [], tabProduct = [], moduleId, comment } = this.data.modules[moduleIndex];
    const isShowMore = tabProduct[index].isShowMore;
    const tabItem = tabs[index] || {};
    const dataString = `modules[${moduleIndex}].tabProduct[${index}].isShowMore`;
    this.setData({
      [dataString]: !isShowMore,
    });
    // 统计
    xmini.piwikEvent('c_zt_tagproductmore', {
      moduleId,
      comment,
      ...tabItem
    });
    // 从新计算各锚点的位置
    if(this.pageInfo.anchorId) {
      this.getDomInfo();
    }
  }
};

