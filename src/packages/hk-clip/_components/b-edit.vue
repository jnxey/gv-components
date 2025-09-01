<template>
  <div class="b-edit">
    <b-place v-if="!!pointsMap" :current="current" :points-map="pointsMap" @selected="setCurrent" />
    <template v-if="!!pointsMap && !!current">
      <b-mask :points-info="pointsMap[current]" @cancel="setCurrent" @save="setSave" />
    </template>
    <img v-if="!!imgSrc" class="image" :src="imgSrc" alt="" />
  </div>
</template>
<script setup>
import { nextTick, onBeforeMount, ref } from 'vue';
import BPlace from '@/packages/hk-mask/_components/b-place.vue';
import BMask from '@/packages/hk-mask/_components/b-mask.vue';
import { deepCopy } from '@/tools/index.js';

const current = ref(null);

const props = defineProps({ pointsMapInit: Object, recorderInfoInit: Object, imgSrc: String });

const pointsMap = ref(null);

const recorderInfo = ref(null);

const setCurrent = async (p) => {
  current.value = null;
  await nextTick();
  current.value = p;
};

const setSave = (point) => {
  pointsMap.value[current.value].points = point;
  // console.log(JSON.stringify({ ...pointsMap.value }), '-----------------------SSS');
};

const getPointsMap = () => {
  return pointsMap.value;
};

onBeforeMount(() => {
  pointsMap.value = deepCopy(props.pointsMapInit);
  recorderInfo.value = deepCopy(props.recorderInfoInit);
});

defineExpose({ getPointsMap });
</script>
<style scoped>
.b-edit {
  position: relative;
  user-select: none;

  img {
    width: 100%;
    height: 100%;
  }
}
</style>
