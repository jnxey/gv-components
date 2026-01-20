<template>
  <div class="hk-mask" :style="wrapStyle">
    <hk-preview v-if="!!deviceParams" class="preview-box" :style="wrapStyle" :preview-info="deviceParams" hide-border />
    <b-place v-if="!!pointsMap" :current="current" :points-map="pointsMap" @selected="setCurrent" />
    <template v-if="!!pointsMap && !!current">
      <b-mask :points-info="pointsMap[current]" @cancel="setCurrent" @save="setSave" />
    </template>
  </div>
</template>
<script>
export default { name: 'gv-hk-mask' };
</script>
<script setup>
import BMask from './_components/b-mask.vue';
import BPlace from './_components/b-place.vue';
import { computed, nextTick, onBeforeMount, onMounted, ref } from 'vue';
import { initHKPlugin } from '@/tools/hk.js';
import { deepCopy, getPX } from '@/tools/index.js';
import { IframeCommunicator } from '@/tools/iframe-communicator.js';
import { getPointFieldName } from '@/tools/query.js';
import HkPreview from '@/packages/_components/hk-preview.vue';

const sWidth = 1000;
const sHeight = 560;

const current = ref(null);

const wrapStyle = computed(() => {
  return { width: `${sWidth}px`, height: `${sHeight}px` };
});

const pointsMap = ref(null);
const bindInfo = ref(null);
const messenger = { instance: null };
const deviceParams = ref(null);

// 初始化
const init = () => {
  const info = bindInfo.value ?? {};
  const recorder = info.recorder ?? {};
  const camera = info.camera ?? {};
  deviceParams.value = {
    ip: recorder.ip,
    admin: recorder.account,
    password: recorder.password,
    channelName: camera.channelName,
    channelId: camera.channelId
  };
};

const setCurrent = async (p) => {
  current.value = null;
  await nextTick();
  current.value = p;
};

const setSave = (point) => {
  pointsMap.value[current.value].points = point;
  // console.log(JSON.stringify({ ...pointsMap.value }), '-----------------------SSS');
};

onMounted(() => {
  initHKPlugin();
  messenger.instance = new IframeCommunicator({
    targetWindow: window.parent
  });

  messenger.instance.request('recorder-info').then(async (data) => {
    console.log('recorder-info------');
    bindInfo.value = data;
    pointsMap.value = deepCopy(data[getPointFieldName()]);
    await init();
  });

  messenger.instance.on('get-point-map', async (_, respond) => {
    respond(deepCopy(pointsMap.value));
  });
});

onBeforeMount(() => {
  if (!!messenger.instance?.destroy) {
    messenger.instance?.destroy();
    messenger.instance = null;
  }
});
</script>
<style scoped>
.hk-mask {
  position: relative;
  width: 1000px;
  height: 560px;
  user-select: none;
  overflow: hidden;
}

.preview-box {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  background-color: #4c4b4b;
  z-index: 5;
}
</style>
