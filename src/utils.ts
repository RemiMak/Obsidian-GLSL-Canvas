import { MarkdownPostProcessorContext, MarkdownView, Workspace } from 'obsidian';
import { RenderParams } from './renderGLSL';
import { GLSLSettings } from './main';

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


export function getParamsLine(workspace: Workspace, el: HTMLElement, ctx: MarkdownPostProcessorContext): string | undefined {
    const editor = workspace.getActiveViewOfType(MarkdownView)?.editor;
    if (!editor) { return; }

    const params_line_number: number | undefined = ctx.getSectionInfo(el)?.lineStart;
    if (params_line_number === undefined) { return; }

    const params_line = editor.getLine(params_line_number);
    return params_line;
}


export function parseRenderParams(settings: GLSLSettings, raw_params_line: string): RenderParams {
    let width_percentage = settings.defaultShaderWidthPercentage + "%";
    let aspect_ratio = settings.defaultShaderAspectRatio;
    let float_precision = settings.defaultFloatPrecision; 

    const float_precisions = ["low", "medium", "high"];
    const raw_params_array = raw_params_line.split(' ').filter(param => param !== '').slice(1);

    raw_params_array.forEach(param => {
        // width percentage
        if (param.includes("%")) { 
            let percentage = parseInt(param.replace("%", ""));
            
            if (percentage) {
                percentage = Math.clamp(percentage, 0, 100);
                width_percentage = percentage.toString() + "%";
            }
        }
        
        // aspect ratio
        else if (param.includes(":")) { 
            let values = param.split(":");
            let num_values = values.map(value => parseInt(value));
            let valid_values = num_values.filter(value => Boolean(value) && value > 0);
            if (valid_values.length == 2) {
                values = valid_values.map(value => value.toString());
                aspect_ratio = values.join(":");
            }
        }

        // float precision
        else if (float_precisions.includes(param.toLocaleLowerCase())) {
            float_precision = param.toLocaleLowerCase() + "p";
        }
    });

    return {width_percentage, aspect_ratio, float_precision} as RenderParams;
}


export function createErrorElement(error_message: string): HTMLElement {
    const error_message_el = createEl('div');
    
    // use .glsl_error class to style the error message
    error_message_el.addClass('glsl_error_message');

    error_message_el.innerText = error_message;
    return error_message_el;
}