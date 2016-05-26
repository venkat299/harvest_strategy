var Promise = require('bluebird')

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
		if (filtered_signals.length === 0)
			callback(null, 'openable')
		else if (filtered_signals.length === 1) {
			var elem = filtered_signals[0]
			if (elem.signal_status === 'OPEN')
				callback(null, 'closable')
			else
				callback(null, 'pending')
		} else {
			throw new Error("Forbidden branch reached")
		}
	}).catch(e => {
		throw e
	})
}

module.exports = check_pending_order