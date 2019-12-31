// 数组去重
export function arrayToHeavy(tempArray, key) {
  if (key) {
    const obj = {}
    const newArray = tempArray.reduce((cur, next) => {
      if (next && !obj[next[key]]) {
        obj[next[key]] = true && cur.push(next)
      }
      return cur;
    }, [])

    return newArray
  } else {
    return [...new Set(tempArray)]
    // const res = [];
    // const json = {};
    // for (let i = 0; i < tempArray.length; i++) {
    //   if (!json[tempArray[i]]) {
    //     res.push(tempArray[i]);
    //     json[tempArray[i]] = 1;
    //   }
    // }
    // return res;
  }
}


// 交集
export function getArrayBeMixed(arr1, arr2) {
  return arr1.filter(v => arr2.indexOf(v) > -1);
}
// 差集
export function getArrayDiff(arr1, arr2) {
  return arr1.filter(v => arr2.indexOf(v) == -1);
}
// 补集
export function getArrayComplement(arr1, arr2) {
  return arr1.filter(function(v){ return !(arr2.indexOf(v) > -1) })
      .concat(arr2.filter(function(v){ return !(arr1.indexOf(v) > -1)}))
}
// 并集
export function getArrayUnion(arr1, arr2) {
  return arr1.concat(arr2.filter(function(v){ return !(arr1.indexOf(v) > -1)}));
}
