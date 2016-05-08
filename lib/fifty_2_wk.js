// =======================
// private lib
// =======================
var config = {
	"id": "fifty_2_wk",
	"profit_margin": 0.1,
	"buy_price_threshold": 1.25
};

var run = function(opt, cb) {
	var data = opt.data
	var id = opt.symbol

		cb(null, {
			success: true,
			msg: 'msg received; relaying to order evaluator '
		});
	this.act('role:data,cmd:query,list:false', {
		symbol: id,
		q: 't-52w'
	}, function(err,val) {
		this.log.info(val);
		var t_52w_close = val.data.close;
		if ((data.ltp || data.close) <= t_52w_close * config.buy_price_threshold)
		// buy when stock dips below 52 week low
			this.log.info('broadcast buy call for stock: ', id)
			// else if (data.ltp || data.close >= act(role:'eval',strat: strat_id, symbol: id, q: avg_price) * profit_margin) // sell when stock ebbs above profit margin
		else
			this.log.info('no feasible order suggestion from strategy:', config.id, 'for symbol:', opt.symbol)


			//this.log.info('t_52w_close:',t_52w_close,'data.close:',data.close,'trigger price:',t_52w_close * config.buy_price_threshold)

	});


}



module.exports.run = run;