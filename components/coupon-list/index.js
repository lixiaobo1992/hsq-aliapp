import { baseComponent } from '@xmini/aliapp-component-base/index';
import { xmini, me } from '../../config/xmini';
import api from '/api';
baseComponent(Component,{
  props: {
    coupons:{
      type: Array,
    },
    getCoupon: () => {},
  },
  data: {
    sucToast: false,
    showCoupons: false,
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
    //关闭券弹窗
    onHandleItem(e){
      const {
        index,type
      } = e.currentTarget.dataset;
      console.log(index,type, 'onHandleItem');
      this.props.onHandleItem({ type,index });
    },
  },
})
