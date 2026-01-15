import { BACCARAT_CARD_TYPE } from '@/values/card.js';
import { getPokerInfo } from '@/tools/index.js';
import { $t } from '@/lang/i18n.js';

// 百家乐点数值对应
const baccaratValueMap = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 0, J: 0, Q: 0, K: 0, A: 1 };

// 3张牌设置补牌顺序，补牌在第一张
export const getPokerReplenish = (pokers) => {
  const result = [];
  const boxInfo = [];
  const boxCount = { H: 0, V: 0 };
  let tipsMsg = '';
  pokers.forEach((item) => {
    const box = item.bbox[0];
    const xDistance = Math.abs(box.x1 - box.x2);
    const yDistance = Math.abs(box.y1 - box.y2);
    const direction = yDistance > xDistance ? 'V' : 'H';
    boxInfo.push(direction);
    result.push(item.class_name);
    boxCount[direction] = boxCount[direction] + 1;
  });
  if (boxCount.H === 2) {
    const vKey = boxInfo.indexOf('V');
    const cValue = result[vKey];
    result.splice(vKey, 1);
    result.push(cValue);
  } else if (boxCount.V === 2) {
    const hKey = boxInfo.indexOf('H');
    const cValue = result[hKey];
    result.splice(hKey, 1);
    result.push(cValue);
  } else {
    tipsMsg = $t('common.tools.tips_err_1');
  }
  return { tipsMsg, result };
};

// 检查牌点数是否符合规则
export const checkBaccaratPokerRule = (analysisInfo, countResult) => {
  if (analysisInfo.b.length <= 1) return { b: $t('common.tools.tips_err_2') }; // 未识别牌型
  if (analysisInfo.p.length <= 1) return { p: $t('common.tools.tips_err_2') }; // 未识别牌型

  // ---- 需要补牌情况
  // ---- 庄 2张牌 闲 2张牌
  if (analysisInfo.b.length === 2 && analysisInfo.p.length === 2) {
    if (countResult.pCountValue <= 5 && countResult.bCountValue <= 7) return { p: $t('common.tools.tips_err_3') };
    if (countResult.bCountValue <= 5 && [6, 7].includes(countResult.pCountValue)) return { b: $t('common.tools.tips_err_3') };
    if (countResult.bCountValue <= 2 && countResult.pCountValue <= 7) return { p: $t('common.tools.tips_err_3') };
  }
  // ---- 庄 2张牌 闲 3张牌
  if (analysisInfo.b.length === 2 && analysisInfo.p.length === 3) {
    // 庄 2张牌 闲 3张牌
    const tInfo = getPokerInfo(analysisInfo.p[2]);
    const three = baccaratValueMap[tInfo.value] % 10; // 闲 第三张点数
    if (countResult.bCountValue <= 2) return { b: $t('common.tools.tips_err_3') };
    if (countResult.bCountValue === 3 && ![8].includes(three)) return { b: $t('common.tools.tips_err_3') };
    if (countResult.bCountValue === 4 && ![0, 1, 8, 9].includes(three)) return { b: $t('common.tools.tips_err_3') };
    if (countResult.bCountValue === 5 && ![0, 1, 2, 3, 8, 9].includes(three)) return { b: $t('common.tools.tips_err_3') };
    if (countResult.bCountValue === 6 && ![0, 1, 2, 3, 4, 5, 8, 9].includes(three)) return { b: $t('common.tools.tips_err_3') };
  }

  // ---- 不需要补牌，但补了的情况
  // 庄 3张牌
  if (analysisInfo.p.length === 3 && analysisInfo.p.length === 2) {
    // 闲 2张牌
    const p1 = getPokerInfo(analysisInfo.p[0]);
    const p2 = getPokerInfo(analysisInfo.p[1]);
    const two = (baccaratValueMap[p1.value] + baccaratValueMap[p2.value]) % 10;
    if (two >= 6) return { b: $t('common.tools.tips_err_4') };
  }
  // 庄 3张牌
  if (analysisInfo.b.length === 3 && analysisInfo.p.length === 3) {
    // 闲 3张牌
    const p1 = getPokerInfo(analysisInfo.b[0]);
    const p2 = getPokerInfo(analysisInfo.b[1]);
    const p3 = getPokerInfo(analysisInfo.p[2]);
    const two = (baccaratValueMap[p1.value] + baccaratValueMap[p2.value]) % 10;
    const three = baccaratValueMap[p3.value] % 10;
    if (two >= 7) return { b: $t('common.tools.tips_err_4') };
    if (two === 3 && !![8].includes(three)) return { b: $t('common.tools.tips_err_4') };
    if (two === 4 && !![0, 1, 8, 9].includes(three)) return { b: $t('common.tools.tips_err_4') };
    if (two === 5 && !![0, 1, 2, 3, 8, 9].includes(three)) return { b: $t('common.tools.tips_err_4') };
    if (two === 6 && !![0, 1, 2, 3, 4, 5, 8, 9].includes(three)) return { b: $t('common.tools.tips_err_4') };
  }
  if (analysisInfo.p.length === 3) {
    // 闲 2张牌
    const p1 = getPokerInfo(analysisInfo.p[0]);
    const p2 = getPokerInfo(analysisInfo.p[1]);
    const two = (baccaratValueMap[p1.value] + baccaratValueMap[p2.value]) % 10;
    if (two >= 6) return { p: $t('common.tools.tips_err_4') };
  }
  return null;
};

// 根据返回的点数信息返回检查结果
export const pokerCheckBaccarat = (analysisInfo) => {
  try {
    const hitItem = [];
    // 检查张数
    const bList = analysisInfo.b ?? [];
    const pList = analysisInfo.p ?? [];
    if (bList.length <= 0 || bList.length > 3) return { check: false, msg: { b: $t('common.tools.tips_err_5') } };
    if (pList.length <= 0 || pList.length > 3) return { check: false, msg: { p: $t('common.tools.tips_err_5') } };
    // 获取庄闲点数、花色
    const bValue = [];
    const bShape = [];
    const pValue = [];
    const pShape = [];
    let bCountValue = 0;
    let pCountValue = 0;
    bList.forEach((name) => {
      const info = getPokerInfo(name);
      bValue.push(info.value);
      bShape.push(info.symbol);
      bCountValue = bCountValue + baccaratValueMap[info.value];
    });
    pList.forEach((name) => {
      const info = getPokerInfo(name);
      pValue.push(info.value);
      pShape.push(info.symbol);
      pCountValue = pCountValue + baccaratValueMap[info.value];
    });
    bCountValue = bCountValue % 10;
    pCountValue = pCountValue % 10;
    // 命中 庄赢
    if (bCountValue > pCountValue) {
      hitItem.push(BACCARAT_CARD_TYPE.master);
      if (bCountValue === 6) {
        hitItem.push(BACCARAT_CARD_TYPE.luck_6); // 命中 幸运6
        if (bList.length === 2) hitItem.push(BACCARAT_CARD_TYPE.luck_6_2, BACCARAT_CARD_TYPE.small_tiger); // 命中 幸运6两张牌，小老虎
        if (bList.length === 3) hitItem.push(BACCARAT_CARD_TYPE.luck_6_3, BACCARAT_CARD_TYPE.big_tiger); // 命中 幸运6三张牌，大老虎
      }
      if (bCountValue === 7) hitItem.push(BACCARAT_CARD_TYPE.long_7); // 命中 龙7
    }
    // 命中 闲赢
    if (bCountValue < pCountValue) {
      hitItem.push(BACCARAT_CARD_TYPE.player);
      if (pCountValue === 8) hitItem.push(BACCARAT_CARD_TYPE.xiong_8); // 命中 熊8
    }
    // 命中 和局
    if (bCountValue === pCountValue) {
      hitItem.push(BACCARAT_CARD_TYPE.draw);
    }
    // 命中 庄对
    if (bValue[0] === bValue[1]) {
      hitItem.push(BACCARAT_CARD_TYPE.master_pair);
      hitItem.push(BACCARAT_CARD_TYPE.pair_any); // 命中 任意对子
      if (bShape[0] === bShape[1]) hitItem.push(BACCARAT_CARD_TYPE.pair_perfect); // 命中 完美对子
    }
    // 命中 闲对
    if (pValue[0] === pValue[1]) {
      hitItem.push(BACCARAT_CARD_TYPE.player_pair);
      hitItem.push(BACCARAT_CARD_TYPE.pair_any); // 命中 任意对子
      if (pShape[0] === pShape[1]) hitItem.push(BACCARAT_CARD_TYPE.pair_perfect); // 命中 完美对子
    }
    return { check: true, bCountValue, pCountValue, hitItem: hitItem };
  } catch (e) {
    return { check: false, msg: { b: $t('common.tools.tips_err_6'), p: $t('common.tools.tips_err_6') } };
  }
};
