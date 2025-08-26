<template>
  <div class="hk-connection">
    <loading v-if="!!recorderInfo" />
  </div>
</template>
<script>
export default { name: 'gv-hk-connection' };
</script>
<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { clickLogin, initHKPlugin } from '@/tools/hk.js';
import { IframeCommunicator } from '@/tools/iframe-communicator.js';
import Loading from '@/components/loading.vue';

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
  messenger.instance.request('recorder-info').then(async (data) => {
    recorderInfo.value = data;
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
