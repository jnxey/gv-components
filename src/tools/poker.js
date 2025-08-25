import { BACCARAT_CARD_TYPE } from '@/values/card.js';

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
    tipsMsg = '未识别出补牌，请检查补牌是否横放';
  }
  return { tipsMsg, result };
};

// 检查牌点数是否符合规则
export const checkPokerRule = (analysisInfo, countResult) => {
  if (analysisInfo.b.length === 0) return { b: '未识别到牌型' }; // 未识别牌型
  if (analysisInfo.p.length === 0) return { p: '未识别到牌型' }; // 未识别牌型
  if (analysisInfo.b.length === 1 && analysisInfo.p.length === 1) return null; // 可能玩的是龙虎
  // ---- 庄 2张牌
  if (analysisInfo.b.length === 2 && analysisInfo.p.length === 2) {
    // 庄 2张牌 闲 2张牌
    if (countResult.bCountValue <= 5) return { b: '还需补牌' };
  }
  if (analysisInfo.b.length === 2 && analysisInfo.p.length === 3) {
    // 庄 2张牌 闲 3张牌
    const tInfo = getPokerInfo(analysisInfo.p[2]);
    const three = baccaratValueMap[tInfo.value] % 10; // 闲 第三张点数
    if (countResult.bCountValue <= 2) return { b: '还需补牌' };
    if (countResult.bCountValue === 3 && ![8].includes(three)) return { b: '还需补牌' };
    if (countResult.bCountValue === 4 && ![0, 1, 8, 9].includes(three)) return { b: '还需补牌' };
    if (countResult.bCountValue === 5 && ![0, 1, 2, 3, 8, 9].includes(three)) return { b: '还需补牌' };
    if (countResult.bCountValue === 6 && ![0, 1, 2, 3, 4, 5, 8, 9].includes(three)) return { b: '还需补牌' };
  }
  // ---- 庄 3张牌
  if (analysisInfo.b.length === 3 && analysisInfo.p.length === 2) {
    // 庄 3张牌 闲 2张牌
    if (countResult.bCountValue >= 7) return { b: '不需补牌' };
  }
  if (analysisInfo.b.length === 3 && analysisInfo.p.length === 3) {
    // 庄 3张牌 闲 3张牌
    const tInfo = getPokerInfo(analysisInfo.p[2]);
    const oInfo = getPokerInfo(analysisInfo.b[0]);
    const wInfo = getPokerInfo(analysisInfo.b[1]);
    const three = baccaratValueMap[tInfo.value] % 10; // 闲 第三张点数
    const one = baccaratValueMap[oInfo.value]; // 庄 第1张点数
    const two = baccaratValueMap[wInfo.value]; // 庄 第2张点数
    const countValue = (one + two) % 10;
    console.log(countValue, '------------------000');
    if (countValue === 3 && [8].includes(three)) return { b: '不需补牌' };
    if (countValue === 4 && [0, 1, 8, 9].includes(three)) return { b: '不需补牌' };
    if (countValue === 5 && [0, 1, 2, 3, 8, 9].includes(three)) return { b: '不需补牌' };
    if (countValue === 6 && [0, 1, 2, 3, 4, 5, 8, 9].includes(three)) return { b: '不需补牌' };
    if (countValue >= 7) return { b: '不需补牌' };
  }
  // ---- 闲 2张牌
  if (analysisInfo.p.length === 2) {
    if (countResult.pCountValue <= 5) return { p: '还需补牌' };
  }
  // ---- 闲 3张牌
  if (analysisInfo.p.length === 3) {
    const oInfo = getPokerInfo(analysisInfo.p[0]);
    const wInfo = getPokerInfo(analysisInfo.p[1]);
    const one = baccaratValueMap[oInfo.value]; // 闲 第1张点数
    const two = baccaratValueMap[wInfo.value]; // 闲 第2张点数
    const countValue = (one + two) % 10;
    if (countValue >= 6) return { p: '不需补牌' };
  }
  return null;
};

// 根据名称获取点数以及花色
export const getPokerInfo = (cardString) => {
  // 验证输入格式（允许点数后有无空格）
  if (!/^([2-9]|10|[JQKA])[\sHSDC]*$/.test(cardString)) {
    throw new Error('无效的扑克牌格式');
  }
  // 分离点数和花色
  const rankMatch = cardString.match(/^(10|[2-9JQKAjqka])/i);
  const suitMatch = cardString.match(/[HSDC]+$/);
  if (!rankMatch || !suitMatch) {
    throw new Error('无法解析点数和花色');
  }
  // 标准化点数（大写字母）和花色（Unicode符号）
  const rank = rankMatch[0].toUpperCase();
  const suitSymbol = suitMatch[0];
  return {
    value: rank,
    symbol: suitSymbol
  };
};

// 根据返回的点数信息返回检查结果
export const pokerCheckBaccarat = (analysisInfo) => {
  try {
    const hitItem = [];
    // 检查张数
    const bList = analysisInfo.b ?? [];
    const pList = analysisInfo.p ?? [];
    if (bList.length <= 0 || bList.length > 3 || pList.length <= 0 || pList.length > 3)
      return { check: false, msg: '请检查扑克牌识别的张数，请检查' };
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
        if (bList.length === 2) hitItem.push(BACCARAT_CARD_TYPE.luck_6_2); // 命中 幸运6两张牌
        if (bList.length === 3) hitItem.push(BACCARAT_CARD_TYPE.luck_6_3); // 命中 幸运6三张牌
      }
    }
    // 命中 闲赢
    if (bCountValue < pCountValue) {
      hitItem.push(BACCARAT_CARD_TYPE.player);
      if (pCountValue === 7) hitItem.push(BACCARAT_CARD_TYPE.luck_7); // 命中 幸运7
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
      hitItem.push(BACCARAT_CARD_TYPE.master_pair);
      hitItem.push(BACCARAT_CARD_TYPE.pair_any); // 命中 任意对子
      if (pShape[0] === pShape[1]) hitItem.push(BACCARAT_CARD_TYPE.pair_perfect); // 命中 完美对子
    }
    return { check: true, bCountValue, pCountValue, hitItem: hitItem };
  } catch (e) {
    return { check: false, msg: '扑克牌识别错误，请检查' };
  }
};
