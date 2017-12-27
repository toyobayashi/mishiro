const webpack = require("webpack");
const path = require("path");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

const renderer = {
    target: "electron-renderer",
    entry: {
        vendor: ["cheerio",
            "request",
            "vue",
            "vue-i18n",
            "vuex"
        ]
    },
    node: {
        __filename: false,
        __dirname: false
    },
    output: {
        path: path.join(__dirname, "./public"),
        filename: "dll.js",
        library: "dll"
    },
    plugins: [
        new UglifyJSPlugin({
            uglifyOptions: {
                ecma: 8,
                output: {
                    comments: false,
                    beautify: false
                },
                warnings: false
            }
        }),
        new webpack.DllPlugin({
            path: path.join(__dirname, "./manifest.json"),
            name: "dll"
        })
    ]
};

module.exports = renderer;
