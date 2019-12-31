
import { baseComponent } from '@xmini/aliapp-component-base';

const defaultData = {
  width: 40,
  height: 40,
  icon: { image: { url: '', w: 0, h: 0 }, link: '' },
};
baseComponent(Component, {
  props: {
    data: defaultData, // 默认值
  },
  data: {
    // syy: { borderTop: '1px solid #0f0'}
  },
  computed: {
    isValid() {
      const { icon = {}, enable } = this.props.data;
      return enable && icon.image && icon.image.url;
    },
    link() {
      const { icon = {} } = this.props.data;
      return icon.link || '';
    },
    styles() {
      const { icon = {}, width = 40, height = 40, bottom = 0, right = 0 } = this.props.data;
      let imageUrl = '';
      if (icon.image && icon.image.url) {
        imageUrl = icon.image.url;
      }
      return {
        width: `${width}px`,
        height: `${height}px`,
        bottom: `${bottom}px`,
        right: `${right}px`,
        'background-image': `url(${imageUrl})`,
      };
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
