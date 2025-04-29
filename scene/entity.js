class Entity {
    #id;

    #transform;
    #mesh;
    material;

    components;

    constructor(id, mesh, material) {
        this.#id = id;
        this.#transform = new Transform(id);
        this.#mesh = mesh;
        this.material = material;
        this.components = [];
    }

    update(dt) {
        for (let i = 0; i < this.components.length; i++)
            this.components[i].update(dt);
    }

    draw(cameraMatrix, cameraPos, lightPos, lightColor, lightIntensity, ambientLight) {
        if(!this.material)
            return;

        var shader, mode;
        [shader, mode] = Shader.getShader(this.material.shader);
        shader.set();
        this.material.set();
        
        gl.uniform3fv(shader.program.cameraPos,     cameraPos);
        gl.uniform3fv(shader.program.lightPos,      lightPos);
        gl.uniform3fv(shader.program.lightColor,    lightColor);
        gl.uniform1f(shader.program.lightIntensity, lightIntensity);
        gl.uniform3fv(shader.program.ambientLight,  ambientLight);

        gl.uniformMatrix4fv(shader.program.modelMatrix, false, this.#transform.matrix.columns);
        gl.uniformMatrix4fv(shader.program.mvpMatrix, false, Mat4.multiply(cameraMatrix, this.#transform.matrix).columns);
        gl.uniformMatrix3fv(shader.program.normalMatrix, false, this.#transform.matrix.inverse().transpose().get3x3columns());

        this.#mesh.draw(shader, mode);
        shader.unset();
    }

    get id() { return this.#id; }
    get transform() { return this.#transform; }
    get mesh() { return this.#mesh; }
}