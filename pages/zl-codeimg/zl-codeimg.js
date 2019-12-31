import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
} from '/utils';
import { isFastClick } from '/utils/is';

xPage({
  ...mixins,
  data: {
    isLoading: true,
  },
  onLoad(query) {
    // query.eid = 243;
    this.onPageInit(query);
    this.refresh();
  },
  onShow(){

    this.onMessage();
  },
  onUnload() {

  },
  onPullDownRefresh(){
    this.refresh();
  },
  refresh(){
    const query = this.pageQuery;
    if(!query.eid){
      console.log('没有传入eid')
      return ;
    }
    this.setData({
      isLoading: true,
    })
    api.assistanceShareInfo({
      scope: this,
      weights: 1,
      
      eventId: query.eid
    }, (res) => {
      console.log(res)
      const { data } = res;
      this.setData({
        isLoading: false,
        imgUrl: data.share_image_url,
        qrCodeImg: data.qrcode_url
      })
    }, (err) => {
      console.log(err)
    })
  },
  downloadImage(e){
    if (!isFastClick()) {
      console.warn('慢着点，别着急')
      return;
    }
    const { type } = e.currentTarget.dataset
    let imgurl = this.data.imgUrl
    console.log(imgurl,"url")
    if(type == 'qr'){
      xmini.piwikEvent('c_helpinvite_poster_downloadqr')
      imgurl = this.data.qrCodeImg
    } else{
      xmini.piwikEvent('c_helpinvite_poster_save')
    }
    if (imgurl!='') {
      my.saveImage({
        url: imgurl,
        success(){
          console.log('success')
          if (type == 'qr'){
            my.showToast('下载成功')
          }else{
            my.showToast('保存成功')
          }
        }
      })
    }
  },
});
