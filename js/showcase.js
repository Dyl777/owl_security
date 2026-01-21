// OWASP Data State
let owaspData = [];

// Fetch OWASP Data from JSON
async function loadOWASPData() {
    try {
        const response = await fetch('data/owasp.json');
        owaspData = await response.json();

        // Render if on OWASP page
        if (document.getElementById('owasp-search')) {
            renderOWASP();
        }
    } catch (error) {
        console.error('Error loading OWASP data:', error);
    }
}

// Hamburger Menu Logic
function setupHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            hamburger.innerHTML = navMenu.classList.contains('active') ? '✕' : '☰';
        });

        // Close menu when clicking outside
        document.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.innerHTML = '☰';
            }
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.innerHTML = '☰';
            });
        });
    }
}

// Theme Management
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('showcase_theme', isDark ? 'dark' : 'light');
    updateThemeButton();

    // Refresh graph theme if it exists
    if (window.network) {
        initThreatGraph();
    }
    if (window.editorNetwork) {
        initEditor();
    }
}

function updateThemeButton() {
    const btn = document.getElementById('theme-btn');
    if (!btn) return;
    const isDark = document.body.classList.contains('dark-mode');
    btn.innerHTML = isDark ? '<i data-lucide="sun"></i> <span>Light Mode</span>' : '<i data-lucide="moon"></i> <span>Dark Mode</span>';
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function initTheme() {
    const savedTheme = localStorage.getItem('showcase_theme');
    // Default is light, so only add dark-mode if saved as dark
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateThemeButton();
}

// --- Reporting Logic ---

function saveReport(event) {
    if (event) event.preventDefault();

    const appName = document.getElementById('app-name').value;
    const section = document.getElementById('affected-section').value;
    const severity = document.getElementById('severity').value;
    const description = document.getElementById('report-desc').value;
    const imageInput = document.getElementById('report-image');

    if (!appName || !description) {
        alert("Please fill in App/Repo name and Description.");
        return;
    }

    const reader = new FileReader();

    const btn = document.querySelector('#report-form button');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Analyzing...';
    }

    const processReport = (imageData = "") => {
        const report = {
            id: Date.now(),
            appName,
            section,
            severity,
            description,
            imageData,
            timestamp: new Date().toLocaleString(),
            mappedOWASP: mapToOWASP(`${section} ${description}`)
        };

        const reports = JSON.parse(localStorage.getItem('security_reports') || '[]');
        reports.push(report);
        localStorage.setItem('security_reports', JSON.stringify(reports));

        setTimeout(() => {
            alert("Security report analyzed and archived successfully!");
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = 'Save Report';
            }
            document.getElementById('report-form').reset();
            renderReports();
        }, 800);
    };

    if (imageInput.files[0]) {
        reader.onload = (e) => processReport(e.target.result);
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        processReport();
    }
}

function mapToOWASP(text) {
    const findings = [];
    const lowerText = text.toLowerCase();

    owaspData.forEach(item => {
        const match = item.keywords.some(keyword => lowerText.includes(keyword));
        if (match) {
            findings.push({ id: item.id, title: item.title });
        }
    });

    return findings;
}

function renderReports() {
    const list = document.getElementById('reports-list');
    if (!list) return;

    const reports = JSON.parse(localStorage.getItem('security_reports') || '[]');
    list.innerHTML = reports.length === 0 ? '<p>No reports found.</p>' : '';

    reports.forEach(r => {
        const div = document.createElement('div');
        div.className = 'report-item';
        // Dynamic border based on severity
        const severityColors = { low: '#3fb950', medium: '#d29922', high: '#f85149' };
        div.style.borderLeftColor = severityColors[r.severity] || 'var(--danger-color)';

        div.innerHTML = `
            <strong>${r.appName}</strong> <span style="font-size:0.8rem; color:var(--text-color); opacity: 0.7;">(${r.timestamp})</span>
            <div style="font-size: 0.85rem; margin-bottom: 0.5rem;">
                <span class="mapping-tag">${r.section}</span>
                <span class="mapping-tag" style="background: ${severityColors[r.severity]}22; border-color: ${severityColors[r.severity]}">${r.severity.toUpperCase()}</span>
            </div>
            <p>${r.description}</p>
            ${r.imageData ? `<img src="${r.imageData}" alt="Report Screenshot">` : ''}
            <div class="report-mapping">
                <strong>Mapped OWASP Violations:</strong><br>
                ${r.mappedOWASP && r.mappedOWASP.length > 0 ?
                r.mappedOWASP.map(m => `<span class="mapping-tag">${m.id}: ${m.title}</span>`).join('') :
                'None identified'}
            </div>
        `;
        list.appendChild(div);
    });
}

// --- OWASP Logic ---

function renderOWASP(filterText = "") {
    const container = document.getElementById('owasp-container');
    if (!container) return;

    container.innerHTML = '';
    const filtered = owaspData.filter(item =>
        item.title.toLowerCase().includes(filterText.toLowerCase()) ||
        item.description.toLowerCase().includes(filterText.toLowerCase()) ||
        item.tools.some(t => t.toLowerCase().includes(filterText.toLowerCase()))
    );

    filtered.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'owasp-item animate-in';
        div.style.animationDelay = `${index * 0.05}s`;
        div.innerHTML = `
            <div class="owasp-title">${item.id}: ${item.title}</div>
            <p>${item.description}</p>
            <div style="font-size: 0.85rem; color: #8b949e;">
                <strong>Recommended Tools:</strong> ${item.tools.join(', ')}
            </div>
            <div class="related-reports" id="related-${item.id}">
                <!-- Injected via lookup -->
            </div>
        `;
        container.appendChild(div);
    });

    injectRelatedReports();
}

function injectRelatedReports() {
    const reports = JSON.parse(localStorage.getItem('security_reports') || '[]');

    owaspData.forEach(item => {
        const relatedDiv = document.getElementById(`related-${item.id}`);
        if (!relatedDiv) return;

        const matches = reports.filter(r => r.mappedOWASP.some(m => m.id === item.id));
        if (matches.length > 0) {
            relatedDiv.innerHTML = `
                <div style="margin-top:10px; padding: 5px; background: rgba(88, 166, 255, 0.1); border-radius:4px; font-size:0.8rem;">
                    <strong>Connected User Reports:</strong><br>
                    ${matches.map(m => `• ${m.appName} - ${m.description.substring(0, 30)}...`).join('<br>')}
                </div>
            `;
        }
    });
}

function updateStats() {
    const reports = JSON.parse(localStorage.getItem('security_reports') || '[]');
    const vulnEl = document.getElementById('total-vulnerabilities');
    const scoreEl = document.getElementById('security-score');

    if (vulnEl) vulnEl.innerText = reports.length;

    if (scoreEl) {
        if (reports.length === 0) scoreEl.innerText = 'A+';
        else if (reports.length < 3) scoreEl.innerText = 'B';
        else if (reports.length < 6) scoreEl.innerText = 'C';
        else scoreEl.innerText = 'F';
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupHamburger();
    loadOWASPData();
    updateStats();

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    if (document.getElementById('report-form')) {
        renderReports();
        document.getElementById('report-form').addEventListener('submit', (e) => {
            saveReport(e);
            setTimeout(updateStats, 100);
        });
    }

    if (document.getElementById('owasp-search')) {
        renderOWASP();
        document.getElementById('owasp-search').addEventListener('input', (e) => {
            renderOWASP(e.target.value);
        });
    }

    if (document.getElementById('threat-network')) {
        initThreatGraph();
    }

    if (document.getElementById('integrations-grid')) {
        initIntegrations();
    }
});

// Integrations Logic
let integrationsData = [];

async function initIntegrations() {
    try {
        const response = await fetch('data/integrations.json');
        integrationsData = await response.json();
        renderIntegrations();
        setupMarketplaceListeners();
    } catch (error) {
        console.error('Error loading integrations:', error);
    }
}

function renderIntegrations(filter = 'All', search = '') {
    const grid = document.getElementById('integrations-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = integrationsData.filter(int => {
        const matchesCategory = filter === 'All' || int.category === filter;
        const matchesSearch = int.name.toLowerCase().includes(search.toLowerCase()) ||
            int.description.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    filtered.forEach((int, index) => {
        const card = document.createElement('div');
        card.className = 'card int-card animate-in';
        card.style.animationDelay = `${index * 0.05}s`;
        card.innerHTML = `
            <div class="int-icon"><i data-lucide="${int.icon}"></i></div>
            <div class="int-name">${int.name}</div>
            <div class="int-desc">${int.description}</div>
            <div class="int-status status-${int.status}">${int.status}</div>
        `;
        grid.appendChild(card);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function setupMarketplaceListeners() {
    const searchInput = document.getElementById('int-search');
    const categoryItems = document.querySelectorAll('#category-list li');

    let activeCategory = 'All';

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderIntegrations(activeCategory, e.target.value);
        });
    }

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            activeCategory = item.getAttribute('data-category');
            renderIntegrations(activeCategory, searchInput ? searchInput.value : '');
        });
    });
}

// Threat Graph Data
const nodeData = [
    { id: 1, label: 'Internet', title: 'Public exposure point. Gateway for HTTP/HTTPS traffic.', group: 'world' },
    { id: 2, label: 'Load Balancer', title: 'Nginx entry point. Routes traffic to container clusters.', group: 'lb' },
    { id: 3, label: 'Web Service', title: 'React Frontend. Vulnerable to XSS and Session Hijacking.', group: 'container', color: { background: '#ff4d4d', border: '#cf222e' } },
    { id: 4, label: 'API Server', title: 'Node.js Backend. Handles business logic and DB connections.', group: 'container' },
    { id: 5, label: 'Main DB', title: 'PostgreSQL Database. Contains sensitive user information.', group: 'db' },
    { id: 6, label: 'SlackBot', title: 'Integration for real-time security alerts.', group: 'int' },
    { id: 7, label: 'Jira API', title: 'Ticketing system for vulnerability tracking.', group: 'int' }
];

const edgeData = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 4, color: '#ff4d4d', arrows: 'to', dashes: true, width: 3 },
    { from: 4, to: 5 },
    { from: 4, to: 6, dashes: true },
    { from: 4, to: 7, dashes: true }
];

let network = null;

function initThreatGraph() {
    const container = document.getElementById('threat-network');
    if (!container) return;

    const isDark = document.body.classList.contains('dark-mode');
    const accentColor = isDark ? '#58a6ff' : '#0969da';
    const textColor = isDark ? '#c9d1d9' : '#24292f';

    const data = {
        nodes: new vis.DataSet(nodeData),
        edges: new vis.DataSet(edgeData)
    };

    const options = {
        nodes: {
            shape: 'dot',
            size: 25,
            font: { color: textColor, size: 14, face: 'Inter' },
            borderWidth: 2,
            shadow: true
        },
        edges: {
            width: 2,
            color: { color: isDark ? '#30363d' : '#d0d7de', highlight: accentColor },
            shadow: true,
            smooth: { type: 'continuous' }
        },
        groups: {
            world: { color: { background: '#2ea043', border: '#1a7f37' } },
            lb: { color: { background: '#0969da', border: '#03449d' } },
            container: { color: { background: '#8957e5', border: '#6e40c9' } },
            db: { color: { background: '#d29922', border: '#9a6700' } },
            int: { color: { background: '#6e7681', border: '#484f58' } }
        },
        physics: {
            stabilization: true,
            barnesHut: { gravitationalConstant: -2000, centralGravity: 0.3, springLength: 150 }
        },
        interaction: { hover: true, tooltipDelay: 200 }
    };

    network = new vis.Network(container, data, options);

    network.on("click", function (params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = nodeData.find(n => n.id === nodeId);
            showNodeDetails(node);
        }
    });
}

function showNodeDetails(node) {
    const details = document.getElementById('node-details');
    const title = document.getElementById('detail-title');
    const desc = document.getElementById('detail-desc');
    const tags = document.getElementById('detail-tags');

    title.innerText = node.label;
    desc.innerText = node.title;
    tags.innerHTML = node.color?.background === '#ff4d4d' ? '<span class="mapping-tag" style="border-color: var(--danger-color); color: var(--danger-color);">CRITICAL EXPOSURE</span>' : '<span class="mapping-tag">SECURE</span>';

    details.classList.add('active');
    details.style.display = 'block';
}

function resimulateGraph() {
    if (network) {
        // Randomize some threats
        const nodes = network.body.data.nodes;
        nodeData.forEach(n => {
            const isThreat = Math.random() > 0.7;
            nodes.update({ id: n.id, color: isThreat ? { background: '#ff4d4d', border: '#cf222e' } : null });
        });
        network.stabilize();
    }
}

function toggleIntegrations() {
    const btn = document.getElementById('toggle-int-btn');
    const intNodes = nodeData.filter(n => n.group === 'int').map(n => n.id);

    if (network) {
        const nodes = network.body.data.nodes;
        const firstInt = nodes.get(intNodes[0]);
        const isHidden = !!firstInt.hidden;

        intNodes.forEach(id => {
            nodes.update({ id: id, hidden: !isHidden });
        });

        btn.innerText = !isHidden ? 'Show Integrations' : 'Hide Integrations';
    }
}
