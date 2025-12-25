/**
 * 判断数据类型
 */
export const getType = (value) => Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
export const isNumber = (value) => getType(value) === 'number';
export const isString = (value) => getType(value) === 'string';
export const isArray = (value) => getType(value) === 'array';
export const isObject = (value) => getType(value) === 'object';
export const isBoolean = (value) => getType(value) === 'boolean';
export const isFunction = (value) => getType(value).toLowerCase().indexOf('function') > -1;
export const isNull = (value) => getType(value) === 'null';
export const isUndefined = (value) => getType(value) === 'undefined';
export const isPromise = (value) => getType(value) === 'promise';
export const isNode = (value) => !isNull(value) && !isUndefined(value) && Boolean(value.nodeName) && Boolean(value.nodeType);
export const isElement = (value) => isNode(value) && value.nodeType === 1;
export const isEmpty = (value) => value === undefined || value === '' || value === null;

/**
 *  同步对象数据
 */
export const syncObjectData = (target, remote) => {
  Object.keys(target).forEach(function (name) {
    if (remote[name] !== undefined) {
      target[name] = remote[name];
    }
  });
  return target;
};

/**
 * 延时执行
 */
export const delayExec = (time) => {
  let timer = null;
  return new Promise((resolve) => {
    timer = setTimeout(() => resolve(), time);
  });
};

/**
 * 深度克隆
 */
export const deepCopy = (json) => {
  let obj = null;
  if (isArray(json)) {
    obj = [];
    json.forEach((item) => obj.push(deepCopy(item)));
  } else if (isObject(json)) {
    obj = {};
    for (let key in json) {
      obj[key] = deepCopy(json[key]);
    }
  } else {
    return json;
  }
  return obj;
};

/**
 *  将数组转为对象
 */
export const mappingArrayToObject = (array = [], key = 'id') => {
  const result = {};
  if (!key) {
    array.forEach((item) => (result[item] = true));
  } else {
    array.forEach((item) => (result[item[key]] = item));
  }
  return result;
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
  return { value: rank, symbol: suitSymbol };
};

/**
 * 根据多边形坐标点切割图像
 * @param {HTMLImageElement} img - 要裁剪的图片对象
 * @param {Object} size - 大小
 * @param {Array<[number, number]>} points - 多边形点坐标
 * @returns {HTMLCanvasElement} - 裁剪后的Canvas对象
 */
export function clipImageByPolygon(img, size, points) {
  // 1. 创建 canvas，设置大小为图片尺寸
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const radioWidth = img.width / size.width;
  const radioHeight = img.height / size.height;

  // 1. 计算多边形包围框
  const xs = points.map((p) => p[0] * radioWidth);
  const ys = points.map((p) => p[1] * radioHeight);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  const boxWidth = maxX - minX;
  const boxHeight = maxY - minY;

  canvas.width = boxWidth;
  canvas.height = boxHeight;

  // 2. 创建裁剪路径
  ctx.beginPath();
  ctx.moveTo(points[0][0] * radioWidth - minX, points[0][1] * radioHeight - minY);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0] * radioWidth - minX, points[i][1] * radioHeight - minY);
  }
  ctx.closePath();

  // 3. 裁剪区域
  ctx.save();
  ctx.clip();

  // 4. 绘制图片到被裁剪区域中
  ctx.drawImage(img, minX, minY, boxWidth, boxHeight, 0, 0, boxWidth, boxHeight);

  ctx.restore();

  return canvas;
}

/**
 * 把已有 canvas 处理成640x640，保持比例并补边
 * @param {HTMLCanvasElement} inputCanvas - 原始canvas
 * @param {number} size - 目标大小，默认640
 * @returns {HTMLCanvasElement} - 处理后的640x640画布
 */
export function preprocessCanvas(inputCanvas, size = 640) {
  const iw = inputCanvas.width;
  const ih = inputCanvas.height;

  // 创建目标画布
  const outputCanvas = document.createElement('canvas');
  const ctx = outputCanvas.getContext('2d');
  outputCanvas.width = size;
  outputCanvas.height = size;

  // 默认缩放比例 = 1（不放大）
  let scale = 1;

  // 如果宽或高大于目标尺寸，则按比例缩小
  if (iw > size || ih > size) {
    scale = Math.min(size / iw, size / ih);
  }

  // 缩放后的宽高
  const newW = Math.round(iw * scale);
  const newH = Math.round(ih * scale);

  // 居中绘制
  const dx = Math.floor((size - newW) / 2);
  const dy = Math.floor((size - newH) / 2);

  // 填充黑色背景
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, size, size);

  // 绘制缩放后的原canvas
  ctx.drawImage(inputCanvas, 0, 0, iw, ih, dx, dy, newW, newH);

  return outputCanvas;
}

// 根据数值获取像素
export function getPX(num) {
  if (isString(num) && num.indexOf('px') > -1) return num;
  return num + 'px';
}

/**
 * 生成随机字符串
 * @param {number} length - 字符串长度
 * @param {string} [charset] - 可选，自定义字符集（默认为字母和数字）
 * @returns {string} - 随机字符串
 */
export function generateRandomString(length, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  const charsetLength = charset.length;
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charsetLength);
    result += charset[randomIndex];
  }
  return result;
}
