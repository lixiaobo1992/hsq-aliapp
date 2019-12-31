import { baseComponent } from '@xmini/aliapp-component-base/index';
import { isFastClick } from '/utils/is';
let _data = {
  val: 1,
};
baseComponent(Component, {
  props: {
    value: 1,
    min: 1,
    max: 0,
    size: 'normal', // normal、small
    styleType: 'not-border',
    disabled: false,
    // extra: {},

    onChange: () => {},
  },
  data: {
    num: 1,
    init: false,
  },
  watch: {
    value(val, oldVal) {
      // console.log(val)
      if (val != oldVal) {
        this._onChange(val, false, false, false);
      }
    },
  },
  created() {
    const {
      value,
      max,
      min
    } = this.props;
    // console.log(value)
    this._onChange(value, false, false);
  },
  didUpdate(prevProps,prevData) {
    console.log(prevProps,prevData);
  },
  methods: {
   //
    _bindblur(e) {
      const { value } = e.detail;
      let { max } = this.props;
      if (max > 0 && value >= max){
        my.showToast(`最多只能买${max}件哦！`)
        this._onChange(+max, false, false);
        return;
      }else{
        this._onChange(+value, true, false);
      }
    },
    _onClick(e) {
      // console.log(e.currentTarget.dataset);
      if(!isFastClick()) return
      const { action } = e.currentTarget.dataset;
      let { num } = this.data;
      let { min, max } = this.props;
      if (action == 'plus') {
        if (max > 0 && num >= max) {
          my.showToast(`最多只能买${max}件哦！`)
          return;
        }
        num++;
      } else if (action == 'reduce') {
        if (min > 0 && num <= min) {
          if (num == 1) {
            my.showToast('最少买1件哦！');
          }
          return;
        }
        num--;
      }
      this._onChange(num,true,false);
    },
    _onChange(val, isToast = true, propChange = false, isChange = true) {  // isToast是否需要弹Toast；propChange传入prop引发的change
      if (this.data.disabled) {
        return;
      }
      const num = this.data.num;
      const { min, max, extra } = this.props;
      val = parseInt(val);
      if (isNaN(val)) {
        val = 0;
      }
      let value = val;
      if (max > 0 && val > max) { // 超出
        isToast && my.showToast(`最多只能买${max}件哦！`);
        propChange = true;
      }
      if (min > 0 && val < min) {
        isToast && my.showToast('最少买1件哦！');
        value = min;
      }
      if (val <= 0) {
        value = num;
      }
      this.setData({
        num: ''
      }, ()=>{
        this.setData({
          num: value
        });
      })
      if (isChange) {
        this.props.onChange({ value, oldVal: num, newVal: val, propChange: propChange, extra, });
      }

      // value：当前值，oldVal：上一个值，newVal输入值
    },
    _getFocus() {
      // 用做阻止事件冒泡 导致购物车页面直接跳转到商品详情页 的问题
    },
  }
})
