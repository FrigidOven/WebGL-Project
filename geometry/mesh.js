class Mesh {
    static #bank = new Map();

    static registerMesh(meshName, vbo) {
        Mesh.#bank.set(meshName, vbo);
    }

    #vbo;

    constructor(meshName) {
        if(meshName != null)
            this.#vbo = Mesh.#bank.get(meshName);
    }

    draw(shader, mode) {
        if(this.#vbo == null)
            return;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#vbo);
        shader.enableAttributes(this.#vbo);

        gl.drawArrays(mode, 0, this.#vbo.numItems);
    }
}