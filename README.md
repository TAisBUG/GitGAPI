# API 代理服务

## 项目描述
这是一个基于 GitHub Pages 的 API 代理服务，提供安全且灵活的 API 请求代理功能。

## 主要特性
- 支持多 API Key 随机轮换
- 自定义安全设置
- 支持跨域 postMessage 调用
- 简单易用的界面

## 使用方法

### 直接使用
1. 在 API Key 输入框中填入你的 API Key（支持多个 Key，用分号分隔）
2. 在请求输入框中填入完整的 JSON 请求体
3. 点击"发送请求"按钮

### 外部程序调用示例
```javascript
// 假设代理页面地址为 https://your-username.github.io
const proxyOrigin = 'https://your-username.github.io';
const proxyWindow = window.open(proxyOrigin);

proxyWindow.postMessage({
  apiKeys: 'your-api-key1;your-api-key2',
  requestBody: {
    prompt: "Hello, world!"
  }
}, proxyOrigin);

window.addEventListener('message', (event) => {
  if (event.origin !== proxyOrigin) return;
  
  if (event.data.type === 'proxyResponse') {
    console.log('Proxy Response:', event.data.data);
  }
});
