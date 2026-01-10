<template>
  <div class="hk-clip">
    <poker ref="pokerRef" auto-select :points-map="pointsMap" :bind-info="bindInfo" @set-points-map="setPointsMap" />
  </div>
</template>
<script>
export default { name: 'gv-hk-clip' };
</script>
<script setup>
import Poker from './_components/poker.vue';
import { onBeforeMount, onMounted, provide, ref, shallowRef } from 'vue';
import { clickLogin, clickStartRealPlay, clickStopRealPlay, initHKPlugin, setWindowLayout } from '@/tools/hk.js';
import { deepCopy, delayExec } from '@/tools/index.js';
import { IframeCommunicator } from '@/tools/iframe-communicator.js';
import { getPointFieldName } from '@/tools/query.js';

const pointsMap = ref(null);
const bindInfo = ref(null);
const pokerRef = shallowRef();

const messenger = { instance: null };

// 登录
const login = async () => {
  const info = bindInfo.value ?? {};
  const recorder = info.recorder ?? {};
  await clickLogin({
    szIP: recorder.ip,
    szPort: String(recorder.port),
    szUsername: recorder.account,
    szPassword: recorder.password
  });
};

// 预览
const preview = async () => {
  const info = bindInfo.value ?? {};
  const recorder = info.recorder ?? {};
  const camera = info.camera ?? {};
  setWindowLayout(1);
  clickStartRealPlay({
    szDeviceIdentify: `${recorder.ip}_${recorder.port}`,
    iRtspPort: window.DEVICE_PORT.iRtspPort,
    iChannelID: camera.channelId,
    bZeroChannel: false,
    iStreamType: 1,
    windowIndex: 0
  });
};

// 停止预览
const unpreview = async () => {
  clickStopRealPlay();
};

// 获取命中项
const getHitKind = async (hitsItem, callback) => {
  messenger.instance.request('preview-hit-item', hitsItem ?? []).then(async (data) => {
    if (!!callback) callback(data);
  });
};

// 使用命中项
const useHitKind = async (hits, isAuto, callback) => {
  if (!!isAuto && !hits?.length) {
    // 自动扫且无数据，再扫一遍
    return pokerRef.value?.tryScanPoker(false);
  }
  messenger.instance.request('use-hit-item', hits ?? []).then(async (status) => {
    if (!!callback) callback(status);
  });
};

// 保存区域
const saveHitArea = async (data, callback) => {
  messenger.instance.request('save-hit-area', data).then(async (status) => {
    if (!!callback) callback(status);
  });
};

onMounted(() => {
  initHKPlugin();
  messenger.instance = new IframeCommunicator({
    mark: 'scan-card',
    targetWindow: window.parent
  });

  messenger.instance.ready(); // 通知已加载

  messenger.instance.request('recorder-info').then(async (data) => {
    bindInfo.value = deepCopy(data);
    pointsMap.value = deepCopy(data[getPointFieldName()]);
    await login();
  });

  messenger.instance.on('try-scan-poker', async () => {
    preview();
    await delayExec(500);
    pokerRef.value?.tryScanPoker();
  });

  messenger.instance.on('stop-scan-poker', async () => {
    unpreview();
  });

  messenger.instance.on('clear-scan-poker', async () => {
    pokerRef.value?.clearAllInfo();
  });
});

const setPointsMap = (data) => {
  pointsMap.value = deepCopy(data);
};

onBeforeMount(() => {
  if (!!messenger.instance?.destroy) {
    messenger.instance?.destroy();
    messenger.instance = null;
  }
});

provide('getHitKind', getHitKind);
provide('useHitKind', useHitKind);
provide('saveHitArea', saveHitArea);
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
