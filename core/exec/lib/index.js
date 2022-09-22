'use strict'
const path = require('path')
const Package = require('@website-cli-dev/package')

const SETTINGS = {
  init: '@website-cli-dev/init',
}

const CACHE_DIR = 'dependencies'

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH
  let storeDir = ''
  let pkg
  const cmdObject = arguments[arguments.length - 1]
  const cmdName = cmdObject.name()
  const packageName = SETTINGS[cmdName]
  const packageVersion = 'latest'

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR)
    storeDir = path.resolve(targetPath, 'node_modules')
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    })

    if (await pkg.exstis()) {
      await pkg.update()
    } else {
      await pkg.install()
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    })
  }
  const rootFile = pkg.getRootFile()
  if(rootFile) {
    require(rootFile).apply(null, arguments)
  }
}

module.exports = exec
