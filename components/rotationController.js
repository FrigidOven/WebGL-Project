class RotationController {
    #entity;
    sensitivity;
    
    constructor(entity, sensitivity) {
        this.#entity = entity;
        this.sensitivity = sensitivity;

        this.#entity.components.push(this);
    }

    update() {
        let movement = Mouse.getMovement();

        let rotation = this.#entity.transform.rotation;
        this.#entity.transform.localRotation = Quaternion.compose(
            Quaternion.angleAxis(this.sensitivity * -movement[0], 0, 1, 0),
            Quaternion.angleAxis(this.sensitivity * -movement[1], ...this.#entity.transform.right),
            rotation
        );
    }
}