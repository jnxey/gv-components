<template>
  <div class="b-clip">
    <button @click="handlerClip">裁剪</button>
  </div>
</template>
<script setup>
import { clipImageByPolygon } from '@/packages/hk-mask/_tools/index.js';
import { clickCapturePicData } from '@/packages/hk-mask/_tools/hk.js';
import axios from 'axios';

const props = defineProps({ points: Object, width: Number, height: Number });

const handlerClip = () => {
  clickCapturePicData(2, (base64String) => {
    const img = new Image();
    img.src = 'data:image/jpeg;base64,' + base64String;
    img.onload = function () {
      Object.keys(props.points).forEach((p) => {
        const clippedCanvas = clipImageByPolygon(img, { width: props.width, height: props.height }, props.points[p]);
        const target = document.querySelector('#image');
        target.appendChild(clippedCanvas);
        handlerAnalysis(clippedCanvas);
      });
    };
  });
};

const handlerAnalysis = (canvas) => {
  canvas.toBlob(
    function (blob) {
      // blob可直接用于上传
      const formData = new FormData();
      formData.append('file', blob, 'canvas_image.jpg'); // 字段名需与后端一致

      axios
        .post('/adminapi/pokerCamera/predict', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            token:
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhZG1pbl9pZCI6MSwidmlzaXRvcl9pZCI6IiIsImV4cCI6MTc1NDQ2MzA3OX0=.1986b1495d99c694fa99d68845c0b8b7bdade7a27523791b3d2d5951ac7c7919'
          } // 必须设置[9](@ref)
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
