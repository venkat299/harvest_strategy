var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();
var Promise = require('bluebird')
    // ###### initializing test server ########
var intialize_server = require('../init_test_server.js')
var skip = require('../skip_test.json')['lib/signal_log']
var seneca;
//=========== mock strategy_config ============
var mock_dt = {
        strategy_id: 'fifty_2_wk'
    }
    //==================================
describe('Clear expired signal', function() {
    if (!skip) {
        before('check test server initialization', intialize)
        after('close server', close_seneca)
    } else before('skiping tests', function() {
            this.skip()
        })
        //==========`=== tests ==============
    describe('#clear_expired_signals: delete all pending signals', clear_expired_signals)
    //describe('#retire', retire)
    //==================================
    function clear_expired_signals() {
        it('should return proper object', function(done) {
            this.timeout(10000);
            seneca.act('role:signal_log,cmd:delete_expired', {}, function(err, val) {
                if (err) done(err)
                    //strategy_config
                expect(val.success).to.be.true
                setTimeout(function(seneca, expect, done) {
                    seneca.make$('signal_log').list$({}, function(err, val) {
                        if (err) done(err)
                        expect(val.length).to.equal(3)
                        done()
                    })
                }, 1000, seneca, expect, done)
            })
        })
    }
})

function intialize(done) {
    intialize_server.start().then(function(my_seneca) {
        //console.log(my_seneca)
        seneca = my_seneca
        seneca.client({
            host: 'localhost',
            port: '8080'
        });
        seneca.ready(function() {
            var entity_1 = seneca.make$('signal_log', {
                "transaction_type": "BUY",
                "tradingsymbol": "GMBREW",
                "strategy_id": "fifty_2_wk",
                "signal_status": "PENDING_OPEN",
            }).save$(function() {
                var entity_2 = seneca.make$('signal_log', {
                    "transaction_type": "BUY",
                    "tradingsymbol": "YESBANK",
                    "strategy_id": "fifty_2_wk",
                    "signal_status": "OPEN",
                }).save$(function() {
                    var entity_3 = seneca.make$('signal_log', {
                        "transaction_type": "BUY",
                        "tradingsymbol": "ZEE",
                        "strategy_id": "fifty_2_wk",
                        "signal_status": "PENDING_CLOSE",
                    }).save$(function() {
                        var entity_4 = seneca.make$('signal_log', {
                            "transaction_type": "BUY",
                            "tradingsymbol": "KUNGFOO",
                            "strategy_id": "fifty_2_wk",
                            "signal_status": "CLOSE",
                        }).save$(function() {
                            done() // <======== finally done is called here
                        })
                    })
                })
            })
        })
    })
}

function close_seneca(done) {
    //console.log('closing seneca instance')
    //quandl.get("NSE/YESBANK", authtoken="1CzVT1zp5yzCQjQNq8yR", start_date="2013-06-08")
    seneca.close(done)
}