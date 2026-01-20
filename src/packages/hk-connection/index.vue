<template>
  <div class="hk-connection">
    <loading v-if="!!bindInfo" />
  </div>
</template>
<script>
export default { name: 'gv-hk-connection' };
</script>
<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { IframeCommunicator } from '@/tools/iframe-communicator.js';
import Loading from '@/components/loading.vue';
import { getDeviceInfo } from '@/tools/hk-server.js';

const bindInfo = ref(null);

const messenger = { instance: null };

const checkConnection = () => {
  const info = bindInfo.value ?? {};
  const recorder = info.recorder ?? {};
  getDeviceInfo({ ip: recorder.ip, admin: recorder.account, password: recorder.password })
    .then(() => {
      messenger.instance.send('recorder-connection-success');
    })
    .catch(() => {
      messenger.instance.send('recorder-connection-fail');
    });
};

onMounted(() => {
  messenger.instance = new IframeCommunicator({
    targetWindow: window.parent
  });
  messenger.instance.request('recorder-info').then(async (data) => {
    bindInfo.value = data;
    checkConnection();
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
.hk-connection {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 300px;
  height: 200px;
}
</style>
