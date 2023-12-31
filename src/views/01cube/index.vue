
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
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
    camera.position.set(0, 0, 130)
    scene.add(controls)
    axios.get('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json').then(res => {
        const jsonData = JSON.parse(JSON.stringify(res))
        map(jsonData.data)
    })

    function map(data) {
        console.log(data)
        const projection = d3
            .geoMercator()
            .center([106.713478, 26.578343])
            .translate([0, 0])
        data.features.forEach(ele => {
            const { geometry, properties } = ele
            console.log(properties)
            // const province = new THREE.Object3D()
            geometry.coordinates.forEach(multiPolygon => {
                // const geometry = new THREE.BufferGeometry()
                multiPolygon.forEach(polygon => {
                    // console.log(polygon)
                    const shape = new THREE.Shape()
                    const lineGeomtry = new THREE.BufferGeometry()
                    const lineMaterial = new THREE.LineBasicMaterial({
                        color: 'white',
                    })
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
                    const material1 = new THREE.MeshBasicMaterial({
                        color: '#3480C4',
                        // transparent: true,
                        opacity: 0.8,
                    })
                    // lineGeomtry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
                    // lineGeomtry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
                    lineGeomtry.setFromPoints(vertices)
                    const mesh = new THREE.Mesh(geometry1, [material, material1])
                    const line = new THREE.Line(lineGeomtry, lineMaterial)
                    // console.log(mesh)
                    scene.add(mesh)
                    scene.add(line)

                })
            })
        });
    }

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

    animate();
}
</script>