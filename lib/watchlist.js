var Promise = require('bluebird')

var all = function(opt, callback) {
	var seneca = this

	var watchlist = seneca.make$('watchlist')
	var watchlist_list$ = Promise.promisify(watchlist.list$, {
		context: watchlist
	})

	watchlist_list$({
		strategy_id: opt.strategy_id
	}).then(function(list) {

			//if(list) throw err;
			console.log('list-->',list)
			callback(null, {success:true,data:list})
		

	})
}


var add = function(opt, callback) {
	var seneca = this

	var watchlist = seneca.make$('watchlist')
	var watchlist_list$ = Promise.promisify(watchlist.list$, {
		context: watchlist
	})

	watchlist_list$({
		strategy_id: opt.strategy_id,
		tradingsymbol: opt.tradingsymbol
	}).then(function(list) {
		if ((list.length === 1))
			callback(null, {success:true,entity:list[0]})
		else if (!(list.length === 0))
			throw new Error("ERR:COLLECTION_COUNT_MISMATCH")

		var entity = seneca.make$('watchlist', {
			strategy_id: opt.strategy_id,
			tradingsymbol: opt.tradingsymbol,
			status:'ACTIVE',
			routine_run_dt:null
		})

		entity.save$(function(err,val) {
			if(err) throw err;
			callback(null, {success:true,entity:val})
		})

	})
}

var retire = function(opt, callback) {
	var seneca = this

	var watchlist = seneca.make$('watchlist')
	var watchlist_list$ = Promise.promisify(watchlist.list$, {
		context: watchlist
	})

	watchlist_list$({
		strategy_id: opt.strategy_id,
		tradingsymbol: opt.tradingsymbol
	}).then(function(list) {
		if (!(list.length === 1))
			throw new Error("ERR:COLLECTION_COUNT_MISMATCH")

		var item = list[0];
		item.status = 'INACTIVE'

		item.save$(function(err,val){
			if(err) throw err;
			callback(null, {success:true,entity:val})
		})

	})
}


var remove = function(opt, callback) {
	var seneca = this

	var watchlist = seneca.make$('watchlist')
	var watchlist_list$ = Promise.promisify(watchlist.list$, {
		context: watchlist
	})

	watchlist_list$({
		strategy_id: opt.strategy_id,
		tradingsymbol: opt.tradingsymbol
	}).then(function(list) {
		if (!(list.length === 1))
			throw new Error("ERR:COLLECTION_COUNT_MISMATCH")

		list[0].delete$(function(err,val){
			if(err) throw err;
			callback(null, {success:true})
		})

	})
}


module.exports.all = all
module.exports.add = add
module.exports.retire = retire
module.exports.remove = remove
