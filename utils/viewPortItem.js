



const app = getApp();

const { windowHeight } = my.$getSystemInfo();
let tempScroll = null

// 获取视口内元素 扩展
export default {
  viewPortTime: null,
  viewPortTopHeight: 0, //视口上方距离
  viewPortScrollOptions:{
    viewPortScrollTop:0, //
    viewPortHeight: windowHeight, // 当前滑动视口高度
    viewPortElement:'', // 类名
    scroll: 'onPageScroll'
  },
  insideViewPortItem:[],
  viewPortListData: {}, // 数据列表 keyid:Object
  viewPortTagArray: [], // 存放列表元素位置 key

  viewPortDataTag: false, // 新加数据类型 默认 []
  // 初始化视口
  // onScroll(scroll view 滚动组件监听) onPageScroll(页面滚动监听)
  initViewPort(options = {}){

    this.viewPortScrollOptions = Object.assign({},this.viewPortScrollOptions,options);

    const tempCallBackName = this.viewPortScrollOptions.scroll
    // 处理入口
    if(tempCallBackName == 'onPageScroll'){
      if (!this.onPageScroll){
        this.onPageScroll= (e) => {
          this.viewPortScroll(e);
        }
      } else {
          tempScroll = this.onPageScroll; // 负责 主页面 onPageScroll 方法
          this.onPageScroll= (e) => {
            tempScroll.call(this,e) // 执行
            this.viewPortScroll(e);
          }
      }

    } else if (tempCallBackName){
      if (!this[tempCallBackName]) {
        this[tempCallBackName] = (e) => {
          this.viewPortScroll(e);
        }
      } else {
        tempScroll = this[tempCallBackName];
        this[tempCallBackName] = (e) => {
          tempScroll.call(this,e) // 执行
          this.viewPortScroll(e);
        }
      }
    } else {
      console.error('缺少scroll监听回调')
    }

  },

  // 统一接收scroll回调
  viewPortScroll(e){
    // console.log('viewPortScroll:',e)

    this.viewPortScrollOptions.viewPortScrollTop = e.scrollTop || (e.detail && e.detail.scrollTop) || 0

    clearTimeout(this.viewPortTime) // 阻塞
    this.viewPortTime = setTimeout(()=>{
      this.filterView();
    },500)

  },

  filterView(currTop = this.viewPortScrollOptions.viewPortScrollTop){
    const that = this
    const windowHeight = this.viewPortScrollOptions.viewPortHeight;
    // console.log('xxxxxs', this.viewPortTagArray)
    let vBoxArray = this.viewPortTagArray.reduce((box,next)=>{
      let tempTop = next.top - currTop - that.viewPortTopHeight;
      let currBottom = next.bottom - currTop - that.viewPortTopHeight;
      if ((tempTop < windowHeight && tempTop >= 0)  || (currBottom <= windowHeight && currBottom >= 0)) {
        box.push(next);
      }
      return box;
    }, [])
    // 记录上次窗口内的数据
    this.oldInsideViewPortItem = this.insideViewPortItem; 
    // 新的数据
    this.insideViewPortItem = this.dealInsideViewPortItem(vBoxArray);

    this.filterViewCallBack();
  },

  // 需要时可以外部重写
  filterViewCallBack(){
    console.log('filterViewCallBack', this.insideViewPortItem)
  },
  // 需要时可以外部重写
  dealInsideViewPortItem(viewPortData) {
    return viewPortData;
  },

  getViewPortListItemLoact(callback){

    const tempElement = this.viewPortScrollOptions.viewPortElement
    if (!tempElement){
      console.warn('缺少获取元素class名！')
      return;
    }
    const box = my.createSelectorQuery()
    box.selectAll(tempElement).boundingClientRect().exec((ret)=>{
      // console.log('box:',ret)
      callback && callback(ret)
    })
  },
}





