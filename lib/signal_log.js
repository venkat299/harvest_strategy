var Promise = require('bluebird')

function signal_log(options) {
    var seneca = this
        // the logging function, built by init
    var app_config = options.app_config;
    /* Retrieves all the signals for the given strategy
     */
    this.add('role:signal_log,cmd:all', all.bind(seneca))
    /* TODO : add description
     *
     */
    this.add('role:signal_log,cmd:update_order', update_order.bind(seneca))
    /* Resets the signal status from pending to its previous state
     * ie (PENDING_OPEN -> OPEN) && (PENDING_CLOSE -> CLOSE)
     */
    this.add('role:signal_log,cmd:delete_expired', reset_expired.bind(seneca))
    /* TODO : add description
     *
     */
    this.add('role:signal_log,cmd:revert_signal', revert_signal.bind(seneca))
    /* Deletes the signal irrespective of its current state; 
     * Caution should be taken as it will completely remove a history of signal
     */
    this.add('role:signal_log,cmd:delete_hard', delete_signal.bind(seneca))
    /* ====== INFO ======
     * this is the special initialization pattern; commented out as it is not required now
     */
    //this.add('init:eod', init)
    // function init(msg, respond) {
    //   console.log('in init',options)
    //     console.log('initializing component:eod')
    //     app_config = options.app_config
    //     respond()
    // }
}
/* ====== METHOD IMPLEMENTATION & HELPERS ======
 */
var all = function(opt, callback) {
    var seneca = this
    var signal_log = seneca.make$('signal_log')
    var signal_log_list$ = Promise.promisify(signal_log.list$, {
        context: signal_log
    })
    signal_log_list$({
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
}
var reset_expired = function(opt, callback) {
    var seneca = this
    var signal_log = seneca.make$('signal_log')
    var signal_log_list$ = Promise.promisify(signal_log.list$, {
        context: signal_log
    })
    signal_log_list$().then(function(val) {
        val.forEach(function(item) {
            console.log(item.signal_status)
            if (item.signal_status === 'PENDING_OPEN') {
                item.remove$({
                    id: item.id
                }, function(err, val) {
                    if (err) console.log(err);
                    console.log('deleted signal_log', val)
                })
            }
            if (item.signal_status === 'PENDING_CLOSE') {
                item.signal_status = 'OPEN'
                item.save$(function(err, val) {
                    if (err) console.log(err);
                    console.log('changed signal_log status', val)
                })
            }
        })
        callback(null, {
            success: true
        })
    }).catch(e => {
        callback(e)
    })
}
var revert_signal = function(opt, callback) {
    var seneca = this
    var signal_log = seneca.make$('signal_log')
    var signal_log_list$ = Promise.promisify(signal_log.list$, {
        context: signal_log
    })
    var filter = {
            tradingsymbol: opt.tradingsymbol,
            strategy_id: opt.strategy_id
        }
        //console.log(filter)
    signal_log_list$(filter).then(function(val) {
        var filtered_signals = val //.filter((elem) => (elem.signal_status === 'CLOSE')) -- temporarily commented out; need to fix
        if (!(filtered_signals.length === 1)) throw new Error("ERR:ENTITY_COUNT_MISMATCH");
        var elem = filtered_signals[0]
        if (elem.signal_status === 'OPEN') elem.signal_status = 'PENDING_OPEN';
        if (elem.signal_status === 'CLOSE') elem.signal_status = 'PENDING_CLOSE';
        elem.save$(function(e) {
            if (e) callback(e)
            callback(null, {
                success: true
            })
        })
    }).catch(e => {
        callback(e)
    })
}
var delete_signal = function(opt, callback) {
    var seneca = this
    var signal_log = seneca.make$('signal_log')
    var signal_log_list$ = Promise.promisify(signal_log.list$, {
        context: signal_log
    })
    var filter = {
            tradingsymbol: opt.tradingsymbol,
            strategy_id: opt.strategy_id
        }
        //console.log(filter)
    signal_log_list$(filter).then(function(val) {
        var filtered_signals = val //.filter((elem) => (elem.signal_status === 'CLOSE')) -- temporarily commented out; need to fix
        if (!(filtered_signals.length === 1)) throw new Error("ERR:ENTITY_COUNT_MISMATCH");
        var elem = filtered_signals[0]
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
var save_signal = function(opt, callback) {
    var seneca = this
    var signal_log = seneca.make$('signal_log', {
        transaction_type: opt.transaction_type,
        tradingsymbol: opt.tradingsymbol,
        strategy_id: opt.strategy_id,
        signal_status: opt.signal_status,
        log: [
            [opt.signal_status, opt.transaction_type, Date.now()]
        ]
    })
    signal_log.save$(function(err, val) {
        if (err) throw err;
        callback(null, true)
    })
}
var switch_signal = function(opt, callback) {
    var seneca = this
    var signal_log = seneca.make$('signal_log')
    var signal_log_list$ = Promise.promisify(signal_log.list$, {
        context: signal_log
    })
    signal_log_list$({
        strategy_id: opt.strategy_id,
        tradingsymbol: opt.tradingsymbol
    }).then(function(val) {
        var filtered_signals = val.filter((elem) => (elem.signal_status === 'OPEN'))
        if (!(filtered_signals.length === 1)) throw new Error("Err: Multiple entities received");
        var elem = filtered_signals[0]
        if (elem.transaction_type === opt.transaction_type) throw new Error("Err: Illegal entity state");
        elem.signal_status = opt.signal_status
        elem.transaction_type = opt.transaction_type
        elem.log.push([opt.signal_status, opt.transaction_type, Date.now()])
        elem.save$(function(err, val) {
            if (err) throw err;
            callback(null, true)
        })
    }).catch(e => {
        throw e
    })
}
var check_pending_order = function(opt, callback) {
    var seneca = this
    var signal_log = seneca.make$('signal_log')
    var signal_log_list$ = Promise.promisify(signal_log.list$, {
        context: signal_log
    })
    signal_log_list$({
        strategy_id: opt.strategy_id,
        tradingsymbol: opt.tradingsymbol
    }).then(function(val) {
        var filtered_signals = val.filter((elem) => (elem.signal_status === 'PENDING_OPEN' || elem.signal_status === 'OPEN' || elem.signal_status === 'PENDING_CLOSE'))
            //console.log('filtered_signals', filtered_signals)
        if (filtered_signals.length === 0) callback(null, 'openable')
        else if (filtered_signals.length === 1) {
            var elem = filtered_signals[0]
            if (elem.signal_status === 'OPEN') callback(null, 'closable')
            else callback(null, 'pending')
        } else {
            throw new Error("Forbidden branch reached")
        }
    }).catch(e => {
        throw e
    })
}
var update_order = function(opt, callback) {
        var seneca = this
        var signal_log = seneca.make$('signal_log')
        var signal_log_list$ = Promise.promisify(signal_log.list$, {
            context: signal_log
        })
        signal_log_list$({
            strategy_id: opt.order_obj.strategy_id,
            tradingsymbol: opt.order_obj.tradingsymbol
        }).then(function(val) {
            //console.log('L19', 'val:', val)
            var filtered_signals = val.filter((elem) => (elem.signal_status === 'PENDING_OPEN' || elem.signal_status === 'PENDING_CLOSE'))
            if (!(filtered_signals.length == 1)) throw new Error("ERR:COLLECTION_COUNT_MISMATCH")
            var elem = filtered_signals[0]
            var current_status = elem.signal_status
            if (!(elem.transaction_type === opt.order_obj.transaction_type)) throw new Error("ERR:ILLEGAL_ENTITY_STATE")
            elem.signal_status = (elem.signal_status).replace(/PENDING_/, "")
            var signal_status = elem.signal_status
            elem.log.push([elem.signal_status, elem.transaction_type, Date.now()])
            elem.save$(function(err, val) {
                if (err) throw err;
                callback(null, val)
            })
        }).catch(e => {
            throw e
        })
    }
    //========== seneca api export
module.exports.signal_log = signal_log
//========== other_internal_dependency export
module.exports.update_order = update_order //should change name to update_signal
module.exports.get_signal_status = check_pending_order
module.exports.switch_signal = switch_signal
module.exports.save_signal = save_signal
module.exports.revert_signal = revert_signal