import { Plugin, TFile, MarkdownView, WorkspaceLeaf } from 'obsidian';

import { SettingsTab, ColorBackgroundSettings, DEFAULT_SETTINGS, ColorRule, RuleType } from './settingsTab';

export const checkPath = (currentPath: string, folder: string): boolean => {
    // return currentPath.includes(folder);
    const parts = currentPath.split(/[/\\]/);
    return parts.includes(folder);
}

export function hexToRgbA(hex: string, alpha: number): string {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

export default class ColorfulNoteBackgroundPlugin extends Plugin {
    settings: ColorBackgroundSettings;

    async onload() {
        await this.loadSettings();

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new SettingsTab(this.app, this));

        this.registerEvent(
            this.app.workspace.on("active-leaf-change", this.onActiveLeafChange.bind(this))
        );
        this.registerEvent(
            this.app.metadataCache.on("changed", this.onMetadataChange.bind(this))
        );
        this.registerEvent(
            this.app.vault.on("rename", this.onFileRename.bind(this))
        );
    }

    onunload() {
        // cleanup all highlighted notes
        this.app.workspace.getLeavesOfType("markdown").forEach((leaf: WorkspaceLeaf) => {
            if (!(leaf.view instanceof MarkdownView)) return;
            const contentView = leaf.view.containerEl.querySelector(".view-content");
            if (contentView) {
                this.unhighlightNote(contentView);
            }
        });
    }

    removeStyle(rule: ColorRule) {
        // No-op: styles are managed via CSS custom properties now
    }

    onActiveLeafChange(activeLeaf: WorkspaceLeaf) {
        // console.log("+ active leaf change: ", activeLeaf);
        this.applyRules();
    }

    onMetadataChange(file: TFile) {
        // console.log("+ metadata change");
        this.applyRules(file);
    }

    onFileRename(file: TFile) {
        // console.log("+ filename change");
        this.applyRules();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        this.updateStyles();
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.updateStyles();
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
            this.onFileRename(activeFile);
        }
    }

    updateStyles() {
        this.settings.colorRules.forEach((rule: ColorRule) => this.updateStyle(rule));
    }

    updateStyle(rule: ColorRule) {
        // Styles are now defined in styles.css using CSS custom properties
        // No dynamic style injection needed
    }

    applyRules(file: TFile | null = null) {
        this.app.workspace.getLeavesOfType("markdown").forEach((value: WorkspaceLeaf) => {
            if (!(value.view instanceof MarkdownView)) return;
            const activeView = value.view;
            const viewFile = activeView.file;
            if (file && file !== viewFile) return;
            const contentView = activeView.containerEl.querySelector(".view-content");
            if (!contentView) return;

            this.unhighlightNote(contentView);
            this.settings.colorRules.some((rule) => {
                return this.applyRule(viewFile, rule, contentView);
            });
        });
    }

    applyRule(file: TFile, rule: ColorRule, contentView: Element): boolean {
        switch (rule.type) {
            case RuleType.Folder: {
                if (checkPath(file.path, rule.value)) {
                    // console.log("- folder -", file);
                    // console.log(file.path);
                    // console.log(rule.value);
                    this.highlightNote(contentView, rule);
                    return true;
                }
                break;
            }
            case RuleType.Frontmatter: {
                // console.log("- front-matter -", file);
                // console.log(rule.value);
                const [key, value] = rule.value.split(":", 2);
                const frontMatterValue = this.app.metadataCache.getFileCache(file)?.frontmatter?.[key];
                const normalizedFrontMatterValue = frontMatterValue?.toString().toLowerCase().trim();
                const normalizedValueToHighlight = value?.toString().toLowerCase().trim();
                // console.log(`++ front matter: ${key}, ${value} :: ${normalizedFrontMatterValue} === ${normalizedValueToHighlight}`);
                if (normalizedFrontMatterValue === normalizedValueToHighlight) {
                    this.highlightNote(contentView, rule);
                    return true;
                }
                break
            }
        }
        return false;
    }

    highlightNote(element: Element, rule: ColorRule) {
        const alpha = typeof rule.alpha === "number" ? rule.alpha : 1.0;
        const rgbaColor = hexToRgbA(rule.color, alpha);
        element.classList.add('cnb-highlighted');
        (element as HTMLElement).style.setProperty('--cnb-highlight-color', rgbaColor);
    }

    unhighlightNote(element: Element) {
        element.classList.remove('cnb-highlighted');
        (element as HTMLElement).style.removeProperty('--cnb-highlight-color');
    }

    makeStyleName(rule: ColorRule): string {
        return `cnb-${rule.id}-style`;
    }
}
