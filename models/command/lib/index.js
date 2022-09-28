'use strict'
const semver = require('semver');
const colors = require('colors/safe');
const log = require('@website-cli-dev/log');

const LOWEST_NODE_VERSION = '14.0.0';
class Command {
  constructor(argv) {
    this._argv = argv
    let runner = new Promise((resolve,reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => this.checkNodeVersion());
      chain.catch(err => {
        log.error(err.message);
      });
    })
  }

  checkNodeVersion() {
    const currentVersion = process.version;
    const lowestVersion = LOWEST_NODE_VERSION;
    if (!semver.gte(currentVersion, lowestVersion)) {
      throw new Error(colors.red(`website-cli-dev 需要安装 v${lowestVersion} 以上版本的 Node.js`));
    }
  }
  init() {
    throw new Error('init必须实现！');
  }

  exec() {
    throw new Error('exec必须实现！');
  }
}

module.exports = Command;
