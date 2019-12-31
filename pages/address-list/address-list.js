import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
} from '/utils';

const app = getApp();

xPage({
  ...mixins,
  data: {
    isLoading: true,
    address: [],
    isFromOrder: false,
  },

  onLoad(query) {
    this.onPageInit(query);
    // 来选择地址的 显示底部按钮
    if (query.orderAddress) {
      this.setData({
        isFromOrder: true,
      });
    }
  },

  onUnload() {

  },

  onReady() {
    // this.getAddressList();
  },
  onShow() {
    this.refresh();

    this.onMessage();
  },
  sendRefreshMessage() {
    const { ref, needRefresh } = this.pageQuery;
    if (ref && needRefresh) {
      this.postMessage(ref, {
        needRefresh: true,
      });
    }
  },

  refresh() {
    this.getAddressList();
    // 有更新收获地址信息，回到上页刷新数据
    this.sendRefreshMessage();
  },
  getAddressList() { // 获取地址列表
    this.setData({
      isLoading: true,
    })
    api.addressList({
      scope: this,
      weights: 1,
    }, (res) => {
      const { data = {} } = res;
      this.setData({
        isLoading: false,
        address: data && data.list || [],
      });
    }, (err) => {
      if (err.errno === 510010) {
        this.forward('login', { refresh: true });
        return true;
      }
    });
  },

  setDefault(e) { // 设置默认地址
    const id = parseInt(e.target.dataset.id, 10);
    api.setDefaultAddress({ addressId: id }, (res) => {
      if (res.data.res) {
        const addresses = [...this.data.address];
        for (let i = 0; i < addresses.length; i++) {
          let item = addresses[i]
          if (item.id === id) {
            item.is_default = 1;
          } else {
            item.is_default = 0;
          }
        }
        addresses.sort((x) => {
          return x.is_default ? -1 : 1;
        });
        this.setData({
          address: addresses,
        });
        xmini.store.dispatch('setAddresses');
      }
    });
  },

  edit(e) { // 编辑地址
    const { id, index } = e.target.dataset;
    this.forward('address-update', {
      refresh: true,
      id,
      index,
      ...this.data.address[index],
    });
  },

  delete(e) { // 删除地址
    const { id, index } = e.target.dataset;
    my.confirm({
      title: '确定删除该地址？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (result) => {
        if (result.confirm) {
          this.deleteConfirm(id, index);
        }
      },
    });
  },

  deleteConfirm(id, index) {
    api.deleteAddress({ addressId: id }, (res) => {
      if (res.data.res) {
        const addresses = [...this.data.address];
        addresses.splice(index, 1);
        this.setData({
          address: addresses,
        });
        this.sendRefreshMessage();
        xmini.store.dispatch('setAddresses');
      }
    });
  },

  addAddress() {
    this.forward('address-update', {
      refresh: true,
    });
  },

  selectOrderAddr(e) { // 跳回订单页面
    const { index } = e.currentTarget.dataset;
    const currentAddress = this.data.address[index];
    console.log(currentAddress);
    if (this.data.isFromOrder) {
      // app.updateData({ addressId: id });
      xmini.store.dispatch('setOrderCommitAddress', currentAddress);
      this.back();
    }
  },

});
