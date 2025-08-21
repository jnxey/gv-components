<template>
  <div class="poker">
    <div class="poker-box" :style="wrapStyle">
      <div id="divPlugin"></div>
      <!--   loading   -->
      <loading v-if="!!clipLoading" />
      <!--   牌型   -->
      <template v-else-if="completeInfo && !originalImage">
        <poker-baccarat
          ref="pokerBaccaratRef"
          v-if="recorderInfo.game_model === GAME_MODEL.baccarat"
          :analysis-info="completeInfo"
          :complete-tips="completeTips"
          @set-type-complete-info="setTypeCompleteInfo"
        />
      </template>
      <!--   原图   -->
      <template v-else-if="completeInfo && !!originalImage">
        <div class="show-pic">
          <b-place v-if="!!pointsMap" :points-map="pointsMap" />
          <img v-if="!!imgSrc" class="image" :src="imgSrc" alt="" />
        </div>
      </template>
      <!--   提示信息   -->
      <template v-else>
        <div class="info-text">{{ clipTipsText ?? '请点击AI识牌按钮' }}</div>
      </template>
    </div>
    <!--  按钮区域  -->
    <div class="button-wrap">
      <button v-if="!!completeInfo" class="gv-button big plain mr-12" @click.stop="toggleOriginalImage">
        {{ originalImage ? '查看牌型' : '查看原图' }}
      </button>
      <button v-if="!!completeInfo" class="gv-button big mr-12" :disabled="clipLoading" @click.stop="useHitItem">使用命中项</button>
      <button class="gv-button big" :disabled="clipLoading" @click.stop="scanPoker">AI识牌</button>
    </div>
  </div>
</template>
<script setup>
import { clickCapturePicData } from '@/tools/hk.js';
import { clipImageByPolygon } from '@/tools/index.js';
import axios from 'axios';
import { computed, inject, reactive, ref, shallowRef, unref } from 'vue';
import { GAME_MODEL } from '@/values/index.js';
import Loading from '@/components/loading.vue';
import PokerBaccarat from './poker-baccarat.vue';
import BPlace from './b-place.vue';
import { getPokerReplenish } from '@/tools/poker.js';

const useHitKind = inject('useHitKind');

const sWidth = 1000;
const sHeight = 560;

const props = defineProps({ recorderInfo: Object, pointsMap: Object, width: Number, height: Number });
const imgSrc = shallowRef(null);
const pokerBaccaratRef = shallowRef(null);
const clipLoading = ref(false);
const clipTipsText = ref(null);
const analysisInfo = ref({});
const completeInfo = ref(null);
const completeTips = ref({});
const originalImage = ref(false);

const wrapStyle = computed(() => {
  return { width: `${sWidth}px`, height: `${sHeight}px` };
});

// 清空数据
const clearAllInfo = () => {
  clipLoading.value = false;
  completeInfo.value = null;
  clipTipsText.value = '';
  originalImage.value = false;
  imgSrc.value = null;
  completeTips.value = {};
};

// 检查点位信息
const checkAllPoint = (callback) => {
  const info = unref(analysisInfo);
  let check = true;
  Object.keys(props.pointsMap).forEach(async (p) => {
    if (!info[p]) check = false;
  });
  if (check && callback) callback();
};

// 切图
const handlerClip = (info) => {
  clearAllInfo();
  clipLoading.value = true;
  clickCapturePicData(
    info,
    (base64String) => {
      const img = new Image();
      img.src = 'data:image/jpeg;base64,' + base64String;
      imgSrc.value = img.src;
      img.onerror = function () {
        clipLoading.value = false;
        clipTipsText.value = '图片加载失败，请重试或联系管理员';
      };
      img.onload = function () {
        Object.keys(props.pointsMap).forEach(async (p) => {
          const clippedCanvas = clipImageByPolygon(img, { width: sWidth, height: sHeight }, props.pointsMap[p].points);
          const analysis = await handlerAnalysis(clippedCanvas, info.token);
          if (!!analysis) {
            analysisInfo.value[p] = analysis;
            checkAllPoint(() => {
              clipLoading.value = false;
              setCompleteInfo(unref(analysisInfo));
            });
          } else {
            clipLoading.value = false;
            clipTipsText.value = '图片分析失败，请重试或联系管理员';
          }
        });
      };
    },
    () => {
      clipLoading.value = false;
      clipTipsText.value = '图片获取失败，请重试或联系管理员';
    }
  );
};

// 分析图片
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

// 扫牌
const scanPoker = () => {
  if (!props.recorderInfo) return;
  const info = props.recorderInfo ?? {};
  handlerClip(info);
};

// 使用命中项
const useHitItem = () => {
  const hits = pokerBaccaratRef.value?.getHitItem();
  useHitKind(hits);
};

// 根据返回的分析数据填入完整牌型数据
const setCompleteInfo = (aInfo) => {
  const cInfo = {};
  Object.keys(aInfo).forEach((name) => {
    let list = aInfo[name].map((item) => item.class_name);
    if (props.recorderInfo?.game_model === GAME_MODEL.baccarat) {
      list = list.slice(0, 3);
      if (list.length === 3) {
        const info = getPokerReplenish(aInfo[name].slice(0, 3));
        completeTips.value[name] = info.tipsMsg;
        list = info.result;
      }
    } else if (props.recorderInfo?.game_model === GAME_MODEL.niu_niu) {
      list = list.slice(0, 5);
    }
    cInfo[name] = list;
  });
  completeInfo.value = cInfo;
};

// 设置某个类型牌型数据
const setTypeCompleteInfo = (name, list) => {
  completeInfo.value[name] = list;
};

// 查看原图 / 扫牌信息
const toggleOriginalImage = () => {
  originalImage.value = !originalImage.value;
};

defineExpose({ handlerClip });
</script>
<style scoped>
.poker {
  .poker-box {
    position: relative;
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

  .show-pic {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 5;
  }

  .show-pic img {
    width: 100%;
    height: 100%;
  }

  .info-text {
    padding: 40px 20px;
    text-align: center;
    font-size: 20px;
    color: #8b0505;
  }

  .button-wrap {
    display: flex;
    align-items: center;
    justify-content: end;
    height: 80px;
    padding: 0 20px;
  }
}
</style>
