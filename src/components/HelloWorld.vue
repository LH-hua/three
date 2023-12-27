<script setup>
import { onMounted } from 'vue'
import axios from 'axios'
import Map3D from '../utils/index'

defineProps({
  msg: String,
})

onMounted(() => {
  const map = new Map3D('#content')
  axios.get('https://geo.datav.aliyun.com/areas_v3/bound/520000_full.json').then(res => {
    const jsonData = JSON.parse(JSON.stringify(res))
  map.generateGeometry(jsonData.data)

  })
})

</script>

<template>
  <div id="content">

  </div>
</template>

<style scoped>
#content{
  height: 100vh;
  width: 100vw;
}
</style>
