import objectUtil from './objectUtil'



// 计时器任务 扩展
export default {

  interval: 1000,
  taskTimer: null,
  taskArray: {}, // key: Object

  beginTask() { // 执行任务
    const taskKey = Object.keys(this.taskArray)
    // console.log(taskKey)
    if (taskKey.length) {
      for (let tempTask in this.taskArray) {
        if (this.taskArray[tempTask]) {
            this.taskArray[tempTask].fun.call(this);
        }
      }
    } else {
      this.stopTask()
    }
  },
  // 开始
  startTask() {
    const that = this
    this.stopTask()
    const taskKey = Object.keys(this.taskArray)
    // console.log('task list:',taskKey)
    if (!taskKey.length) {
      return;
    }
    this.beginTask();
    this.taskTimer = setInterval(() => {
      that.beginTask();
    }, this.interval)
  },
  stopTask() {
    // console.log('任务暂停', this.taskArray)
    clearInterval(this.taskTimer)
  },

  pushTask(key, fun, callback = () => {}) {
    // console.log('添加任务:', key)
    if (!fun && typeof fun != 'function') {
      console.warn('缺少任务参数！')
      return;
    }
    this.taskArray[key] = {
      fun,
      callback,
      isEnd: false
    }
  },
  endTask(key) { // 给任务内部调用 结束任务
    if (this.taskArray[key]) {
      console.log('结束任务:', key)
      console.log(key, 'end回调');
      // this.taskArray[key].isEnd = true;
      this.taskArray[key].callback.call(this) // 任务结束时回调
      this.delTask(key) // 删除任务
    }
  },
  delTask(key) {
    if (key == 'all') {
      this.taskArray = {};
    } else {
      delete this.taskArray[key];
    }
  }
}
