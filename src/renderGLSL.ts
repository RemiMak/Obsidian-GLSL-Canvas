import { checkShaderSyntax, createErrorElement } from './utils';
import { MarkdownPostProcessorContext, MarkdownRenderChild } from 'obsidian';
const GlslCanvas: any = require('glslCanvas');

export interface RenderParams {
    width_percentage: string;
    aspect_ratio: string;
    float_precision: string;
}

export function renderGLSL(
    source: string, 
    el: HTMLElement, 
    ctx: MarkdownPostProcessorContext,
    params: RenderParams,
) {
    const glsl_render_child = new MarkdownRenderChild(createEl('canvas'));
    const glsl_canvas = glsl_render_child.containerEl as HTMLCanvasElement;

    ctx.addChild(glsl_render_child);
    el.appendChild(glsl_canvas);
    
    const glsl_context = glsl_canvas.getContext('webgl');
    if (!glsl_context) {
        displayDeviceIncompatibilityMessage(el);
        return
    }

    glsl_render_child.onunload = () => { 
        glsl_context.getExtension('WEBGL_lose_context')?.loseContext(); 
    };

    // pre-pend float precision declaration to fragment shader
    const float_precision_declaration = 
        `#ifdef GL_ES\n` +
        `precision ${params.float_precision} float;\n` +
        `#endif\n\n`;

    source = float_precision_declaration + source;

    const error_message = checkShaderSyntax(glsl_context, source);
    
    if (error_message) { 
        displayErrorMessageToUser(el, error_message, source);
    }
    
    else {
        displayShaderToUser(glsl_canvas, source, params);
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
    el.addClass('glsl_code_block');
    el.appendChild(code_el);

    lines.forEach((line, i) => {
        const line_el = code_el.createEl('div');
        line_el.addClass('glsl_code_line');
        
        if (line.length > 0) {
            line_el.setText(line);
        } else {
            line_el.setText(' ');
        }

        if (i === error_line - 1) {
            line_el.addClass('glsl_error_line_highlight');
        }
    });
}


function displayShaderToUser(glsl_canvas: HTMLElement, source: string, params: RenderParams) {
    glsl_canvas.style.width = params.width_percentage;
    glsl_canvas.style.aspectRatio = params.aspect_ratio.replace(':', '/'); // CSS aspect ratio is width / height

    glsl_canvas.style.margin = '0 auto';
    glsl_canvas.style.display = 'block';
    glsl_canvas.style.height = 'auto';
    
    const glsl_sandbox = new GlslCanvas(glsl_canvas);
    const fragmentShader = source;

    glsl_sandbox.load(fragmentShader);
}