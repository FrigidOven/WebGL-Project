class MaterialSwitcher {
    #entity;
    switchKey;
    materials;

    #down;
    #index;

    constructor(entity, switchKey, materials) {
        this.#entity = entity;
        this.switchKey = switchKey;
        this.materials = materials;

        this.#down = false;
        this.#index = 0;

        this.#entity.components.push(this);
    }

    update() {
        if (!this.#down && Keyboard.isKeyDown(this.switchKey)) {
            this.#down = true;
            this.#index = (this.#index + 1) % this.materials.length;
            this.#entity.material = this.materials[this.#index];
        }
        else if(!Keyboard.isKeyDown(this.switchKey))
            this.#down = false;
    }
}