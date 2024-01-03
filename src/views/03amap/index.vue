<script setup>
import { onMounted, onUnmounted } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';
import * as THREE from 'three';
// import axios from 'axios';
import test from '@/assets/json/china.json';

let container;
let map = null;
let paths;
let customCoords;
const height = 15000;
// THREE相关变量
let camera, scene, renderer;

function initLayer() {
	const layer = new AMap.GLCustomLayer({
		// 调整地图层级
		zIndex: -1,
		init: (gl) => {
			initThree(gl);
			// 第二种
			drawSide();
			// 第一种
			// drawShape()
			animate();
		},
		render: () => {
			const { near, far, fov, up, lookAt, position } = customCoords.getCameraParams();

			camera.near = near; // 近平面
			camera.far = far; // 远平面
			camera.fov = fov; // 视野范围
			camera.position.set(...position);
			camera.up.set(...up);
			camera.lookAt(...lookAt);

			// 更新相机坐标系
			camera.updateProjectionMatrix();

			renderer.render(scene, camera);

			// 这里必须执行！重新设置 three 的 gl 上下文状态
			renderer.resetState();
		},
	});
	map.add(layer);
}

function initThree(gl) {
	camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 100, 1 << 30);
	renderer = new THREE.WebGLRenderer({
		context: gl,
		antialias: true, // 抗锯齿， 默认为false 耗性能
	});
	// 自动清空画布这里必须设置为 false, 否则地图地图将无法显示
	renderer.autoClear = false;
	renderer.outputEncoding = THREE.sRGBEncoding;

	scene = new THREE.Scene();
	// 增加环境光
	const aLight = new THREE.AmbientLight(0xffffff, 0.3);
	scene.add(aLight);
}

function drawSide() {
	const arr = paths;
	// 保持闭合路线
	if (arr[0].toString() !== arr[arr.length - 1].toString()) {
		arr.push(arr[0]);
	}

	const vec3List = []; // 顶点数组
	let faceList = []; // 三角面数组
	let faceVertexUvs = []; // 面的UV层队列，用于纹理和几何信息映射

	const t0 = [0, 0];
	const t1 = [1, 0];
	const t2 = [1, 1];
	const t3 = [0, 1];

	for (let i = 0; i < arr.length; i++) {
		const [x1, y1] = arr[i];
		vec3List.push([x1, y1, -height]);
		vec3List.push([x1, y1, 0]);
	}
	console.log('🚀 ~ file: gdAndThree.html:182 ~ drawSide ~ vec3List', vec3List);

	for (let i = 0; i < vec3List.length - 2; i++) {
		if (i % 2 === 0) {
			// 下三角
			faceList = [...faceList, ...vec3List[i], ...vec3List[i + 2], ...vec3List[i + 1]];
			// UV
			faceVertexUvs = [...faceVertexUvs, ...t0, ...t1, ...t3];
		} else {
			// 上三角
			faceList = [...faceList, ...vec3List[i], ...vec3List[i + 1], ...vec3List[i + 2]];
			// UV
			faceVertexUvs = [...faceVertexUvs, ...t3, ...t1, ...t2];
		}
	}

	const geometry = new THREE.BufferGeometry();
	// 顶点三角面
	geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(faceList), 3));
	// UV面
	geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(faceVertexUvs), 2));
	const material = new THREE.MeshBasicMaterial({
		color: '#3F9FF3',
		side: THREE.DoubleSide,
		transparent: true,
		depthWrite: true,
	});
	// const materialSide = new THREE.ShaderMaterial({
	// 	uniforms: {
	// 		color1: {
	// 			value: new THREE.Color('#3F9FF3'),
	// 		},
	// 		color2: {
	// 			value: new THREE.Color('#266BF0'),
	// 		},
	// 	},
	// 	vertexShader: `
	// 					varying vec2 vUv;
	// 					void main() {
	// 					vUv = uv;
	// 					gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
	// 					}
	// 				`,
	// 	fragmentShader: `
	// 					uniform vec3 color1;
	// 					uniform vec3 color2;
	// 					varying vec2 vUv;
	// 					void main() {
	// 						gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
	// 					}
	// 				`,
	// 	wireframe: true,
	// });
	const sideMesh = new THREE.Mesh(geometry, material);
	scene.add(sideMesh);
}

function animate() {
	if (map) {
		map.render();
	}
	requestAnimationFrame(() => {
		animate();
	});
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

onMounted(() => {
	AMapLoader.load({
		key: '612ecc7447a8365a652abc4bce83cc0a', //
		version: '2.0',
		plugins: [], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
	}).then((AMap) => {
		// axios.get('https://geo.datav.aliyun.com/areas_v3/bound/geojson', { params: { code: 100000 } }).then((res) => {});
		container = document.getElementById('container');
		map = new AMap.Map('container', {
			center: [106.713478, 26.578343],
			zooms: [2, 20],
			mask: test.features[0].geometry.coordinates,
			zoom: 9,
			viewMode: '3D',
			pitch: 70,
			layers: [new AMap.TileLayer.Satellite()],
		});
		const SkyLayer = map.getLayers().find((i) => i.CLASS_NAME == 'AMap.SkyLayer');
		console.log(SkyLayer);
		console.log(map);
		map.on('complete', () => {
			customCoords = map.customCoords;
			let path = test.features[0].geometry.coordinates[0];
			paths = customCoords.lngLatsToCoords(path)[0];
			initLayer();
			window.addEventListener('resize', onWindowResize);
		});
	});
});

onUnmounted(() => {
	map?.destroy();
});
</script>

<template>
	<div id="container"></div>
</template>

<style scoped>
#container {
	width: 100vw;
	height: 100vh;
	background: url('/image/bg.jpg');
	background-repeat: no-repeat;
	background-size: cover;
}
</style>
