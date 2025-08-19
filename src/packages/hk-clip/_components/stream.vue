<template>
  <div class="stream">
    <div id="divPlugin"></div>
    <img class="image" :src="imgSrc" alt="" />
  </div>
</template>
<script setup>
import { clickCapturePicData } from '@/tools/hk.js';
import { clipImageByPolygon } from '@/tools/index.js';
import axios from 'axios';
import { shallowRef } from 'vue';

const props = defineProps({ pointsMap: Object, width: Number, height: Number });
const imgSrc = shallowRef();

const handlerClip = (info) => {
  console.log(info, '----------------------clip-card-img');
  clickCapturePicData(info, (base64String) => {
    const img = new Image();
    img.src = 'data:image/jpeg;base64,' + base64String;
    imgSrc.value = img.src;
    img.onload = function () {
      console.log(img, '-------------------------------img');
      Object.keys(props.pointsMap).forEach((p) => {
        const clippedCanvas = clipImageByPolygon(img, { width: props.width, height: props.height }, props.pointsMap[p].points);
        handlerAnalysis(clippedCanvas, info.token);
      });
    };
  });
};

const handlerAnalysis = (canvas, token) => {
  canvas.toBlob(
    function (blob) {
      // blob可直接用于上传
      const formData = new FormData();
      formData.append('file', blob, 'canvas_image.jpg'); // 字段名需与后端一致

      axios
        .post('/adminapi/pokerCamera/predict', formData, {
          headers: { 'Content-Type': 'multipart/form-data', token: token } // 必须设置[9](@ref)
        })
        .then((response) => {
          console.log(response.data.data, '-----------------------1');
        })
        .catch((error) => console.error('上传失败'));
    },
    'image/jpeg',
    0.8
  );
};

defineExpose({ handlerClip });
</script>
<style scoped>
.stream {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #4c4b4b;
  z-index: 5;

  .image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 10;
  }

  #divPlugin {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    opacity: 0;
    z-index: 0;
  }
}
</style>
