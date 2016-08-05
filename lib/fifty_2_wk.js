// =======================
// private lib
// =======================
// "use strict";
const Promise = require('bluebird');
const PythonShell = require('python-shell');
PythonShell.defaultOptions = {
  scriptPath: './python_src/',
  mode: 'json',
  detached: true,
};
const my_get_signal_status = (require('./signal_log')).get_signal_status;
const my_save_signal = require('./signal_log').save_signal;
const my_switch_signal = require('./signal_log').switch_signal;
const run = function (opt, final_cb) {
  const seneca = this;
  const data = opt.data;
  const tradingsymbol = opt.tradingsymbol;
  const curr_track_id = Date.now() + '/strategy/' + tradingsymbol;
  let cb_msg = null;
  const cb_msg_obj = {
    tradingsymbol,
    strategy_id: 'fifty_2_wk',
    track_id: curr_track_id,
    transaction_type: null,
    ltp: (data.ltp || data.close),
    signal_status: null,
  };
  let get_signal_status = my_get_signal_status.bind(this);
  get_signal_status = Promise.promisify(get_signal_status);
  let save_signal = my_save_signal.bind(this);
  save_signal = Promise.promisify(save_signal);
  let switch_signal = my_switch_signal.bind(this);
  switch_signal = Promise.promisify(switch_signal);
    /*
			check for open order
				if not found proceed
					to calculate for open and place signal
					make signal open
				if found
					calculate for close signal
					make signal close
		*/
    // check for open order for the stock
  const query = {
    tradingsymbol,
    strategy_id: 'fifty_2_wk',
  };
  get_signal_status(query).then(function (status) {
    console.log(query.tradingsymbol, '#signal staus:', status);
    switch (status) {
      case 'openable':
        is_openable().then(function (openable) {
          console.log('decision openable:', openable);
          if (openable) do_open();
          else do_nothing();
        });
        break;
      case 'closable':
        is_closable().then(function (closable) {
          console.log('decision closable:', closable);
          if (closable) do_close();
          else do_nothing();
        });
        break;
      case 'pending':
        do_nothing();
        break;
      default:
        throw new Error('Forbidden branch reached');
    }
  });
  let is_openable = function (can_open) {
    console.log('in : is_openable');
    const strategy_stock = seneca.make$('strategy_stock');
    const strategy_stock_list$ = Promise.promisify(strategy_stock.list$, {
      context: strategy_stock,
    });
    strategy_stock_list$({
      strategy_id: cb_msg_obj.strategy_id,
      tradingsymbol: opt.tradingsymbol,
    }).then(function (strategy_stk) {
      if (!(strategy_stk.length === 1)) throw new Error('Err: Multiple entities received');
      strategy_stk = strategy_stk[0];
            //= =======//
      const params = data;
      params.strategy_stock = strategy_stk.data$(false);
            // workaround for bug: prev buy sell price not updated in strategy_stock


      params.tradingsymbol = opt.tradingsymbol;
      params.transaction_type = 'BUY';
            // can_open(null,false)
      run_script(params, can_open);
    });
        //= =======//
  };
  let is_closable = function (can_close) {
    console.log('in : is_closable');
    const strategy_stock = seneca.make$('strategy_stock');
    const strategy_stock_list$ = Promise.promisify(strategy_stock.list$, {
      context: strategy_stock,
    });
    strategy_stock_list$({
      strategy_id: cb_msg_obj.strategy_id,
      tradingsymbol: opt.tradingsymbol,
    }).then(function (strategy_stk) {
      if (!strategy_stk.length == 1) throw new Error('Err: Multiple entities received');
      strategy_stk = strategy_stk[0];
      const params = data;
      params.strategy_stock = strategy_stk.data$(false);
      params.tradingsymbol = opt.tradingsymbol;
      params.transaction_type = 'SELL';
      run_script(params, can_close);
            // can_close(null, false)
    });
  };
  const run_script = function (params, callback) {
    let received_dt = null;
    const d = JSON.parse(JSON.stringify(params));
    const pyshell = new PythonShell('/strategy/fifty_2_wk.py');
    const output = '';
    pyshell.stdout.on('data', function (data) {
      received_dt = data;
    });
    pyshell.send(params).end(function (err) {
      if (err) throw err;
      else {
        received_dt = JSON.parse(received_dt);
        callback(null, received_dt.success);
        console.log('received_dt:', received_dt);
      }
    });
  };
  const do_open = function (opt) {
    console.log('do_open', 'opt:', opt);
    const route = 'role:evaluator,cmd:evaluate';
    cb_msg = route;
    cb_msg_obj.transaction_type = 'BUY';
    cb_msg_obj.signal_status = 'PENDING_OPEN';
    save_signal(cb_msg_obj).then(function () {
      seneca.act(route, cb_msg_obj, function (res) {
        final_cb(null, {
          success: true,
          cb_msg,
          cb_msg_obj,
          curr_track_id,
          prev_track_id: null,
        });
      });
    });
  };
  const do_close = function (opt) {
    console.log('in : do_close');
    const route = 'role:evaluator,cmd:evaluate';
    cb_msg = route;
    cb_msg_obj.transaction_type = 'SELL';
    cb_msg_obj.signal_status = 'PENDING_CLOSE';
    switch_signal(cb_msg_obj).then(function () {
      seneca.act(route, cb_msg_obj, function (res) {
        final_cb(null, {
          success: true,
          cb_msg,
          cb_msg_obj,
          curr_track_id,
          prev_track_id: null,
        });
      });
    });
  };
  const do_nothing = function (opt, cb) {
    console.log('in : do_nothing');
    final_cb(null, {
      success: true,
      cb_msg: 'no_possible_routing',
      cb_msg_obj,
      curr_track_id,
      prev_track_id: null,
    });
  };
  is_openable = Promise.promisify(is_openable);
  is_closable = Promise.promisify(is_closable);
};
module.exports.run = run;