/**
 * @file rename-site-wizard.js
 * @description Wizard voor het hernoemen van een Athena project (mappen, configs & git).
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { ask, rl } from '../cli-interface.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

async function runRenameWizard() {
    console.log("\n=======================================");
    console.log("🔄 Athena Project Rename Wizard");
    console.log("=======================================");

    // 1. Selecteer project
    const sitesDir = path.resolve(root, '../sites');
    const projects = fs.readdirSync(sitesDir).filter(f => {
        return fs.statSync(path.join(sitesDir, f)).isDirectory() && f !== '.git' && f !== '.gitkeep';
    });

    console.log('\n📁 Selecteer het project dat u wilt hernoemen:');
    projects.forEach((f, i) => console.log(`   [${i + 1}] ${f}`));
    
    const choice = await ask('\n🚀 Nummer: ');
    const index = parseInt(choice, 10) - 1;
    if (isNaN(index) || !projects[index]) {
        console.log("❌ Ongeldige keuze.");
        process.exit(1);
    }

    const oldName = projects[index];
    const newNameRaw = await ask(`\n🆕 Nieuwe naam voor '${oldName}' (bv. soap-antwerpen): `);
    const newName = newNameRaw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

    if (!newName || newName === oldName) {
        console.log("❌ Ongeldige naam of geen wijziging.");
        process.exit(1);
    }

    if (fs.existsSync(path.join(sitesDir, newName))) {
        console.log(`❌ Er bestaat al een site met de naam '${newName}'.`);
        process.exit(1);
    }

    console.log(`\n🛠️  Hernoemen van '${oldName}' naar '${newName}'...`);

    try {
        // 2. Mappen hernoemen via Git (voor de sites submodule)
        console.log(`   📂 Mappen verplaatsen...`);
        console.log(`   📂 Mappen verplaatsen...`);
        const oldSitePath = path.join(sitesDir, oldName);
        const newSitePath = path.join(sitesDir, newName);
        if (fs.existsSync(oldSitePath)) {
            fs.renameSync(oldSitePath, newSitePath);
        }
        
        // Verplaats ook de data map (indien deze niet in git zit, gewone mv)
        const oldDataPath = path.join(root, '../input', oldName);
        const newDataPath = path.join(root, '../input', newName);
        if (fs.existsSync(oldDataPath)) {
            fs.renameSync(oldDataPath, newDataPath);
        }

        // 3. Configuraties bijwerken
        const siteDir = path.join(sitesDir, newName);
        console.log(`   ⚙️  Configuraties bijwerken...`);

        // package.json
        const pkgPath = path.join(siteDir, 'package.json');
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            pkg.name = newName;
            fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
            console.log(`      ✅ package.json bijgewerkt.`);
        }

        // vite.config.js
        const vitePath = path.join(siteDir, 'vite.config.js');
        if (fs.existsSync(vitePath)) {
            let vite = fs.readFileSync(vitePath, 'utf8');
            // Update de base URL voor GitHub Pages
            const baseRegex = /base:\s*['\"][^'\"]*['"]/g;
            vite = vite.replace(baseRegex, `base: '/${newName}/'`);
            fs.writeFileSync(vitePath, vite);
            console.log(`      ✅ vite.config.js bijgewerkt.`);
        }

        // index.html
        const indexPath = path.join(siteDir, 'index.html');
        if (fs.existsSync(indexPath)) {
            let html = fs.readFileSync(indexPath, 'utf8');
            html = html.replace(/<title>.*?<\/title>/, `<title>${newName}</title>`);
            fs.writeFileSync(indexPath, html);
            console.log(`      ✅ index.html bijgewerkt.`);
        }

        // 4. [NIEUW] Monorepo Synchronisatie
        console.log(`   🌐 Monorepo synchronisatie...`);

        // A. Centrale Registry: dock/public/sites.json
        const registryPath = path.resolve(root, '../dock/public/sites.json');
        if (fs.existsSync(registryPath)) {
            try {
                const sites = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
                const siteIndex = sites.findIndex(s => s.id === oldName || s.name === oldName);
                if (siteIndex !== -1) {
                    const site = sites[siteIndex];
                    site.id = newName;
                    site.name = newName;
                    
                    // Update URLs indien gebaseerd op de oude naam
                    if (site.repoUrl && site.repoUrl.includes(oldName)) {
                        site.repoUrl = site.repoUrl.replace(new RegExp(oldName, 'g'), newName);
                    }
                    if (site.liveUrl && site.liveUrl.includes(oldName)) {
                        site.liveUrl = site.liveUrl.replace(new RegExp(oldName, 'g'), newName);
                    }
                    
                    fs.writeFileSync(registryPath, JSON.stringify(sites, null, 2));
                    console.log(`      ✅ dock/public/sites.json (Registry) bijgewerkt.`);
                }
            } catch (e) {
                console.warn(`      ⚠️  Kon Registry niet bijwerken: ${e.message}`);
            }
        }

        // B. Deployment Record: project-settings/deployment.json
        const deployPath = path.join(siteDir, 'project-settings/deployment.json');
        if (fs.existsSync(deployPath)) {
            try {
                let deploy = fs.readFileSync(deployPath, 'utf8');
                deploy = deploy.replace(new RegExp(oldName, 'g'), newName);
                fs.writeFileSync(deployPath, deploy);
                console.log(`      ✅ project-settings/deployment.json bijgewerkt.`);
            } catch (e) {
                console.warn(`      ⚠️  Kon Deployment record niet bijwerken: ${e.message}`);
            }
        }

        // 5. Afronding
        console.log(`\n✅ Project succesvol hernoemd en gesynchroniseerd!`);
        console.log(`   📍 Nieuwe locatie: ../sites/${newName}`);
        console.log(`   🌐 Nieuwe live URL: https://athena-cms-factory.github.io/${newName}`);

    } catch (e) {
        console.error(`\n❌ Fout tijdens hernoemen:`, e.message);
    }

    rl.close();
}

runRenameWizard();
