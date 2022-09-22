'use strict'

const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')

function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return null
  }
  const registryUrl = registry || getDefaultRegisty()
  const npmUrl = urlJoin(registryUrl, npmName)
  return axios.get(npmUrl).then((response) => {
    if (response.status === 200) {
      return response.data
    }
    return null
  })
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry)
  if (data) {
    return Object.keys(data.versions)
  } else {
    return []
  }
}

function getSemverVersions(baseVersion, versions) {
  versions = versions
    .filter((version) => semver.satisfies(version, `>${baseVersion}`))
    .sort((a, b) => semver.gt(b, a) ? 1 : -1)

  return versions
}
async function getNpmSemverVersions(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry)
  const newVersions = getSemverVersions(baseVersion, versions)
  if (newVersions && newVersions.length > 0) {
    return newVersions[0]
  }
}

async function getNpmLatesVersions(npmName, registry) {
  const versions = await getNpmVersions(npmName, registry)
  if(versions) {
    return versions.sort((a, b) => semver.gt(b, a))[0]
  }
  return null
}

function getDefaultRegisty(isOriginal) {
  return isOriginal
    ? 'https://registry.npmjs.org'
    : 'https://registry.npm.taobao.org'
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersions,
  getDefaultRegisty,
  getNpmLatesVersions
}
