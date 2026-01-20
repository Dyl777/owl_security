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
