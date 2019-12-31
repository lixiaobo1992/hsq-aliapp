import {
  me,
  xmini,
  xPage,
  storage,
} from '../../config/xmini';
import {
  mixins,
} from '/utils';

xPage({
  ...mixins,
  data: {},
  onLoad(query) {
    this.onPageInit(query);
  },
  onShow(){
    this.updatadSpmPage(); // 新增更新spm 三段中的 page
    
    const lastPage = storage.get('lastPage') || 'index';
    const needBack = storage.get('needBack');
    if(needBack){
      this.forward(lastPage)
    }else{
      my.call('startApp',{
        appId: '20000943',
        param: {
          path: 'homepage',
          groupId:'027be25993b141474225295709100000',
          startMultApp:true,
          appClearTop:false,
          sourceId:'referLink'
        }
      })
      storage.set('needBack', true, 86400);
    }
  }
});
