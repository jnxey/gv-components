<template>
  <div class="hk-mask" :style="wrapStyle">
    <stream :width="sWidth" :height="sHeight" />
    <b-place v-if="!!pointsMap" :current="current" :points-map="pointsMap" @selected="setCurrent" />
    <b-clip v-if="!!pointsMap && !current" :points-map="pointsMap" :width="sWidth" :height="sHeight" />
    <template v-if="!!pointsMap && !!current">
      <b-mask :points-info="pointsMap[current]" @cancel="setCurrent" @save="setSave" />
    </template>
  </div>
</template>
<script>
export default { name: 'gv-hk-mask' };
</script>
<script setup>
import BMask from './_components/b-mask.vue';
import Stream from './_components/stream.vue';
import { computed, nextTick, onBeforeMount, onMounted, ref } from 'vue';
import BPlace from '@/packages/hk-mask/_components/b-place.vue';
import BClip from '@/packages/hk-mask/_components/b-clip.vue';
import { clickLogin, clickStartRealPlay, initHKPlugin, setWindowLayout } from '@/packages/hk-mask/_tools/hk.js';
import { IframeMessenger } from '@/tools/iframe-message.js';
import { deepCopy } from '@/tools/index.js';

const sWidth = 1000;
const sHeight = 560;

const current = ref(null);

const wrapStyle = computed(() => {
  return { width: `${sWidth}px`, height: `${sHeight}px` };
});

const pointsMap = ref(null);

const recorderInfo = ref(null);

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

const setCurrent = async (p) => {
  current.value = null;
  await nextTick();
  current.value = p;
};

const setSave = (point) => {
  pointsMap.value[current.value].points = point;
  // current.value = null;
  // window.SSS = { ...pointsMap.value };
  // console.log(JSON.stringify(window.SSS), '-----------------------SSS');
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
    await preview();
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
