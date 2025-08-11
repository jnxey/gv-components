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
