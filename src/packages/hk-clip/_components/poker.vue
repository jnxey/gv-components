<template>
  <div class="poker">
    <div id="divPlugin"></div>
    <loading v-if="!!clipLoading" />
    <!--    <div class="show-pic">-->
    <!--      <b-place v-if="!!pointsMap" :points-map="pointsMap" />-->
    <!--      <img v-if="imgSrc" class="image" :src="imgSrc" alt="" />-->
    <!--    </div>-->
  </div>
</template>
<script setup>
import { clickCapturePicData } from '@/tools/hk.js';
import { clipImageByPolygon } from '@/tools/index.js';
import axios from 'axios';
import { reactive, ref, shallowRef, unref } from 'vue';
import Loading from '@/components/loading.vue';

const props = defineProps({ pointsMap: Object, width: Number, height: Number });
const imgSrc = shallowRef();
const clipLoading = ref(false);
const clipErrorTips = ref(null);
const analysisInfo = ref({});

const checkAllPoint = (callback) => {
  const info = unref(analysisInfo);
  let check = true;
  Object.keys(props.pointsMap).forEach(async (p) => {
    if (!info[p]) check = false;
  });
  if (check && callback) callback();
};

const handlerClip = (info) => {
  clipLoading.value = true;
  clickCapturePicData(
    info,
    (base64String) => {
      const img = new Image();
      img.src = 'data:image/jpeg;base64,' + base64String;
      imgSrc.value = img.src;
      img.onerror = function () {
        clipLoading.value = false;
        clipErrorTips.value = '图片加载失败，请重试或联系管理员';
      };
      img.onload = function () {
        Object.keys(props.pointsMap).forEach(async (p) => {
          const clippedCanvas = clipImageByPolygon(img, { width: props.width, height: props.height }, props.pointsMap[p].points);
          const analysis = await handlerAnalysis(clippedCanvas, info.token);
          if (!!analysis) {
            analysisInfo.value[p] = analysis;
            checkAllPoint(() => {
              clipLoading.value = false;
              clipErrorTips.value = '';
              // ToDo
              console.log(analysisInfo.value, '------------------success');
            });
          } else {
            clipLoading.value = false;
            clipErrorTips.value = '图片分析失败，请重试或联系管理员';
          }
        });
      };
    },
    () => {
      clipLoading.value = false;
      clipErrorTips.value = '图片获取失败，请重试或联系管理员';
    }
  );
};

const handlerAnalysis = (canvas, token) => {
  return new Promise((resolve) => {
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
            resolve(response.data.data);
          })
          .catch((error) => {
            resolve(null);
          });
      },
      'image/jpeg',
      0.8
    );
  });
};

defineExpose({ handlerClip });
</script>
<style scoped>
.poker {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 5;

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
