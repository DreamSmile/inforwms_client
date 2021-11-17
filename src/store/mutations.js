
import * as types from './mutation-types'
const mutations = {
    [types.SET_USER_INFO](state, userInfo) {
        state.userInfo = userInfo;
    },
    [types.SET_USER_TOKEN](state, token) {
        state.userToken = token;
    },
}

export default mutations;