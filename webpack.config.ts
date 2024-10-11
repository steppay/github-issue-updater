const path = require("path");

module.exports = {
    target: 'node',
    entry: {
        'on-pull-request': './src/on-pull-request.ts',
        'on-push': './src/on-push.ts',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    externals: [],
}
