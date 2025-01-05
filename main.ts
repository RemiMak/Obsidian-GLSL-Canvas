import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
const GlslCanvas: any = require('glslCanvas');

interface MyPluginSettings {
	defaultShaderWidthPercentage: string;
	defaultShaderAspectRatio: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	defaultShaderWidthPercentage: '50',
	defaultShaderAspectRatio: '1'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor('glsl_render', (source, el, ctx) => {
			
			const glsl_canvas = el.createEl('canvas');
			const glsl_context = glsl_canvas.getContext('webgl');
			if (!glsl_context) {
				console.log('Error creating WebGL context');
				return
			}

			const error_message = this.checkShaderSyntax(glsl_context, source);
			
			// if there is a syntax error, display it to the user
			if (error_message) { 
				el.removeChild(glsl_canvas);
				this.addSyntaxErrorElements(el, error_message, source);
			}
			
			// if there is no syntax error, display the shader to the user
			else {
				glsl_canvas.style.width = this.settings.defaultShaderWidthPercentage + '%';
				glsl_canvas.style.aspectRatio = this.settings.defaultShaderAspectRatio;
				
				// user defined width and aspect ratio
				const {width, aspect_ratio} = this.getCanvasSizeParameters(source);
				if (width) {
					glsl_canvas.style.width = width;
				}

				if (aspect_ratio) {
					glsl_canvas.style.aspectRatio = aspect_ratio;
				}

				glsl_canvas.style.margin = '0 auto';
				glsl_canvas.style.display = 'block';
				glsl_canvas.style.height = 'auto';
				
				const glsl_sandbox = new GlslCanvas(glsl_canvas);
				const fragmentShader = source;
				glsl_sandbox.load(fragmentShader);
			}			
		});
	}

	checkShaderSyntax(gl_context: WebGLRenderingContext, shader_code: string) : string | null{
		const shader = gl_context.createShader(gl_context.FRAGMENT_SHADER);

		if (!shader) { return 'Error creating shader';}

		gl_context.shaderSource(shader, shader_code);
		gl_context.compileShader(shader);

		const was_succesfully_compiled = gl_context.getShaderParameter(
				shader, gl_context.COMPILE_STATUS
		);

		if (was_succesfully_compiled) {
			gl_context.deleteShader(shader);
			return null;
		} else {
			const error_message = gl_context.getShaderInfoLog(shader);
			gl_context.deleteShader(shader);
			return error_message;
		}
	}

	getCanvasSizeParameters(shader_code: string) : {width: string | null, aspect_ratio: string | null} {
		const lines = shader_code.split('\n');
		const width_line = lines.find(line => line.includes('glsl_canvas_width') && line.includes('//'));
		const aspectRatio_line = lines.find(line => line.includes('glsl_canvas_aspect_ratio') && line.includes('//'));

		const width = width_line ? (width_line.split('=')[1]) : null;
		const aspect_ratio = aspectRatio_line ? (aspectRatio_line.split('=')[1]) : null;

		return {width, aspect_ratio};
	}

	addSyntaxErrorElements(el: HTMLElement, error_message: string, source: string) {
		const lines = source.split('\n');
		const error_line = parseInt(error_message.split(':')[2]);
		const error_message_el = el.createEl('div');
		error_message_el.setText(error_message);
		error_message_el.style.color = 'red';
		error_message_el.style.fontWeight = 'bold';
		error_message_el.style.marginBottom = '10px';
		error_message_el.style.whiteSpace = 'pre-wrap';
		error_message_el.style.overflow = 'auto';
		error_message_el.style.width = '100%';
		error_message_el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
		error_message_el.style.padding = '10px';
		el.appendChild(error_message_el);

		const code_el = el.createEl('pre');
		code_el.style.whiteSpace = 'pre-wrap';
		code_el.style.overflow = 'auto';
		code_el.style.width = '100%';
		code_el.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
		code_el.style.padding = '10px';
		el.appendChild(code_el);
		
		for (let i = 0; i < lines.length; i++) {
			const line_el = code_el.createEl('div');
			line_el.style.font = '12px monospace';
			
			if (lines[i].length > 0) {
				line_el.setText(lines[i]);
			}

			else {
				line_el.setText(' ');
			}

			if (i === error_line - 1) {
				line_el.style.backgroundColor = 'rgb(255, 0, 0)';
			}
		}
	}

	refreshView(): void {
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView) {
			markdownView.previewMode.rerender(true);
		}
	}

	onunload() {
		
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
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
			.setDesc('The percentage of the screen width the shader will take up')
			.addText(text => text
				.setPlaceholder('50')
				.setValue(this.plugin.settings.defaultShaderWidthPercentage)
				.onChange(async (value) => {
					this.plugin.settings.defaultShaderWidthPercentage = value;
					this.plugin.refreshView();
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
					this.plugin.refreshView();
					await this.plugin.saveSettings();
				}))
	}
}
