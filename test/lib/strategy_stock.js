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
	strategy_id: 'fifty_2_wk',
	tradingsymbol: 'YESBANK'
}
var mock_update_dt = {
		strategy_id: 'fifty_2_wk',
		tradingsymbol: 'YESBANK',
		"stock_ceil": 0.4,
		"nrr": 0.9,
		"profit_margin": 0.4,
		"buy_price_threshold": 1.1,
		"prev_buy_price": 90,
		"prev_sell_price": 89
	}
	//==================================
describe('Strategy_stock module', function() {
	before('check test server initialization', intialize)
	after('close server', close_seneca)
		//============= tests ==============
	describe('#add', add)
	describe('#retire', retire)
	describe('#all only with status active', all_zero)
	describe('#change_status', change_status)
	describe('#all only with status active', all)
	describe('#update', update)
	describe('#remove', remove)
		//==================================
	function add() {
		it('should return entity after adding entry in database', function(done) {
			seneca.act('role:strategy_stock,cmd:add', mock_dt, function(err, val) {
				if (err) done(err)
				default_api_test(err, val)
					//assert.includeDeepMembers
				expect(val.entity).to.include(mock_dt)
				done()
			})
		})
	}

	function retire() {
		it('should update entity status to inactive', function(done) {
			seneca.act('role:strategy_stock,cmd:retire', mock_dt, function(err, val) {
				if (err) done(err)
				default_api_test(err, val)
				expect(val.entity).to.include(mock_dt)
				expect(val.entity.status).to.match(/INACTIVE/)
				done()
			})
		})
	}

	function change_status() {
		it('should update entity status to active', function(done) {
			var dt = mock_dt
			dt.status = 'ACTIVE'
			seneca.act('role:strategy_stock,cmd:change_status', dt, function(err, val) {
				if (err) done(err)
				default_api_test(err, val)
				expect(val.entity).to.include(mock_dt)
				expect(val.entity.status).to.match(/ACTIVE/)
				done()
			})
		})
	}

	function all_zero() {
		it('should return an array of length 0', function(done) {
			seneca.act('role:strategy_stock,cmd:all', {
				strategy_id: 'fifty_2_wk'
			}, function(err, val) {
				if (err) done(err)
				default_api_test(err, val)
					//assert.includeDeepMembers
				expect(val.data).is.an('array')
				expect(val.data.length).to.equal(0)
				done()
			})
		})
	}

	function all() {
		it('should return an array of length 1', function(done) {
			seneca.act('role:strategy_stock,cmd:all', {
				strategy_id: 'fifty_2_wk'
			}, function(err, val) {
				if (err) done(err)
				default_api_test(err, val)
					//assert.includeDeepMembers
				expect(val.data).is.an('array')
				expect(val.data.length).to.equal(1)
				done()
			})
		})
	}

	function update() {
		it('should update entity in the database properly', function(done) {
			seneca.act('role:strategy_stock,cmd:update', mock_update_dt, function(err, val) {
				if (err) done(err)
				default_api_test(err, val)
				expect(val.entity).to.include(mock_dt)
				expect(val.entity.stock_ceil).to.be.closeTo(mock_update_dt.stock_ceil, 0.01);
				expect(val.entity.nrr).to.be.closeTo(mock_update_dt.nrr, 0.01);
				expect(val.entity.profit_margin).to.be.closeTo(mock_update_dt.profit_margin, 0.01);
				expect(val.entity.buy_price_threshold).to.be.closeTo(mock_update_dt.buy_price_threshold, 0.01);
				expect(val.entity.prev_buy_price).to.be.closeTo(mock_update_dt.prev_buy_price, 0.01);
				expect(val.entity.prev_sell_price).to.be.closeTo(mock_update_dt.prev_sell_price, 0.01);
				done()
			})
		})
	}

	function remove() {
		it('should delete the entity', function(done) {
			seneca.act('role:strategy_stock,cmd:remove', mock_dt, function(err, val) {
				if (err) done(err)
				default_api_test(err, val)
					//assert.includeDeepMembers
				var strategy_stock = seneca.make$('strategy_stock')
				strategy_stock.list$(mock_dt, function(err, val) {
					expect(val).to.be.empty
					done()
				})
			})
		})
	}
})
var default_api_test = function(err, val) {
	should.not.exist(err)
	should.exist(val)
	expect(val).to.be.an('object')
	expect(val.success).to.be.true
}

function intialize(done) {
	intialize_server.start().then(function(my_seneca) {
		//console.log(my_seneca)
		seneca = my_seneca
		seneca.client({
			host: 'localhost',
			port: '8080'
		});
		seneca.ready(function() {
			done()
		})
	})
}

function close_seneca(done) {
	//console.log('closing seneca instance')
	//quandl.get("NSE/YESBANK", authtoken="1CzVT1zp5yzCQjQNq8yR", start_date="2013-06-08")
	seneca.close(done)
}