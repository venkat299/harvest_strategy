let chai = require('chai'),
  expect = chai.expect,
  assert = chai.assert,
  should = chai.should();
const Promise = require('bluebird');
// ###### initializing test server ########
const intialize_server = require('../init_test_server.js');
const skip = require('../skip_test.json')['lib/order_log'];
let seneca;
//= ========== mock strategy_config ============
const mock_dt = {
  strategy_id: 'fifty_2_wk',
};
//= =================================
describe('order_log:', function () {
  if (!skip) {
    before('check test server initialization', intialize);
    // after('close server', close_seneca)
  } else before('skiping tests', function () {
    this.skip();
  });
  //= =========`=== tests ==============
  describe('#delete_order ', delete_order);
  //= =================================
  function delete_order() {
    it('deletes a order_log when status is not "COMPLETE"', function (done) {
      const dt = mock_dt;
      dt.tradingsymbol = 'YESBANK';
      seneca.act('role:order_log,cmd:delete_hard', dt, function (err, val) {
        if (err) done(err);
        // strategy_config
        expect(val.success).to.be.true;
        seneca.make$('order_log').list$(dt, function (err, val) {
          if (err) done(err);
          expect(val.length).to.equal(0);
          done();
        });
      });
    });
    /*
     * commenting out this test because seneca doesn't throw error properly
     *  see https://github.com/senecajs/seneca/issues/35
     */
    // it('should throw an error when attempting to delete order_log', function(done) {
    //     var dt = mock_dt
    //     dt.tradingsymbol = 'GMBREW'
    //     var err$ = new Error("ERR:ILLEGAL_ENTITY_STATE");
    //     expect(function() {
    //         seneca.act('role:order_log,cmd:delete_hard', dt, function(err, val) {
    //          console.log('ERROR----> ',err)
    //             if (err) throw val
    //         })
    //     }).to.throw();
    //     // .to.throw(err$);
    //    // .to.throw(Error);
    //     done()
    // })
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
    // seneca.ready(function() {
    const entity_4 = seneca.make$('order_log', {
      'strategy_id': 'fifty_2_wk',
      'tradingsymbol': 'GMBREW',
      'status': 'COMPLETE',
      'order_obj': {
        'strategy_id': 'fifty_2_wk',
        'prev_track_id': '1467599484361/strategy/GMBREW',
        'track_id': '1467599489718/evaluator/GMBREW',
        'tradingsymbol': 'GMBREW',
        'exchange': 'NSE',
        'transaction_type': 'BUY',
        'order_type': 'MARKET',
        'quantity': 8,
        'product': 'CNC',
        'validity': 'DAY',
        'ltp': 673.8,
      },
      'status_log': [
        ['INIT', 1467599489718],
        ['PLACED', 1467599489748],
        ['COMPLETE', 1467599490787],
      ],
    }).save$(function () {
      const entity_5 = seneca.make$('order_log', {
        'strategy_id': 'fifty_2_wk',
        'tradingsymbol': 'YESBANK',
        'status': 'PLACED',
        'order_obj': {
          'strategy_id': 'fifty_2_wk',
          'prev_track_id': '1467599484361/strategy/GMBREW',
          'track_id': '1467599489718/evaluator/GMBREW',
          'tradingsymbol': 'GMBREW',
          'exchange': 'NSE',
          'transaction_type': 'BUY',
          'order_type': 'MARKET',
          'quantity': 8,
          'product': 'CNC',
          'validity': 'DAY',
          'ltp': 673.8,
        },
        'status_log': [
          ['INIT', 1467599489718],
          ['PLACED', 1467599489748],
          ['COMPLETE', 1467599490787],
        ],
      }).save$(function () {
        console.log('>>>> before all hook cleared');
        done(); // <======== finally done is called here
      });
    });
    // })
  });
}

function close_seneca(done) {
  seneca.close(done);
}