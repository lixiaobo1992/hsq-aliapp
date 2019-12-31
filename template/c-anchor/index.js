import {
  xmini
} from '../../config/xmini';

let timer = null;
const anchor = {
  onClickAnchor: false,
  anchorOnSelect(e) { // 点击锚点
    // console.log(e);
    const { idx, index, id, aid, name } = e.currentTarget.dataset;
    const { list = [], moduleId, comment } = this.data.modules[idx];
    // 统计
    xmini.piwikEvent('c_zt_maodian', {
      comment,
      moduleId,
      name,
      id: aid, //  锚点id
    });
    // console.log(this.anchorDoms);
    if (!this.anchorDoms[`#zt${id}`]) {
      return;
    }
    let scrollTop = this.anchorDoms[`#zt${id}`]['top'];
    const padding = this.anchorDoms[`#zt${id}`]['padding'];
    const { anchorId } = this.pageInfo;
    const anchorRect = this.anchorDoms[anchorId];
    if (scrollTop > anchorRect['top'] + anchorRect['height'] - 3) {
      scrollTop = scrollTop - anchorRect['height'] + anchorRect['padding'] + padding; // 减去锚点组件的高度
    }
    for (let i = 0; i < list.length; i++) {
      if (i == index) {
        list[i]['active'] = true;
      } else {
        list[i]['active'] = false;
      }
    }
    this.onClickAnchor = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      this.onClickAnchor = false;
    }, 1000);
    this.pageScrollTo(scrollTop); // 使用的是zt页面的方法
    this.setData({
      [`modules[${idx}]['list']`]: list
    }, () => {
      // console.log(this.data.modules[idx].list);
    });
    this.anchorOnSwitchType(1, idx);
  },
  anchorOnGetInfo() { // 锚点是否换行
    const { anchorId, anchorIndex } = this.pageInfo;
    if (anchorId) {
      this.getRect(anchorId).then((result) => {
        this.getRect(anchorId + ' .c-anchor-list').then((res) => {
          let equalH = true;
          if (Math.abs(result.height - res.height) > 5) {
            equalH = false;
          }
          this.setData({
            [`modules[${anchorIndex}]['equalH']`]: equalH
          });
        })
      });
    }
  },
  anchorOnScrollSelect(scrollTop) { // 根据高度选中激活锚点
    if (this.onClickAnchor) {
      return;
    }
    const { anchorId, anchorIndex, anchorActiveIndex } = this.pageInfo;
    if (anchorId) {
      const anchorRect = this.anchorDoms[anchorId];
      if (scrollTop > anchorRect['top'] + anchorRect['height']) {
        scrollTop += anchorRect['height'] + 3; // 减去锚点组件的高度
      }
      const { list = [] } = this.data.modules[anchorIndex];
      const arr = [];
      for (let key in this.anchorDoms) {
        if (key != anchorId) {
          arr.push(this.anchorDoms[key]['top']);
        }
      }
      arr.sort((a, b) => a-b);
      // console.log('arr', arr);
      let curtIndex = 0;
      const arrLen = arr.length;
      for (let i = 0; i < arrLen; i++) {
        if (scrollTop > arr[i] && scrollTop < arr[i + 1]) {
          curtIndex = i;
        }
      }
      if (scrollTop <= arr[0]) {
        curtIndex = 0;
      }
      if (scrollTop > arr[arrLen - 1]) {
        curtIndex = arrLen - 1;
      }
      // console.log('curtIndex', curtIndex);
      if (curtIndex != anchorActiveIndex) { // 防止重复set
        for (let j = 0; j < list.length; j++) {
          if (j == curtIndex) {
            list[j]['active'] = true;
          } else {
            list[j]['active'] = false;
          }
        }
        this.setData({
          [`modules[${anchorIndex}]['list']`]: list
        });
        this.pageInfo.anchorActiveIndex = curtIndex;
      }
    }
  },
  anchorOnSwitch(e) { // 切换展开
    // console.log(e);
    const { idx } = e.currentTarget.dataset;
    const { switchClass = '', equalH, moduleId } = this.data.modules[idx];

    // 统计
    xmini.piwikEvent('c_zt_maodianmore', {
      moduleId
    });

    if (!equalH) {
      this.anchorOnSwitchType(switchClass, idx);
    }
  },
  anchorOnSwitchType(type, idx) { // type有值，则要关闭
    let switchClass = '';
    if (type) {
      switchClass = '';
    } else {
      switchClass = 'c-anchor-switchon';
    }
    this.setData({
      [`modules[${idx}]['switchClass']`]: switchClass
    });
  }
}
export default anchor;
