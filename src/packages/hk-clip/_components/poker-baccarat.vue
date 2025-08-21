<template>
  <div class="poker-baccarat">
    <div class="area-box-b">
      <div class="title">B</div>
      <div class="add-btn" @click="addPoker('b')"></div>
      <template v-for="(item, index) in pokerShow.b.list" :key="index">
        <div class="poker-box" :class="[pokerShow.b.class, 'sign-' + index]">
          <img :src="`/video-recorder/poker/${item}.png`" alt="" />
        </div>
      </template>
    </div>
    <div class="area-box-p">
      <div class="title">P</div>
      <div class="add-btn" @click="addPoker('p')"></div>
      <template v-for="(item, index) in pokerShow.p.list" :key="index">
        <div class="poker-box" :class="[pokerShow.p.class, 'sign-' + index]">
          <img :src="`/video-recorder/poker/${item}.png`" alt="" />
        </div>
      </template>
    </div>
    <poker-select ref="pokerSelectRef" />
  </div>
</template>
<script setup>
import { computed, shallowRef } from 'vue';
import PokerSelect from '@/packages/hk-clip/_components/poker-select.vue';

const props = defineProps({ analysisInfo: Object });

const pokerSelectRef = shallowRef();

const pokerShow = computed(() => {
  const listMap = props.analysisInfo ?? {};
  const bList = listMap.b.slice(0, 3);
  const pList = listMap.p.slice(0, 3);
  return {
    b: { list: bList, class: 'box-n' + bList.length },
    p: { list: pList, class: 'box-n' + pList.length }
  };
});

const addPoker = () => {
  pokerSelectRef.value?.open();
};
</script>
<style>
.poker-baccarat {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
}

.poker-baccarat .area-box-b {
  position: absolute;
  top: 30px;
  left: 150px;
  width: 300px;
  height: 400px;
  border-radius: 8px;
  border: 2px solid #ff0303;
  background-color: rgba(255, 3, 3, 0.3);
}

.poker-baccarat .area-box-b .title {
  font-size: 22px;
  color: #ffffff;
  padding: 8px;
  background-color: #ff0303;
}

.poker-baccarat .area-box-p {
  position: absolute;
  top: 30px;
  right: 150px;
  width: 300px;
  height: 400px;
  border-radius: 8px;
  border: 2px solid #046ee6;
  background-color: rgba(4, 110, 230, 0.3);
}

.poker-baccarat .area-box-p .title {
  font-size: 22px;
  color: #ffffff;
  padding: 8px;
  background-color: #046ee6;
}

.poker-baccarat .poker-box {
  width: 80px;
  height: 120px;
}

.poker-baccarat .poker-box img {
  width: 100%;
  height: 100%;
}

.poker-baccarat .box-n1 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.poker-baccarat .box-n2.sign-0 {
  position: absolute;
  top: 50%;
  left: 15%;
  transform: translateY(-50%);
}

.poker-baccarat .box-n2.sign-1 {
  position: absolute;
  top: 50%;
  right: 15%;
  transform: translateY(-50%);
}

.poker-baccarat .box-n3.sign-0 {
  position: absolute;
  top: 50%;
  left: 15%;
}

.poker-baccarat .box-n3.sign-1 {
  position: absolute;
  top: 50%;
  right: 15%;
}

.poker-baccarat .box-n3.sign-2 {
  position: absolute;
  top: 16%;
  left: 50%;
  transform: translateX(-50%);
}

.poker-baccarat .add-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  background-image: url('/inc.png');
  background-size: 100% 100%;
}
</style>
