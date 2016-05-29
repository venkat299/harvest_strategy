// =======================
// private lib
// =======================
//"use strict";
var Promise = require('bluebird')

var my_get_signal_status = require('./helper/get_signal_status')
var my_save_signal = require('./helper/save_signal')
var my_switch_signal = require('./helper/switch_signal')

var run = function(opt, final_cb) {
	var seneca = this
	var data = opt.data
	var tradingsymbol = opt.tradingsymbol
	var curr_track_id = Date.now() + '/strategy/' + tradingsymbol;
	var cb_msg = null;
	var cb_msg_obj = {
		tradingsymbol: tradingsymbol,
		strategy_id: 'fifty_2_wk',
		track_id: curr_track_id,
		transaction_type: null,
		ltp: null,
		signal_status: null
	};
	var get_signal_status = my_get_signal_status.bind(this)
	get_signal_status = Promise.promisify(get_signal_status)

	var save_signal = my_save_signal.bind(this)
	save_signal = Promise.promisify(save_signal)

	var switch_signal = my_switch_signal.bind(this)
	switch_signal = Promise.promisify(switch_signal)
		/*
			check for open order 
				if not found proceed 
					to calculate for open and place signal
					make signal open
				if found
					calculate for close signal
					make signal close
		*/
		// check for open order for the stock
	var query = {
		tradingsymbol: tradingsymbol,
		strategy_id: 'fifty_2_wk'
	}
	get_signal_status(query).then(function(status) {
		console.log('signal staus:', status)
		switch (status) {

			case 'openable':
				is_openable().then(function(openable) {
					if (openable)
						do_open()
					else
						do_nothing()
				})
				break;

			case 'closable':
				is_closable().then(function(closable) {
					if (closable)
						do_close()
					else
						do_nothing()
				})
				break;

			case 'pending':
				do_nothing()
				break;

			default:
				throw new Error("Forbidden branch reached")
		}
	})
	var is_openable = function(can_open) {
		console.log('in : is_openable')
		var strategy_stock = seneca.make$('strategy_stock')
		var strategy_stock_list$ = Promise.promisify(strategy_stock.list$, {
			context: strategy_stock
		})
		strategy_stock_list$({
			strategy_id: cb_msg_obj.strategy_id,
			tradingsymbol: opt.tradingsymbol
		}).then(function(strategy_stk) {
			if (!(strategy_stk.length === 1)) throw new Error("Err: Multiple entities received");
			strategy_stk = strategy_stk[0]
			seneca.act('role:data,cmd:query,list:false', {
				tradingsymbol: tradingsymbol,
				q: 't-52w'
			}, function(err, val) {
				var t_52w_low = val.data.low;
				cb_msg_obj.ltp = (data.ltp || data.close)
				if ((data.ltp || data.close) <= t_52w_low * strategy_stk.buy_price_threshold)
					can_open(null, true)
				else
					can_open(null, false)
			})
		})

	}
	var is_closable = function(can_close) {
		console.log('in : is_closable')
		var strategy_stock = seneca.make$('strategy_stock')
		var strategy_stock_list$ = Promise.promisify(strategy_stock.list$, {
			context: strategy_stock
		})
		strategy_stock_list$({
			strategy_id: cb_msg_obj.strategy_id,
			tradingsymbol: opt.tradingsymbol
		}).then(function(strategy_stk) {
			if (!strategy_stk.length == 1) throw new Error("Err: Multiple entities received");
			strategy_stk = strategy_stk[0]
			seneca.act('role:data,cmd:query,list:false', {
				tradingsymbol: tradingsymbol,
				q: 't-52w'
			}, function(err, val) {
				//var outstanding_order = true; // TODO implement this logic
				cb_msg_obj.ltp = (data.ltp || data.close)
				var prev_buy_price = 125; //@import
				if ((data.ltp || data.close) >= prev_buy_price * strategy_stk.profit_margin) // sell when stock ebbs above profit margin
					can_close(null, true)
				else
					can_close(null, false)
			})
		})
	}
	var do_open = function(opt) {
		console.log('in : do_open')
		var route = 'role:evaluator,cmd:evaluate'
		cb_msg = route
		cb_msg_obj.transaction_type = 'BUY'
		cb_msg_obj.signal_status = 'PENDING_OPEN'
		save_signal(cb_msg_obj).then(function() {
			seneca.act(route, cb_msg_obj, function(res) {
				final_cb(null, {
					success: true,
					cb_msg: cb_msg,
					cb_msg_obj: cb_msg_obj,
					curr_track_id: curr_track_id,
					prev_track_id: null
				})
			})
		})
	}
	var do_close = function(opt) {
		console.log('in : do_close')
		var route = 'role:evaluator,cmd:evaluate'
		cb_msg = route
		cb_msg_obj.transaction_type = 'SELL'
		cb_msg_obj.signal_status = 'PENDING_CLOSE'
		switch_signal(cb_msg_obj).then(function() {
			seneca.act(route, cb_msg_obj, function(res) {
				final_cb(null, {
					success: true,
					cb_msg: cb_msg,
					cb_msg_obj: cb_msg_obj,
					curr_track_id: curr_track_id,
					prev_track_id: null
				})
			})
		})
	}
	var do_nothing = function(opt, cb) {
		console.log('in : do_nothing')
		final_cb(null, {
			success: true,
			cb_msg: 'no_possible_routing',
			cb_msg_obj: cb_msg_obj,
			curr_track_id: curr_track_id,
			prev_track_id: null
		})
	}

	is_openable = Promise.promisify(is_openable)
	is_closable = Promise.promisify(is_closable)

}


module.exports.run = run