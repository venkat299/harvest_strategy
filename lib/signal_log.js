/* eslint max-len: 0 */

const Promise = require('bluebird');
const logger = require('winston');

/* ====== METHOD IMPLEMENTATION & HELPERS ======
 */
function all(opt, callback) {
  const seneca = this;
  const signal_log = seneca.make$('signal_log');
  const signal_log_list$ = Promise.promisify(signal_log.list$, {
    context: signal_log,
  });
  signal_log_list$({
    strategy_id: opt.strategy_id,
    // sort$:{ror:-1}
  }).then((list) => {
    callback(null, {
      success: true,
      data: list,
    });
  });
}

function reset_expired(opt, callback) {
  const seneca = this;
  const signal_log = seneca.make$('signal_log');
  const signal_log_list$ = Promise.promisify(signal_log.list$, {
    context: signal_log,
  });
  signal_log_list$().then((val) => {
    val.forEach((item) => {
      logger.debug(`signal_status:${item.signal_status} symbol:${item.symbol}`);
      if (item.signal_status === 'PENDING_OPEN') {
        item.remove$({
          id: item.id,
        }, (err, result) => {
          if (err) logger.debug(err);
          logger.debug('deleted signal_log', result);
        });
      }
      if (item.signal_status === 'PENDING_CLOSE') {
        item.signal_status = 'OPEN';
        item.save$((err, result) => {
          if (err) logger.debug(err);
          logger.debug('changed signal_log status', result);
        });
      }
    });
    callback(null, {
      success: true,
    });
  }).catch(e => {
    callback(e);
  });
}

function revert_signal(opt, callback) {
  /* eslint no-param-reassign: 0 */
  const seneca = this;
  const signal_log = seneca.make$('signal_log');
  const signal_log_list$ = Promise.promisify(signal_log.list$, {
    context: signal_log,
  });
  const filter = {
    tradingsymbol: opt.tradingsymbol,
    strategy_id: opt.strategy_id,
  };
  // logger.debug(filter)
  signal_log_list$(filter).then((val) => {
    const filtered_signals = val;
    // .filter((elem) => (elem.signal_status === 'CLOSE')) -- temporarily commented out; need to fix
    if (!(filtered_signals.length === 1)) throw new Error('ERR:ENTITY_COUNT_MISMATCH');
    const elem = filtered_signals[0];
    if (elem.signal_status === 'OPEN') elem.signal_status = 'PENDING_OPEN';
    if (elem.signal_status === 'CLOSE') elem.signal_status = 'PENDING_CLOSE';
    elem.save$((e) => {
      if (e) callback(e);
      callback(null, {
        success: true,
      });
    });
  }).catch(e => {
    callback(e);
  });
}

function delete_signal(opt, callback) {
  const seneca = this;
  const signal_log = seneca.make$('signal_log');
  const signal_log_list$ = Promise.promisify(signal_log.list$, {
    context: signal_log,
  });
  const filter = {
    tradingsymbol: opt.tradingsymbol,
    strategy_id: opt.strategy_id,
  };
  // logger.debug(filter)
  signal_log_list$(filter).then((val) => {
    const filtered_signals = val;
    // .filter((elem) => (elem.signal_status === 'CLOSE')) -- temporarily commented out; need to fix
    if (!(filtered_signals.length === 1)) throw new Error('ERR:ENTITY_COUNT_MISMATCH');
    const elem = filtered_signals[0];
    elem.remove$((e) => {
      if (e) callback(e);
      callback(null, {
        success: true,
      });
    });
  }).catch(e => {
    callback(e);
  });
}

function save_signal(opt, callback) {
  const seneca = this;
  const signal_log = seneca.make$('signal_log', {
    transaction_type: opt.transaction_type,
    tradingsymbol: opt.tradingsymbol,
    strategy_id: opt.strategy_id,
    signal_status: opt.signal_status,
    log: [
      [opt.signal_status, opt.transaction_type, Date.now()],
    ],
  });
  signal_log.save$((err) => {
    if (err) throw err;
    callback(null, true);
  });
}

function switch_signal(opt, callback) {
  const seneca = this;
  const signal_log = seneca.make$('signal_log');
  const signal_log_list$ = Promise.promisify(signal_log.list$, {
    context: signal_log,
  });
  signal_log_list$({
    strategy_id: opt.strategy_id,
    tradingsymbol: opt.tradingsymbol,
  }).then((val) => {
    const filtered_signals = val.filter((elem) => (elem.signal_status === 'OPEN'));
    if (!(filtered_signals.length === 1)) throw new Error('Err: Multiple entities received');
    const elem = filtered_signals[0];
    if (elem.transaction_type === opt.transaction_type) {
      throw new Error('Err: Illegal entity state');
    }
    elem.signal_status = opt.signal_status;
    elem.transaction_type = opt.transaction_type;
    elem.log.push([opt.signal_status, opt.transaction_type, Date.now()]);
    elem.save$((err) => {
      if (err) throw err;
      callback(null, true);
    });
  }).catch(e => {
    throw e;
  });
}

function check_pending_order(opt, callback) {
  const seneca = this;
  const signal_log = seneca.make$('signal_log');
  const signal_log_list$ = Promise.promisify(signal_log.list$, {
    context: signal_log,
  });
  signal_log_list$({
    strategy_id: opt.strategy_id,
    tradingsymbol: opt.tradingsymbol,
  }).then((val) => {
    const filtered_signals = val.filter((elem) => (elem.signal_status === 'PENDING_OPEN' || elem.signal_status === 'OPEN' || elem.signal_status === 'PENDING_CLOSE'));
    // logger.debug('filtered_signals', filtered_signals)
    if (filtered_signals.length === 0) callback(null, 'openable');
    else if (filtered_signals.length === 1) {
      const elem = filtered_signals[0];
      if (elem.signal_status === 'OPEN') callback(null, 'closable');
      else callback(null, 'pending');
    } else {
      throw new Error('Forbidden branch reached');
    }
  }).catch(e => {
    throw e;
  });
}

function update_order(opt, callback) {
  const seneca = this;
  const signal_log = seneca.make$('signal_log');
  const signal_log_list$ = Promise.promisify(signal_log.list$, {
    context: signal_log,
  });
  signal_log_list$({
    strategy_id: opt.order_obj.strategy_id,
    tradingsymbol: opt.order_obj.tradingsymbol,
  }).then((val) => {
    // logger.debug('L19', 'val:', val)
    const filtered_signals = val.filter((elem) => (elem.signal_status === 'PENDING_OPEN' || elem.signal_status === 'PENDING_CLOSE'));
    if (filtered_signals.length !== 1) throw new Error('ERR:COLLECTION_COUNT_MISMATCH');
    const elem = filtered_signals[0];
    if (!(elem.transaction_type === opt.order_obj.transaction_type)) {
      throw new Error('ERR:ILLEGAL_ENTITY_STATE');
    }
    elem.signal_status = (elem.signal_status).replace(/PENDING_/, '');
    elem.log.push([elem.signal_status, elem.transaction_type, Date.now()]);
    elem.save$((err, result) => {
      if (err) throw err;
      callback(null, result);
    });
  }).catch(e => {
    throw e;
  });
}

function signal_log_api() {
  // const app_config = options.app_config;
  const seneca = this;
  /* Retrieves all the signals for the given strategy
   */
  this.add('role:signal_log,cmd:all', all.bind(seneca));
  /* TODO : add description
   *
   */
  this.add('role:signal_log,cmd:update_order', update_order.bind(seneca));
  /* Resets the signal status from pending to its previous state
   * ie (PENDING_OPEN -> OPEN) && (PENDING_CLOSE -> CLOSE)
   */
  this.add('role:signal_log,cmd:delete_expired', reset_expired.bind(seneca));
  /* TODO : add description
   *
   */
  this.add('role:signal_log,cmd:revert_signal', revert_signal.bind(seneca));
  /* Deletes the signal irrespective of its current state;
   * Caution should be taken as it will completely remove a history of signal
   */
  this.add('role:signal_log,cmd:delete_hard', delete_signal.bind(seneca));
  /* ====== INFO ======
   * this is the special initialization pattern; commented out as it is not required now
   */
  // this.add('init:eod', init)
  // function init(msg, respond) {
  //   logger.debug('in init',options)
  //     logger.debug('initializing component:eod')
  //     app_config = options.app_config
  //     respond()
  // }
}
//= ========= seneca api export
module.exports.signal_log = signal_log_api;
//= ========= other_internal_dependency export
module.exports.update_order = update_order; // should change name to update_signal
module.exports.get_signal_status = check_pending_order;
module.exports.switch_signal = switch_signal;
module.exports.save_signal = save_signal;
module.exports.revert_signal = revert_signal;