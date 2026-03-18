# Athena CMS Factory - Master Context (v8.1)

## ⚡ AI Operational Mandates & APIs (Gemini 3.0 Ready)
1. **Startup Protocol**: This `GEMINI.md` file is the **Absolute Single Source of Truth** for AI Context. Never trust assumed knowledge; always refer to this document first. Read `factory/TASKS/_CHANGELOG.md`, `factory/TASKS/_TODO.md`, and `factory/docs/*.md` as needed.
2. **Thought Signatures (Crucial)**: When interacting with the Google GenAI SDK, AI agents must NEVER blindly rely on `response.text()` or fixed parts arrays. Gemini 3.0 responses often include internal reasoning (`thought`). Always use safely extracted parts: `const textPart = parts.find(p => p.text);`.
3. **Dynamic Model Selection**: Before hardcoding AI models (like Gemini or Groq), script must actively verify available models via their respective APIs (e.g., `https://openrouter.ai/api/v1/models`) to ensure they aren't using deprecated tiers.
4. **Task Execution**:
   - Update `factory/TASKS/_TODO.md` and `factory/TASKS/_IN_PROGRESS.md` before starting any new task.
   - Move completed tasks to `factory/TASKS/_DONE.md` and remove from active tracking.

## 💻 Hardware Constraints & Storage Health
The primary development machine is a Chromebook with limited resources (16GB RAM, 128GB SSD).
- **MANDATORY Tooling**: Use **UITSLUITEND `pnpm`** for all Node.js projects to maximize disk efficiency via the centralized store. No `npm` or `yarn`.
- **Frontend Stack**: Use **UITSLUITEND Vite** for generating new React environments due to its low overhead.
- **Hydration System**: The `DoctorController` manages disk space:
    - Sites not actively being worked on are "dehydrated" (missing `node_modules`).
    - The `storage-prune-all` command sweeps inactive site `node_modules`.
    - It also sweeps `src/data-temp/` directories older than 3 weeks to prevent infinite disk space accumulation.

## 🛡️ Git Governance & "Safe Ingress" Protocol
- **Single Source of Truth**: The remote GitHub repository (`origin/main`) is the definitive Source of Truth. The Google Sheet is a managed upstream interface.
- **SSH Protocol**: Before any Git push, check `~/.ssh/config` and verify the identity using `gh auth status` to ensure you push as the correct user (e.g., `KarelTestSpecial`).
- **Safe Ingress (GitHub Pull)**: When a site is opened in the Dock:
    1.  The system checks for a GitHub repository (`hasRepo`).
    2.  If found, the Dock prompts the user to sync.
    3.  If accepted, `safePullFromGitHub` FIRST triggers a local backup of `src/data/`.
    4.  It then uses **`git sparse-checkout`** to pull only the relevant site directory, preventing the monorepo from overriding other sites.
    5.  It pulls and merges the changes safely.

## 🏛️ Project Architecture & Tooling Stack
Athena v8.1 is an automated factory featuring the v33 Sync Bridge and Modular Component Architecture, built as a monorepo (`athena-x`).

### 📦 Modular Data Architecture Standard (1-on-1 Rule)
To ensure maximum clarity and safety, every site follows a strict mapping:
1.  **Content Tabs (Visible to Client)**: Every UI Section (e.g., `header`, `hero`, `voordelen`, `footer`) has its own dedicated JSON file and a visible, human-readable tab in Google Sheets.
2.  **Config Tabs (Hidden from Client)**: All technical configurations MUST be prefixed with an underscore (`_`) in Google Sheets to be hidden from the client.
    -   `_site_settings`: Global identity (Name, Logo, Header/Footer heights).
    -   `_style_config`: Colors, Fonts, Spacing.
    -   `_links_config`: Diverted URL mapping.
    -   `_section_order`: The sequence of sections on the page.
    -   `_layout_settings`: Grid and spacing logic.
    -   `_system`: Internal factory metadata.

*   **Stack**: React 19 + Vite + Tailwind v4.
*   **Two-Track Strategy**:
    *   **Docked**: Lightweight, editor-less sites controlled by Athena Dock.
    *   **Autonomous**: Self-contained sites with built-in editor tools.
*   **Architectural Layouts**:
    *   **SPA (Single-Page)**: One main component routing down. Default for merchants.
    *   **MPA (Multi-Page)**: Utilizes `react-router-dom` 7. For institutions/complex services.

## 🔄 Data Flow, Split-Save & Governance Modes
- **Governance**: Sites operate in `dev-mode` (full bidirectional sync) or `client-mode` (developer creates style, client pushes texts).
- **Style/Content Separation**: The system enforces clean separation.
    - Content lives in `site_settings.json` and primary Google Sheet tabs.
    - Style lives in `style_config.json` and the hidden `_style_config` Sheet tab.
- **Split-Save**: When editing links via the Visual Editor, the Label is saved locally to its respective JSON file, but the URL is diverted to `links_config.json` (and `_links_config` in Sheets) to prevent breaking data structures. They are merged again at runtime.
- **Temporary Data (`src/data-temp/`)**: When pulling data from Sheets directly, it goes to `src/data-temp/` first for safe comparison (diffing) before overwriting local visual edits.

## 🚨 Critical Code Constraints & Guardrails
- **Human-Readable Data Rule**: Alle veldnamen in Google Sheets en JSON bestanden moeten in het **Nederlands** zijn en een natuurlijke, leesbare naam hebben (bv. `bedrijfsnaam` in plaats van `company_name`, `titel` in plaats van `title`). Dit maximaliseert de gebruiksvriendelijkheid voor de eindklant in de Google Sheets interface.
- **Shell Commando's**: Gebruik NOOIT interactieve commando's die niet vanzelf afsluiten (zoals `pm2 logs` zonder `--no-daemon`, `top`, of `watch`). Gebruik in plaats daarvan `cat`, `tail -n`, of lees logbestanden direct uit `/home/kareltestspecial/.pm2/logs/`.
- **Template Literals**: In `5-engine/logic/`, ALWAYS escape dollar signs in generated code: `\$`.
- **BaseURL**: Use `import.meta.env.BASE_URL` for ALL internal links and assets perfectly support GitHub Pages.
- **CSS Architecture**: ONLY `index.css` is allowed to `@import "tailwindcss"`. No custom CSS unless standard Tailwind utilities fail.
- **Header Logo**: Must use `object-contain` and a transparent container.

## 📂 Detailed Project Directory Structure
```text
/home/kareltestspecial/0-IT/2-Productie/athena-x/
├── GEMINI.md                     # Master Context for the Factory (THIS FILE)
├── dock/                         # Visual Editor (Athena Dock) React App (Port 5002)
│   ├── public/sites.json         # Central registry of all generated sites
│   └── src/components/           # Dock UI components (DesignControls, DockFrame)
├── factory/                      # The Factory Engine and Resources (Dashboard Port 5001)
│   ├── dashboard/                # 🌐 Web GUI (athena.js)
│   ├── 2-templates/              # Core boilerplates and generation logic
│   ├── 3-sitetypes/              # Business-specific blueprints
│   ├── 5-engine/                 # ⚙️ Shared Engine Library (factory.js, sync-*, parser-*)
│   ├── 6-utilities/              # Batch maintenance tools (update-all-heros.js)
│   └── output/logs/              # Centralized logging directory
├── input/                        # Data workspace (TSV, JSON, raw-input.txt)
└── sites/                        # Output directory for generated websites (managed via Sparse Checkout).
```

### 🏆 v8.1 Excellence Standards (2026)
- **Sync Bridge:** Always use v33 On-Demand Sync in `App.jsx`.
- **Data:** Prefer `all_data.json` aggregation for performance over heavy HTTP requests.
- **Layout:** Modularize sections in `src/components/sections/`.
- **Unified Interaction**: Use `Shift + Click` logic for editing; standard clicks trigger native behavior for easier functional testing. Mandatory `data-dock-type` and `data-dock-bind` for editor reliability.

## 🛠️ Maintenance & Lessons Learned
- **Google Sheets API Limits (March 2026):**
  - **Object Synchronization:** The Google Sheets API (v4) in `RAW` mode cannot process nested objects (e.g., color/font CMS objects). This results in `Invalid values[x][y]: struct_value` errors.
  - **Solution:** `DataManager.js` must always extract primitives (`.text`, `.title`, `.label`) or stringify objects before syncing.
  - **Build Integrity:** Corrupt/empty Sheets can overwrite local data during the GitHub Actions build via `fetch-data.js`. Always verify Sheet sync success before a production push.
