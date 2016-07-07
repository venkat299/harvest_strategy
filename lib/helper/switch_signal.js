var Promise = require('bluebird')
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
module.exports = switch_signal