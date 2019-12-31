const dealData = {
  getModules(res) {
    const { data, timestamp } = res;
    const types = [
      'c-img',
      'c-img-hor',
      'c-swiper',
      'c-category',
      'c-tofu',
      'c-product-col1',
      'c-product-col2',
      'c-product-col3',
      'c-product-slider',
      'c-product-seckill',
    ]
    const tempList = (data.list || []).filter(item => {
      return types.includes(item.type);
    })

    // 添加 模块 id
    let tempObj = {};
    tempList.forEach((item) => {
      if (!tempObj[item.type]) {
        tempObj[item.type] = 1;
      } else {
        tempObj[item.type] = tempObj[item.type] + 1
      }
      item.id = item.id || item.type + '_' + tempObj[item.type];
      item.moduleName = item.type + '_' + tempObj[item.type];

      // if (!item.id) {
      //   if (!tempObj[item.type]) {
      //     tempObj[item.type] = 1;
      //   } else {
      //     tempObj[item.type] = tempObj[item.type] + 1
      //   }
      //   item.id = item.type + '_' + tempObj[item.type];
      // }
    });
    // 遍历 list
    let Modules = tempList.map((item, index) => {

      let moduleItem = {
        ...item,
      }
      switch(item.type) {
        case 'c-img':
          return Object.assign(moduleItem, this.dealCImg(item));
        case 'c-img-hor':
          return Object.assign(moduleItem, this.dealCImg(item));
        case 'c-swiper':
          return Object.assign(moduleItem, this.dealCSwiper(item));
        case 'c-category':
          return Object.assign(moduleItem, this.dealCImg(item));
        case 'c-tofu':
          return Object.assign(moduleItem, this.dealCImg(item));
        case 'c-product-col1':
          return Object.assign(moduleItem, this.dealCProduct(item));
        case 'c-product-col2':
          return Object.assign(moduleItem, this.dealCProduct(item));
        case 'c-product-col3':
          return Object.assign(moduleItem, this.dealCProduct(item));
        case 'c-product-slider':
          return Object.assign(moduleItem, this.dealCProduct(item));
        case 'c-product-seckill':
            return Object.assign(moduleItem, {timestamp:timestamp}, this.dealCProduct(item));
        default:
          return moduleItem;
      }
    });
    return Modules
  },

  dealCImg(item){
    return {
      list: this.dealImgs(item.list, item.type, item)
    }
  },
  dealCSwiper(item) {
    const list = this.dealImgs(item.list, item.type, item);
    return {
      activeColor: '#f00',
      circular: true, // 是否是无限滑动
      list: list,
      // height: this.calculateModuleHeight(+item.width || 0, +item.height || 0),
    }
  },
  // 处理商品数据
  dealCProduct(item) {
    return {
      list: this.dealProductList(item),
    };
  },
  // 处理商品列表数据
  dealProductList(moduleItem) {
    const list = moduleItem.list || [];
    return list.map((item,index) => {
      let retaData = parseInt(((item.all_stock - item.left_stock) / item.all_stock) * 100);
      return {
        ...this.dealItem(item,moduleItem.type),
        tags: this.dealTags(item.tags || [], moduleItem.type),
        market_price: (item.market_price / 100).toFixed(2),
        price: this.productPrice((item.price / 100).toFixed(2)),
        light_member_price: (item.light_member_price/100).toFixed(2),
        rate_percent: retaData,
        //添加埋点信息
        piwikEvent: item.id,
        piwikData:{
          index,
          link: item.link,
          group: moduleItem.flow ? moduleItem.flow : 0,
          moduleName: moduleItem.moduleName,
        }
      };
    });
  },
  //处理item
  dealItem(item,type){
    switch(type){
      case 'c-product-col1':
        return Object.assign(item, {showupArrow:true},{ arrowClick: item.tags.toString().length > 48});
    default:
        return item;
    }
  },
  //处理标签
  dealTags(tags, type){
    switch (type) {
      case 'c-product-col1':
        return tags;
      default:
        return tags.splice(0, 2);
    }
  },
  // 处理商品价格数据
  productPrice(price) {
    let priceArray = price.split('.');
    return {
      price_yuan: priceArray[0],
      price_fen: priceArray[1],
    };
  },
  // 统一处理图片
  dealImgs(list = [], piwikName, moduleItem) {
    return list.map((item, index) => {
      return {
        ...item,
        'piwikEvent': piwikName,
        'piwikData': {
          index: item.id || index,
          url: item.link,
          group: moduleItem.flow ? moduleItem.flow : 0,
          moduleName: moduleItem.moduleName,
        }
      }
    })
  },
};
module.exports = dealData;
