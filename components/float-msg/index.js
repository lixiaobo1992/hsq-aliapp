import { baseComponent } from '@xmini/aliapp-component-base/index';

let tempIndex = -1;
baseComponent(Component, {
  props: {
    className: '',
    msgData: [], // 默认值
  },
  data: {
    activeIndex: -1,
    duration: 6000,

    animationInfo: {},
  },
  watch: {
    msgData(newVal, oldVal) {
      console.log('来新数据了', newVal);
      this.startCarousel();
    },
  },
  created() {
    
    this.animation = my.createAnimation({
      duration: 1000,
      timeFunction: 'ease-in-out',
    });

    this.startCarousel();

  },
  methods: {
    onUrlPage(e) {
      // 临时解决方案
      // 页面内 不能使用 onTap = "$page.onUrlPage" 进行绑定
      // this.$page.onUrlPage(e);
      let msgIndex = e.target.dataset.index;
      const newMsg = this.$page.data.newMsg[msgIndex];
      this.$page.forward('detail',{
        id: newMsg.pin_activities_id
      })
    },
    startCarousel() {
      if (this.props.msgData.length) {
        this.start();
      } else {
        this.stop();
      }
    },
    start() {
      this.stop();
      tempIndex = -1;
      this.change();
      this.interTime = setInterval(() => {
        this.change();
      }, this.data.duration + 1000);
    },
    stop() {
      clearInterval(this.interTime);
    },
    change() {
      // console.log('change:', tempIndex, parseInt(new Date().getTime() / 1000));
      if (tempIndex == this.props.msgData.length - 1) {
        tempIndex = -1;
        this.stop();
        return;
      } else {
        tempIndex++;
      }

      this.animation.opacity(1).translateY(0).step();
      this.setData({
        activeIndex: tempIndex,
        animationInfo: this.animation.export()
      });
      setTimeout(() => {
        this.animation.opacity(0).translateY(20).step();
        this.setData({
          animationInfo: this.animation.export()
        });
      }, this.data.duration)
  },
  }
})