// 全局保存当前选中窗口
const ErrorCodes = {
  1001: '码流传输过程异常',
  1002: '回放结束',
  1003: '取流失败，连接被动断开',
  1004: '对讲连接被动断开',
  1005: '广播连接被动断开',
  1006: '视频编码格式不支持 目前只支持h264 和 h265',
  1007: '网络异常导致websocket断开',
  1008: '首帧回调超时',
  1009: '对讲码流传输过程异常',
  1010: '广播码流传输过程异常',
  1011: '数据接收异常，请检查是否修改了视频格式',
  1012: '播放资源不足',
  1013: '当前环境不支持该鱼眼展开模式',
  1014: '外部强制关闭了',
  1015: '获取播放url失败',
  1016: '文件下载完成',
  1017: '密码错误',
  1018: '链接到萤石平台失败',
  1019: '未找到录像片段',
  1020: '水印模式等场景，当前通道需要重新播放',
  1021: '缓存溢出',
  1022: '采集音频失败，可能是在非https/localhost域下使用对讲导致,或者没有插耳机等'
};

// 初始化
export function initHKPlugin({ cbSelWindCallback } = {}) {
  window.g_iWndIndex = 0; // 可以不用设置这个变量，有窗口参数的接口中，不用传值，开发包会默认使用当前选择窗口
  window.g_szRecordType = ''; // 录像类型
  window.HK_CHANNEL_LIST = []; // 数字通道
  window.DEVICE_PORT = {};
  // 检查浏览器是否支持无插件
  var iRet = window.WebVideoCtrl.I_SupportNoPlugin();
  if (!iRet) return alert('Not Support HIKVision');
  // 初始化插件参数及插入无插件
  WebVideoCtrl.I_InitPlugin('100%', '100%', {
    bWndFull: false, //是否支持单窗口双击全屏，默认支持 true:支持 false:不支持
    iPackageType: 2,
    iWndowType: 1,
    bNoPlugin: true,
    cbSelWnd: function (xmlDoc) {
      window.g_iWndIndex = parseInt($(xmlDoc).find('SelectWnd').eq(0).text(), 10);
      console.log('showCBInfo', '当前选择的窗口编号：' + window.g_iWndIndex);
      setSelectedBorder(window.g_iWndIndex);
      if (!!cbSelWindCallback) cbSelWindCallback(window.g_iWndIndex);
    },
    cbDoubleClickWnd: function (iWndIndex, bFullScreen) {
      let szInfo = '当前放大的窗口编号：' + iWndIndex;
      if (!bFullScreen) szInfo = '当前还原的窗口编号：' + iWndIndex;
      console.log('showCB', szInfo);
    },
    cbEvent: function (iEventType, iParam1, iParam2) {
      if (2 === iEventType) {
        // 回放正常结束
        console.log('showCBInfo', '窗口' + iParam1 + '回放结束！');
      } else if (-1 === iEventType) {
        console.log('showCBInfo', '设备' + iParam1 + '网络错误！');
      } else if (3001 === iEventType) {
        clickStopRecord(window.g_szRecordType, iParam1);
      }
    },
    cbRemoteConfig: function () {
      console.log('showCBInfo', '关闭远程配置库！');
    },
    cbInitPluginComplete: function () {
      WebVideoCtrl.I_InsertOBJECTPlugin('divPlugin');
    },
    cbPluginErrorHandler: function (iWndIndex, iErrorCode, oError) {
      // 插件错误回调
      console.log('showCBInfo', '窗口' + iWndIndex + '：' + ErrorCodes[iErrorCode]);
      const oWndInfo = WebVideoCtrl.I_GetWindowStatus(iWndIndex);
      if (oWndInfo != null) {
        WebVideoCtrl.I_Stop({
          success: function () {
            console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' 停止预览成功！');
          },
          error: function () {
            console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' 停止预览失败！');
          }
        });
      }
    },
    cbPerformanceLack: function () {
      // 性能不足回调
      console.log('showCBInfo', '性能不足！');
    },
    cbSecretKeyError: function (iWndIndex) {
      // 码流加密秘钥错误回调
      console.log('showCBInfo', '窗口' + iWndIndex + '：码流加密秘钥错误！');
      const oWndInfo = WebVideoCtrl.I_GetWindowStatus(iWndIndex);
      if (oWndInfo != null) {
        WebVideoCtrl.I_Stop({
          success: function () {
            console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' 停止预览成功！');
          },
          error: function () {
            console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' 停止预览失败！');
          }
        });
      }
    }
  });
}

// 登录
export function clickLogin({ szIP, szPort, szUsername, szPassword }) {
  return new Promise((resolve, reject) => {
    if ('' === szIP || '' === szPort) return reject();
    const szDeviceIdentify = szIP + '_' + szPort;
    const iRet = WebVideoCtrl.I_Login(szIP, 1, szPort, szUsername, szPassword, {
      success: async (xmlDoc) => {
        console.log('showOPInfo', szDeviceIdentify + ' 登录成功！');
        await getChannelInfo(szDeviceIdentify);
        await getDevicePort(szDeviceIdentify);
        resolve();
      },
      error: function (status, xmlDoc) {
        console.log('showOPInfo', szDeviceIdentify + ' 登录失败！', status, xmlDoc);
        reject();
      }
    });
    if (-1 === iRet) console.log('showOPInfo', szDeviceIdentify + ' 已登录过！');
  });
}

// 获取通道
export function getChannelInfo(szDeviceIdentify) {
  return new Promise((resolve, reject) => {
    window.HK_CHANNEL_LIST = [];
    if (null == szDeviceIdentify) return resolve();
    // 数字通道
    WebVideoCtrl.I_GetDigitalChannelInfo(szDeviceIdentify, {
      async: false,
      success: function (xmlDoc) {
        var oChannels = $(xmlDoc).find('InputProxyChannelStatus');
        $.each(oChannels, function (i) {
          var id = $(this).find('id').eq(0).text(),
            name = $(this).find('name').eq(0).text(),
            online = $(this).find('online').eq(0).text();
          if ('false' === online) return true;
          if ('' === name) name = 'IPCamera ' + (i < 9 ? '0' + (i + 1) : i + 1);
          window.HK_CHANNEL_LIST.push({ id, name, bZero: false });
        });
        console.log('showOPInfo', szDeviceIdentify + ' 获取数字通道成功！');
        console.log(window.HK_CHANNEL_LIST, '---------------channel-list');
        return resolve();
      },
      error: function (status, xmlDoc) {
        console.log('showOPInfo', szDeviceIdentify + ' 获取数字通道失败！', status, xmlDoc);
        return reject();
      }
    });
  });
}

// 获取端口
export function getDevicePort(szDeviceIdentify) {
  return new Promise((resolve, reject) => {
    if (null == szDeviceIdentify) return resolve();
    window.DEVICE_PORT = {};
    var oPort = WebVideoCtrl.I_GetDevicePort(szDeviceIdentify);
    if (oPort != null) {
      window.DEVICE_PORT = { ...oPort };
      console.log(window.DEVICE_PORT, '---------------device-port');
      console.log('showOPInfo', szDeviceIdentify + ' 获取端口成功！');
      return resolve();
    } else {
      console.log('showOPInfo', szDeviceIdentify + ' 获取端口失败！');
      return reject();
    }
  });
}

// 停止录像
export function clickStopRecord(szType, iWndIndex) {
  if ('undefined' === typeof iWndIndex) iWndIndex = window.g_iWndIndex;

  const oWndInfo = WebVideoCtrl.I_GetWindowStatus(iWndIndex);
  let szInfo = '';

  if (oWndInfo != null) {
    WebVideoCtrl.I_StopRecord({
      success: function () {
        if ('realplay' === szType) szInfo = '停止录像成功！';
        else if ('playback' === szType) szInfo = '停止剪辑成功！';
        console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' ' + szInfo);
      },
      error: function () {
        if ('realplay' === szType) szInfo = '停止录像失败！';
        else if ('playback' === szType) szInfo = '停止剪辑失败！';
        console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' ' + szInfo);
      }
    });
  }
}

// 开始预览
export function clickStartRealPlay({ szDeviceIdentify, iRtspPort, iChannelID, bZeroChannel, iStreamType, windowIndex = window.g_iWndIndex }) {
  const oWndInfo = WebVideoCtrl.I_GetWindowStatus(windowIndex);
  let szInfo = '';
  console.log({ szDeviceIdentify, iRtspPort, iChannelID, bZeroChannel, iStreamType, windowIndex }, '-------------------preview');
  if (null == szDeviceIdentify) return;
  var startRealPlay = function () {
    WebVideoCtrl.I_StartRealPlay(szDeviceIdentify, {
      iRtspPort: iRtspPort,
      iStreamType: iStreamType,
      iChannelID: iChannelID,
      bZeroChannel: bZeroChannel,
      iWndIndex: windowIndex,
      bProxy: false, // ws取流协议是否要过Nginx
      success: function () {
        szInfo = '开始预览成功！';
        console.log('showOPInfo', szDeviceIdentify + ' ' + szInfo);
      },
      error: function (status, xmlDoc) {
        if (403 === status) szInfo = '设备不支持Websocket取流！';
        else szInfo = '开始预览失败！';
        console.log('showOPInfo', szDeviceIdentify + ' ' + szInfo);
      }
    });
  };

  if (oWndInfo != null) {
    // 已经在播放了，先停止
    WebVideoCtrl.I_Stop({ success: () => startRealPlay() });
  } else {
    startRealPlay();
  }
}

// 解析数据
function uint8ArrayToBase64(uint8Array) {
  return new Promise((resolve) => {
    const blob = new Blob([uint8Array]);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}

// 抓图数据
export function clickCapturePicData(szChannelID, callback) {
  const oWndInfo = WebVideoCtrl.I_GetWindowStatus(window.g_iWndIndex);
  if (oWndInfo != null) {
    let szPicName = oWndInfo.szDeviceIdentify + '_' + szChannelID + '_' + new Date().getTime();
    szPicName += '.jpg';
    WebVideoCtrl.I2_CapturePic(szPicName, {
      cbCallback: (uint8Array) => {
        uint8ArrayToBase64(uint8Array).then((base64String) => {
          callback(base64String);
        });
      }
    }).then(
      function () {
        console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' 抓图数据打印成功！');
      },
      function () {
        console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' 抓图数据打印失败！');
      }
    );
  }
}

// 设置窗口布局
/*
  <option value="1" selected>1x1</option>1
  <option value="2">2x2</option>4
  <option value="3">3x3</option>9
  <option value="4">4x4</option>16
  <option value="5">5x5</option>25
  <option value="6">6x6</option>36
  <option value="7">7x7</option>49
  <option value="8">8x8</option>64
 */
export function setWindowLayout(len) {
  if (len === 1) {
    WebVideoCtrl.I_ChangeWndNum(1);
  } else if (len > 1 && len <= 4) {
    WebVideoCtrl.I_ChangeWndNum(2);
  } else if (len > 4 && len <= 9) {
    WebVideoCtrl.I_ChangeWndNum(3);
  } else if (len > 9 && len <= 16) {
    WebVideoCtrl.I_ChangeWndNum(4);
  } else if (len > 16 && len <= 25) {
    WebVideoCtrl.I_ChangeWndNum(5);
  } else if (len > 25 && len <= 36) {
    WebVideoCtrl.I_ChangeWndNum(6);
  } else if (len > 36 && len <= 49) {
    WebVideoCtrl.I_ChangeWndNum(7);
  } else if (len > 49) {
    WebVideoCtrl.I_ChangeWndNum(8);
  }
}

// 设置选中窗口的边框样式
export function setSelectedBorder(windowIndex) {
  // remove
  const cur = document.body.querySelector('.hk-selected-mark');
  if (!!cur) cur.classList.remove('hk-selected-mark');
  // add
  const nCur = document.body.querySelector(`#divPluginplayer-container-${windowIndex}`);
  if (!!nCur) nCur.classList.add('hk-selected-mark');
}

// 设置某个窗口选中
export function setSelectedWindow(index) {
  const target = document.body.querySelector(`#divPluginplayer-container-${index}`);
  if (!!target) {
    // 创建鼠标事件对象
    const event = new MouseEvent('mousedown', {
      bubbles: true, // 事件冒泡
      cancelable: true, // 事件可取消
      view: window, // 关联窗口对象
      clientX: 100, // 自定义点击坐标（可选）
      clientY: 50
    });
    target.dispatchEvent(event);
  }
}
