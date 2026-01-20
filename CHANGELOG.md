# Changelog

## 1.0.5 (2026.01.20)

- Fix settings window layout issues.

## 1.0.4 (2026.01.20)

- Added AGENTS.md with agent guidelines and project scratchpad.
- Refreshed README: concise overview, install options, config table.
- Adopted ESLint v9 flat config with `eslint-plugin-obsidianmd` (sentence case, settings-tab rules, no forbidden elements).
- Removed dead code after CSS refactor: `removeStyle`, `updateStyles`, `updateStyle`, `makeStyleName`.
- Switched styling to CSS custom properties: `.cnb-highlighted` + `--cnb-highlight-color` in styles.css (no dynamic style tags).
- Fixed promise handling in settings UI via `void this.plugin.saveSettings()`; adjusted UI text to sentence case (e.g., “Move up/down”).
- Added null guard for `activeView.file` to satisfy strict typing.
- Deleted deprecated `.eslintignore`; added `eslint.config.mjs`.

## 1.0.0 (2025.08.29)

- Forked from the original Colorful Note Borders plugin to create Colorful Note Background.
- Updated README.md to reflect the new plugin name and functionality.
- Changed script to support background colors instead of borders.
- Added alpha control to interpolate between the chosen color and the current theme.
