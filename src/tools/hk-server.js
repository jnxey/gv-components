import axios from 'axios';

export const HK_SERVER_BASE = 'http://192.168.1.114:9996';

// 获取通道
export function getChannelValue(id, isSmall = true) {
  return Number(id) * 100 + (isSmall ? 2 : 1);
}

// 获取设备信息
export async function getDeviceInfo({ ip, admin, password }) {
  try {
    const res = await axios.get(HK_SERVER_BASE + '/getDeviceInfo', {
      params: { ip, admin, password }
    });
    return !!res?.data ? Promise.resolve(res?.data) : Promise.reject(null);
  } catch (e) {
    return Promise.reject(null);
  }
}

// 获取支持的设备通道
export async function getIpcChannels({ ip, admin, password }) {
  try {
    const res = await axios.get(HK_SERVER_BASE + '/getIpcChannels', {
      params: { ip, admin, password }
    });
    return !!res?.data ? Promise.resolve(res?.data) : Promise.reject(null);
  } catch (e) {
    return Promise.reject(null);
  }
}

// 获取支持的设备通道
export async function getIpcChannelsNames({ ip, admin, password }) {
  try {
    const res = await axios.get(HK_SERVER_BASE + '/getIpcChannelsName', {
      params: { ip, admin, password }
    });
    return !!res?.data ? Promise.resolve(res?.data) : Promise.reject(null);
  } catch (e) {
    return Promise.reject(null);
  }
}

// 设备截图
export async function captureSnapshot({ channelId, ip, admin, password }) {
  try {
    const rtspUrl = `rtsp://${admin}:${password}@${ip}:554/Streaming/Channels/${getChannelValue(channelId, false)}`;
    const res = await axios.get(HK_SERVER_BASE + '/captureSnapshot', {
      params: { rtspUrl },
      responseType: 'blob'
    });
    const blob = res.data;
    return URL.createObjectURL(blob);
  } catch (e) {
    return null;
  }
}

// 开始播放
export async function streamStart({ deviceId, channel, rtsp }) {
  const res = await axios.get(HK_SERVER_BASE + '/streamStart', {
    params: { deviceId, channel, rtsp }
  });
  return !!res?.data?.m3u8 ? res?.data?.m3u8 : null;
}

// 停止播放
export async function streamStop({ deviceId, channel }) {
  await axios.get(HK_SERVER_BASE + '/streamStop', {
    params: { deviceId, channel }
  });
}

// 播放心跳
export async function streamHeartbeat({ deviceId, channel }) {
  await axios.get(HK_SERVER_BASE + '/streamHeartbeat', {
    params: { deviceId, channel }
  });
}
