<template>
  <div class="hit-box" :style="hitBox.style">
    <div
      class="hit-item"
      v-for="det in hits"
      :key="det.UUID"
      :style="{
        top: getPX(det.bbox.cy / scale.height),
        left: getPX(det.bbox.cx / scale.width),
        width: getPX(det.bbox.w / scale.width),
        height: getPX(det.bbox.h / scale.height)
      }"
    ></div>
  </div>
</template>
<script setup>
import { computed } from 'vue';
import { getPX } from '@/tools/index.js';

const props = defineProps({ hits: Array, scale: Object, pointsMap: Object });

const hitBox = computed(() => {
  const points = props.pointsMap?.['s']?.points;
  if (!points) return {};
  const minX = Math.min(...points.map((item) => item[0]));
  const maxX = Math.max(...points.map((item) => item[0]));
  const minY = Math.min(...points.map((item) => item[1]));
  const maxY = Math.max(...points.map((item) => item[1]));
  const width = maxX - minX;
  const height = maxY - minY;
  console.log(props.hits, '-------------hits');
  return {
    value: { top: minY, left: minX, width: width, height: height },
    style: { top: getPX(minY), left: getPX(minX), width: getPX(width), height: getPX(height) }
  };
});
</script>
<style scoped>
.hit-box {
  position: absolute;
  border: 1px solid red;
  z-index: 10;
}

.hit-item {
  position: absolute;
  border: 2px solid #6fcf09;
  transform: translate(-50%, -50%);
}
</style>
