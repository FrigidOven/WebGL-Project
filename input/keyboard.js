class Keyboard {
    static #downKeys;

    static init() {
        Keyboard.#downKeys = new Set();
        document.addEventListener('keydown', Keyboard.#onKeyDown);
        document.addEventListener('keyup', Keyboard.#onKeyUp);
    }

    static #onKeyDown(event) {
        if (!Keyboard.#downKeys.has(event.key))
            Keyboard.#downKeys.add(event.key.length == 1 ? event.key.toLowerCase() : event.key);
    }
    static #onKeyUp(event) {
        if (event.key.length == 1) {
            Keyboard.#downKeys.delete(event.key.toLowerCase());
            return;
        }
        Keyboard.#downKeys.delete(event.key);
    }

    static isKeyDown(key) {
        return Keyboard.#downKeys.has(key.length == 1 ? key.toLowerCase() : key);
    }

    static areAnyDown(...keys) {
        for (let key of keys.map(key => Keyboard.#downKeys.has(key.length == 1 ? key.toLowerCase() : key)))
            if (key) return true;
        return false;
    }
}