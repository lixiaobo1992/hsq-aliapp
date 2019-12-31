

export default {
  // onChange
  swiperProductOnChenge(e) {
    // console.log('swiperProductOnChenge', e)
    const { moduleIndex } = e.currentTarget.dataset;
    const { current = 0 } = e.detail;
    const { swiper = {}, moduleId } = this.data.modules[moduleIndex]
    const item = swiper.list[current];
    // console.log(item);
    xmini.piwikEvent('s_zt_lunboproduct', item.piwikData);
    const dataString = `modules[${moduleIndex}].currentIndex`;
    this.setData({
      [dataString]: current,
    });

    this.pageInfo.activeIndex[moduleId] = current;

    // 从新计算各锚点的位置
    if(this.pageInfo.anchorId) {
      this.getDomInfo();
    }
  },
  // // 展开
  // swiperProductMoreClick(e) {
  //   const { index } = e.currentTarget.dataset;
  //   const isShowMore = this.data.swiperProduct.productData.list[index].isShowMore;
  //   const dataString = `swiperProduct.productData.list[${ index }].isShowMore`;
  //   this.setData({
  //     [dataString]: !isShowMore,
  //   })
  // }
};

