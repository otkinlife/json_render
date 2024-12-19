// jsonBeautifier.js
function syntaxHighlight(json, escape) {
    if (typeof json !== 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    if (escape) {
        json = JSON.parse(json);
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'json-number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'json-key';
            } else {
                cls = 'json-string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
        } else if (/null/.test(match)) {
            cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
    });
}

function createCollapsible(json, escape) {
    if (typeof json !== 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    if (escape) {
        json = JSON.parse(json);
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const lines = json.split('\n');
    const collapsibleLines = lines.map(line => {
        if (line.includes('{') || line.includes('[')) {
            return `<span class="collapsible">${line}</span><div class="content">`;
        } else if (line.includes('}') || line.includes(']')) {
            return `</div>${line}`;
        } else {
            return line;
        }
    });

    return collapsibleLines.join('\n');
}

function createToolbar(container, jsonString) {
    const toolbar = document.createElement('div');
    toolbar.id = 'toolbar';

    const escapeCheckbox = document.createElement('input');
    escapeCheckbox.type = 'checkbox';
    escapeCheckbox.id = 'escapeCheckbox';
    escapeCheckbox.addEventListener('change', function () {
        container.querySelector('#jsonContent').innerHTML = createCollapsible(jsonString, this.checked);
        addCollapsibleListeners(container);
    });

    const escapeLabel = document.createElement('label');
    escapeLabel.htmlFor = 'escapeCheckbox';
    escapeLabel.textContent = '解析转义';

    const copyButton = document.createElement('button');
    copyButton.id = 'copyButton';
    copyButton.textContent = '复制';
    copyButton.addEventListener('click', function () {
        navigator.clipboard.writeText(jsonString).then(() => {
            alert('JSON copied to clipboard');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    });

    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggleButton';
    toggleButton.textContent = '展开/折叠';
    toggleButton.addEventListener('click', function () {
        const collapsibles = container.querySelectorAll('.collapsible');
        collapsibles.forEach(collapsible => {
            collapsible.classList.toggle('collapsed');
            const content = collapsible.nextElementSibling;
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });
    });

    toolbar.appendChild(escapeCheckbox);
    toolbar.appendChild(escapeLabel);
    toolbar.appendChild(copyButton);
    toolbar.appendChild(toggleButton);

    return toolbar;
}

function addCollapsibleListeners(container) {
    const collapsibles = container.querySelectorAll('.collapsible');
    collapsibles.forEach(collapsible => {
        collapsible.addEventListener('click', function () {
            this.classList.toggle('collapsed');
            const content = this.nextElementSibling;
            if (content.style.display === 'block') {
                content.style.display = 'none';
            } else {
                content.style.display = 'block';
            }
        });
    });
}

function beautifyJson(jsonData, containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container with id "${containerId}" not found.`);
        return;
    }

    let jsonString;
    if (typeof jsonData === 'string') {
        try {
            jsonData = JSON.parse(jsonData);
        } catch (e) {
            console.error('Invalid JSON string provided.');
            return;
        }
    } else if (typeof jsonData !== 'object') {
        console.error('Invalid JSON data provided.');
        return;
    }

    jsonString = JSON.stringify(jsonData, null, 2);

    const toolbar = createToolbar(container, jsonString);
    const jsonContent = document.createElement('pre');
    jsonContent.id = 'jsonContent';
    jsonContent.innerHTML = createCollapsible(jsonString, false);

    container.innerHTML = '';
    container.appendChild(toolbar);
    container.appendChild(jsonContent);

    addCollapsibleListeners(container);
}
