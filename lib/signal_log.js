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
module.exports.all = all
// module.exports.add = add
// module.exports.retire = retire
// module.exports.remove = remove
// module.exports.change_status = change_status
// module.exports.update = update