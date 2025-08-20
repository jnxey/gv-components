/**
 * iframe通信工具类
 * @param {Object} options - 配置项
 * @param {Window} options.targetWindow - 目标窗口（iframe.contentWindow 或 window.parent）
 * @param {string} [options.targetOrigin='*'] - 目标源（推荐指定具体域名提升安全性）
 * @param {string} [options.origin=window.location.origin] - 本窗口源（用于校验消息来源）
 */
export class IframeCommunicator {
  constructor(options) {
    this.targetWindow = options.targetWindow;
    this.targetOrigin = options.targetOrigin || '*';
    this.origin = options.origin || window.location.origin;
    this.messageHandlers = new Map(); // 存储事件监听回调
    this.pendingRequests = new Map(); // 存储未完成的请求（用于回调模式）
    this.requestId = 0;

    // 绑定消息接收器
    window.addEventListener('message', this._handleMessage.bind(this));
  }

  /**
   * 子页面ready
   * @param {function} callback - 回调函数
   */
  async ready(callback) {
    if (!!callback) {
      this.on('sub-page-ready', callback);
    } else {
      this.send('sub-page-ready');
    }
  }

  /**
   * 发送消息（基础API）
   * @param {string} type - 消息类型（自定义标识）
   * @param {any} data - 发送的数据（支持结构化克隆对象）
   */
  send(type, data) {
    this.targetWindow.postMessage({ type, data, source: 'iframe-communicator' }, this.targetOrigin);
  }

  /**
   * 发送请求并等待响应（回调模式）
   * @param {string} type - 请求类型
   * @param {any} data - 请求数据
   * @param {number} [timeout=5000] - 超时时间（毫秒）
   * @returns {Promise<any>} - 响应结果
   */
  request(type, data, timeout = 5000) {
    const requestId = ++this.requestId;
    return new Promise((resolve, reject) => {
      // 存储请求的resolve/reject以便后续匹配响应
      this.pendingRequests.set(requestId, { resolve, reject });

      // 发送请求
      this.targetWindow.postMessage(
        {
          type,
          data,
          requestId,
          isRequest: true,
          source: 'iframe-communicator'
        },
        this.targetOrigin
      );

      // 设置超时自动清理
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, timeout);
    });
  }

  /**
   * 注册消息监听器（事件模式）
   * @param {string} type - 监听的消息类型
   * @param {function} handler - 处理函数 (data: any) => void
   */
  on(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);
  }

  /**
   * 移除消息监听器
   * @param {string} type - 消息类型
   * @param {function} [handler] - 移除指定处理函数（不传则移除该类型所有监听）
   */
  off(type, handler) {
    if (!handler) {
      this.messageHandlers.delete(type);
    } else {
      const handlers = this.messageHandlers.get(type) || [];
      this.messageHandlers.set(
        type,
        handlers.filter((h) => h !== handler)
      );
    }
  }

  /**
   * 销毁实例（移除事件监听）
   */
  destroy() {
    window.removeEventListener('message', this._handleMessage);
    this.messageHandlers.clear();
    this.pendingRequests.clear();
  }

  // 内部方法：处理接收到的消息
  _handleMessage(event) {
    // 1. 安全校验
    if (event.origin !== this.origin && this.targetOrigin !== '*') return;
    const message = event.data;
    if (!message || message.source !== 'iframe-communicator') return;

    // 2. 处理回调模式（响应请求）
    if (message.isResponse && message.requestId) {
      const request = this.pendingRequests.get(message.requestId);
      if (request) {
        this.pendingRequests.delete(message.requestId);
        message.error ? request.reject(message.error) : request.resolve(message.data);
      }
      return;
    }

    // 3. 处理事件监听模式
    if (this.messageHandlers.has(message.type) && !message.isRequest) {
      const handlers = this.messageHandlers.get(message.type);
      handlers.forEach((handler) => handler(message.data, event));
    }

    // 4. 处理请求模式（自动响应）
    if (message.isRequest && message.requestId) {
      const respond = (responseData) => {
        this.targetWindow.postMessage(
          {
            type: message.type,
            data: responseData,
            requestId: message.requestId,
            isResponse: true,
            source: 'iframe-communicator'
          },
          this.targetOrigin
        );
      };

      // 触发请求事件（需用户通过on注册）
      if (this.messageHandlers.has(`${message.type}`)) {
        const handlers = this.messageHandlers.get(`${message.type}`);
        handlers.forEach((handler) => handler(message.data, respond));
      }
    }
  }
}
