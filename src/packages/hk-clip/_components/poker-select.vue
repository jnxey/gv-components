<template>
  <div v-show="isVisible" class="poker-select">
    <div class="poker-wrap">
      <template v-for="num in POKER_VALUE" :key="num">
        <template v-for="shape in POKER_SHAPE" :key="shape">
          <div class="poker-item" :class="{ selected: current === getPokerName(num, shape) }" @click="setCurrent(num, shape)">
            <img :src="`/video-recorder/poker/${getPokerName(num, shape)}.png`" alt="" />
          </div>
        </template>
      </template>
    </div>
    <!--  按钮区域  -->
    <div class="button-wrap">
      <button v-if="!!isDelete" class="gv-button danger mr-12" @click.stop="del">删除</button>
      <button class="gv-button plain mr-12" @click.stop="close">取消选择</button>
      <button class="gv-button" :disabled="!current" @click.stop="confirm">确认选择</button>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { POKER_SHAPE, POKER_VALUE } from '@/values/card.js';
const isVisible = ref(false);
const isDelete = ref(false);
const current = ref(null);
const callbacks = { set: null, del: null };

const getPokerName = (num, shape) => {
  return num + shape;
};
const open = (def, set, del) => {
  current.value = def;
  callbacks.set = set;
  callbacks.del = del;
  isDelete.value = !!del;
  isVisible.value = true;
};

const close = () => {
  isVisible.value = false;
};

const del = () => {
  if (!!callbacks.del) {
    callbacks.del();
    close();
  }
};

const confirm = () => {
  if (callbacks.set && !!current.value) {
    callbacks.set(current.value);
    close();
  }
};

const setCurrent = (num, shape) => {
  current.value = getPokerName(num, shape);
};

defineExpose({ open, close });
</script>
<style scoped>
.poker-select {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #eeeeee;
  z-index: 100;
}

.poker-select .poker-wrap {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  overflow-y: auto;
}

.poker-select .poker-item {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 100px;
  cursor: pointer;
}

.poker-select .poker-item img {
  width: 70px;
  height: 90px;
}

.poker-select .poker-item.selected:after {
  content: '';
  position: absolute;
  box-sizing: border-box;
  top: 0;
  left: 1px;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(51.2, 126.4, 204, 1);
  background-color: rgba(51.2, 126.4, 204, 0.3);
}

.poker-select .button-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
}
</style>
