/*
* 管理本地缓存数据模块
*/

import Cache from 'web-storage-cache';

const lsCache = new Cache();
const ssCache = new Cache({ storage: "sessionStorage" });

const KEYS = {
    userInfo: 'userInfo'//登录人员信息
}

const namespace = "LEAVE_GUIDE";

for (let p in KEYS) {
    if (KEYS.hasOwnProperty(p)) {
        KEYS[p] = `${namespace}:${p}`.toUpperCase();
    }
}

class CommonStorage {
    constructor(key, exp = null, type = 'localStorage') {
        this.key = key;
        this.exp = exp;
        this.storage = (type === 'localStorage') ? lsCache : ssCache;
    }

    save(value) {
        const options = this.exp ? { exp: this.exp } : null;
        this.storage.set(this.key, value, options);
        console.log('key:');
        console.log(this.key);
    }

    load() {
        return this.storage.get(this.key)
    }

    delete() {
        this.storage.delete(this.key)
    }
}

export const cachedUserInfo = new CommonStorage(KEYS.userInfo, 0);
export { lsCache, ssCache, KEYS as cacheKeys, namespace as cacheSpace };
