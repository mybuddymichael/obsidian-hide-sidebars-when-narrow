import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface HideSidebarsWhenNarrowSettings {
  leftMinWidth: number;
  rightMinWidth: number;
}

const DEFAULT_SETTINGS: HideSidebarsWhenNarrowSettings = {
  leftMinWidth: 1400,
  rightMinWidth: 1100,
};

export default class HideSidebarsWhenNarrowPlugin extends Plugin {
  settings: HideSidebarsWhenNarrowSettings;

  async onload() {
    console.log('loading HideSideBarsWhenNarrowPlugin');
    this.app.workspace.onLayoutReady(() => {
      this.loadSettings().then(() => {
        this.addSettingTab(new SettingsTab(this.app, this));

        this.toggleSidebars();

        this.registerDomEvent(window, 'resize', (_) => {
          window.setTimeout(this.toggleSidebars.bind(this), 80);
        });
      });
    });
  }

  toggleSidebars() {
    const width = window.outerWidth;
    if (width < this.settings.leftMinWidth) {
      !this.app.workspace.leftSplit.collapsed &&
        this.app.workspace.leftSplit.collapse();
    } else {
      this.app.workspace.leftSplit.collapsed &&
        this.app.workspace.leftSplit.expand();
    }
    if (width < this.settings.rightMinWidth) {
      !this.app.workspace.rightSplit.collapsed &&
        this.app.workspace.rightSplit.collapse();
    } else {
      this.app.workspace.rightSplit.collapsed &&
        this.app.workspace.rightSplit.expand();
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.toggleSidebars();
  }
}

class SettingsTab extends PluginSettingTab {
  plugin: HideSidebarsWhenNarrowPlugin;

  constructor(app: App, plugin: HideSidebarsWhenNarrowPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h3', { text: 'Hide Sidebars When Narrow' });

    new Setting(containerEl)
      .setName('Hide the left sidebar when the window is this narrow')
      .setDesc(
        'Increase this to hide the left sidebar sooner; decrease it to delay hiding'
      )
      .addText((text) =>
        text
          .setPlaceholder(`Default: ${DEFAULT_SETTINGS.leftMinWidth}`)
          .setValue(this.plugin.settings.leftMinWidth.toString())
          .onChange(async (value) => {
            const num = parseInt(value);
            if (num) {
              this.plugin.settings.leftMinWidth = num;
            } else {
              this.plugin.settings.leftMinWidth = DEFAULT_SETTINGS.leftMinWidth;
            }
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Hide the right sidebar when the window is this narrow')
      .setDesc(
        'Increase this to hide the right sidebar sooner; decrease it to delay hiding'
      )
      .addText((text) =>
        text
          .setPlaceholder(`Default: ${DEFAULT_SETTINGS.rightMinWidth}`)
          .setValue(this.plugin.settings.rightMinWidth.toString())
          .onChange(async (value) => {
            const num = parseInt(value);
            if (num) {
              this.plugin.settings.rightMinWidth = num;
            } else {
              this.plugin.settings.rightMinWidth =
                DEFAULT_SETTINGS.rightMinWidth;
            }
            await this.plugin.saveSettings();
          })
      );
  }
}
