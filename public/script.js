// Navigation
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('href').substring(1);
        document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
        document.getElementById(target).style.display = 'block';
    });
});

// Mock data
let repos = ['repo1', 'repo2'];

function refreshDocker() {
    document.getElementById('container-count').textContent = '5 running';
}

function analyzeDocker() {
    document.getElementById('docker-analysis').style.display = 'block';
    document.getElementById('unused-containers').textContent = '2';
    document.getElementById('high-mem').textContent = '1';
    const analysis = document.getElementById('docker-analysis');
    analysis.innerHTML += '<p>Security: 1 root container, 2 exposed ports, 1 unlimited memory.</p>';
}

function cleanDocker() {
    alert('Cleaning Docker: removed stopped containers, dangling images, unused volumes, networks.');
}

function scanCache() {
    const lang = document.getElementById('language-select').value;
    const results = document.getElementById('cache-results');
    results.innerHTML = `<p>Scanned ${lang}: Found 500MB of cache. Cleaned.</p>`;
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
    document.getElementById('log-content').textContent = `Mock log from ${path}\nLine 1\nLine 2\n...`;
}

function scanLogs() {
    const dir = document.getElementById('log-dir').value;
    const grouped = document.getElementById('grouped-logs');
    grouped.innerHTML = `
        <div class="group">
            <h5>ERROR: First 15 chars</h5>
            <p>Log entries...</p>
        </div>
        <div class="group">
            <h5>WARN: First 15 chars</h5>
            <p>Log entries...</p>
        </div>
    `;
}

function addGraph() {
    const graphDiv = document.getElementById('anomaly-graphs');
    const container = document.createElement('div');
    container.className = 'graph-container';
    container.innerHTML = '<h4>New Graph</h4><canvas width="400" height="200"></canvas>';
    graphDiv.appendChild(container);
    drawGraph(container.querySelector('canvas'));
}

function drawGraph(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(0, 100);
    ctx.lineTo(100, 80);
    ctx.lineTo(200, 120);
    ctx.lineTo(300, 90);
    ctx.lineTo(400, 110);
    ctx.strokeStyle = '#0366d6';
    ctx.stroke();
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
    alert(`Activating swarm for ${repo} with key ${key}`);
});

function createSnapshot() {
    alert('Snapshot created.');
}

function restoreSnapshot() {
    alert('Restored from snapshot.');
}

function scheduleCleanup() {
    const type = document.getElementById('schedule-type').value;
    alert(`Scheduled ${type} cleanup.`);
}

function bindCloud() {
    const service = document.getElementById('cloud-service').value;
    const incremental = document.getElementById('incremental').checked;
    const folders = document.getElementById('backup-folders').value;
    alert(`Bound to ${service}, incremental: ${incremental}, folders: ${folders}`);
}

function scanSecrets() {
    const results = document.getElementById('secret-results');
    results.innerHTML = '<p>Found: 3 .env files, 2 hardcoded keys, 1 old SSH key.</p>';
}

function cleanGit() {
    const results = document.getElementById('git-results');
    results.innerHTML = '<p>Cleaned: 5 orphaned objects, 2 old branches, stale logs.</p>';
}

// Initial load
updateRepoList();
refreshDocker();
drawGraph(document.getElementById('disk-canvas'));
drawGraph(document.getElementById('commits-canvas'));
drawGraph(document.getElementById('shutdown-canvas'));