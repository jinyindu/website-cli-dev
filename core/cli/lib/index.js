'use strict';

module.exports = core;
// const path = require('path');
// const semver = require('semver');
// const colors = require('colors/safe');
// const userHome = require('user-home');
// const pathExists = require('path-exists').sync;
// const commander = require('commander');

const pkg = require('../package.json');

async function core() {
    try {
      await prepare();
      registerCommand();
    } catch (e) {
      log.error(e.message);
      if (program.debug) {
        console.log(e);
      }
    }
}


function registerCommand() {

}

async function prepare() {
    checkPkgVersion();
    // checkRoot();
    // checkUserHome();
    // checkEnv();
    // await checkGlobalUpdate();
}

// 检查版本号
function checkPkgVersion(){
    console.log(pkg.version)
}