import AMapLoader from "@amap/amap-jsapi-loader";
class amap {
    constructor() {
        this.loadding()
    }
    loadding() {
        AMapLoader.load({
            key: "612ecc7447a8365a652abc4bce83cc0a", // 申请好的Web端开发者Key，首次调用 load 时必填
            version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: [], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
        }).then(AMap => {
            console.log(AMap)
            window.AMap = AMap
        })
    }
}

export default amap