
import {
  xmini
} from '../../config/xmini';

export default {
  // onChange
  cTabsInit(moduleIndex) {
    // console.log('tabs 模块初始化')
    const that = this;
    this[`tab-${moduleIndex}-offset`] = [];
    this[`tab-${moduleIndex}-nav`] = {};
    const moduleItem = this.data.modules[moduleIndex];
    const { list = []} = moduleItem.tabs;
    // 当tab 数小于4时 不显示滑动，平分tabbox
    if (list.length < 4) {
      const dataString = `modules[${moduleIndex}].tabs.scrollable`
      this.setData({
        [dataString]: false
      })
    }

    // let tabOffset = []
    this.cTabsUpDated(moduleIndex, () => {
      this.cTabsSetActiveTab(moduleIndex)
    })
  },
  // 更新tabs 信息
  cTabsUpDated(moduleIndex, callBack) {
    const that = this;
    let i = 0;
    this.getRect(`.c-tabs-${moduleIndex} .c-tabs-item`, true).then(function (rects) {
      that[`tab-${moduleIndex}-offset`] = rects;

      if (callBack && typeof callBack == 'function') {
        i++;
        if (i==2){
          callBack.call(that);
        }
      }

    })
    this.getRect(`.c-tabs-${moduleIndex} .c-tabs-nav`).then(function (navRect) {
      that[`tab-${moduleIndex}-nav`] = navRect;
      if (callBack && typeof callBack == 'function') {
        i++;
        if (i==2){
          callBack.call(that);
        }
      }
    })
  },
  cTabsClick(e) {
    console.log(e);
    const { index, moduleIndex, chengeEventName, item = {} } = e.currentTarget.dataset;
    const { currentIndex, moduleId, comment } = this.data.modules[moduleIndex];

    // 统计
    xmini.piwikEvent('c_zt_tagproduct', {
      moduleId,
      comment,
      ...item,
    });
    if (currentIndex !== index) {
      // this[chengeEventName](e);
      const dataString = `modules[${moduleIndex}].currentIndex`
      this.setData({
        [dataString]: index
      })
      this.pageInfo.activeIndex[moduleId] = index;
      console.log('activeIndex', this.pageInfo.activeIndex);
      this.cTabsSetActiveTab(moduleIndex);

      // 从新计算各锚点的位置
      if(this.pageInfo.anchorId) {
        this.getDomInfo();
      }
    }
  },

  cTabsSetActiveTab(moduleIndex) {
    var _this = this;
    this.setData({}, function () {
      _this.cTabsSetLine(moduleIndex);
      _this.cTabsScrollIntoView(moduleIndex);

      _this.cTabsUpDated(moduleIndex); // 更新 tab 标签信息
    });
  },
  cTabsSetLine(moduleIndex) {
    const that = this;
    // 主页面方法 获取页面节点
    // 根据模块id 获取
    // this.getRect(`.c-tabs-${moduleIndex} .c-tabs-item`, true).then(function (rects) {
      // console.log(rects)
    const tabOffset = this[`tab-${moduleIndex}-offset`]
    if (tabOffset.length) {
      const { currentIndex, tabs: { lineWidth, activColor } } = that.data.modules[moduleIndex]
      var rect = tabOffset[currentIndex];
      var width = lineWidth || rect.width / 2;
      var left = tabOffset.slice(0, currentIndex).reduce(function (prev, curr) {
        return prev + curr.width;
      }, 0);
      left += (rect.width - width) / 2;
      const dataString = `modules[${moduleIndex}].tabs.lineStyle`
      that.setData({
        [dataString]: `
          width: ${width}px;
          background-color: ${activColor};
          transform: translateX(${left}px);
          transition-duration: ${0.3}s;
        `
      });
    }
    // });
  },

  cTabsScrollIntoView(moduleIndex) {
    var _this = this;

    const { currentIndex, tabs: { scrollable } } = this.data.modules[moduleIndex]

    if (!scrollable) {
      return;
    }
    // 根据模块id 获取
    // this.getRect(`.c-tabs-${moduleIndex} .c-tabs-item`, true).then(function (tabRects) {
    const tabOffset = this[`tab-${moduleIndex}-offset`]
    if (tabOffset.length) {
      var tabRect = tabOffset[currentIndex];
      var offsetLeft = tabOffset.slice(0, currentIndex).reduce(function (prev, curr) {
        return prev + curr.width;
      }, 0);
      var tabWidth = tabRect.width;
      // _this.getRect(`.c-tabs-${moduleIndex} .c-tabs-nav`).then(function (navRect) {
      const tabNav = this[`tab-${moduleIndex}-nav`];
      if (tabNav.width) {
        var navWidth = tabNav.width;
        const dataString = `modules[${moduleIndex}].tabs.scrollLeft`;
        // console.log('offsetLeft - (navWidth - tabWidth) / 2', offsetLeft - (navWidth - tabWidth) / 2)
        _this.setData({
          [dataString]: offsetLeft - (navWidth - tabWidth) / 2
        });
      }
      // });
    }
    // });
  }
};

