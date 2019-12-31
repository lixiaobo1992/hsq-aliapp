
import { baseComponent } from '@xmini/aliapp-component-base';
baseComponent(Component, {
  props: {
    className: '',
    data: {
      list:[],
    },
    onShowAll:( data ) => {return data},
    },
    data:{
    initDom: {
      viewWidth:my.getSystemInfoSync().windowWidth || 375,
    },
    // arrowClick: false,
    // showupArrow: true,
    style: {},
  },
  // 计算属性
  computed: {

  },
  created() {},
  mounted () {
    console.log(this.props.data.list, 'datalist');
  },
  // 事件
  methods: {
    onDetailPage(e) {
      // 临时解决方案
      // 页面内 不能使用 onTap = "$page.onUrlPage" 进行绑定
      // console.log(e);
      // console.log(this.$page)
      const { index, type, id } = e.currentTarget.dataset;
      const currentItem = this.props.data.list[index] || {};
      const { can_bought, left_stock, link } = currentItem;
      console.log(id, index, 'data props');
      switch (type) {
        case 'arrow':
          console.log('点击到了箭头区域,不跳走,data');
          this.onShowAll(index, id);
        break;
        default:
          if(link){
            this.$page.onUrlPage(e);
          };
        break;
      }
    },
    onShowAll(index, id){
      const list = this.props.data.list;
      console.log(this.props,this.data,'dataxxx');
      const downStatus = this.props.data.list[index].showupArrow;
      this.$page.onShowAll({index, id, status:downStatus});
    },
  },
})
