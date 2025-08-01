<template>
  <div class="mask-svg-container">
    <svg
      ref="svgRef"
      :width="svgWidth"
      :height="svgHeight"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="stopDrag"
      @mouseleave="stopDrag"
      @wheel.prevent="onWheel"
    >
      <!-- 可拖拽的矩形 -->
      <rect
        ref="rectRef"
        :x="rect.x"
        :y="rect.y"
        :width="rect.width"
        :height="rect.height"
        fill="rgba(66, 135, 245, 0.3)"
        stroke="#4287f5"
        stroke-width="2"
      />

      <!-- 四个控制点 -->
      <circle
        v-for="(point, index) in controlPoints"
        :key="index"
        :cx="point.cx"
        :cy="point.cy"
        r="8"
        fill="#ff7043"
        stroke="white"
        stroke-width="2"
        @mousedown="startPointDrag(index, $event)"
        class="control-point"
      />
    </svg>

    <div class="controls">
      <button @click="zoomIn">放大 +</button>
      <button @click="zoomOut">缩小 -</button>
      <button @click="reset">重置</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';

// SVG容器尺寸
const svgWidth = ref(800);
const svgHeight = ref(450);
const svgRef = ref(null);

// 矩形初始状态
const rect = reactive({
  x: 200,
  y: 150,
  width: 400,
  height: 300
});

// 控制点位置计算（矩形的四个角）
const controlPoints = computed(() => [
  { cx: rect.x, cy: rect.y }, // 左上角
  { cx: rect.x + rect.width, cy: rect.y }, // 右上角
  { cx: rect.x, cy: rect.y + rect.height }, // 左下角
  { cx: rect.x + rect.width, cy: rect.y + rect.height } // 右下角
]);

// 拖拽状态
const isDragging = ref(false);
const isPointDragging = ref(false);
const dragStart = reactive({ x: 0, y: 0 });
const currentPointIndex = ref(-1);
const zoomLevel = ref(1);

// 开始整体拖拽
const startDrag = (event) => {
  if (event.target.tagName !== 'rect') return;

  isDragging.value = true;
  dragStart.x = event.clientX - rect.x;
  dragStart.y = event.clientY - rect.y;
};

// 开始控制点拖拽
const startPointDrag = (index, event) => {
  isPointDragging.value = true;
  currentPointIndex.value = index;
  dragStart.x = event.clientX;
  dragStart.y = event.clientY;
  event.stopPropagation();
};

// 拖拽过程
const onDrag = (event) => {
  if (!isDragging.value && !isPointDragging.value) return;

  if (isDragging.value) {
    // 整体移动矩形
    rect.x = event.clientX - dragStart.x;
    rect.y = event.clientY - dragStart.y;
  } else if (isPointDragging.value) {
    // 改变矩形形状
    const dx = event.clientX - dragStart.x;
    const dy = event.clientY - dragStart.y;

    switch (currentPointIndex.value) {
      case 0: // 左上角
        rect.x += dx;
        rect.y += dy;
        rect.width -= dx;
        rect.height -= dy;
        break;
      case 1: // 右上角
        rect.y += dy;
        rect.width += dx;
        rect.height -= dy;
        break;
      case 2: // 左下角
        rect.x += dx;
        rect.width -= dx;
        rect.height += dy;
        break;
      case 3: // 右下角
        rect.width += dx;
        rect.height += dy;
        break;
    }

    dragStart.x = event.clientX;
    dragStart.y = event.clientY;
  }
};

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false;
  isPointDragging.value = false;
};

// 缩放控制
const onWheel = (event) => {
  const delta = event.deltaY > 0 ? 0.9 : 1.1;
  zoomLevel.value = Math.max(0.5, Math.min(zoomLevel.value * delta, 3));
  applyZoom();
};

const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value + 0.2, 3);
  applyZoom();
};

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value - 0.2, 0.5);
  applyZoom();
};

const applyZoom = () => {
  if (svgRef.value) {
    svgRef.value.style.transform = `scale(${zoomLevel.value})`;
    svgRef.value.style.transformOrigin = 'top left';
  }
};

// 重置
const reset = () => {
  rect.x = 200;
  rect.y = 150;
  rect.width = 400;
  rect.height = 300;
  zoomLevel.value = 1;
  applyZoom();
};

onMounted(() => {
  applyZoom();
});
</script>

<style scoped>
.mask-svg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid #eee;
  z-index: 10;
}

svg {
  cursor: move;
  transition: transform 0.2s;
}

rect {
  cursor: move;
}

.control-point {
  cursor: nwse-resize;
}

.control-point:nth-child(1) {
  cursor: nw-resize;
} /* 左上 */
.control-point:nth-child(2) {
  cursor: ne-resize;
} /* 右上 */
.control-point:nth-child(3) {
  cursor: sw-resize;
} /* 左下 */
.control-point:nth-child(4) {
  cursor: se-resize;
} /* 右下 */

.controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
}

button {
  padding: 8px 16px;
  background: #4287f5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #3366cc;
}
</style>
