<template>
  <div class="b-mask">
    <!-- 控制按钮 -->
    <div class="toolbar">
      <button @click="addPoint">➕ 添加点</button>
      <button @click="removePoint" :disabled="points.length <= 3">➖ 删除点</button>
    </div>

    <!-- SVG画布 -->
    <svg
      ref="svgRef"
      width="100%"
      height="100%"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      style="border: 1px solid #ccc; display: block; width: 100%; height: 100%"
    >
      <!-- 多边形 -->
      <polygon :points="polygonPoints" fill="rgba(100, 149, 237, 0.5)" stroke="cornflowerblue" stroke-width="2" cursor="move" />

      <!-- 拖动点 -->
      <circle
        v-for="(pt, index) in points"
        :key="index"
        :cx="pt[0]"
        :cy="pt[1]"
        r="6"
        fill="white"
        stroke="cornflowerblue"
        stroke-width="2"
        cursor="pointer"
        @mousedown.stop="startDraggingPoint(index, $event)"
      />
    </svg>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const points = reactive([
  [200, 150],
  [300, 150],
  [250, 250]
]);

const draggingIndex = ref(null);
const draggingAll = ref(false);
const lastMouse = ref([0, 0]);

const svgRef = ref(null);

const polygonPoints = computed(() => points.map(([x, y]) => `${x},${y}`).join(' '));

const onMouseDown = (e) => {
  // 若点击的是polygon区域（非控制点），开启整体拖动
  if (e.target.tagName.toLowerCase() === 'polygon') {
    draggingAll.value = true;
    lastMouse.value = [e.clientX, e.clientY];
  }
};

const onMouseMove = (e) => {
  const dx = e.clientX - lastMouse.value[0];
  const dy = e.clientY - lastMouse.value[1];

  if (draggingIndex.value !== null) {
    // 拖动某个点
    points[draggingIndex.value][0] += dx;
    points[draggingIndex.value][1] += dy;
  } else if (draggingAll.value) {
    // 拖动整体
    for (let i = 0; i < points.length; i++) {
      points[i][0] += dx;
      points[i][1] += dy;
    }
  }

  lastMouse.value = [e.clientX, e.clientY];
};

const onMouseUp = () => {
  draggingIndex.value = null;
  draggingAll.value = false;
};

const startDraggingPoint = (index, e) => {
  draggingIndex.value = index;
  lastMouse.value = [e.clientX, e.clientY];
};

const addPoint = () => {
  const len = points.length;
  const [x1, y1] = points[len - 1];
  const [x2, y2] = points[0];
  const mid = [(x1 + x2) / 2, (y1 + y2) / 2];
  points.splice(len, 0, mid);
};

const removePoint = () => {
  if (points.length > 3) {
    points.pop();
  }
};
</script>

<style scoped>
.b-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}
.toolbar {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
}
button {
  margin-right: 8px;
  padding: 4px 10px;
  font-size: 14px;
  cursor: pointer;
}

svg {
  user-select: none;
}
</style>
