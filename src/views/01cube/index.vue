
<template>
    <div id="three" style="width: 100%;">
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { Line2 } from "three/examples/jsm/lines/Line2";
// import { Geometry } from 'three/examples/jsm/deprecated/Geometry';
import * as d3 from 'd3'
import axios from 'axios'
// import map from '@/utils/index'

onMounted(() => {
    cube()
    // new map()
})

function cube() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector("#three").appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    // const axesHelper = new THREE.AxesHelper(100);
    // scene.add(axesHelper);

    // const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    // const cube = new THREE.Mesh( geometry, material );
    // scene.add( cube );
    camera.position.set(-10, -90, 350);
    scene.add(controls)
    axios.get('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json').then(res => {
        const jsonData = JSON.parse(JSON.stringify(res))
        map(jsonData.data)
        console.log(jsonData.data)
    })

    function map(data) {
        console.log(data)
        const projection = d3
            .geoMercator()
            .center([108.552500, 34.322700])
            .translate([0, 0])
        data.features.forEach(ele => {
            // const { geometry, properties } = ele
            const { geometry } = ele
            // const province = new THREE.Object3D()
            geometry.coordinates.forEach(multiPolygon => {
                // const geometry = new THREE.BufferGeometry()
                multiPolygon.forEach(polygon => {
                    // console.log(polygon)
                    const shape = new THREE.Shape()
                    const lineGeomtry = new THREE.BufferGeometry()
                    const lineMaterial = new THREE.LineBasicMaterial({ color: 'white', })
                    const vertices = []
                    polygon.forEach((item, i) => {
                        const [x, y] = projection(item)
                        // console.log(x, y)
                        if (i === 0) {
                            shape.moveTo(x, -y)
                        }
                        shape.lineTo(x, -y)
                        vertices.push(new THREE.Vector3(x, -y, 4.0))
                    })
                    const extrudeSettings = {
                        depth: 3,
                        bevelEnabled: true,
                    }
                    const geometry1 = new THREE.ExtrudeGeometry(shape, extrudeSettings)
                    const material = new THREE.MeshBasicMaterial({
                        color: '#2defff',
                        transparent: true,
                        opacity: 0.6,
                    })
                    // const material1 = new THREE.MeshBasicMaterial({
                    //     color: '#3480C4',
                    //     // transparent: true,
                    //     opacity: 0.8,
                    // })
                    const materialSide = new THREE.ShaderMaterial({
                        uniforms: {
                            color1: {
                                value: new THREE.Color("#3F9FF3"),
                            },
                            color2: {
                                value: new THREE.Color("#266BF0"),
                            },
                        },
                        vertexShader: `
                            varying vec2 vUv;
                            void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                            }
                        `,
                        fragmentShader: `
                            uniform vec3 color1;
                            uniform vec3 color2;
                            varying vec2 vUv;
                            void main() {
                                gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
                            }
                            `,
                        //   wireframe: true,
                    });
                    // lineGeomtry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
                    // lineGeomtry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
                    lineGeomtry.setFromPoints(vertices)
                    const mesh = new THREE.Mesh(geometry1, [material, materialSide])
                    const line = new THREE.Line(lineGeomtry, lineMaterial)
                    // console.log(mesh)
                    scene.add(mesh)
                    scene.add(line)

                })
            })
        });
    }
    let lastPick
    const onMouseMoveEvent = function (e) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2()
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
        // console.log(mouse)
        // console.log(e)
        // console.log(e)

        raycaster.setFromCamera(mouse, camera)
        if (lastPick) {
            lastPick.object.material[0].color.set("#2defff");
            lastPick = null
        }
        const intersects = raycaster.intersectObjects(scene.children, true)
        lastPick = intersects.find(item => item.object.type == 'Mesh')
        if (lastPick) {
            if (lastPick.object.material[0]) {
                lastPick.object.material[0].color.set("#0284ff");
            }
        }

    }
    const video = () => {
        // 添加光阵视屏
        let video = document.createElement("video");
        video.src = "./video/zp2.mp4";
        video.loop = true;
        video.muted = true;
        video.play();
        const s = 6
        let videoTexture = new THREE.VideoTexture(video);
        const videoGeoPlane = new THREE.PlaneGeometry(window.innerWidth / s, window.innerHeight / s);
        const videoMaterial = new THREE.MeshBasicMaterial({
            map: videoTexture,
            transparent: true,
            side: THREE.DoubleSide,
            alphaMap: videoTexture,
        });

        const videoMesh = new THREE.Mesh(videoGeoPlane, videoMaterial);
        videoMesh.position.set(0, 0, 0);
        // videoMesh.rotation.set(-Math.PI / 2, 0, 0);
        scene.add(videoMesh);
    }
    const start = () => {
        // 使用点材质创建星空效果
        const vertices = [];

        for (let i = 0; i < 20000; i++) {
            const vertex = new THREE.Vector3();
            vertex.x = Math.floor(Math.random() * window.innerWidth) - 30;
            vertex.y = Math.floor(Math.random() * window.innerHeight);
            vertex.z = Math.floor(Math.random() * 201) - 30;
            vertices.push(vertex.x, vertex.y, vertex.z);
        }
        // 星空效果
        let starsGeometry = new THREE.BufferGeometry();
        starsGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(vertices), 3)
        );
        // 加载点材质纹理
        const starsTexture = new THREE.TextureLoader().load("./image/stars.png");
        const starsMaterial = new THREE.PointsMaterial({
            size: 0.2,
            sizeAttenuation: true, // 尺寸衰减
            // color: "#fff",
            // color: 0x4d76cf,
            transparent: true,
            opacity: 1,
            map: starsTexture,
        });

        let stars = new THREE.Points(starsGeometry, starsMaterial);
        stars.position.set(-window.innerWidth / 2, -window.innerHeight / 2, 0);
        scene.add(stars);
    }
    window.addEventListener('mousemove', onMouseMoveEvent)

    window.addEventListener('resize', function () {
        renderer.setSize(window.innerWidth, window.innerHeight)
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
    })

    function animate() {
        requestAnimationFrame(animate);
        controls.update()
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;

        renderer.render(scene, camera);
    }

    animate()
    video()
    start()
    // renderer.render(scene, camera);
}
</script>