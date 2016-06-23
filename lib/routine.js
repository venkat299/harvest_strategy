var Promise = require('bluebird')
var Promise = require('bluebird')
var PythonShell = require('python-shell');
var python_dir = __dirname + '/../python_src/'
PythonShell.defaultOptions = {
	scriptPath: python_dir,
	mode: 'json',
	detached: true
}
var run_routine_all = function(opt, callback) {
	var seneca = this
		//console.log('python_src_path: ', python_dir)
		// calculate ror for all stock
	var watchlist = seneca.make$('watchlist')
	var watchlist_list$ = Promise.promisify(watchlist.list$, {
			context: watchlist
		})
		//console.log('opt:::', opt)
	var query_param = {
		strategy_id: opt.strategy_id,
		status: 'ACTIVE'
	}
	if (opt.tradingsymbol) query_param.tradingsymbol = opt.tradingsymbol
	watchlist_list$(query_param).then(function(list) {
		//console.log('list:::', list)
		if ((list.length <= 0)) throw new Error("ERR:COLLECTION_COUNT_MISMATCH");
		// return web request prematurely in case of batch call
		if ((!opt.await)&&(!opt.tradingsymbol)) callback(null, {success:true})
		var stock_list = list.map((item) => {
			return item.tradingsymbol
		})
		var param = {
				'python_dir': python_dir,
				data: stock_list
			}
			//console.log('param-->', param)
		calculate_ror(param, function(err, received_dt) {
			if (err) throw err;
			else {
				received_dt = JSON.parse(received_dt)
				//console.log('received_dt:', received_dt)
				list.forEach((item) => {
					//console.log(item);
					var temp = received_dt.data.find((x) => {
							return x.tradingsymbol === item.tradingsymbol
						})
						//expected keys
					item.ror = temp.ror
					item.returns_std = temp.returns_std
					item.returns_mean = temp.returns_mean
						//optional keys
					item.fixed_returns = temp.fixed_returns
					item.cycle_periods = temp.cycle_periods
					item.update_time = Date.now()
					item.save$(() => {
						//console.log('saved_item_successfully')
					})
				})
				received_dt.success = true;
				callback(null, received_dt)
			}
		})
	})

	function calculate_ror(opt, cb) {
		var received_dt = null
		opt.python_dir = python_dir
			//console.log('in calculate_ror:-->calculate_ror', received_dt)
			//var pyshell = new PythonShell('schedule/fifty_2_wk_daily.py');
		var pyshell = new PythonShell('schedule/fifty_2_wk/daily.py');
		var output = '';
		pyshell.stdout.on('data', function(data) {
			received_dt = data;
			//console.log('received_dt:-->', received_dt)
		});
		pyshell.send((opt)).end(function(err) {
			if (err) cb(err)
			if (!received_dt) cb('ERR:PYTHON_TASK_FAILED')
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
		if (err) callback(err)
		if (!received_dt) callback('ERR:PYTHON_TASK_FAILED')
		callback(null, JSON.parse(received_dt))
	});
}
module.exports.run_routine_all = run_routine_all
module.exports.monthly_eod_update = monthly_eod_update