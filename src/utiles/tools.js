/****手机移动端弹出框alert和确认狂confirm去掉网址****/
window.alert = function (name) {
    var iframe = document.createElement("IFRAME");
    iframe.style.display = "none";
    iframe.setAttribute("src", window.location.href);
    document.documentElement.appendChild(iframe);
    window.frames[0].window.alert(name);
    iframe.parentNode.removeChild(iframe);
};

// 光标定位,当用户没有按照步骤输入数据时，光标自动定位到为空的输入框
// 使用方法：在input foucus时执行并传入该input在页面上所有input数组中的下标elIndex（需要手动传参）
export function setCursor() {
    let allInp = document.getElementsByTagName("input");
    for (let i = 0; i < allInp.length; i++) {
        if (!allInp[i].value && allInp[i].className.indexOf('no_inp') == -1) {
            allInp[i].focus();
            return
        }
    }
}

// 判断登录用户是否更换
export function hasChange() {
    let apptoken = getUrl("apptoken") || '89018329018a2e66';
    return localStorage.getItem("IM_USER_TOKEN") != apptoken ? true : false;
}
// 获得url中的参数
export function getUrl(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return unescape(r[2])
    else
        return "";
}