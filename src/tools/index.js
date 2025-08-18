export const deepCopy = (original) => JSON.parse(JSON.stringify(original));

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
