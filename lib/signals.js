const Promise = require('bluebird');
const delete_expired = function (opt, callback) {
  const seneca = this;
  const signal_log = seneca.make$('signal_log');
  const signal_log_list$ = Promise.promisify(signal_log.list$, {
    context: signal_log,
  });
  signal_log_list$().then(function (val) {
    val.forEach(function (item) {
      if (item.status === 'PENDING_OPEN' || item.status === 'PENDING_CLOSE') item.remove$({
        id: item.id,
      });
    });
    callback(null, true);
  }).catch(e => {
    callback(err);
  });
};
module.exports = delete_expired;