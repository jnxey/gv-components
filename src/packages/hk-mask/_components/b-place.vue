<template>
  <div class="b-place">
    <svg ref="svgRef" width="100%" height="100%">
      <template v-for="p in pNames" :Key="p">
        <polygon
          v-if="current !== p"
          :points="getPolygonPoints(points[p])"
          fill="rgba(100, 149, 237, 0.5)"
          stroke="cornflowerblue"
          stroke-dasharray="5, 3"
          stroke-width="2"
          cursor="pointer"
          @click="setCurrent(p)"
        />
      </template>
    </svg>
  </div>
</template>
<script setup>
import { computed } from 'vue';

const emits = defineEmits(['selected']);

const props = defineProps({ points: Object, current: [String, Number] });

const pNames = computed(() => Object.keys(props.points));

const getPolygonPoints = (point) => {
  return point.map(([x, y]) => `${x},${y}`).join(' ');
};

const setCurrent = (p) => {
  emits('selected', p);
};
</script>
<style scoped>
.b-place {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 8;
  .place-box {
    position: absolute;
  }
}
</style>
