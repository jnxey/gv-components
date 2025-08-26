<template>
  <gv-hk-mask v-if="mode === 'hk_mask'" />
  <gv-hk-connection v-if="mode === 'hk_connection'" />
  <gv-hk-select v-if="mode === 'hk_select'" />
  <gv-hk-clip v-if="mode === 'hk_clip'" />
</template>
<script setup>
import GvHkMask from '@/packages/hk-mask/index.vue';
import { onBeforeMount, ref } from 'vue';
import qs from 'qs';
import GvHkConnection from '@/packages/hk-connection/index.vue';
import GvHkSelect from '@/packages/hk-select/index.vue';
import GvHkClip from '@/packages/hk-clip/index.vue';

const mode = ref();

onBeforeMount(() => {
  const params = qs.parse(window.location.search.substring(1));
  mode.value = params.mode;
});
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}

.ml-12 {
  margin-left: 12px;
}

.mr-12 {
  margin-right: 12px;
}

.link-button {
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  color: #4caf50;
  background-color: transparent;
  border: none;
  font-size: 16px;
}

.gv-button {
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  background-color: #4caf50;
  color: white;
  border: none;
  font-size: 14px;
  transition: background-color 0.3s;
}

.gv-button.big {
  padding: 15px 20px;
  font-size: 18px;
}

.gv-button.plain {
  border: 1px solid #4caf50;
  color: #4caf50;
  background-color: white;
}

.gv-button.danger {
  border: 1px solid #f80202;
  color: #f80202;
  background-color: white;
}

.gv-button.default {
  color: #4caf50;
  border: 1px solid #4caf50;
  background-color: rgba(255, 255, 255, 0.5);
}

.gv-button:hover:not(:disabled) {
  background-color: #238c26;
}

.gv-button.plain:hover:not(:disabled) {
  background-color: rgba(76, 175, 80, 0.2);
}

.gv-button.danger:hover:not(:disabled) {
  background-color: rgba(248, 2, 2, 0.2);
}

.gv-button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.gv-button.active {
  background-color: #2e7d32;
  font-weight: bold;
}
</style>
