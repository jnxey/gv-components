<template>
  <div class="majiang-tui-tong-zi">
    <template v-for="name in POINTS_GENERAL_LIST" :key="name">
      <div
        class="area-box"
        :class="POINTS_GENERAL[name].class"
        :style="{ borderColor: POINTS_GENERAL[name].color, backgroundColor: POINTS_GENERAL[name].fill }"
      >
        <div class="title" :style="{ backgroundColor: POINTS_GENERAL[name].color }">
          {{ POINTS_GENERAL[name].name }}
          <template v-if="!!pokerKindHit && pokerKindHit?.[name]">
            - {{ tuiTongZiDictMap[pokerKindHit?.[name]?.poker?.type]?.name ?? 'Not Found' }}
          </template>
          <template v-if="!!pokerKindHit && pokerKindHit?.[name] && name !== 'b'">
            - {{ cardNiuWIn[pokerKindHit?.[name]?.winner]?.name ?? 'Not Found' }}
          </template>
        </div>
        <div v-if="pokerShow[name].showAdd" class="add-btn" @click="addMajiang(name)"></div>
        <template v-for="(item, index) in pokerShow[name].list" :key="index">
          <div
            class="poker-box"
            :class="['sign-' + index, !!pokerKindHit?.[name]?.poker?.match?.[item] ? 'matched' : 'no-matched']"
            @click="editMajiang(name, index, item)"
          >
            <img :src="`/video-recorder/majiang/${item}.png`" alt="" />
          </div>
        </template>
        <div class="error-msg">{{ showErrorTips?.[name] }}</div>
      </div>
    </template>
    <majiang-select ref="majiangSelectRef" />
  </div>
</template>
<script setup>
import { computed, ref, shallowRef, watch } from 'vue';
import { deepCopy, mappingArrayToObject } from '@/tools/index.js';
import { majiangCheckTuiTongZi } from '@/tools/majiang-tui-tong-zi.js';
import { POINTS_GENERAL, POINTS_GENERAL_LIST } from '@/values/index.js';
import { CARD_WIN_DICT, TUI_TONG_ZI_TYPE_DICT } from '@/values/card.js';
import MajiangSelect from '@/packages/hk-clip/_components/majiang-select.vue';

const emits = defineEmits(['setTypeCompleteInfo']);

const tuiTongZiDictMap = mappingArrayToObject(TUI_TONG_ZI_TYPE_DICT, 'value');
const cardNiuWIn = mappingArrayToObject(CARD_WIN_DICT, 'value');

const props = defineProps({ analysisInfo: Object, completeTips: Object });

const checkRuleTips = ref(null);
const majiangSelectRef = shallowRef();
const pokerKindHit = shallowRef(null);

const showErrorTips = computed(() => {
  return { ...(checkRuleTips.value ?? {}), ...(props.completeTips ?? {}) };
});

// 显示牌
const pokerShow = computed(() => {
  const listMap = props.analysisInfo ?? {};
  const result = {};
  POINTS_GENERAL_LIST.forEach((name) => {
    result[name] = { list: listMap[name], showAdd: listMap[name].length < 2 };
  });
  return result;
});

// 编辑麻将
const editMajiang = (type, index, poker) => {
  majiangSelectRef.value?.open(
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

// 添加麻将
const addMajiang = (type) => {
  majiangSelectRef.value?.open(null, (poker) => {
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
    console.log(listMap, '------------------analysisInfo');
    const majiangCheck = majiangCheckTuiTongZi(listMap);
    console.log(majiangCheck, '------------------majiangCheck');
    if (!majiangCheck?.check) {
      checkRuleTips.value = majiangCheck.msg;
      pokerKindHit.value = null;
    } else {
      checkRuleTips.value = null;
      pokerKindHit.value = majiangCheck.hitItem;
    }
  },
  {
    immediate: true
  }
);

defineExpose({ getHitItem });
</script>
<style scoped>
.majiang-tui-tong-zi {
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

.majiang-tui-tong-zi .error-msg {
  position: absolute;
  left: 8px;
  bottom: 8px;
  color: #ff0303;
  font-size: 12px;
  font-weight: bold;
  z-index: 10;
}

.majiang-tui-tong-zi .area-box {
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

.majiang-tui-tong-zi .area-box:first-child {
  margin-right: 42px;
}

.majiang-tui-tong-zi .area-box .title {
  font-size: 20px;
  color: #ffffff;
  padding: 6px;
}

.majiang-tui-tong-zi .poker-box {
  position: relative;
  width: 40px;
  height: 60px;
  cursor: pointer;
}

.majiang-tui-tong-zi .poker-box.matched:after {
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

.majiang-tui-tong-zi .poker-box img {
  width: 100%;
  height: 100%;
}

.majiang-tui-tong-zi .sign-0 {
  position: absolute;
  top: 100px;
  left: 15%;
}

.majiang-tui-tong-zi .sign-1 {
  position: absolute;
  top: 100px;
  right: 15%;
}

.majiang-tui-tong-zi .add-btn {
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

.majiang-tui-tong-zi .check-kind {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 26px;
  left: 0;
  width: 100%;
}

.majiang-tui-tong-zi .check-kind .kind-item {
  padding: 5px 8px;
  margin: 0 5px;
  font-size: 12px;
  color: #4caf50;
  border-radius: 2px;
  background-color: rgba(76, 175, 80, 0.15);
  border: 1px solid #4caf50;
}
</style>
