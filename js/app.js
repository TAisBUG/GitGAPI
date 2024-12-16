const TELEGRAPH_URL = 'https://generativelanguage.googleapis.com/v1beta';

// 模拟服务器端处理 POST 请求的函数
async function handleApiRequest(request) {
    const requestUrl = new URL(request.url);
    const providedApiKeys = requestUrl.searchParams.get('key');

    if (!providedApiKeys) {
        return new Response('API key is missing.', { status: 400 });
    }

    const apiKeyArray = providedApiKeys.split(';').map(key => key.trim()).filter(key => key !== '');
    if (apiKeyArray.length === 0) {
        return new Response('Valid API key is missing.', { status: 400 });
    }

    const selectedApiKey = apiKeyArray[Math.floor(Math.random() * apiKeyArray.length)];

    // 构建目标 URL，这里为了兼容性，继续将 key 放在 URL 参数中
    const targetUrl = `${TELEGRAPH_URL}/models/gemini-pro:generateContent?key=${selectedApiKey}`;

    try {
        // 获取请求体
        let requestBody = {};
        if (request.body) {
            requestBody = await request.json();
        }

        // 添加安全设置，与之前相同
        requestBody.safetySettings = [
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
        ];

        // 转发请求
        const apiResponse = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        // 处理响应
        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            return new Response(`API request failed: ${errorBody}`, { status: apiResponse.status });
        }

        const responseData = await apiResponse.json();

        // 创建并返回响应
        const response = new Response(JSON.stringify(responseData), {
            status: apiResponse.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // 允许跨域
            }
        });
        return response;

    } catch (error) {
        return new Response('An error occurred: ' + error.message, { status: 500 });
    }
}

// 页面加载时的处理函数
async function handlePageLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    const apiKey = urlParams.get('key');
    const fromCurl = urlParams.get('from') === 'curl';

    if (apiKey && fromCurl) {
        // 来自 curl 的请求，执行 handleApiRequest
        const request = new Request(location.href, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Processing request from curl through GitHub Pages proxy."
                    }]
                }]
            }) // 可以根据需要修改测试请求体
        });

        handleApiRequest(request).then(response => {
            response.text().then(text => {
                document.body.innerHTML = `<pre>${text}</pre>`;
            });
        });
    } else {
        // 非 curl 请求或缺少必要参数，显示说明文档
        const instructions = `
      This is a proxy for the Google Gemini API deployed on GitHub Pages.

      To use it, send a POST request to this URL with the following format:

      curl -X POST \\
        -H "Content-Type: application/json" \\
        -d '{
          "contents": [
            {
              "parts": [
                {
                  "text": "Your prompt here"
                }
              ]
            }
          ]
        }' \\
        'https://yourusername.github.io/yourrepo/?key=YOUR_API_KEY_1;YOUR_API_KEY_2&from=curl'

      Replace:
        - https://yourusername.github.io/yourrepo/ with your actual GitHub Pages URL.
        - YOUR_API_KEY_1;YOUR_API_KEY_2 with your actual API key(s), separated by semicolons if you have multiple.

      Note: This proxy disables all safety settings. Use with caution.
    `;
        document.body.innerHTML = `<pre>${instructions}</pre>`;
    }
}

// 执行 handlePageLoad
handlePageLoad();
