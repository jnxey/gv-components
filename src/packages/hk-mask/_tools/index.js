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
