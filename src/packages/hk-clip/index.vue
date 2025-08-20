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
import { deepCopy, delayExec } from '@/tools/index.js';
import { IframeCommunicator } from '@/tools/iframe-communicator.js';

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

onMounted(() => {
  initHKPlugin();
  messenger.instance = new IframeCommunicator({
    targetWindow: window.parent
  });

  messenger.instance.ready(); // 通知已加载

  messenger.instance
    .request('recorder-info')
    .then(async (data) => {
      recorderInfo.value = data;
      pointsMap.value = deepCopy(data.AREA_POINTS);
      await login();
    })
    .catch((err) => {});

  messenger.instance.on('clip-card-img', async () => {
    const info = recorderInfo.value ?? {};
    streamRef.value?.handlerClip(info);
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
