<template>
  <div class="hk-mask" :style="wrapStyle">
    <stream :width="sWidth" :height="sHeight" />
    <b-place :current="current" :points="pointsMap" @selected="setCurrent" />
    <b-clip v-if="!current" :points="pointsMap" :width="sWidth" :height="sHeight" />
    <template v-if="!!current">
      <b-mask :def="pointsMap[current]" @cancel="setCurrent" @save="setSave" />
    </template>
  </div>
</template>
<script>
export default { name: 'gv-hk-mask' };
</script>
<script setup>
import BMask from './_components/b-mask.vue';
import Stream from './_components/stream.vue';
import { computed, onBeforeMount, onMounted, reactive, ref } from 'vue';
import BPlace from '@/packages/hk-mask/_components/b-place.vue';
import BClip from '@/packages/hk-mask/_components/b-clip.vue';
import { clickLogin, clickStartRealPlay, initHKPlugin, setSelectedWindow, setWindowLayout } from '@/packages/hk-mask/_tools/hk.js';
import { IframeMessenger } from '@/tools/iframe-message.js';

const sWidth = 1000;
const sHeight = 560;

const current = ref(null);

const wrapStyle = computed(() => {
  return { width: `${sWidth}px`, height: `${sHeight}px` };
});

const pointsMap = reactive({
  b: [
    [373, 220],
    [473, 220],
    [473, 320],
    [373, 320]
  ],
  p: [
    [515, 220],
    [615, 220],
    [615, 320],
    [515, 320]
  ]
});

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

const setCurrent = (p) => {
  current.value = p;
};

const setSave = (point) => {
  pointsMap[current.value] = point;
  current.value = null;
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
  overflow: hidden;
}
</style>
