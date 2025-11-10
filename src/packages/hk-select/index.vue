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
import { clickLogin, clickStartRealPlay, initHKPlugin, setSelectedWindow, setWindowLayout } from '@/tools/hk.js';
import { delayExec } from '@/tools/index.js';
import { IframeCommunicator } from '@/tools/iframe-communicator.js';

const bindInfo = ref(null);

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
  let selectIndex = null;
  console.log('------------------------------------------e1');
  setWindowLayout(window.HK_CHANNEL_LIST.length);
  console.log('------------------------------------------e2');
  window.HK_CHANNEL_LIST.forEach((channel, index) => {
    if (camera.channelId === channel.id) selectIndex = index;
    clickStartRealPlay({
      szDeviceIdentify: `${recorder.ip}_${recorder.port}`,
      iRtspPort: window.DEVICE_PORT.iRtspPort,
      iChannelID: channel.id,
      bZeroChannel: false,
      iStreamType: 1,
      windowIndex: index
    });
  });
  console.log('------------------------------------------e3');
  if (selectIndex !== null) {
    setTimeout(() => {
      setSelectedWindow(selectIndex);
    }, 300);
  }
};

// 设置选中
const setSelected = (index) => {
  const selected = window.HK_CHANNEL_LIST[index];
  if (!selected) {
    messenger.instance.send('send-recorder-selected', null);
  } else {
    messenger.instance.send('send-recorder-selected', { channelId: selected.id, channelName: selected.name });
  }
};

onMounted(() => {
  initHKPlugin({ cbSelWindCallback: setSelected });
  messenger.instance = new IframeCommunicator({
    targetWindow: window.parent
  });
  messenger.instance.request('recorder-info').then(async (data) => {
    bindInfo.value = data;
    await login();
    await delayExec(300);
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
.hk-select {
  .stream {
    width: 1000px;
    height: 560px;

    .hk-selected-mark {
      border: 4px solid rgb(51.2, 126.4, 204) !important;

      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 34px;
        height: 30px;
        background-image: url('/select.png');
        background-size: 100% 100%;
      }
    }
  }
}
</style>
