
function stringify(params = {}) {
  const temp = params;
  const arr = [];
  for (const key in params) {
    if (!temp[key]) {
      delete temp[key];
    } else {
      arr.push(`${key}=${temp[key]}`);
    }
  }
  return arr.join('&');
}

function Trim(str,is_global){
  var result;
  result = str.replace(/(^\s+)|(\s+$)/g,'');
  if(is_global && is_global.toLowerCase()=='g'){
    result = result.replace(/\s/g,'');
  }
  return result;
}

function getQueryString(url, name) { // 获取URL参数
  if (!url) {
    return null;
  }
  const reg = new RegExp('(^|)' + name + '=([^&]*)');
  const r = url.match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

function replaceSPM(url, spm) {
  if (!url) {
    return null;
  }
  const reg = new RegExp('(^|)spm=([^&]*)');
  const r = url.match(reg);
  if (r != null) {
    let old = unescape(r[0])
    if (old) {
      return url.replace(old, 'spm=' + spm);
    }
  }
  if (url.indexOf('spm=') < 0) {
    if (url.indexOf('?') > 0) {
      url += url + '&spm=' + spm;
    } else {
      url += url + '?spm=' + spm;
    }
  }
  return url;
}

// 字符串截取
function addPoint (value, length) {
  if (value.length > length) {
    return value.substr(0, length - 1) + '...'
  } else {
    return value
  }
}

// http://jsben.ch/ZAaku
function formatNum(n) {
  if (n < 10) return '0' + n;
  return n;
}

/**
 * url 链接后添加字符串
 *
 * @param {*} url
 * @param {string} [paramsUrl='']
 * @returns string
 */
function urlfix(url, paramsUrl = '') {
  let fixUrl = url;
  if (paramsUrl) {
    fixUrl = url + (url.indexOf('?') === -1 ? '?' : '&') + paramsUrl;
  }
  return fixUrl;
}

const mini = {
  addPoint,
  Trim,
  stringify,
  getQueryString,
  replaceSPM,
  formatNum,
  urlfix,
};

export default mini;

