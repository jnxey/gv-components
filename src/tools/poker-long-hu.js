import { LONG_HU_CARD_TYPE } from '@/values/card.js';
import { getPokerInfo } from '@/tools/index.js';

// 龙虎点数值对应
const longHuValueMap = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13, A: 1 };

// 检查牌点数是否符合规则
export const checkLongHuPokerRule = (analysisInfo) => {
  if (analysisInfo.b.length !== 1) return { b: '未识别到牌型' }; // 未识别牌型
  if (analysisInfo.p.length !== 1) return { p: '未识别到牌型' }; // 未识别牌型
  return null;
};

// 根据返回的点数信息返回检查结果
export const pokerCheckLongHu = (analysisInfo) => {
  try {
    const hitItem = [];
    // 检查张数
    const bList = analysisInfo.b ?? [];
    const pList = analysisInfo.p ?? [];
    if (bList.length !== 1 || pList.length !== 1) return { check: false, msg: '请检查扑克牌识别的张数，请检查' };
    // 获取庄闲点数、花色
    const bInfo = getPokerInfo(bList[0]);
    const pInfo = getPokerInfo(pList[0]);
    const bCountValue = longHuValueMap[bInfo.value];
    const pCountValue = longHuValueMap[pInfo.value];

    // 命中 龙赢
    if (bCountValue > pCountValue) {
      hitItem.push(LONG_HU_CARD_TYPE.master);
    }
    // 命中 闲赢
    if (bCountValue < pCountValue) {
      hitItem.push(LONG_HU_CARD_TYPE.player);
    }
    // 命中 和局
    if (bCountValue === pCountValue) {
      hitItem.push(LONG_HU_CARD_TYPE.draw);
    }
    return { check: true, bCountValue, pCountValue, hitItem: hitItem };
  } catch (e) {
    return { check: false, msg: '扑克牌识别错误，请检查' };
  }
};
