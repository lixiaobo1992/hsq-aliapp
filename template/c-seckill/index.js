import countDown from '/template/c-count-down/index';
import TimingTask from '/utils/timingTask';
import { formatCountDown } from '/utils/dateUtil';

const cSeckill = {
  ...countDown,
  ...TimingTask,
  seckillOnStart(id, tempEndTime, index) {
    const taskName = `SECKILL_${id}`;
    const tempFun = ()=>{
      if (this.data.modules && this.data.modules[index]) {
        const { seckillingIndex } = this.data.modules[index];
        let timestamp = this.makeUpTime(parseInt(new Date().getTime() / 1000));
        const lastTime = tempEndTime - timestamp;
        if (lastTime > 0) {
          if (seckillingIndex >= 0) {
            const leftTime = {
              hour: formatCountDown(lastTime*1000, 'H'),
              minute: formatCountDown(lastTime*1000, 'F'),
              second: formatCountDown(lastTime*1000, 'S'),
            }
            this.setData({
              [`modules[${index}]['leftTime']`]: leftTime,
            })
          }
        } else {
          this.endTask(taskName); // 结束任务
        }
      }
    }

    this.pushTask(taskName, tempFun, ()=> {
      // console.log(taskName + ' 结束 回调')
      // 计时结束改变按钮状态
      this.refresh(); // 倒计时完刷新页面

    });

    this.startTask()
  },
}
export default cSeckill;
