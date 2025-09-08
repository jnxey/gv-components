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
        <poker-long-hu
          ref="pokerLongHuRef"
          v-if="recorderInfo.game_model === GAME_MODEL.long_hu"
          :analysis-info="completeInfo"
          :complete-tips="completeTips"
          @set-type-complete-info="setTypeCompleteInfo"
        />
        <poker-niu
          ref="pokerNiuRef"
          v-if="recorderInfo.game_model === GAME_MODEL.niu_niu"
          :analysis-info="completeInfo"
          :complete-tips="completeTips"
          @set-type-complete-info="setTypeCompleteInfo"
        />
      </template>
      <!--   原图   -->
      <template v-else-if="completeInfo && !!originalImage">
        <div class="show-pic">
          <b-edit
            v-if="!!pointsMap"
            ref="bEditRef"
            :style="wrapStyle"
            :points-map-init="pointsMap"
            :recorder-info-init="recorderInfo"
            :img-src="imgSrc"
          />
        </div>
      </template>
      <!--   提示信息   -->
      <template v-else>
        <div class="info-text">{{ clipTipsText ?? $t('common.clip.tips_scan_click') }}</div>
      </template>
    </div>
    <!--  按钮区域  -->
    <div class="button-wrap">
      <button v-if="!!completeInfo && !originalImage" class="gv-button big mr-12" @click.stop="useHitItem">{{ $t('common.clip.use_card') }}</button>
      <button v-if="!!completeInfo && !!originalImage" class="gv-button big mr-12" @click.stop="saveArea">{{ $t('common.clip.save_area') }}</button>
      <button v-if="!!completeInfo" class="link-button mr-12" @click.stop="toggleOriginalImage">
        {{ originalImage ? $t('common.clip.back_card') : $t('common.clip.view_hit') }}
      </button>
      <button v-if="!clipLoading" class="link-button" @click.stop="scanPoker">{{ $t('common.clip.rescan') }}</button>
    </div>
  </div>
</template>
<script setup>
import { clickCapturePicData } from '@/tools/hk.js';
import { clipImageByPolygon, deepCopy, preprocessCanvas } from '@/tools/index.js';
import axios from 'axios';
import { computed, inject, ref, shallowRef, unref } from 'vue';
import { GAME_MODEL } from '@/values/index.js';
import Loading from '@/components/loading.vue';
import PokerBaccarat from './poker-baccarat.vue';
import { getPokerReplenish } from '@/tools/poker-baccarat.js';
import PokerLongHu from '@/packages/hk-clip/_components/poker-long-hu.vue';
import PokerNiu from '@/packages/hk-clip/_components/poker-niu.vue';
import { getPokerSort } from '@/tools/poker-niu.js';
import BEdit from '@/packages/hk-clip/_components/b-edit.vue';
import { $t } from '@/lang/i18n.js';

const useHitKind = inject('useHitKind');
const saveHitArea = inject('saveHitArea');

const sWidth = 1000;
const sHeight = 560;

const emits = defineEmits(['setPointsMap']);

const props = defineProps({ recorderInfo: Object, pointsMap: Object, width: Number, height: Number });
const imgSrc = shallowRef(null);
const pokerBaccaratRef = shallowRef(null);
const pokerLongHuRef = shallowRef(null);
const pokerNiuRef = shallowRef(null);
const bEditRef = shallowRef(null);
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
        clipTipsText.value = $t('common.clip.tips_img_err1');
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
            clipTipsText.value = $t('common.clip.tips_img_err2');
          }
        });
      };
    },
    () => {
      clipLoading.value = false;
      clipTipsText.value = $t('common.clip.tips_img_err3');
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

// 若识别数据则扫拍
const tryScanPoker = () => {
  if (!!completeInfo.value) return;
  scanPoker();
};

// 使用命中项
const useHitItem = () => {
  if (props.recorderInfo.game_model === GAME_MODEL.baccarat) {
    const hits = pokerBaccaratRef.value?.getHitItem();
    useHitKind(hits);
  } else if (props.recorderInfo.game_model === GAME_MODEL.long_hu) {
    const hits = pokerLongHuRef.value?.getHitItem();
    useHitKind(hits);
  } else if (props.recorderInfo.game_model === GAME_MODEL.niu_niu) {
    const hits = pokerNiuRef.value?.getHitItem();
    useHitKind(hits);
  }
};

// 保存区域
const saveArea = () => {
  const data = deepCopy(bEditRef.value?.getPointsMap());
  saveHitArea(data, (status) => {
    console.log(status, '--------------------------status');
    if (status) {
      emits('setPointsMap', data);
      toggleOriginalImage();
    }
  });
};

// 根据返回的分析数据填入完整牌型数据
const setCompleteInfo = (aInfo) => {
  const cInfo = {};
  Object.keys(aInfo).forEach((name) => {
    const aList = aInfo[name].filter((item) => item.bbox?.length === 2);
    let list = aList.map((item) => item.class_name);
    if (props.recorderInfo?.game_model === GAME_MODEL.baccarat) {
      list = list.slice(0, 3);
      if (list.length === 3) {
        // 校验哪张是补牌
        const info = getPokerReplenish(aList.slice(0, 3));
        if (!!info.tipsMsg) completeTips.value[name] = info.tipsMsg;
        list = info.result;
      }
    } else if (props.recorderInfo?.game_model === GAME_MODEL.long_hu) {
      list = list.slice(0, 1);
    } else if (props.recorderInfo?.game_model === GAME_MODEL.niu_niu) {
      list = list.slice(0, 5);
      if (list.length === 5) {
        // 校验牌位置
        list = getPokerSort(aList.slice(0, 5));
      }
    }
    cInfo[name] = list;
  });
  completeInfo.value = cInfo;
};

// 设置某个类型牌型数据
const setTypeCompleteInfo = (name, list) => {
  const info = completeInfo.value ?? {};
  completeInfo.value = { ...info, [name]: list };
};

// 查看原图 / 扫牌信息
const toggleOriginalImage = () => {
  originalImage.value = !originalImage.value;
};

defineExpose({ handlerClip, scanPoker, tryScanPoker, clearAllInfo });
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

  .info-text {
    padding: 40px 20px;
    text-align: center;
    font-size: 20px;
    color: #8b0505;
  }

  .button-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: end;
    height: 80px;
    padding: 0 20px;

    .gv-button {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>
