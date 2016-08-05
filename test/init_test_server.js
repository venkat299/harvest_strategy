const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const portfinder = require('portfinder');

const config = require('../config.json');
// ======= change db here =========
const test_db = config.test.current_db;
// ================================
const test_db_name = config.test[test_db].db_type;
const test_db_config = config.test[test_db].db_config;

// ###### testing module ########
function start(cb) {
  const seneca = require('seneca')();
  const Promise = require('bluebird');
  if (seneca.listening) {
  	console.log('server already listenning')
    resolve({
      seneca: seneca,
      port: 8080
    });
  }

  // Promise.promisify(seneca.make$,{context:seneca})
  // Promise.promisify(seneca.list$,{context:seneca})

  // ###### service needed for testing  ########
  // var harvest_strategy = require('harvest_strategy');
  const harvest_data = require('harvest_data');
  const harvest_evaluator = require('harvest_evaluator');
  const harvest_executor = require('harvest_executor');

  seneca.use(harvest_data);
  // seneca.use(harvest_strategy)
  seneca.use(harvest_evaluator);
  seneca.use(harvest_executor);

  // ###### current service being tested ########
  seneca.use('../index.js');

  // ###### resetting db  ########
  reset_db();

  // ###### adding test db  ########
  try {
    seneca.use('entity');
    seneca.use(test_db_name, test_db_config);
  } catch (err) {
    console.log(err);
  }

  // ###### promisifying method act  ########
  Promise.promisify(seneca.act, {
    context: seneca,
  });

  // ###### returning a promise that db is configured  ########
  return new Promise(function (resolve, reject) {
    seneca.ready(function () {
      // seneca.add('role:test_server,cmd:check_status', function(opt, cb) {
      // 	cb(null, {
      // 		success: true,
      // 		server: 'alive',
      // 		server_type: 'test'
      // 	})
      // })
      // portfinder.getPort(function (err, port) {
      //
      // `port` is guaranteed to be a free port
      // in this scope.
      //
      seneca.listen({
        host: 'localhost',
        port: 8080,
      });

      resolve({
        seneca: seneca,
        port: 8080
      });
      // });

      // console.log('test server listening')
    });
  });
}

const reset_db = function () {
  // ###### for mongo db  ########
  if (test_db === 'mongo') {
    // drop mongo db
    // console.log('clearing mongodb database')
  }
  // ###### for level db and json-file db  ########
  else {
    // ######### removing db directories #########
    // console.log('clearing db files')
    rmDir(test_db_config.folder, false);
    rmDir('server/python_node_ipc/', false);
    // ######### creating empty db directory #########
    const mkdirp = require('mkdirp');
    mkdirp(test_db_config.folder, function (err) {
      // path exists unless there was an error
      if (err)
        throw err;
    });
  }
};
const rmDir = function (dirPath, removeSelf) {
  if (removeSelf === undefined)
    removeSelf = true;
  try {
    var files = fs.readdirSync(dirPath);
  } catch (e) {
    // throw e
    return;
  }
  if (files.length > 0)
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(dirPath, files[i]);
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
      else
        rmDir(filePath);
    }
  if (removeSelf)
    fs.rmdirSync(dirPath);
};

module.exports.start = start;