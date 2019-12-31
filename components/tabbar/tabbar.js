import { tabPages } from '/utils/pages';
export default {

  onSwitchTab(e){  // 切换菜单
    const { page } = e.currentTarget.dataset;

    const currentPage = this.getPageName();

    if (page !== currentPage) {
      const tempPath = tabPages[page]
      console.log(tempPath)
      if (tempPath) {
        my.reLaunch({
          url: `/${tempPath}`
        })
      } else {
        console.warn('请检查页面是否为菜单页')
      }
    }
  },
}
