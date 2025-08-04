<template>
  <div class="b-clip">
    <button @click="handlerClip">裁剪</button>
  </div>
</template>
<script setup>
import { clipImageByPolygon } from '@/packages/hk-mask/_tools/index.js';

const props = defineProps({ points: Object, width: Number, height: Number });

const handlerClip = () => {
  const img = new Image();
  img.src = '/b-zuo-2.jpeg';

  img.onload = function () {
    Object.keys(props.points).forEach((p) => {
      const clippedCanvas = clipImageByPolygon(img, { width: props.width, height: props.height }, props.points[p]);
      document.body.appendChild(clippedCanvas);
    });
  };
};
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
