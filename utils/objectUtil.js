
import { isObject } from './is'

const objectUtil = {
    values(obj){
        let tempArray = []
        if (isObject(obj)) {
            for (let key in obj) {
                tempArray.push(obj[key])
            }
        }
        return tempArray
    }
}


// copy & clone
export function clone(obj = '') {
  return obj ? JSON.parse(JSON.stringify(obj)) : obj;
}


export function compact(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'undefined') delete obj[key];
  }
  return obj;
}


export default objectUtil;




