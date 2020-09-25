var path = require('path');
var localConfig = require('./localconfig.json')

module.exports = {
    mode: 'production',
    entry: './out/main.js',
    output: {
        path: localConfig.dist,
        filename: 'main.js'
    }
};