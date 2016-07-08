var update_order = require('./lib/helper/update_order')
	// ######## strategy imports #########//
var fifty_2_wk = require('./lib/fifty_2_wk.js');
var watchlist = require('./lib/watchlist.js');
var strategy_stock = require('./lib/strategy_stock.js');
var signal_log = require('./lib/signal_log.js');
var order_log = require('./lib/order_log.js');
var routine = require('./lib/routine.js');
var opts = {};
module.exports = function(options) {
	var seneca = this
	var extend = seneca.util.deepextend
	opts = extend(opts, options)
		//======= strategy ===========//
	seneca.add('role:strategy,id:fifty_2_wk,cmd:update_order', update_order.bind(seneca))
	seneca.add('role:strategy,id:fifty_2_wk,cmd:run', fifty_2_wk.run.bind(seneca))
		//======= routine ===========//
	//seneca.add('role:routine,cmd:run_routine', routine.run_routine.bind(seneca))
	seneca.add('role:routine,cmd:run_routine', routine.run_routine_all.bind(seneca))
	seneca.add('role:routine,cmd:monthly_eod_update', routine.monthly_eod_update.bind(seneca))
		//======= watchlist ===========//
	seneca.add('role:watchlist,cmd:all', watchlist.all.bind(seneca))
	seneca.add('role:watchlist,cmd:add', watchlist.add.bind(seneca))
	seneca.add('role:watchlist,cmd:retire', watchlist.retire.bind(seneca))
	seneca.add('role:watchlist,cmd:remove', watchlist.remove.bind(seneca))
	seneca.add('role:watchlist,cmd:change_status', watchlist.change_status.bind(seneca))
		//======= strategy_stock ===========//
	seneca.add('role:strategy_stock,cmd:all', strategy_stock.all.bind(seneca))
	seneca.add('role:strategy_stock,cmd:add', strategy_stock.add.bind(seneca))
	seneca.add('role:strategy_stock,cmd:retire', strategy_stock.retire.bind(seneca))
	seneca.add('role:strategy_stock,cmd:remove', strategy_stock.remove.bind(seneca))
	seneca.add('role:strategy_stock,cmd:change_status', strategy_stock.change_status.bind(seneca))
	seneca.add('role:strategy_stock,cmd:update', strategy_stock.update.bind(seneca))
		//======= signal_log ===========//
	seneca.add('role:signal_log,cmd:all', signal_log.all.bind(seneca))
	//======= order_log ===========//
	seneca.add('role:order_log,cmd:all', order_log.all.bind(seneca))
		//======= clear expired signals ===========//
	seneca.add('role:signal_log,cmd:delete_expired', signal_log.delete_expired.bind(seneca))

	return {
		name: 'harvest_strategy'
	}
}