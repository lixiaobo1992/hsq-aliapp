import {
  me,
  xmini,
  xPage,
} from '../../config/xmini';
import api from '/api';
import {
  mixins,
} from '/utils';

const qnInfo = {
  domain: 'https://img2.haoshiqi.net/',
};

xPage({
  ...mixins,
  data: {
    showCount: false,
    imageMax: 3,
    imageList: []
  },
  onLoad(query) {
    this.onPageInit(query);
  },
  onShow(){

  },

  onUnload() {

  },
  inputText(e){
    this.setData({
      reasonText: e.detail.value
    })
  },

  // 上传图片
  uploadImage() {
    const that = this;
    my.chooseImage({
      count: this.getImageCount(),
      success: (res) => {
        that.setData({
          imageList: [
            ...that.data.imageList,
            ...res.apFilePaths,
          ],
        });
      },
    });
  },

  // 预览图片
  previewImage(e) {
    const that = this;
    const { index } = e.target.dataset;
    my.previewImage({
      current: index,
      urls: that.data.imageList, // 要预览的图片链接列表\
    });
  },

  // //删除图片
  clearImage(e) {
    const that = this;
    const { index } = e.target.dataset;
    const newImgList = [...that.data.imageList];
    newImgList.splice(index, 1);
    that.setData({
      imageList: newImgList,
    });
  },

  //获取图片个数
  getImageCount() {
    const count = this.data.imageMax - this.data.imageList.length;
    return count > 0 ? count : 0;
  },

  // //点击提交
  formSubmit(e) {
    const { formId, value } = e.detail;
    this.formId = formId
    xmini.piwikEvent('c_myhelp_complaint_submit')
    this.checkSubmitData();
  },
  checkSubmitData() {
    const that = this;
    if (!that.data.reasonText) {
      // my.showToast('请描述事件过程！');
      return;
    }
    if (that.data.imageList.length < 1) {
      // my.showToast('请上传图片！');
      return;
    }
    my.showLoading();
    this.upload();
    // my.confirm({
    //   title: '提示', // confirm 框的标题
    //   content: '确认提交？',
    //   confirmButtonText: '确定',
    //   cancelButtonText: '取消',
    //   success: (res) => {
    //     if (res.confirm) {

    //     }
    //   },
    // });
  },
  // 上传
  upload() {
    const that = this;
    if (qnInfo.token) {
      this.uploadQiniu();
    } else {
      api.getQiniuToken({}, (res) => {
        qnInfo.token = res.data.token;
        that.uploadQiniu();
      }, (err) => {
        my.showToast('获取图片上传权限失败，请重新操作');
      });
    }
  },
  uploadQiniu() {
    const imgs = this.data.imageList;
    const uploadTasks = [];
    for (let i = 0; i < imgs.length; i++) {
      uploadTasks.push(this.uploadFile(imgs[i]));
    }

    // 这里有个问题，上传是异步操作，要全部执行完，再继续执行，需要封装下，等待执行完
    // 这里封装为 Promise，使用 Promise.all 执行

    Promise.all(uploadTasks).then((res) => {
      // 全部上传完成后，继续提交动作
      this.afterUploadedImg(res);
    });
  },
  afterUploadedImg(res){
    const that = this;
    api.addAssistanceComplaint({
      message: this.data.reasonText,
      type_id: this.pageQuery.id,
      imageFiles: res,
      formId: this.formId
    }, (res) => {
      my.showToast({
        content: '投诉提交成功',
        duration: 2000,
        success(){
          that.back(2)
        },
      })
    })
  },
  uploadFile(file) {
    return new Promise((resolve, reject) => {
      my.uploadFile({
        // 上传七牛使用 https://up.qbox.me
        url: `https://up.qbox.me?token=${qnInfo.token}`,
        fileType: 'image',
        fileName: 'file',
        filePath: file,
        success: (res) => {
          const data = JSON.parse(res.data);
          const url = qnInfo.domain + data.hash + '?imageView2/0/q/70';
          // self.setData({
          //   qnImgList: [
          //     ...self.data.qnImgList,
          //     url,
          //   ],
          // });
          // console.log(url);
          resolve(url);
        },
        fail(res) {
          // console.log(res);
          // reject({
          //   title: '上传失败',
          // });
          reject(new Error('上传失败'));
          my.alert({ title: '上传失败' });
        },
      });
    });
  },
});
