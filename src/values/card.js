// 牌型-百家乐
export const BACCARAT_CARD_TYPE = {
  master: 'master', // 庄赢
  player: 'player', // 闲赢
  draw: 'draw', // 和局
  master_pair: 'master_pair', // 庄对
  player_pair: 'player_pair', // 闲对
  pair_any: 'pair_any', // 任意对子
  pair_perfect: 'pair_perfect', // 完美对子
  luck_6: 'luck_6', // 幸运6
  luck_6_2: 'luck_6_2', // 幸运6两张牌
  luck_6_3: 'luck_6_3', // 幸运6三张牌
  luck_7: 'luck_7', // 幸运7
  other: 'other' // 其他
};

// 牌型-牛牛
export const NIU_CARD_TYPE = {
  niu_5hua: 'niu_5hua', // 5公
  niu_niu: 'niu_niu', // 牛牛
  niu_9: 'niu_9',
  niu_8: 'niu_8',
  niu_7: 'niu_7',
  niu_6: 'niu_6',
  niu_5: 'niu_5',
  niu_4: 'niu_4',
  niu_3: 'niu_3',
  niu_2: 'niu_2',
  niu_1: 'niu_1',
  other: 'other' // 其他
};

// 彩金牌型
export const BONUS_CARD_TYPE = {
  royal_flush: 'royal_flush', // 皇家同花顺
  flush: 'flush', // 同花顺
  same_flower: 'same_flower', // 同花
  straight: 'straight', // 顺子
  gourd: 'gourd', // 葫芦
  other: 'other' // 其他
};
