'use strict'
const pkgDir = require('pkg-dir').sync
const path = require('path')
const fs = require('fs-extra')
const pathExists = require('path-exists').sync
const npminstall = require('npminstall')
const { isObject } = require('@website-cli-dev/utils')
const {
  getDefaultRegisty,
  getNpmLatesVersions,
} = require('@website-cli-dev/get-npm-info')

class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package类的参数不能为空1')
    }
    if (!isObject(options)) {
      throw new Error('Package类的参数必须是对象')
    }

    this.targetPath = options.targetPath
    this.storeDir = options.storeDir
    this.packageName = options.packageName
    this.packageVersion = options.packageVersion
    this.cacheFilePathPrefix = this.packageName.replace('/', '_')
  }

  async prepare() {
    if (!this.storeDir && pathExists(this.storeDir)) {
      // 创建路径
      fs.mkdirpSync(this.storeDir)
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatesVersions(this.packageName)
    }
  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`);
  }

  // 判断当前package是否存在
  async exstis() {
    if (this.storeDir) {
      await this.prepare()
      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath)
    }
  }
  // 安装package
  async install() {
    await this.prepare()
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegisty(),
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
    })
  }
  // 更新package
  async update() {
    await this.prepare()
    // 1. 获取最新的版本号
    const latestPackageVersion = await getNpmLatesVersions(this.packageName)
    // 2. 根据版本号获取路径
    const latesFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
    if (!pathExists(latesFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegisty(),
        pkgs: [{ name: this.packageName, version: latestPackageVersion }],
      })
      this.packageVersion = latestPackageVersion;
    } else {
      this.packageVersion = latestPackageVersion;
    }
  }

  // 获取入口文件的路径
  getRootFile() {
    function _getRootFile(pathFile){
      const dir = pkgDir(pathFile)
      if (dir) {
        const pkgFile = require(path.resolve(dir, 'package.json'))
        if (pkgFile && pkgFile.main) {
          return path.resolve(dir, pkgFile.main)
        }
      }
      return null
    }
    if(this.storeDir) {
      return _getRootFile(this.cacheFilePath)
    } else {
      return _getRootFile(this.targetPath)
    }
  }
}

module.exports = Package
