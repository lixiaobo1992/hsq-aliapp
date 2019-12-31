import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
} from '/utils';


xPage({
  ...mixins,
  data: {
    checkIndex: -1,
    checked: false
  },
  onLoad(query) {
    this.onPageInit(query);

    my.showLoading();
    this.getItems();
  },
  onShow(){

  },

  re() {

  },
  getItems(){
    api.assistanceComplaintType({
      isLoading: false
    },(res) => {
      this.dealData(res.data);
    })
  },
  dealData(data){
    this.setData({
      items: data
    })
    my.hideLoading();
  },
  goNext(e){
    const { index, type } = e.currentTarget.dataset;

    switch (type) {
      case 'item':
        this.setData({
          checkIndex: index,
          checked: true
        })
        break;

      case 'next':
        if(this.data.checked){
          xmini.piwikEvent('c_myhelp_complaint_next')
          this.forward('complaint-submit', {
            id: this.data.checkIndex,
          })
        }
        break;

      default:
        break;
    }
  }
});
