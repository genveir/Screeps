var path = require('path');

module.exports = {
    mode: 'production',
    entry: './out/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    }
};