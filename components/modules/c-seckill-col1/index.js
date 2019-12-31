
import { baseComponent } from '@xmini/aliapp-component-base';
import { xmini, storage } from '../../../config/xmini';
import api from '/api';
baseComponent(Component, {
  props: {
    className: '',
    data: {
      list:[]
    },
    style: {},
    onUpdateBtnStatus:( data ) => {return data},
  },
  data: {
    moreNumber: 2,     // 当moreNumber 为2时 展示更多按钮  为6时展示收起按钮
    listData: [],
    initDom: {
      viewWidth:my.getSystemInfoSync().windowWidth || 375,
    },
    tagH:true,
  },
  // 计算属性
  computed: {

  },
  created() {
    // console.log(my.getSystemInfoSync().windowWidth,'wxdata');
    // this.getDomRectWidth();
  },
  // 事件
  methods: {
    // 点击事件汇总
    onClick(e) {
      let { index , type } = e.currentTarget.dataset;
      const storeId = this.$page.data.storeId
      switch (type) {
        case 'arrow':
          console.log('点击到了箭头区域,不跳走,data');
          const downStatus = this.props.data.list[index].showupArrow;
         // this.props.onShowAll({index, status:downStatus});
          this.props.onUpdateBtnStatus({index, status:downStatus, type})
        break;
        case 'detail':
          const currentItem = this.props.data.list[index] || {};
          const { link , pin_id} = currentItem;
          xmini.piwikEvent('c_dpxqbuy',{
            merchantid: storeId,
            pinactivityid: pin_id,
            index: index
          })
          if( link ) {
            this.$page.onUrlPage(e);
          };
          break;
        case 'more':
          xmini.piwikEvent('c_dpzkckgd',{
            merchantid: storeId
          })
          this.setData({
            moreNumber: 6
          })
          break;
        case 'up':
          this.setData({
            moreNumber: 2
          })
          break;
        case '':
          break;
        default:
          break;
      }
    },

    // 设置提醒按钮
    msgClick(e) {
      const storeId = this.$page.data.storeId
      let { index , type, itemr, sku, id } = e.currentTarget.dataset;
      const pageName = this.$page.getPageName();
      const pageFormId = `formid-${pageName}`;
      const cacheFormId = storage.get(pageFormId);
      switch (type) {
        case 'hintmsg':
          if(itemr > 300){
            xmini.piwikEvent('c_txbtn',{
              merchantid: storeId,
              index: index
            })
            api.setActivitySubscribe({
              activityId: id,
              formId: cacheFormId,
              activityType: 4,
              subscribe: 1,
              itemId: sku
            }, (res) => {
              my.showToast('已设置，请关注好食期生活号查收提醒哦~');
              let updataData = {
                index,
                btnType: 'hintmsg',
                value: true
              }
              this.props.onUpdateBtnStatus(updataData);
            },(err) => {
            })
          }else{
            my.showToast('秒杀快开始啦，请摆好正确的秒杀姿势~');
          }
          break;
        case 'clearmsg':
          if(itemr > 300){
            xmini.piwikEvent('c_qxtxbtn',{
              merchantid: storeId,
              index: index
            })
            api.setActivitySubscribe({
              activityId: id,
              formId: cacheFormId,
              activityType: 4,
              subscribe: 2,
              itemId: sku
            }, (res) => {
              my.showToast('您已取消提醒，无法收到该商品秒杀通知');
              let updataData = {
                index,
                btnType: 'clearmsg',
                value: false
              }
              this.props.onUpdateBtnStatus(updataData);
            },(err) => {

            })
          }else{
            my.showToast('秒杀快开始啦，请摆好正确的秒杀姿势~');
          }
          break;

        case '':
          const currentItem = this.$page.data.activityList[index] || {};
          const { link , pin_id} = currentItem;
          xmini.piwikEvent('c_dpxqbuy',{
            merchantid: storeId,
            pinactivityid: pin_id,
            index: index
          })
          if( link ) {
            this.$page.onUrlPage(e);
          };
          break;
        default:

          break;
      }
    }
  },
})
