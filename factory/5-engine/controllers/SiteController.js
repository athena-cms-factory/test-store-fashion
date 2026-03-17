/**
 * SiteController.js
 * @description Headless business logic for managing generated sites.
 */

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { createProject, validateProjectName } from '../core/factory.js';
import { deployProject } from '../wizards/deploy-wizard.js';
import { AthenaDataManager } from '../lib/DataManager.js';
import { AthenaInterpreter } from '../core/interpreter.js';
import { InstallManager } from '../lib/InstallManager.js';

export class SiteController {
    constructor(configManager, executionService, processManager) {
        this.configManager = configManager;
        this.execService = executionService;
        this.pm = processManager;
        this.root = configManager.get('paths.root');
        this.sitesDir = configManager.get('paths.sites');
        this.sitesExternalDir = configManager.get('paths.sitesExternal');
        this.dataManager = new AthenaDataManager(configManager.get('paths.factory'));
        this.interpreter = new AthenaInterpreter(configManager);
        this.installManager = new InstallManager(this.root);
    }

    async updateFromInstruction(projectName, instruction) {
        const paths = this.dataManager.resolvePaths(projectName);
        const basisData = this.dataManager.loadJSON(path.join(paths.dataDir, 'basis.json')) || [];
        const settings = this.dataManager.loadJSON(path.join(paths.dataDir, 'site_settings.json')) || {};
        
        const context = {
            availableFiles: fs.existsSync(paths.dataDir) ? fs.readdirSync(paths.dataDir).filter(f => f.endsWith('.json')) : [],
            basisSample: basisData[0],
            settingsSample: Array.isArray(settings) ? settings[0] : settings
        };

        const aiResponse = await this.interpreter.interpretUpdate(instruction, context);
        for (const patch of aiResponse.patches) {
            this.dataManager.patchData(projectName, patch.file, patch.index, patch.key, patch.value);
        }

        if (aiResponse.syncRequired) {
            await this.dataManager.syncToSheet(projectName);
        }

        return {
            success: true,
            message: "Site succesvol bijgewerkt op basis van de instructie.",
            patches: aiResponse.patches,
            syncPerformed: aiResponse.syncRequired
        };
    }

    list() {
        const nativeSites = this._scanDir(this.sitesDir, true);
        const externalSites = this._scanDir(this.sitesExternalDir, false);
        return [...nativeSites, ...externalSites];
    }

    _scanDir(dir, isNative) {
        if (!dir || !fs.existsSync(dir)) return [];
        const sites = fs.readdirSync(dir).filter(f => 
            fs.statSync(path.join(dir, f)).isDirectory() && !f.startsWith('.') && f !== 'athena-cms'
        );

        return sites.map(site => {
            const sitePath = path.join(dir, site);
            let siteType = isNative ? 'basis' : 'static-legacy';
            let status = 'local';
            let isInstalled = fs.existsSync(path.join(sitePath, 'node_modules'));

            const configPath = path.join(sitePath, 'athena-config.json');
            if (fs.existsSync(configPath)) {
                try {
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    if (config.siteType) siteType = config.siteType;
                    if (config.status) status = config.status;
                } catch (e) { }
            }

            const sitePort = this.getSitePort(site, sitePath);
            return {
                id: site,
                name: site,
                isNative,
                isExternal: !isNative,
                path: sitePath,
                port: sitePort,
                localUrl: `http://localhost:5000/previews/${site}/`,
                siteType,
                status,
                isInstalled
            };
        });
    }

    /**
     * Start/Get preview server for a site
     */
    async preview(id) {
        let siteDir = path.join(this.sitesDir, id);
        let isExternal = false;

        if (!fs.existsSync(siteDir)) {
            siteDir = path.join(this.sitesExternalDir, id);
            isExternal = true;
        }

        if (!fs.existsSync(siteDir)) throw new Error(`Site '${id}' niet gevonden.`);

        // 🔱 v8.8 Intelligent Preview for External Sites
        if (isExternal) {
            console.log(`📂 Serving external site ${id} via API static root`);
            return { success: true, status: 'ready', url: `http://localhost:5000/${id}/` };
        }

        const previewPort = this.getSitePort(id, siteDir);
        const activeProcesses = this.pm.listActive();

        // 1. Controleer of de site AL DRAAIT op deze poort
        if (activeProcesses[previewPort] && activeProcesses[previewPort].id === id) {
            console.log(`✅ Site '${id}' is already running on port ${previewPort}.`);
            return { success: true, status: 'ready', url: `http://localhost:${previewPort}/${id}/` };
        }

        // 2. STOP ALLE ANDERE PREVIEWS op deze poort (behalve de API zelf!)
        if (activeProcesses[previewPort]) {
            console.log(`🧹 Port ${previewPort} is occupied. Stopping old process...`);
            await this.pm.stopProcessByPort(previewPort);
        }

        // 3. Start de juiste server op basis van site type
        let siteType = 'basis';
        const configPath = path.join(siteDir, 'athena-config.json');
        if (fs.existsSync(configPath)) {
            try { siteType = JSON.parse(fs.readFileSync(configPath, 'utf8')).siteType; } catch(e){}
        }

        if (siteType === 'static-legacy') {
            console.log(`📦 Starting light server (sirv) for static site ${id} on port ${previewPort}...`);
            await this.pm.startProcess(id, 'preview', previewPort, 'sirv', [siteDir, '--port', previewPort.toString(), '--host', '--dev', '--single'], { cwd: siteDir });
        } else {
            console.log(`🚀 Starting Vite preview for ${id} on port ${previewPort}...`);
            try {
                await this.pm.startProcess(id, 'preview', previewPort, 'pnpm', ['dev', '--port', previewPort.toString(), '--host'], { cwd: siteDir });
            } catch (e) {
                console.error(`Fout bij starten preview ${id}:`, e.message);
            }
        }

        // 🔱 v8.8 Intelligent Preview for all sites via API Hub
        // We return a URL that goes through the API (port 5000) to solve CORS
        return { success: true, status: 'ready', url: `http://localhost:5000/previews/${id}/` };
    }

    getSitePort(id, siteDir) {
        // Load from central registry if possible
        try {
            const registryPath = path.join(this.root, 'port-manager/registry.json');
            if (fs.existsSync(registryPath)) {
                const reg = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
                if (reg.services && reg.services[id]) return reg.services[id].port;
            }
        } catch(e){}

        // Fallback: use legacy ports file
        const portsFile = path.join(this.root, 'factory/config/site-ports.json');
        if (fs.existsSync(portsFile)) {
            const ports = JSON.parse(fs.readFileSync(portsFile, 'utf8'));
            if (ports[id]) return ports[id];
        }

        // Default range 5100+
        return 5100; 
    }

    async stopPreview(id) {
        const active = this.pm.listActive();
        for (const port in active) {
            if (active[port].id === id) {
                await this.pm.stopProcessByPort(parseInt(port));
                return { success: true };
            }
        }
        return { success: false, message: "Geen actieve preview gevonden voor deze site." };
    }

    async pullFromSheet(id) { return await this.dataManager.pullFromSheet(id); }
    async pullToTemp(id) { return await this.dataManager.pullToTemp(id); }
    async syncToSheet(id) { return await this.dataManager.syncToSheet(id); }
    async safePullFromGitHub(id) { return await this.execService.runSafePull(id); }
    async compareSiteSources(id) { return await this.dataManager.compareSources(id); }
}
