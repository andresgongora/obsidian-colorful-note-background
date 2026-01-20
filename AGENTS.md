# Guidelines for AI Agents

<!------------------------------------------------------------------------------------------------->
## Self-Improvement Feedback Loop
<!------------------------------------------------------------------------------------------------->

- **About**: This file is a living document. Agents should update it based on user interactions.
- **Goal**: Make this file evolve organically through conversation, so agents fulfill user requests
  more precisely over time. Start minimal, grow as needed.
- **Modification rules for this file**: Changes should be generalizable and reflect user intent.
  Permission to update is implicit when user accepts code changes.
- **Nested AGENTS.md**: For subfolders containing `AGENTS.md`, apply same rules locally as for this
  file. Nested files inherit and narrow scope/specificity recursively. Top-level rules always
  prevail.

### Sections in this File

1. `## Agent Directives`: Meta guidance for agent communication.

2. `## Info`: High-level facts (purpose, architecture, language, platforms).
    - **When to update**: If section appears incomplete or when major changes occur. Avoid
      speculation; use `## Scratchpad` for temporary notes.

3. `## Rules`: Core guidelines.
    - **When to update**: Add rules when user requests reveal design intent that applies broadly.

4. `## Tools`: Build/test/deploy commands. Maintainer updates only.

5. `## Scratchpad` stores temporary notes: project structure, ongoing work, inter-agent
   communication, and information to reduce redundant exploration.
    - **When to update**: Update the `## Scratchpad` whenever you discover patterns, dependencies,
      or workflows relevant to future agent runs. Scratchpad maintenance is expected; don't be
      conservative here.
    - **Format:**
      ```markdown
      <!-- SCRATCHPAD BLOCK: [scope/topic] | Created: YYYY-MM-DD -->
      [content here]
      <!-- END SCRATCHPAD BLOCK -->
      ```
    - **Usage:**
        - **Multiple blocks allowed**: Different scopes/topics in separate sections.
        - **Metadata required**: Scope/topic and creation date to assess validity. Extra fields
          allowed.
        - **Agent discretion**: Trust based on age and scope relevance.
            - **Short-term**: Trust within same session or recent date (hours/days).
            - **Long-term**: Re-verify if old (weeks/months) or major changes occurred.
            - **Housekeeping**: Discard non relevant blocks or update metadata if verification
              passes.
    - **Consideration**:
        - When in doubt, prefer updating `## Scratchpad` over changing `## Info` or `## Rules`.
        - Using the scratchpad is highly encouraged to aid the next agent execution.

<!------------------------------------------------------------------------------------------------->
## Agent Directives
<!------------------------------------------------------------------------------------------------->

- **Making changes**: If conversation leads to a single clear implementation (not multiple
  alternatives), proceed without asking permission. When you would end with "Should I proceed?" or
  similar; assume yes.

<!------------------------------------------------------------------------------------------------->
## Info
<!------------------------------------------------------------------------------------------------->

- **Purpose**: Obsidian plugin that applies colored backgrounds to notes based on folder location or frontmatter metadata, helping users visually distinguish and categorize their notes.
- **Architecture**: Event-driven plugin that listens to workspace changes (active-leaf-change, metadata changes, file renames) and dynamically applies CSS styles to note backgrounds based on user-defined rules.
- **Language**: TypeScript
- **Target platforms**: Obsidian (desktop and mobile)

<!------------------------------------------------------------------------------------------------->
## Rules
<!------------------------------------------------------------------------------------------------->

- **Code organization**: Main plugin logic in `src/main.ts`, settings UI in `src/settingsTab.ts`
- **Styling approach**: Avoid dynamic `<style>` tags. Use `.cnb-highlighted` class with CSS custom property `--cnb-highlight-color` set inline; base rules live in `styles.css`.
- **Rule matching**: Folder rules match any folder in the path; frontmatter rules match metadata key-value pairs
- **Color format**: Use RGBA with alpha transparency (recommended: 0.04) for smooth theme transitions

<!------------------------------------------------------------------------------------------------->
## Tools
<!------------------------------------------------------------------------------------------------->

- **Dev mode**: `npm run dev` - Watch mode with auto-rebuild
- **Build**: `npm run build` - Production build with TypeScript checks
- **Test**: `npm test` - Run Jest tests
- **Test watch**: `npm run test:dev` - Run tests in watch mode
- **Test coverage**: `npm run test:coverage` - Run tests with coverage report
- **Lint**: `npm run lint` - Run ESLint
- **Version bump**: `npm run version` - Bump version in manifest/versions.json
- **Release**: `npm run release` - Create a release using standard-version

<!------------------------------------------------------------------------------------------------->
## Scratchpad
<!------------------------------------------------------------------------------------------------->

<!-- SCRATCHPAD BLOCK: Project Structure | Created: 2026-01-20 -->
**Key Files:**
- `src/main.ts`: Main plugin class with event handlers and style management
- `src/settingsTab.ts`: Settings UI, ColorRule interface, RuleType enum
- `manifest.json`: Plugin metadata
- `tests/main.test.ts`: Unit tests
- `tests/__mocks__/obsidian.ts`: Mock Obsidian API for testing

**Core Concepts:**
- ColorRule: `{id, value, type, color, alpha}` - defines a background rule
- RuleType: `folder` or `frontmatter` - how to match notes
- Style naming: `.colorful-note-background-{ruleId}` CSS class applied to workspace leaf
- Alpha blending: Uses `linear-gradient` to layer colored background over existing theme

**Event Flow:**
1. User changes active note → `onActiveLeafChange` → `applyRules()`
2. Metadata changes → `onMetadataChange` → `applyRules(file)`
3. File renamed → `onFileRename` → `applyRules()`
4. Settings saved → `saveSettings()` → `updateStyles()` → `applyRules()`
<!-- END SCRATCHPAD BLOCK -->

<!-- SCRATCHPAD BLOCK: Linting & ESLint Plugin | Created: 2026-01-20 -->
**ESLint setup:**
- Using flat config at `eslint.config.mjs` (ESLint v9)
- Includes `eslint-plugin-obsidianmd` recommended config
- TypeScript parser enabled for `**/*.ts` with project `tsconfig.json`
- Ignores JS config files and `tests/**` to keep noise low

**Key rules in use:**
- `obsidianmd/ui/sentence-case`: UI strings in sentence case (fixed here)
- `obsidianmd/settings-tab/no-manual-html-headings`: use `Setting(...).setHeading()` (applied)
- `obsidianmd/no-forbidden-elements`: no dynamic `<style>` tags (replaced with CSS vars)

**Commands:**
- Lint: `npm run lint`

**Notes:**
- Aggressive TS rules like `no-unsafe-*` are disabled for this project to reduce noise
- Styling now uses `.cnb-highlighted` + `--cnb-highlight-color` in `styles.css`
<!-- END SCRATCHPAD BLOCK -->
