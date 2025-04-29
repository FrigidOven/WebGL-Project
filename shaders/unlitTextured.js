class UnlitTextured {
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
        this.#setFragmentShaderVariables();
        this.#setSamplers();
    }
    unset() {
        gl.disableVertexAttribArray(this.#program.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.#program.textureCoordinateAttribute);
    }

    enableAttributes(vbo) {
        gl.enableVertexAttribArray(this.#program.vertexPositionAttribute);
        gl.vertexAttribPointer(this.#program.vertexPositionAttribute, vbo.positionSize, gl.FLOAT, false, vbo.stride, vbo.positionOffset);
        
        if(vbo.texCoordSize) {
            gl.enableVertexAttribArray(this.#program.textureCoordinateAttribute);
            gl.vertexAttribPointer(this.#program.textureCoordinateAttribute, vbo.texCoordSize, gl.FLOAT, false, vbo.stride, vbo.texCoordOffset);
        } else {
            gl.disableVertexAttribArray(this.#program.textureCoordinateAttribute);
        }
    }

    #setVertexShaderVariables() {
        /* Attributes Setup */
        this.#program.vertexPositionAttribute    = gl.getAttribLocation(this.#program, "a_Position");
        this.#program.textureCoordinateAttribute = gl.getAttribLocation(this.#program, "a_TexCoord");
        gl.enableVertexAttribArray(this.#program.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.#program.textureCoordinateAttribute);

        /* Uniforms Setup */
        this.#program.mvpMatrix = gl.getUniformLocation(this.#program, "u_MVP");
    }
    #setFragmentShaderVariables() {
        this.#program.tintPos       = gl.getUniformLocation(this.#program, "u_Tint");
        this.#program.metallicCoeff = gl.getUniformLocation(this.#program, "u_MetallicCoeff");
    }
    #setSamplers() {
        this.#program.albedoMap   = gl.getUniformLocation(this.#program, "u_AlbedoMap");
        this.#program.specularMap = gl.getUniformLocation(this.#program, "u_MetallicMap");
    
        gl.uniform1i(this.#program.albedoMap,    0);
        gl.uniform1i(this.#program.specularMap,  2);
    }

    #createVertexShader() {
        var source = `
            attribute vec3 a_Position;
            attribute vec2 a_TexCoord;

            uniform mat4 u_MVP;

            varying vec2 v_TexCoord;
            
            void main(void) {
                gl_Position = u_MVP * vec4(a_Position, 1.0);
                v_TexCoord = a_TexCoord;
            }
        `;
        return Shader.compileShader(source, gl.VERTEX_SHADER);
    }
    #createFragmentShader() {
        var source = `
            precision highp float;

            varying vec2 v_TexCoord;

            uniform vec3  u_Tint;
            uniform float u_MetallicCoeff;

            uniform sampler2D u_AlbedoMap;
            uniform sampler2D u_MetallicMap;

            void main(void) {
                vec4 linearDialectricSpec = vec4(0.04, 0.04, 0.04, 1.0 - 0.04); // from Unity Built-in-Shaders
                float metallic = u_MetallicCoeff * texture2D(u_MetallicMap, v_TexCoord).x;
                float oneMinusReflectivity = linearDialectricSpec.w - metallic * linearDialectricSpec.w;
                
                vec3 albedoColor = texture2D(u_AlbedoMap, v_TexCoord).xyz * u_Tint;
                vec3 specularColor = mix(linearDialectricSpec.xyz, albedoColor, metallic);
                albedoColor = albedoColor * oneMinusReflectivity;
            
                gl_FragColor = vec4(albedoColor + specularColor, 1.0);
            } 
        `;
        return Shader.compileShader(source, gl.FRAGMENT_SHADER);
    }
}