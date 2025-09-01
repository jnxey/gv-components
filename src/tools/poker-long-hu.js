import { LONG_HU_CARD_TYPE } from '@/values/card.js';
import { getPokerInfo } from '@/tools/index.js';
import { $t } from '@/lang/i18n.js';

// 龙虎点数值对应
const longHuValueMap = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13, A: 1 };

// 根据返回的点数信息返回检查结果
export const pokerCheckLongHu = (analysisInfo) => {
  try {
    const hitItem = [];
    // 检查张数
    const bList = analysisInfo.b ?? [];
    const pList = analysisInfo.p ?? [];
    if (bList.length !== 1) return { check: false, msg: { b: $t('common.tools.tips_err_5') } };
    if (pList.length !== 1) return { check: false, msg: { p: $t('common.tools.tips_err_5') } };
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
    return { check: false, msg: { b: $t('common.tools.tips_err_6'), p: $t('common.tools.tips_err_6') } };
  }
};
