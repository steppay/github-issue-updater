const path = require("path");

module.exports = {
    target: 'node',
    entry: {
        'on-pull-request': './src/on-pull-request.ts',
        'on-push': './src/on-push.ts',
    },
    resolve: {
        extensions: ['.ts'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
}
