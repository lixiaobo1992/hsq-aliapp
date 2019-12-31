import { baseComponent } from '@xmini/aliapp-component-base/index';
import { xmini, me } from '../../config/xmini';
import api from '/api';
baseComponent(Component, {
  props: {
    className: '',

  },
  data: {
   
  },
  watch: {

  },
  created() {
    console.log(this,'created loseGoodsList')
  },
  methods: {
    // 找相似
    findAlikeGoods(e) {
      const { name } = e.currentTarget.dataset;
      this.$page.forward('couple-search-list',{
        q: name
      })

    },

     // 清空失效商品
    clearLoseGoods() {
      me.confirm({
        content: '是否删除所有失效商品',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        success: (result) => {
          let loseGoodsList = this.props.data.loseGoodsList;
          let loseSkuIds = [];
          for(let i = 0; i < loseGoodsList.length ; i++ ){
            loseSkuIds.push(loseGoodsList[i].sku_id);
          }
          let loseSkuIdString = loseSkuIds.join(',');
          if(result.confirm) {     // result.confirm  true是代表点击删除   false是取消
            // 调用删除失效商品接口
            me.showLoading();
            api.removeInvalidCartSku({}, (res) => {
              console.log(res,'删除所有失效商品')
              this.$page.clearGoods();
              xmini.piwikEvent('c_loseeffect',{
                skuid: loseSkuIdString
              })
            }, (err) => {
              
            })
          }
        },
      });
    },
  }
})