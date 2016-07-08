var Promise = require('bluebird')
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
var delete_expired = function(opt, callback) {
    var seneca = this
    var signal_log = seneca.make$('signal_log')
    var signal_log_list$ = Promise.promisify(signal_log.list$, {
        context: signal_log
    })
    signal_log_list$().then(function(val) {
        val.forEach(function(item) {
        	console.log(item.signal_status)
            if (item.signal_status === 'PENDING_OPEN' || item.signal_status === 'PENDING_CLOSE') {
                item.remove$({
                    id: item.id
                }, function(err, val) {
                    if (err) console.log(err);
                    console.log('deleted signal_log', val)
                })
            }
        })
        callback(null, {
            success: true
        })
    }).catch(e => {
        callback(err)
    })
}
module.exports.all = all
module.exports.delete_expired = delete_expired
// module.exports.add = add
// module.exports.retire = retire
// module.exports.remove = remove
// module.exports.change_status = change_status
// module.exports.update = update