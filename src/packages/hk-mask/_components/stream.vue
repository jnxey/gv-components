<template>
  <iframe src="http://localhost:8090/video/index.html"></iframe>
</template>
<script setup>
import { onMounted } from 'vue';
import { clickGetDigitalChannelInfo, clickStartRealPlay } from '@/packages/hk-mask/_tools/hk.js';

onMounted(() => {});
</script>
<style scoped>
.stream {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  //background-image: url('/b-zuo-2.jpeg');
  //background-size: 100% 100%;
  z-index: 5;
}
</style>
