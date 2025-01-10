import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { renderGLSL } from './renderGLSL';
import { parseRenderParams, getParamsLine } from './utils';

export default class GLSLCanvasPlugin extends Plugin {
	settings: GLSLSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new GLSLSettingsTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor('glsl_render', (source, el, ctx) => {
			const params_line = getParamsLine(this.app.workspace, el, ctx);
			if (!params_line) { return; }

			const params = parseRenderParams(this.settings, params_line);
			renderGLSL(source, el, ctx, params);
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
	defaultFloatPrecision: string;
}

const DEFAULT_SETTINGS: GLSLSettings = {
	defaultShaderWidthPercentage: '50',
	defaultShaderAspectRatio: '1:1',
	defaultFloatPrecision: 'mediump'
}

class GLSLSettingsTab extends PluginSettingTab {
	plugin: GLSLCanvasPlugin;

	constructor(app: App, plugin: GLSLCanvasPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Default shader width Percentage')
			.setDesc('The percentage of the page width the shader will take up, requires a page reload to take effect')
			.addText(text => text
				.setPlaceholder('50')
				.setValue(this.plugin.settings.defaultShaderWidthPercentage)
				.onChange(async (value) => {
					this.plugin.settings.defaultShaderWidthPercentage = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('Default shader aspect ratio')
			.setDesc('The aspect ratio of the shader, requires a page reload to take effect')
			.addText(text => text
				.setPlaceholder('1:1')
				.setValue(this.plugin.settings.defaultShaderAspectRatio)
				.onChange(async (value) => {
					this.plugin.settings.defaultShaderAspectRatio = value;
					await this.plugin.saveSettings();
				}))
		
		new Setting(containerEl)
			.setName('Default float precision')
			.setDesc('The float precision of the shader, requires a page reload to take effect')
			.addDropdown(dropdown => dropdown
				.addOptions({
					'lowp': 'low',
					'mediump': 'medium (recommended)',
					'highp': 'high'
				})
				.setValue(this.plugin.settings.defaultFloatPrecision)
				.onChange(async (value) => {
					this.plugin.settings.defaultFloatPrecision = value;
					await this.plugin.saveSettings();
				}));
	}
}
