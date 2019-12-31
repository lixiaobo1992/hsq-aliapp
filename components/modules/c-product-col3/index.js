
import { baseComponent } from '@xmini/aliapp-component-base';
baseComponent(Component, {
  props: {
    className: '',
    data: {},
    style: {},
  },
  // 计算属性
  computed: {

  },
  created() {
   
  },
  // 事件
  methods: {
    onDetailPage(e) {
      // 临时解决方案
      // 页面内 不能使用 onTap = "$page.onUrlPage" 进行绑定
      // console.log(e);
      // console.log(this.$page)
      const { index} = e.currentTarget.dataset;
      const currentItem = this.props.data.list[index] || {};
      const { can_bought, left_stock, link } = currentItem;
      // if( can_bought && left_stock && link ) {
      if(link) {
        this.$page.onUrlPage(e);
      };
    },

  },
})