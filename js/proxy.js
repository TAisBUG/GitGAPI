// API 代理主逻辑
async function proxyRequest(apiKeys, requestBody) {
    // 验证 API Keys
    if (!apiKeys) {
        throw new Error('API key is missing.');
    }
    
    const apiKeyArray = apiKeys.split(';')
        .map(key => key.trim())
        .filter(key => key !== '');
    
    if (apiKeyArray.length === 0) {
        throw new Error('Valid API key is missing.');
    }
    
    // 随机选择一个 API Key
    const selectedApiKey = apiKeyArray[Math.floor(Math.random() * apiKeyArray.length)];
    
    // 获取请求 URL
    const url = new URL(window.location.href);
    const pathname = url.pathname.replace('/index.html', '');
    const baseUrl = url.origin + pathname;
    const finalUrl = `${baseUrl}/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${selectedApiKey}`;

    // 发送请求
    const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    // 处理响应
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed: ${errorBody}`);
    }

    return await response.json();
}

// 页面交互逻辑
async function sendRequest() {
    const apiKeys = document.getElementById('apiKeyInput').value;
    const requestInput = document.getElementById('requestInput').value;
    const resultArea = document.getElementById('resultArea');

    try {
        // 解析请求 JSON
        const requestBody = JSON.parse(requestInput);
        
        // 显示加载状态
        resultArea.textContent = '请求中，请稍候...';

        // 发送代理请求
        const result = await proxyRequest(apiKeys, requestBody);
        
        // 格式化并展示结果
        resultArea.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        // 处理错误
        resultArea.textContent = `错误：${error.message}`;
        console.error(error);
    }
}

// 跨域消息监听
document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('message', async (event) => {
        try {
            const { apiKeys, requestBody } = event.data;
            
            if (!apiKeys || !requestBody) {
                throw new Error('API Keys 和请求内容是必需的');
            }

            const result = await proxyRequest(apiKeys, requestBody);
            
            // 发送响应回调用者
            event.source.postMessage({
                type: 'proxyResponse',
                data: result
            }, event.origin);
        } catch (error) {
            // 发送错误回调用者
            event.source.postMessage({
                type: 'proxyError',
                error: error.message
            }, event.origin);
        }
    });
});
