'use strict';
const fs = require('fs')
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
         log.error(e.message);
      }
   }

   prepare(){
      // 1. 判断当前目录是否为空
      const res = this.isCwdEmpty()
      console.log(res)
      // 2. 是否启动强制更新
      // 3. 选择创建项目或者组件

   }

   isCwdEmpty(){
      const localPath = process.cwd()
      let fileList = fs.readdirSync(localPath)
      fileList = fileList.filter(file=> {
         return !file.startsWith('.') && ['node_modules'].indexOf(file)<0
      })

      console.log(fileList);
      return !fileList || fileList.length<=0
   }
}

function init(argv) {
   return new InitCommand(argv);
 }
 
 module.exports = init;
 module.exports.InitCommand = InitCommand;
 