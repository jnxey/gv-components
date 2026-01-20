<template>
  <div class="hk-preview">
    <div class="camera-name">{{ previewInfo.channelName }}</div>
    <video class="show-video" ref="videoRef" :controls="false" muted />
    <div class="video-mask" :class="{ active, noborder: !!hideBorder }" @click="handlerClick"></div>
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import { getChannelValue, HK_SERVER_BASE, streamHeartbeat, streamStart, streamStop } from '@/tools/hk-server.js';
import { generateRandomString } from '@/tools/index.js';

const emits = defineEmits(['click']);

const props = defineProps({ previewInfo: Object, isSmall: Boolean, active: Boolean, hideBorder: Boolean });

const videoRef = shallowRef(null);
const deviceParams = shallowRef({});
const cacheData = { hls: null, heart: null };

const init = () => {
  const info = props.previewInfo ?? {};
  const deviceId = 'NVR_' + generateRandomString(6);
  const channel = getChannelValue(info.channelId, props.isSmall);
  const rtsp = `rtsp://${info.admin}:${info.password}@${info.ip}:554/Streaming/Channels/${channel}`;
  deviceParams.value = { deviceId, channel, rtsp };
};

const preview = async () => {
  const m3u8 = await streamStart({ ...deviceParams.value });
  if (!!m3u8 && !!videoRef.value) {
    const videoUrl = HK_SERVER_BASE + m3u8;
    if (Hls.isSupported()) {
      cacheData.hls = new Hls({ liveSyncDurationCount: 2, liveMaxLatencyDurationCount: 3, maxLiveSyncPlaybackRate: 1.5 });
      cacheData.hls.loadSource(videoUrl);
      cacheData.hls.attachMedia(videoRef.value);
      cacheData.hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS.js error:', data);
      });
      cacheData.hls.on(Hls.Events.MANIFEST_PARSED, () => videoRef.value.play());
    } else {
      videoRef.src = videoUrl; // Safari
      videoRef.value.play();
    }
  }
};

const heartbeat = async () => {
  // 每10秒发送一次心跳
  cacheData.heart = setInterval(() => {
    streamHeartbeat({ ...deviceParams.value });
  }, 10000);
};

const destroyPlayer = () => {
  streamStop({ ...deviceParams.value });
  clearInterval(cacheData.heart);
  if (!!videoRef.value) {
    videoRef.value.pause();
    videoRef.value.src = '';
  }
  if (!!cacheData.hls) {
    cacheData.hls.destroy(); // 停止拉流并释放 MSE
    cacheData.hls = null;
  }
};

const handlerClick = (e) => {
  emits('click', e);
};

onMounted(() => {
  init();
  preview();
  heartbeat();
});

onBeforeUnmount(() => {
  destroyPlayer();
});
</script>
<style scoped>
.hk-preview {
  position: relative;
  box-sizing: border-box;
  width: 100%; /* 宽度随父容器改变，不固定 */
  aspect-ratio: 1920 / 1080; /* 固定宽高比 */
}

.show-video {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #4c4b4b;
  z-index: 0;
}

.video-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-shadow: 0 0 0 1px #f49e02 inset;
  z-index: 10;
}

.video-mask.active {
  box-shadow: 0 0 0 4px #028ff4 inset;
}

.video-mask.noborder {
  box-shadow: none;
}

.camera-name {
  position: absolute;
  top: 12px;
  right: 12px;
  color: #ffffff;
  font-size: 16px;
  text-shadow:
    0 0 5px #028ff4,
    0 0 10px #028ff4,
    0 0 15px #028ff4;
  z-index: 12;
}
</style>
