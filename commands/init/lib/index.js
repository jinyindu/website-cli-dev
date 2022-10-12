'use strict'

const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const semver = require('semver')
const userHome = require('user-home')
const Command = require('@website-cli-dev/command')
const Package = require('@website-cli-dev/package')
const log = require('@website-cli-dev/log')
const getProject = require('./getProject')
const { spinnerStart, sleep } = require('@website-cli-dev/utils')

const TYPE_PROJECT = 'project'
const TYPE_COMPONENT = 'component'

const TEMPLATE_TYPE_NORMAL = 'normal'
const TEMPLATE_TYPE_CUSTOM = 'custom'
class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || ''
    this.force = !!this._cmd.force
  }
  async exec() {
    try {
      const projectInfo = await this.prepare()
      if (projectInfo) {
        this.projectInfo = projectInfo
        // 下载模版
        await this.downloadTemplate()
        // 安装模版
        await this.installTemplate()
      }
    } catch (e) {
      log.error(e.message)
    }
  }

  async prepare() {
    const template = await getProject()
    if (!template) {
      throw new Error('模版不存在')
    }
    this.template = template
    // 1. 判断当前目录是否为空
    const localPath = process.cwd()
    const res = this.isCwdEmpty()
    if (!res) {
      let ifContinue = false
      if (!this.force) {
        ifContinue = (
          await inquirer.prompt({
            type: 'confirm',
            name: 'ifContinue',
            default: false,
            message: '当前文件夹不为空，是否继续创建项目？',
          })
        ).ifContinue
        if (!ifContinue) {
          return
        }
      }
      if (ifContinue || this.force) {
        const ifConfirm = (
          await inquirer.prompt({
            type: 'confirm',
            name: 'ifConfirm',
            default: false,
            message: '是否确认清空当前目录下的文件？',
          })
        ).ifConfirm

        if (ifConfirm) {
          log.success('清空目录成功！', localPath)
          fse.emptyDirSync(localPath)
        }
      }
    }
    return this.getProjectInfo()
  }

  // 下载模版
  async downloadTemplate() {
    const { projectTemplate } = this.projectInfo
    const templateInfo = this.template.find(
      (item) => item.npmName === projectTemplate,
    )
    const targetPath = path.resolve(userHome, '.website-cli-dev', 'template')
    const storeDir = path.resolve(userHome, '.website-cli-dev','template','node_modules')

    if (templateInfo) {
      this.templateInfo = templateInfo
    }
    const { npmName, version } = templateInfo
    const templateNpm = new Package({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version,
    })
    
    if (!(await templateNpm.exstis())) {
      const spinner = spinnerStart('正在下载模版...')
      await sleep()
      try {
        await templateNpm.install()
      } catch (e) {
        throw e
      } finally {
        spinner.stop(true)
        log.success('模版下载成功')
        this.templateNpm = templateNpm
      }
    } else {
      const spinner = spinnerStart('正在更新模版...')
      await sleep()
      try {
        await templateNpm.update()
      } catch (e) {
        throw e
      } finally {
        spinner.stop(true)
        log.success('模版更新成功')
        this.templateNpm = templateNpm
      }
    }
  }

  // 安装模版
  async installTemplate() {
    if (this.templateInfo) {
      if (!this.templateInfo.type) {
        this.templateInfo.type = TEMPLATE_TYPE_NORMAL
      }
      if (this.templateInfo.type === TEMPLATE_TYPE_NORMAL) {
        await this.installNormalTemplate()
      } else if (this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) {
        await this.installCustomTemplate()
      } else {
        throw new Error('无法识别的项目模版')
      }
    } else {
      throw new Error('项目模版不存在')
    }
  }

  async installNormalTemplate() {
    const spinner = spinnerStart('正在安装模版...')
    await sleep()
    try {
      const templatePath = path.resolve(this.templateNpm.cacheFilePath,'template')
      const targetPath = process.cwd()
      fse.ensureDirSync(templatePath)
      fse.ensureDirSync(targetPath)
  
      fse.copySync(templatePath,targetPath)
    } catch (e) {
      throw e
    } finally {
      spinner.stop(true)
      log.success('模版安装成功')
    }
  }
  async installCustomTemplate() {

  }

  async getProjectInfo() {
    function isValidName(v) {
      return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(
        v,
      )
    }
    let projectInfo = {}
    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: '请选择初始化类型',
      default: TYPE_PROJECT,
      choices: [
        {
          name: '项目',
          value: TYPE_PROJECT,
        },
        {
          name: '组件',
          value: TYPE_COMPONENT,
        },
      ],
    })
    if (type === TYPE_PROJECT) {
      const project = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: '请输入项目名称',
          default: '',
          validate: function (v) {
            const done = this.async()

            setTimeout(function () {
              if (!isValidName(v)) {
                done('请输入合法的项目名称')
                return
              }
              done(null, true)
            }, 0)
          },
          filter: function (v) {
            return v
          },
        },
        {
          type: 'input',
          name: 'projectVersion',
          message: '请输入版本号',
          default: '1.0.0',
          validate: function (v) {
            return !!semver.valid(v)
          },
          filter: function (v) {
            if (semver.valid(v)) {
              return semver.valid(v)
            }
            return v
          },
        },
        {
          type: 'list',
          name: 'projectTemplate',
          message: '请选择项目模版',
          choices: this.getProjectChoices(),
        },
      ])
      projectInfo = {
        type,
        ...project,
      }
    } else if (type === TYPE_COMPONENT) {
    }
    return projectInfo
  }
  isCwdEmpty() {
    const localPath = process.cwd()
    let fileList = fs.readdirSync(localPath)
    fileList = fileList.filter((file) => {
      return !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
    })
    return !fileList || fileList.length <= 0
  }
  // 获取模版列表
  getProjectChoices() {
    return this.template.map((item) => ({
      value: item.npmName,
      name: item.name,
    }))
  }
}

function init(argv) {
  return new InitCommand(argv)
}

module.exports = init
module.exports.InitCommand = InitCommand
