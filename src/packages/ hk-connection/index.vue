<template>
  <div class="hk-connection">
    <div v-if="!!recorderInfo" class="dots-loader">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
  </div>
</template>
<script>
export default { name: 'gv-hk-connection' };
</script>
<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { clickLogin, initHKPlugin } from '@/tools/hk.js';
import { deepCopy } from '@/tools/index.js';
import { IframeCommunicator } from '@/tools/iframe-communicator.js';

const recorderInfo = ref(null);

const messenger = { instance: null };

const checkConnection = () => {
  const info = recorderInfo.value ?? {};
  clickLogin({
    szIP: info.ip,
    szPort: String(info.port),
    szUsername: info.account,
    szPassword: info.password
  })
    .then(() => {
      messenger.instance.send('recorder-connection-success');
    })
    .catch(() => {
      messenger.instance.send('recorder-connection-fail');
    });
};

onMounted(() => {
  initHKPlugin();
  messenger.instance = new IframeCommunicator({
    targetWindow: window.parent
  });
  messenger.instance
    .request('recorder-info')
    .then(async (data) => {
      recorderInfo.value = data;
      checkConnection();
    })
    .catch((err) => {});
});

onBeforeMount(() => {
  if (!!messenger.instance?.destroy) {
    messenger.instance?.destroy();
    messenger.instance = null;
  }
});
</script>
<style scoped>
.hk-connection {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 300px;
  height: 200px;
}

.dots-loader {
  display: flex;
  justify-content: center;
  gap: 6px; /* 点间距 */
}

.dot {
  width: 12px;
  height: 12px;
  background: #3498db;
  border-radius: 50%;
  animation: bounce 1.4s infinite; /* 弹性动画 */
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
} /* 第二点延迟 */
.dot:nth-child(3) {
  animation-delay: 0.4s;
} /* 第三点延迟 */

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  } /* 底部位置 */
  50% {
    transform: translateY(-15px);
  } /* 跳到最高点 */
}
</style>
