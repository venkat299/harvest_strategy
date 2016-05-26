var Promise = require('bluebird')

var save_signal = function(opt, callback) {
	var seneca = this

	var signal_log = seneca.make$('signal_log', {
		transaction_type: opt.transaction_type,
		tradingsymbol: opt.tradingsymbol,
		strategy_id: opt.strategy_id,
		signal_status: opt.signal_status,
		log: [[opt.signal_status, opt.transaction_type, Date.now()]]
	})

	signal_log.save$(function(err,val) {
		callback(null, true)
	})
}

module.exports = save_signal