class Rotator {
    #entity;
    x;
    y;
    z;
    speed;

    constructor(entity, x, y, z, speed) {
        this.#entity = entity;
        this.x = x;
        this.y = y;
        this.z = z;
        this.speed = speed;

        this.#entity.components.push(this);
    }

    update(dt) {
        this.#entity.transform.localRotation = Quaternion.multiply(Quaternion.angleAxis(dt*this.speed, this.x, this.y, this.z), this.#entity.transform.rotation);
    }
}
