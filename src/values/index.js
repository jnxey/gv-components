// 游戏模型
export const GAME_MODEL = { baccarat: 1, niu_niu: 2, long_hu: 3, general: 99 };

// 百家乐/龙虎 点位描述
export const POINTS_BACCARAT = {
  b: { name: 'B', color: '#ff0303', fill: 'rgba(255,3,3,0.3)', class: 'area-box-b' },
  p: { name: 'P', color: '#046ee6', fill: 'rgba(4,110,230,0.3)', class: 'area-box-p' }
};

// 百家乐/龙虎 列表
export const POINTS_BACCARAT_LIST = ['b', 'p'];

// 牛牛 点位描述
export const POINTS_NIU = {
  b: { name: 'B', color: '#ff0303', fill: 'rgba(255,3,3,0.3)', class: 'area-box-b' },
  s1: { name: 'S1', color: '#046ee6', fill: 'rgba(4,110,230,0.3)', class: 'area-box-s1' },
  s2: { name: 'S2', color: '#046ee6', fill: 'rgba(4,110,230,0.3)', class: 'area-box-s2' },
  s3: { name: 'S3', color: '#046ee6', fill: 'rgba(4,110,230,0.3)', class: 'area-box-s3' },
  s5: { name: 'S5', color: '#046ee6', fill: 'rgba(4,110,230,0.3)', class: 'area-box-s4' },
  s6: { name: 'S6', color: '#046ee6', fill: 'rgba(4,110,230,0.3)', class: 'area-box-s5' },
  s7: { name: 'S7', color: '#046ee6', fill: 'rgba(4,110,230,0.3)', class: 'area-box-s6' }
};

// 百家乐/龙虎 列表
export const POINTS_NIU_LIST = ['b', 's1', 's2', 's3', 's5', 's6', 's7'];
