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
		await:true 
		//await:true -> to return until all operation are complete
		//otherwise web request will have to wait for long time
	}
var mock_dt_web = {
		strategy_id: 'fifty_2_wk'
		//await:true -> to return until all operation are complete
		//otherwise web request will have to wait for long time
	}
	//==================================
describe('Strategy_stock module', function() {
	before('check test server initialization', intialize)
	after('close server', close_seneca)
		//==========`=== tests ==============
	describe('#run_routine_all: run routine for a multiple stock', run_routine_all)
	describe('#run_routine: run routine for a single stock', run_routine)
	describe('web_call#run_routine_all: run routine for a multiple stock', run_routine_all_web)
	describe('web_call#run_routine: run routine for a single stock', run_routine_web)
		//describe('#retire', retire)
		//==================================
	function run_routine() {
		it('should return proper object', function(done) {
			this.timeout(5000);
			mock_dt.tradingsymbol= 'YESBANK'
			seneca.act('role:routine,cmd:run_routine', mock_dt, function(err, val) {
				if (err) done(err)
				default_api_test(err, val)
					//assert.includeDeepMembers
				expect(val.data).is.an('array')
				expect(val.data.length).to.equal(1)
				expect(val.data[0].ror).to.be.a('number')
				expect(val.data[0].returns_std).to.be.a('number')
				expect(val.data[0].returns_mean).to.be.a('number')
				expect(val.data[0].tradingsymbol).to.be.a('string')
				expect(val.data[0].strategy_id).to.match(/fifty_2_wk/)
				done()
			})
		})
	}

	function run_routine_all() {
		it('should return array of objects', function(done) {
			this.timeout(5000);
			seneca.act('role:routine,cmd:run_routine', mock_dt, function(err, val) {
				if (err) done(err)
				default_api_test(err, val)
					//assert.includeDeepMembers
				expect(val.data).is.an('array')
				expect(val.data.length).to.equal(2)
				expect(val.data[0].ror).to.be.a('number')
				expect(val.data[0].returns_std).to.be.a('number')
				expect(val.data[0].returns_mean).to.be.a('number')
				expect(val.data[0].tradingsymbol).to.be.a('string')
				expect(val.data[0].strategy_id).to.match(/fifty_2_wk/)
				expect(val.data[1].ror).to.be.a('number')
				expect(val.data[1].returns_std).to.be.a('number')
				expect(val.data[1].returns_mean).to.be.a('number')
				expect(val.data[1].tradingsymbol).to.be.a('string')
				expect(val.data[1].strategy_id).to.match(/fifty_2_wk/)
				expect(val.strategy_id).to.match(/fifty_2_wk/)
				done()
			})
		})
	}
})
	function run_routine_web() {
		it('should return proper object', function(done) {
			this.timeout(5000);
			mock_dt.tradingsymbol= 'YESBANK'
			seneca.act('role:routine,cmd:run_routine', mock_dt, function(err, val) {
				if (err) done(err)
				default_api_test(err, val)
				done()
			})
		})
	}
		function run_routine_all_web() {
		it('should return proper object', function(done) {
			this.timeout(5000);
			mock_dt.tradingsymbol= 'YESBANK'
			seneca.act('role:routine,cmd:run_routine', mock_dt, function(err, val) {
				if (err) done(err)
				default_api_test(err, val)
				done()
			})
		})
	}
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
		var entity_1 = seneca.make$('strategy', {
			strategy_id: 'fifty_2_wk',
			budget: 10000,
			spent: 2000,
			equity_ceil: 0.2
		})
		var entity_1_save$ = Promise.promisify(entity_1.save$, {
			context: entity_1
		})
		var entity_2_1 = seneca.make$('strategy_stock', {
			strategy_id: 'fifty_2_wk',
			tradingsymbol: 'YESBANK',
			status: 'ACTIVE',
			stock_ceil: 0.4,
			nrr: 0.8,
			profit_margin: 1.1,
			buy_price_threshold: 1.25,
			prev_buy_price: 990, //todo should retrieved dynamically
			prev_sell_price: 0 //todo should retrieved dynamically
		})
		var entity_2_1_save$ = Promise.promisify(entity_2_1.save$, {
			context: entity_2_1
		})
		var entity_2_2 = seneca.make$('strategy_stock', {
			strategy_id: 'fifty_2_wk',
			tradingsymbol: 'STOREONE',
			status: 'ACTIVE',
			stock_ceil: 0.4,
			nrr: 0.8,
			profit_margin: 1.1,
			buy_price_threshold: 1.25,
			prev_buy_price: 990, //todo should retrieved dynamically
			prev_sell_price: 0 //todo should retrieved dynamically
		})
		var entity_2_2_save$ = Promise.promisify(entity_2_2.save$, {
			context: entity_2_2
		})
		var entity_3_1 = seneca.make$('watchlist', {
			strategy_id: 'fifty_2_wk',
			tradingsymbol: 'YESBANK',
			status: 'ACTIVE',
			update_time: null
		})
		var entity_3_1_save$ = Promise.promisify(entity_3_1.save$, {
			context: entity_3_1
		})
		var entity_3_2 = seneca.make$('watchlist', {
			strategy_id: 'fifty_2_wk',
			tradingsymbol: 'STOREONE',
			status: 'ACTIVE',
			update_time: null
		})
		var entity_3_2_save$ = Promise.promisify(entity_3_2.save$, {
			context: entity_3_2
		})
		seneca.ready(function() {
			Promise.all([
				entity_1_save$(),
				entity_2_1_save$().then(() => {
					entity_2_2.save$()
				}),
				entity_3_1_save$().then(() => {
					entity_3_2.save$()
				})
			]).then(function(res) {
				done()
			})
		})
	})
}

function close_seneca(done) {
	//console.log('closing seneca instance')
	//quandl.get("NSE/YESBANK", authtoken="1CzVT1zp5yzCQjQNq8yR", start_date="2013-06-08")
	seneca.close(done)
}