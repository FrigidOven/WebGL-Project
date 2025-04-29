class Default {
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
        gl.enableVertexAttribArray(this.#program.vertexNormalAttribute);
        gl.disableVertexAttribArray(this.#program.textureCoordinateAttribute);
        gl.disableVertexAttribArray(this.#program.vertexTangentAttribute);
    }

    enableAttributes(vbo) {
        gl.enableVertexAttribArray(this.#program.vertexPositionAttribute);
        gl.vertexAttribPointer(this.#program.vertexPositionAttribute, vbo.positionSize, gl.FLOAT, false, vbo.stride, vbo.positionOffset);

        gl.enableVertexAttribArray(this.#program.vertexNormalAttribute);
        gl.vertexAttribPointer(this.#program.vertexNormalAttribute, vbo.normalSize, gl.FLOAT, false, vbo.stride, vbo.normalOffset);
       
        if(vbo.texCoordSize) {
            gl.enableVertexAttribArray(this.#program.textureCoordinateAttribute);
            gl.vertexAttribPointer(this.#program.textureCoordinateAttribute, vbo.texCoordSize, gl.FLOAT, false, vbo.stride, vbo.texCoordOffset);
        } else {
            gl.disableVertexAttribArray(this.#program.textureCoordinateAttribute);
        }
        if (vbo.tangentSize) {
            gl.enableVertexAttribArray(this.#program.vertexTangentAttribute);
            gl.vertexAttribPointer(this.#program.vertexTangentAttribute, vbo.tangentSize, gl.FLOAT, false, vbo.stride, vbo.tangentOffset);
        } else {
            gl.disableVertexAttribArray(this.#program.vertexTangentAttribute);
        }
    }
    #setVertexShaderVariables() {
        /* Attributes Setup */
        this.#program.vertexPositionAttribute    = gl.getAttribLocation(this.#program, "a_Position");
        this.#program.textureCoordinateAttribute = gl.getAttribLocation(this.#program, "a_TexCoord");
        this.#program.vertexNormalAttribute      = gl.getAttribLocation(this.#program, "a_Normal");
        this.#program.vertexTangentAttribute     = gl.getAttribLocation(this.#program, "a_Tangent");
        gl.enableVertexAttribArray(this.#program.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.#program.textureCoordinateAttribute);
        gl.enableVertexAttribArray(this.#program.vertexNormalAttribute);
        gl.enableVertexAttribArray(this.#program.vertexTangentAttribute);

        /* Uniforms Setup */
        this.#program.modelMatrix  = gl.getUniformLocation(this.#program, "u_ModelMatrix");
        this.#program.mvpMatrix    = gl.getUniformLocation(this.#program, "u_MVP");
        this.#program.normalMatrix = gl.getUniformLocation(this.#program, "u_NormalMatrix");
    }
    #setFragmentShaderVariables() {
        this.#program.ambientLight      = gl.getUniformLocation(this.#program, "u_Ambient");
        this.#program.lightPos          = gl.getUniformLocation(this.#program, "u_LightPos");
        this.#program.cameraPos         = gl.getUniformLocation(this.#program, "u_CameraPos");
        this.#program.lightColor        = gl.getUniformLocation(this.#program, "u_LightColor");
        this.#program.lightIntensity    = gl.getUniformLocation(this.#program, "u_LightIntensity");
        this.#program.tintPos           = gl.getUniformLocation(this.#program, "u_Tint");
        this.#program.metallicCoeff     = gl.getUniformLocation(this.#program, "u_MetallicCoeff");
        this.#program.smoothingCoeffPos = gl.getUniformLocation(this.#program, "u_SmoothingCoeff");
    }
    #setSamplers() {
        this.#program.albedoMap    = gl.getUniformLocation(this.#program, "u_AlbedoMap");
        this.#program.normalMap    = gl.getUniformLocation(this.#program, "u_NormalMap");
        this.#program.specularMap  = gl.getUniformLocation(this.#program, "u_MetallicMap");
        this.#program.roughnessMap = gl.getUniformLocation(this.#program, "u_RoughnessMap");
        this.#program.cubeMap      = gl.getUniformLocation(this.#program, "u_CubeMap");
    
        gl.uniform1i(this.#program.albedoMap,    0);
        gl.uniform1i(this.#program.normalMap,    1);
        gl.uniform1i(this.#program.specularMap,  2);
        gl.uniform1i(this.#program.roughnessMap, 3);
        gl.uniform1i(this.#program.cubeMap,      4);
    }

    #createVertexShader() {
        var source = `
            attribute vec3 a_Position;
            attribute vec2 a_TexCoord;
            attribute vec3 a_Normal;
            attribute vec3 a_Tangent;

            uniform mat4 u_ModelMatrix;
            uniform mat4 u_MVP;
            uniform mat3 u_NormalMatrix;
            
            varying vec2 v_TexCoord;
            varying vec3 v_Normal;
            varying mat3 v_TBN;

            varying vec3 v_WorldPos;

            void main(void) {
                gl_Position = u_MVP * vec4(a_Position, 1.0);

                v_TexCoord = a_TexCoord;
                v_Normal = normalize(u_NormalMatrix * a_Normal);

                vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);
                v_WorldPos = vec3(worldPos.xyz);

                // ensure 0 vector is not normalized
                vec3 tangent = float(int(length(a_Tangent) == 0.0)) + a_Tangent;

                vec3 T = normalize(u_NormalMatrix * tangent);
                vec3 B = cross(v_Normal, T);
                v_TBN = mat3(T, B, v_Normal);
            }
        `;
        return Shader.compileShader(source, gl.VERTEX_SHADER);
    }
    #createFragmentShader() {
        var source = `
            precision highp float;

            varying vec2 v_TexCoord;
            varying vec3 v_Normal;

            varying vec3 v_WorldPos;
            varying mat3 v_TBN;
            
            uniform vec3 u_LightPos;
            uniform vec3 u_CameraPos;

            uniform vec3  u_LightColor;
            uniform float u_LightIntensity;

            uniform vec3  u_Ambient;

            uniform sampler2D u_AlbedoMap;
            uniform sampler2D u_NormalMap;
            uniform sampler2D u_MetallicMap;
            uniform sampler2D u_RoughnessMap;

            uniform vec3  u_Tint;
            uniform float u_MetallicCoeff;
            uniform float u_SmoothingCoeff;

            uniform samplerCube u_CubeMap;

            /*
             * This code is based off of Unity's Standard BRDF and the Disney diffuse.
             * The original source is located at:
             * https://github.com/TwoTailsGames/Unity-Built-in-Shaders/blob/master/CGIncludes/UnityStandardBRDF.cginc
             */
            vec4 BRDF(vec3 diffuseColor, vec3 specularColor, float oneMinusReflectivity, float roughness, vec3 normal, vec3 viewDir, vec3 lightDir, vec3 ambientLight, vec3 lightColor, vec3 envLight) {
                vec3 halfDir = normalize(lightDir + viewDir);

                float normalView = abs(dot(normal, viewDir));
                float normalLight = clamp(dot(normal, lightDir), 0.0, 1.0);
                float normalHalf = clamp(dot(normal, halfDir), 0.0, 1.0);

                float lightView = clamp(dot(lightDir, viewDir), 0.0, 1.0);
                float lightHalf = clamp(dot(lightDir, halfDir), 0.0, 1.0);

                // Disney Diffuse
                float fd90 = 0.5 + 2.0 * lightHalf * lightHalf * roughness;
                float lightScatter = (1.0 + (fd90 - 1.0) * pow(1.0 - normalLight, 5.0));
                float viewScatter = (1.0 + (fd90 - 1.0) * pow(1.0 - normalView, 5.0));

                float kD = lightScatter * viewScatter * normalLight; 

                float smoothness = 1.0 - roughness;
                roughness = max(roughness * roughness, 0.002);
                float roughness2 = roughness * roughness;
                
                float lambdaV = normalLight * (normalView * (1.0 - roughness) + roughness);
                float lambdaL = normalView * (normalLight * (1.0 - roughness) + roughness);

                float d = (normalHalf * roughness2 - normalHalf) * normalHalf + 1.0;

                float V = 0.5 / (lambdaV + lambdaL + 0.00001);
                float D = (1.0 / 3.141592) * roughness2 / (d * d + 0.0000001);

                float kS = max(0.0, normalLight * V * D * 3.141592);
                kS = kS * float(int(length(specularColor) > 0.0));

                float surfaceReduction = 1.0 / (roughness2 + 1.0);
                float grazingTerm = clamp(smoothness + (1.0 - oneMinusReflectivity), 0.0, 1.0);

                vec3 fresnelTerm = specularColor + (1.0 - specularColor) * pow(1.0 - lightHalf, 5.0);
                vec3 fresnelLerp = mix(specularColor, vec3(grazingTerm), pow(1.0 - normalView, 5.0));

                vec3 diffuse = diffuseColor * (ambientLight + lightColor * kD);
                vec3 specular = kS * lightColor * fresnelTerm;
                vec3 fresnel = surfaceReduction * envLight * fresnelLerp;

                return vec4(diffuse + specular + fresnel, 1.0);
            }

            void main(void) {
                vec3 normal = 2.0 * texture2D(u_NormalMap, v_TexCoord).xyz - 1.0;
                normal = normalize(v_TBN * normal);

                vec3 lightDir = normalize(u_LightPos - v_WorldPos);
                vec3 viewDir  = normalize(u_CameraPos - v_WorldPos);

                vec3 lightColor = u_LightIntensity * u_LightColor;

                vec4 linearDialectricSpec = vec4(0.04, 0.04, 0.04, 1.0 - 0.04); // from Unity Built-in-Shaders
                float metallic = u_MetallicCoeff * texture2D(u_MetallicMap, v_TexCoord).x;
                float oneMinusReflectivity = linearDialectricSpec.w - metallic * linearDialectricSpec.w;
                
                vec3 albedoColor = texture2D(u_AlbedoMap, v_TexCoord).xyz * u_Tint;
                vec3 specularColor = mix(linearDialectricSpec.xyz, albedoColor, metallic);
                albedoColor = albedoColor * oneMinusReflectivity;

                vec3 refDir = normalize(reflect(-viewDir,  normal));
                vec3 envColor = textureCube(u_CubeMap, refDir).xyz;
            
                float smoothness = u_SmoothingCoeff * (1.0 - texture2D(u_RoughnessMap, v_TexCoord).x);

                gl_FragColor = BRDF(albedoColor, specularColor, oneMinusReflectivity, 1.0 - smoothness, normal, viewDir, lightDir, u_Ambient, lightColor, envColor);
            } 
        `;
        return Shader.compileShader(source, gl.FRAGMENT_SHADER);
    }
}