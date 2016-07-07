var Promise = require('bluebird')

/**
* this funct
*/
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
		if (!(filtered_signals.length == 1))
			throw new Error("ERR:COLLECTION_COUNT_MISMATCH")

		var elem = filtered_signals[0]
		var current_status = elem.signal_status
		if (!(elem.transaction_type === opt.order_obj.transaction_type))
			throw new Error("ERR:ILLEGAL_ENTITY_STATE")

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

module.exports = update_order