import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface HideSidebarsWhenNarrowSettings {
}

const DEFAULT_SETTINGS: HideSidebarsWhenNarrowSettings = {
}

export default class HideSidebarsWhenNarrowPlugin extends Plugin {
  settings: HideSidebarsWhenNarrowSettings;

  async onload() {
    console.log('loading HideSideBarsWhenNarrowPlugin');
    this.app.workspace.onLayoutReady(() => {
      this.loadSettings().then(() => {
        // this.addSettingTab(new SampleSettingTab(this.app, this));

        this.toggleSidebars();

        this.registerDomEvent(window, 'resize', (_) => {
          window.setTimeout(this.toggleSidebars, 100)
        });
      });
    })
  }

  onunload() {
    console.log('unloading plugin');
  }

  toggleSidebars() {
    const width = window.outerWidth;
    // TODO: make these widths configurable
    if (width < 1400 && width >= 1001) {
      // collapse left only
      !this.app.workspace.leftSplit.collapsed && this.app.workspace.leftSplit.collapse();
      this.app.workspace.rightSplit.collapsed && this.app.workspace.rightSplit.expand();
    } else if (width < 1000) {
      // collapse both
      !this.app.workspace.rightSplit.collapsed && this.app.workspace.rightSplit.collapse();
      !this.app.workspace.leftSplit.collapsed && this.app.workspace.leftSplit.collapse();
    } else {
      // expand all
      this.app.workspace.leftSplit.collapsed && this.app.workspace.leftSplit.expand();
      this.app.workspace.rightSplit.collapsed && this.app.workspace.rightSplit.expand();
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
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

    containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

    new Setting(containerEl)
      .setName('Setting #1')
      .setDesc('It\'s a secret')
      .addText(text => text
        .setPlaceholder('Enter your secret')
        .setValue('')
        .onChange(async (value) => {
          console.log('Secret: ' + value);
          // this.plugin.settings.mySetting = value;
          await this.plugin.saveSettings();
        }));
  }
}
