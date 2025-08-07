<template>
  <gv-hk-mask v-if="mode === 'hk_mask'" />
  <gv-hk-connection v-if="mode === 'hk_connection'" />
  <gv-hk-select v-if="mode === 'hk_select'" />
</template>
<script setup>
import GvHkMask from '@/packages/hk-mask/index.vue';
import { onBeforeMount, ref } from 'vue';
import qs from 'qs';
import GvHkConnection from '@/packages/ hk-connection/index.vue';
import GvHkSelect from '@/packages/hk-select/index.vue';

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
</style>
