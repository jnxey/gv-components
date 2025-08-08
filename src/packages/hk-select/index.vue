<template>
  <div class="hk-select">
    <div class="stream" id="divPlugin"></div>
  </div>
</template>
<script>
export default { name: 'gv-hk-select' };
</script>
<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { IframeMessenger } from '@/tools/iframe-message.js';
import { clickLogin, clickStartRealPlay, initHKPlugin, setSelectedWindow, setWindowLayout } from '@/packages/hk-mask/_tools/hk.js';

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
  let selectIndex = null;
  setWindowLayout(window.HK_CHANNEL_LIST.length);
  window.HK_CHANNEL_LIST.forEach((channel, index) => {
    if (info.channelId === channel.id) selectIndex = index;
    clickStartRealPlay({
      szDeviceIdentify: `${info.ip}_${info.port}`,
      iRtspPort: window.DEVICE_PORT.iRtspPort,
      iChannelID: channel.id,
      bZeroChannel: false,
      iStreamType: 1,
      windowIndex: index
    });
  });
  if (selectIndex !== null) {
    setTimeout(() => {
      setSelectedWindow(selectIndex);
    }, 300);
  }
};

// 设置选中
const setSelected = (index) => {
  const selected = window.HK_CHANNEL_LIST[index];
  messenger.instance.send('send-recorder-selected', { channelId: selected.id, channelName: selected.name });
};

onMounted(() => {
  initHKPlugin({ cbSelWindCallback: setSelected });
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
<style>
.hk-selected-mark {
  border: 4px solid rgb(51.2, 126.4, 204) !important;
}
</style>
<style scoped>
.stream {
  width: 1000px;
  height: 560px;
}
</style>
