class Camera {
    #transform;

    #fovy;
    #aspectRatio;

    #nearPlane
    #farPlane

    #perspective;
    #view;
    #matrix;

    constructor(transform, fovy, aspectRatio, nearPlane, farPlane) {
        this.#transform = transform;

        this.#fovy = Math.PI * fovy/180;
        this.#aspectRatio = aspectRatio;

        this.#nearPlane = nearPlane;
        this.#farPlane = farPlane;

        this.#perspective = new Mat4();
        this.#view = new Mat4();
        this.#matrix = new Mat4();

        this.#updateMatrix();
        this.#transform.performOnUpdate(this.#updateMatrix.bind(this));
    }

    get transform() { return this.#transform; }
    get matrix() { return this.#matrix; }
    get viewMatrix() { return this.#view; }

    set fovy(newFovy) {
        this.#fovy = newFovy;
        this.#updateMatrix();
    }
    get fovy() { return this.#fovy; }

    set aspectRatio(newAspectRatio) {
        this.#aspectRatio = newAspectRatio;
        this.#updateMatrix();
    }
    get aspectRatio() { return this.#aspectRatio; }

    set nearPlane(newNearPlane) {
        this.#nearPlane = newNearPlane;
        this.#updateMatrix();
    }
    get nearPlane() { return this.#nearPlane; }

    set farPlane(newFarPlane) {
        this.#farPlane = newFarPlane;
        this.#updateMatrix();
    }
    get farPlane() { return this.#farPlane; }

    #updateMatrix() {
        var f = 1 / Math.tan(this.#fovy / 2);
        var a = this.#aspectRatio;
        var _10 = (this.#nearPlane + this.#farPlane) / (this.#nearPlane - this.#farPlane);
        var _11 = (2 * this.#nearPlane * this.#farPlane) / (this.#nearPlane - this.#farPlane);

        this.#perspective.columns = new Float32Array([
            f/a, 0,   0,  0,
            0,   f,   0,  0,
            0,   0, _10, -1,
            0,   0, _11,  0
        ]);

        this.#view = this.#transform.matrix.inverse();
        this.#matrix = Mat4.multiply(this.#perspective, this.#view);
    }
}