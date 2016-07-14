var Promise = require('bluebird')
var Promise = require('bluebird')

function order_log(options) {
    var seneca = this;
    // the logging function, built by init
    var app_config = options.app_config;
    /* Retrieves all the orders for the given strategy
     */
    this.add('role:order_log,cmd:all', all.bind(seneca))
    /* 
     * ===== CONFUSION : is this method required?
     * TODO : add description
     */
    //this.add('role:order_log,cmd:revert_order', revert_order.bind(seneca))
    /* Deletes the order_logs only when the status is not 'COMPLETE'; 
     * Caution should be taken as it will completely remove a history of order
     */
    this.add('role:order_log,cmd:delete_hard', delete_order.bind(seneca))
}
/* ====== METHOD IMPLEMENTATION & HELPERS ======
 */
var all = function(opt, callback) {
    var seneca = this
    var order_log = seneca.make$('order_log')
    var order_log_list$ = Promise.promisify(order_log.list$, {
        context: order_log
    })
    order_log_list$({
        strategy_id: opt.strategy_id
        //sort$:{ror:-1}
    }).then(function(list) {
        //if(list) throw err;
        //console.log('list-->',list)
        callback(null, {
            success: true,
            data: list
        })
    })
};
// var revert_order = function(opt, callback) {
//     var seneca = this
//     var order_log = seneca.make$('order_log')
//     var order_log_list$ = Promise.promisify(order_log.list$, {
//         context: order_log
//     })
//     var filter = {
//             tradingsymbol: opt.tradingsymbol,
//             strategy_id: opt.strategy_id
//         }
//         //console.log(filter)
//     order_log_list$(filter).then(function(val) {
//         var filtered_orders = val //.filter((elem) => (elem.signal_status === 'CLOSE')) -- temporarily commented out; need to fix
//         if (!(filtered_orders.length === 1)) throw new Error("ERR:ENTITY_COUNT_MISMATCH");
//         var elem = filtered_orders[0]
//         if (elem.signal_status === 'OPEN') elem.signal_status = 'PENDING_OPEN';
//         if (elem.signal_status === 'CLOSE') elem.signal_status = 'PENDING_CLOSE';
//         elem.save$(function(e) {
//             if (e) callback(e)
//             callback(null, {
//                 success: true
//             })
//         })
//     }).catch(e => {
//         callback(e)
//     })
// }
var delete_order = function(opt, callback) {
    var seneca = this
    var order_log = seneca.make$('order_log')
    var order_log_list$ = Promise.promisify(order_log.list$, {
        context: order_log
    })
    var filter = {
            tradingsymbol: opt.tradingsymbol,
            strategy_id: opt.strategy_id
        }
    console.log('filter:',filter)
    order_log_list$(filter).then(function(val) {
        var filtered_orders = val //.filter((elem) => (elem.status === 'COMPLETE'))    
        if (!(filtered_orders.length === 1))  callback(new Error("ERR:ENTITY_COUNT_MISMATCH"));
        var elem = filtered_orders[0]
        if (elem.status === 'COMPLETE') callback(new Error("ERR:ILLEGAL_ENTITY_STATE")); //if order status is complete then it is not deleted
        elem.remove$(function(e) {
            if (e) callback(e)
            callback(null, {
                success: true
            })
        })
    }).catch(e => {
        callback(e)
    })
}
module.exports = order_log