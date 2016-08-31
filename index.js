const fifty_2_wk = require('./lib/fifty_2_wk.js');
const watchlist = require('./lib/watchlist.js');
const strategy_stock = require('./lib/strategy_stock.js');
const signal_log = require('./lib/signal_log.js').signal_log;
const order_log = require('./lib/order_log.js');
const routine = require('./lib/routine.js');
let opts = {};

function init(options) {
  const seneca = this;
  const extend = seneca.util.deepextend;
  opts = extend(opts, options);
  // ======= strategy =========== //
  seneca.add('role:strategy,id:fifty_2_wk,cmd:run', fifty_2_wk.run.bind(seneca));
  // ======= routine =========== //
  // seneca.add('role:routine,cmd:run_routine', routine.run_routine.bind(seneca))
  seneca.add('role:routine,cmd:run_routine', routine.run_routine_all.bind(seneca));
  seneca.add('role:routine,cmd:monthly_eod_update', routine.monthly_eod_update.bind(seneca));
  // ======= watchlist =========== //
  seneca.add('role:watchlist,cmd:all', watchlist.all.bind(seneca));
  seneca.add('role:watchlist,cmd:add', watchlist.add.bind(seneca));
  seneca.add('role:watchlist,cmd:retire', watchlist.retire.bind(seneca));
  seneca.add('role:watchlist,cmd:remove', watchlist.remove.bind(seneca));
  seneca.add('role:watchlist,cmd:change_status', watchlist.change_status.bind(seneca));
  seneca.add('role:watchlist,cmd:reset_by_strategy', watchlist.reset_by_strategy.bind(seneca));
  // ======= strategy_stock =========== //
  seneca.use(strategy_stock, opts);
  // ======= signal_log =========== //
  seneca.use(signal_log, opts);
  // ======= order_log =========== //
  seneca.use(order_log, opts);
  // seneca.add('role:order_log,cmd:all', order_log.all.bind(seneca))
  return {
    name: 'harvest_strategy',
  };
}

module.exports = init;