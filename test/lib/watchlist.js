let chai = require('chai'),
  expect = chai.expect,
  assert = chai.assert,
  should = chai.should();
const Promise = require('bluebird');
// ###### initializing test server ########
const intialize_server = require('../init_test_server.js');
const skip = require('../skip_test.json')['lib/watchlist'];
let seneca;
//= ========== mock data ============
const mock_dt = {
  strategy_id: 'fifty_2_wk',
  tradingsymbol: 'YESBANK',
};
//= =================================
describe('Watchlist module', function () {
  if (!skip) {
    before('check test server initialization', intialize);
    // after('close server', close_seneca)
  } else before('skiping tests', function () {
    this.skip();
  });
  //= ============ tests ==============
  describe('#add', add);
  describe('#retire', retire);
  describe('#change_status', change_status);
  describe('#all: check entry is present in watchlist & strategy_stock collection', all);
  describe('#activate', activate);
  describe('#remove', remove);
  //= =================================
  function add() {
    it('should return entity after adding entry in database', function (done) {
      seneca.act('role:watchlist,cmd:add', mock_dt, function (err, val) {
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
      seneca.act('role:watchlist,cmd:retire', mock_dt, function (err, val) {
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
      seneca.act('role:watchlist,cmd:change_status', dt, function (err, val) {
        if (err) done(err);
        default_api_test(err, val);
        expect(val.entity).to.include(mock_dt);
        expect(val.entity.status).to.match(/ACTIVE/);
        done();
      });
    });
  }

  function activate() {
    it('should update entity status to active', function (done) {
      const dt = mock_dt;
      dt.status = 'ACTIVE';
      seneca.act('role:watchlist,cmd:change_status', dt, function (err, val) {
        if (err) done(err);
        default_api_test(err, val);
        expect(val.entity).to.include(mock_dt);
        expect(val.entity.status).to.match(/ACTIVE/);
        done();
      });
    });
  }

  function all() {
    it('should return an array of length 1', function (done) {
      seneca.act('role:watchlist,cmd:all', {
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
    it('should return an array of strategy_stock of length 1', function (done) {
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

  function remove() {
    it('should delete the entity', function (done) {
      seneca.act('role:watchlist,cmd:remove', mock_dt, function (err, val) {
        if (err) done(err);
        default_api_test(err, val);
        // assert.includeDeepMembers
        const watchlist = seneca.make$('watchlist');
        watchlist.list$(mock_dt, function (err, val) {
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