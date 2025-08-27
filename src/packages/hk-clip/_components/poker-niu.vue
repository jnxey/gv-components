<template>
  <div class="poker-niu">
    <template v-for="name in POINTS_NIU_LIST" :key="name">
      <div class="area-box" :class="POINTS_NIU[name].class" :style="{ borderColor: POINTS_NIU[name].color, backgroundColor: POINTS_NIU[name].fill }">
        <div class="title" :style="{ backgroundColor: POINTS_NIU[name].color }">
          {{ POINTS_NIU[name].name }}
          <template v-if="!!pokerKindHit && pokerKindHit.hitItem?.[name]">
            - {{ pokerNiuDictMap[pokerKindHit.hitItem?.[name]?.poker?.type]?.name ?? 'Not Found' }}
          </template>
          <template v-if="!!pokerKindHit && pokerKindHit.hitItem?.[name] && name !== 'b'">
            - {{ pokerNiuWIn[pokerKindHit.hitItem?.[name]?.winner]?.name ?? 'Not Found' }}
          </template>
        </div>
        <div v-if="pokerShow[name].showAdd" class="add-btn" @click="addPoker(name)"></div>
        <template v-for="(item, index) in pokerShow[name].list" :key="index">
          <div
            class="poker-box"
            :class="['sign-' + index, !!pokerKindHit?.hitItem?.[name]?.poker?.match?.[item] ? 'matched' : 'no-matched']"
            @click="editPoker(name, index, item)"
          >
            <img :src="`/video-recorder/poker/${item}.png`" alt="" />
          </div>
        </template>
        <div class="error-msg">{{ showErrorTips?.[name] }}</div>
      </div>
    </template>
    <poker-select ref="pokerSelectRef" />
  </div>
</template>
<script setup>
import { computed, inject, ref, shallowRef, watch } from 'vue';
import PokerSelect from '@/packages/hk-clip/_components/poker-select.vue';
import { deepCopy, mappingArrayToObject } from '@/tools/index.js';
import { pokerCheckNiu } from '@/tools/poker-niu.js';
import { POINTS_NIU, POINTS_NIU_LIST } from '@/values/index.js';
import { NIU_CARD_TYPE_DICT, NIU_CARD_WIN_DICT } from '@/values/card.js';

const emits = defineEmits(['setTypeCompleteInfo']);

const pokerNiuDictMap = mappingArrayToObject(NIU_CARD_TYPE_DICT, 'value');
const pokerNiuWIn = mappingArrayToObject(NIU_CARD_WIN_DICT, 'value');

const props = defineProps({ analysisInfo: Object, completeTips: Object });

const checkRuleTips = ref(null);
const pokerSelectRef = shallowRef();
const pokerKindHit = shallowRef(null);

const showErrorTips = computed(() => {
  return { ...(checkRuleTips.value ?? {}), ...(props.completeTips ?? {}) };
});

// 显示牌
const pokerShow = computed(() => {
  const listMap = props.analysisInfo ?? {};
  const result = {};
  POINTS_NIU_LIST.forEach((name) => {
    result[name] = { list: listMap[name], showAdd: listMap[name].length < 5 };
  });
  return result;
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
    const pokerCheck = pokerCheckNiu(listMap);
    console.log(pokerCheck, '------------------pokerCheck');
    if (!pokerCheck?.check) {
      checkRuleTips.value = pokerCheck.msg;
      pokerKindHit.value = null;
    } else {
      checkRuleTips.value = null;
      pokerKindHit.value = pokerCheck;
    }
  },
  {
    immediate: true
  }
);

defineExpose({ getHitItem });
</script>
<style scoped>
.poker-niu {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: end;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 20px 20px 10px;
  z-index: 20;
}

.poker-niu .error-msg {
  position: absolute;
  left: 8px;
  bottom: 8px;
  color: #ff0303;
  font-size: 12px;
  font-weight: bold;
  z-index: 10;
}

.poker-niu .area-box {
  position: relative;
  display: inline-block;
  margin-left: 12px;
  margin-right: 12px;
  width: 200px;
  height: 240px;
  border-radius: 8px;
  border-width: 2px;
  border-style: solid;
  vertical-align: top;
}

.poker-niu .area-box:first-child {
  margin-right: 42px;
}

.poker-niu .area-box .title {
  font-size: 20px;
  color: #ffffff;
  padding: 6px;
}

.poker-niu .poker-box {
  position: relative;
  width: 40px;
  height: 60px;
  cursor: pointer;
}

.poker-niu .poker-box.matched:after {
  content: '';
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  border: 2px solid #bd0101;
}

.poker-niu .poker-box img {
  width: 100%;
  height: 100%;
}

.poker-niu .sign-0 {
  position: absolute;
  top: 58px;
  left: 17%;
}

.poker-niu .sign-1 {
  position: absolute;
  top: 58px;
  right: 17%;
}

.poker-niu .sign-2 {
  position: absolute;
  top: 130px;
  left: 5%;
}

.poker-niu .sign-3 {
  position: absolute;
  top: 130px;
  left: 50%;
  transform: translateX(-50%);
}

.poker-niu .sign-4 {
  position: absolute;
  top: 130px;
  right: 5%;
}

.poker-niu .add-btn {
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

.poker-niu .check-kind {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 26px;
  left: 0;
  width: 100%;
}

.poker-niu .check-kind .kind-item {
  padding: 5px 8px;
  margin: 0 5px;
  font-size: 12px;
  color: #4caf50;
  border-radius: 2px;
  background-color: rgba(76, 175, 80, 0.15);
  border: 1px solid #4caf50;
}
</style>
