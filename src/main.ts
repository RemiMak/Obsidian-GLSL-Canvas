import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import renderGLSL from './renderGLSL';
import { refreshView } from './utils';

export default class MyPlugin extends Plugin {
	settings: GLSLSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new GLSLSettingsTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor('glsl_render', (source, el, ctx) => {
			renderGLSL(source, el, ctx, this.settings);
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

export interface GLSLSettings {
	defaultShaderWidthPercentage: string;
	defaultShaderAspectRatio: string;
}

const DEFAULT_SETTINGS: GLSLSettings = {
	defaultShaderWidthPercentage: '50',
	defaultShaderAspectRatio: '1'
}

class GLSLSettingsTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('div', {text: 'Settings for GLSL Plugin, reload the page to see changes'});

		new Setting(containerEl)
			.setName('Default Shader Width Percentage')
			.setDesc('The percentage of the page width the shader will take up')
			.addText(text => text
				.setPlaceholder('50')
				.setValue(this.plugin.settings.defaultShaderWidthPercentage)
				.onChange(async (value) => {
					this.plugin.settings.defaultShaderWidthPercentage = value;
					refreshView();
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('Default Shader Aspect Ratio')
			.setDesc('The aspect ratio of the shader')
			.addText(text => text
				.setPlaceholder('1')
				.setValue(this.plugin.settings.defaultShaderAspectRatio)
				.onChange(async (value) => {
					this.plugin.settings.defaultShaderAspectRatio = value;
					refreshView();
					await this.plugin.saveSettings();
				}))
	}
}
