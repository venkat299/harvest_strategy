const Promise = require('bluebird');
const all = function (opt, callback) {
  const seneca = this;
  const watchlist = seneca.make$('watchlist');
  const watchlist_list$ = Promise.promisify(watchlist.list$, {
    context: watchlist,
  });
  watchlist_list$({
    strategy_id: opt.strategy_id,
    sort$: {
      ror: -1,
    },
  }).then(function (list) {
    // Sort by price high to low
    list.sort(sort_by('returns_std', true, parseInt));
    list.sort(sort_by('returns_mean', true, parseInt));
    list.sort(sort_by('ror', true, parseInt));
    // if(list) throw err;
    // console.log('list-->',list)
    callback(null, {
      success: true,
      data: list,
    });
  });
};
const add = function (opt, callback) {
  const seneca = this;
  const watchlist = seneca.make$('watchlist');
  const watchlist_list$ = Promise.promisify(watchlist.list$, {
    context: watchlist,
  });
  watchlist_list$({
    strategy_id: opt.strategy_id,
    tradingsymbol: opt.tradingsymbol,
  }).then(function (list) {
    if ((list.length === 1)) callback(null, {
      success: true,
      entity: list[0],
    });
    else if (!(list.length === 0)) throw new Error('ERR:COLLECTION_COUNT_MISMATCH');
    const entity = seneca.make$('watchlist', {
      strategy_id: opt.strategy_id,
      tradingsymbol: opt.tradingsymbol,
      status: 'INACTIVE',
      routine_run_dt: null,
    });
    entity.save$(function (err, val) {
      if (err) throw err;
      const final_val = val;
      // adding in strategy_stock colloections also
      seneca.act('role:strategy_stock,cmd:add', {
        strategy_id: opt.strategy_id,
        tradingsymbol: opt.tradingsymbol,
      }, function (err, val) {
        if (err) throw err;
        callback(null, {
          success: true,
          entity: final_val,
        });
      });
    });
  });
};
const retire = function (opt, callback) {
  const seneca = this;
  opt.status = 'INACTIVE';
  seneca.act('role:watchlist,cmd:change_status', opt, callback);
};
const change_status = function (opt, callback) {
  const seneca = this;
  const watchlist = seneca.make$('watchlist');
  const watchlist_list$ = Promise.promisify(watchlist.list$, {
    context: watchlist,
  });
  watchlist_list$({
    strategy_id: opt.strategy_id,
    tradingsymbol: opt.tradingsymbol,
  }).then(function (list) {
    if (!(list.length === 1)) throw new Error('ERR:COLLECTION_COUNT_MISMATCH');
    const item = list[0];
    item.status = opt.status;
    item.save$(function (err, val) {
      const final_val = val;
      if (err) throw err;
      if (opt.status == 'ACTIVE') seneca.act('role:strategy_stock,cmd:change_status', opt, function (err, val) {
        if (err) throw err;
        callback(null, {
          success: true,
          entity: final_val,
        });
      });
      else if (opt.status == 'INACTIVE') seneca.act('role:strategy_stock,cmd:change_status', opt, function (err, val) {
        if (err) throw err;
        callback(null, {
          success: true,
          entity: final_val,
        });
      });
    });
  });
};
const remove = function (opt, callback) {
  const seneca = this;
  const watchlist = seneca.make$('watchlist');
  const watchlist_list$ = Promise.promisify(watchlist.list$, {
    context: watchlist,
  });
  watchlist_list$({
    strategy_id: opt.strategy_id,
    tradingsymbol: opt.tradingsymbol,
  }).then(function (list) {
    if (!(list.length === 1)) throw new Error('ERR:COLLECTION_COUNT_MISMATCH');
    list[0].delete$(function (err, val) {
      if (err) throw err;
      callback(null, {
        success: true,
      });
    });
  });
};
const sort_by = function (field, reverse, primer) {
  const key = primer ? function (x) {
    return primer(x[field]);
  } : function (x) {
    return x[field];
  };
  reverse = !reverse ? 1 : -1;
  return function (a, b) {
    return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
  };
};
const reset_by_strategy = function (opt, callback) {
  const seneca = this;
  const watchlist = seneca.make$('watchlist');
  const watchlist_list$ = Promise.promisify(watchlist.list$, {
    context: watchlist,
  });
  // console.log('in reset_by_strategy')
  watchlist_list$({
    strategy_id: opt.strategy_id,
  }).then(function (list) {
    list.forEach((item) => {
      delete item.signal_status;
      item.save$();
    });
      // console.log('in reset_by_strategy: complete')
    callback(null, {
      success: true,
    });
  });
};
module.exports.all = all;
module.exports.add = add;
module.exports.retire = retire;
module.exports.remove = remove;
module.exports.change_status = change_status;
module.exports.reset_by_strategy = reset_by_strategy;