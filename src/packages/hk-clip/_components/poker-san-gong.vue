<template>
  <div class="poker-san-gong">
    <template v-for="name in POINTS_GENERAL_LIST" :key="name">
      <div
        class="area-box"
        :class="POINTS_GENERAL[name].class"
        :style="{ borderColor: POINTS_GENERAL[name].color, backgroundColor: POINTS_GENERAL[name].fill }"
      >
        <div class="title" :style="{ backgroundColor: POINTS_GENERAL[name].color }">
          {{ POINTS_GENERAL[name].name }}
          <template v-if="!!pokerKindHit && pokerKindHit?.[name]">
            - {{ pokerSanGongDictMap[pokerKindHit?.[name]?.poker?.type]?.name ?? 'Not Found' }}
          </template>
          <template v-if="!!pokerKindHit && pokerKindHit?.[name] && name !== 'b'">
            - {{ pokerNiuWIn[pokerKindHit?.[name]?.winner]?.name ?? 'Not Found' }}
          </template>
        </div>
        <div v-if="pokerShow[name].showAdd" class="add-btn" @click="addPoker(name)"></div>
        <template v-for="(item, index) in pokerShow[name].list" :key="index">
          <div
            class="poker-box"
            :class="['sign-' + index, !!pokerKindHit?.[name]?.poker?.match?.[item] ? 'matched' : 'no-matched']"
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
import { pokerCheckSanGong } from '@/tools/poker-san-gong.js';
import { POINTS_GENERAL, POINTS_GENERAL_LIST } from '@/values/index.js';
import { CARD_WIN_DICT, SAN_GONG_CARD_TYPE_DICT } from '@/values/card.js';

const emits = defineEmits(['setTypeCompleteInfo']);

const pokerSanGongDictMap = mappingArrayToObject(SAN_GONG_CARD_TYPE_DICT, 'value');
const pokerNiuWIn = mappingArrayToObject(CARD_WIN_DICT, 'value');

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
  POINTS_GENERAL_LIST.forEach((name) => {
    result[name] = { list: listMap[name], showAdd: listMap[name].length < 3 };
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
    const pokerCheck = pokerCheckSanGong(listMap);
    console.log(pokerCheck, '------------------pokerCheck');
    if (!pokerCheck?.check) {
      checkRuleTips.value = pokerCheck.msg;
      pokerKindHit.value = null;
    } else {
      checkRuleTips.value = null;
      pokerKindHit.value = pokerCheck.hitItem;
    }
  },
  {
    immediate: true
  }
);

defineExpose({ getHitItem });
</script>
<style scoped>
.poker-san-gong {
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

.poker-san-gong .error-msg {
  position: absolute;
  left: 8px;
  bottom: 8px;
  color: #ff0303;
  font-size: 12px;
  font-weight: bold;
  z-index: 10;
}

.poker-san-gong .area-box {
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

.poker-san-gong .area-box:first-child {
  margin-right: 42px;
}

.poker-san-gong .area-box .title {
  font-size: 20px;
  color: #ffffff;
  padding: 6px;
}

.poker-san-gong .poker-box {
  position: relative;
  width: 40px;
  height: 60px;
  cursor: pointer;
}

.poker-san-gong .poker-box.matched:after {
  content: '';
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  border: 2px solid #4caf50;
}

.poker-san-gong .poker-box img {
  width: 100%;
  height: 100%;
}

.poker-san-gong .sign-0 {
  position: absolute;
  top: 100px;
  left: 5%;
}

.poker-san-gong .sign-1 {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
}

.poker-san-gong .sign-2 {
  position: absolute;
  top: 100px;
  right: 5%;
}

.poker-san-gong .add-btn {
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

.poker-san-gong .check-kind {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 26px;
  left: 0;
  width: 100%;
}

.poker-san-gong .check-kind .kind-item {
  padding: 5px 8px;
  margin: 0 5px;
  font-size: 12px;
  color: #4caf50;
  border-radius: 2px;
  background-color: rgba(76, 175, 80, 0.15);
  border: 1px solid #4caf50;
}
</style>
