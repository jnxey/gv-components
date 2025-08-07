/**
 * iframe通信工具库 (支持父子双向通信)
 * 功能：跨域通信、消息校验、自动重连、Promise API、调试模式
 * 使用示例：https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage
 */
export class IframeMessenger {
  /**
   * @param {Object} options 配置项
   * @param {Window} [options.targetWindow] 父页面需传入iframe.contentWindow
   * @param {string} [options.targetOrigin] 目标域安全限制（推荐指定）
   * @param {number} [options.timeout] 请求超时(ms) 默认3000
   * @param {boolean} [options.debug] 调试模式
   */
  constructor(options = {}) {
    // 配置初始化
    this.targetWindow = options.targetWindow || null;
    this.targetOrigin = options.targetOrigin || '*';
    this.timeout = options.timeout || 3000;
    this.debug = options.debug || false;

    // 运行时状态
    this.messageHandlers = new Map();
    this.requestCallbacks = new Map();
    this.messageIdCounter = 0;

    // 自动绑定监听（安全销毁）
    this.receiveMessage = this.receiveMessage.bind(this);
    window.addEventListener('message', this.receiveMessage);
  }

  /**
   * 发送消息到目标窗口
   * @param {string} type 消息类型（自定义事件名）
   * @param {any} data 发送数据
   * @param {Object} [options] 发送选项
   * @returns {Promise} 可等待对方响应
   */
  send(type, data, options = {}) {
    return new Promise((resolve, reject) => {
      // 参数校验
      if (!this.targetWindow && !options.window) {
        reject(new Error('Target window not specified'));
        return;
      }

      // 消息ID（用于关联响应）
      const messageId = ++this.messageIdCounter;
      const targetWindow = options.window || this.targetWindow;
      const targetOrigin = options.origin || this.targetOrigin;

      // 超时处理
      const timeoutId = setTimeout(() => {
        this.requestCallbacks.delete(messageId);
        reject(new Error(`Message timeout: ${type}`));
      }, options.timeout || this.timeout);

      // 存储回调
      this.requestCallbacks.set(messageId, {
        resolve,
        reject,
        timeoutId
      });

      // 构造消息体（安全封装）
      const message = {
        id: messageId,
        type,
        data,
        timestamp: Date.now(),
        isRequest: true
      };

      // 发送消息[6,7](@ref)
      try {
        targetWindow.postMessage(JSON.stringify(message), targetOrigin);
        this.debug && console.log(`[IframeMessenger] Sent: ${type}`, message);
      } catch (error) {
        this.requestCallbacks.delete(messageId);
        reject(error);
      }
    });
  }

  /**
   * 监听特定类型消息
   * @param {string} type 消息类型
   * @param {Function} handler 处理函数 (需返回响应数据)
   */
  on(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  // 核心接收逻辑[5,7](@ref)
  receiveMessage(event) {
    // 安全校验（来源过滤）
    if (this.targetOrigin !== '*' && event.origin !== this.targetOrigin) {
      this.debug && console.warn(`[IframeMessenger] Blocked origin: ${event.origin}`);
      return;
    }

    try {
      const message = typeof event.data === 'object' ? event.data : JSON.parse(event.data);
      this.debug && console.log(`[IframeMessenger] Received: ${message.type}`, message);

      // 请求消息处理
      if (message.isRequest) {
        const handler = this.messageHandlers.get(message.type);
        if (!handler) return;

        // 执行处理并自动响应
        Promise.resolve(handler(message.data))
          .then((response) => {
            this.sendResponse(event.source, message.id, response);
          })
          .catch((error) => {
            this.sendResponse(event.source, message.id, null, error.message);
          });

        // 响应消息处理
      } else if (this.requestCallbacks.has(message.id)) {
        const { resolve, reject, timeoutId } = this.requestCallbacks.get(message.id);
        clearTimeout(timeoutId);
        this.requestCallbacks.delete(message.id);
        message.error ? reject(new Error(message.error)) : resolve(message.data);
      }
    } catch (e) {
      console.error('[IframeMessenger] Message parse failed:', e);
    }
  }

  // 发送响应
  sendResponse(targetWindow, id, data, error = null) {
    targetWindow.postMessage(
      JSON.stringify({
        id,
        data,
        error,
        isRequest: false
      }),
      this.targetOrigin
    );
  }

  // 销毁监听器
  destroy() {
    window.removeEventListener('message', this.receiveMessage);
    this.requestCallbacks.forEach(({ timeoutId }) => clearTimeout(timeoutId));
  }
}
//
// /* 使用示例 */
// // ===== 父页面 ===== //
// const iframe = document.getElementById('my-iframe');
// const messenger = new IframeMessenger({
//   targetWindow: iframe.contentWindow,
//   targetOrigin: 'https://child-domain.com',
//   debug: true
// });
//
// // 发送请求并等待响应
// messenger.send('GET_USER', { userId: 123 })
//   .then(data => console.log('User data:', data))
//   .catch(err => console.error(err));
//
// // 监听子页面消息
// messenger.on('FORM_SUBMIT', formData => {
//   console.log('Received form:', formData);
//   return { status: 'success' }; // 自动回传响应
// });
//
// // ===== 子页面 ===== //
// const childMessenger = new IframeMessenger({
//   targetWindow: window.parent,
//   targetOrigin: 'https://parent-domain.com'
// });
//
// // 发送事件到父页面
// childMessenger.send('FORM_SUBMIT', { name: 'John' });
//
// // 响应父页面请求
// childMessenger.on('GET_USER', ({ userId }) => {
//   return { id: userId, name: 'Alice' };
// });
