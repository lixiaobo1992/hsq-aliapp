

const app = getApp();

const { windowWidth, windowHeight } = my.$getSystemInfo();

export default {
  snowInit() {
    // 随机生成 若干个元素
    const sum = 40;
    const snowData = [];
    for (let i = 0; i< sum; i++) {
      snowData.push(new Snow());
    }
    console.log(snowData);
    this.setData({
      snowData
    })
  },
  snowRender() {

  },
  snowUpdate() {

  }
};

class Snow {
  constructor(){
    this.top = Math.ceil(Math.random() * windowHeight);
    this.left = Math.ceil(Math.random() * windowWidth);
    this.time = Math.ceil(Math.random() * 10000);
    this.width = Math.ceil(Math.random() * (10 - 2) + 2);
    this.height = this.width;
  }
}
