// 发运：并箱，集货发运
import { $post, $get } from './http2.js.js';
// let nowEnviroment = process.env.NODE_ENV;
// let api;
// api = nowEnviroment == "development" ? "/api" : this.$apiUrl
let api = "http://192.168.35.96:8900/svr-inforwms/storage/"
/**并箱 */
function checkXh1(data) {
    return $get(`${api}data`);
}