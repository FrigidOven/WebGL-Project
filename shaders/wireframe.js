class Wireframe {
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
    }
    unset() {
        gl.disableVertexAttribArray(this.#program.vertexPositionAttribute);
    }

    enableAttributes(vbo) {
        gl.enableVertexAttribArray(this.#program.vertexPositionAttribute);
        gl.vertexAttribPointer(this.#program.vertexPositionAttribute, vbo.positionSize, gl.FLOAT, false, vbo.stride, vbo.positionOffset);
    }
    #setVertexShaderVariables() {
        /* Attribute Setup */
        this.#program.vertexPositionAttribute    = gl.getAttribLocation(this.#program, "a_Position");
        gl.enableVertexAttribArray(this.#program.vertexPositionAttribute);

        /* Uniforms Setup */
        this.#program.mvpMatrix = gl.getUniformLocation(this.#program, "u_MVP");
    }

    #createVertexShader() {
        var source = `
            attribute vec3 a_Position;

            uniform mat4 u_MVP;
            
            void main(void) {
                gl_Position = u_MVP * vec4(a_Position, 1.0);
            }
        `;
        return Shader.compileShader(source, gl.VERTEX_SHADER);
    }
    #createFragmentShader() {
        var source = `
            precision highp float;
            
            void main(void) {
                gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
            } 
        `;
        return Shader.compileShader(source, gl.FRAGMENT_SHADER);
    }
}