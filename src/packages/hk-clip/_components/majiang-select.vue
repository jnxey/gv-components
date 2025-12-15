<template>
  <div v-show="isVisible" class="majiang-select">
    <div class="poker-wrap">
      <template v-for="mark in maJiangValueList" :key="mark">
        <div class="poker-item" :class="{ selected: current === mark }" @click="setCurrent(mark)">
          <img :src="`/video-recorder/majiang/${mark}.png`" alt="" />
        </div>
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
import { onBeforeMount, ref } from 'vue';
import { MA_JIANG_VALUE } from '@/values/card.js';
import qs from 'qs';

const isVisible = ref(false);
const isDelete = ref(false);
const current = ref(null);
const callbacks = { set: null, del: null };

const maJiangValueList = ref([]);

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

const setCurrent = (mark) => {
  current.value = mark;
};

onBeforeMount(() => {
  const params = qs.parse(window.location.search.substring(1));
  maJiangValueList.value = [...MA_JIANG_VALUE, params.bao ?? 'WD'];
});

defineExpose({ open, close });
</script>
<style scoped>
.majiang-select {
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

.majiang-select .poker-wrap {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  overflow-y: auto;
}

.majiang-select .poker-item {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 100px;
  cursor: pointer;
}

.majiang-select .poker-item img {
  width: 70px;
  height: 90px;
}

.majiang-select .poker-item.selected:after {
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

.majiang-select .button-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
}
</style>
