var Promise = require('bluebird')
var Promise = require('bluebird')
var PythonShell = require('python-shell');

PythonShell.defaultOptions = {
	scriptPath: './python_src/',
	mode: 'json',
	detached: true
}

var daily = function(opt, callback) {
	var seneca = this


	// calculate ror for all stock
	var watchlist = seneca.make$('watchlist')

	var watchlist_list$ = Promise.promisify(watchlist.list$, {
		context: watchlist
	})
	//console.log('opt:::',opt.query)
	watchlist_list$(opt.query).then(function(list) {
		if (!(list.length == 1)) throw new Error("ERR:COLLECTION_COUNT_MISMATCH");
		var item = list[0]
		calculate_ror(item, function(err,received_dt) {
				if (err) throw err;
				else {
					received_dt = JSON.parse(received_dt)
					console.log('received_dt:', received_dt)

					item.ror = received_dt.ror
					item.returns_std = received_dt.returns_std
					item.fixed_returns = received_dt.fixed_returns
					item.cycle_periods = received_dt.cycle_periods
					item.update_time =  Date.now()
					// save the record
					item.save$(function(){
						callback(null,received_dt)
					})
					
				}
			})


	})

	function calculate_ror(opt, cb) {
		var received_dt = null
		var pyshell = new PythonShell('/schedule/fifty_2_wk_daily.py');
		var output = '';
		pyshell.stdout.on('data', function(data) {
			received_dt = data;
		});
		pyshell.send(opt).end(function(){
			cb(null,received_dt)
		});
	}



}


module.exports.daily = daily