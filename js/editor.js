let nodes = new vis.DataSet([
    { id: 1, label: 'Public Internet', group: 'world', title: 'Gateway for all HTTP traffic' },
    { id: 2, label: 'Cloud Load Balancer', group: 'lb', title: 'Entry point for cluster traffic' },
    { id: 3, label: 'Web Platform API', group: 'container', title: 'Critical runtime pod' },
    { id: 4, label: 'Postgres DB', group: 'db', title: 'Encrypted customer data storage' }
]);

let edges = new vis.DataSet([
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4, label: 'read/write', dashes: true }
]);

let editorNetwork = null;
let inspectorTarget = { type: null, id: null };

const groupStyles = {
    world: { color: '#2ea043', icon: 'globe', label: 'Internet' },
    repo: { color: '#8957e5', icon: 'github', label: 'Repository' },
    container: { color: '#d29922', icon: 'box', label: 'Service' },
    secret: { color: '#cf222e', icon: 'key', label: 'Secret' },
    db: { color: '#0969da', icon: 'database', label: 'Database' },
    lb: { color: '#6e7681', icon: 'layers', label: 'Load Balancer' }
};

const iconLibrary = [
    { id: 'shield', label: 'Shield', category: 'security' },
    { id: 'lock', label: 'Lock', category: 'security' },
    { id: 'cloud', label: 'Cloud', category: 'infrastructure' },
    { id: 'database', label: 'Database', category: 'data' },
    { id: 'server', label: 'Server', category: 'infrastructure' },
    { id: 'user', label: 'User', category: 'identity' },
    { id: 'globe', label: 'World', category: 'network' },
    { id: 'box', label: 'Container', category: 'compute' },
    { id: 'key', label: 'Key', category: 'security' },
    { id: 'layers', label: 'Layers', category: 'infrastructure' },
    { id: 'terminal', label: 'Terminal', category: 'compute' },
    { id: 'wifi', label: 'Network', category: 'network' },
    { id: 'activity', label: 'Activity', category: 'monitor' },
    { id: 'alert-triangle', label: 'Warning', category: 'security' },
    { id: 'zap', label: 'Trigger', category: 'action' }
];

const shapeLibrary = [
    { id: 'roundedRect', label: 'Rounded Box', category: 'geometric' },
    { id: 'rect', label: 'Rectangle', category: 'geometric' },
    { id: 'square', label: 'Square', category: 'geometric' },
    { id: 'circle', label: 'Circle', category: 'geometric' },
    { id: 'rhombus', label: 'Rhombus', category: 'geometric' },
    { id: 'triangle', label: 'Triangle', category: 'geometric' },
    { id: 'hexagon', label: 'Hexagon', category: 'geometric' },
    { id: 'semicircle', label: 'Semicircle', category: 'geometric' },
    { id: 'puzzlePiece', label: 'Puzzle Piece', category: 'special' },
    { id: 'andGate', label: 'AND Gate', category: 'logic' },
    { id: 'orGate', label: 'OR Gate', category: 'logic' },
    { id: 'notGate', label: 'NOT Gate', category: 'logic' }
];

let selectedIcon = 'shield';
let selectedShape = 'roundedRect';

function initEditor() {
    const container = document.getElementById('editor-network');
    const data = { nodes, edges };

    const options = {
        nodes: {
            shape: 'custom',
            ctxRenderer: ({ ctx, id, x, y, state, label }) => {
                const node = nodes.get(id);
                const currentShape = node.shape || 'roundedRect';
                const currentIcon = node.icon || node.group;

                window.nodeRenderer.drawNode(ctx, {
                    x, y, state, label,
                    group: node.group,
                    shape: currentShape,
                    icon: currentIcon,
                    customColor: node.color
                });

                const dims = window.nodeRenderer.getDimensions(currentShape);

                return {
                    drawNode: () => { },
                    nodeDimensions: { width: dims.width, height: dims.height }
                };
            }
        },
        edges: {
            width: 2,
            color: {
                color: document.body.classList.contains('dark-mode') ? '#444c56' : '#cbd5e1',
                highlight: '#ff6d5f'
            },
            arrows: { to: { enabled: true, scaleFactor: 0.4, type: 'arrow' } },
            smooth: { type: 'cubicBezier', forceDirection: 'horizontal', roundness: 0.6 }
        },
        physics: {
            enabled: false
        },
        interaction: {
            hover: true,
            multiselect: true,
            navigationButtons: false,
            zoomView: true
        },
        manipulation: {
            enabled: true,
            initiallyActive: false,
            addNode: false,
            addEdge: function (edgeData, callback) {
                if (edgeData.from == edgeData.to) {
                    callback(null);
                } else {
                    const isDark = document.body.classList.contains('dark-mode');
                    edgeData.color = { color: isDark ? '#444c56' : '#cbd5e1', highlight: '#ff6d5f' };
                    edgeData.width = 2;
                    callback(edgeData);

                    // Automatically disable edge mode after one connection like n8n
                    const connectBtn = document.getElementById('connect-mode-btn');
                    connectBtn.classList.remove('active');
                    editorNetwork.disableEditMode();
                    document.body.style.cursor = 'default';
                }
            },
            editEdge: true,
            deleteNode: true,
            deleteEdge: true,
            controlNodeStyle: {
                shape: 'dot',
                size: 2,
                color: 'transparent'
            }
        }
    };

    editorNetwork = new vis.Network(container, data, options);

    // Event Listeners
    editorNetwork.on("doubleClick", (params) => {
        if (params.nodes.length > 0) {
            openInspector('node', params.nodes[0]);
        } else if (params.edges.length > 0) {
            openInspector('edge', params.edges[0]);
        }
    });

    editorNetwork.on("deselectNode", () => {
        closeInspector();
    });

    // Handle Drag & Drop from Toolbox
    container.addEventListener('dragover', (e) => e.preventDefault());
    container.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('node-type');
        if (!type || !editorNetwork) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const canvasPos = editorNetwork.DOMtoCanvas({ x, y });
        const style = groupStyles[type] || { label: type };
        const newNode = {
            id: Date.now(),
            label: `New ${style.label}`,
            group: type,
            x: canvasPos.x,
            y: canvasPos.y
        };
        nodes.add(newNode);
    });
}

// UI Handlers
function setupToolbox() {
    const items = document.querySelectorAll('.tool-item');
    items.forEach(item => {
        // Drag logic
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('node-type', item.getAttribute('data-type'));
        });

        // Click logic
        item.onclick = () => {
            const type = item.getAttribute('data-type');
            const style = groupStyles[type] || { label: type };
            const viewCenter = editorNetwork.getViewPosition();
            const newNode = {
                id: Date.now(),
                label: `New ${style.label}`,
                group: type,
                x: viewCenter.x,
                y: viewCenter.y
            };
            nodes.add(newNode);
            selectedNodeId = newNode.id;
            openInspector('node', newNode.id);
        };
    });

    document.getElementById('zoom-in').onclick = () => {
        const scale = editorNetwork.getScale();
        editorNetwork.moveTo({ scale: scale * 1.2 });
    };

    document.getElementById('zoom-out').onclick = () => {
        const scale = editorNetwork.getScale();
        editorNetwork.moveTo({ scale: scale * 0.8 });
    };

    document.getElementById('zoom-fit').onclick = () => editorNetwork.fit();

    // Manipulation Modes
    const connectBtn = document.getElementById('connect-mode-btn');
    connectBtn.onclick = () => {
        const isActive = connectBtn.classList.toggle('active');
        if (isActive) {
            editorNetwork.addEdgeMode();
            document.body.style.cursor = 'crosshair';
        } else {
            editorNetwork.disableEditMode();
            document.body.style.cursor = 'default';
        }
    };

    const deleteBtn = document.getElementById('delete-mode-btn');
    deleteBtn.onclick = () => {
        const selected = editorNetwork.getSelection();
        if (selected.nodes.length || selected.edges.length) {
            nodes.remove(selected.nodes);
            edges.remove(selected.edges);
            closeInspector();
        } else {
            alert("Select a node or edge to delete first.");
        }
    };

    const addBtn = document.getElementById('add-node-btn');
    addBtn.onclick = () => {
        const viewCenter = editorNetwork.getViewPosition();
        const newNode = {
            id: Date.now(),
            label: 'New Asset',
            group: 'container',
            x: viewCenter.x,
            y: viewCenter.y
        };
        nodes.add(newNode);
        openInspector('node', newNode.id);
    };

    document.getElementById('apply-inspector-btn').onclick = () => updateInspectorData();

    // Auto-fit on start
    editorNetwork.on("stabilizationIterationsDone", () => {
        editorNetwork.fit();
    });
}

function simulateAttack() {
    // Premium feature: highlight a random path
    const allEdges = edges.get();
    allEdges.forEach(e => {
        edges.update({ id: e.id, color: null, width: 2 });
    });

    const randomCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < randomCount; i++) {
        const randomEdge = allEdges[Math.floor(Math.random() * allEdges.length)];
        if (randomEdge) {
            edges.update({
                id: randomEdge.id,
                color: { color: '#cf222e', inherit: false },
                width: 4,
                dashes: true
            });
        }
    }
}

function openInspector(type, id) {
    inspectorTarget = { type, id };
    const inspector = document.getElementById('node-inspector');
    const title = document.getElementById('inspector-title');
    const nodeFields = document.getElementById('node-fields');
    const edgeFields = document.getElementById('edge-fields');

    if (type === 'node') {
        const node = nodes.get(id);
        title.innerText = "Node Details";
        nodeFields.style.display = "block";
        edgeFields.style.display = "none";

        document.getElementById('node-name-input').value = node.label || '';
        document.getElementById('node-type-select').value = node.group || 'container';

        selectedShape = node.shape || 'roundedRect';
        updateShapePickerUI();

        selectedIcon = node.icon || node.group || 'shield';
        updateIconPickerUI();

        document.getElementById('node-desc-input').value = node.title || '';
        document.getElementById('node-risk-select').value = node.risk || 'medium';
        document.getElementById('node-io-role').value = node.ioRole || 'none';

        const nodeColor = node.color || '#ffffff';
        document.getElementById('node-color-input').value = nodeColor;
        document.getElementById('node-color-hex').value = nodeColor.toUpperCase();
    } else {
        const edge = edges.get(inspectorTarget.id);
        title.innerText = "Connection Details";
        nodeFields.style.display = "none";
        edgeFields.style.display = "block";

        document.getElementById('edge-label-input').value = edge.label || '';

        let style = 'solid';
        if (edge.dashes === true) style = 'dashed';
        if (Array.isArray(edge.dashes)) style = 'dotted';
        document.getElementById('edge-style-select').value = style;

        document.getElementById('edge-width-input').value = edge.width || 2;

        const edgeColor = edge.color?.color || (document.body.classList.contains('dark-mode') ? '#444c56' : '#cbd5e1');
        document.getElementById('edge-color-input').value = edgeColor;
        document.getElementById('edge-color-hex').value = edgeColor.toUpperCase();

        let smoothVal = edge.smooth ? (edge.smooth.type || 'dynamic') : 'false';
        if (edge.smooth === false) smoothVal = 'false';
        document.getElementById('edge-smooth-select').value = smoothVal;
        document.getElementById('edge-arrows-select').value = edge.arrows || '';
    }

    inspector.classList.add('active');
}

function closeInspector() {
    document.getElementById('node-inspector').classList.remove('active');
    inspectorTarget = { type: null, id: null };
}

function updateInspectorData() {
    if (!inspectorTarget.id) return;

    if (inspectorTarget.type === 'node') {
        const name = document.getElementById('node-name-input').value;
        const type = document.getElementById('node-type-select').value;
        const desc = document.getElementById('node-desc-input').value;
        const risk = document.getElementById('node-risk-select').value;

        nodes.update({
            id: inspectorTarget.id,
            label: name,
            group: type,
            shape: selectedShape,
            icon: selectedIcon,
            title: desc,
            risk: risk,
            color: document.getElementById('node-color-hex').value,
            ioRole: document.getElementById('node-io-role').value
        });
    } else {
        const label = document.getElementById('edge-label-input').value;
        const style = document.getElementById('edge-style-select').value;
        const width = parseInt(document.getElementById('edge-width-input').value);
        const color = document.getElementById('edge-color-hex').value;
        const smoothSelect = document.getElementById('edge-smooth-select').value;
        const arrows = document.getElementById('edge-arrows-select').value;

        const smoothObj = smoothSelect === 'false' ? false : { type: smoothSelect, roundness: 0.5 };

        let arrowObj = arrows;
        if (arrows === 'to,from') arrowObj = { to: true, from: true };

        let dashes = false;
        if (style === 'dashed') dashes = true;
        if (style === 'dotted') dashes = [2, 10];

        edges.update({
            id: inspectorTarget.id,
            label: label,
            dashes: dashes,
            width: width,
            color: { color: color, highlight: '#ff6d5f' },
            smooth: smoothObj,
            arrows: arrowObj
        });
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
    closeInspector();
}

// Icon Picker Logic
function setupIconPicker() {
    const openBtn = document.getElementById('open-icon-picker');
    const pickerOverlay = document.getElementById('icon-picker-grid');
    const searchInput = document.getElementById('icon-search');

    openBtn.onclick = (e) => {
        e.stopPropagation();
        pickerOverlay.classList.toggle('active');
        if (pickerOverlay.classList.contains('active')) {
            searchInput.focus();
            renderIconGrid('');
        }
    };

    searchInput.oninput = (e) => {
        renderIconGrid(e.target.value.toLowerCase());
    };

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!pickerOverlay.contains(e.target) && e.target !== openBtn) {
            pickerOverlay.classList.remove('active');
        }
    });
}

function renderIconGrid(filter = '') {
    const container = document.getElementById('icon-items-container');
    container.innerHTML = '';

    const filtered = iconLibrary.filter(item =>
        item.label.toLowerCase().includes(filter) ||
        item.category.toLowerCase().includes(filter) ||
        item.id.includes(filter)
    );

    filtered.forEach(icon => {
        const item = document.createElement('div');
        item.className = 'icon-item';
        if (selectedIcon === icon.id) item.classList.add('selected');

        item.innerHTML = `
            <i data-lucide="${icon.id}"></i>
            <span>${icon.label}</span>
        `;

        item.onclick = () => {
            selectedIcon = icon.id;
            updateIconPickerUI();
            document.getElementById('icon-picker-grid').classList.remove('active');
        };

        container.appendChild(item);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateIconPickerUI() {
    const iconData = iconLibrary.find(i => i.id === selectedIcon) || iconLibrary[0];
    const label = document.getElementById('current-icon-label');
    label.innerHTML = `<i data-lucide="${iconData.id}"></i> ${iconData.label}`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Shape Picker Logic
function setupShapePicker() {
    const openBtn = document.getElementById('open-shape-picker');
    const pickerOverlay = document.getElementById('shape-picker-grid');
    const searchInput = document.getElementById('shape-search');

    openBtn.onclick = (e) => {
        e.stopPropagation();
        pickerOverlay.classList.toggle('active');
        if (pickerOverlay.classList.contains('active')) {
            searchInput.focus();
            renderShapeGrid('');
        }
    };

    searchInput.oninput = (e) => {
        renderShapeGrid(e.target.value.toLowerCase());
    };

    document.addEventListener('click', (e) => {
        if (!pickerOverlay.contains(e.target) && e.target !== openBtn) {
            pickerOverlay.classList.remove('active');
        }
    });
}

function renderShapeGrid(filter = '') {
    const container = document.getElementById('shape-items-container');
    container.innerHTML = '';

    const filtered = shapeLibrary.filter(item =>
        item.label.toLowerCase().includes(filter) ||
        item.category.toLowerCase().includes(filter) ||
        item.id.toLowerCase().includes(filter)
    );

    filtered.forEach(shape => {
        const item = document.createElement('div');
        item.className = 'icon-item';
        if (selectedShape === shape.id) item.classList.add('selected');

        // Use a preview div class that we'll style in CSS
        item.innerHTML = `
            <div class="shape-preview ${shape.id}"></div>
            <span>${shape.label}</span>
        `;

        item.onclick = () => {
            selectedShape = shape.id;
            updateShapePickerUI();
            document.getElementById('shape-picker-grid').classList.remove('active');
        };

        container.appendChild(item);
    });
}

function updateShapePickerUI() {
    const shapeData = shapeLibrary.find(s => s.id === selectedShape) || shapeLibrary[0];
    const label = document.getElementById('current-shape-label');
    label.innerText = shapeData.label;
}

document.addEventListener('DOMContentLoaded', () => {
    initEditor();
    setupToolbox();
    setupIconPicker();
    setupShapePicker();

    // Color Picker Sync (Node & Edge)
    const setupSync = (idPicker, idHex) => {
        const picker = document.getElementById(idPicker);
        const hex = document.getElementById(idHex);
        if (picker && hex) {
            picker.oninput = (e) => { hex.value = e.target.value.toUpperCase(); };
            hex.oninput = (e) => { picker.value = e.target.value; };
        }
    };
    setupSync('edge-color-input', 'edge-color-hex');
    setupSync('node-color-input', 'node-color-hex');

    if (typeof lucide !== 'undefined') lucide.createIcons();
});
