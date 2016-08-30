const Promise = require('bluebird');

function all(opt, callback) {
  const seneca = this;
  const strategy_stock = seneca.make$('strategy_stock');
  const strategy_stock_list$ = Promise.promisify(strategy_stock.list$, {
    context: strategy_stock,
  });
  strategy_stock_list$({
    strategy_id: opt.strategy_id,
    status: 'ACTIVE',
    // sort$:{ror:-1}
  }).then((list) => {
    // if(list) throw err;
    // console.log('list-->',list)
    callback(null, {
      success: true,
      data: list,
    });
  });
}

function add(opt, callback) {
  const seneca = this;
  const strategy_stock = seneca.make$('strategy_stock');
  const strategy_stock_list$ = Promise.promisify(strategy_stock.list$, {
    context: strategy_stock,
  });
  strategy_stock_list$({
    strategy_id: opt.strategy_id,
    tradingsymbol: opt.tradingsymbol,
  }).then((list) => {
    if ((list.length === 1)) {
      callback(null, {
        success: true,
        entity: list[0],
      });
    } else if (!(list.length === 0)) throw new Error('ERR:COLLECTION_COUNT_MISMATCH');
    const entity = seneca.make$('strategy_stock', {
      strategy_id: opt.strategy_id,
      tradingsymbol: opt.tradingsymbol,
      status: 'INACTIVE',
      stock_ceil: null,
      nrr: null,
      profit_margin: null,
      buy_price_threshold: null,
      prev_buy_price: null,
      prev_sell_price: null,
    });
    entity.save$((err, val) => {
      if (err) throw err;
      callback(null, {
        success: true,
        entity: val,
      });
    });
  });
}

function retire(opt, callback) {
  const seneca = this;
  const $opt = opt;
  $opt.status = 'INACTIVE';
  seneca.act('role:strategy_stock,cmd:change_status', $opt, callback);
}

function change_status(opt, callback) {
  const seneca = this;
  const strategy_stock = seneca.make$('strategy_stock');
  const strategy_stock_list$ = Promise.promisify(strategy_stock.list$, {
    context: strategy_stock,
  });
  strategy_stock_list$({
    strategy_id: opt.strategy_id,
    tradingsymbol: opt.tradingsymbol,
  }).then((list) => {
    if (!(list.length === 1)) throw new Error('ERR:COLLECTION_COUNT_MISMATCH');
    const item = list[0];
    item.status = opt.status;
    item.save$((err, val) => {
      if (err) throw err;
      callback(null, {
        success: true,
        entity: val,
      });
    });
  });
}

function update(opt, callback) {
  const seneca = this;
  const strategy_stock = seneca.make$('strategy_stock');
  const strategy_stock_list$ = Promise.promisify(strategy_stock.list$, {
    context: strategy_stock,
  });
  // console.log(opt)
  strategy_stock_list$({
    strategy_id: opt.strategy_id,
    tradingsymbol: opt.tradingsymbol,
  }).then((list) => {
    if (!(list.length === 1)) throw new Error('ERR:COLLECTION_COUNT_MISMATCH');
    const item = list[0];
    if (opt.status) item.status = opt.status;
    if (opt.stock_ceil) item.stock_ceil = opt.stock_ceil;
    if (opt.nrr) item.nrr = opt.nrr;
    if (opt.profit_margin) item.profit_margin = opt.profit_margin;
    if (opt.buy_price_threshold) item.buy_price_threshold = opt.buy_price_threshold;
    if (opt.prev_buy_price) item.prev_buy_price = opt.prev_buy_price;
    if (opt.prev_sell_price) item.prev_sell_price = opt.prev_sell_price;
    item.save$((err, val) => {
      if (err) throw err;
      callback(null, {
        success: true,
        entity: val,
      });
    });
  });
}

function remove(opt, callback) {
  const seneca = this;
  const strategy_stock = seneca.make$('strategy_stock');
  const strategy_stock_list$ = Promise.promisify(strategy_stock.list$, {
    context: strategy_stock,
  });
  strategy_stock_list$({
    strategy_id: opt.strategy_id,
    tradingsymbol: opt.tradingsymbol,
  }).then((list) => {
    if (!(list.length === 1)) throw new Error('ERR:COLLECTION_COUNT_MISMATCH');
    list[0].delete$((err) => {
      if (err) throw err;
      callback(null, {
        success: true,
      });
    });
  });
}

function reset_strategy(opt, callback) {
  const seneca = this;
  seneca.act('role:signal_log,cmd:delete_by_strategy', opt, (err_signal) => {
    if (err_signal) callback(err_signal);
    seneca.act('role:order_log,cmd:delete_by_strategy', opt, (err_order) => {
      if (err_order) callback(err_order);
      callback(null, {
        success: true,
      });
    });
  });
}

function strategy_stock_api() {
  // const app_config = options.app_config;
  const seneca = this;
  /* Retrieves all the stock_list for the given strategy
   */
  this.add('role:strategy_stock,cmd:all', all.bind(seneca));
  /* TODO : add description
   *
   */
  this.add('role:strategy_stock,cmd:add', add.bind(seneca));
  /* TODO : add description
   *
   */
  this.add('role:strategy_stock,cmd:retire', retire.bind(seneca));
  /* TODO : add description
   *
   */
  this.add('role:strategy_stock,cmd:remove', remove.bind(seneca));
  /* TODO : add description
   *
   */
  this.add('role:strategy_stock,cmd:change_status', change_status.bind(seneca));
  /* TODO : add description
   *
   */
  this.add('role:strategy_stock,cmd:update', update.bind(seneca));
  /* TODO : add description
   *
   */
  this.add('role:strategy_stock,cmd:reset_strategy', reset_strategy.bind(seneca));
}
//= ========= seneca api export
module.exports = strategy_stock_api;
//= ========= other_internal_dependency export
// module.exports.all = all;
// module.exports.add = add;
// module.exports.retire = retire;
// module.exports.remove = remove;
// module.exports.change_status = change_status;
// module.exports.update = update;