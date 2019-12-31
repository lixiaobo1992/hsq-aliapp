import { urlfix } from '/utils';
import { stringify } from './stringUtil';
import api from '/api';

export default {
  urlParams(url, params = {}){
    const tempParams = {
      token: api.getCommonParams().token || '',
      replace: true,
    };
    params = stringify(Object.assign({}, tempParams, params));
    let urlData = {
      currentTarget: {
        dataset: {
          url: urlfix(url, params)
        }
      }
    }
    return urlData;
  }

};
