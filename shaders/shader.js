class Shader {
    static #shaders;

    static init() {
        Shader.#shaders = new Map();
        Shader.#shaders.set("default", [new Default(), gl.TRIANGLES]);
        Shader.#shaders.set("unlitTextured", [new UnlitTextured(), gl.TRIANGLES]);
        Shader.#shaders.set("skybox", [new Skybox(), gl.TRIANGLES]);
        Shader.#shaders.set("wireframe", [new Wireframe(), gl.LINES]);
    }

    static getShader(name) {
        return Shader.#shaders.get(name);
    }

    static compileShader(source, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            throw new Error("Error: Shaders failed to compile.");
        }

        return shader;
    }
}