class Light {
    #transform;
    #color;
    #intensity;

    constructor(transform, color, intensity) {
        this.#transform = transform;
        this.#color = new Float32Array(color.map(num => num/255));
        this.#intensity = intensity;
    }
    
    get transform() { return this.#transform; }
    get color() { return this.#color; }
    get intensity() { return this.#intensity; }

    set color(rgb) {
        this.#color = new Float32Array(rgb);
    }
    set intensity(intensity) {
        this.#intensity = intensity;
    }
}