<template>
  <div class="hk-select">
    <template v-for="item in deviceList" :key="item.id">
      <hk-preview class="preview-box" :active="current === item.channelId" :preview-info="item" is-small @click="setSelected(item)" />
    </template>
  </div>
</template>
<script>
export default { name: 'gv-hk-select' };
</script>
<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { IframeCommunicator } from '@/tools/iframe-communicator.js';
import { getIpcChannelsNames } from '@/tools/hk-server.js';
import HkPreview from '@/packages/_components/hk-preview.vue';

const bindInfo = ref(null);
const messenger = { instance: null };
const deviceList = ref([]);
const current = ref(null);

// 获取设备通道
const getChannels = async () => {
  deviceList.value = [];
  const info = bindInfo.value ?? {};
  const recorder = info.recorder ?? {};
  const camera = info.camera ?? {};
  const loginInfo = { ip: recorder.ip, admin: recorder.account, password: recorder.password };
  current.value = Number(camera.channelId);
  getIpcChannelsNames(loginInfo)
    .then((res) => {
      deviceList.value = res?.map((item) => ({ ...loginInfo, channelName: item.name, channelId: item.id }));
    })
    .catch(() => {
      deviceList.value = [];
    });
};

// 设置选中
const setSelected = (item) => {
  if (!current.value === item.channelId) {
    current.value = null;
    messenger.instance.send('send-recorder-selected', null);
  } else {
    current.value = item.channelId;
    messenger.instance.send('send-recorder-selected', { channelId: item.channelId, channelName: item.channelName });
  }
};

onMounted(() => {
  messenger.instance = new IframeCommunicator({
    targetWindow: window.parent
  });
  messenger.instance.request('recorder-info').then(async (data) => {
    bindInfo.value = data;
    await getChannels();
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
.hk-select {
  display: flex;
  flex-direction: row;
  align-items: start;
  width: 1000px;
  height: 560px;
}

.preview-box {
  width: 33%;
  cursor: pointer;
}
</style>
