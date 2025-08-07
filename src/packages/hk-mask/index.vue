<template>
  <div class="hk-mask" :style="wrapStyle">
    <stream :width="sWidth" :height="sHeight" />
    <b-place :current="current" :points="pointsMap" @selected="setCurrent" />
    <b-clip v-if="!current" :points="pointsMap" :width="sWidth" :height="sHeight" />
    <template v-if="!!current">
      <b-mask :def="pointsMap[current]" @cancel="setCurrent" @save="setSave" />
    </template>
  </div>
  <div id="image"></div>
</template>
<script>
export default { name: 'gv-hk-mask' };
</script>
<script setup>
import BMask from './_components/b-mask.vue';
import Stream from './_components/stream.vue';
import { computed, onMounted, reactive, ref } from 'vue';
import BPlace from '@/packages/hk-mask/_components/b-place.vue';
import BClip from '@/packages/hk-mask/_components/b-clip.vue';
import { clickLogin, initHKPlugin } from '@/packages/hk-mask/_tools/hk.js';

const sWidth = 1000;
const sHeight = 560;

const current = ref(null);

const wrapStyle = computed(() => {
  return { width: `${sWidth}px`, height: `${sHeight}px` };
});

const pointsMap = reactive({
  b: [
    [373, 220],
    [473, 220],
    [473, 320],
    [373, 320]
  ],
  p: [
    [515, 220],
    [615, 220],
    [615, 320],
    [515, 320]
  ]
});

const setCurrent = (p) => {
  current.value = p;
};

const setSave = (point) => {
  pointsMap[current.value] = point;
  current.value = null;
};

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
<style scoped>
.hk-mask {
  position: relative;
}
</style>
