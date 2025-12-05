// 牌点数
export const POKER_VALUE = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
// 牌花色
export const POKER_SHAPE = ['H', 'D', 'C', 'S'];

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

// 牌型-龙虎
export const LONG_HU_CARD_TYPE = {
  master: 'master', // 龙赢
  player: 'player', // 虎赢
  draw: 'draw', // 和局
  pair_any: 'pair_any' // 任意对子
};

// 牌型-牛牛
export const NIU_CARD_TYPE = {
  niu_5small: 'niu_5small', // 5小
  niu_bomb: 'niu_bomb', // 炸弹
  niu_5hua: 'niu_5hua', // 5花
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
  niu_none: 'niu_none',
  other: 'other' // 其他
};

// 牌型-牛牛-字典
export const NIU_CARD_TYPE_DICT = [
  { name: '五小牛', value: NIU_CARD_TYPE.niu_5small },
  { name: '炸弹牛', value: NIU_CARD_TYPE.niu_bomb },
  { name: '五花牛', value: NIU_CARD_TYPE.niu_5hua },
  { name: '牛牛', value: NIU_CARD_TYPE.niu_niu },
  { name: '牛9', value: NIU_CARD_TYPE.niu_9 },
  { name: '牛8', value: NIU_CARD_TYPE.niu_8 },
  { name: '牛7', value: NIU_CARD_TYPE.niu_7 },
  { name: '牛6', value: NIU_CARD_TYPE.niu_6 },
  { name: '牛5', value: NIU_CARD_TYPE.niu_5 },
  { name: '牛4', value: NIU_CARD_TYPE.niu_4 },
  { name: '牛3', value: NIU_CARD_TYPE.niu_3 },
  { name: '牛2', value: NIU_CARD_TYPE.niu_2 },
  { name: '牛1', value: NIU_CARD_TYPE.niu_1 },
  { name: '无牛', value: NIU_CARD_TYPE.niu_none },
  { name: '其他', value: BACCARAT_CARD_TYPE.other }
];

// 牌型-三公
export const SAN_GONG_CARD_TYPE = {
  san_tiao: 'san_tiao', // 三条
  san_gong: 'san_gong', // 三公
  point_9: 'point_9',
  point_8: 'point_8',
  point_7: 'point_7',
  point_6: 'point_6',
  point_5: 'point_5',
  point_4: 'point_4',
  point_3: 'point_3',
  point_2: 'point_2',
  point_1: 'point_1',
  point_0: 'point_0',
  other: 'other' // 其他
};

// 牌型-三公-字典
export const SAN_GONG_CARD_TYPE_DICT = [
  { name: '三条', value: SAN_GONG_CARD_TYPE.san_tiao },
  { name: '三公', value: SAN_GONG_CARD_TYPE.san_gong },
  { name: '9点', value: SAN_GONG_CARD_TYPE.point_9 },
  { name: '8点', value: SAN_GONG_CARD_TYPE.point_8 },
  { name: '7点', value: SAN_GONG_CARD_TYPE.point_7 },
  { name: '6点', value: SAN_GONG_CARD_TYPE.point_6 },
  { name: '5点', value: SAN_GONG_CARD_TYPE.point_5 },
  { name: '4点', value: SAN_GONG_CARD_TYPE.point_4 },
  { name: '3点', value: SAN_GONG_CARD_TYPE.point_3 },
  { name: '2点', value: SAN_GONG_CARD_TYPE.point_2 },
  { name: '1点', value: SAN_GONG_CARD_TYPE.point_1 },
  { name: '单牌', value: SAN_GONG_CARD_TYPE.point_0 },
  { name: '其他', value: SAN_GONG_CARD_TYPE.other }
];

// 彩金牌型
export const BONUS_CARD_TYPE = {
  royal_flush: 'royal_flush', // 皇家同花顺
  flush: 'flush', // 同花顺
  same_flower: 'same_flower', // 同花
  straight: 'straight', // 顺子
  gourd: 'gourd', // 葫芦
  other: 'other' // 其他
};

// 牌型-输赢-字典
export const CARD_WIN_DICT = [
  { name: 'Win', value: 'p' },
  { name: 'Loss', value: 'b' },
  { name: 'Draw', value: 'd' }
];
