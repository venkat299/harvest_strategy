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
describe('signal_log:', function() {
    if (!skip) {
        before('check test server initialization', intialize)
        after('close server', close_seneca)
    } else before('skiping tests', function() {
            this.skip()
        })
        //==========`=== tests ==============
    describe('#clear_expired_signals:', clear_expired_signals)
    describe('#revert_signal : close-pending', revert_signal_1)
    describe('#revert_signal : open-pending', revert_signal_2)
    describe('#delete_signal ', delete_signal)
    //describe('#retire', retire)
    //==================================
    function clear_expired_signals() {
        it('should delete all pending signals', function(done) {
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

    function revert_signal_1() {
        it('revert a signal to its previous state', function(done) {
            var dt = mock_dt
            dt.tradingsymbol = 'KUNGFOO'
            seneca.act('role:signal_log,cmd:revert_signal', dt, function(err, val) {
                if (err) done(err)
                    //strategy_config
                expect(val.success).to.be.true
                seneca.make$('signal_log').list$(dt, function(err, val) {
                    if (err) done(err)
                    expect(val[0].signal_status).to.match(/PENDING_CLOSE/)
                    done()
                })
            })
        })
    }

    function revert_signal_2() {
        it('revert a signal to its previous state', function(done) {
            var dt = mock_dt
            dt.tradingsymbol = 'YESBANK'
            seneca.act('role:signal_log,cmd:revert_signal', dt, function(err, val) {
                if (err) done(err)
                    //strategy_config
                expect(val.success).to.be.true
                seneca.make$('signal_log').list$(dt, function(err, val) {
                    if (err) done(err)
                    expect(val[0].signal_status).to.match(/PENDING_OPEN/)
                    done()
                })
            })
        })
    }

    function delete_signal() {
        it('deletes a signal', function(done) {
            var dt = mock_dt
            dt.tradingsymbol = 'YESBANK'
            seneca.act('role:signal_log,cmd:delete_hard', dt, function(err, val) {
                if (err) done(err)
                    //strategy_config
                expect(val.success).to.be.true
                seneca.make$('signal_log').list$(dt, function(err, val) {
                    if (err) done(err)
                    expect(val.length).to.equal(0)
                    done()
                })
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