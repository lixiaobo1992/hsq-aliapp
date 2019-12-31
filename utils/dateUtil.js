// function format(date, options = {type: 'date', format: 'Y年M月D日'}) {
//   if (options.type === 'countdown' && !options.format) {
//     options.format = 'H时F分S秒';
//   }

// }
import { formatNum } from './stringUtil';


/**
 * formatCountDown(times, 'D天H:F:S')
 *
 * @param {any} times
 * @param {string} [format='H:F:S']
 * @returns
 */
function formatCountDown(times, format = 'H:F:S') {
  let time = parseInt(times * 0.001, 10);

  const seconds = time % 60;
  time = parseInt(time / 60, 10);
  const minutes = time % 60;
  time = parseInt(time / 60, 10);
  const hours = parseInt(time % 24, 10);
  const days = parseInt(time / 24, 10);

  return format.replace(/Y|y|M|m|D|d|H|h|F|f|S|s/g, function (a) {
    switch (a) {
      case "d": return days;
      case "D": return formatNum(days);
      case "h": return hours;
      case "H": return formatNum(hours);
      case "f": return minutes;
      case "F": return formatNum(minutes);
      case "s": return seconds;
      case "S": return formatNum(seconds);
    }
  });
}

// 返回类似对象,传入毫秒
//   {
//     days: 1,
//     hours: 1,
//     minutes: 1,
//     seconds: 1,
//   }
function formatCountDownObj(times, flag){
  let time = parseInt(times * 0.001, 10);
  let fomatTimes = {};
  fomatTimes.seconds = time % 60;
  time = parseInt(time / 60, 10);
  fomatTimes.minutes = time % 60;
  time = parseInt(time / 60, 10);
  fomatTimes.hours = parseInt(time % 24, 10);
  fomatTimes.days = parseInt(time / 24, 10);
  if(flag) {
    let item;
    for(item in fomatTimes){
      if(fomatTimes[item] < 10 && item != 'days') {
        fomatTimes[item] = '0' + fomatTimes[item]
      }
    }
  }
  return fomatTimes
}
function formatDate(date, format = 'Y年M月D日') {
  if (typeof date === 'number') {
    date = new Date(date * 1000);
  }
  return format.replace(/Y|y|M|m|D|d|H|h|F|f|S|s/g, function (a) {
    switch (a) {
      case "y": return (date.getFullYear() + "").slice(2);
      case "Y": return date.getFullYear();
      case "m": return date.getMonth() + 1;
      case "M": return formatNum(date.getMonth() + 1);
      case "d": return date.getDate();
      case "D": return formatNum(date.getDate());
      case "h": return date.getHours();
      case "H": return formatNum(date.getHours());
      case "f": return date.getMinutes();
      case "F": return formatNum(date.getMinutes());
      case "s": return date.getSeconds();
      case "S": return formatNum(date.getSeconds());
    }
  });
}
// 传入毫秒，计算出剩余时间的时分秒
function formatLeftTimeObj(time, hasZero = true) {
  if (typeof time !== 'number') {
    time = parseInt(time)
  }
  time = parseInt(time / 1000)
  const d = parseInt(time / 86400)
  time = time - d * 86400
  const h = parseInt(time / 3600)
  time = time - h * 3600
  const f = parseInt(time / 60)
  const s = time - f * 60
  return {
    d: hasZero ? formatNum(d) : d,
    h: hasZero ? formatNum(h) : h,
    f: hasZero ? formatNum(f) : f,
    s: hasZero ? formatNum(s) : s,
  }
}

// 返回类似对象,传入毫秒
//   {
//     days: 1,
//     hours: 1,
//     minutes: 1,
//     seconds: 1,
//   }
function formatCountDownObj(times, flag){
  let time = parseInt(times * 0.001, 10);
  let fomatTimes = {};
  fomatTimes.seconds = time % 60;
  time = parseInt(time / 60, 10);
  fomatTimes.minutes = time % 60;
  time = parseInt(time / 60, 10);
  fomatTimes.hours = parseInt(time % 24, 10);
  fomatTimes.days = parseInt(time / 24, 10);
  if(flag) {
    let item;    
    for(item in fomatTimes){
      if(fomatTimes[item] < 10 && item != 'days') {
        fomatTimes[item] = '0' + fomatTimes[item]
      }
    }
  }
  return fomatTimes
}


//计算剩余时间
function computeTime(currTime,endTime) {

  var surplus= endTime-currTime;
  if (surplus < 0) {
    console.warn('结束时间不能小与当前时间')
    return {
      days:0,
      hours:0,
      minutes:0,
      seconds:0,
      millisecond:0
    }
  }
  //计算出相差天数
  var days=Math.floor(surplus/(24*3600*1000))
    
  //计算出小时数
  var leave1=surplus%(24*3600*1000)    //计算天数后剩余的毫秒数
  var hours=Math.floor(leave1/(3600*1000))
  //计算相差分钟数
  var leave2=leave1%(3600*1000)        //计算小时数后剩余的毫秒数
  var minutes=Math.floor(leave2/(60*1000))
  //计算相差秒数
  var leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
  var seconds=Math.round(leave3/1000)
  //计算相差毫秒
  var leave4=leave3%1000      //计算分钟数后剩余的毫秒数
  // var seconds=Math.round(leave3/1000)
  // console.log(Math.floor(leave4/100))
  var millisecond = Math.floor(leave4/100)
  // console.log(hours,minutes,seconds)
  return {
    days: formatNum(days),
    hours: formatNum(hours),
    minutes: formatNum(minutes),
    seconds: formatNum(seconds),
    millisecond: millisecond
  }
}

export default {
  formatDate,
  formatCountDown,
  formatNum,
  computeTime,
  formatCountDownObj,
  formatLeftTimeObj,
}
