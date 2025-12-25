<template>
  <div class="scan-area">
    <div class="scan-area-box" :style="wrapStyle">
      <div id="divPlugin"></div>
      <!--   命中项   -->
      <template v-if="!originalImage">
        <hit-box :hits="hitChipList" :points-map="pointsMap" />
      </template>
      <!--   原图   -->
      <template v-if="!!originalImage">
        <div class="show-pic">
          <b-edit v-if="!!pointsMap" ref="bEditRef" :style="wrapStyle" :points-map-init="pointsMap" :bind-info-init="bindInfo" :img-src="imgSrc" />
        </div>
      </template>
      <!--   提示信息   -->
      <template v-if="clipTipsText">
        <div class="info-text">{{ clipTipsText ?? $t('common.clip.tips_scan_click') }}</div>
      </template>
    </div>
    <!--  按钮区域  -->
    <div class="button-wrap">
      <button v-if="!!originalImage" class="gv-button big mr-12" @click.stop="saveArea">{{ $t('common.clip.save_area') }}</button>
      <button class="link-button mr-12" @click.stop="toggleOriginalImage">
        {{ originalImage ? $t('common.clip.back_card') : $t('common.clip.view_hit') }}
      </button>
      <button v-if="!!clipTipsText" class="link-button" @click.stop="scanPoker">{{ $t('common.clip.rescan') }}</button>
    </div>
  </div>
</template>
<script setup>
import { clipImageByPolygon, deepCopy, generateRandomString } from '@/tools/index.js';
import { computed, inject, ref, shallowRef } from 'vue';
import BEdit from '@/packages/hk-clip/_components/b-edit.vue';
import { $t } from '@/lang/i18n.js';
import { clickCapturePicData } from '@/tools/hk.js';
import axios from 'axios';
import HitBox from '@/packages/hk-chip/_components/hit-box.vue';

const useHitKind = inject('useHitKind');
const saveHitArea = inject('saveHitArea');

const sWidth = 1000;
const sHeight = 560;

const emits = defineEmits(['setPointsMap']);

const props = defineProps({ bindInfo: Object, pointsMap: Object, width: Number, height: Number });
const imgSrc = shallowRef(null);
const bEditRef = shallowRef(null);
const clipTipsText = ref(null);
const completeTips = ref({});
const originalImage = ref(false);
const hitChipList = ref([
  {
    bbox: {
      x1: 325.5163879394531,
      x2: 741.8914184570312,
      y1: 152.8841552734375,
      y2: 566.07568359375,
      cx: 533.7039031982422,
      cy: 359.47991943359375,
      w: 416.3750305175781,
      h: 413.1915283203125,
      angle: true
    },
    score: 0.9581922292709351,
    class_name: 'chip_small',
    view: null
  },
  {
    bbox: {
      x1: 420.3887634277344,
      x2: 829.4578247070312,
      y1: 756.6889038085938,
      y2: 1172.9493408203125,
      cx: 624.9232940673828,
      cy: 964.8191223144531,
      w: 409.0690612792969,
      h: 416.26043701171875,
      angle: false
    },
    score: 0.9520618915557861,
    class_name: 'chip_small',
    view: null
  }
]);

const wrapStyle = computed(() => {
  return { width: `${sWidth}px`, height: `${sHeight}px` };
});

// 清空数据
const clearAllInfo = () => {
  clipTipsText.value = '';
  originalImage.value = false;
  imgSrc.value = null;
  completeTips.value = {};
};

// 切图
const handlerClip = (info) => {
  clearAllInfo();
  clickCapturePicData(
    info.recorder,
    info.camera,
    (base64String) => {
      const img = new Image();
      img.src = 'data:image/jpeg;base64,' + base64String;
      imgSrc.value = img.src;
      img.onerror = function () {
        clipTipsText.value = $t('common.clip.tips_img_err1');
      };
      img.onload = async function () {
        const pName = 's';
        if (!props.pointsMap[pName]) return;
        const clippedCanvas = clipImageByPolygon(img, { width: sWidth, height: sHeight }, props.pointsMap[pName].points);
        const analysis = await handlerAnalysis(clippedCanvas, info.token);
        if (!!analysis) {
          useHitItem(analysis.map((item) => ({ ...item, UUID: generateRandomString(10) })));
        } else {
          clipTipsText.value = $t('common.clip.tips_img_err2');
        }
      };
    },
    () => {
      clipTipsText.value = $t('common.clip.tips_img_err3');
    },
    true
  );
};

// 分析图片
const handlerAnalysis = (canvas, token) => {
  return new Promise((resolve) => {
    canvas.toBlob(
      function (blob) {
        // blob可直接用于上传
        const formData = new FormData();
        const scanUrl = '/chip-scan';
        formData.append('file', blob, 'canvas_image.jpg'); // 字段名需与后端一致
        axios
          .post(scanUrl, formData, {
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

// 尝试扫码
const tryScanChip = () => {
  console.log(props.bindInfo, '--------------------props.bindInfo');
  if (!props.bindInfo) return;
  handlerClip(props.bindInfo);
};

// 停止扫码
const stopScanChip = () => {};

// 使用命中项
const useHitItem = (hits) => {
  // hitChipList.value = hits;
  useHitKind(hits);
};

// 保存区域
const saveArea = () => {
  const data = deepCopy(bEditRef.value?.getPointsMap());
  saveHitArea(data, (status) => {
    if (status) {
      emits('setPointsMap', data);
      toggleOriginalImage();
    }
  });
};

// 查看原图 / 扫牌信息
const toggleOriginalImage = () => {
  originalImage.value = !originalImage.value;
};

defineExpose({ handlerClip, tryScanChip, stopScanChip, clearAllInfo });
</script>
<style scoped>
.scan-area {
  .scan-area-box {
    position: relative;
  }

  #divPlugin {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
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
