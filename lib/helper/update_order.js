var Promise = require('bluebird')

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
		var filtered_signals = val.filter((elem) => (elem.signal_status === 'PENDING_OPEN' || elem.signal_status === 'PENDING_CLOSE'))

		if (filtered_signals.length === 1) {
			var elem = filtered_signals[0]
			var current_status = elem.signal_status
			if (elem.transaction_type === opt.order_obj.transaction_type) {
				elem.signal_status = (elem.signal_status).replace(/PENDING_/, "")
				elem.log.push([elem.signal_status, elem.transaction_type, Date.now()])
				elem.save$(function(err, val) {
					if (err) throw err;
					callback(null,val)
				})
			} else
				throw new Error("Forbidden branch reached")
		} else
			throw new Error("Forbidden branch reached")

	}).catch(e => {
		throw e
	})
}

module.exports = update_order
	