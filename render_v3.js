 <script>
        function renderJson(data, containerId, config = {recursiveParse: false, expandAll: false}) {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            container.setAttribute('data-json', JSON.stringify(data));

            const controls = document.createElement('div');
            controls.className = 'json-controls';

            const recursiveParseSwitch = document.createElement('label');
            recursiveParseSwitch.className = 'switch';
            recursiveParseSwitch.title = 'Enable/Disable Recursive Parse';
            const recursiveParseCheckbox = document.createElement('input');
            recursiveParseCheckbox.type = 'checkbox';
            recursiveParseCheckbox.id = 'recursive-parse';
            recursiveParseCheckbox.checked = config.recursiveParse;

            const recursiveParseSlider = document.createElement('span');
            recursiveParseSlider.className = 'slider';

            recursiveParseSwitch.appendChild(recursiveParseCheckbox);
            recursiveParseSwitch.appendChild(recursiveParseSlider);

            const recursiveParseLabel = document.createElement('label');
            recursiveParseLabel.appendChild(recursiveParseSwitch);

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.textContent = 'copy';
            copyButton.onclick = () => copyJson(container);

            controls.appendChild(recursiveParseLabel);
            controls.appendChild(copyButton);

            container.appendChild(controls);

            const wrapper = document.createElement('div');
            wrapper.className = 'json-viewer';
            buildJsonDom(data, wrapper, recursiveParseCheckbox, config.expandAll);
            container.appendChild(wrapper);

            recursiveParseCheckbox.onchange = () => {
                updateJsonDom(data, wrapper, recursiveParseCheckbox);
            };
        }

        function buildJsonDom(data, parent, recursiveParseCheckbox, expandAll) {
            if (data === null) {
                parent.appendChild(createValueElement('null', 'json-null'));
                return;
            }

            const type = typeof data;
            if (type === 'object') {
                if (Array.isArray(data)) {
                    buildArrayDom(data, parent, recursiveParseCheckbox, expandAll);
                } else {
                    buildObjectDom(data, parent, recursiveParseCheckbox, expandAll);
                }
            } else if (type === 'string' && recursiveParseCheckbox.checked) {
                buildStringDom(data, parent, recursiveParseCheckbox, expandAll);
            } else {
                parent.appendChild(createValueElement(data, `json-${type}`));
            }
        }

        function updateJsonDom(data, parent, recursiveParseCheckbox, expandAll=null) {
            const state = getCurrentState(parent);
            parent.innerHTML = '';
            buildJsonDom(data, parent, recursiveParseCheckbox, expandAll);
            setState(parent, state);
        }

        function getCurrentState(parent) {
            const state = [];
            parent.querySelectorAll('.json-toggle').forEach((toggle, index) => {
                state[index] = toggle.classList.contains('expanded');
            });
            return state;
        }

        function setState(parent, state) {
            parent.querySelectorAll('.json-toggle').forEach((toggle, index) => {
                if (state[index]) {
                    toggle.click();
                }
            });
        }

        function buildObjectDom(obj, parent, recursiveParseCheckbox, expandAll) {
            const toggle = createToggleElement();
            parent.appendChild(toggle);
            parent.appendChild(document.createTextNode('{'));

            const content = document.createElement('div');
            content.className = 'json-content';

            const entries = Object.entries(obj);
            entries.forEach(([key, value], index) => {
                const item = document.createElement('div');
                item.className = 'json-item';

                const keyElement = document.createElement('span');
                keyElement.className = 'json-key';
                keyElement.textContent = `"${key}": `;
                item.appendChild(keyElement);

                buildJsonDom(value, item, recursiveParseCheckbox, expandAll);

                if (index < entries.length - 1) {
                    item.appendChild(document.createTextNode(','));
                }

                content.appendChild(item);
            });

            parent.appendChild(content);
            parent.appendChild(document.createTextNode('}'));

            const collapsedInfo = document.createElement('span');
            collapsedInfo.className = 'json-collapsed-info';
            collapsedInfo.textContent = `Object{...}`;
            parent.appendChild(collapsedInfo);

            setupToggle(toggle, content, collapsedInfo, expandAll, parent);
        }

        function buildArrayDom(arr, parent, recursiveParseCheckbox, expandAll) {
            const toggle = createToggleElement();
            parent.appendChild(toggle);
            parent.appendChild(document.createTextNode('['));

            const content = document.createElement('div');
            content.className = 'json-content';

            arr.forEach((item, index) => {
                const itemContainer = document.createElement('div');
                itemContainer.className = 'json-item';

                buildJsonDom(item, itemContainer, recursiveParseCheckbox, expandAll);

                if (index < arr.length - 1) {
                    itemContainer.appendChild(document.createTextNode(','));
                }

                content.appendChild(itemContainer);
            });

            parent.appendChild(content);
            parent.appendChild(document.createTextNode(']'));

            const collapsedInfo = document.createElement('span');
            collapsedInfo.className = 'json-collapsed-info';
            collapsedInfo.textContent = `Array[${arr.length}]`;
            parent.appendChild(collapsedInfo);

            setupToggle(toggle, content, collapsedInfo, expandAll, parent);
        }

        function buildStringDom(value, parent, recursiveParseCheckbox, expandAll) {
            if (isJsonString(value)) {
                const parsedValue = JSON.parse(value);
                buildJsonDom(parsedValue, parent, recursiveParseCheckbox, expandAll);
            } else {
                renderEscapedString(value, parent);
            }
        }

        function isJsonString(str) {
            if (typeof str !== 'string') {
                return false;
            }
            str = str.trim();
            return (str.startsWith('{') && str.endsWith('}')) || (str.startsWith('[') && str.endsWith(']'));
        }

        function renderEscapedString(value, container) {
            const unescapedValue = value.replace(/\\\\/g, '\\');
            const span = document.createElement('span');
            span.textContent = unescapedValue;
            span.className = 'json-string escaped';
            container.appendChild(span);
        }

        function setupToggle(toggle, content, collapsedInfo, expandAll, parent) {
            toggle.onclick = () => {
                if (toggle.classList.contains('collapsed')) {
                    toggle.classList.remove('ti-square-rounded-plus', 'collapsed');
                    toggle.classList.add('ti-square-rounded-minus', 'expanded');
                    content.classList.add('open');
                    collapsedInfo.style.display = 'none';
                } else {
                    toggle.classList.remove('ti-square-rounded-minus', 'expanded');
                    toggle.classList.add('ti-square-rounded-plus', 'collapsed');
                    content.classList.remove('open');
                    collapsedInfo.style.display = 'inline';
                }
            };

            // 根据配置或当前状态设置初始状态
            if (expandAll !== null) {
                if (expandAll) {
                    toggle.classList.remove('ti-square-rounded-plus', 'collapsed');
                    toggle.classList.add('ti-square-rounded-minus', 'expanded');
                    content.classList.add('open');
                    collapsedInfo.style.display = 'none';
                } else {
                    toggle.classList.add('ti-square-rounded-plus', 'collapsed');
                    content.classList.remove('open');
                    collapsedInfo.style.display = 'inline';
                }
            } else {
                if (parent && parent.querySelector('.json-toggle.expanded')) {
                    toggle.classList.remove('ti-square-rounded-plus', 'collapsed');
                    toggle.classList.add('ti-square-rounded-minus', 'expanded');
                    content.classList.add('open');
                    collapsedInfo.style.display = 'none';
                } else {
                    toggle.classList.add('ti-square-rounded-plus', 'collapsed');
                    content.classList.remove('open');
                    collapsedInfo.style.display = 'inline';
                }
            }
        }

        function createValueElement(value, className) {
            const element = document.createElement('span');
            element.className = className;
            element.textContent = JSON.stringify(value);
            return element;
        }

        function createToggleElement() {
            const toggle = document.createElement('i');
            toggle.className = 'json-toggle ti ti-square-rounded-plus collapsed';
            return toggle;
        }

        function copyJson(container) {
            const jsonString = container.getAttribute('data-json');
            navigator.clipboard.writeText(jsonString).then(() => {
                showToast('JSON已复制到剪贴板');
            }).catch(err => {
                console.error('复制失败', err);
            });
        }

        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
            document.body.appendChild(toast);
            toast.className = 'toast show';
            setTimeout(() => {
                toast.className = toast.className.replace('show', '');
                document.body.removeChild(toast);
            }, 1000);
        }
</script>
