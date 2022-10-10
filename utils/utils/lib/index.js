'use strict'
const Spinner = require('cli-spinner').Spinner;

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

function exec(command, args, options) {
  const win32 = process.platform === 'win32'

  const cmd = win32 ? 'cmd' : command
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args

  return require('child_process').spawn(cmd, cmdArgs, options || {})
}

function sleep(timeout = 1000) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

function spinnerStart(msg) {
  const spinner = new Spinner(msg);
  spinner.setSpinnerString('|/-\\');
  spinner.start();
  return spinner
}

module.exports = {
  isObject,
  exec,
  spinnerStart,
  sleep
}
