let chai = require('chai'),
  expect = chai.expect,
  assert = chai.assert,
  should = chai.should();
const Promise = require('bluebird');
// ###### initializing test server ########
const intialize_server = require('../init_test_server.js');
const skip = require('../skip_test.json')['lib/signal_log'];
let seneca;
//= ========== mock strategy_config ============
const mock_dt = {
  strategy_id: 'fifty_2_wk',
};
//= =================================
describe('signal_log:', function () {
  if (!skip) {
    before('check test server initialization', intialize);
    // after('close server', close_seneca)
  } else before('skiping tests', function () {
    this.skip();
  });
  //= =========`=== tests ==============
  describe('#clear_expired_signals:', clear_expired_signals);
  describe('#revert_signal : close-pending', revert_signal_1);
  describe('#revert_signal : open-pending', revert_signal_2);
  describe('#delete_signal ', delete_signal);
  // describe('#retire', retire)
  //= =================================
  function clear_expired_signals() {
    it('should delete all pending signals', function (done) {
      // this.timeout(10000);
      seneca.act('role:signal_log,cmd:delete_expired', {}, function (err, val) {
        if (err) done(err);
        // strategy_config
        expect(val.success).to.be.true;
        // setTimeout(function(seneca, expect, done) {
        seneca.make$('signal_log').list$({}, function (err, val) {
          if (err) done(err);
          expect(val.length).to.equal(3);
          done();
        });
        // }, 1000, seneca, expect, done)
      });
    });
  }

  function revert_signal_1() {
    it('revert a signal to its previous state', function (done) {
      const dt = mock_dt;
      dt.tradingsymbol = 'KUNGFOO';
      seneca.act('role:signal_log,cmd:revert_signal', dt, function (err, val) {
        if (err) done(err);
        // strategy_config
        expect(val.success).to.be.true;
        seneca.make$('signal_log').list$(dt, function (err, val) {
          if (err) done(err);
          expect(val[0].signal_status).to.match(/PENDING_CLOSE/);
          done();
        });
      });
    });
  }

  function revert_signal_2() {
    it('revert a signal to its previous state', function (done) {
      const dt = mock_dt;
      dt.tradingsymbol = 'YESBANK';
      seneca.act('role:signal_log,cmd:revert_signal', dt, function (err, val) {
        if (err) done(err);
        // strategy_config
        expect(val.success).to.be.true;
        seneca.make$('signal_log').list$(dt, function (err, val) {
          if (err) done(err);
          expect(val[0].signal_status).to.match(/PENDING_OPEN/);
          done();
        });
      });
    });
  }

  function delete_signal() {
    it('deletes a signal', function (done) {
      const dt = mock_dt;
      dt.tradingsymbol = 'YESBANK';
      seneca.act('role:signal_log,cmd:delete_hard', dt, function (err, val) {
        if (err) done(err);
        // strategy_config
        expect(val.success).to.be.true;
        seneca.make$('signal_log').list$(dt, function (err, val) {
          if (err) done(err);
          expect(val.length).to.equal(0);
          done();
        });
      });
    });
  }
});

function intialize(done) {
  intialize_server.get_server(function (options) {
    // console.log(options.seneca)
    seneca = options.seneca;
    seneca.client({
      host: 'localhost',
      port: options.port,
    });
    seneca.ready(function () {
      const entity_1 = seneca.make$('signal_log', {
        'transaction_type': 'BUY',
        'tradingsymbol': 'GMBREW',
        'strategy_id': 'fifty_2_wk',
        'signal_status': 'PENDING_OPEN',
      }).save$(function () {
        const entity_2 = seneca.make$('signal_log', {
          'transaction_type': 'BUY',
          'tradingsymbol': 'YESBANK',
          'strategy_id': 'fifty_2_wk',
          'signal_status': 'OPEN',
        }).save$(function () {
          const entity_3 = seneca.make$('signal_log', {
            'transaction_type': 'BUY',
            'tradingsymbol': 'ZEE',
            'strategy_id': 'fifty_2_wk',
            'signal_status': 'PENDING_CLOSE',
          }).save$(function () {
            const entity_4 = seneca.make$('signal_log', {
              'transaction_type': 'BUY',
              'tradingsymbol': 'KUNGFOO',
              'strategy_id': 'fifty_2_wk',
              'signal_status': 'CLOSE',
            }).save$(function () {
              console.log('>>>> before all hook cleared');
              done(); // <======== finally done is called here
            });
          });
        });
      });
    });
  });
}

function close_seneca(done) {
  // console.log('closing seneca instance')
  // quandl.get("NSE/YESBANK", authtoken="1CzVT1zp5yzCQjQNq8yR", start_date="2013-06-08")
  seneca.close(done);
}