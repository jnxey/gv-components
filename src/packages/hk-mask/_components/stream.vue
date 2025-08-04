<template>
  <div class="stream" id="divPlugin"></div>
</template>
<script setup>
import { onMounted } from 'vue';
import { clickGetDigitalChannelInfo, clickStartRealPlay } from '@/packages/hk-mask/_tools/hk.js';

onMounted(() => {
  setTimeout(() => {
    clickGetDigitalChannelInfo('192.168.1.108_80', (res) => {
      console.log(res, '-------------------channels');
    });
    clickStartRealPlay({
      szDeviceIdentify: '192.168.1.108_80',
      iRtspPort: 554,
      iChannelID: 1,
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
  //background-image: url('/b-zuo-2.jpeg');
  //background-size: 100% 100%;
  z-index: 5;
}
</style>
