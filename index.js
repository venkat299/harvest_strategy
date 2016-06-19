var update_order = require('./lib/helper/update_order')

// ######## strategy imports #########//
var fifty_2_wk = require('./lib/fifty_2_wk.js');
var watchlist = require('./lib/watchlist.js');
var routine = require('./lib/routine.js');

var opts = {};

module.exports = function(options) {

	var seneca = this
	var extend = seneca.util.deepextend
	opts = extend(opts, options)

	seneca.add('role:strategy,id:fifty_2_wk,cmd:update_order', update_order.bind(seneca))
	seneca.add('role:strategy,id:fifty_2_wk,cmd:run', fifty_2_wk.run.bind(seneca))

//TODO pattern name to be changed from strategy to routine and daily to be removed
	seneca.add('role:routine,cmd:run_routine', routine.run_routine.bind(seneca))
	seneca.add('role:routine,cmd:monthly_eod_update', routine.monthly_eod_update.bind(seneca))

	seneca.add('role:watchlist,cmd:all', watchlist.all.bind(seneca))
	seneca.add('role:watchlist,cmd:add', watchlist.add.bind(seneca))
	seneca.add('role:watchlist,cmd:retire', watchlist.retire.bind(seneca))
	seneca.add('role:watchlist,cmd:remove', watchlist.remove.bind(seneca))

		//seneca.add('role:info,req:part', aliasGet)

	return {
		name: 'harvest_strategy'
	}


}