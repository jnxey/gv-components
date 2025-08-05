<template>
  <div class="b-clip">
    <button @click="handlerClip">裁剪</button>
    <button @click="handlerAnalysis">分析</button>
  </div>
</template>
<script setup>
import { clipImageByPolygon } from '@/packages/hk-mask/_tools/index.js';
import { clickCapturePicData } from '@/packages/hk-mask/_tools/hk.js';

const props = defineProps({ points: Object, width: Number, height: Number });

const handlerClip = () => {
  clickCapturePicData(2, (base64String) => {
    const img = new Image();
    img.src = 'data:image/jpeg;base64,' + base64String;
    img.onload = function () {
      Object.keys(props.points).forEach((p) => {
        const clippedCanvas = clipImageByPolygon(img, { width: props.width, height: props.height }, props.points[p]);
        document.body.appendChild(clippedCanvas);
      });
    };
  });
};

const handlerAnalysis = () => {};
</script>
<style scoped>
.b-clip {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;

  button {
    padding: 8px 15px;
    margin-right: 8px;
    border-radius: 4px;
    cursor: pointer;
    background-color: #4caf50;
    color: white;
    border: none;
    transition: background-color 0.3s;
  }
}
</style>
