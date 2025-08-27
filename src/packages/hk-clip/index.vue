<template>
  <div class="hk-clip">
    <poker ref="pokerRef" :points-map="pointsMap" :recorder-info="recorderInfo" />
  </div>
</template>
<script>
export default { name: 'gv-hk-clip' };
</script>
<script setup>
import Poker from './_components/poker.vue';
import { onBeforeMount, onMounted, provide, ref, shallowRef } from 'vue';
import { clickLogin, initHKPlugin } from '@/tools/hk.js';
import { deepCopy } from '@/tools/index.js';
import { IframeCommunicator } from '@/tools/iframe-communicator.js';

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

// 获取命中项
const getHitKind = async (hitsItem, callback) => {
  messenger.instance.request('preview-hit-item', hitsItem ?? []).then(async (data) => {
    if (!!callback) callback(data);
  });
};

// 使用命中项
const useHitKind = async (hits, callback) => {
  messenger.instance.request('use-hit-item', hits ?? []).then(async (status) => {
    if (!!callback) callback(status);
  });
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

  messenger.instance.on('try-scan-poker', async () => {
    pokerRef.value?.tryScanPoker();
  });

  messenger.instance.on('clear-scan-poker', async () => {
    pokerRef.value?.clearAllInfo();
  });
});

onBeforeMount(() => {
  if (!!messenger.instance?.destroy) {
    messenger.instance?.destroy();
    messenger.instance = null;
  }
});

provide('getHitKind', getHitKind);
provide('useHitKind', useHitKind);
</script>
<style scoped>
.hk-clip {
  position: relative;
  width: 1000px;
  height: 640px;
  user-select: none;
  overflow: hidden;
}
</style>
