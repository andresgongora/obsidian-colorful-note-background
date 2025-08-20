# Colorful Note Background Plugin for Obsidian

The Colorful Note Background plugin for Obsidian helps you visually distinguish your notes based on custom rules. By applying colored backgrounds to your notes, you can easily recognize and categorize them based on their folder location or specific frontmatter metadata.

This plugin supports two types of rules:

1. **Folder-based rules**
2. **Frontmatter metadata-based rules**

## Preview

![Preview of Colorful Note Background Plugin](assets/preview.gif)

- Default dark theme.
- _Explorer Colors_ plugin is used to show the folder colors in the explorer.
- Settings are shown below.

![Settings Preview](assets/settings.png)

## Installation

To install the Colorful Note Background plugin, follow these steps:

1. Open your Obsidian vault.
2. Go to the Settings page (click the gear icon in the left sidebar).
3. Navigate to Third-party plugins and make sure the "Safe mode" toggle is off.
4. Click "Browse" and search for "Colorful Note Background".
5. Click "Install" on the Colorful Note Background plugin.
6. After the installation is complete, click "Enable" to activate the plugin.

## Manual Installation using BRAT

BRAT (Beta Reviewers Auto-update Tester) is a plugin for Obsidian that allows you to install and manage plugins that are not yet approved or included in the Obsidian Plugin Directory. You can use BRAT to install the Colorful Note Background plugin manually.

## Usage

To configure the Colorful Note Background plugin, follow these steps:

1. Go to the Settings page in your Obsidian vault.
2. Navigate to Plugin Options and click on "Colorful Note Background".
3. In the settings page, you can add or remove rules by clicking the "Add new rule" button or the "Remove" button next to each rule.
4. Configure each rule by providing:
    - A name for the rule.
    - A value to match (e.g., folder name or frontmatter metadata value).
    - The rule type (either "Path" for folder location or "Frontmatter" for frontmatter metadata).
    - A color for the background (use the color picker or enter a color hex code).
    - The alpha value for the background color (0-1, where 0 is fully transparent and 1 is fully opaque). This allows a smoother transition between the chosen color and the current theme. A value of 0.04 is recommended for a subtle effect.
5. Save your settings (just close the settings page, as changes are saved automatically).

## History

This is a fork of the original Colorful Note Borders plugin, which has been modified to support background colors instead of borders. The original plugin can be found at:
<https://github.com/rusi/obsidian-colorful-note-borders>.

## Support

If you encounter any issues or have feature requests, please create an issue on the plugin's GitHub repository.

## License

This plugin is licensed under the MIT License. For more information, see the LICENSE file in the plugin's GitHub repository.

