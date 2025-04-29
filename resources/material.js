class Material {
    #tint;
    #metallicCoeff;
    #smoothingCoeff;

    #albedoSource;
    #normalSource;
    #metallicSource;
    #roughnessSource;

    #shader;

    constructor(tint, metallicCoeff, smoothingCoeff, albedoSource, normalSource, metallicSource, roughnessSource, shader) {
        this.#tint = new Float32Array(tint.map(num => num/255));
        this.#metallicCoeff = metallicCoeff;
        this.#smoothingCoeff = smoothingCoeff;

        this.#albedoSource = albedoSource;
        this.#normalSource = normalSource;
        this.#metallicSource = metallicSource;
        this.#roughnessSource = roughnessSource;

        this.#shader = shader;
    }

    set() {
        var shader = Shader.getShader(this.#shader)[0];
    
        gl.uniform3fv(shader.program.tintPos, this.#tint);
        gl.uniform1f(shader.program.metallicCoeff, this.#metallicCoeff);
        gl.uniform1f(shader.program.smoothingCoeffPos, this.#smoothingCoeff);

        Texture.setTextures(this.#albedoSource, this.#normalSource, this.#metallicSource, this.#roughnessSource);
    }

    get tint() { return this.#tint; }
    get metallicCoeff() { return this.#metallicCoeff; }
    get smoothingCoeff() { return this.#smoothingCoeff; }

    get albedoSource() { return this.#albedoSource; }
    get normalSource() { return this.#normalSource; }
    get metallicSource() { return this.#metallicSource; }
    get roughnessSource() { return this.#roughnessSource; }
    
    get shader() { return this.#shader; }

    set tint(rgb) { this.#tint = new Float32Array(rgb.map(num => num/255)); }
    set metallicCoeff(mc) { this.#metallicCoeff = mc; }
    set smoothingCoeff(sc) { this.#smoothingCoeff = sc; }

    set albedoSource(src) { this.#albedoSource = src; }
    set normalSource(src) { this.#normalSource = src; }
    set metallicSource(src) { this.#metallicSource = src; }
    set roughnessSource(src) { this.#roughnessSource = src; }

    set shader(src) { this.#shader = src; }
}