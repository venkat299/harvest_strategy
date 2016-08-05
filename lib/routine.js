const Promise = require('bluebird');
const fs = require('fs');
const PythonShell = require('python-shell');
const python_dir = __dirname + '/../python_src/';
PythonShell.defaultOptions = {
  scriptPath: python_dir,
  mode: 'json',
  detached: true,
};
const run_routine_all = function (opt, callback) {
  const seneca = this;
        // console.log('python_src_path: ', python_dir)
        // calculate ror for all stock
  const watchlist = seneca.make$('watchlist');
  const watchlist_list$ = Promise.promisify(watchlist.list$, {
    context: watchlist,
  });
        // console.log('opt:::', opt)
  const query_param = {
    strategy_id: opt.strategy_id,
    status: 'ACTIVE',
  };
  if (opt.tradingsymbol) query_param.tradingsymbol = opt.tradingsymbol;
  watchlist_list$(query_param).then(function (list) {
        // console.log('list:::', list)
    if ((list.length <= 0)) callback(new Error('ERR:COLLECTION_COUNT_MISMATCH'));
        // return web request prematurely in case of batch call
    if ((!opt.await) && (!opt.tradingsymbol)) {
      callback(null, {
        success: true,
      });
      callback = console.log;
    }
    const stock_list = list.map((item) => {
      return item.tradingsymbol;
    });
    const param = {
      python_dir,
      data: stock_list,
    };
            // console.log('param-->', param)
    calculate_ror(param, function (err, received_dt) {
      if (err) callback(err);
      else {
               // console.log('received_dt:', received_dt)
        try {
          received_dt = JSON.parse(received_dt);
        }
                catch (e) { callback(e); }
        list.forEach((item) => {
                    // console.log(item);
          const temp = received_dt.strategy_config.find((x) => {
            return x.tradingsymbol === item.tradingsymbol;
          });
                        // expected keys
          item.ror = temp.ror;
          item.returns_std = temp.returns_std;
          item.returns_mean = temp.returns_mean;
                    // optional keys
          item.extra_info = temp.extra_info;
          item.update_time = Date.now();
          item.save$(() => {
                        // console.log('saved_item_successfully')
          });
        });
        const evaluator_config = received_dt.evaluator_config;
                    // updating strategy_stock
        evaluator_config.forEach((x) => {
          seneca.act('role:strategy_stock,cmd:update', x, (err) => {
            if (err) console.log(err);
          });
        });
                // console.log(evaluator_config)
        received_dt.success = true;
                // calculate nrr update strategy_stock
        callback(null, received_dt);
      }
    });
  });

  function calculate_ror(opt, cb) {
    let received_dt = '';
    opt.python_dir = python_dir;
        // console.log('in calculate_ror:-->calculate_ror', received_dt)
        // var pyshell = new PythonShell('schedule/fifty_2_wk_daily.py');
    const pyshell = new PythonShell('schedule/fifty_2_wk/daily.py');
    const output = '';
    pyshell.stdout.on('data', function (data) {
      received_dt = received_dt + data;
            // console.log('received_dt:-->', received_dt)
    });
    pyshell.send((opt)).end(function (err) {
      if (err) cb(err);
      if (!received_dt) cb('ERR:PYTHON_TASK_FAILED');
      const result = '';
      try {
        tempy = JSON.parse(received_dt);
                // console.log('tempy => ',tempy)
        if (!tempy.success)
          cb('ERR:PYTHON_TASK_FAILED');
        fs.readFile(tempy.file_path, 'utf8', function (err, data) {
          if (err) cb('ERR:PYTHON_TASK_FAILED', err);
          cb(null, data);
        });
        tempy.file_path;
      } catch (e) { cb('ERR:PYTHON_TASK_FAILED', e); }
    });
  }
};
const monthly_eod_update = function (opt, callback) {
  const seneca = this;
        // console.log('python_src_path: ', python_dir)
        // calculate ror for all stock
  let received_dt = null;
  opt.python_dir = python_dir;
    // console.log('in calculate_ror:-->calculate_ror', received_dt)
  const pyshell = new PythonShell('hist/monthly/eod_download.py');
  const output = '';
  pyshell.stdout.on('data', function (data) {
    received_dt = data;
        // console.log('received_dt:-->', received_dt)
  });
  pyshell.send((opt)).end(function (err) {
    if (err) callback(err);
    if (!received_dt) callback('ERR:PYTHON_TASK_FAILED');
    callback(null, JSON.parse(received_dt));
  });
};
module.exports.run_routine_all = run_routine_all;
module.exports.monthly_eod_update = monthly_eod_update;