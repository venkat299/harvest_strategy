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
		var filtered_signals = val.filter((elem) => (elem.signal_status === 'PENDING_OPEN' || elem.signal_status === 'PENDING_CLOSE'))
		if (!(filtered_signals.length == 1))
			throw new Error("ERR:COLLECTION_COUNT_MISMATCH")

		var elem = filtered_signals[0]
		var current_status = elem.signal_status
		if (!(elem.transaction_type === opt.order_obj.transaction_type))
			throw new Error("ERR:ILLEGAL_ENTITY_STATE")

		elem.signal_status = (elem.signal_status).replace(/PENDING_/, "")
		elem.log.push([elem.signal_status, elem.transaction_type, Date.now()])
		elem.save$(function(err, val) {
			if (err) throw err;
			var final_val = val
			if (opt.status === 'COMPLETE') {
				var strategy_stk = seneca.make$('strategy_stock')
				strategy_stk.list$({
					// strategy_id: opt.strategy_id,
					// tradingsymbol: opt.tradingsymbol
				}, function(err,val) {
					//console.log(val)
					if (!(val.length == 1))
						throw new Error("ERR:COLLECTION_COUNT_MISMATCH")

					var elem = val[0]
					if (opt.order_detail.transaction_type === 'BUY')
						elem.prev_buy_price = opt.order_detail.average_price
					else
						elem.prev_sell_price = opt.order_detail.average_price

					elem.save$(function(err) {
						if (err)
							throw err;
						callback(null, final_val)
						//console.log('Transaction Price ie avg price updated succesfully ')
					})

				})
			} else
				callback(null, final_val)
		})



	}).catch(e => {
		throw e
	})
}

module.exports = update_order