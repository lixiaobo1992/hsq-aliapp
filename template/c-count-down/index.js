import {
  xmini,
} from '../../config/xmini';
const countDown = {
  countDownOnClick(e) {
    // console.log(e);
    const { id, start, index, status, moduleIndex } = e.currentTarget.dataset;

    const { moduleId, comment } = this.data.modules[moduleIndex];

    // 统计
    xmini.piwikEvent('s_zt_miaosha', {
      comment,
      moduleId,
      startText: start,
      id, //  秒杀标签id
    });

    this.setData({
      [`modules[${moduleIndex}]['curtIndex']`]: index,
      [`modules[${moduleIndex}]['curtStatus']`]: status,
    });
    this.pageInfo.activeIndex[moduleId] = index;
    // 从新计算各锚点的位置
    if(this.pageInfo.anchorId) {
      this.getDomInfo();
    }
  }
}
export default countDown;
