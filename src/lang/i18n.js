import { language } from '@/lang/index';
import { shallowRef } from 'vue';

// 国际化设置
const translateMap = shallowRef({});

// $t方法，用法参考vue-i18n
export function $t(url, params) {
  let value = getPath(url, language);
  if (!!translateMap.value[url]) value = translateMap.value[url];
  return typeof value === 'string' ? render(value, params || {}) : url;
}

// 设置国际化设置值
export const setTranslateMap = (value) => {
  translateMap.value = value;
};

// 获取参数对应的值
function getPath(path, map) {
  if (typeof path !== 'string') return '';
  let paths = path.split('.');
  let result = map;
  for (let i = 0; i <= paths.length - 1; i++) {
    if (typeof result === 'object' && result !== null) {
      result = result[paths[i]];
    } else {
      result = undefined;
    }
  }
  return result;
}

// 获取路径对应的值
function render(template, context) {
  var tokenReg = /(\\)?\{([^{}\\]+)(\\)?}/g;
  return template.replace(tokenReg, function (word, slash1, token, slash2) {
    if (slash1 || slash2) {
      return word.replace('\\', '');
    }
    let variables = token.replace(/\s/g, '').split('.');
    let currentObject = context;
    let i, length, variable;
    for (i = 0, length = variables.length, variable = variables[i]; i < length; ++i) {
      currentObject = currentObject[variable];
      if (currentObject === undefined || currentObject === null) return '';
    }
    return currentObject;
  });
}
