import { baseComponent } from '@xmini/aliapp-component-base/index';
baseComponent(Component,{
  props: {
    mergeInfo: {},
    isMergePay: false,
    checkOrder: (data) => { return data },
  },
  data: {
    // onShowPromotionInfo: false,
  },
  watch: {
  },
  computed: {
  },
  created() {
  },
  mounted() {
  },
  methods: {
    // 显示/关闭券弹窗
    handlePayModal() {
      // const MergePayStatus = !this.props.isMergePay;
      this.props.onHandlePayModal();
    },
    //去付款
    onCheckOrder(e){
      const { orderid  } = e.currentTarget.dataset;
      this.props.onCheckOrder({ id: orderid, type:'merge' });
    },
  },
})
