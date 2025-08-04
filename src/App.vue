<template>
  <gv-hk-mask class="hk-box" :width="sWidth" :height="sHeight" />
</template>
<script setup>
import GvHkMask from '@/packages/hk-mask/index.vue';
import { onMounted } from 'vue';
import { clickLogin, initHKPlugin } from '@/packages/hk-mask/_tools/hk.js';

const sWidth = 1000;
const sHeight = 560;

onMounted(() => {
  initHKPlugin();
  clickLogin({
    szIP: '192.168.1.108',
    szPort: '80',
    szUsername: 'admin',
    szPassword: 'Xch2025@'
  });
});
</script>

<style scoped></style>
