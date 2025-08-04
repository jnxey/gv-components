<template>
  <div class="hk-mask" :style="wrapStyle">
    <stream :width="width" :height="height" />
    <b-place :current="current" :points="defPoint" @selected="setCurrent" />
    <template v-if="!!current">
      <b-mask :def="defPoint[current]" @cancel="setCurrent" @save="setSave" />
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

const props = defineProps({ width: Number, height: Number });

const current = ref(null);

const wrapStyle = computed(() => {
  return { width: `${props.width}px`, height: `${props.height}px` };
});

const defPoint = reactive({
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
  defPoint[current.value] = point;
  current.value = null;
};
</script>
<style scoped>
.hk-mask {
  position: relative;
}
</style>
