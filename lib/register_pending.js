var Promise = require('bluebird')

var register_pending = function(opt,callback){
	var seneca =this

	var signal_log = seneca.make$('signal_log')
	var signal_log_list$ = Promise.promisify(signal_log.list$, {
		context: signal_log
	})
	var signal_log_save$ = Promise.promisify(signal_log.save$, {
				context: signal_log
	})
	signal_log_list$({
		strategy_id: opt.strategy_id,
		tradingsymbol: opt.tradingsymbol
	}).then(function(val) {

		val = val.filter((elem) => !(elem.signal_status ==='COPMLETE'))
		if (val.length > 0){
					//there is an  outstanding order
		var signal_log_entity = val[0];
		signal_log_entity.log.push([opt.signal_status,opt.transaction_type,Date.now()])
		signal_log_entity.save$(function(){
			callback(null,true)
		})
	}
		else {
			// this branch should not be executed
		throw new Error('There should be a signal with "OPEN" or "PENDING" status for given stock_id or strategy_id')
		}
	
	}
	).catch(e => {throw e})

}

module.exports = register_pending