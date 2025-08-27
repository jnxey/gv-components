import { NIU_CARD_TYPE } from '@/values/card.js';
import { POINTS_NIU_LIST } from '@/values/index.js';
import { getPokerInfo } from '@/tools/index.js';

// 龙虎点数值对应
const niuValueMap = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13, A: 1 };

// 根据返回的点数信息返回检查结果
export const pokerCheckNiu = (analysisInfo) => {
  try {
    const hitItem = {};
    // 检查张数
    const aMap = {};
    POINTS_NIU_LIST.forEach((name) => (aMap[name] = !!analysisInfo[name] ? analysisInfo[name].map((item) => getPokerInfo(item)) : []));
    for (let i = 0; i < POINTS_NIU_LIST.length; i++) {
      const name = POINTS_NIU_LIST[i];
      if (name === 'b' && aMap[name].length !== 5) return { check: false, msg: { [name]: '请检查扑克牌识别的张数' } };
      if (name !== 'b' && aMap[name].length !== 5 && aMap[name].length !== 0) return { check: false, msg: { [name]: '请检查扑克牌识别的张数' } };
    }
    // 命中
    for (let i = 0; i < POINTS_NIU_LIST.length; i++) {
      const name = POINTS_NIU_LIST[i];
      if (name === 'b') {
        hitItem[name] = { poker: _calculateNiuNiu(aMap[name]) };
      } else if (aMap[name].length !== 0) {
        hitItem[name] = _compareHands(aMap['b'], aMap[name]);
      }
    }

    return { check: true, hitItem: hitItem };
  } catch (e) {
    const msgMap = {};
    POINTS_NIU_LIST.forEach((name) => (msgMap[name] = '扑克牌识别错误，请检查'));
    return { check: false, msg: msgMap };
  }
};

/**
 * 计算牛牛牌型及大小值
 * @param {Array} hand - 5张牌的对象数组，格式: [{symbol: 'hearts', value: 10}, ...]
 * @returns {Object} { type: 牌型名称, value: 比较数值, typeValue: 基础牌型值, cards: 高亮组合 }
 */
function _calculateNiuNiu(hand) {
  // 1. 预处理：转换点数 (J/Q/K=10, A=1, 其他保留原值)
  const points = hand.map((card) => (niuValueMap[card.value] >= 10 ? 10 : niuValueMap[card.value] === 1 ? 1 : niuValueMap[card.value]));

  // 2. 检测特殊牌型（优先级最高）
  // 五小牛：所有牌≤4且总和≤10
  if (points.every((p) => p <= 4) && points.reduce((sum, p) => sum + p, 0) <= 10) {
    return { type: NIU_CARD_TYPE.niu_5small, value: 100, typeValue: 100, cards: hand, match: {} };
  }

  // 炸弹牛：有四张相同点数
  const counts = {};
  hand.forEach((card) => (counts[niuValueMap[card.value]] = (counts[niuValueMap[card.value]] || 0) + 1));
  if (Math.max(...Object.values(counts)) === 4) {
    const bombPoint = parseInt(Object.entries(counts).find(([k, v]) => v === 4)[0]);
    return { type: NIU_CARD_TYPE.niu_bomb, value: 90 + bombPoint, typeValue: 90, cards: hand, match: {} };
  }

  // 五花牛：全为J/Q/K (点数全10)
  if (hand.every((card) => niuValueMap[card.value] > 10)) {
    return { type: NIU_CARD_TYPE.niu_5hua, value: 80, typeValue: 80, cards: hand, match: {} };
  }

  // 3. 检测普通牛型
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (let k = j + 1; k < 5; k++) {
        // 检查三张牌是否构成10的倍数
        if ((points[i] + points[j] + points[k]) % 10 === 0) {
          const remainPoints = points.filter((_, idx) => idx !== i && idx !== j && idx !== k);
          const niuValue = (remainPoints[0] + remainPoints[1]) % 10;

          // 牛牛（剩余两张和也是10的倍数）
          if (niuValue === 0) {
            return {
              type: NIU_CARD_TYPE.niu_niu,
              value: 70,
              typeValue: 70,
              cards: [hand[i], hand[j], hand[k]],
              match: {
                [hand[i].value + hand[i].symbol]: true,
                [hand[j].value + hand[j].symbol]: true,
                [hand[k].value + hand[k].symbol]: true
              }
            };
          }

          // 普通牛（牛1-牛9）
          return {
            type: NIU_CARD_TYPE[`niu_${niuValue}`],
            value: 60 + niuValue, // 牛9=69, 牛8=68...
            typeValue: 60,
            cards: [hand[i], hand[j], hand[k]],
            match: {
              [hand[i].value + hand[i].symbol]: true,
              [hand[j].value + hand[j].symbol]: true,
              [hand[k].value + hand[k].symbol]: true
            }
          };
        }
      }
    }
  }

  // 4. 无牛：返回最大单牌值
  const highCard = Math.max(
    ...hand.map(
      (card) => (niuValueMap[card.value] === 1 ? 1 : Math.min(niuValueMap[card.value], 14)) // A=1, K=13
    )
  );
  return { type: NIU_CARD_TYPE.niu_none, value: highCard, typeValue: 0, cards: [], match: {} };
}

/**
 * 比较两手牌大小
 * @returns {String} 'hand1胜' | 'hand2胜' | '平局'
 */
function _compareHands(hand1, hand2) {
  const result1 = _calculateNiuNiu(hand1);
  const result2 = _calculateNiuNiu(hand2);

  const result = { poker: result2, winner: null };

  // 基础牌型比较
  if (result1.value > result2.value) return { ...result, winner: 'b' };
  if (result1.value < result2.value) return { ...result, winner: 'p' };

  // 同牌型时比较细节
  if (result1.typeValue === result2.typeValue) {
    // 特殊牌型比较最大单牌
    if ([100, 90, 80, 70].includes(result1.typeValue)) {
      const high1 = Math.max(...hand1.map((c) => c.value));
      const high2 = Math.max(...hand2.map((c) => c.value));
      if (high1 !== high2) return high1 > high2 ? { ...result, winner: 'b' } : { ...result, winner: 'p' };
    }

    // 比较花色（按黑桃>红心>梅花>方块的权重）
    const suitWeights = { S: 4, H: 3, C: 2, D: 1 };
    const weight1 = Math.max(...hand1.map((c) => suitWeights[c.symbol]));
    const weight2 = Math.max(...hand2.map((c) => suitWeights[c.symbol]));
    if (weight1 !== weight2) return weight1 > weight2 ? { ...result, winner: 'b' } : { ...result, winner: 'p' };
  }

  return { ...result, winner: 'd' };
}
