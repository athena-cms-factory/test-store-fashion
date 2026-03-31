# Case Study: Vite CSS-Analysis & Logo Path Resolution (2026-03-31)

## Problem Description
The `urban-soles` site was experiencing a persistent `500 Internal Server Error` with the following trace:
`[plugin:vite:css-analysis] ENOENT: no such file or directory, open '/.../sites/urban-soles/public/site-logo.svg'`

This occurred after attempting to standardize the logo path from the root `/public/` to `/public/images/`.

## Root Cause Analysis
1. **Component Persistence**: The site's `Header.jsx`, `Footer.jsx`, and `dock-connector.js` components used a `getImageUrl` helper that automatically prepended `/images/`. This necessitated moving the file to `/public/images/`.
2. **Static Analysis Ghosting**: Vite's Tailwind v4 plugin (`@tailwindcss/vite`) performs a "css-analysis" phase where it scans the entire project (including JS and JSON files) for strings that look like CSS classes or asset paths.
3. **The Conflict**: `site_settings.json` contained the string `"site-logo.svg"`. Because this JSON was imported into the application bundle, Tailwind v4 attempted to resolve it as a static asset. When the file was moved to `/images/`, the resolution failed because the string in the JSON did not match the new path, causing a build-time crash.

## Solution Implemented
1. **Unify Resolution**: Updated `site_settings.json` to explicitly include the path: `"site_logo_image": "images/site-logo.svg"`.
2. **Modernize Helpers**: Updated the `getImageUrl` helper in all components to be idempotent. It now checks if the `images/` prefix is already present before prepending it.
   ```javascript
   const path = url.startsWith('images/') ? url : `images/${url}`;
   ```
3. **Cache Invalidation**: Force-cleared the Vite cache (`rm -rf node_modules/.vite`) to remove faulty css-analysis artifacts.
4. **Resilience**: Temporarily maintained the logo in both the root and the `/images/` directory to satisfy any legacy or hidden static references during the transition.

## Verification
- Verified site stability via `browser_subagent`.
- Confirmed logo visibility in the header.
- Confirmed `304` status for `/images/site-logo.svg` in network logs.

## Best Practices for Athena CMS
- Always keep `site_settings.json` paths aligned with the actual filestructure.
- Ensure `getImageUrl` helpers handle already-prefixed paths to allow for flexible data sources.
- After moving public assets, always clear the `.vite` cache.
