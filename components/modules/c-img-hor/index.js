import { baseComponent } from '@xmini/aliapp-component-base';

const defaultData = {
  width: 5,
  height: 3,
  list: [],
};
baseComponent(Component, {
  props: {
    data: defaultData, // 默认值
  },
  data: {
    // syy: { borderTop: '1px solid #0f0'}
  },
  computed: {
    innerStyles() {
      const { width, height = 0, list = [] } = this.props.data;
      const ratio = width ? height / width : 0;
      return ratio ? `padding-top: ${(ratio * 100) / list.length}%` : '';
    },
  },
  methods: {
    onUrlPage(e) {
      // 临时解决方案
      // 页面内 不能使用 onTap = "$page.onUrlPage" 进行绑定
      // console.log(e);
      // console.log(this.$page)
      this.$page.onUrlPage(e);
    }
  }
})