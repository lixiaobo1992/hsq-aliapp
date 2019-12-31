
import promisify from './promisify';
// import pages from './pages';
import mixins from './mixins';
import pullList from './pullList';
import orderPay from './orderPay';
import { map, mapTo } from './map';


function urlfix(url, paramsUrl = '') {
  let fixUrl = url;
  if (paramsUrl) {
    fixUrl = url + (url.indexOf('?') === -1 ? '?' : '&') + paramsUrl;
  }
  return fixUrl;
}

// 从html字符串中匹配<img>标签，再匹配src属性
function regImgs(html = '', isGlobal) {
  // 匹配图片（g表示匹配所有结果i表示区分大小写）
  const imgReg = new RegExp('<img.*?(?:>|\/>)', (isGlobal ? 'ig' : 'i') );
  // 匹配src属性
  const srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
  const arr = html.match(imgReg);
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const src = arr[i].match(srcReg);
    // 获取图片地址
    if (src[1]) {
      result.push(src[1]);
      // alert('已匹配的图片地址'+(i+1)+'：'+src[1]);
    }
  }

  return result;
}

function randomBy(under, over) {
  switch(arguments.length) {
    case 1: return parseInt(Math.random()*under+1);
    case 2: return parseInt(Math.random()*(over-under+1) + under);
    default: return 0;
  }
}


/**
 * 处理价格，默认是元，分第二个参数传100
 * dealPrice(5) => 5.00；dealPrice(500, 100) => 5.00；
 */
function dealPrice(x, d = 100, issupp = true) {
  let f = parseFloat(x);
  if (isNaN(f)) {
    return '';
  }
  if (f == 0) {
    return '' + f;
  }
  d = d ? d * 100 : 100;
  f = Math.round(f * 100) / d;
  let s = f.toString();
  let rs = s.indexOf('.');
  if (rs < 0 && issupp) {
    rs = s.length;
    s += '.';
  }
  if (issupp) {
    while (s.length <= rs + 2) {
      s += '0';
    }
  }
  return s;
}

/**
 *新版本返回true
 * @param {*} oldVersion 被比较的老版本，默认为1.0.0
 * @param {*} newVersion 新版本号
 */
function versionCompare(newVersion, oldVersion = '1.0.0') {
  const newVersionArr = newVersion.split('.').map(i=>parseInt(i));
  const oldVersionArr = oldVersion.split('.').map(i=>parseInt(i));
  for (let i = 0; i < newVersionArr.length; i++) {
    if (newVersionArr[i] !== oldVersionArr[i]) {
      if (newVersionArr[i] > oldVersionArr[i]) {
        return true;
      } else {
        return false;
      }
    }
  }
  return false;
}
/**
 *是否显示红点
 * type 显示状态,0表示不显示 tabIndex 显示的位置
 *
 */
function isRedDot(type = 0 ,tabIndex = 2){
  if (my.showTabBarRedDot && typeof my.showTabBarRedDot === 'function'){
    switch (type) {
      case 0:
        my.hideTabBarRedDot({
          index: tabIndex,
        });
      break;
      default:
        my.showTabBarRedDot({
            index: tabIndex,
            success() {
              console.log('数据成功data');
            },
            fail(){
              console.log('数据errdata');
            }
        });
      break;
    }
  } else {
    console.log('不支持showTabBarRedDot方法');
    return false;
  }
}
/*函数节流*/
function throttle(func, wait, options) {
  /* eslint no-multi-assign: 0 */
  let context;
  let args;
  let result;
  let timeout = null;
  let previous = 0;

  if (!options) options = {};
  const later = () => {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) {
      context = args = null;
    }
  };

  return (...rest) => {
    const now = Date.now();
    if (!previous && options.leading === false) previous = now;
    const remaining = wait - (now - previous);
    context = this;
    args = rest;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) {
        context = args = null;
      }
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

/*函数防抖*/
function debounce(func, wait, immediate) {
  let timeout;
  let args;
  let context;
  let timestamp;
  let result;

  const later = () => {
    const last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return (...rest) => {
    context = this;
    args = rest;
    timestamp = Date.now();
    const callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

export default {
  // stringify,
  promisify,
  mixins,
  pullList,
  urlfix,
  map,
  mapTo,
  dealPrice,
  regImgs,
  orderPay,
  randomBy,
  isRedDot,
  versionCompare,
  throttle,
  debounce
};
