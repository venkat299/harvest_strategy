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
		var transaction_type =  opt.order_obj.transaction_type
		
		// val = val.filter((elem) => (elem.signal_status ==='OPEN'||elem.signal_status==='PENDING'))
		// if (val.length > 1)
		// 	callback(null, false) //there is an  outstanding order
		// else if(val.length==1) {
		// 	elem = val[0];
		// 	if(elem.transaction_type ===transaction_type)
		// 		{
		// 		 //make signal log status = OPEN//
		// 		}
		// 	else {

		// 	}
		// }
		// else{

		// }
	}).catch(e => {
		throw e
	})
}

module.exports = update_order