import { TUI_TONG_ZI_TYPE } from '@/values/card.js';
import { $t } from '@/lang/i18n.js';
import { POINTS_GENERAL_LIST } from '@/values/index.js';

// 点数值对应
const tongZiValueMap = {
  '6D': 6,
  '6B': 6,
  '8B': 8,
  '9B': 9,
  '7B': 7,
  '4C': 4,
  '5D': 5,
  '2F': 0,
  '4D': 4,
  '3D': 3,
  '5B': 5,
  '7D': 7,
  '3C': 3,
  '2C': 2,
  '1C': 1,
  '8D': 8,
  '4B': 4,
  '9D': 9,
  '1D': 1,
  EW: 0,
  '2B': 2,
  '1B': 1,
  '3B': 3,
  '4S': 0,
  '2S': 0,
  '3F': 0,
  '1S': 0,
  '3S': 0,
  '1F': 0,
  '4F': 0,
  NW: 0,
  SW: 0,
  RD: 0,
  WW: 0,
  WD: 0,
  '8C': 8,
  '6C': 6,
  '2D': 2,
  '5C': 5,
  GD: 0,
  '7C': 7,
  '9C': 9
};

// 命中牌型
function _calculateTongZi(hand) {
  const points = hand.map((card) => tongZiValueMap[card]);

  // 判断双宝
  if (points[0] === 0 && points[1] === 0) {
    return { type: TUI_TONG_ZI_TYPE.shuang_bao, value: 10 }; // 10为最大
  }

  // 普通点数
  let sum = (points[0] + points[1]) % 10;

  return { type: TUI_TONG_ZI_TYPE[`point_${sum}`], value: sum, max: Math.max(points[0], points[1]) };
}

// 比较两副牌大小
function _compareHands(hand1, hand2) {
  const result1 = _calculateTongZi(hand1);
  const result2 = _calculateTongZi(hand2);

  const result = { poker: result2, winner: null };

  // 基础牌型比较
  if (result1.value > result2.value) return { ...result, winner: 'b' };
  if (result1.value < result2.value) return { ...result, winner: 'p' };

  // 都是0点，庄赢
  if ((result1.value === result2.value) === 0) return { ...result, winner: 'b' };

  // 相同点数，庄单牌大
  if (result1.value === result2.value && result1.max > result2.max) return { ...result, winner: 'b' };

  // 相同点数，闲单牌大
  if (result1.value === result2.value && result1.max < result2.max) return { ...result, winner: 'p' };

  return { ...result, winner: 'd' };
}

// 根据返回的点数信息返回检查结果
export const majiangCheckTuiTongZi = (analysisInfo) => {
  try {
    const hitItem = {};
    // 检查张数
    const aMap = {};
    POINTS_GENERAL_LIST.forEach((name) => (aMap[name] = !!analysisInfo[name] ? analysisInfo[name].map((item) => item) : []));
    for (let i = 0; i < POINTS_GENERAL_LIST.length; i++) {
      const name = POINTS_GENERAL_LIST[i];
      if (name === 'b' && aMap[name].length !== 2) return { check: false, msg: { [name]: $t('common.tools.tips_err_5') } };
      if (name !== 'b' && aMap[name].length !== 2 && aMap[name].length !== 0) return { check: false, msg: { [name]: $t('common.tools.tips_err_5') } };
    }
    // 命中
    for (let i = 0; i < POINTS_GENERAL_LIST.length; i++) {
      const name = POINTS_GENERAL_LIST[i];
      if (name === 'b') {
        hitItem[name] = { poker: _calculateTongZi(aMap[name]) };
      } else if (aMap[name].length !== 0) {
        hitItem[name] = _compareHands(aMap['b'], aMap[name]);
      }
    }

    return { check: true, hitItem: hitItem };
  } catch (e) {
    return { check: false, msg: { b: $t('common.tools.tips_err_6'), p: $t('common.tools.tips_err_6') } };
  }
};
