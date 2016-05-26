
var update_order = require('./lib/update_order')

// ######## strategy imports #########//
var fifty_2_wk = require('./lib/fifty_2_wk.js');

var opts = {};

module.exports = function (options) {

  var seneca = this
  var extend = seneca.util.deepextend
  opts = extend(opts, options)

 seneca.add('role:strategy,id:fifty_2_wk,cmd:update_order', update_order.bind(seneca))

 seneca.add('role:strategy,id:fifty_2_wk,cmd:run', fifty_2_wk.run.bind(seneca))
  //seneca.add('role:info,req:part', aliasGet)

  return {
    name: 'harvest_strategy'
  }


}




