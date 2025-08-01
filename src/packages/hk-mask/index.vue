<template>
  <div class="hk-mask">
    <stream />
    <b-mask />
  </div>
</template>
<script>
export default { name: 'gv-hk-mask' };
</script>
<script setup>
import BMask from './_components/b-mask.vue';
import Stream from './_components/stream.vue';
</script>
<style scoped>
.hk-mask {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
