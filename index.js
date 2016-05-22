
var fifty_2_wk = require('./lib/fifty_2_wk.js');

var opts = {};

module.exports = function (options) {

  var seneca = this
  var extend = seneca.util.deepextend
  opts = extend(opts, options)


  seneca.add('role:strategy,id:fifty_2_wk,cmd:run', fifty_2_wk.run)
  //seneca.add('role:info,req:part', aliasGet)

  return {
    name: 'harvest_strategy'
  }


}




