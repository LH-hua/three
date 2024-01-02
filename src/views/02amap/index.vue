<template>
	<div id="map"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import { ThreeAmap } from './index.js';
import axios from 'axios';

onMounted(() => {
	// const div = document.querySelector('#map')
	axios.get('https://geo.datav.aliyun.com/areas_v3/bound/geojson', {params:{ code: 520000 }}).then((res) => {
		const map = new ThreeAmap('map',res.data);
		map.init();
	});
});
</script>

<style scoped>
#map {
	height: 100vh;
	width: 100vw;
}
</style>
