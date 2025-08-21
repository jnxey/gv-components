<template>
  <div class="poker-select" v-show="isVisible"></div>
</template>
<script setup>
import { ref } from 'vue';

const isVisible = ref(false);

const open = () => {
  isVisible.value = true;
};

const close = () => {
  isVisible.value = true;
};

defineExpose({ open, close });
</script>
<style>
.poker-select {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #eeeeee;
  z-index: 100;
}
</style>
