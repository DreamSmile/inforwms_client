const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
    productionSourceMap: false,
    devServer: {
        disableHostCheck: true,
        host: '0.0.0.0',
        port: 8080,
        proxy: {
            '/api': {
                target: 'http://192.168.35.96:8900/svr-inforwms/storage/',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            },
            '/userApi': {
                target: 'http://tm.lilanz.com/oa/project/RFID/rfidapi.ashx',
                changeOrigin: true,
                pathRewrite: {
                    '^/userApi': ''
                }
            },
            '/helpApi': {
                target: 'http://192.168.37.39:8080/info_help/',
                changeOrigin: true,
                pathRewrite: {
                    '^/helpApi': ''
                }
            }
        }
    }
}