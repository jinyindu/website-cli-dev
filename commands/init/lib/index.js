'use strict'
const fs = require('fs')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const Command = require('@website-cli-dev/command')
const log = require('@website-cli-dev/log')

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || ''
    this.force = !!this._cmd.force
  }
  exec() {
    try {
      this.prepare()
    } catch (e) {
      log.error(e.message)
    }
  }

  async prepare() {
    // 1. 判断当前目录是否为空
    const localPath = process.cwd();
    const res = this.isCwdEmpty()
    if (!res) {
      let ifContinue = false
      if(!this.force) {
         ifContinue = (
            await inquirer.prompt({
              type: 'confirm',
              name: 'ifContinue',
              default: false,
              message: '当前文件夹不为空，是否继续创建项目？',
            })
          ).ifContinue
          if (!ifContinue) {
            return;
          }
      }
      if(!ifContinue || this.force) {
        const ifConfirm = (
            await inquirer.prompt({
              type: 'confirm',
              name: 'ifConfirm',
              default: false,
              message: '是否确认清空当前目录下的文件？',
            })
         ).ifConfirm

         if(ifConfirm) {
            fse.emptyDirSync(localPath);
         }
      }
      
    }
    // 2. 是否启动强制更新
    // 3. 选择创建项目或者组件
  }

  isCwdEmpty() {
    const localPath = process.cwd()
    let fileList = fs.readdirSync(localPath)
    fileList = fileList.filter((file) => {
      return !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
    })
    return !fileList || fileList.length <= 0
  }
}

function init(argv) {
  return new InitCommand(argv)
}

module.exports = init
module.exports.InitCommand = InitCommand
