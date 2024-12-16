// API 代理主逻辑
async function proxyRequest(apiKeys, requestBody) {
    const TELEGRAPH_URL = 'https://generativelanguage.googleapis.com/v1beta';
    
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
    
    // 构建请求 URL
    const url = new URL(TELEGRAPH_URL);
    url.searchParams.set('key', selectedApiKey);

    // 添加安全设置
    const newBody = {
        ...requestBody,
        safetySettings: [
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE'
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE'
            },
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE'
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE'
            },
            {
                category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
                threshold: 'BLOCK_NONE'
            }
        ]
    };

    // 发送请求
    const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBody)
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
