const Promise = require('bluebird');

/* ====== METHOD IMPLEMENTATION & HELPERS ======
 */
function all(opt, callback) {
  const seneca = this;
  const order_log = seneca.make$('order_log');
  const order_log_list$ = Promise.promisify(order_log.list$, {
    context: order_log,
  });
  order_log_list$({
    strategy_id: opt.strategy_id,
    //sort$:{ror:-1}
  }).then((list) => {
    callback(null, {
      success: true,
      data: list,
    });
  });
}
// const revert_order = function(opt, callback) {
//     const seneca = this
//     const order_log = seneca.make$('order_log')
//     const order_log_list$ = Promise.promisify(order_log.list$, {
//         context: order_log
//     })
//     const filter = {
//             tradingsymbol: opt.tradingsymbol,
//             strategy_id: opt.strategy_id
//         }
//         //console.log(filter)
//     order_log_list$(filter).then(function(val) {
//         const filtered_orders = val //.filter((elem) => (elem.signal_status === 'CLOSE'))
// -- temporarily commented out; need to fix
//         if (!(filtered_orders.length === 1)) throw new Error('ERR:ENTITY_COUNT_MISMATCH');
//         const elem = filtered_orders[0]
//         if (elem.signal_status === 'OPEN') elem.signal_status = 'PENDING_OPEN';
//         if (elem.signal_status === 'CLOSE') elem.signal_status = 'PENDING_CLOSE';
//         elem.save$(functio n(e) {
//             if (e) callback(e)
//             callback(null, {
//                 success: true
//             })
//         })
//     }).catch(e => {
//         callback(e)
//     })
// }
function delete_order(opt, callback) {
  const seneca = this;
  const order_log = seneca.make$('order_log');
  const order_log_list$ = Promise.promisify(order_log.list$, {
    context: order_log,
  });
  const filter = {
    tradingsymbol: opt.tradingsymbol,
    strategy_id: opt.strategy_id,
  };
  // console.log('filter:', filter);
  order_log_list$(filter).then((val) => {
    const filtered_orders = val;
    // .filter((elem) => (elem.status === 'COMPLETE'))
    if ((filtered_orders.length !== 1)) callback(new Error('ERR:ENTITY_COUNT_MISMATCH'));
    const elem = filtered_orders[0];
    // if order status is complete then it is not deleted
    if (elem.status === 'COMPLETE') callback(new Error('ERR:ILLEGAL_ENTITY_STATE'));
    elem.remove$((e) => {
      if (e) callback(e);
      callback(null, {
        success: true,
      });
    });
  }).catch(e => {
    callback(e);
  });
}

function order_log_api() {
  const seneca = this;
  // const app_config = options.app_config;
  /** Retrieves all the orders for the given strategy
   */
  this.add('role:order_log,cmd:all', all.bind(seneca));
  /**
   * TODO: add description
   * FIXME: is this method required?
   */
  // this.add('role:order_log,cmd:revert_order', revert_order.bind(seneca))
  /**
   * Deletes the order_logs only when the status is not 'COMPLETE';
   * Caution should be taken as it will completely remove a history of order
   */
  this.add('role:order_log,cmd:delete_hard', delete_order.bind(seneca));
}

module.exports = order_log_api;