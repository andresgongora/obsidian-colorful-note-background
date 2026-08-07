# Changelog

## 1.0.10 (2026.08.07)

- Removed `!important` from CSS rules, increased selector specificity instead.

## 1.0.9 (2026.08.07)

- Hardened CI/CD workflows: added version verification, asset validation, changelog extraction.
- Fixed LICENSE format for GitHub detection.

## 1.0.8 (2026.08.07)

- Fixed event registration: deferred to `onLayoutReady` for proper vault initialization.
- Modernized build tooling: ES2020 tsconfig, Prettier formatting, Jest CJS config.
- Added funding links: Buy Me A Coffee badge and `fundingUrl` in manifest.

## 1.0.7 (2026.08.06)

- Modernized tsconfig for TypeScript 6: removed deprecated `baseUrl`,
  switched `moduleResolution` to `bundler` (matches esbuild).
- Untracked `coverage/` from the repo; reports stay local, `.gitignore` covers `.agent/` and `coverage/`.
- Raised test coverage for `main.ts` (45%→97% statements) and `settingsTab.ts` (80%→99% statements).
- Added version, license, and minAppVersion badges to README.

## 1.0.6 (2026.01.22)

- Update LICENSE file for current year.

## 1.0.5 (2026.01.20)

- Fix settings window layout issues.

## 1.0.4 (2026.01.20)

- Added AGENTS.md with agent guidelines and project scratchpad.
- Refreshed README: concise overview, install options, config table.
- Adopted ESLint v9 flat config with `eslint-plugin-obsidianmd` (sentence case,
  settings-tab rules, no forbidden elements).
- Removed dead code after CSS refactor: `removeStyle`, `updateStyles`, `updateStyle`, `makeStyleName`.
- Switched styling to CSS custom properties: `.cnb-highlighted` +
  `--cnb-highlight-color` in styles.css (no dynamic style tags).
- Fixed promise handling in settings UI via `void this.plugin.saveSettings()`;
  adjusted UI text to sentence case (e.g., "Move up/down").
- Added null guard for `activeView.file` to satisfy strict typing.
- Deleted deprecated `.eslintignore`; added `eslint.config.mjs`.

## 1.0.0 (2025.08.29)

- Forked from the original Colorful Note Borders plugin to create Colorful Note Background.
- Updated README.md to reflect the new plugin name and functionality.
- Changed script to support background colors instead of borders.
- Added alpha control to interpolate between the chosen color and the current theme.
