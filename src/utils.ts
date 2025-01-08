import { MarkdownView } from 'obsidian';

export function checkShaderSyntax(gl_context: WebGLRenderingContext, shader_code: string) : string | null{
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


export function getCanvasSizeParameters(shader_code: string) : {width: string | null, aspect_ratio: string | null} {
    const lines = shader_code.split('\n');
    const width_line = lines.find(line => line.includes('glsl_canvas_width') && line.includes('//'));
    const aspectRatio_line = lines.find(line => line.includes('glsl_canvas_aspect_ratio') && line.includes('//'));

    const width = width_line ? (width_line.split('=')[1]) : null;
    const aspect_ratio = aspectRatio_line ? (aspectRatio_line.split('=')[1]) : null;

    return {width, aspect_ratio};
}


export function refreshView(): void {
    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (markdownView) {
        markdownView.previewMode.rerender(true);
    }
}


export function createErrorElement(error_message: string): HTMLElement {
    const error_message_el = createEl('div');
    error_message_el.style.color = 'red';
    error_message_el.style.fontWeight = 'bold';
    error_message_el.style.marginBottom = '10px';
    error_message_el.style.whiteSpace = 'pre-wrap';
    error_message_el.style.overflow = 'auto';
    error_message_el.style.width = '100%';
    error_message_el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    error_message_el.style.padding = '10px';
    error_message_el.innerText = error_message;
    return error_message_el;
}