class Quaternion {
    #w;
    #x;
    #y;
    #z;

    #matrix;

    constructor() {
        this.#w = arguments.length > 0 ? arguments[0] : 1;
        this.#x = arguments.length > 1 ? arguments[1] : 0;
        this.#y = arguments.length > 2 ? arguments[2] : 0;
        this.#z = arguments.length > 3 ? arguments[3] : 0;

        this.#matrix = new Mat4();
        this.#matrix.columns = new Float32Array([
            2*(this.#w**2 + this.#x**2) - 1,       2*(this.#x*this.#y + this.#w*this.#z), 2*(this.#x*this.#z - this.#w*this.#y), 0,
            2*(this.#x*this.#y - this.#w*this.#z), 2*(this.#w**2 + this.#y**2) - 1,       2*(this.#y*this.#z + this.#w*this.#x), 0,
            2*(this.#x*this.#z + this.#w*this.#y), 2*(this.#y*this.#z - this.#w*this.#x), 2*(this.#w**2 + this.#z**2) - 1,       0,
            0,                                     0,                                     0,                                     1
       ]);
    }

    get w() { return this.#w; }
    get x() { return this.#x; }
    get y() { return this.#y; }
    get z() { return this.#z; }

    get matrix() { return this.#matrix; }

    static compose(...quaternions) {
        if (quaternions.length == 0)
            return new Quaternion();

        var product = quaternions[quaternions.length - 1];
        for (let i = quaternions.length - 2; i >= 0; i--)
            product = Quaternion.multiply(quaternions[i], product);

        return product;
    }

    static multiply(q1, q2) {
        return new Quaternion(
            q1.#w*q2.#w - q1.#x*q2.#x - q1.#y*q2.#y - q1.#z*q2.#z,
            q1.#w*q2.#x + q1.#x*q2.#w + q1.#y*q2.#z - q1.#z*q2.#y,
            q1.#w*q2.#y - q1.#x*q2.#z + q1.#y*q2.#w + q1.#z*q2.#x,
            q1.#w*q2.#z + q1.#x*q2.#y - q1.#y*q2.#x + q1.#z*q2.#w
        );
    }

    static angleAxis(deg, x, y, z) {
        var squaredSum = x*x + y*y + z*z;
        if (Math.abs(squaredSum - 1) > Number.EPSILON) {
            let magnitude = Math.sqrt(squaredSum);
            x = x / magnitude;
            y = y / magnitude;
            z = z / magnitude;
        }

        var rad = Math.PI * deg/180;
        var cos = Math.cos(rad/2);
        var sin = Math.sin(rad/2);

        return new Quaternion(cos, x*sin, y*sin, z*sin);
    }

    inverse() {
        return new Quaternion(this.#w, -this.#x, -this.#y, -this.#z);
    }
}
