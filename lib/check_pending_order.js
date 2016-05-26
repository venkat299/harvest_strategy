var Promise = require('bluebird')

var check_pending_order = function(opt, callback) {
	var seneca = this
	var new_value = {
		strategy_id: opt.strategy_id,
		tradingsymbol: opt.tradingsymbol,
		transaction_type: opt.transaction_type,
		signal_status: opt.signal_status,
		log: []
	}
	new_value.log.push([opt.signal_status, opt.transaction_type, Date.now()])

	var signal_log = seneca.make$('signal_log')
	var signal_log_list$ = Promise.promisify(signal_log.list$, {
		context: signal_log
	})

	signal_log_list$({
		strategy_id: opt.strategy_id,
		tradingsymbol: opt.tradingsymbol
	}).then(function(val) {
		var filtered_signals = val.filter((elem) => (elem.signal_status === 'PENDING_OPEN' || elem.signal_status === 'OPEN' || elem.signal_status === 'PENDING_CLOSE'))
		if (filtered_signals.length === 0) {
			//create log entry with status PENDING_OPEN 
			var signal_log = seneca.make$('signal_log', new_value)
			var signal_log_save$ = Promise.promisify(signal_log.save$, {
				context: signal_log
			})
			signal_log_save$().then(function() {
				callback(null, true) //new signal is logged  into the db
			})
		} else if (filtered_signals.length === 1) {
			var opposing_signal = (opt.transaction_type === 'BUY' )? 'SELL' : 'BUY'
			var entity = filtered_signals[0]
				if(entity.transaction_type===opposing_signal&&entity.signal_status==='PENDING'){
					entity.signal_status = 'PENDING_CLOSE'
					entity.transaction_type = opt.transaction_type
					entity.push([entity.signal_status,entity.transaction_type,Date.now() ])
					entity.save$(function(){
						callback(null, true)
					})
				}
				else{
					callback(null, false) // signal is already open
				}

		} else {
				throw new Error("dead branch reached")
			}


		// var opposing_signal = opt.transaction_type==='BUY'?'SELL':'BUY'
		// var matching_signals = val.filter((elem) => (elem.signal_status ==='OPEN'||elem.signal_status==='PENDING')&&elem.transaction_type===opt.transaction_type)
		// var opposing_signals = val.filter((elem) => (elem.signal_status ==='OPEN'||elem.signal_status==='PENDING')&&(elem.transaction_type===opposing_signal))
		// if (matching_signals.length > 0)
		// 	{
		// 	callback(null, false) 
		// 	//there is an  outstanding order
		// 	}
		// else if(opposing_signals.length > 0){
		// 	// closing signal order
		// 	callback(null, true)
		// }
		// else {
		// 	var signal_log = seneca.make$('signal_log', new_value)
		// 	var signal_log_save$ = Promise.promisify(signal_log.save$, {
		// 		context: signal_log
		// 	})
		// 	signal_log_save$().then(function() {
		// 		callback(null, true) //new signal is logged  into the db
		// 	})
		// }
	}).catch(e => {
		throw e
	})
}

module.exports = check_pending_order