import { baseComponent } from '@xmini/aliapp-component-base';

const defaultData = {
  width: 5,
  height: 3,
  list: [{ image: { url: '', w: 0, h: 0 }, link: '' }],
};
baseComponent(Component, {
  props: {
    data: defaultData, // 默认值
  },
  data: {
    // syy: { borderTop: '1px solid #0f0'}
  },
  methods: {
    onUrlPage(e) {
      // 临时解决方案
      // 页面内 不能使用 onTap = "$page.onUrlPage" 进行绑定
      console.log(e);
      console.log(this.$page)
      this.$page.onUrlPage(e);
    }
  }
})