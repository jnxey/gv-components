import axios from 'axios';

export async function captureSnapshot({ channelId = 1, subStream = false, ip, admin, password }) {
  try {
    const res = await axios.get('http://localhost:3000/captureSnapshot', {
      params: { channelId, subStream, ip, admin, password },
      responseType: 'blob'
    });
    const blob = res.data;
    return URL.createObjectURL(blob);
  } catch (e) {
    return null;
  }
}
