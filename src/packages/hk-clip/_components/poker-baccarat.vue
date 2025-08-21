<template>
  <div class="poker-baccarat">
    <div class="area-box-b">
      <div class="title">B</div>
      <div v-if="pokerShow.b.showAdd" class="add-btn" @click="addPoker('b')"></div>
      <template v-for="(item, index) in pokerShow.b.list" :key="index">
        <div class="poker-box" :class="[pokerShow.b.class, 'sign-' + index]" @click="editPoker('b', index, item)">
          <img :src="`/video-recorder/poker/${item}.png`" alt="" />
        </div>
      </template>
      <div class="error-msg">{{ completeTips?.b }}</div>
    </div>
    <div class="area-box-p">
      <div class="title">P</div>
      <div v-if="pokerShow.p.showAdd" class="add-btn" @click="addPoker('p')"></div>
      <template v-for="(item, index) in pokerShow.p.list" :key="index">
        <div class="poker-box" :class="[pokerShow.p.class, 'sign-' + index]" @click="editPoker('p', index, item)">
          <img :src="`/video-recorder/poker/${item}.png`" alt="" />
        </div>
      </template>
      <div class="error-msg">{{ completeTips?.p }}</div>
    </div>
    <div v-if="!!pokerKindHit" class="check-kind">
      <div class="kind-item" v-for="item in pokerKindHit" :key="item.id">{{ item.name }}</div>
    </div>
    <poker-select ref="pokerSelectRef" />
  </div>
</template>
<script setup>
import { computed, inject, shallowRef, watch } from 'vue';
import PokerSelect from '@/packages/hk-clip/_components/poker-select.vue';
import { pokerCheckBaccarat } from '@/tools/poker.js';
import { deepCopy } from '@/tools/index.js';

const emits = defineEmits(['setTypeCompleteInfo']);

const props = defineProps({ analysisInfo: Object, completeTips: Object });

const getHitKind = inject('getHitKind');
const pokerSelectRef = shallowRef();
const pokerKindHit = shallowRef(null);

// 显示牌
const pokerShow = computed(() => {
  const listMap = props.analysisInfo ?? {};
  return {
    b: { list: listMap.b, class: 'box-n' + listMap.b.length, showAdd: listMap.b.length < 3 },
    p: { list: listMap.p, class: 'box-n' + listMap.p.length, showAdd: listMap.p.length < 3 }
  };
});

// 编辑扑克
const editPoker = (type, index, poker) => {
  pokerSelectRef.value?.open(
    poker,
    (poker) => {
      const listMap = props.analysisInfo ?? {};
      const list = [...listMap[type]];
      list[index] = poker;
      emits('setTypeCompleteInfo', type, list);
    },
    () => {
      const listMap = props.analysisInfo ?? {};
      const list = [...listMap[type]];
      list.splice(index, 1);
      emits('setTypeCompleteInfo', type, list);
    }
  );
};

// 添加扑克
const addPoker = (type) => {
  pokerSelectRef.value?.open(null, (poker) => {
    const listMap = props.analysisInfo ?? {};
    const list = [...listMap[type]];
    list.push(poker);
    emits('setTypeCompleteInfo', type, list);
  });
};

// 获取命中项
const getHitItem = () => {
  return deepCopy(pokerKindHit.value);
};

// 监听牌型命中
watch(
  () => props.analysisInfo,
  () => {
    const listMap = props.analysisInfo ?? {};
    const pokerCheck = pokerCheckBaccarat(listMap);
    if (!pokerCheck?.check) return (pokerKindHit.value = null);
    getHitKind(pokerCheck?.hitItem ?? [], (data) => {
      pokerKindHit.value = data;
    });
  },
  {
    immediate: true
  }
);

defineExpose({ getHitItem });
</script>
<style scoped>
.poker-baccarat {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
}

.poker-baccarat .error-msg {
  position: absolute;
  left: 8px;
  bottom: 8px;
  color: #ff0303;
  font-size: 12px;
  font-weight: bold;
  z-index: 10;
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
  cursor: pointer;
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
  right: 15%;
}

.poker-baccarat .box-n3.sign-1 {
  position: absolute;
  top: 50%;
  left: 15%;
}

.poker-baccarat .box-n3.sign-2 {
  position: absolute;
  top: 16%;
  left: 50%;
  transform: translateX(-50%) rotate(-90deg);
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
  z-index: 15;
}

.poker-baccarat .check-kind {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 12px;
  left: 0;
  width: 100%;
}

.poker-baccarat .check-kind .kind-item {
  padding: 5px 8px;
  margin: 0 5px;
  font-size: 12px;
  color: #4caf50;
  border-radius: 2px;
  border: 1px solid #4caf50;
}
</style>
