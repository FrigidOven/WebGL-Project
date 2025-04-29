class KeyboardRotationController {
    #entity;
    upKey;
    leftKey;
    downKey;
    rightKey;
    speed;

    constructor(entity, upKey, leftKey, downKey, rightKey, speed) {
        this.#entity = entity;
        this.upKey = upKey;
        this.leftKey = leftKey;
        this.downKey = downKey;
        this.rightKey = rightKey;
        this.speed = speed;

        this.#entity.components.push(this);
    }

    update(dt) {
        if (Keyboard.isKeyDown(this.upKey)) {
            this.#entity.transform.localRotation = Quaternion.multiply(
                Quaternion.angleAxis(-dt*this.speed, ...this.#entity.transform.right),
                this.#entity.transform.rotation
            );
        }
        if (Keyboard.isKeyDown(this.leftKey)) {
            this.#entity.transform.localRotation = Quaternion.multiply(
                Quaternion.angleAxis(-dt*this.speed, 0, 1, 0),
                this.#entity.transform.rotation
            );
        }
        if (Keyboard.isKeyDown(this.downKey)) {
            this.#entity.transform.localRotation = Quaternion.multiply(
                Quaternion.angleAxis(dt*this.speed, ...this.#entity.transform.right),
                this.#entity.transform.rotation
            );
        }
        if (Keyboard.isKeyDown(this.rightKey)) {
            this.#entity.transform.localRotation = Quaternion.multiply(
                Quaternion.angleAxis(dt*this.speed, 0, 1, 0),
                this.#entity.transform.rotation
            );
        }
    }
}