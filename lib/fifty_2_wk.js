// =======================
// private lib
// =======================
var config = {
	"symbol": "fifty_2_wk",
	"profit_margin": 1.1, // 10%
	"buy_price_threshold": 1.25 // 25%
};

var run = function(opt, cb) {
	var data = opt.data
	var symbol = opt.symbol
	var cb_msg = null;
	var cb_msg_obj = null;
	var curr_track_id = Date.now() + '/strategy/' + symbol

	this.act('role:data,cmd:query,list:false', {
		symbol: symbol,
		q: 't-52w'
	}, function(err, val) {
		this.log.info(val);

		var t_52w_low = val.data.low;
		if ((data.ltp || data.close) <= t_52w_low * config.buy_price_threshold) { // buy when stock dips below 52 week low
			cb_msg_obj = {
				symbol: symbol,
				strategy_id: 'fifty_2_wk',
				track_id: curr_track_id
			}
			var route = 'role:evaluator,cmd:buy'
			cb_msg = route
			this.act(route, cb_msg_obj, this.log.info);
			this.log.info('broadcast buy call for stock: ', symbol)

		} else {
			//var outstanding_order = true; // TODO implement this logic
			var prev_buy_price = 125; //@import
			if ((data.ltp || data.close) >= prev_buy_price * config.profit_margin) // sell when stock ebbs above profit margin
			{
				var route = 'role:evaluator,cmd:sell'
					//this.act(route, cb_msg_obj, this.log.info);
				this.log.info('broadcast sell call for stock: ', symbol)
				cb_msg_obj = {
					symbol: symbol,
					strategy_id: 'fifty_2_wk',
					track_id: curr_track_id
				}
				cb_msg = route
			} else {
				var route = 'role:null,cmd:null'
				cb_msg_obj = null
				this.log.info('no feasible order suggestion from strategy:', config.symbol, 'for symbol:', opt.symbol)
				cb_msg = route
			}
		}

		cb(null, {
			success: true,
			cb_msg: cb_msg,
			cb_msg_obj: cb_msg_obj,
			curr_track_id: curr_track_id,
			prev_track_id: null
		});
	});


}



module.exports.run = run;