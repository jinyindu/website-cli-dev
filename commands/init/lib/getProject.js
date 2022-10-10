
const request = require('@website-cli-dev/request');

module.exports = function(){
    return request({
        url: '/project/template'
    })
}