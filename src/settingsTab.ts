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
        new Setting(containerEl).setName('Note background rules').setHeading();

        // Create a header row
        const headerRow = containerEl.createEl('div', { cls: 'cnb-rule-settings-header-row' });

        // Add labels for each column
        headerRow.createEl('span', { text: 'Rule type', cls: 'cnb-rule-settings-column-rule-type' });
        headerRow.createEl('span', { text: 'Value', cls: 'cnb-rule-settings-column-rule-value' });
        headerRow.createEl('span', { text: 'Color', cls: 'cnb-rule-settings-column-rule-color' });
        headerRow.createEl('span', { text: 'Alpha', cls: 'cnb-rule-settings-column-rule-alpha' });
        headerRow.createEl('span', { text: '', cls: 'cnb-rule-settings-column-rule-button' });

        const rulesContainer = containerEl.createEl('div', { cls: 'cnb-rules-container' });

        // Display existing rules
        this.plugin.settings.colorRules.forEach((rule, index) => this.addRuleSetting(rulesContainer, rule, index));

        // Add new rule button
        new ButtonComponent(containerEl)
            .setButtonText('Add new rule')
            .onClick(() => {
                const newRule: ColorRule = {
                    id: Date.now().toString(),
                    value: '',
                    type: RuleType.Folder,
                    color: '#000000',
                    alpha: 0.04,
                };
                this.plugin.settings.colorRules.push(newRule);
                this.addRuleSetting(rulesContainer, newRule);
                void this.plugin.saveSettings();
            });
    }

    addRuleSetting(
        containerEl: HTMLElement,
        rule: ColorRule,
        index: number = this.plugin.settings.colorRules.length - 1,
    ): void {
        const ruleSettingDiv = containerEl.createEl('div', { cls: 'cnb-rule-settings-row' });

        // Type
        new Setting(ruleSettingDiv)
            .setClass('cnb-rule-setting-item')
            .addDropdown((dropdown: DropdownComponent) => {
                dropdown.addOption(RuleType.Folder, 'Folder');
                dropdown.addOption(RuleType.Frontmatter, 'Frontmatter');
                dropdown.setValue(rule.type);
                dropdown.onChange((value) => {
                    rule.type = value as RuleType;
                    void this.plugin.saveSettings();
                });
                dropdown.selectEl.classList.add('cnb-rule-type-dropdown');
            });

        // Value
        new Setting(ruleSettingDiv)
            .setClass('cnb-rule-setting-item')
            .addText((text) => {
                text.setPlaceholder('Enter rule value');
                text.setValue(rule.value);
                text.onChange((value) => {
                    rule.value = value;
                    void this.plugin.saveSettings();
                });
                text.inputEl.classList.add('cnb-rule-value-input');
            });

        // Color
        const colorSetting = new Setting(ruleSettingDiv)
            .setClass('cnb-rule-setting-item');

            const colorInput = new TextComponent(colorSetting.controlEl)
            .setPlaceholder('Enter color hex code')
            .setValue(rule.color);
        colorInput.inputEl.classList.add('cnb-rule-setting-item-text-input');

        const picker = new ColorComponent(colorSetting.controlEl)
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

        // Alpha
        new Setting(ruleSettingDiv)
            .setClass('cnb-rule-setting-item')
            .addText((text) => {
            text.setPlaceholder('Alpha (0.0 - 1.0)');
            text.setValue(rule.alpha?.toString() ?? '1.0');
            text.inputEl.type = 'number';
            text.inputEl.step = '0.001';
            text.inputEl.min = '0';
            text.inputEl.max = '1';
            text.onChange((value) => {
                const num = parseFloat(value);
                if (!isNaN(num) && num >= 0 && num <= 1) {
                rule.alpha = num;
                void this.plugin.saveSettings();
                }
            });
            text.inputEl.classList.add('cnb-rule-alpha-input');
            });

        // Up
        new ButtonComponent(ruleSettingDiv)
            .setButtonText('▲')
            .setTooltip("Move up")
            .setClass('cnb-rule-setting-item-up-button')
            .setDisabled(index == 0)
            .onClick(() => {
                if (index > 0) {
                    this.plugin.settings.colorRules.splice(index, 1);
                    this.plugin.settings.colorRules.splice(index - 1, 0, rule);
                    void this.plugin.saveSettings();
                    this.display();
                }
            });

        // Down
        new ButtonComponent(ruleSettingDiv)
            .setButtonText('▼')
            .setTooltip("Move down")
            .setClass('cnb-rule-setting-item-down-button')
            .setDisabled(index == this.plugin.settings.colorRules.length - 1)
            .onClick(() => {
                if (index < this.plugin.settings.colorRules.length - 1) {
                    this.plugin.settings.colorRules.splice(index, 1);
                    this.plugin.settings.colorRules.splice(index + 1, 0, rule);
                    void this.plugin.saveSettings();
                    this.display();
                }
            });

        // Remove
        new Setting(ruleSettingDiv)
            .setClass('cnb-rule-setting-item-remove')
            .addExtraButton((btn) => {
                btn.setIcon('cross')
                    .setTooltip('Remove')
                    .onClick(() => {
                        this.plugin.settings.colorRules = this.plugin.settings.colorRules.filter((r) => r.id !== rule.id);
                        void this.plugin.saveSettings();
                        ruleSettingDiv.remove();
                    });
            });
    }
}
