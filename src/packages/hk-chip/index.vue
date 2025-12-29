<template>
  <div class="hk-clip">
    <scan-area ref="scanAreaRef" :points-map="pointsMap" :bind-info="bindInfo" @set-points-map="setPointsMap" />
  </div>
</template>
<script>
export default { name: 'gv-hk-chip' };
</script>
<script setup>
import { onBeforeMount, onMounted, provide, ref, shallowRef } from 'vue';
import { clickLogin, clickStartRealPlay, clickStopRealPlay, initHKPlugin, setWindowLayout } from '@/tools/hk.js';
import { deepCopy, delayExec } from '@/tools/index.js';
import { IframeCommunicator } from '@/tools/iframe-communicator.js';
import { getPointFieldName } from '@/tools/query.js';
import ScanArea from '@/packages/hk-chip/_components/scan-area.vue';

const pointsMap = ref(null);
const bindInfo = ref(null);
const scanAreaRef = shallowRef();
const filterCheck = shallowRef();
const chipsDetails = shallowRef();

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

// 使用命中项
const useHitKind = async (hits, callback) => {
  // 清空检查项
  filterCheck.value = null;
  chipsDetails.value = null;
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
    mark: 'scan-chip-camera',
    targetWindow: window.parent
  });

  messenger.instance.ready(); // 通知已加载

  messenger.instance.request('recorder-info').then(async (data) => {
    bindInfo.value = deepCopy(data);
    pointsMap.value = deepCopy(data[getPointFieldName()]);
    await login();
  });

  messenger.instance.on('try-scan-chip', async () => {
    preview();
    await delayExec(500);
    scanAreaRef.value?.tryScanChip();
  });

  messenger.instance.on('sync-filter-check', async (_filterCheck) => {
    console.log(_filterCheck, '-----------_filterCheck');
    filterCheck.value = _filterCheck;
  });

  messenger.instance.on('sync-chips-detail', async (_chipsDetails) => {
    console.log(_chipsDetails, '-----------_chipsDetails');
    chipsDetails.value = _chipsDetails;
  });

  messenger.instance.on('stop-scan-chip', async () => {
    unpreview();
    scanAreaRef.value?.stopScanChip();
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

provide('useHitKind', useHitKind);
provide('saveHitArea', saveHitArea);
provide('filterCheck', filterCheck);
provide('chipsDetails', chipsDetails);
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
