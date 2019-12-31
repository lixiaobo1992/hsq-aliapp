import {
  me,
  xPage,
} from '../../config/xmini';

xPage({
  data: {
    swiperInfo: {
      list: [],
    },
  },
  onLoad() {
    const swiperList = [{
      image: 'https://img1.haoshiqi.net/assets/hsqimg/qlogin.jpg',
      url: '',
    }, {
      image: 'https://img2.haoshiqi.net/ma37de87e95035e78b42fdf833aeebc04e.jpg?imageView2/0/w/640/h/640/q/90',
      url: '',
    }, {
      image: 'https://img2.haoshiqi.net/maae8d9a0bc2c5a6fa5d8a53259d7af281.jpg?imageView2/0/w/640/h/640/q/90',
      url: '',
    }, {
      image: 'https://img1.haoshiqi.net/assets/hsqimg/qlogin.jpg',
      url: '',
    }, {
      image: 'https://img2.haoshiqi.net/ma75e51b110452754d6e59ff116d68db8e.jpg?imageView2/0/w/640/h/640/q/90',
      url: '',
    }];
    const width = my.$getSystemInfo().windowWidth;
    this.setData({
      swiperInfo: {
        list: swiperList, // 如果数据不符合格式，可以使用 mapTo 方法
        // hwRatio: 1,
        goUrlPage: 'goUrlPage',
        height: width,
        // onSwiperTap: noop, // 不需要绑定事件
      },
    });
  },
});
