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

const custom_port = 8080;
// ###### testing module ########
let seneca = require('seneca')();

function start(cb) {
  seneca = require('seneca')();
  const Promise = require('bluebird');
  if (seneca.listening) {
    console.log('server already listenning');
    resolve({
      seneca,
      port: custom_port,
    });
  }
  mkdirp.sync(test_db_config.folder);
  mkdirp.sync('server/python_node_ipc/');

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
  // return new Promise(function (resolve, reject) {
  seneca.ready(function () {
    seneca.listen({
      host: 'localhost',
      port: custom_port,
    });
    cb();
    // resolve({
    //   seneca: seneca,
    //   port: custom_port
    // });
    // console.log('test server listening')
  });
  // });
}

const reset_db = function (cb) {
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
    mkdirp.sync(test_db_config.folder);

    // path exists unless there was an error
    console.log('>>>> deleted the db files');
    cb({
      seneca,
      port: custom_port,
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

before(function (done) {
  console.log('===== starting server =======');
  start(done);
});

after(function (done) {
  console.log('====== closing server  =====');
  seneca.close(done);
  done();
});

// module.exports.start = start;
module.exports.get_server = reset_db;