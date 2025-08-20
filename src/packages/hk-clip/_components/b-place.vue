<template>
  <div class="b-place">
    <svg ref="svgRef" width="100%" height="100%">
      <template v-for="p in pNames" :Key="p">
        <polygon
          :points="getPolygonPoints(pointsMap[p].points)"
          :fill="pointsMap[p].fill"
          :stroke="pointsMap[p].color"
          stroke-dasharray="5, 3"
          stroke-width="2"
        />
        <template v-if="!!pointsMap[p].points && !!pointsMap[p].points[0]">
          <text :x="pointsMap[p].points[0][0] + 5" :y="pointsMap[p].points[0][1] - 10" font-size="16" fill="#ffffff">
            {{ pointsMap[p].name }}
          </text>
        </template>
      </template>
    </svg>
  </div>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({ pointsMap: Object });

const pNames = computed(() => Object.keys(props.pointsMap));

const getPolygonPoints = (point) => {
  return point.map(([x, y]) => `${x},${y}`).join(' ');
};
</script>
<style scoped>
.b-place {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
}
</style>
