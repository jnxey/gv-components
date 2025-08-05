// 全局保存当前选中窗口
var g_iWndIndex = 0; //可以不用设置这个变量，有窗口参数的接口中，不用传值，开发包会默认使用当前选择窗口
var version = 'websdk3.220191023';
var FileTemp = null;
var ErrorCodes = {
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
export function initHKPlugin() {
  // 检查浏览器是否支持无插件
  var iRet = window.WebVideoCtrl.I_SupportNoPlugin();
  if (!iRet) {
    alert('当前浏览器版本过低，不支持无插件，请升级后再试！');
    return;
  }

  // 初始化插件参数及插入无插件
  WebVideoCtrl.I_InitPlugin('100%', '100%', {
    bWndFull: false, //是否支持单窗口双击全屏，默认支持 true:支持 false:不支持
    iPackageType: 2,
    //szColorProperty:"plugin-background:0000ff; sub-background:0000ff; sub-border:00ffff; sub-border-select:0000ff",   //2:PS 11:MP4
    iWndowType: 1,
    bNoPlugin: true,
    cbSelWnd: function (xmlDoc) {
      var szInfo = '当前选择的窗口编号：' + g_iWndIndex;
      console.log('showCBInfo', szInfo);
    },
    cbDoubleClickWnd: function (iWndIndex, bFullScreen) {
      var szInfo = '当前放大的窗口编号：' + iWndIndex;
      if (!bFullScreen) {
        szInfo = '当前还原的窗口编号：' + iWndIndex;
      }
      console.log('showCB', szInfo);
    },
    cbEvent: function (iEventType, iParam1, iParam2) {
      if (2 === iEventType) {
        // 回放正常结束
        console.log('showCBInfo', '窗口' + iParam1 + '回放结束！');
      } else if (-1 === iEventType) {
        console.log('showCBInfo', '设备' + iParam1 + '网络错误！');
      } else if (3001 === iEventType) {
        clickStopRecord(g_szRecordType, iParam1);
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
      var oWndInfo = WebVideoCtrl.I_GetWindowStatus(iWndIndex),
        szInfo = '';

      if (oWndInfo != null) {
        WebVideoCtrl.I_Stop({
          success: function () {
            szInfo = '停止预览成功！';
            console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' ' + szInfo);
          },
          error: function () {
            szInfo = '停止预览失败！';
            console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' ' + szInfo);
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
      var oWndInfo = WebVideoCtrl.I_GetWindowStatus(iWndIndex),
        szInfo = '';

      if (oWndInfo != null) {
        WebVideoCtrl.I_Stop({
          success: function () {
            szInfo = '停止预览成功！';
            console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' ' + szInfo);
          },
          error: function () {
            szInfo = '停止预览失败！';
            console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' ' + szInfo);
          }
        });
      }
    }
  });
}

// 登录
export function clickLogin({ szIP, szPort, szUsername, szPassword }) {
  return new Promise((resolve, reject) => {
    if ('' === szIP || '' === szPort) {
      return reject();
    }

    var szDeviceIdentify = szIP + '_' + szPort;

    var iRet = WebVideoCtrl.I_Login(szIP, 1, szPort, szUsername, szPassword, {
      success: function (xmlDoc) {
        console.log('showOPInfo', szDeviceIdentify + ' 登录成功！');
        setTimeout(() => {
          getChannelInfo(szDeviceIdentify);
          getDevicePort(szDeviceIdentify);
        }, 10);
        resolve();
      },
      error: function (status, xmlDoc) {
        console.log('showOPInfo', szDeviceIdentify + ' 登录失败！', status, xmlDoc);
        reject(szDeviceIdentify + ' 登录失败！', status, xmlDoc);
      }
    });

    if (-1 === iRet) {
      console.log('showOPInfo', szDeviceIdentify + ' 已登录过！');
    }
  });
}

// 获取通道
export function getChannelInfo(szDeviceIdentify) {
  var oSel = [];

  if (null == szDeviceIdentify) {
    return;
  }

  // 模拟通道
  WebVideoCtrl.I_GetAnalogChannelInfo(szDeviceIdentify, {
    async: false,
    success: function (xmlDoc) {
      console.log('showOPInfo', szDeviceIdentify + ' 获取模拟通道成功！');
    },
    error: function (status, xmlDoc) {
      console.log('showOPInfo', szDeviceIdentify + ' 获取模拟通道失败！', status, xmlDoc);
    }
  });
  // 数字通道
  WebVideoCtrl.I_GetDigitalChannelInfo(szDeviceIdentify, {
    async: false,
    success: function (xmlDoc) {
      console.log('showOPInfo', szDeviceIdentify + ' 获取数字通道成功！');
    },
    error: function (status, xmlDoc) {
      console.log('showOPInfo', szDeviceIdentify + ' 获取数字通道失败！', status, xmlDoc);
    }
  });
  // 零通道
  WebVideoCtrl.I_GetZeroChannelInfo(szDeviceIdentify, {
    async: false,
    success: function (xmlDoc) {
      console.log('showOPInfo', szDeviceIdentify + ' 获取零通道成功！');
    },
    error: function (status, xmlDoc) {
      console.log('showOPInfo', szDeviceIdentify + ' 获取零通道失败！', status, xmlDoc);
    }
  });
}

// 获取端口
export function getDevicePort(szDeviceIdentify) {
  if (null == szDeviceIdentify) {
    return;
  }

  var oPort = WebVideoCtrl.I_GetDevicePort(szDeviceIdentify);
  if (oPort != null) {
    console.log('showOPInfo', szDeviceIdentify + ' 获取端口成功！');
  } else {
    console.log('showOPInfo', szDeviceIdentify + ' 获取端口失败！');
  }
}

// 停止录像
export function clickStopRecord(szType, iWndIndex) {
  if ('undefined' === typeof iWndIndex) {
    iWndIndex = g_iWndIndex;
  }
  var oWndInfo = WebVideoCtrl.I_GetWindowStatus(iWndIndex),
    szInfo = '';

  if (oWndInfo != null) {
    WebVideoCtrl.I_StopRecord({
      success: function () {
        if ('realplay' === szType) {
          szInfo = '停止录像成功！';
        } else if ('playback' === szType) {
          szInfo = '停止剪辑成功！';
        }
        console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' ' + szInfo);
      },
      error: function () {
        if ('realplay' === szType) {
          szInfo = '停止录像失败！';
        } else if ('playback' === szType) {
          szInfo = '停止剪辑失败！';
        }
        console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' ' + szInfo);
      }
    });
  }
}

// 开始预览
export function clickStartRealPlay({ szDeviceIdentify, iRtspPort, iChannelID, bZeroChannel, iStreamType }) {
  var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
    szInfo = '';

  console.log({ szDeviceIdentify, iRtspPort, iChannelID, bZeroChannel, iStreamType });

  if (null == szDeviceIdentify) {
    return;
  }
  var startRealPlay = function () {
    WebVideoCtrl.I_StartRealPlay(szDeviceIdentify, {
      iRtspPort: iRtspPort,
      iStreamType: iStreamType,
      iChannelID: iChannelID,
      bZeroChannel: bZeroChannel,
      bProxy: false, // ws取流协议是否要过Nginx
      success: function () {
        szInfo = '开始预览成功！';
        console.log('showOPInfo', szDeviceIdentify + ' ' + szInfo);
      },
      error: function (status, xmlDoc) {
        if (403 === status) {
          szInfo = '设备不支持Websocket取流！';
        } else {
          szInfo = '开始预览失败！';
        }
        console.log('showOPInfo', szDeviceIdentify + ' ' + szInfo);
      }
    });
  };

  if (oWndInfo != null) {
    // 已经在播放了，先停止
    WebVideoCtrl.I_Stop({
      success: function () {
        startRealPlay();
      }
    });
  } else {
    startRealPlay();
  }
}

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
  var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
    szInfo = '';

  if (oWndInfo != null) {
    var szPicName = oWndInfo.szDeviceIdentify + '_' + szChannelID + '_' + new Date().getTime();

    szPicName += '.jpg';

    WebVideoCtrl.I2_CapturePic(szPicName, {
      cbCallback: (uint8Array) => {
        uint8ArrayToBase64(uint8Array).then((base64String) => {
          callback(base64String);
        });
      }
    }).then(
      function () {
        szInfo = '抓图数据打印成功！';
        console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' ' + szInfo);
      },
      function () {
        szInfo = '抓图数据打印失败！';
        console.log('showOPInfo', oWndInfo.szDeviceIdentify + ' ' + szInfo);
      }
    );
  }
}
