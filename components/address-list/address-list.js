import {
  xmini
} from '../../config/xmini';
import {
  clone
} from '/utils/objectUtil';
Component({
  /**
   * 组件的属性列表
   */
  props: {
    currentCity: {},
    onSelectingNewCity: () => {}
  },

  /**
   * 组件的初始数据
   */
  data: {
  },
  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  onInit() {
    const { addresses } = xmini.store.state.location;
    this.setData({
      addresses: clone(addresses),
    });
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //选择地址
    onSelecting(event) {
      const { addressInfo } = xmini.store.state.location;
      let oldCity = addressInfo;
      let { city, index } = event.currentTarget.dataset;
      if (oldCity.currentAddress != city.currentAddress) {
        xmini.store.dispatch('setAddressInfo', city);
        this.handleAddresses(city, index);
        //this.triggerEvent("onSelectingNewCity");
      }
      this.props.onSelectingNewCity();
      // this.triggerEvent("onSelectingNewCity");
    },
    //处理地址列表，选中排第一个
    handleAddresses(city, index) {
      let addresses = this.data.addresses;
      addresses.splice(index, 1);
      addresses.unshift(city);
      this.setData({
        addresses: addresses,
      })
    }
  }
})
