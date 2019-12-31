import { baseComponent } from '@xmini/aliapp-component-base/index';
// import { xmini, me } from '../../config/xmini';
baseComponent(Component,{
  props: {
    isPopupShow: false,
    promotions: [],
    promotionTitle: '',
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
    handlePromotion(e) {
      const { type } = e.currentTarget.dataset;
      this.props.onShowPromotionCon({ type })
    },
    onPinDetail(e){
      const { id } = e.currentTarget.dataset;
      if (id) {
        this.props.onPinDetail({ id });
      }
    },
  },
})
