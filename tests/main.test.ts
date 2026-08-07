
/**
 * @jest-environment jsdom
 */
import { describe, expect, it } from '@jest/globals';
import ColorfulNoteBackgroundPlugin, { checkPath, hexToRgbA } from '../src/main';
import { RuleType, SettingsTab } from '../src/settingsTab';


jest.mock('obsidian', () => {
    type ClickHandler = () => void;

    const decorateElement = (element: HTMLElement): HTMLElement => {
        const obsidianElement = element as any;

        obsidianElement.empty = () => element.replaceChildren();
        obsidianElement.addClass = (className: string) => element.classList.add(className);
        obsidianElement.createEl = (tagName: string, options: { text?: string; cls?: string } = {}) => {
            const child = decorateElement(document.createElement(tagName));
            if (options.text) child.textContent = options.text;
            if (options.cls) child.className = options.cls;
            element.appendChild(child);
            return child;
        };

        return obsidianElement;
    };

    class MockPlugin {
        app: any;
        settingTabs: any[] = [];
        registeredEvents: any[] = [];
        constructor(app: any) {
            this.app = app;
        }
        addSettingTab(tab: any): void { this.settingTabs.push(tab); }
        registerEvent(event: any): void { this.registeredEvents.push(event); }
        async loadData(): Promise<unknown> { return null; }
        async saveData(_data: unknown): Promise<void> {}
    }

    class MockMarkdownView {
        file: any;
        containerEl: HTMLElement;

        constructor(file: any = null, containerEl: HTMLElement = document.createElement('div')) {
            this.file = file;
            this.containerEl = containerEl;
        }
    }

    class MockButtonComponent {
        static instances: MockButtonComponent[] = [];
        buttonText?: string;
        icon?: string;
        disabled?: boolean;
        onClickCallback?: ClickHandler;

        constructor(_containerEl: HTMLElement) {
            MockButtonComponent.instances.push(this);
        }

        setButtonText(buttonText: string): this { this.buttonText = buttonText; return this; }
        setCta(): this { return this; }
        setTooltip(_tooltip: string): this { return this; }
        setIcon(icon: string): this { this.icon = icon; return this; }
        setDisabled(disabled: boolean): this { this.disabled = disabled; return this; }
        onClick(callback: ClickHandler): this { this.onClickCallback = callback; return this; }
    }

    class MockSetting {
        constructor(_containerEl: HTMLElement) {}

        addButton(callback: (button: MockButtonComponent) => void): this {
            callback(new MockButtonComponent(document.createElement('div')));
            return this;
        }
    }

    class MockTextComponent {
        static instances: MockTextComponent[] = [];
        inputEl = document.createElement('input');
        onChangeCallback?: (value: string) => void;

        constructor(_containerEl: HTMLElement) {
            MockTextComponent.instances.push(this);
            const input = this.inputEl as any;
            input.addClass = (className: string) => this.inputEl.classList.add(className);
            input.toggleClass = (className: string, force: boolean) => this.inputEl.classList.toggle(className, force);
        }

        setPlaceholder(_placeholder: string): this { return this; }
        setValue(value: string): this { this.inputEl.value = value; return this; }
        onChange(callback: (value: string) => void): this { this.onChangeCallback = callback; return this; }
    }

    class MockDropdownComponent {
        static instances: MockDropdownComponent[] = [];
        onChangeCallback?: (value: string) => void;

        constructor(_containerEl: HTMLElement) { MockDropdownComponent.instances.push(this); }

        addOption(_value: string, _display: string): this { return this; }
        setValue(_value: string): this { return this; }
        onChange(callback: (value: string) => void): this { this.onChangeCallback = callback; return this; }
    }

    class MockColorComponent {
        static instances: MockColorComponent[] = [];
        onChangeCallback?: (value: string) => void;

        constructor(_containerEl: HTMLElement) { MockColorComponent.instances.push(this); }

        setValue(_value: string): this { return this; }
        onChange(callback: (value: string) => void): this { this.onChangeCallback = callback; return this; }
    }

    return {
        Plugin: MockPlugin,
        PluginSettingTab: class {
            containerEl: HTMLElement;

            constructor(_app: any, _plugin: any) {
                this.containerEl = decorateElement(document.createElement('div'));
            }
        },
        Setting: MockSetting,
        TextComponent: MockTextComponent,
        ButtonComponent: MockButtonComponent,
        DropdownComponent: MockDropdownComponent,
        ColorComponent: MockColorComponent,
        MarkdownView: MockMarkdownView,
        WorkspaceLeaf: class {},
        App: class {},
    };
});


describe('utility functions', () => {
    it('ensure checkPath matches full folders', () => {
        expect(checkPath("Other/Two Rules.md", "Other")).toBe(true);
    });
    it('should not match filenames', () => {
        expect(checkPath("Obsidian/readme.md", "Obsidian")).toBe(true);
        // Issue #4 - https://github.com/rusi/obsidian-colorful-note-borders/issues/4
        expect(checkPath("Index/300-Obsidian-index.md", "Obsidian")).toBe(false);
    });
    it('should match Windows style paths', () => {
        expect(checkPath("Obsidian\\readme.md", "Obsidian")).toBe(true);
    });
    it('should match paths with spaces', () => {
        expect(checkPath("Inbox/Test Note/test note with spaces.md", "Test Note")).toBe(true);
    });

    it('converts six-digit hex colors to rgba', () => {
        expect(hexToRgbA('#1a2b3c', 0.04)).toBe('rgba(26,43,60,0.04)');
        expect(hexToRgbA('1a2b3c', 1)).toBe('rgba(26,43,60,1)');
    });

    it('converts three-digit shorthand hex colors to rgba', () => {
        expect(hexToRgbA('#a3f', 0.5)).toBe('rgba(170,51,255,0.5)');
        expect(hexToRgbA('a3f', 0.5)).toBe('rgba(170,51,255,0.5)');
    });

    it('uses a transparent black fallback for malformed hex colors', () => {
        expect(hexToRgbA('#xyz', 0.04)).toBe('rgba(0,0,0,0)');
        expect(hexToRgbA('#1234', 0.04)).toBe('rgba(0,0,0,0)');
    });
});

describe('applyRule', () => {
    const file = { path: 'Notes/example.md' } as any;
    const frontmatterRule = (value: string) => ({
        id: 'frontmatter-rule',
        value,
        type: RuleType.Frontmatter,
        color: '#ffffff',
    });

    it('matches frontmatter values case-insensitively after trimming whitespace', () => {
        const app = {
            metadataCache: {
                getFileCache: jest.fn().mockReturnValue({
                    frontmatter: { status: '  Public  ' },
                }),
            },
        };
        const plugin = new ColorfulNoteBackgroundPlugin(app as any, {} as any);
        const contentView = document.createElement('div');

        expect(plugin.applyRule(file, frontmatterRule('status: public'), contentView)).toBe(true);
        expect(contentView.classList.contains('cnb-highlighted')).toBe(true);
    });

    it('does not match malformed frontmatter rules without a value', () => {
        const app = {
            metadataCache: {
                getFileCache: jest.fn().mockReturnValue({
                    frontmatter: { status: 'public' },
                }),
            },
        };
        const plugin = new ColorfulNoteBackgroundPlugin(app as any, {} as any);
        const contentView = document.createElement('div');

        expect(plugin.applyRule(file, frontmatterRule('status'), contentView)).toBe(false);
        expect(contentView.classList.contains('cnb-highlighted')).toBe(false);
    });

    it('does not apply folder rules that are absent from the file path', () => {
        const plugin = new ColorfulNoteBackgroundPlugin({ metadataCache: {} } as any, {} as any);
        const contentView = document.createElement('div');

        expect(plugin.applyRule(file, {
            id: 'folder-rule', value: 'Archive', type: RuleType.Folder, color: '#ffffff',
        }, contentView)).toBe(false);
        expect(contentView.classList.contains('cnb-highlighted')).toBe(false);
    });
});

describe('plugin lifecycle and rule application', () => {
    const createContentView = () => {
        const contentView = document.createElement('div');
        contentView.className = 'view-content';
        const container = document.createElement('div');
        container.appendChild(contentView);
        return { container, contentView };
    };

    it('loads settings, registers events, and adds its settings tab', async () => {
        const events: Record<string, (file?: any) => void> = {};
        const app = {
            workspace: {
                on: jest.fn((name, callback) => {
                    events[name] = callback;
                    return name;
                }),
                onLayoutReady: jest.fn((callback: () => void) => callback()),
                getLeavesOfType: jest.fn().mockReturnValue([]),
            },
            metadataCache: { on: jest.fn((name, callback) => {
                events[name] = callback;
                return name;
            }) },
            vault: { on: jest.fn((name, callback) => {
                events[name] = callback;
                return name;
            }) },
        };
        const plugin = new ColorfulNoteBackgroundPlugin(app as any, {} as any);
        plugin.loadData = jest.fn().mockResolvedValue({ colorRules: [] });

        await plugin.onload();

        expect(plugin.settings.colorRules).toEqual([]);
        expect((plugin as any).settingTabs).toHaveLength(1);
        expect((plugin as any).registeredEvents).toEqual(['active-leaf-change', 'changed', 'rename']);
        expect(events['active-leaf-change']).toBeDefined();
        expect(events.changed).toBeDefined();
        expect(events.rename).toBeDefined();
        plugin.applyRules = jest.fn();
        events['active-leaf-change']();
        events.changed({ path: 'changed.md' });
        events.rename({ path: 'renamed.md' });
        expect(plugin.applyRules).toHaveBeenNthCalledWith(1);
        expect(plugin.applyRules).toHaveBeenNthCalledWith(2, { path: 'changed.md' });
        expect(plugin.applyRules).toHaveBeenNthCalledWith(3);
    });

    it('applies only the first matching rule to the requested markdown file', () => {
        const { MarkdownView } = jest.requireMock('obsidian');
        const first = createContentView();
        const second = createContentView();
        const firstFile = { path: 'Projects/first.md' } as any;
        const secondFile = { path: 'Projects/second.md' } as any;
        const app = {
            workspace: {
                getLeavesOfType: jest.fn().mockReturnValue([
                    { view: new MarkdownView(firstFile, first.container) },
                    { view: new MarkdownView(secondFile, second.container) },
                    { view: {} },
                ]),
            },
            metadataCache: { getFileCache: jest.fn() },
        };
        const plugin = new ColorfulNoteBackgroundPlugin(app as any, {} as any);
        plugin.settings = {
            colorRules: [
                { id: 'project', value: 'Projects', type: RuleType.Folder, color: '#112233', alpha: 0.2 },
                { id: 'later', value: 'Projects', type: RuleType.Folder, color: '#ffffff', alpha: 0.5 },
            ],
        };
        second.contentView.classList.add('cnb-highlighted');

        plugin.applyRules(firstFile);

        expect(first.contentView.classList.contains('cnb-highlighted')).toBe(true);
        expect(first.contentView.style.getPropertyValue('--cnb-highlight-color')).toBe('rgba(17,34,51,0.2)');
        expect(second.contentView.classList.contains('cnb-highlighted')).toBe(true);
    });

    it('clears markdown highlights when unloaded and uses default alpha when omitted', () => {
        const { MarkdownView } = jest.requireMock('obsidian');
        const highlighted = createContentView();
        const nonMarkdown = createContentView();
        highlighted.contentView.classList.add('cnb-highlighted');
        highlighted.contentView.style.setProperty('--cnb-highlight-color', 'rgba(1,2,3,0.4)');
        const app = {
            workspace: {
                getLeavesOfType: jest.fn().mockReturnValue([
                    { view: new MarkdownView({ path: 'note.md' }, highlighted.container) },
                    { view: { containerEl: nonMarkdown.container } },
                ]),
            },
        };
        const plugin = new ColorfulNoteBackgroundPlugin(app as any, {} as any);

        plugin.highlightNote(nonMarkdown.contentView, {
            id: 'default-alpha', value: 'Notes', type: RuleType.Folder, color: '#010203',
        });
        plugin.onunload();

        expect(highlighted.contentView.classList.contains('cnb-highlighted')).toBe(false);
        expect(highlighted.contentView.style.getPropertyValue('--cnb-highlight-color')).toBe('');
        expect(nonMarkdown.contentView.style.getPropertyValue('--cnb-highlight-color')).toBe('rgba(1,2,3,1)');
    });

    it('saves settings and reapplies rules only when an active file exists', async () => {
        const activeFile = { path: 'note.md' } as any;
        const app = { workspace: { getActiveFile: jest.fn().mockReturnValue(activeFile) } };
        const plugin = new ColorfulNoteBackgroundPlugin(app as any, {} as any);
        plugin.settings = { colorRules: [] };
        plugin.saveData = jest.fn().mockResolvedValue(undefined);
        plugin.onFileRename = jest.fn();

        await plugin.saveSettings();
        app.workspace.getActiveFile.mockReturnValue(null);
        await plugin.saveSettings();

        expect(plugin.saveData).toHaveBeenCalledWith(plugin.settings);
        expect(plugin.onFileRename).toHaveBeenCalledTimes(1);
        expect(plugin.onFileRename).toHaveBeenCalledWith(activeFile);
    });
});

describe('SettingsTab rule actions', () => {
    const rules = [
        { id: 'first', value: 'First', type: RuleType.Folder, color: '#111111', alpha: 0.04 },
        { id: 'second', value: 'Second', type: RuleType.Folder, color: '#222222', alpha: 0.04 },
        { id: 'third', value: 'Third', type: RuleType.Folder, color: '#333333', alpha: 0.04 },
    ];

    const createTab = () => {
        const plugin = {
            settings: { colorRules: rules.map((rule) => ({ ...rule })) },
            saveSettings: jest.fn(),
        };
        const tab = new SettingsTab({} as any, plugin as any);
        tab.display();
        return { plugin, tab };
    };

    const buttons = (): any[] => (jest.requireMock('obsidian').ButtonComponent as any).instances;
    const textInputs = (): any[] => (jest.requireMock('obsidian').TextComponent as any).instances;
    const dropdowns = (): any[] => (jest.requireMock('obsidian').DropdownComponent as any).instances;
    const colorPickers = (): any[] => (jest.requireMock('obsidian').ColorComponent as any).instances;

    beforeEach(() => {
        buttons().length = 0;
        textInputs().length = 0;
        dropdowns().length = 0;
        colorPickers().length = 0;
    });

    it('moves a middle rule up without changing the other order', () => {
        const { plugin } = createTab();
        const moveUp = buttons().filter((button) => button.icon === 'chevron-up')[1];

        moveUp.onClickCallback();

        expect(plugin.settings.colorRules.map((rule) => rule.id)).toEqual(['second', 'first', 'third']);
        expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
    });

    it('moves a middle rule down without changing the other order', () => {
        const { plugin } = createTab();
        const moveDown = buttons().filter((button) => button.icon === 'chevron-down')[1];

        moveDown.onClickCallback();

        expect(plugin.settings.colorRules.map((rule) => rule.id)).toEqual(['first', 'third', 'second']);
        expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
    });

    it('disables move up for the first rule', () => {
        createTab();

        expect(buttons().filter((button) => button.icon === 'chevron-up')[0].disabled).toBe(true);
    });

    it('deletes the matching rule', () => {
        const { plugin } = createTab();
        const deleteButton = buttons().filter((button) => button.icon === 'x')[1];

        deleteButton.onClickCallback();

        expect(plugin.settings.colorRules.map((rule) => rule.id)).toEqual(['first', 'third']);
        expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
    });

    it('adds a default folder rule', () => {
        const { plugin } = createTab();
        const addButton = buttons().find((button) => button.buttonText === 'Add rule');

        addButton.onClickCallback();

        expect(plugin.settings.colorRules).toHaveLength(4);
        expect(plugin.settings.colorRules[3]).toMatchObject({
            value: '',
            type: RuleType.Folder,
            color: '#3b82f6',
            alpha: 0.04,
        });
        expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
    });

    it('updates type and validates a frontmatter value', () => {
        const { plugin } = createTab();
        const valueInput = textInputs()[0];

        dropdowns()[0].onChangeCallback(RuleType.Frontmatter);
        valueInput.onChangeCallback('status: public');

        expect(plugin.settings.colorRules[0].type).toBe(RuleType.Frontmatter);
        expect(plugin.settings.colorRules[0].value).toBe('status: public');
        expect(valueInput.inputEl.classList.contains('cnb-invalid-input')).toBe(false);
        expect(valueInput.inputEl.hasAttribute('aria-invalid')).toBe(false);
        expect(plugin.saveSettings).toHaveBeenCalledTimes(2);
    });

    it('updates a valid text color and rejects an invalid one', () => {
        const { plugin } = createTab();
        const colorInput = textInputs()[1];

        colorInput.onChangeCallback('#abc');
        colorInput.onChangeCallback('blue');

        expect(plugin.settings.colorRules[0].color).toBe('#abc');
        expect(colorPickers()[0].onChangeCallback).toBeDefined();
        expect(plugin.saveSettings).toHaveBeenCalledTimes(1);
    });

    it('synchronizes color picker changes and accepts only alpha values from zero through one', () => {
        const { plugin } = createTab();
        const colorInput = textInputs()[1];
        const alphaInput = textInputs()[2];

        colorPickers()[0].onChangeCallback('#abcdef');
        alphaInput.onChangeCallback('0.5');
        alphaInput.onChangeCallback('1.1');
        alphaInput.onChangeCallback('not-a-number');

        expect(plugin.settings.colorRules[0]).toMatchObject({ color: '#abcdef', alpha: 0.5 });
        expect(colorInput.inputEl.value).toBe('#abcdef');
        expect(plugin.saveSettings).toHaveBeenCalledTimes(2);
    });
});
