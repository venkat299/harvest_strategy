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
	//==================================

describe('Strategy:fifty_2_wk', function() {

	before('check test server initialization', intialize)

	describe('#add', function() {
		it('method should exist', function(done) {
			expect(seneca.has('role:watchlist,cmd:add')).to.be.true
			done()
		})

		it('should return entity after adding entry in database', function(done) {
			seneca.act('role:watchlist,cmd:add', mock_dt, function(err, val) {
				default_api_test(err, val)
					//assert.includeDeepMembers
				expect(val.entity).to.include(mock_dt)
				done()


			})
		})

	})
	describe('#retire', function() {
		it('method should exist', function(done) {
			expect(seneca.has('role:watchlist,cmd:retire')).to.be.true
			done()
		})

		it('should update entity status to inactive', function(done) {
			seneca.act('role:watchlist,cmd:retire', mock_dt, function(err, val) {
				default_api_test(err, val)
				expect(val.entity).to.include(mock_dt)
				expect(val.entity.status).to.match(/INACTIVE/)
				done()


			})
		})

	})

	describe('#remove', function() {
		it('method should exist', function(done) {
			expect(seneca.has('role:watchlist,cmd:remove')).to.be.true
			done()
		})

		it('should delete the entity', function(done) {
			seneca.act('role:watchlist,cmd:remove', mock_dt, function(err, val) {
				default_api_test(err, val)
					//assert.includeDeepMembers
				var watchlist = seneca.make$('watchlist')
				watchlist.list$(mock_dt, function(err, val) {
					expect(val).to.be.empty
					done()
				})



			})
		})

	})

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