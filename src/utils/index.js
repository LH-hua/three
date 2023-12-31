import * as THREE from 'three'
// import {OJBloader} from 'three/examples/js/loaders/OBJLoader'
import * as d3 from 'd3'
class Map3D {
    constructor(node) {
        this.node = node ? document.querySelector(node) : document.body
        this.init()
    }
    init() {
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.render = new THREE.WebGLRenderer({
          antialias: true, // true/false表示是否开启反锯齿
          alpha: true, // true/false 表示是否可以设置背景色透明
          precision: 'highp', // highp/mediump/lowp 表示着色精度选择
          premultipliedAlpha: false, // true/false 表示是否可以设置像素深度（用来度量图像的分率）
          preserveDrawingBuffer: true, // true/false 表示是否保存绘图缓冲
          maxLights: 3, // 最大灯光数
          stencil: false // false/true 表示是否使用模板字体或图案
        })
        this.render.setSize(window.innerWidth, window.innerHeight)
        this.node.appendChild(this.render.domElement)
        this.addHelper()
    }
    // loadMap(url){
    //     const loader = new OJBloader()
    //     loader(url,function(data){
    //         const jsonData = JSON.parse(JSON.stringify(data))
    //         this.generateGeometry(jsonData)
    //     })
    // }
    generateGeometry(jsondata){
        // 初始化一个地图对象
        this.map = new THREE.Object3D()
        // 墨卡托投影转换
        const projection = d3
          .geoMercator()
          .center([104.0, 37.5])
          .translate([0, 0])

        jsondata.features.forEach((elem) => {
          // 定一个省份3D对象
          const province = new THREE.Object3D()
          // 每个的 坐标 数组
          const coordinates = elem.geometry.coordinates
          // 循环坐标数组
          coordinates.forEach((multiPolygon) => {
            multiPolygon.forEach((polygon) => {
              const shape = new THREE.Shape()
              const lineMaterial = new THREE.LineBasicMaterial({
                color: 'white',
              })
              const lineGeometry = new THREE.Geometry()

              for (let i = 0; i < polygon.length; i++) {
                const [x, y] = projection(polygon[i])
                if (i === 0) {
                  shape.moveTo(x, -y)
                }
                shape.lineTo(x, -y)
                lineGeometry.vertices.push(new THREE.Vector3(x, -y, 5))
              }

              const extrudeSettings = {
                depth: 10,
                bevelEnabled: false,
              }

              const geometry = new THREE.ExtrudeGeometry(
                shape,
                extrudeSettings
              )
              const material = new THREE.MeshBasicMaterial({
                color: '#2defff',
                transparent: true,
                opacity: 0.6,
              })
              const material1 = new THREE.MeshBasicMaterial({
                color: '#3480C4',
                transparent: true,
                opacity: 0.5,
              })

              const mesh = new THREE.Mesh(geometry, [material, material1])
              const line = new THREE.Line(lineGeometry, lineMaterial)
              // 将省份的属性 加进来
              province.properties = elem.properties
              province.add(mesh)
              province.add(line)
            })
          })
          this.map.add(province)
        })
        this.scene.add(this.map)
    }
    animate(){
      THREE.update()
      requestAnimationFrame(animate)
    }
    renderMap(){
        
    }
    addHelper() {
        const helper = new THREE.CameraHelper(this.camera)
        this.scene.add(helper)
    }
}
export default Map3D