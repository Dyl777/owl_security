// Navigations
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('href').substring(1);
        document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
        document.getElementById(target).style.display = 'block';
    });
});

// Dummy data for each table
let repos = ['repo1', 'repo2', 'my-project', 'old-repo'];
let dockerContainers = [
    { name: 'web-app', status: 'running', lastRun: '2026-01-10', origin: 'CI branch old-feature', disk: '500MB', ram: '256MB', unused: true, highMem: false, root: false, exposedPorts: true, unlimitedMem: false },
    { name: 'db', status: 'stopped', lastRun: '2026-01-05', origin: 'main', disk: '1GB', ram: '512MB', unused: true, highMem: true, root: true, exposedPorts: false, unlimitedMem: true },
    { name: 'cache', status: 'running', lastRun: '2026-01-14', origin: 'dev', disk: '200MB', ram: '128MB', unused: false, highMem: false, root: false, exposedPorts: false, unlimitedMem: false },
    { name: 'api', status: 'running', lastRun: '2026-01-12', origin: 'feature-branch', disk: '300MB', ram: '200MB', unused: false, highMem: false, root: false, exposedPorts: false, unlimitedMem: false }
];
let cacheData = {
    'Node.js': { node_modules: '2GB', cache: '500MB' },
    'Python': { pycache: '100MB', pip: '300MB', virtualenvs: '1GB' },
    'Java': { maven: '800MB', gradle: '400MB' },
    'Rust': { target: '1.5GB', cargo: '200MB' },
    'Go': { module: '600MB' },
    'Flutter/Android/iOS': { build: '3GB', emulator: '2GB' }
};
let gitRepos = [
    { name: 'repo1', untouched: '3 months', duplicate: false, clonedNeverBuilt: true },
    { name: 'repo2', untouched: '1 week', duplicate: true, clonedNeverBuilt: false },
    { name: 'my-project', untouched: '2 months', duplicate: false, clonedNeverBuilt: false },
    { name: 'old-repo', untouched: '6 months', duplicate: true, clonedNeverBuilt: true }
];
let secrets = ['.env in /home/user/project', 'API_KEY in code.py', 'old_ssh_key in ~/.ssh', 'AWS_ACCESS_KEY in config.json'];
let logEntries = [
    'ERROR: Connection failed at 10:00',
    'WARN: Disk space low at 11:00',
    'ERROR: Timeout error at 12:00',
    'INFO: Process started at 13:00',
    'ERROR: Authentication failed at 14:00',
    'WARN: Memory usage high at 15:00'
];
let anomalyData = {
    commits: [10, 15, 8, 20, 5, 25, 30, 12, 18, 22, 7, 28, 35, 14], // unusual spikes over 14 days
    shutdowns: [1, 0, 2, 0, 3, 1, 0, 4, 0, 2, 1, 0, 5, 0], // anomalies in shutdown patterns
    charging: [8, 10, 6, 12, 9, 7, 11, 5, 13, 8, 10, 6, 12, 9], // hours of charging per day
    admin: [0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1], // hours in admin mode
    kernel: [5, 3, 7, 4, 6, 8, 2, 9, 4, 6, 7, 3, 8, 5], // kernel level processes count
    ports: [22, 80, 443, 22, 8080, 22, 3306, 22, 80, 443, 22, 8080, 22, 3306], // open ports at anomaly times
    disk: [50, 55, 60, 70, 65, 75, 80, 85, 78, 82, 88, 90, 85, 92], // GB disk usage derivative
    memory: [4, 5, 6, 7, 5, 8, 9, 6, 7, 8, 9, 7, 10, 8] // GB memory usage derivative
};
let snapshots = ['snapshot-2026-01-01', 'snapshot-2026-01-08', 'snapshot-2026-01-15'];
let scheduledTasks = ['Weekly cleanup on Sunday', 'Monthly cleanup on 1st', 'Before shutdown cleanup'];
let cloudBindings = ['Google Drive: incremental, folders: Documents, Projects', 'Dropbox: full backup, folders: Desktop'];

function refreshDocker() {
    document.getElementById('container-count').textContent = dockerContainers.filter(c => c.status === 'running').length + ' running';
}

function analyzeDocker() {
    const analysis = document.getElementById('docker-analysis');
    analysis.style.display = 'block';
    const unused = dockerContainers.filter(c => c.unused).length;
    const highMem = dockerContainers.filter(c => c.highMem).length;
    const root = dockerContainers.filter(c => c.root).length;
    const exposed = dockerContainers.filter(c => c.exposedPorts).length;
    const unlimited = dockerContainers.filter(c => c.unlimitedMem).length;
    analysis.innerHTML = `
        <p>Unused containers (not used in 7 days): ${unused}</p>
        <p>High memory consumers: ${highMem}</p>
        <p>Security issues: ${root} root containers, ${exposed} exposed ports, ${unlimited} unlimited memory</p>
        <table>
            <tr><th>Name</th><th>Last Run</th><th>Origin</th><th>Disk</th><th>RAM</th></tr>
            ${dockerContainers.map(c => `<tr><td>${c.name}</td><td>${c.lastRun}</td><td>${c.origin}</td><td>${c.disk}</td><td>${c.ram}</td></tr>`).join('')}
        </table>
    `;
}

function cleanDocker() {
    alert('Cleaning Docker: removed stopped containers, dangling images, unused volumes, networks.');
    dockerContainers = dockerContainers.filter(c => !c.unused);
    refreshDocker();
}

function scanCache() {
    const lang = document.getElementById('language-select').value;
    const data = cacheData[lang];
    const results = document.getElementById('cache-results');
    results.innerHTML = `<p>${lang} Cache:</p><ul>${Object.entries(data).map(([k,v]) => `<li>${k}: ${v}</li>`).join('')}</ul><p>Cleaned!</p>`;
}

function addRepo() {
    const name = prompt('Enter repo name');
    if (name) {
        repos.push(name);
        updateRepoList();
    }
}

function updateRepoList() {
    const list = document.getElementById('repo-list');
    list.innerHTML = '';
    repos.forEach(repo => {
        const li = document.createElement('li');
        li.textContent = repo;
        const menu = document.createElement('button');
        menu.textContent = 'Security Check';
        menu.onclick = () => openSecurityModal(repo);
        li.appendChild(menu);
        list.appendChild(li);
    });
    updateRepoSelect();
}

function openSecurityModal(repo) {
    document.getElementById('repo-select').value = repo;
    // In real, open modal, but for now, just set
}

function monitorLog() {
    const path = document.getElementById('logfile').value;
    document.getElementById('log-content').textContent = logEntries.join('\n');
}

function scanLogs() {
    const dir = document.getElementById('log-dir').value;
    const grouped = {};
    logEntries.forEach(log => {
        const prefix = log.substring(0, 15);
        if (!grouped[prefix]) grouped[prefix] = [];
        grouped[prefix].push(log);
    });
    const groupedDiv = document.getElementById('grouped-logs');
    groupedDiv.innerHTML = Object.entries(grouped).map(([prefix, logs]) => `
        <div class="group">
            <h5>${prefix}</h5>
            <ul>${logs.map(l => `<li>${l}</li>`).join('')}</ul>
        </div>
    `).join('');
}

function addGraph() {
    const type = prompt('Enter graph type: commits, shutdowns, charging, admin, kernel, ports, disk, memory');
    if (type && anomalyData[type]) {
        const labels = {
            commits: ["Days", "Commits"],
            shutdowns: ["Days", "Shutdowns"],
            charging: ["Days", "Hours"],
            admin: ["Days", "Hours"],
            kernel: ["Days", "Processes"],
            ports: ["Days", "Ports"],
            disk: ["Days", "GB"],
            memory: ["Days", "GB"]
        };
        const graphDiv = document.getElementById('anomaly-graphs');
        const container = document.createElement('div');
        container.className = 'graph-container';
        container.innerHTML = `<h4>${type.charAt(0).toUpperCase() + type.slice(1)} Anomalies</h4><canvas width="400" height="200" style="border:1px solid #e1e4e8;"></canvas>`;
        graphDiv.appendChild(container);
        drawGraph(container.querySelector('canvas'), anomalyData[type], ...labels[type]);
    } else {
        alert('Invalid type or no data');
    }
}

function drawGraph(canvas, data = [10, 15, 8, 20, 5, 25, 30], xLabel = "Time", yLabel = "Value") {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const max = Math.max(...data);
    const stepX = canvas.width / data.length;
    const stepY = canvas.height / max;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - data[0] * stepY);
    data.forEach((val, i) => {
        ctx.lineTo(i * stepX, canvas.height - val * stepY);
    });
    ctx.strokeStyle = '#0366d6';
    ctx.stroke();
    // Labels
    ctx.fillStyle = '#24292e';
    ctx.font = '12px sans-serif';
    ctx.fillText(xLabel, canvas.width / 2 - 20, canvas.height + 15);
    ctx.save();
    ctx.translate(0, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, -canvas.height / 2 - 20, -10);
    ctx.restore();
}

function updateRepoSelect() {
    const select = document.getElementById('repo-select');
    select.innerHTML = '';
    repos.forEach(repo => {
        const option = document.createElement('option');
        option.value = repo;
        option.textContent = repo;
        select.appendChild(option);
    });
}

document.getElementById('security-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const repo = document.getElementById('repo-select').value;
    const key = document.getElementById('api-key').value;
    const status = document.getElementById('security-status');
    status.innerHTML = `<p>Activating swarm for ${repo} with API key. Cloning to cloud, running tests...</p><ul><li>SQL Injection Test: Passed</li><li>XSS Test: Failed</li><li>Auth Bypass: Passed</li></ul>`;
});

function createSnapshot() {
    const name = `snapshot-${new Date().toISOString().split('T')[0]}`;
    snapshots.push(name);
    updateSnapshots();
    alert('Snapshot created.');
}

function restoreSnapshot() {
    if (snapshots.length > 0) {
        alert(`Restored from ${snapshots[snapshots.length - 1]}`);
    }
}

function updateSnapshots() {
    const list = document.getElementById('snapshots-list');
    list.innerHTML = '<h5>Snapshots:</h5><ul>' + snapshots.map(s => `<li>${s}</li>`).join('') + '</ul>';
}

function scheduleCleanup() {
    const type = document.getElementById('schedule-type').value;
    const task = `${type} cleanup`;
    scheduledTasks.push(task);
    updateScheduled();
    alert(`Scheduled ${task}.`);
}

function updateScheduled() {
    const list = document.getElementById('scheduled-list');
    list.innerHTML = '<h5>Scheduled Tasks:</h5><ul>' + scheduledTasks.map(t => `<li>${t}</li>`).join('') + '</ul>';
}

function bindCloud() {
    const service = document.getElementById('cloud-service').value;
    const incremental = document.getElementById('incremental').checked;
    const folders = document.getElementById('backup-folders').value;
    const binding = `${service}: ${incremental ? 'incremental' : 'full'}, folders: ${folders}`;
    cloudBindings.push(binding);
    updateCloud();
    alert(`Bound to ${service}`);
}

function updateCloud() {
    const list = document.getElementById('cloud-list');
    list.innerHTML = '<h5>Cloud Bindings:</h5><ul>' + cloudBindings.map(c => `<li>${c}</li>`).join('') + '</ul>';
}

function scanSecrets() {
    const results = document.getElementById('secret-results');
    results.innerHTML = `<p>Found secrets:</p><ul>${secrets.map(s => `<li>${s}</li>`).join('')}</ul>`;
}

function cleanGit() {
    const results = document.getElementById('git-results');
    results.innerHTML = `
        <p>Git Hygiene Results:</p>
        <ul>
            ${gitRepos.map(r => `<li>${r.name}: Untouched ${r.untouched}, Duplicate: ${r.duplicate}, Never built: ${r.clonedNeverBuilt}</li>`).join('')}
        </ul>
        <p>Cleaned orphaned objects, old branches, logs, submodules.</p>
    `;
}

// Initial load
updateRepoList();
refreshDocker();
drawGraph(document.getElementById('commits-canvas'), anomalyData.commits, "Days", "Commits");
drawGraph(document.getElementById('shutdown-canvas'), anomalyData.shutdowns, "Days", "Shutdowns");
drawGraph(document.getElementById('charging-canvas'), anomalyData.charging, "Days", "Hours");
drawGraph(document.getElementById('admin-canvas'), anomalyData.admin, "Days", "Hours");
drawGraph(document.getElementById('kernel-canvas'), anomalyData.kernel, "Days", "Processes");
drawGraph(document.getElementById('ports-canvas'), anomalyData.ports, "Days", "Ports");
drawGraph(document.getElementById('disk-canvas'), anomalyData.disk, "Days", "GB");
drawGraph(document.getElementById('memory-canvas'), anomalyData.memory, "Days", "GB");
updateSnapshots();
updateScheduled();
updateCloud();

function scanRegistry() {
    const key = document.getElementById('registry-key').value;
    const results = document.getElementById('registry-results');
    // Dummy registry data
    const registryData = [
        { subkey: 'Software\\MyApp', value: 'Version', data: '1.0', type: 'REG_SZ' },
        { subkey: 'Software\\MyApp', value: 'InstallPath', data: 'C:\\Program Files\\MyApp', type: 'REG_SZ' },
        { subkey: 'Software\\MyApp\\Settings', value: 'AutoStart', data: '1', type: 'REG_DWORD' },
        { subkey: 'Software\\MyApp\\Settings', value: 'Timeout', data: '30', type: 'REG_DWORD' }
    ];
    results.innerHTML = `<p>Registry entries for key: ${key}</p><table><tr><th>Subkey</th><th>Value</th><th>Data</th><th>Type</th></tr>${registryData.map(r => `<tr><td>${r.subkey}</td><td>${r.value}</td><td>${r.data}</td><td>${r.type}</td></tr>`).join('')}</table>`;
}

function scanMacOS() {
    const plist = document.getElementById('macos-plist').value;
    const results = document.getElementById('macos-results');
    // Dummy plist data
    const plistData = [
        { key: 'CFBundleVersion', value: '1.0', type: 'string' },
        { key: 'CFBundleExecutable', value: 'MyApp', type: 'string' },
        { key: 'LSUIElement', value: 'true', type: 'boolean' },
        { key: 'NSAppTransportSecurity', value: '{...}', type: 'dict' }
    ];
    results.innerHTML = `<p>Plist entries for: ${plist}</p><table><tr><th>Key</th><th>Value</th><th>Type</th></tr>${plistData.map(p => `<tr><td>${p.key}</td><td>${p.value}</td><td>${p.type}</td></tr>`).join('')}</table>`;
}

function cleanBrowserCache() {
    const results = document.getElementById('browser-results');
    results.innerHTML = '<p>Cleaned browser cache: 1.2GB freed.</p>';
}