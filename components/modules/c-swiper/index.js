
import { baseComponent } from '@xmini/aliapp-component-base';
let windowWidth = 375;
baseComponent(Component, {
  props: {
    data: {},
  },
  data: {
    current: 0,
  },
  // 计算属性
  computed: {
    newPadTop() {
      const data = this.props.data
      let padding_top = (+data.height / +data.width) * 100
      // 两边有距离
      if (data.layout == 1) {
        const swiperWidth = my.$getSystemInfo().windowWidth - 48
        const percent = swiperWidth / my.$getSystemInfo().windowWidth
        padding_top = (+data.height / +data.width) * percent * 100
      }
      return padding_top
    },
  },
  created() {
    const systemInfo = my.$getSystemInfo();
    windowWidth = systemInfo.windowWidth;
  },
  updated(props, data) {
    console.log('更新来',props ,data);
  },
  // 事件
  methods: {
    onUrlPage(e) {
      // 临时解决方案
      // 页面内 不能使用 onTap = "$page.onUrlPage" 进行绑定
      // console.log(e);
      // console.log(this.$page)
      this.$page.onUrlPage(e);
    },
    onChangeEvent(e) {
      //
      // this.setData({
      //   current: e.detail.current
      // })
      if (this.$page.swiperOnChangeExposure) {
        this.$page.swiperOnChangeExposure(e);
      }
    },
    calculateModuleHeight(width, height) {
      let w = width;
      if (!w || w === 0) {
        w = windowWidth;
      }
      return Math.round((height / w) * windowWidth);
    },
  },
})