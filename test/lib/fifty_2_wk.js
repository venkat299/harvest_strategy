var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();
var Promise = require('bluebird')
    // ###### initializing test server ########
var intialize_server = require('../init_test_server.js')
var skip = require('../skip_test.json')['lib/fifty_2_wk']
var seneca;
//=========== mock data ============
var mock_dt = {
    "status": "success",
    "data": {
        "candles": [
            ["2015-12-28T09:15:00+0530", 100, 100, 100, 100, 1000]
        ]
    }
}
var columns = ['timestamp', 'open', 'high', 'low', 'close', 'volume']
var data = mock_dt.data.candles[0].reduce(function(result, field, index) {
    result[columns[index]] = field
    return result
}, {})
data.testing = true
var updated_order_sell_mock = {
    "entity$": {
        "name": "order_log"
    },
    "strategy_id": "fifty_2_wk",
    "tradingsymbol": "YESBANK",
    "status": "COMPLETE",
    "order_obj": {
        "strategy_id": "fifty_2_wk",
        "prev_track_id": null,
        "track_id": "1463943557324/evaluator/YESBANK",
        "tradingsymbol": "YESBANK",
        "exchange": "NSE",
        "transaction_type": "SELL",
        "order_type": "MARKET",
        "quantity": 19,
        "product": "CNC",
        "validity": "DAY"
    },
    "status_log": [
        ["INIT", 1463943557324],
        ["PLACED", 1463943557326],
        ["COMPLETE", 1463943557347]
    ],
    "kite_response": [{
        "order_id": "151220000000000",
        "tradingsymbol": "YESBANK",
        "strategy_id": "fifty_2_wk"
    }, {
        "order_id": "151220000000000",
        "exchange_order_id": "511220371736111",
        "user_id": "AB0012",
        "status": "COMPLETE",
        "tradingsymbol": "YESBANK",
        "exchange": "NSE",
        "transaction_type": "SELL",
        "average_price": 100,
        "price": 100,
        "quantity": 19,
        "filled_quantity": 19,
        "trigger_price": 0,
        "status_message": "",
        "order_timestamp": "2015-12-20 15:01:43",
        "checksum": "5aa3f8e3c8cc41cff362de9f73212e28"
    }],
    "order_id": "151220000000000",
    "id": "j5q7zt",
    "order_detail": {
        "order_id": "151220000000000",
        "exchange_order_id": "511220371736111",
        "user_id": "AB0012",
        "status": "COMPLETE",
        "tradingsymbol": "YESBANK",
        "exchange": "NSE",
        "transaction_type": "SELL",
        "average_price": 140,
        "price": 140,
        "quantity": 19,
        "filled_quantity": 19,
        "trigger_price": 0,
        "status_message": "",
        "order_timestamp": "2015-12-20 15:01:43",
        "checksum": "5aa3f8e3c8cc41cff362de9f73212e28"
    }
}
var updated_order_buy_mock = {
        "entity$": {
            "name": "order_log"
        },
        "strategy_id": "fifty_2_wk",
        "tradingsymbol": "YESBANK",
        "status": "COMPLETE",
        "order_obj": {
            "strategy_id": "fifty_2_wk",
            "prev_track_id": null,
            "track_id": "1463943557324/evaluator/YESBANK",
            "tradingsymbol": "YESBANK",
            "exchange": "NSE",
            "transaction_type": "BUY",
            "order_type": "MARKET",
            "quantity": 19,
            "product": "CNC",
            "validity": "DAY"
        },
        "status_log": [
            ["INIT", 1463943557324],
            ["PLACED", 1463943557326],
            ["COMPLETE", 1463943557347]
        ],
        "kite_response": [{
            "order_id": "151220000000000",
            "tradingsymbol": "YESBANK",
            "strategy_id": "fifty_2_wk"
        }, {
            "order_id": "151220000000000",
            "exchange_order_id": "511220371736111",
            "user_id": "AB0012",
            "status": "COMPLETE",
            "tradingsymbol": "YESBANK",
            "exchange": "NSE",
            "transaction_type": "BUY",
            "average_price": 100,
            "price": 100,
            "quantity": 19,
            "filled_quantity": 19,
            "trigger_price": 0,
            "status_message": "",
            "order_timestamp": "2015-12-20 15:01:43",
            "checksum": "5aa3f8e3c8cc41cff362de9f73212e28"
        }],
        "order_id": "151220000000000",
        "id": "j5q7zt",
        "order_detail": {
            "order_id": "151220000000000",
            "exchange_order_id": "511220371736111",
            "user_id": "AB0012",
            "status": "COMPLETE",
            "tradingsymbol": "YESBANK",
            "exchange": "NSE",
            "transaction_type": "BUY",
            "average_price": 990,
            "price": 100,
            "quantity": 19,
            "filled_quantity": 19,
            "trigger_price": 0,
            "status_message": "",
            "order_timestamp": "2015-12-20 15:01:43",
            "checksum": "5aa3f8e3c8cc41cff362de9f73212e28"
        }
    }
    //==================================
describe('Strategy:fifty_2_wk', function() {
    if (!skip) {
        before('check test server initialization', intialize)
        after('close server', close_seneca)
    } else before('check test server initialization', function() {
        this.skip()
    })
    describe('Strategy #run -> buy scenario', function() {
        it('signalling dry call -> should return msg: no_possible_routing', function(done) {
            this.timeout(5000);
            data.close = 1200 //140
            seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
                tradingsymbol: 'YESBANK',
                data: data
            }, function(err, val) {
                if (err) done(err)
                expect(val.cb_msg).to.match(/no_possible_routing/)
                expect(val.cb_msg_obj).to.be.an('object')
                expect(val.cb_msg_obj.transaction_type).to.be.null
                expect(val.cb_msg_obj.tradingsymbol).to.be.a('string')
                expect(val.cb_msg_obj.strategy_id).to.be.a('string')
                expect(val.cb_msg_obj.track_id).to.be.a('string')
                expect(val.cb_msg_obj.ltp).to.be.a('number')
                default_api_test(err, val)
                done()
            })
        })
        it('signalling first buy call -> should return an obj {success:true,msg:string}\n && buy scenario check if msg info is proper', function(done) {
            this.timeout(5000);
            data.close = 990 //125
            seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
                tradingsymbol: 'YESBANK',
                data: data
            }, function(err, val) {
                if (err) done(err)
                expect(val.cb_msg).to.match(/role:evaluator,cmd:evaluate/)
                expect(val.cb_msg_obj).to.be.an('object')
                expect(val.cb_msg_obj.transaction_type).to.match(/BUY/)
                expect(val.cb_msg_obj.tradingsymbol).to.be.a('string')
                expect(val.cb_msg_obj.strategy_id).to.be.a('string')
                expect(val.cb_msg_obj.track_id).to.be.a('string')
                expect(val.cb_msg_obj.ltp).to.be.a('number')
                default_api_test(err, val)
                done()
            })
        })
        it('signalling second buy call with previous pending buy call -> should return msg: no_possible_routing', function(done) {
            data.close = 990 //125
            seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
                tradingsymbol: 'YESBANK',
                data: data
            }, function(err, val) {
                if (err) done(err)
                expect(val.cb_msg).to.match(/no_possible_routing/)
                expect(val.cb_msg_obj).to.be.an('object')
                expect(val.cb_msg_obj.transaction_type).to.be.null
                expect(val.cb_msg_obj.tradingsymbol).to.be.a('string')
                expect(val.cb_msg_obj.strategy_id).to.be.a('string')
                expect(val.cb_msg_obj.track_id).to.be.a('string')
                expect(val.cb_msg_obj.ltp).to.be.a('number')
                default_api_test(err, val)
                done()
            })
        })
        it('signalling sell call with pending buy call -> should return msg: no_possible_routing', function(done) {
            data.close = 1100 //140
            seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
                tradingsymbol: 'YESBANK',
                data: data
            }, function(err, val) {
                if (err) done(err)
                expect(val.cb_msg).to.match(/no_possible_routing/)
                expect(val.cb_msg_obj).to.be.an('object')
                expect(val.cb_msg_obj.transaction_type).to.be.null
                expect(val.cb_msg_obj.tradingsymbol).to.be.a('string')
                expect(val.cb_msg_obj.strategy_id).to.be.a('string')
                expect(val.cb_msg_obj.track_id).to.be.a('string')
                expect(val.cb_msg_obj.ltp).to.be.a('number')
                default_api_test(err, val)
                done()
            })
        })
    })
    describe('Strategy #update_order -> buy scenario', function() {
        it('update signal info to OPEN -> should return signal with signal_status as OPEN', function(done) {
            seneca.act('role:signal_log,cmd:update_order', updated_order_buy_mock, function(err, val) {
                if (err) done(err)
                expect(val.signal_status).to.match(/OPEN/)
                expect(val.transaction_type).to.match(/BUY/)
                expect(val.log.length).to.equal(2)
                done()
            })
        })
    })
    // 	//================== 
    describe('Strategy #run -> sell scenario', function() {
        it('signalling dry sell call -> should return msg: no_possible_routing', function(done) {
            data.close = 900 //120
            this.timeout(5000);
            seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
                tradingsymbol: 'YESBANK',
                data: data
            }, function(err, val) {
                if (err) done(err)
                expect(val.cb_msg).to.match(/no_possible_routing/)
                expect(val.cb_msg_obj).to.be.an('object')
                expect(val.cb_msg_obj.transaction_type).to.be.null
                expect(val.cb_msg_obj.tradingsymbol).to.be.a('string')
                expect(val.cb_msg_obj.strategy_id).to.be.a('string')
                expect(val.cb_msg_obj.track_id).to.be.a('string')
                expect(val.cb_msg_obj.ltp).to.be.a('number')
                default_api_test(err, val)
                done()
            })
        })
        it('signalling first sell call for an open signal -> should return an obj {success:true,msg:string}\n && buy scenario check if msg info is proper', function(done) {
            this.timeout(5000);
            data.close = 1100 //140
            seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
                tradingsymbol: 'YESBANK',
                data: data
            }, function(err, val) {
                if (err) done(err)
                expect(val.cb_msg).to.match(/role:evaluator,cmd:evaluate/)
                expect(val.cb_msg_obj).to.be.an('object')
                expect(val.cb_msg_obj.transaction_type).to.match(/SELL/)
                expect(val.cb_msg_obj.tradingsymbol).to.be.a('string')
                expect(val.cb_msg_obj.strategy_id).to.be.a('string')
                expect(val.cb_msg_obj.track_id).to.be.a('string')
                expect(val.cb_msg_obj.ltp).to.be.a('number')
                default_api_test(err, val)
                done()
            })
        })
        it('signalling second sell call with previous pending sell call -> should return msg: no_possible_routing', function(done) {
            data.close = 1100 //140
            seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
                tradingsymbol: 'YESBANK',
                data: data
            }, function(err, val) {
                if (err) done(err)
                expect(val.cb_msg).to.match(/no_possible_routing/)
                expect(val.cb_msg_obj).to.be.an('object')
                expect(val.cb_msg_obj.transaction_type).to.be.null
                expect(val.cb_msg_obj.tradingsymbol).to.be.a('string')
                expect(val.cb_msg_obj.strategy_id).to.be.a('string')
                expect(val.cb_msg_obj.track_id).to.be.a('string')
                expect(val.cb_msg_obj.ltp).to.be.a('number')
                default_api_test(err, val)
                done()
            })
        })
        it('signalling buy call with pending sell call -> should return msg: no_possible_routing', function(done) {
            data.close = 990 //120
            seneca.act('role:strategy,id:fifty_2_wk,cmd:run', {
                tradingsymbol: 'YESBANK',
                data: data
            }, function(err, val) {
                if (err) done(err)
                expect(val.cb_msg).to.match(/no_possible_routing/)
                expect(val.cb_msg_obj).to.be.an('object')
                expect(val.cb_msg_obj.transaction_type).to.be.null
                expect(val.cb_msg_obj.tradingsymbol).to.be.a('string')
                expect(val.cb_msg_obj.strategy_id).to.be.a('string')
                expect(val.cb_msg_obj.track_id).to.be.a('string')
                expect(val.cb_msg_obj.ltp).to.be.a('number')
                default_api_test(err, val)
                done()
            })
        })
    })
    describe('Strategy #update_order -> sell scenario', function() {
        it('update signal info to CLOSE -> should return signal with signal_status as OPEN', function(done) {
            seneca.act('role:signal_log,cmd:update_order', updated_order_sell_mock, function(err, val) {
                if (err) done(err)
                expect(val.signal_status).to.match(/CLOSE/)
                expect(val.transaction_type).to.match(/SELL/)
                expect(val.log.length).to.equal(4)
                done()
            })
        })
    })
   // todo  move this test harvest_data
    // describe('Strategy #monthly_eod_update -> run monthly_eod_update routine', function() {
    // 	it('should run monthly for the given stock -> should return {success:true}', function(done) {
    // 		this.timeout(5000);
    // 		seneca.act('role:routine,cmd:monthly_eod_update',  {
    // 			stock_list:['YESBANK']
    // 		}, function(err, val) {
    // 			if (err) done(err)
    // 			expect(val.success).to.be.true
    // 			done()
    // 		})
    // 	})
    // })
})
var default_api_test = function(err, val, cb) {
    should.not.exist(err)
    should.exist(val)
    expect(val).to.be.an('object')
    expect(val.success).to.be.true
    expect(val.cb_msg).to.exist
    expect(val.curr_track_id).to.exist
    expect(val.prev_track_id).to.have.property
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
            equity_ceil: 0.2,
            shadowing: false
        })
        var entity_1_save$ = Promise.promisify(entity_1.save$, {
            context: entity_1
        })
        var entity_2 = seneca.make$('strategy_stock', {
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
        var entity_2_save$ = Promise.promisify(entity_2.save$, {
            context: entity_2
        })
        var entity_3 = seneca.make$('watchlist', {
            strategy_id: 'fifty_2_wk',
            tradingsymbol: 'YESBANK',
            status: 'ACTIVE',
            update_time: null
        })
        var entity_3_save$ = Promise.promisify(entity_3.save$, {
            context: entity_3
        })
        seneca.ready(function() {
            Promise.all([
                entity_1_save$(),
                entity_2_save$(),
                entity_3_save$()
            ]).then(function(res) {
                done()
            })
        })
    })
}

function close_seneca(done) {
    console.log('closing seneca instance')
    //quandl.get("NSE/YESBANK", authtoken="1CzVT1zp5yzCQjQNq8yR", start_date="2013-06-08")
    seneca.close(done)
}