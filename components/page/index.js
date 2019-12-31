Component({
  mixins: [],
  data: {
    isShowError: false,

    type: '',
    title: '',
    content: '页面出现了一点小问题，重新加载看看~',
    btnText: '点我重试'
  },
  props: {
    className: '', // 
    contentClass: '', // 内容className
    isLoading: true,

    onRefresh: () => {}, // 刷新
  },
  onInit() {
    this.$page.dwdPageComponent = this;
  },
  didMount() {
    // this.$page.dwdPageComponent = this;
  },
  didUpdate(prevProps,prevData) {
    // console.log('page didUpdate:', this.props);
  },
  didUnmount() {},
  methods: {

    // 按钮事件
    errorBtnEvent() {
      this.setData({
        isShowError: false,
      })
      this.props.onRefresh();
    }
  },
});
