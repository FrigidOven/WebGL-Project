class Mouse {
    static #locked;
    static #preMouseXY;
    static #curMouseXY;

    static init() {
        Mouse.#locked = 0;
        Mouse.#preMouseXY = [0, 0];
        Mouse.#curMouseXY = [0, 0];

        document.addEventListener('mousemove', Mouse.#onMouseMove);
        canvas.addEventListener('click', Mouse.#onMouseClick);
        document.addEventListener('pointerlockchange', Mouse.#onPointerLockChange);
    }

    static async #onMouseClick() {
        if (Mouse.#locked)
            document.exitPointerLock();
        else
            await canvas.requestPointerLock();
    }

    static #onPointerLockChange() {
        Mouse.#locked = Mouse.#locked ? 0 : 1;
    }

    static #onMouseMove(event) {
        Mouse.#curMouseXY[0] += event.movementX;
        Mouse.#curMouseXY[1] += event.movementY;
    }

    static update() {
        Mouse.#preMouseXY[0] = Mouse.#curMouseXY[0];
        Mouse.#preMouseXY[1] = Mouse.#curMouseXY[1];
    }

    static getMovement() {
        return [
            Mouse.#locked * (Mouse.#curMouseXY[0] - Mouse.#preMouseXY[0]),
            Mouse.#locked * (Mouse.#curMouseXY[1] - Mouse.#preMouseXY[1])
        ];
    }
}