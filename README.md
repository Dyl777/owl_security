# System Cleanup & Monitoring — UI

A **UI-only** for a system cleanup, monitoring, and security tool meant to be
binded later to a backend.

This repository contains **HTML, CSS, and JavaScript only** and is intended to be run locally using a simple static server (e.g., Live Server). No backend, APIs, or external libraries are included.

---

## Running

This project can be served via a local web server.

### Option 1: VS Code Live Server

1. Open the project folder in VS Code
2. Install the **Live Server** extension
3. Right-click `index.html`
4. Click **Open with Live Server**

---

### Option 2: Simple Local Server (Node.js)

If Node.js is installed:

```bash
npx serve
```

---


A UI for developer monitoring, and security tool. It simulates dashboards for Docker hygiene, cache cleanup, secret scanning, Git repository maintenance, log monitoring, anomaly detection, backups, scheduling, cloud bindings, and per-repository security checks, allowing users to explore workflows, navigation, and configuration flows without performing any real system operations.

---

## Tech Stack

* HTML5
* CSS3
* Vanilla JavaScript
* No external libraries
* No frameworks
* No backend

---

## UI Sections

### Dashboard

* Docker status panel
* Smart Docker analysis controls
* Build and cache cleanup selector
* Secret scanning panel
* Git repository hygiene panel
* Browser cache cleanup panel

---

### Repositories

* List of tracked repositories
* Add repository button
* Per-repository selection

---

### Log Monitoring

* Monitor a single log file
* Scan a directory for logs
* Display raw logs
* Group logs by prefix (first 15 characters)

---

### Anomaly Detection

Graph placeholders for:

* Unusual commits
* Shutdown anomalies
* Charging periods
* Admin mode activity
* Kernel-level processes
* Open ports anomalies
* Disk usage derivative
* Memory usage derivative

---

### Settings

#### Security Checkthrough

* Select repository
* Enter API key
* Activate security swarm (UI-only) (Agentic)

#### Backup & Safety

* Dry-run mode toggle
* Create snapshot button
* Restore snapshot button
* Ignore rules textarea

#### Scheduled Cleanup

* Weekly / Monthly / Before shutdown
* Schedule button

#### Cloud Backup

* Select cloud provider
* Incremental toggle
* Folder selection
* Bind button

#### System Registries

* Windows registry scan
* macOS plist scan
* Linux config scan

---

## Roadmap
* Add real backend integration
* Connect Docker and Git APIs
* Implement real log ingestion
* Add real anomaly detection
* Add authentication backend
* Add cloud backup connectors

---

## Author

Dyl Padaran Ambe

---
