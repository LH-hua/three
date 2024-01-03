<script setup>
import { onMounted, onUnmounted } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';
import test from '@/assets/json/贵州省.json';
import * as THREE from 'three';
import * as d3 from 'd3';

let container;
let map = null;
let paths;
let customCoords;
// const height = 5000;
// THREE相关变量
let camera, scene, renderer;

function initLayer() {
	const layer = new AMap.GLCustomLayer({
		// 调整地图层级
		zIndex: -1,
		init: (gl) => {
			initThree(gl);
			drawSide();
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
	const projection = d3.geoMercator().center([108.5525, 34.3227]).translate([0, 0]);
	console.log(arr);
	console.log(test.features);
	test.features.forEach((ele) => {
		const { geometry } = ele;
		geometry.coordinates.forEach((multiPolygon) => {
			multiPolygon.forEach((polygon) => {
				const shape = new THREE.Shape();
				const lineGeomtry = new THREE.BufferGeometry();
				const lineMaterial = new THREE.LineBasicMaterial({ color: 'white' });
				const vertices = [];
				polygon.forEach((item, i) => {
					const [x, y] = projection(item);
					if (i === 0) {
						shape.moveTo(x, -y);
					}
					shape.lineTo(x, -y);
					vertices.push(new THREE.Vector3(x, -y, 4.0));
				});
        console.log(vertices)
				const extrudeSettings = {
					depth: 3,
					bevelEnabled: true,
				};
				const geometry1 = new THREE.ExtrudeGeometry(shape, extrudeSettings);
				const material = new THREE.MeshBasicMaterial({
					color: '#2defff',
					transparent: true,
					opacity: 0.6,
				});
				const materialSide = new THREE.ShaderMaterial({
					uniforms: {
						color1: {
							value: new THREE.Color('#3F9FF3'),
						},
						color2: {
							value: new THREE.Color('#266BF0'),
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
					// wireframe: true,
				});
				const mesh = new THREE.Mesh(geometry1, [material, materialSide]);
				const line = new THREE.Line(lineGeomtry, lineMaterial);
				// console.log(mesh)
				scene.add(mesh);
        scene.add(line);
			});
		});
	});
	// const geometry = new THREE.BufferGeometry();
	// 顶点三角面
	// geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(faceList), 3));
	// UV面
	// geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(faceVertexUvs), 2));
	// const material = new THREE.MeshBasicMaterial({
	// 	color: '#3F9FF3',
	// 	side: THREE.DoubleSide,
	// 	transparent: true,
	// 	depthWrite: true,
	// });
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
	// const sideMesh = new THREE.Mesh(geometry, material);
	// scene.add(sideMesh);
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
		map.on('complete', () => {
			customCoords = map.customCoords;
			let path = test.features[0].geometry.coordinates[0];
			paths = customCoords.lngLatsToCoords(path)[0];
			initLayer();
			window.addEventListener('resize', onWindowResize);
			const marker = new AMap.Marker({
				icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
				position: [119.50129462, 29.63775178],
				anchor: 'bottom-center',
			});
			map.add(marker);
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
	background-color: red !important;
}
</style>
