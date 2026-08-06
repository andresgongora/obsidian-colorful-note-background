# AI Agent Guidelines

Repo-local rules for the Colorful Note Background Obsidian plugin.

## Meta

- Living doc. Evolves from repeated signal, not one-off taste.
- Durable behavior only. Task logs / architecture notes → `.agent/notes/` or
  `.agent/progress/` (create via docs-write behavior, not here).
- Style: dense, imperative, fragment OK. Reader is AI.

## Info

- **Purpose**: Obsidian plugin — colors note backgrounds by folder location or frontmatter metadata.
- **Domain**: TypeScript, Obsidian plugin API.
- **Platforms**: Obsidian desktop and mobile.
- **Layout**: `src/main.ts` plugin class, event handlers, style management ·
  `src/settingsTab.ts` settings UI, `ColorRule`/`RuleType` types · `styles.css`
  base CSS, `.cnb-highlighted` rules · `tests/` Jest specs +
  `tests/__mocks__/obsidian.ts` API mock.
- **Not source of truth**: `main.js` (built, gitignored, published via GitHub releases only).

## Directives

- Single clear implementation, no alternatives in play → proceed without asking.

## Rules

### Style & Conventions

- No dynamic `<style>` tags (forbidden by `obsidianmd/no-forbidden-elements`).
  Use `.cnb-highlighted` class + inline `--cnb-highlight-color` custom
  property; base rules in `styles.css`.
- Rule matching: folder rules match any folder in path; frontmatter rules match metadata key-value pairs.
- Colors: RGBA with alpha transparency (recommended 0.04) for smooth theme transitions.
- UI strings sentence case (`obsidianmd/ui/sentence-case`); settings headings
  via `Setting(...).setHeading()`, no manual HTML headings.

### File Placement

- Plugin logic → `src/main.ts`.
- Settings UI → `src/settingsTab.ts`.

## Boundaries

- Never commit `main.js` — build artifact, ships via GitHub releases, not source.
- Never commit secrets / tokens.

## Tools & Commands

- **Dev mode**: `npm run dev` — watch mode, auto-rebuild.
- **Build**: `npm run build` — production build with TypeScript checks.
- **Test**: `npm test` · watch: `npm run test:dev` · coverage: `npm run test:coverage`.
- **Lint**: `npm run lint` — ESLint flat config (`eslint.config.mjs`), includes
  `eslint-plugin-obsidianmd` recommended set.
- **Version bump**: `npm run version` — bumps manifest/versions.json.
- **Release**: `npm run release` — standard-version.
