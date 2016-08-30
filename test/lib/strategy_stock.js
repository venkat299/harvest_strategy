let chai = require('chai'),
  expect = chai.expect,
  assert = chai.assert,
  should = chai.should();
const Promise = require('bluebird');
// ###### initializing test server ########
const intialize_server = require('../init_test_server.js');
const skip = require('../skip_test.json')['lib/strategy_stock'];
let seneca;
//= ========== mock data ============
const mock_dt = {
  strategy_id: 'fifty_2_wk',
  tradingsymbol: 'YESBANK',
};
const mock_update_dt = {
  strategy_id: 'fifty_2_wk',
  tradingsymbol: 'YESBANK',
  'stock_ceil': 0.4,
  'nrr': 0.9,
  'profit_margin': 0.4,
  'buy_price_threshold': 1.1,
  'prev_buy_price': 90,
  'prev_sell_price': 89,
};
//= =================================
describe('Strategy_stock module', function () {
  if (!skip) {
    before('check test server initialization', intialize);
    //  after('close server', close_seneca)
  } else before('skiping tests', function () {
    this.skip();
  }); //= ============ tests ==============
  describe('#add', add);
  describe('#retire', retire);
  describe('#all only with status active', all_zero);
  describe('#change_status', change_status);
  describe('#all only with status active', all);
  describe('#update', update);
  describe('#reset_strategy', reset_strategy);
  describe('#remove', remove);

  //= =================================
  function add() {
    it('should return entity after adding entry in database', function (done) {
      seneca.act('role:strategy_stock,cmd:add', mock_dt, function (err, val) {
        if (err) done(err);
        default_api_test(err, val);
        // assert.includeDeepMembers
        expect(val.entity).to.include(mock_dt);
        done();
      });
    });
  }

  function retire() {
    it('should update entity status to inactive', function (done) {
      seneca.act('role:strategy_stock,cmd:retire', mock_dt, function (err, val) {
        if (err) done(err);
        default_api_test(err, val);
        expect(val.entity).to.include(mock_dt);
        expect(val.entity.status).to.match(/INACTIVE/);
        done();
      });
    });
  }

  function change_status() {
    it('should update entity status to active', function (done) {
      const dt = mock_dt;
      dt.status = 'ACTIVE';
      seneca.act('role:strategy_stock,cmd:change_status', dt, function (err, val) {
        if (err) done(err);
        default_api_test(err, val);
        expect(val.entity).to.include(mock_dt);
        expect(val.entity.status).to.match(/ACTIVE/);
        done();
      });
    });
  }

  function all_zero() {
    it('should return an array of length 0', function (done) {
      seneca.act('role:strategy_stock,cmd:all', {
        strategy_id: 'fifty_2_wk',
      }, function (err, val) {
        if (err) done(err);
        default_api_test(err, val);
        // assert.includeDeepMembers
        expect(val.data).is.an('array');
        expect(val.data.length).to.equal(0);
        done();
      });
    });
  }

  function all() {
    it('should return an array of length 1', function (done) {
      seneca.act('role:strategy_stock,cmd:all', {
        strategy_id: 'fifty_2_wk',
      }, function (err, val) {
        if (err) done(err);
        default_api_test(err, val);
        // assert.includeDeepMembers
        expect(val.data).is.an('array');
        expect(val.data.length).to.equal(1);
        done();
      });
    });
  }

  function update() {
    it('should update entity in the database properly', function (done) {
      seneca.act('role:strategy_stock,cmd:update', mock_update_dt, function (err, val) {
        if (err) done(err);
        default_api_test(err, val);
        expect(val.entity).to.include(mock_dt);
        expect(val.entity.stock_ceil).to.be.closeTo(mock_update_dt.stock_ceil, 0.01);
        expect(val.entity.nrr).to.be.closeTo(mock_update_dt.nrr, 0.01);
        expect(val.entity.profit_margin).to.be.closeTo(mock_update_dt.profit_margin, 0.01);
        expect(val.entity.buy_price_threshold).to.be.closeTo(mock_update_dt.buy_price_threshold, 0.01);
        expect(val.entity.prev_buy_price).to.be.closeTo(mock_update_dt.prev_buy_price, 0.01);
        expect(val.entity.prev_sell_price).to.be.closeTo(mock_update_dt.prev_sell_price, 0.01);
        done();
      });
    });
  }

  function reset_strategy() {
    it('should delete the order log, signal log associated with the strategy', function (done) {
      seneca.act('role:strategy_stock,cmd:reset_strategy', mock_dt, function (err, val) {
        if (err) done(err);
        default_api_test(err, val);
        done();
      });
    });
  }

  function remove() {
    it('should delete the entity', function (done) {
      seneca.act('role:strategy_stock,cmd:remove', mock_dt, function (err, val) {
        if (err) done(err);
        default_api_test(err, val);
        // assert.includeDeepMembers
        const strategy_stock = seneca.make$('strategy_stock');
        strategy_stock.list$(mock_dt, function (err, val) {
          expect(val).to.be.empty;
          done();
        });
      });
    });
  }
});
const default_api_test = function (err, val) {
  should.not.exist(err);
  should.exist(val);
  expect(val).to.be.an('object');
  expect(val.success).to.be.true;
};

function intialize(done) {
  intialize_server.get_server(function (options) {
    // console.log(options.seneca)
    seneca = options.seneca;
    seneca.client({
      host: 'localhost',
      port: options.port,
    });
    // seneca.ready(function() {
    console.log('>>>> before all hook cleared');
    done();
    // })
  });
}

function close_seneca(done) {
  // console.log('closing seneca instance')
  // quandl.get("NSE/YESBANK", authtoken="1CzVT1zp5yzCQjQNq8yR", start_date="2013-06-08")
  seneca.close(done);
}