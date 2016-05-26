// =======================
// private lib
// =======================
//"use strict";
var config = {
	"tradingsymbol": "YESBANK",
	"profit_margin": 1.1, // 10%
	"buy_price_threshold": 1.25 // 25%
};
var Promise = require('bluebird')

var register_pending = require('./register_pending')
var check_pending_order = require('./check_pending_order')

var run = function(opt, cb) {
	var seneca = this
	var data = opt.data
	var tradingsymbol = opt.tradingsymbol
	var cb_msg = null;
	var cb_msg_obj = null;
	var curr_track_id = Date.now() + '/strategy/' + tradingsymbol;
	//console.log('typeof check_pending_order:', typeof check_pending_order)
	
	var my_check_pending_order = check_pending_order.bind(this)
	my_check_pending_order = Promise.promisify(my_check_pending_order)

	var my_register_pending = register_pending.bind(this)
	my_register_pending = Promise.promisify(my_register_pending)

	seneca.act('role:data,cmd:query,list:false', {
		tradingsymbol: tradingsymbol,
		q: 't-52w'
	}, function(err, val) {
		var t_52w_low = val.data.low;
		if ((data.ltp || data.close) <= t_52w_low * config.buy_price_threshold) { // buy when stock dips below 52 week low
			cb_msg_obj = {
				transaction_type: 'BUY',
				tradingsymbol: tradingsymbol,
				strategy_id: 'fifty_2_wk',
				track_id: curr_track_id,
				ltp: (data.ltp || data.close),
				signal_status:'PENDING_OPEN'
			}
			var route = 'role:evaluator,cmd:evaluate'
			
			my_check_pending_order(cb_msg_obj).then(function(val) {
				if (val) // no pending order
				{
					cb_msg = route
					seneca.act(route, cb_msg_obj, function(res) {
					cb(null, {
						success: true,
						cb_msg: cb_msg,
						cb_msg_obj: cb_msg_obj,
						curr_track_id: curr_track_id,
						prev_track_id: null
					})
				})
				}
					
				else
					my_register_pending(cb_msg_obj).then(function(val){
						cb_msg = route+':order_already_signaled'
						cb(null, {
						success: true,
						cb_msg: cb_msg,
						cb_msg_obj: cb_msg_obj,
						curr_track_id: curr_track_id,
						prev_track_id: null
					})
					})
			})

			//this.log.info('broadcast buy call for stock: ', tradingsymbol)

		} else {
			//var outstanding_order = true; // TODO implement this logic
			var prev_buy_price = 125; //@import
			if ((data.ltp || data.close) >= prev_buy_price * config.profit_margin) // sell when stock ebbs above profit margin
			{
				var route = 'role:evaluator,cmd:evaluate,transaction_type:SELL'


				//this.log.info('broadcast sell call for stock: ', tradingsymbol)
				cb_msg_obj = {
					tradingsymbol: tradingsymbol,
					strategy_id: 'fifty_2_wk',
					track_id: curr_track_id
				}
				cb_msg = route
				seneca.act(route, cb_msg_obj, function(res) {
					cb(null, {
						success: true,
						cb_msg: cb_msg,
						cb_msg_obj: cb_msg_obj,
						curr_track_id: curr_track_id,
						prev_track_id: null
					});
				});
			} else {
				var route = 'role:null,cmd:null'
				cb_msg_obj = null
					//this.log.info('no feasible order suggestion from strategy:', config.tradingsymbol, 'for tradingsymbol:', opt.tradingsymbol)
				cb_msg = route

				cb(null, {
					success: true,
					cb_msg: cb_msg,
					cb_msg_obj: cb_msg_obj,
					curr_track_id: curr_track_id,
					prev_track_id: null
				})
			}
		}
	});


}

var update_order = function(opt, cb) {
	cb()
}

module.exports.run = run
module.exports.update_order = update_order