import { computed, ref } from 'vue';

// 判断两组物体坐标是否发生大的变化
export function useIsStable() {
  const maxJudge = 3;
  let lastList = [];
  let newList = [];

  let sameCount = ref(0);

  let isSameNow = computed(() => sameCount.value > maxJudge);

  const clearNewList = () => {
    lastList = [];
    newList = [];
  };

  const setNewList = (list) => {
    lastList = newList;
    newList = list.map((point) => {
      return { x: point.bbox.cx, y: point.bbox.cy, width: point.bbox.w, height: point.bbox.h };
    });
    const same = isStable(lastList, newList);
    if (same) {
      sameCount.value = sameCount.value + 1;
    } else {
      sameCount.value = 0;
    }
  };

  const setPrevSame = () => {
    sameCount.value = maxJudge - 1;
  };

  return { isSameNow, clearNewList, setNewList, setPrevSame };
}

/**
 * 判断两组物体坐标是否发生大的变化
 * 每个物体包含 {x, y, width, height}
 * @param {Array<{x:number, y:number, width:number, height:number}>} coordsOld
 * @param {Array<{x:number, y:number, width:number, height:number}>} coordsNew
 * @param {number} positionThreshold - 坐标变化阈值
 * @param {number} sizeThreshold - 宽高变化阈值
 * @returns {boolean} - 如果没有发生大的改变返回 true，否则返回 false
 */
function isStable(coordsOld, coordsNew, positionThreshold = 20, sizeThreshold = 20) {
  if (!coordsOld.length && !coordsNew.length) return false;
  if (coordsOld.length !== coordsNew.length) return false;

  // 排序函数：先按 y（上到下），再按 x（左到右）
  const sortCoords = (arr) =>
    arr.slice().sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

  const oldSorted = sortCoords(coordsOld);
  const newSorted = sortCoords(coordsNew);

  for (let i = 0; i < oldSorted.length; i++) {
    const dx = newSorted[i].x - oldSorted[i].x;
    const dy = newSorted[i].y - oldSorted[i].y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const dw = Math.abs(newSorted[i].width - oldSorted[i].width);
    const dh = Math.abs(newSorted[i].height - oldSorted[i].height);

    if (dist > positionThreshold || dw > sizeThreshold || dh > sizeThreshold) {
      return false; // 发生大的改变
    }
  }

  return true; // 所有物体都没有大的改变
}

// // 示例
// const oldCoords = [
//   { x: 10, y: 20, width: 30, height: 40 },
//   { x: 50, y: 60, width: 20, height: 20 }
// ];
// const newCoords = [
//   { x: 12, y: 21, width: 31, height: 39 },
//   { x: 51, y: 61, width: 19, height: 21 }
// ];
//
// console.log(isStable(oldCoords, newCoords, 5, 5)); // true
