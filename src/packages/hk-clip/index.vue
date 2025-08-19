<template>
  <div class="hk-mask" :style="wrapStyle">
    <stream ref="streamRef" :points-map="pointsMap" :width="sWidth" :height="sHeight" />
    <b-place v-if="!!pointsMap" :points-map="pointsMap" />
  </div>
</template>
<script>
export default { name: 'gv-hk-clip' };
</script>
<script setup>
import Stream from './_components/stream.vue';
import { computed, onBeforeMount, onMounted, ref, shallowRef } from 'vue';
import BPlace from './_components/b-place.vue';
import { clickLogin, clickStartRealPlay, initHKPlugin, setWindowLayout } from '@/tools/hk.js';
import { IframeMessenger } from '@/tools/iframe-message.js';
import { deepCopy, delayExec } from '@/tools/index.js';

const sWidth = 1000;
const sHeight = 560;

const wrapStyle = computed(() => {
  return { width: `${sWidth}px`, height: `${sHeight}px` };
});

const pointsMap = ref(null);
const recorderInfo = ref(null);
const streamRef = shallowRef();

const messenger = { instance: null };

// 登录
const login = async () => {
  const info = recorderInfo.value ?? {};
  await clickLogin({
    szIP: info.ip,
    szPort: String(info.port),
    szUsername: info.account,
    szPassword: info.password
  });
};

// 预览
const preview = async () => {
  const info = recorderInfo.value ?? {};
  setWindowLayout(1);
  clickStartRealPlay({
    szDeviceIdentify: `${info.ip}_${info.port}`,
    iRtspPort: window.DEVICE_PORT.iRtspPort,
    iChannelID: info.channelId,
    bZeroChannel: false,
    iStreamType: 1,
    windowIndex: 0
  });
};

onMounted(() => {
  initHKPlugin();
  messenger.instance = new IframeMessenger({
    targetWindow: window.parent,
    targetOrigin: '*',
    debug: true
  });
  messenger.instance.send('get-recorder-info');
  messenger.instance.on('send-recorder-info', async (data) => {
    recorderInfo.value = data;
    pointsMap.value = deepCopy(data.AREA_POINTS);
    await login();
  });
  messenger.instance.on('clip-card-img', async () => {
    // await delayExec(300);
    const info = recorderInfo.value ?? {};
    streamRef.value?.handlerClip(info);
  });
  messenger.instance.on('start-preview', async () => {
    // await preview();
  });
  messenger.instance.on('stop-preview', async () => {
    // clickStopRealPlay();
  });
  messenger.instance.on('get-point-map', async () => {
    messenger.instance.send('send-point-map', deepCopy(pointsMap.value));
  });
});

onBeforeMount(() => {
  if (!!messenger.instance?.destroy) {
    messenger.instance?.destroy();
    messenger.instance = null;
  }
});
</script>
<style scoped>
.hk-mask {
  position: relative;
  width: 1000px;
  height: 560px;
  user-select: none;
  overflow: hidden;
}
</style>
