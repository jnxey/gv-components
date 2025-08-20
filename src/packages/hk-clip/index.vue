<template>
  <div class="hk-clip">
    <poker ref="pokerRef" :style="wrapStyle" :points-map="pointsMap" :width="sWidth" :height="sHeight" />
    <div class="button-wrap">
      <button class="gv-button big" @click.stop="scanPoker">扫牌</button>
    </div>
  </div>
</template>
<script>
export default { name: 'gv-hk-clip' };
</script>
<script setup>
import Poker from './_components/poker.vue';
import { computed, onBeforeMount, onMounted, ref, shallowRef } from 'vue';
import { clickLogin, initHKPlugin } from '@/tools/hk.js';
import { deepCopy } from '@/tools/index.js';
import { IframeCommunicator } from '@/tools/iframe-communicator.js';

const sWidth = 1000;
const sHeight = 560;

const wrapStyle = computed(() => {
  return { width: `${sWidth}px`, height: `${sHeight}px` };
});

const pointsMap = ref(null);
const recorderInfo = ref(null);
const pokerRef = shallowRef();

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

// 扫拍
const scanPoker = () => {
  if (!recorderInfo.value) return;
  const info = recorderInfo.value ?? {};
  pokerRef.value?.handlerClip(info);
};

onMounted(() => {
  initHKPlugin();
  messenger.instance = new IframeCommunicator({
    targetWindow: window.parent
  });

  messenger.instance.ready(); // 通知已加载

  messenger.instance.request('recorder-info').then(async (data) => {
    recorderInfo.value = data;
    pointsMap.value = deepCopy(data.AREA_POINTS);
    await login();
  });

  messenger.instance.on('clip-card-img', async () => {
    const info = recorderInfo.value ?? {};
    pokerRef.value?.handlerClip(info);
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
.hk-clip {
  position: relative;
  width: 1000px;
  height: 640px;
  user-select: none;
  overflow: hidden;

  .button-wrap {
    display: flex;
    align-items: center;
    justify-content: end;
    height: 80px;
    padding: 0 20px;
  }
}
</style>
