import { SAN_GONG_CARD_TYPE } from '@/values/card.js';
import { POINTS_GENERAL_LIST } from '@/values/index.js';
import { getPokerInfo } from '@/tools/index.js';
import { $t } from '@/lang/i18n.js';

// 花色与大小映射
const SUIT_RANK = { S: 4, H: 3, C: 2, D: 1 }; // S>H>C>D
const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_VALUE = {}; // 用于比较大小（K最大）
RANK_ORDER.forEach((r, i) => (RANK_VALUE[r] = i + 1));

// 判定公牌
function isGong(rank) {
  return rank === 'J' || rank === 'Q' || rank === 'K';
}

// 解析牌，接受 'AS' '10D' 'KH' 等格式
function parseCard(card) {
  // 支持 '10' 两字符，花色最后一位
  const cardStr = card.value + card.symbol;
  const suit = cardStr.slice(-1).toUpperCase();
  const rank = cardStr.slice(0, -1).toUpperCase();
  if (!SUIT_RANK[suit]) throw new Error('未知花色: ' + suit);
  if (!(rank in RANK_VALUE)) throw new Error('未知牌面: ' + rank);
  return { raw: cardStr.toUpperCase(), rank, suit, rankValue: RANK_VALUE[rank], suitValue: SUIT_RANK[suit] };
}

// 点数值（用于点数和计算）：A=1, 2-9=面值, 10=0, J/Q/K=0
function pointValue(rank) {
  if (rank === 'A') return 1;
  if (rank === '10') return 0;
  if (isGong(rank)) return 0;
  // '2'..'9'
  return parseInt(rank, 10);
}

// 评估一手三张牌
// 返回对象：{ typeRank, typeName, point, isGongCount, sortedCards, tieKey }
// typeRank: 数字手牌强度（越大越好）用于快速比较
// tieKey: 用于在同type下逐项比较（数组，先比较第0项，...)  每项为 {rankValue, suitValue}
function evaluateHand(cards) {
  if (!Array.isArray(cards) || cards.length !== 3) throw new Error('传入必须为3张牌数组');
  const parsed = cards.map(parseCard);
  // 按牌值降序排序（先比rankValue，再比suitValue）
  parsed.sort((a, b) => {
    if (a.rankValue !== b.rankValue) return b.rankValue - a.rankValue;
    return b.suitValue - a.suitValue;
  });

  // 统计
  const ranks = parsed.map((c) => c.rank);
  const rankCounts = {};
  ranks.forEach((r) => (rankCounts[r] = (rankCounts[r] || 0) + 1));
  const counts = Object.values(rankCounts).sort((a, b) => b - a); // e.g. [3] or [2,1] or [1,1,1]

  const gongCount = parsed.reduce((s, c) => s + (isGong(c.rank) ? 1 : 0), 0);
  const sumPoints = parsed.reduce((s, c) => s + pointValue(c.rank), 0);
  const point = sumPoints % 10; // 0..9

  // 判定牌型和 typeRank（数值越大越强）
  // typeRank 说明：
  //  3 -> 三条 (三张同点)
  //  2 -> 三公 (三张均为 J/Q/K，但不是三条，同一张三K会被先判三条)
  //  1 -> 普通点数（按 point 比较）
  let typeRank;
  let typeName;
  if (counts[0] === 3) {
    typeRank = 3;
    typeName = SAN_GONG_CARD_TYPE.san_tiao;
  } else if (gongCount === 3) {
    typeRank = 2;
    typeName = SAN_GONG_CARD_TYPE.san_gong;
  } else {
    typeRank = 1;
    typeName = SAN_GONG_CARD_TYPE[`point_${point}`];
  }

  // tieKey：用于同type下比较细节（数组按优先级顺序）
  // 我们设计通用 tieKey 规则（越靠前越重要）：
  //  - 三条：先比较三条的牌面大小（rankValue），再比较最大单张花色
  //  - 三公：按三张中最大牌 rankValue，若同，再比第二、第三，最后比花色序列
  //  - 点数：先比较 point（0..9），再比较按牌面降序的 rankValue 列表与花色列
  const tieKey = [];
  if (typeRank === 3) {
    // 三条
    // 找到被重复的rank（只有一个）
    const tripleRank = Object.keys(rankCounts).find((r) => rankCounts[r] === 3);
    tieKey.push({ tripleRankValue: RANK_VALUE[tripleRank] });
    // 推入每张牌的 rankValue,suitValue 作为后备比较
    parsed.forEach((c) => tieKey.push({ rankValue: c.rankValue, suitValue: c.suitValue }));
  } else if (typeRank === 2) {
    // 三公
    // 三张都是公牌，按最大、次大、第三比较
    parsed.forEach((c) => tieKey.push({ rankValue: c.rankValue, suitValue: c.suitValue }));
  } else {
    // 点数型
    // 先比较 point（高者胜）
    tieKey.push({ point });
    // 再比较每张牌按降序的 rankValue, suitValue
    parsed.forEach((c) => tieKey.push({ rankValue: c.rankValue, suitValue: c.suitValue, gongCount: gongCount }));
  }

  // 生成便于 debug/显示的 summary
  const sortedCards = parsed.map((c) => c.raw);

  return {
    type: typeName,
    typeRank,
    point,
    gongCount,
    sortedCards,
    tieKey,
    rawParsed: parsed
  };
}

// 比较两个 tieKey（同牌型时使用）
// 返回 1 如果 a 胜， -1 如果 b 胜， 0 平局
function compareTieKey(aTie, bTie) {
  const n = Math.max(aTie.length, bTie.length);
  for (let i = 0; i < n; i++) {
    const a = aTie[i] || {};
    const b = bTie[i] || {};
    // 先比较可能存在的 fields: point, tripleRankValue, nonGongRankValue, rankValue, suitValue
    if ('point' in a || 'point' in b) {
      const av = a.point || 0,
        bv = b.point || 0;
      if (av !== bv) return av > bv ? 1 : -1;
      continue;
    }
    if ('tripleRankValue' in a || 'tripleRankValue' in b) {
      const av = a.tripleRankValue || 0,
        bv = b.tripleRankValue || 0;
      if (av !== bv) return av > bv ? 1 : -1;
      continue;
    }
    if ('rankValue' in a || 'rankValue' in b) {
      const av = a.rankValue || 0,
        bv = b.rankValue || 0;
      if ((av === bv) === 0) return 1; // 如果都是0点，庄赢
      if (av !== bv) return av > bv ? 1 : -1;
      // 若点数相同，公牌数不同
      const ag = a.gongCount || 0,
        bg = b.gongCount || 0;
      if (ag !== bg) return ag > bg ? 1 : -1;
      // 若 rankValue, 公牌数量 都相同，再比较 suitValue（若存在）
      const as = a.suitValue || 0,
        bs = b.suitValue || 0;
      if (as !== bs) return as > bs ? 1 : -1;
      continue;
    }
    // 若没有任何可比字段，继续
  }
  return 0; // 完全相等
}

// 主比较函数：compareHands(bankCardsArray, playerCardsArray)
// cards array 格式如 ['KS','3H','10D']
function compareHands(bankCards, playerCards) {
  const bankEval = evaluateHand(bankCards);
  const playerEval = evaluateHand(playerCards);

  const result = { poker: playerEval, winner: null };

  // 特殊规则：庄、闲同为 0 点 -> 庄家直接赢（不比牌）
  if (bankEval.point === 0 && playerEval.point === 0) {
    return { ...result, winner: 'b' };
  }

  // 先比较 typeRank (三条 > 三公 > 双公 > 单公 > 点数)
  if (bankEval.typeRank !== playerEval.typeRank) {
    return { ...result, winner: bankEval.typeRank > playerEval.typeRank ? 'b' : 'p' };
  }

  // 同牌型，使用 tieKey 逐项比较
  const cmp = compareTieKey(bankEval.tieKey, playerEval.tieKey);
  if (cmp === 1) return { ...result, winner: 'b' };
  if (cmp === -1) return { ...result, winner: 'p' };

  // 完全相同（极少情况）- 完全相同的牌-庄赢
  return { ...result, winner: 'b' };
}

// 根据返回的点数信息返回检查结果
export const pokerCheckSanGong = (analysisInfo) => {
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
        hitItem[name] = { poker: evaluateHand(aMap[name]) };
      } else if (aMap[name].length !== 0) {
        hitItem[name] = compareHands(aMap['b'], aMap[name]);
      }
    }

    return { check: true, hitItem: hitItem };
  } catch (e) {
    console.log(e, '----------------------error');
    const msgMap = {};
    POINTS_GENERAL_LIST.forEach((name) => (msgMap[name] = $t('common.tools.tips_err_6')));
    return { check: false, msg: msgMap };
  }
};
