import { baseComponent } from '@xmini/aliapp-component-base';

baseComponent(Component, {
  props: {
    data: {
      list: [],
    }, // 默认值
  },
  data: {
    // 滚动条样式
    scheduleSpan: {
      width: '50%',
      left: 0,
    },
  },
  computed: {
    boxClassName() {
      const { row } = this.props.data;
      return row == 1 ? 'row1' : 'row2';
    },
    listClassName() {
      const { col } = this.props.data;
      return col == 4 ? 'col4' : '';
    },
    categoryData() {
      // 这里行数写死了，1 or 2
      const { list = [], row = 1 } = this.props.data;
      let categoryData = [];
      if (row == 1) {
        categoryData.push(list);
      } else {
        // let sum = Math.ceil(list.length / 2);
        // sum = sum < col ? col : sum;
        // const firstRow = list.slice(0, sum);
        // const lastRow = list.slice(sum, list.length);
        const firstRow = [],
          lastRow = [];
        list.forEach((it, i) => {
          if (i % 2 == 0) {
            firstRow.push(it);
          } else {
            lastRow.push(it);
          }
        });
        categoryData = [firstRow, lastRow];
      }
      return categoryData;
    },
    isShowSchedule() {
      console.log('c-category============isShowSchedule');
      const { list = [], col = 5, row = 1 } = this.props.data;
      if ((col == 4 || col == 5) && ((row == 1 || row == 2) && list.length > col * row)) {
        return true;
      }
      return false;
    },
    scheduleSpanStyle() {
      const scheduleSpan = this.data.scheduleSpan;
      let tempArray = [];
      for (let key in scheduleSpan) {
        tempArray.push(`${key}: ${scheduleSpan[key]}`);
      }
      // console.log(tempStyle);
      return tempArray.join(';');
    },
  },
  created() {
    console.log('c-category============', this.props.data);
    // 添加 临时数据
    this._data= {
      windowWidth: 375,
      conentWidth: 375,
      scheduleBarWidth: 40,
      scheduleBarThumbWidth: 20,
    };
    // setTimeout(()=>{
    //   // my.createSelectorQuery().select(`#${this.props.data.id}`).boundingClientRect().exec(rect => {
    //   //   console.log(rect)
    //   // });
    //   console.log('....')
    //   this.setData({
    //     scrollLeft: 10,
    //   })
    // },5000)
    // console.log(this)
    const systemInfo = my.$getSystemInfo();
    this._data.windowWidth = systemInfo.windowWidth || 375;

    const { col = 5, row = 1 } = this.props.data;
    let itemWidth = parseInt(this._data.windowWidth / col);
    // console.log('itemWidth', itemWidth);
    // console.log('this.data.categoryData', this.data.categoryData);
    let len = this.data.categoryData[0].length || 5
    this._data.conentWidth = itemWidth * len;
    if (len > col) {
      this.updatedScheduleBar();
    }
  },
  methods: {
    onUrlPage(e) {
      // 临时解决方案
      // 页面内 不能使用 onTap = "$page.onUrlPage" 进行绑定
      // console.log(e);
      // console.log(this.$page)
      this.$page.onUrlPage(e);
    },
    onScheduleScroll(e) {
      // console.log(e.detail);
      let scrollLeft = e.detail.scrollLeft;
      // console.log('scrollLeft', scrollLeft);
      scrollLeft = parseInt((scrollLeft / this._data.conentWidth) * this._data.scheduleBarWidth);
      // console.log('scrollLeft', scrollLeft);
      if (scrollLeft > this._data.scheduleBarWidth - this._data.scheduleBarThumbWidth) {
        scrollLeft = this._data.scheduleBarWidth - this._data.scheduleBarThumbWidth;
      }
      this.setData({
        'scheduleSpan.left': `${scrollLeft}px`,
      })
    },
    updatedScheduleBar() {

      // console.log(
      //   'conentWidth',
      //   conentWidth,
      //   'visibleWidth',
      //   conentWidth,
      //   'scheduleBarWidth',
      //   scheduleBarWidth
      // );
      this._data.scheduleBarThumbWidth = parseInt(this._data.windowWidth / this._data.conentWidth * this._data.scheduleBarWidth);
      // console.log('scheduleBarThumbWidth', scheduleBarThumbWidth);
      this.setData({
        'scheduleSpan.width': `${this._data.scheduleBarThumbWidth}px`,
      })
    },
  }
})