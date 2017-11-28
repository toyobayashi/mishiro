const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require("path");

const option = {
    target: "electron-renderer",
    // 入口文件
    entry: "./src/index.js",
    // 出口文件
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "mishiro.min.js"
    },
    node: {
        fs: "empty"
    },
    // 加载器
    module: {
        rules: [{
            test: /\.css$/,
            exclude: /node_modules/,
            // loader: 'style-loader!css-loader'
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [{
                    loader: "css-loader",
                    options: {
                        minimize: true //css压缩
                    }
                }]
            })
        }, {
            test: /\.vue$/,
            exclude: /node_modules/,
            loader: "vue-loader",
            options: {
                loaders: {},
                extractCSS: true
                // other vue-loader options go here
            }
        }, {
            test: /\.(eot|woff|svg|woff2|ttf|otf)$/,
            exclude: /node_modules/,
            loader: "file-loader?name=./asset/font/[name].[ext]?[hash]"
        }, {
            test: /\.(png|jpg|gif)$/,
            exclude: /node_modules/,
            loader: "url-loader?limit=8192&name=./img/[name].[ext]?[hash]"
        }, {
            test: /\.mp3$/,
            exclude: /node_modules/,
            loader: "file-loader?name=./asset/sound/[name].[ext]?[hash]"
        }]
    },
    // 处理别名
    resolve: {
        alias: {
            "vue": "vue/dist/vue.js"
        }
    },
    // 插件
    plugins: [
        /* new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            output: {
                comments: false
            }
        }), */
        new ExtractTextPlugin("./mishiro.min.css"),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ]
};

module.exports = option;
