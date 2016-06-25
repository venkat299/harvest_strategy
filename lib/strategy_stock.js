var Promise = require('bluebird')
var all = function(opt, callback) {
	var seneca = this
	var strategy_stock = seneca.make$('strategy_stock')
	var strategy_stock_list$ = Promise.promisify(strategy_stock.list$, {
		context: strategy_stock
	})
	strategy_stock_list$({
		strategy_id: opt.strategy_id,
		status:'ACTIVE'
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
var add = function(opt, callback) {
	var seneca = this
	var strategy_stock = seneca.make$('strategy_stock')
	var strategy_stock_list$ = Promise.promisify(strategy_stock.list$, {
		context: strategy_stock
	})
	strategy_stock_list$({
		strategy_id: opt.strategy_id,
		tradingsymbol: opt.tradingsymbol
	}).then(function(list) {
		if ((list.length === 1)) callback(null, {
			success: true,
			entity: list[0]
		})
		else if (!(list.length === 0)) throw new Error("ERR:COLLECTION_COUNT_MISMATCH")
		var entity = seneca.make$('strategy_stock', {
			strategy_id: opt.strategy_id,
			tradingsymbol: opt.tradingsymbol,
			status: 'INACTIVE',
			"stock_ceil": null,
			"nrr": null,
			"profit_margin": null,
			"buy_price_threshold": null,
			"prev_buy_price": null,
			"prev_sell_price": null
		})
		entity.save$(function(err, val) {
			if (err) throw err;
			callback(null, {
				success: true,
				entity: val
			})
		})
	})
}
var retire = function(opt, callback) {
	var seneca = this
	opt.status = 'INACTIVE'
	seneca.act('role:strategy_stock,cmd:change_status', opt, callback)
}
var change_status = function(opt, callback) {
	var seneca = this
	var strategy_stock = seneca.make$('strategy_stock')
	var strategy_stock_list$ = Promise.promisify(strategy_stock.list$, {
		context: strategy_stock
	})
	strategy_stock_list$({
		strategy_id: opt.strategy_id,
		tradingsymbol: opt.tradingsymbol
	}).then(function(list) {
		if (!(list.length === 1)) throw new Error("ERR:COLLECTION_COUNT_MISMATCH")
		var item = list[0];
		item.status = opt.status
		item.save$(function(err, val) {
			if (err) throw err;
			callback(null, {
				success: true,
				entity: val
			})
		})
	})
}
var update = function(opt, callback) {
	var seneca = this
	var strategy_stock = seneca.make$('strategy_stock')
	var strategy_stock_list$ = Promise.promisify(strategy_stock.list$, {
			context: strategy_stock
		})
		//console.log(opt)
	strategy_stock_list$({
		strategy_id: opt.strategy_id,
		tradingsymbol: opt.tradingsymbol
	}).then(function(list) {
		if (!(list.length === 1)) throw new Error("ERR:COLLECTION_COUNT_MISMATCH")
		var item = list[0];
		if (opt.status) item.status = opt.status;
		if (opt.stock_ceil) item.stock_ceil = opt.stock_ceil;
		if (opt.nrr) item.nrr = opt.nrr;
		if (opt.profit_margin) item.profit_margin = opt.profit_margin;
		if (opt.buy_price_threshold) item.buy_price_threshold = opt.buy_price_threshold;
		if (opt.prev_buy_price) item.prev_buy_price = opt.prev_buy_price;
		if (opt.prev_sell_price) item.prev_sell_price = opt.prev_sell_price;
		item.save$(function(err, val) {
			if (err) throw err;
			callback(null, {
				success: true,
				entity: val
			})
		})
	})
}
var remove = function(opt, callback) {
	var seneca = this
	var strategy_stock = seneca.make$('strategy_stock')
	var strategy_stock_list$ = Promise.promisify(strategy_stock.list$, {
		context: strategy_stock
	})
	strategy_stock_list$({
		strategy_id: opt.strategy_id,
		tradingsymbol: opt.tradingsymbol
	}).then(function(list) {
		if (!(list.length === 1)) throw new Error("ERR:COLLECTION_COUNT_MISMATCH")
		list[0].delete$(function(err, val) {
			if (err) throw err;
			callback(null, {
				success: true
			})
		})
	})
}

module.exports.all = all
module.exports.add = add
module.exports.retire = retire
module.exports.remove = remove
module.exports.change_status = change_status
module.exports.update = update