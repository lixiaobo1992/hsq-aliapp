
export default {
  updateGoHomeStatus() {
    let isShowGoHome = getCurrentPages().length < 2;
    if(this.pageQuery.no_home){
      isShowGoHome = false;
    }
    this.setData({
      isShowGoHome,
    });
  },
  // 滚动时触发
  // onScroll(e){
    // let scrollTop = e.detail.scrollTop;
    // if(scrollTop > 200 && !this.data.showBackTop){
    //   this.setData({
    //     showBackTop: true
    //   });
    // } else if(scrollTop < 200 && this.data.showBackTop){
    //   this.setData({
    //     showBackTop: false,
    //     viewId: '',
    //   });
    // }
  // },
  // onBackTop(){  // 返回到顶部
  //   this.setData({
  //     viewId: 'scrollTop',
  //   });
  // },
}
