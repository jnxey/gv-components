import { SAN_GONG_CARD_TYPE, ZHA_JIN_HUA_CARD_TYPE } from '@/values/card.js';
import { POINTS_GENERAL_LIST } from '@/values/index.js';
import { getPokerInfo } from '@/tools/index.js';
import { $t } from '@/lang/i18n.js';

const SUIT = { S: 4, H: 3, C: 2, D: 1 };
const RANKS = { A: 14, K: 13, Q: 12, J: 11, 10: 10, 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2 };

function parse(card) {
  return { r: RANKS[card.value], s: SUIT[card.symbol] };
}

function evaluate(cards) {
  let p = cards.map(parse).sort((a, b) => b.r - a.r || b.s - a.s); // 大小花色 排序
  let r = p.map((x) => x.r); // 大小数组
  let s = p.map((x) => x.s); // 花色数组
  let count = {};
  r.forEach((x) => (count[x] = (count[x] || 0) + 1)); // 计算同点数量
  let values = Object.values(count).sort((a, b) => b - a); // 同点数量排序
  let isFlush = s[0] === s[1] && s[1] === s[2]; // 是否同花
  r = r.sort((a, b) => a - b); // 大小排序
  let isStraight =
    (r[2] - r[0] === 2 && r[1] - r[0] === 1) ||
    JSON.stringify(r) === JSON.stringify([2, 3, 14]) ||
    JSON.stringify(r) === JSON.stringify([12, 13, 14]); // 是否顺子
  let straightHigh = JSON.stringify(r) === JSON.stringify([2, 3, 14]) ? 3 : JSON.stringify(r) === JSON.stringify([12, 13, 14]) ? 14 : r[2];

  let typeValue;
  let typeName;
  if (values[0] === 3) {
    typeValue = 6; // 三条
    typeName = ZHA_JIN_HUA_CARD_TYPE.san_tiao; // 三条
  } else if (isStraight && isFlush) {
    typeValue = 5; // 同花顺
    typeName = ZHA_JIN_HUA_CARD_TYPE.tong_hua_shun; // 同花顺
  } else if (isFlush) {
    typeValue = 4; // 同花
    typeName = ZHA_JIN_HUA_CARD_TYPE.tong_hua; // 同花
  } else if (isStraight) {
    typeValue = 3; // 顺子
    typeName = ZHA_JIN_HUA_CARD_TYPE.shun_zi; // 顺子
  } else if (values[0] === 2) {
    typeValue = 2; // 对子
    typeName = ZHA_JIN_HUA_CARD_TYPE.dui_zi; // 对子
  } else {
    typeValue = 1; // 单牌
    if (r[2] === 14) {
      typeName = ZHA_JIN_HUA_CARD_TYPE.dan_a; // 单牌A
    } else if (r[2] === 13) {
      typeName = ZHA_JIN_HUA_CARD_TYPE.dan_k; // 单牌K
    } else if (r[2] === 12) {
      typeName = ZHA_JIN_HUA_CARD_TYPE.dan_q; // 单牌Q
    } else if (r[2] === 11) {
      typeName = ZHA_JIN_HUA_CARD_TYPE.dan_j; // 单牌J
    } else {
      typeName = ZHA_JIN_HUA_CARD_TYPE.dan; // 单牌
    }
  }

  let key = [];
  if (typeName === ZHA_JIN_HUA_CARD_TYPE.san_tiao) {
    // 豹子
    key.push(...r);
  } else if (
    typeName === ZHA_JIN_HUA_CARD_TYPE.tong_hua_shun ||
    typeName === ZHA_JIN_HUA_CARD_TYPE.tong_hua ||
    typeName === ZHA_JIN_HUA_CARD_TYPE.shun_zi
  ) {
    // 顺金 / 顺子
    key.push(straightHigh);
  } else if (typeName === ZHA_JIN_HUA_CARD_TYPE.dui_zi) {
    // 对子
    let pair = Object.keys(count).find((k) => count[k] === 2);
    let single = Object.keys(count).find((k) => count[k] === 1);
    key.push(+pair, +single);
  } else {
    // 单牌
    key = [...r].reverse();
  }
  key.push(...s); // 花色兜底
  return { typeValue, type: typeName, key };
}

function compareZhajinhua(A, B) {
  const a = evaluate(A);
  const b = evaluate(B);

  const result = { poker: b, winner: null };

  if (a.typeValue !== b.typeValue) return a.typeValue > b.typeValue ? { ...result, winner: 'b' } : { ...result, winner: 'p' };
  for (let i = 0; i < a.key.length; i++) {
    if (a.key[i] !== b.key[i]) return a.key[i] > b.key[i] ? { ...result, winner: 'b' } : { ...result, winner: 'p' };
  }
  return { ...result, winner: 'b' };
}

// 根据返回的点数信息返回检查结果
export const pokerCheckZhaJin = (analysisInfo) => {
  console.log(analysisInfo, '----------------------------analysisInfo');
  try {
    const hitItem = {};
    // 检查张数
    const aMap = {};
    POINTS_GENERAL_LIST.forEach((name) => (aMap[name] = !!analysisInfo[name] ? analysisInfo[name].map((item) => getPokerInfo(item)) : []));
    for (let i = 0; i < POINTS_GENERAL_LIST.length; i++) {
      const name = POINTS_GENERAL_LIST[i];
      if (name === 'b' && aMap[name].length !== 3) return { check: false, msg: { [name]: $t('common.tools.tips_err_5') } };
      if (name !== 'b' && aMap[name].length !== 3 && aMap[name].length !== 0) return { check: false, msg: { [name]: $t('common.tools.tips_err_5') } };
    }
    // 命中
    for (let i = 0; i < POINTS_GENERAL_LIST.length; i++) {
      const name = POINTS_GENERAL_LIST[i];
      if (name === 'b') {
        hitItem[name] = { poker: evaluate(aMap[name]) };
      } else if (aMap[name].length !== 0) {
        hitItem[name] = compareZhajinhua(aMap['b'], aMap[name]);
      }
    }
    console.log(hitItem, '--------------------------------hitItem');
    return { check: true, hitItem: hitItem };
  } catch (e) {
    console.log(e, '----------------------error');
    const msgMap = {};
    POINTS_GENERAL_LIST.forEach((name) => (msgMap[name] = $t('common.tools.tips_err_6')));
    return { check: false, msg: msgMap };
  }
};
