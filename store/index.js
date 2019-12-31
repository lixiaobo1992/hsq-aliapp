import location1 from './modules/location';
import orderCommit from './modules/order-commit';
import msg from './modules/msg'
import user from './modules/user';
import spm from './modules/spm'
//  不能使用关键字 location
export default {
  modules: {
    location: location1,
    order_commit: orderCommit,
    msg,
    user,
    spm
  },
}
