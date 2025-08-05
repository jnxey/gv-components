<template>
  <div class="stream" id="divPlugin"></div>
</template>
<script setup>
import { onMounted } from 'vue';
import { clickStartRealPlay } from '@/packages/hk-mask/_tools/hk.js';

onMounted(() => {
  setTimeout(() => {
    clickStartRealPlay({
      szDeviceIdentify: '192.168.1.108_80',
      iRtspPort: 554,
      iChannelID: 2,
      bZeroChannel: false,
      iStreamType: 1
    });
  }, 500);
});
</script>
<style scoped>
.stream {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #4c4b4b;
  z-index: 5;
}
</style>
