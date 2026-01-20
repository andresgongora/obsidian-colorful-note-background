import { App, PluginSettingTab, Setting, TextComponent, ButtonComponent, DropdownComponent, ColorComponent } from 'obsidian';
import ColorfulNoteBackgroundPlugin from './main';

export enum RuleType {
    Folder = "folder",
    Frontmatter = "frontmatter"
}

export interface ColorRule {
    id: string;
    value: string;
    type: RuleType;
    color: string;
    alpha?: number;
}

export class ColorBackgroundSettings {
    colorRules: ColorRule[] = [];
}

export const DEFAULT_SETTINGS: ColorBackgroundSettings = {
    colorRules: [
        {
            id: "inbox-ffb300",
            value: "Inbox",
            type: RuleType.Folder,
            color: "#ffb300",
            alpha: 0.04
        },
        {
            id: "frontmatter-public-499749",
            value: "category: public",
            type: RuleType.Frontmatter,
            color: "#499749",
            alpha: 0.04
        },
        {
            id: "frontmatter-private-c44545",
            value: "category: private",
            type: RuleType.Frontmatter,
            color: "#c44545",
            alpha: 0.04
        }
    ],
};

export class SettingsTab extends PluginSettingTab {
    plugin: ColorfulNoteBackgroundPlugin;

    constructor(app: App, plugin: ColorfulNoteBackgroundPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass('cnb-settings');

        // Description
        containerEl.createEl('p', {
            text: 'Add rules to color note backgrounds. Rules are matched in order—first match wins (priority).',
            cls: 'setting-item-description'
        });

        // Rules table
        const table = containerEl.createEl('div', { cls: 'cnb-rules-table' });

        // Header
        const header = table.createEl('div', { cls: 'cnb-rules-header' });
        header.createEl('span', { text: 'Type' });
        header.createEl('span', { text: 'Value' });
        header.createEl('span', { text: 'Color' });
        header.createEl('span', { text: 'Alpha' });
        header.createEl('span', { text: 'Priority' });
        header.createEl('span', { text: '' });

        // Rules container
        const rulesContainer = table.createEl('div', { cls: 'cnb-rules-body' });
        this.renderRules(rulesContainer);

        // Add button
        new Setting(containerEl)
            .addButton((btn) => {
                btn.setButtonText('Add rule')
                    .setCta()
                    .onClick(() => {
                        const newRule: ColorRule = {
                            id: Date.now().toString(),
                            value: '',
                            type: RuleType.Folder,
                            color: '#3b82f6',
                            alpha: 0.04,
                        };
                        this.plugin.settings.colorRules.push(newRule);
                        void this.plugin.saveSettings();
                        this.renderRules(rulesContainer);
                    });
            });
    }

    renderRules(container: HTMLElement): void {
        container.empty();
        this.plugin.settings.colorRules.forEach((rule, index) => {
            this.addRuleRow(container, rule, index);
        });
    }

    addRuleRow(container: HTMLElement, rule: ColorRule, index: number): void {
        const row = container.createEl('div', { cls: 'cnb-rule-row' });

        // Type dropdown
        const typeCell = row.createEl('div', { cls: 'cnb-cell' });
        new DropdownComponent(typeCell)
            .addOption(RuleType.Folder, 'Folder')
            .addOption(RuleType.Frontmatter, 'Frontmatter')
            .setValue(rule.type)
            .onChange((value) => {
                rule.type = value as RuleType;
                void this.plugin.saveSettings();
            });

        // Value input
        const valueCell = row.createEl('div', { cls: 'cnb-cell' });
        new TextComponent(valueCell)
            .setPlaceholder(rule.type === RuleType.Folder ? 'Folder name' : 'key: value')
            .setValue(rule.value)
            .onChange((value) => {
                rule.value = value;
                void this.plugin.saveSettings();
            });

        // Color picker
        const colorCell = row.createEl('div', { cls: 'cnb-cell cnb-color-cell' });
        const colorInput = new TextComponent(colorCell)
            .setValue(rule.color);
        colorInput.inputEl.addClass('cnb-color-input');

        const picker = new ColorComponent(colorCell)
            .setValue(rule.color)
            .onChange((color) => {
                rule.color = color;
                colorInput.setValue(color);
                void this.plugin.saveSettings();
            });

        colorInput.onChange((value: string) => {
            if (/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value)) {
                rule.color = value;
                picker.setValue(value);
                void this.plugin.saveSettings();
            }
        });

        // Alpha input
        const alphaCell = row.createEl('div', { cls: 'cnb-cell' });
        const alphaInput = new TextComponent(alphaCell)
            .setValue(rule.alpha?.toString() ?? '0.04');
        alphaInput.inputEl.type = 'number';
        alphaInput.inputEl.step = '0.01';
        alphaInput.inputEl.min = '0';
        alphaInput.inputEl.max = '1';
        alphaInput.inputEl.addClass('cnb-alpha-input');
        alphaInput.onChange((value) => {
            const num = parseFloat(value);
            if (!isNaN(num) && num >= 0 && num <= 1) {
                rule.alpha = num;
                void this.plugin.saveSettings();
            }
        });

        // Priority buttons (up/down)
        const priorityCell = row.createEl('div', { cls: 'cnb-cell cnb-priority-cell' });

        new ButtonComponent(priorityCell)
            .setIcon('chevron-up')
            .setTooltip('Move up (higher priority)')
            .setDisabled(index === 0)
            .onClick(() => {
                this.plugin.settings.colorRules.splice(index, 1);
                this.plugin.settings.colorRules.splice(index - 1, 0, rule);
                void this.plugin.saveSettings();
                this.renderRules(container);
            });

        new ButtonComponent(priorityCell)
            .setIcon('chevron-down')
            .setTooltip('Move down (lower priority)')
            .setDisabled(index === this.plugin.settings.colorRules.length - 1)
            .onClick(() => {
                this.plugin.settings.colorRules.splice(index, 1);
                this.plugin.settings.colorRules.splice(index + 1, 0, rule);
                void this.plugin.saveSettings();
                this.renderRules(container);
            });

        // Delete button
        const deleteCell = row.createEl('div', { cls: 'cnb-cell cnb-delete-cell' });
        new ButtonComponent(deleteCell)
            .setIcon('x')
            .setTooltip('Delete rule')
            .onClick(() => {
                this.plugin.settings.colorRules = this.plugin.settings.colorRules.filter((r) => r.id !== rule.id);
                void this.plugin.saveSettings();
                this.renderRules(container);
            });
    }
}
