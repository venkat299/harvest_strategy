var Promise = require('bluebird')
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
        var strategy_stock = seneca.make$('strategy_stock').list$({
            tradingsymbol: opt.tradingsymbol,
            strategy_id: opt.strategy_id
        }, function(err,ls) {
            if (!ls.length == 1) throw new Error("Err: Multiple entities received");
            var entity = ls[0]
            entity.signal_log = val.data$(false)
            entity.save$(function(err) {
                if (err) callback(err);
                callback(null, true)
            })
        })
    })
}
module.exports = save_signal