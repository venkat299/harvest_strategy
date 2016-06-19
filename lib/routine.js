var Promise = require('bluebird')
var Promise = require('bluebird')
var PythonShell = require('python-shell');

var python_dir = __dirname + '/../python_src/'

PythonShell.defaultOptions = {
	scriptPath: python_dir,
	mode: 'json',
	detached: true
}

var run_routine = function(opt, callback) {
	var seneca = this

	//console.log('python_src_path: ', python_dir)
		// calculate ror for all stock
	var watchlist = seneca.make$('watchlist')

	var watchlist_list$ = Promise.promisify(watchlist.list$, {
		context: watchlist
	})
	//console.log('opt:::', opt)
	watchlist_list$({
		strategy_id: opt.strategy_id,
		tradingsymbol: opt.tradingsymbol
	}).then(function(list) {
		//console.log('list:::', list)
		if (!(list.length == 1)) throw new Error("ERR:COLLECTION_COUNT_MISMATCH");
		var item = list[0]
		calculate_ror(item, function(err, received_dt) {
			if (err) throw err;
			else {
				received_dt = JSON.parse(received_dt)
				console.log('received_dt:', received_dt)

				item.ror = received_dt.ror
				item.returns_std = received_dt.returns_std
				item.fixed_returns = received_dt.fixed_returns
				item.cycle_periods = received_dt.cycle_periods
				item.update_time = Date.now()
					// save the record
				item.save$(function() {
					callback(null, received_dt)
				})

			}
		})


	})

	function calculate_ror(opt, cb) {
		var received_dt = null
		opt.python_dir = python_dir
		console.log('in calculate_ror:-->calculate_ror', received_dt)
		var pyshell = new PythonShell('schedule/fifty_2_wk_daily.py');
		var output = '';

		pyshell.stdout.on('data', function(data) {
			received_dt = data;
			console.log('received_dt:-->', received_dt)
		});
		pyshell.send((opt)).end(function(err) {
			if (err)
				cb(err)
			if (!received_dt)
				cb('ERR:PYTHON_TASK_FAILED')
			cb(null, received_dt)
		});
	}



}

var monthly_eod_update = function(opt, callback) {
	var seneca = this

	//console.log('python_src_path: ', python_dir)
		// calculate ror for all stock

		var received_dt = null
		opt.python_dir = python_dir
		//console.log('in calculate_ror:-->calculate_ror', received_dt)
		var pyshell = new PythonShell('hist/monthly/eod_download.py');
		var output = '';

		pyshell.stdout.on('data', function(data) {
			received_dt = data;
			//console.log('received_dt:-->', received_dt)
		});
		pyshell.send((opt)).end(function(err) {
			if (err)
				callback(err)
			if (!received_dt)
				callback('ERR:PYTHON_TASK_FAILED')
			callback(null, JSON.parse(received_dt))
		});




}


module.exports.run_routine = run_routine
module.exports.monthly_eod_update = monthly_eod_update