var chai = require('chai'),
	expect = chai.expect,
	assert = chai.assert,
	should = chai.should();

var seneca = require('seneca')();
seneca.client();
//seneca.use('../index.js')

//=========== mock data ============
var mock_dt = {
	"status": "success",
	"data": {
		"candles": [
			["2015-12-28T09:15:00+0530", 100, 100, 100, 100, 1000]
		]
	}
}

var columns = ['timestamp', 'open', 'high', 'low', 'close', 'volume'];

var data = mock_dt.data.candles[0].reduce(function(result, field, index) {
	result[columns[index]] = field;
	return result;
}, {});
//==================================

describe('Strategy:fifty_2_wk', function() {
	describe('#run -> default test', function() {
		it('should return an obj {success:true,msg:string}', function(done) {
			seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
				symbol: 'YESBANK',
				data: data
			}, function(err, val) {
				default_api_test(err, val, done)
			})
		});
	});
	describe('#run -> buy scenario', function() {
		it('should return msg with "BUY" call', function(done) {
			data.close = 125;
			seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
				symbol: 'YESBANK',
				data: data
			}, function(err, val) {
				expect(val.cb_msg).to.match(/role:evaluator,cmd:buy/);
				expect(val.cb_msg_obj).to.be.an('object');
				default_api_test(err, val, done)
			})
		});
	});
	describe('#run -> buy scenario; check if msg info is proper', function() {
		it('should return msg with "BUY" call with proper object', function(done) {
			data.close = 125;
			seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
				symbol: 'YESBANK',
				data: data
			}, function(err, val) {
				expect(val.cb_msg_obj.symbol).to.be.a('string');
				expect(val.cb_msg_obj.strategy_id).to.be.a('string');
				expect(val.cb_msg_obj.track_id).to.be.a('string');
				default_api_test(err, val, done)
			})
		});
	});
	describe('#run -> sell scenario', function() {
		it('should return msg with "SELL" call', function(done) {
			data.close = 140;
			seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
				symbol: 'YESBANK',
				data: data
			}, function(err, val) {
				expect(val.cb_msg).to.match(/role:evaluator,cmd:sell/);
				expect(val.cb_msg_obj).to.be.an('object');
				default_api_test(err, val, done)
			})
		});
	});
	describe('#run -> sell scenario; check if msg info is proper', function() {
		it('should return msg with "SELL" call with proper object', function(done) {
			data.close = 140;
			seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
				symbol: 'YESBANK',
				data: data
			}, function(err, val) {
				expect(val.cb_msg_obj.symbol).to.be.a('string');
				expect(val.cb_msg_obj.strategy_id).to.be.a('string');
				expect(val.cb_msg_obj.track_id).to.be.a('string');
				default_api_test(err, val, done)
			})
		});
	});
	describe('#run -> no call scenario', function() {
		it('should return msg with "Ignore/No" call', function(done) {
			data.close = 130;
			seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
				symbol: 'YESBANK',
				data: data
			}, function(err, val) {
				expect(val.cb_msg).to.match(/role:null,cmd:null/);
				expect(val.cb_msg_obj).to.be.null;
				default_api_test(err, val, done)
			})
		});
	});
});

var default_api_test = function(err, val, cb) {
	should.not.exist(err);
	should.exist(val);
	expect(val).to.be.an('object');
	expect(val.success).to.be.true;
	expect(val.cb_msg).to.exist;
	//expect(val.cb_msg_obj).to.exist;
	expect(val.curr_track_id).to.exist;
	expect(val.prev_track_id).to.have.property;
	cb();
}