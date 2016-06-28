var Promise = require('bluebird')
var all = function(opt, callback) {
	var seneca = this
	var order_log = seneca.make$('order_log')
	var order_log_list$ = Promise.promisify(order_log.list$, {
		context: order_log
	})
	order_log_list$({
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
module.exports.all = all
// module.exports.add = add
// module.exports.retire = retire
// module.exports.remove = remove
// module.exports.change_status = change_status
// module.exports.update = update