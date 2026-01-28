<template>
  <div class="hit-box" :style="hitBox.style">
    <div
      class="hit-item"
      v-for="det in hits"
      :class="{
        moving: moving,
        loading: !moving && !det.detail,
        error: !moving && !!det.detail && (!det.view || !chipsInfo[det.view?.code]),
        success: !moving && !!det.detail && !!det.view && !!chipsInfo[det.view?.code],
        ignore: !moving && !!det.detail && !!det.view && !!chipsInfo[det.view?.code]?.ignore
      }"
      :key="det.UUID"
      :style="{
        top: getPX(det.bbox.cy / scale.height),
        left: getPX(det.bbox.cx / scale.width),
        width: getPX(det.bbox.w / scale.width),
        height: getPX(det.bbox.h / scale.height)
      }"
    >
      <template v-if="!!det.view">
        <div v-if="!!chipsInfo[det.view?.code]" class="chip-info flex-1">
          <div class="chip-info-text amount">{{ chipsInfo[det.view?.code].icon }}{{ chipsInfo[det.view?.code].value }}</div>
          <div class="chip-info-text username">{{ chipsInfo[det.view?.code].bind || $t('common.chip.not_bind') }}</div>
        </div>
        <template v-if="!moving && !!det.detail && !!det.view && !chipsInfo[det.view?.code]">
          <div class="chip-info flex-1">
            <div class="chip-info-text">{{ $t('common.chip.not_enter') }}</div>
          </div>
        </template>
      </template>
      <template v-if="!moving && !det.view && !!det.detail">
        <div class="chip-info flex-1">
          <div class="chip-info flex-1">
            <div class="chip-info-text">{{ $t('common.chip.not_match') }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup>
import { computed, inject } from 'vue';
import { getPX } from '@/tools/index.js';
import { $t } from '@/lang/i18n.js';

const chipsDetailsMap = inject('chipsDetailsMap');

const props = defineProps({ hits: Array, scale: Object, pointsMap: Object, moving: Boolean });

const chipsInfo = computed(() => chipsDetailsMap.value ?? {});

const hitBox = computed(() => {
  const points = props.pointsMap?.['s']?.points;
  if (!points) return {};
  const minX = Math.min(...points.map((item) => item[0]));
  const maxX = Math.max(...points.map((item) => item[0]));
  const minY = Math.min(...points.map((item) => item[1]));
  const maxY = Math.max(...points.map((item) => item[1]));
  const width = maxX - minX;
  const height = maxY - minY;
  return {
    value: { top: minY, left: minX, width: width, height: height },
    style: { top: getPX(minY), left: getPX(minX), width: getPX(width), height: getPX(height) }
  };
});
</script>
<style scoped>
.hit-box {
  position: absolute;
  border: 1px dashed #ff9900;
  z-index: 10;
}

.hit-item {
  position: absolute;
  border-width: 2px;
  border-style: solid;
  color: #1f85f8;
  border-color: #1f85f8;
  transform: translate(-50%, -50%);

  .chip-info-text {
    margin-left: 4px;
    margin-right: 4px;

    &.amount {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 12px;
    }

    &.username {
      font-size: 16px;
    }
  }

  &.moving {
    border-style: dashed;
  }

  &.success {
    color: #05ed0f;
    border-color: #05ed0f;
  }

  &.error {
    color: #c60c0c;
    border-color: #c60c0c;
  }

  &.loading {
    animation: pulse-glow 1.5s linear infinite alternate;
  }

  &.ignore {
    opacity: 0;
  }
}

@keyframes pulse-glow {
  0% {
    border-color: #1f85f8;
  }
  50% {
    border-color: #66a4ea;
  }
  100% {
    border-color: #1f85f8;
  }
}
</style>
