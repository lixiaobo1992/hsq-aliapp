

import { MAIN_APPID_KEY_VAL, WHITE_APPID_KEY_VAL } from '/config'

import objectUtil from './objectUtil';


function dealMiniAppJump(query) {

    let tempQuery = query || {}

    if (!tempQuery.appname && !tempQuery.appid) {
        console.log('小程序之间跳转, 缺少appname,appid');
        return false
    }

    let currAppId = null;

    let mainAppId = MAIN_APPID_KEY_VAL[tempQuery.appname]; // 同主体下小程序

    if (mainAppId) {
        currAppId = mainAppId
        tempQuery.miniAppType = 1 // 同主体下小程序
    }else{
        if(!tempQuery.appid) {
            return false;
        }
        currAppId = tempQuery.appid
    }

    return {
        currAppId,
        tempQuery
    }
}

export default dealMiniAppJump



