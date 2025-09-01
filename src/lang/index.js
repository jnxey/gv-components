import zh_CN from '@/lang/zh-CN/_index';
import en_US from '@/lang/en-US/_index';

export const languageField = { zhCN: 'zh-CN', enUS: 'en-US' };

export const languageAll = { 'zh-CN': zh_CN, 'en-US': en_US };

export let languageCurrent = languageField.zhCN;

export let language = languageAll[languageCurrent];

export const languageSet = async (code) => {
  if (!code) return;
  if (code !== languageField.zhCN) code = languageField.enUS;
  languageCurrent = code;
  language = languageAll[code];
};
