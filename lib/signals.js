var Promise = require('bluebird')
var delete_expired = function(opt, callback) {
    var seneca = this
    var signal_log = seneca.make$('signal_log')
    var signal_log_list$ = Promise.promisify(signal_log.list$, {
        context: signal_log
    })
    signal_log_list$().then(function(val) {
        val.forEach(function(item) {
            if (item.status === 'PENDING_OPEN' || item.status === 'PENDING_CLOSE') item.remove$({
                id: item.id
            })
        })
        callback(null,true)
    }).catch(e => {
        callback(err)
    })
}
module.exports = delete_expired