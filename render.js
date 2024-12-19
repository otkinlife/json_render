// jsonRenderer.js

// 动态加载 JSONFormatter 依赖
(function() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/json-formatter-js@2.5.18/dist/json-formatter.umd.min.js';
    script.onload = () => {
        console.log('JSONFormatter loaded');
    };
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/json-formatter-js@2.5.18/dist/json-formatter.min.css';
    document.head.appendChild(link);
})();

function renderJson(containerId, jsonData) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id "${containerId}" not found.`);
        return;
    }

    // 创建卡片容器
    const card = document.createElement('div');
    card.className = 'json-card';

    // 创建工具栏
    const toolbar = document.createElement('div');
    toolbar.className = 'json-toolbar';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'recursive-checkbox';

    const label = document.createElement('label');
    label.htmlFor = 'recursive-checkbox';
    label.innerText = '递归解析';

    toolbar.appendChild(checkbox);
    toolbar.appendChild(label);

    // 将工具栏添加到卡片容器
    card.appendChild(toolbar);

    // 创建 JSONFormatter 实例
    let formatter = new JSONFormatter(jsonData);

    // 将格式化后的 JSON 插入到卡片容器
    const jsonContainer = document.createElement('div');
    jsonContainer.className = 'json-container';
    jsonContainer.appendChild(formatter.render());
    card.appendChild(jsonContainer);

    // 将卡片容器插入到指定的容器中
    container.appendChild(card);

    // 记录被解析的字段
    const parsedFields = new Set();

    // 添加复选框事件监听
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            // 递归解析 JSON 数据中的值
            const parsedJsonData = recursiveParseJson(jsonData, parsedFields);
            formatter = new JSONFormatter(parsedJsonData);
        } else {
            // 将解析后的 JSON 数据恢复为字符串形式
            const stringifiedJsonData = stringifyJson(jsonData, parsedFields);
            formatter = new JSONFormatter(stringifiedJsonData);
        }
        // 重新渲染 JSON 数据
        jsonContainer.innerHTML = '';
        jsonContainer.appendChild(formatter.render());
    });
}

function recursiveParseJson(data, parsedFields, path = '') {
    if (typeof data === 'string') {
        try {
            const parsedData = JSON.parse(data);
            parsedFields.add(path);
            return parsedData;
        } catch (e) {
            return data;
        }
    } else if (typeof data === 'object' && data !== null) {
        for (const key in data) {
            const newPath = path ? `${path}.${key}` : key;
            data[key] = recursiveParseJson(data[key], parsedFields, newPath);
        }
    }
    return data;
}

function stringifyJson(data, parsedFields, path = '') {
    if (typeof data === 'object' && data !== null) {
        for (const key in data) {
            const newPath = path ? `${path}.${key}` : key;
            data[key] = stringifyJson(data[key], parsedFields, newPath);
        }
        if (parsedFields.has(path)) {
            return JSON.stringify(data);
        }
    }
    return data;
}

export { renderJson };
