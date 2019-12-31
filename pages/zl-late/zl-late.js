import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
} from '/utils';

// const app = getApp();


xPage({
  ...mixins,

  listIsNot: true,
  data: {},
  onLoad(query) {

    this.onPageInit(query);

    api.assistanceskuList({
      pageNum: 1,
      pageLimit: 20,
      needPagination: 1,
    },(res)=>{
      // console.log(res)
      const { list = [] } = res.data
      if (!list.length) {
        this.listIsNot = false
      }
    }, (err) =>{
    })
  },
  onShow(){


  },

  onUnload() {


  },

  btnEvent(){
    xmini.piwikEvent('c_helpinvitee_other')
    if (this.listIsNot) {
      this.forward('zl-list', { replace: true })
    } else {
      this.forward('index', { replace: true })
    }

  },
});
