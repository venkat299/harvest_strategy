var chai = require('chai'),
	expect = chai.expect,
	assert = chai.assert,
	should = chai.should();
var Promise = require('bluebird')

// ###### initializing test server ########
var intialize_server = require('../init_test_server.js')

var seneca;

//=========== mock data ============
var mock_dt = {
	"status": "success",
	"data": {
		"candles": [
			["2015-12-28T09:15:00+0530", 100, 100, 100, 100, 1000]
		]
	}
}

var columns = ['timestamp', 'open', 'high', 'low', 'close', 'volume']

var data = mock_dt.data.candles[0].reduce(function(result, field, index) {
		result[columns[index]] = field
		return result
	}, {})
	//==================================

describe('Strategy:fifty_2_wk', function() {

	before('check test server initialization', intialize)

	describe('#run -> signalling first buy call', function() {
		it('should return an obj {success:true,msg:string}\n && buy scenario check if msg info is proper', function(done) {
			seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
				tradingsymbol: 'YESBANK',
				data: data
			}, function(err, val) {
				expect(val.cb_msg).to.match(/role:evaluator,cmd:evaluate/)
				expect(val.cb_msg_obj).to.be.an('object')
				expect(val.cb_msg_obj.transaction_type).to.match(/BUY/)
				expect(val.cb_msg_obj.tradingsymbol).to.be.a('string')
				expect(val.cb_msg_obj.strategy_id).to.be.a('string')
				expect(val.cb_msg_obj.track_id).to.be.a('string')
				expect(val.cb_msg_obj.ltp).to.be.a('number')
				default_api_test(err, val)
				done()
			})
		})
	})
	describe('#run -> signalling second buy call', function() {
		it('should return msg with "BUY" call already signalled', function(done) {
			data.close = 125
			seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
				tradingsymbol: 'YESBANK',
				data: data
			}, function(err, val) {
				expect(val.cb_msg).to.match(/role:evaluator,cmd:evaluate:order_already_signaled/)
				expect(val.cb_msg_obj).to.be.an('object')
				expect(val.cb_msg_obj.transaction_type).to.match(/BUY/)
				expect(val.cb_msg_obj.tradingsymbol).to.be.a('string')
				expect(val.cb_msg_obj.strategy_id).to.be.a('string')
				expect(val.cb_msg_obj.track_id).to.be.a('string')
				expect(val.cb_msg_obj.ltp).to.be.a('number')
				default_api_test(err, val)
				done()
			})
		})
	})
	describe('#run -> sell scenario check if msg info is proper', function() {
		it('should return msg with "SELL" call with proper object', function(done) {
			data.close = 140
			seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
				tradingsymbol: 'YESBANK',
				data: data
			}, function(err, val) {
				expect(val.cb_msg).to.match(/role:evaluator,cmd:evaluate,transaction_type:SELL/)
				expect(val.cb_msg_obj).to.be.an('object')
				expect(val.cb_msg_obj.tradingsymbol).to.be.a('string')
				expect(val.cb_msg_obj.strategy_id).to.be.a('string')
				expect(val.cb_msg_obj.track_id).to.be.a('string')
				default_api_test(err, val)
				done()
			})
		})
	})
	describe('#run -> no call scenario', function() {
		it('should return msg with "Ignore/No" call', function(done) {
			data.close = 130
			seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
				tradingsymbol: 'YESBANK',
				data: data
			}, function(err, val) {
				expect(val.cb_msg).to.match(/role:null,cmd:null/)
				expect(val.cb_msg_obj).to.be.null
				default_api_test(err, val)
				done()
			})
		})
	})
})

var default_api_test = function(err, val, cb) {
	should.not.exist(err)
	should.exist(val)
	expect(val).to.be.an('object')
	expect(val.success).to.be.true
	expect(val.cb_msg).to.exist
	expect(val.curr_track_id).to.exist
	expect(val.prev_track_id).to.have.property
}

function intialize(done) {

	intialize_server.start().then(function(my_seneca) {
		//console.log(my_seneca)
		seneca = my_seneca
		seneca.client();

		var entity_1 = seneca.make$('strategy', {
			strategy_id: 'fifty_2_wk',
			budget: 10000,
			spent: 2000,
			equity_ceil: 0.2
		})
		var entity_1_save$ = Promise.promisify(entity_1.save$, {
			context: entity_1
		})
		var entity_2 = seneca.make$('strategy_stock', {
			strategy_id: 'fifty_2_wk',
			tradingsymbol: 'YESBANK',
			stock_ceil: 0.4,
			nrr: 0.8
		})
		var entity_2_save$ = Promise.promisify(entity_2.save$, {
			context: entity_2
		})


		seneca.ready(function() {
			Promise.all([
				entity_1_save$(),
				entity_2_save$()
			]).then(function(res) {
				done()
			})

		})
	})



}