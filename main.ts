import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
const GlslCanvas: any = require('glslCanvas');

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {

		this.registerMarkdownCodeBlockProcessor('glsl', (source, el, ctx) => {
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
				glsl_canvas.style.margin = '0 auto';
				glsl_canvas.style.display = 'block';
				glsl_canvas.style.width = '50%';
				glsl_canvas.style.height = 'auto';
				glsl_canvas.style.aspectRatio = '1/1';
				
				const glsl_sandbox = new GlslCanvas(glsl_canvas);
				const fragmentShader = source;
				glsl_sandbox.load(fragmentShader);
			}			
		});

		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a REMI!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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

	onunload() {
		
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
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

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a XD')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
