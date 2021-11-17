import { $get } from '../http2.js';
import { getUrl, hasChange } from '../tools.js'
// import {}
let { origin, pathname } = window.location;//因为帮助文档就放在public，这边就使用相对路径
let userApi = process.env.NODE_ENV == "development" ? '/userApi' : "http://tm.lilanz.com/oa/project/RFID/rfidapi.ashx";//获取用户的接口
let help = process.env.NODE_ENV == "development" ? "http://192.168.37.39:8080/info_help/" : `./info_help/`;//帮助文档

// 获取帮助文档
export function getHelpAxios(name) {
    return $get(`${help + name}.json`)
}
// 获取用户名称
export function getUser(token) {
    let url = `${userApi}?action=getDqkhidByToken&token=${token}`;
    return $get(url)
}