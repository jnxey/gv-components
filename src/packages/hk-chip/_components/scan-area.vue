<template>
  <div class="scan-area">
    <div class="scan-area-box" :style="wrapStyle">
      <div id="divPlugin"></div>
      <!--   命中项   -->
      <template v-if="!originalImage">
        <hit-box :hits="hitChipList" :scale="hitChipScale" :moving="!isSameNow" :points-map="pointsMap" />
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
    </div>
  </div>
</template>
<script setup>
import { clipImageByPolygon, deepCopy, generateRandomString, mappingArrayToObject, resizeCanvasByMaxSide } from '@/tools/index.js';
import { computed, inject, nextTick, reactive, ref, shallowRef, watch } from 'vue';
import BEdit from '@/packages/hk-clip/_components/b-edit.vue';
import { $t } from '@/lang/i18n.js';
import { clickCapturePicData } from '@/tools/hk.js';
import axios from 'axios';
import HitBox from '@/packages/hk-chip/_components/hit-box.vue';
import { useIsStable } from '@/packages/hk-chip/_hooks/is-stable.js';

const useHitKind = inject('useHitKind');
const saveHitArea = inject('saveHitArea');

const sWidth = 1000;
const sHeight = 560;

const emits = defineEmits(['setPointsMap']);

const props = defineProps({ bindInfo: Object, pointsMap: Object, width: Number, height: Number });
const imgSrc = shallowRef(null);
const bEditRef = shallowRef(null);
const clipTipsText = ref(null);
const originalImage = ref(false);
const hitChipScale = ref({ width: 1, height: 1 });
const hitChipList = ref([]);
const runScan = ref(false);

const wrapStyle = computed(() => {
  return { width: `${sWidth}px`, height: `${sHeight}px` };
});

const { isSameNow, clearNewList, setNewList } = useIsStable();

// 清空数据
const clearAllInfo = () => {
  hitChipList.value = [];
  hitChipScale.value = { width: 1, height: 1 };
  clipTipsText.value = '';
  originalImage.value = false;
  imgSrc.value = null;
  clearNewList();
};

// 切图
const handlerClip = (info, text = false) => {
  if (!runScan.value) return;
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
        const radioWidth = img.width / sWidth;
        const radioHeight = img.height / sHeight;
        const clippedCanvas = clipImageByPolygon(img, { width: sWidth, height: sHeight }, props.pointsMap[pName].points);
        const { canvas, scale } = resizeCanvasByMaxSide(clippedCanvas, 640);
        const analysis = await handlerAnalysis(canvas, info.token, text);
        // 如果图片过大，则缩小一点
        if (!!analysis) {
          const hList = analysis.map((item) => ({ ...item, UUID: generateRandomString(10), detail: !!text }));
          setNewList(hList);
          await nextTick();
          if (!isSameNow.value || !!text) setChipList(hList, { width: radioWidth * scale, height: radioHeight * scale });
          if (!!text) useHitItem(hList);
        } else {
          clipTipsText.value = $t('common.clip.tips_img_err2');
        }
        if (!!props.bindInfo && !text) handlerClip(props.bindInfo);
      };
    },
    () => {
      clipTipsText.value = $t('common.clip.tips_img_err3');
    },
    true
  );
};

// 分析图片
const handlerAnalysis = (canvas, token, text) => {
  return new Promise((resolve) => {
    canvas.toBlob(
      function (blob) {
        // blob可直接用于上传
        const formData = new FormData();
        const scanUrl = '/chip-scan';
        formData.append('file', blob, 'canvas_image.jpg'); // 字段名需与后端一致
        formData.append('scan_text', !!text ? 'yes' : 'no'); // 字段名需与后端一致
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
  clearAllInfo();
  runScan.value = true;
  if (!!props.bindInfo) handlerClip(props.bindInfo);
};

// 停止扫码
const stopScanChip = () => {
  runScan.value = false;
};

// 使用命中项
const setChipList = (hits, scale) => {
  hitChipList.value = hits;
  hitChipScale.value = scale;
};

// 使用命中项
const useHitItem = (hits) => {
  const chips = [];
  hits.forEach((item) => {
    if (!!item.view) chips.push(item.view.code);
  });
  useHitKind(chips);
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

watch(
  () => isSameNow.value,
  () => {
    if (isSameNow.value) {
      if (!!props.bindInfo) handlerClip(props.bindInfo, true);
    }
  }
);

defineExpose({ tryScanChip, stopScanChip, clearAllInfo });
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
