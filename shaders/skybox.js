class Skybox {
    #program;

    constructor() {
        this.#program = gl.createProgram();

        var vertexShader = this.#createVertexShader();
        var fragmentShader = this.#createFragmentShader();

        gl.attachShader(this.#program, vertexShader);
        gl.attachShader(this.#program, fragmentShader);

        gl.linkProgram(this.#program);
        if(!gl.getProgramParameter(this.#program, gl.LINK_STATUS)) {
            alert("Could not initialize shaders");
            throw new Error();
        }
    }

    get program() { return this.#program; }

    set() {
        gl.useProgram(this.#program);

        this.#setVertexShaderVariables();
        this.#setSamplers();
    }
    unset() {
        gl.disableVertexAttribArray(this.#program.vertexPositionAttribute);
    }

    enableAttributes(vbo) {
        gl.enableVertexAttribArray(this.#program.vertexPositionAttribute);
        gl.vertexAttribPointer(this.#program.vertexPositionAttribute, vbo.positionSize, gl.FLOAT, false, vbo.stride, vbo.positionOffset);
    }

    #setVertexShaderVariables() {
        /* Attributes Setup */
        this.#program.vertexPositionAttribute    = gl.getAttribLocation(this.#program, "a_Position");
        gl.enableVertexAttribArray(this.#program.vertexPositionAttribute);

        /* Uniforms Setup */
        this.#program.mvpMatrix = gl.getUniformLocation(this.#program, "u_MVP");
        this.#program.modelMatrix = gl.getUniformLocation(this.#program, "u_ModelMatrix");
    }
    #setSamplers() {
        this.#program.cubeMap = gl.getUniformLocation(this.#program, "u_CubeMap");
        gl.uniform1i(this.#program.cubeMap, 4);
    }

    #createVertexShader() {
        var source = `
            attribute vec3 a_Position;

            uniform mat4 u_MVP;
            uniform mat4 u_ModelMatrix;

            varying vec3 v_WorldPos;
  
            void main(void) {
                mat4 noTranslation = u_MVP;
                noTranslation[3] = vec4(0.0, 0.0, 0.0, 1.0); 

                gl_Position = noTranslation * vec4(a_Position, 1.0);
                v_WorldPos = (u_ModelMatrix * vec4(a_Position, 0.0)).xyz;
            }
        `;
        return Shader.compileShader(source, gl.VERTEX_SHADER);
    }
    #createFragmentShader() {
        var source = `
            precision highp float;

            varying vec3 v_WorldPos;

            uniform samplerCube u_CubeMap;

            void main(void) {
                gl_FragColor = textureCube(u_CubeMap, normalize(v_WorldPos));
            } 
        `;
        return Shader.compileShader(source, gl.FRAGMENT_SHADER);
    }
}