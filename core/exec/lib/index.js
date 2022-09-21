'use strict'

const Package = require('@website-cli-dev/package')

const SETTINGS = {
  init: '@website-cli-dev/init',
}

function exec() {
  const targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH

  const cmdObject = arguments[arguments.length - 1]
  const cmdName = cmdObject.name()
  const packageName = SETTINGS[cmdName]
  const packageVersion = 'latest'

  const pkg = new Package({
    targetPath,
    homePath,
    packageName,
    packageVersion,
  })
  console.log(pkg)
}

module.exports = exec
