function renderJSONTree(json, escapeToggle) {
    if (typeof json === 'object' && json !== null) {
        const isArray = Array.isArray(json);
        const openBracket = isArray ? '[' : '{';
        const closeBracket = isArray ? ']' : '}';
        let html = `
            <div class="collapsible">
                <span class="toggle-icon">-</span>
                <span class="bracket">${openBracket}</span>
                <div class="json-item">
        `;
        for (const key in json) {
            const value = json[key];
            html += `<div>
                ${isArray ? '' : `<span class="key">"${key}":</span> `}
                ${renderJSONValue(value, escapeToggle)}
            </div>`;
        }
        html += `</div><span class="bracket">${closeBracket}</span></div>`;
        return html;
    } else {
        return renderJSONValue(json, escapeToggle);
    }
}

function renderJSONValue(value, escapeToggle) {
    if (typeof value === 'object' && value !== null) {
        return renderJSONTree(value, escapeToggle);
    } else {
        let stringValue = JSON.stringify(value);
        if (escapeToggle && typeof value === 'string') {
            stringValue = stringValue.slice(1, -1);
            stringValue = stringValue.replace(/\\(\\)?([rnt"])/g, (match, extraBackslash, char) => {
                if (extraBackslash) {
                    return '\\' + char;
                } else {
                    switch (char) {
                        case 'r': return '\r';
                        case 'n': return '\n';
                        case 't': return '\t';
                        case '"': return '"';
                        default: return match;
                    }
                }
            });
            stringValue = stringValue
                .replace(/\r/g, '')
                .replace(/\n/g, '<br>')
                .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }
        return `<span class="value">${stringValue}</span>`;
    }
}

function attachCollapsibleListeners(container) {
    const collapsibles = container.querySelectorAll('.collapsible');
    collapsibles.forEach(collapsible => {
        const icon = collapsible.querySelector('.toggle-icon');
        const content = collapsible.querySelector('.json-item');
        const openBracket = collapsible.firstElementChild.nextElementSibling;
        const closeBracket = collapsible.lastElementChild;

        icon.addEventListener('click', function (e) {
            e.stopPropagation();
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.textContent = '-';
                const ellipsis = closeBracket.previousElementSibling;
                if (ellipsis && ellipsis.classList.contains('bracket') && ellipsis.textContent === '... ') {
                    ellipsis.remove();
                }
                icon.classList.remove('collapsed');
            } else {
                content.style.display = 'none';
                icon.textContent = '+';
                if (closeBracket && (!closeBracket.previousElementSibling || !closeBracket.previousElementSibling.classList.contains('bracket'))) {
                    const ellipsis = document.createElement('span');
                    ellipsis.className = 'bracket';
                    ellipsis.textContent = '... ';
                    closeBracket.parentNode.insertBefore(ellipsis, closeBracket);
                }
                icon.classList.add('collapsed');
            }
        });
    });
}

function render(json, containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id "${containerId}" not found.`);
        return;
    }

    const { title = 'JSON Viewer', escapeToggle = false } = options;

    const header = document.createElement('div');
    header.className = 'header';

    const titleElement = document.createElement('h2');
    titleElement.textContent = title;

    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.alignItems = 'center';

    const switchLabel = document.createElement('label');
    switchLabel.className = 'switch';
    const switchInput = document.createElement('input');
    switchInput.type = 'checkbox';
    switchInput.checked = escapeToggle;
    const switchSlider = document.createElement('span');
    switchSlider.className = 'slider';
    switchLabel.appendChild(switchInput);
    switchLabel.appendChild(switchSlider);

    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Toggle';
    toggleButton.style.marginLeft = '10px';

    controls.appendChild(switchLabel);
    controls.appendChild(toggleButton);

    header.appendChild(titleElement);
    header.appendChild(controls);

    container.innerHTML = '';
    container.appendChild(header);

    const treeContainer = document.createElement('div');
    treeContainer.id = 'json-tree';
    container.appendChild(treeContainer);

    treeContainer.innerHTML = renderJSONTree(json, escapeToggle);
    attachCollapsibleListeners(treeContainer);

    switchInput.addEventListener('change', () => {
        treeContainer.innerHTML = renderJSONTree(json, switchInput.checked);
        attachCollapsibleListeners(treeContainer);
    });

    toggleButton.addEventListener('click', () => {
        const collapsibles = treeContainer.querySelectorAll('.collapsible');
        collapsibles.forEach(collapsible => {
            const icon = collapsible.querySelector('.toggle-icon');
            const content = collapsible.querySelector('.json-item');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.textContent = '-';
                const closeBracket = collapsible.lastElementChild;
                const ellipsis = closeBracket.previousElementSibling;
                if (ellipsis && ellipsis.classList.contains('bracket') && ellipsis.textContent === '... ') {
                    ellipsis.remove();
                }
                icon.classList.remove('collapsed');
            } else {
                content.style.display = 'none';
                icon.textContent = '+';
                const closeBracket = collapsible.lastElementChild;
                if (closeBracket && (!closeBracket.previousElementSibling || !closeBracket.previousElementSibling.classList.contains('bracket'))) {
                    const ellipsis = document.createElement('span');
                    ellipsis.className = 'bracket';
                    ellipsis.textContent = '... ';
                    closeBracket.parentNode.insertBefore(ellipsis, closeBracket);
                }
                icon.classList.add('collapsed');
            }
        });
    });
}
