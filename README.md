# Obsidian GLSL Canvas

This is a port of [GLSL Canvas](https://github.com/patriciogonzalezvivo/glslCanvas) to obsidian, allowing you to write and render GLSL fragment shaders directly in your notes!

The uniforms you can use in your shaders are as follows:
- u_time: a float representing elapsed time in seconds.
- u_resolution: a vec2 representing the dimensions of the viewport.

For all variables and functions available to you, please refer to the [GLSL documentation](https://registry.khronos.org/OpenGL-Refpages/gl4/index.php) (or the [book of shaders glossary](https://thebookofshaders.com/glossary/))

Please note that this plugin is still in development and might cause unexpected behaviors/crashes, so please save your work before using it (and feel more than free to open an issue if you encounter any problems 😁). 

<p align="center" style="margin: 0;">
  <img src="https://github.com/user-attachments/assets/07058edc-3f4d-4468-8e83-0d44b924b8b6" style="width: 100%; height: auto;" />
</p>

## Quickstart

Make a codeblock with `glsl_render` as the language and paste this simple shader into it:

```glsl
uniform vec2 u_resolution;
uniform float u_time;

void main() {
	vec2 st = gl_FragCoord.xy / u_resolution;
	gl_FragColor = vec4(st.x, st.y, 0.0,1.0);
}
```

By default you will get a square that takes up 50% of your note's width. You can change this in two ways:
1. By changing the default width percentage and aspect ratio in the plugin settings
2. Adding your desired width percentage and aspect ratio right after declaring the codeblock's language, like so: `glsl_render 100% 16:3`

For more advanced use-cases, we can additionally set the float precision the same way; either by re-defining the default precision in the plugin's settings or right after declaring the codeblock's language: `glsl_render 100% 16:3 high`

## Installation
You can use the obsidian BRAT plugin to install this plugin.

## Contributing

If you have any suggestions or issues, please open an issue or a pull request. If you're new to obsidian plugins, [see the obsidian plugin documentation](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin) for more information on how to contribute.
