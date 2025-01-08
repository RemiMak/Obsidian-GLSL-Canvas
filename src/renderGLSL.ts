import { MarkdownPostProcessorContext } from 'obsidian';
import { checkShaderSyntax, createErrorElement, getCanvasSizeParameters } from './utils';
import { GLSLSettings } from './main';
const GlslCanvas: any = require('glslCanvas');

export default function renderGLSL(
    source: string, 
    el: HTMLElement, 
    ctx: MarkdownPostProcessorContext,
    settings: GLSLSettings
) {
    console.log(ctx.getSectionInfo(el)?.text);

    const glsl_canvas = el.createEl('canvas');
    const glsl_context = glsl_canvas.getContext('webgl');

    if (!glsl_context) {
        displayDeviceIncompatibilityMessage(el);
        return
    }

    const error_message = checkShaderSyntax(glsl_context, source);
    
    if (error_message) { 
        displayErrorMessageToUser(el, error_message, source);
    }
    
    else {
        displayShaderToUser(glsl_canvas, source, settings);
    }			
}


function displayDeviceIncompatibilityMessage(el: HTMLElement) {
    el.empty();
    const error_message_el = createErrorElement('Your device does not support WebGL');
    el.appendChild(error_message_el);
}


function displayErrorMessageToUser(el: HTMLElement, error_message: string, source: string) {
    el.empty();
    const error_message_el = createErrorElement(error_message);
    el.appendChild(error_message_el);

    const lines = source.split('\n');
    const error_line = parseInt(error_message.split(':')[2]);
    const code_el = el.createEl('pre');
    code_el.style.whiteSpace = 'pre-wrap';
    code_el.style.overflow = 'auto';
    code_el.style.width = '100%';
    code_el.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    code_el.style.padding = '10px';
    el.appendChild(code_el);

    lines.forEach((line, i) => {
        const line_el = code_el.createEl('div');
        line_el.style.font = '12px monospace';
        
        if (line.length > 0) {
            line_el.setText(line);
        } else {
            line_el.setText(' ');
        }

        if (i === error_line - 1) {
            line_el.style.backgroundColor = 'rgb(255, 0, 0)';
        }
    });
}


function displayShaderToUser(glsl_canvas: HTMLElement, source: string, settings: GLSLSettings) {
    glsl_canvas.style.width = settings.defaultShaderWidthPercentage + '%';
    glsl_canvas.style.aspectRatio = settings.defaultShaderAspectRatio;
    
    // user defined width and aspect ratio
    const {width, aspect_ratio} = getCanvasSizeParameters(source);
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