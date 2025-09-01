<template>
  <div class="b-mask no-point">
    <!-- 控制按钮 -->
    <div class="toolbar auto-point">
      <button class="gv-button mr-12" @click.stop="addPoint">{{ $t('common.mask.add_point') }}</button>
      <button class="gv-button mr-12" @click.stop="removePoint" :disabled="points.length <= 3">{{ $t('common.mask.del_point') }}</button>
      <button class="gv-button mr-12" @click.stop="setCancel">{{ $t('common.mask.cancel') }}</button>
    </div>

    <!-- SVG画布 -->
    <svg ref="svgRef" class="no-point" width="100%" height="100%" @pointerdown="onMouseDown">
      <!-- 多边形 -->
      <polygon class="auto-point" :points="polygonPoints" :fill="pointsInfo.fill" :stroke="pointsInfo.color" stroke-width="2" cursor="move" />

      <!-- 拖动点 -->
      <circle
        v-for="(pt, index) in points"
        :key="index"
        :cx="pt[0]"
        :cy="pt[1]"
        class="auto-point"
        r="6"
        fill="#ffffff"
        :stroke="pointsInfo.color"
        stroke-width="2"
        cursor="pointer"
        @pointerdown.stop="startDraggingPoint(index, $event)"
      />
      <template v-if="!!points && !!points[0]">
        <text :x="points[0][0] + 5" :y="points[0][1] - 10" font-size="16" fill="#ffffff">
          {{ pointsInfo.name }}
        </text>
      </template>
    </svg>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onBeforeMount, onBeforeUnmount, onMounted } from 'vue';
import { deepCopy } from '@/tools/index.js';
import { $t } from '@/lang/i18n.js';

const emits = defineEmits(['cancel', 'save']);

const props = defineProps({ pointsInfo: Object });

const points = reactive(deepCopy(props.pointsInfo.points));

const isDraggingNow = ref(false);
const draggingIndex = ref(null);
const draggingAll = ref(false);
const lastMouse = ref([0, 0]);

const svgRef = ref(null);

const polygonPoints = computed(() => points.map(([x, y]) => `${x},${y}`).join(' '));

const onMouseDown = (e) => {
  isDraggingNow.value = true;
  // 若点击的是polygon区域（非控制点），开启整体拖动
  if (e.target.tagName.toLowerCase() === 'polygon') {
    draggingAll.value = true;
    lastMouse.value = [e.clientX, e.clientY];
  }
};

const onMouseMove = (e) => {
  if (!isDraggingNow.value) return;
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
  if (!isDraggingNow.value) return;
  isDraggingNow.value = false;
  draggingIndex.value = null;
  draggingAll.value = false;
  setPoint();
};

const startDraggingPoint = (index, e) => {
  isDraggingNow.value = true;
  draggingIndex.value = index;
  lastMouse.value = [e.clientX, e.clientY];
};

// 添加点位
const addPoint = () => {
  const len = points.length;
  const [x1, y1] = points[len - 1];
  const [x2, y2] = points[0];
  const mid = [(x1 + x2) / 2, (y1 + y2) / 2];
  points.splice(len, 0, mid);
};

// 移除点位
const removePoint = () => {
  if (points.length > 3) {
    points.pop();
  }
};

// 取消
const setCancel = () => {
  emits('cancel', null);
};

// 保存
const setPoint = () => {
  emits('save', deepCopy(points));
};

onMounted(() => {
  window.addEventListener('pointermove', onMouseMove);
  window.addEventListener('pointerup', onMouseUp);
  window.addEventListener('pointerleave', onMouseUp);
});

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMouseMove);
  window.removeEventListener('pointerup', onMouseUp);
  window.removeEventListener('pointerleave', onMouseUp);
});
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

svg {
  user-select: none;
}

.no-point {
  pointer-events: none;
}

.auto-point {
  pointer-events: auto;
}
</style>
