<template>
  <div class="hk-mask" :style="wrapStyle">
    <stream :width="width" :height="height" />
    <b-place :current="current" :points="pointsMap" @selected="setCurrent" />
    <b-clip v-if="!current" :points="pointsMap" :width="width" :height="height" />
    <template v-if="!!current">
      <b-mask :def="pointsMap[current]" @cancel="setCurrent" @save="setSave" />
    </template>
  </div>
</template>
<script>
export default { name: 'gv-hk-mask' };
</script>
<script setup>
import BMask from './_components/b-mask.vue';
import Stream from './_components/stream.vue';
import { computed, reactive, ref } from 'vue';
import BPlace from '@/packages/hk-mask/_components/b-place.vue';
import BClip from '@/packages/hk-mask/_components/b-clip.vue';

const props = defineProps({ width: Number, height: Number });

const current = ref(null);

const wrapStyle = computed(() => {
  return { width: `${props.width}px`, height: `${props.height}px` };
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
</script>
<style scoped>
.hk-mask {
  position: relative;
}
</style>
