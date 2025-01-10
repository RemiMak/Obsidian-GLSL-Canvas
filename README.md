# Obsidian GLSL Canvas

This is a port of [GLSL Canvas](https://github.com/patriciogonzalezvivo/glslCanvas) to obsidian, allowing you to write and render GLSL fragment shaders directly in your notes!

The uniforms you can use in your shaders are as follows:
- u_time: a float representing elapsed time in seconds.
- u_resolution: a vec2 representing the dimensions of the viewport.

For all variables and functions available to you, please refer to the [GLSL documentation](https://registry.khronos.org/OpenGL-Refpages/gl4/index.php) (or the [book of shaders glossary](https://thebookofshaders.com/glossary/))

<p align="center" style="margin: 0;">
  <img src="https://github.com/user-attachments/assets/82440f76-c4bf-4ea8-a376-3ef297a96f9b" style="width: 100%; height: auto;" />
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
You can use the [BRAT plugin](https://tfthacker.com/brat-quick-guide) to install this plugin. Please note that this plugin is still in development, so please save your work before using it (and feel more than free to open an issue if you encounter any problems 😁). 

## Contributing

If you have any suggestions or issues, please open an issue or a pull request. If you're new to obsidian plugins, [see the obsidian plugin documentation](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin) for more information on how to contribute.

## Support

If you've found this plugin useful and/or want to support its development, consider buying me a coffee!

<a href='https://ko-fi.com/E1E0122B65' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi5.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
