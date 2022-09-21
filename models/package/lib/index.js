'use strict';
const pkgDir = require('pkg-dir').sync
const path = require('path')
const { isObject } = require("@website-cli-dev/utils")

class Package{
    constructor(options){
        if(!options) {
            throw new Error('Package类的参数不能为空')
        }
        if(!isObject(options)) {
            throw new Error('Package类的参数必须是对象')
        }
        
        this.targetPath = options.targetPath
        this.storePath = options.storePath
        this.packageName = options.packageName
        this.packageVersion = options.packageVersion
    }

    // 判断当前package是否存在
    exstis(){

    }
    // 安装package
    install(){

    }
    // 更新package
    update(){}

    // 获取入口文件的路径
    getRootFile(){
        const dir = pkgDir(this.targetPath)
        if(dir) {
            const pkgFile = require(path.resolve(dir,'package.json'))
            if(pkgFile && pkgDir.main) {
                return path.resolve(dir,pkgFile.main)
            }
        }
        return null
    }
}

module.exports = Package;

