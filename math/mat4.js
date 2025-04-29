class Mat4 {
    columns;

    constructor() {
        this.columns = new Float32Array ([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    static compose(...matricies) {
        if (matricies.length == 0)
            return new Mat4();

        var product = matricies[matricies.length - 1];
        for (let i = matricies.length - 2; i >= 0; i--)
            product = Mat4.multiply(matricies[i], product);

        return product;
    }

    static multiply(m2, m1) {
        let a = m1.columns;
        let b = m2.columns;
        
        var product = new Mat4();
        product.columns = new Float32Array
        ([
           a[0]*b[0]  + a[1]*b[4]  + a[2]*b[8]  + a[3]*b[12],  a[0]*b[1] +  a[1]*b[5]  + a[2]*b[9]  + a[3]*b[13],   a[0]*b[2]  + a[1]*b[6]  + a[2]*b[10]  + a[3]*b[14],  a[0]*b[3]  +  a[1]*b[7]  + a[2]*b[11]  + a[3]*b[15],
           a[4]*b[0]  + a[5]*b[4]  + a[6]*b[8]  + a[7]*b[12],  a[4]*b[1] +  a[5]*b[5]  + a[6]*b[9]  + a[7]*b[13] ,  a[4]*b[2]  + a[5]*b[6]  + a[6]*b[10]  + a[7]*b[14],  a[4]*b[3]  +  a[5]*b[7]  + a[6]*b[11]  + a[7]*b[15],
           a[8]*b[0]  + a[9]*b[4]  + a[10]*b[8] + a[11]*b[12], a[8]*b[1] +  a[9]*b[5]  + a[10]*b[9] + a[11]*b[13],  a[8]*b[2]  + a[9]*b[6]  + a[10]*b[10] + a[11]*b[14], a[8]*b[3]  +  a[9]*b[7]  + a[10]*b[11] + a[11]*b[15],
           a[12]*b[0] + a[13]*b[4] + a[14]*b[8] + a[15]*b[12], a[12]*b[1] + a[13]*b[5] + a[14]*b[9] + a[15]*b[13],  a[12]*b[2] + a[13]*b[6] + a[14]*b[10] + a[15]*b[14], a[12]*b[3] +  a[13]*b[7] + a[14]*b[11] + a[15]*b[15],
        ]);
        return product;
    }

    static vectorMultiply(v, matrix) {
        var m = matrix.columns;
        var ans = [
            v[0]*m[0] + v[1]*m[4] + v[2]*m[8]  + m[12],
            v[0]*m[1] + v[1]*m[5] + v[2]*m[9]  + m[13],
            v[0]*m[2] + v[1]*m[6] + v[2]*m[10] + m[14],
        ];
        if (v.length > 3)
            ans.push(v[0]*m[3] + v[1]*m[7] + v[2]*m[11] + m[15]);

        return ans;
    }

    copy() {
        var matCopy = new Mat4();
        for(let i = 0; i < 16; i++)
            matCopy[i] = this.columns[i];

        return matCopy;
    }

    inverse() {
        // Algorithm detailed here: https://math.stackexchange.com/questions/1033611/inverse-4x4-matrix

        var a = [this.columns[0], this.columns[1], this.columns[2]];
        var b = [this.columns[4], this.columns[5], this.columns[6]];
        var c = [this.columns[8], this.columns[9], this.columns[10]];

        var _3x3adjoint = [
            (b[1] * c[2] - b[2] * c[1]), -(a[1] * c[2] - a[2] * c[1]),  (a[1] * b[2] - a[2] * b[1]),
           -(b[0] * c[2] - b[2] * c[0]),  (a[0] * c[2] - a[2] * c[0]), -(a[0] * b[2] - a[2] * b[0]),
            (b[0] * c[1] - b[1] * c[0]), -(a[0] * c[1] - a[1] * c[0]),  (a[0] * b[1] - a[1] * b[0]),
        ];

        var _3x3det = a[0] * _3x3adjoint[0] + a[1] * _3x3adjoint[3] + a[2] * _3x3adjoint[6];

        var _3x3inv = [
            _3x3adjoint[0]/_3x3det, _3x3adjoint[1]/_3x3det, _3x3adjoint[2]/_3x3det,
            _3x3adjoint[3]/_3x3det, _3x3adjoint[4]/_3x3det, _3x3adjoint[5]/_3x3det,
            _3x3adjoint[6]/_3x3det, _3x3adjoint[7]/_3x3det, _3x3adjoint[8]/_3x3det, 
        ];

        let u = [this.columns[3], this.columns[7], this.columns[11]];
        let v = [this.columns[12], this.columns[13], this.columns[14]];
        let z = this.columns[15];

        u = [
            -_3x3inv[0] * u[0] + -_3x3inv[1] * u[1] + -_3x3inv[2] * u[2],
            -_3x3inv[3] * u[0] + -_3x3inv[4] * u[1] + -_3x3inv[5] * u[2],
            -_3x3inv[6] * u[0] + -_3x3inv[7] * u[1] + -_3x3inv[8] * u[2],
        ];

        z = 1/(z + v[0] * u[0] + v[1] * u[1] + v[2] * u[2]);

        v = [
            (v[0] * _3x3inv[0] + v[1] * _3x3inv[3] + v[2] * _3x3inv[6]) * -z,
            (v[0] * _3x3inv[1] + v[1] * _3x3inv[4] + v[2] * _3x3inv[7]) * -z,
            (v[0] * _3x3inv[2] + v[1] * _3x3inv[5] + v[2] * _3x3inv[8]) * -z
        ];

        var topLeft = [
            _3x3inv[0] + u[0]*v[0], _3x3inv[1] + u[0]*v[1], _3x3inv[2] + u[0]*v[2],
            _3x3inv[3] + u[1]*v[0], _3x3inv[4] + u[1]*v[1], _3x3inv[5] + u[1]*v[2],
            _3x3inv[6] + u[2]*v[0], _3x3inv[7] + u[2]*v[1], _3x3inv[8] + u[2]*v[2],
        ];

        u[0] *= z;
        u[1] *= z;
        u[2] *= z;

        let ans = new Mat4();
        ans.columns = new Float32Array([
            topLeft[0], topLeft[1], topLeft[2], u[0],
            topLeft[3], topLeft[4], topLeft[5], u[1],
            topLeft[6], topLeft[7], topLeft[8], u[2],
            v[0],       v[1],       v[2],       z
        ]);

        return ans;
    }

    transpose() {
        var ans = new Mat4();

        ans.columns = new Float32Array([
            this.columns[0], this.columns[4], this.columns[8],  this.columns[12],
            this.columns[1], this.columns[5], this.columns[9],  this.columns[13],
            this.columns[2], this.columns[6], this.columns[10], this.columns[14],
            this.columns[3], this.columns[7], this.columns[11], this.columns[15]
        ]);

        return ans;
    }

    get3x3columns() {
        return new Float32Array([
            this.columns[0],  this.columns[1],  this.columns[2],
            this.columns[4],  this.columns[5],  this.columns[6],
            this.columns[8],  this.columns[9],  this.columns[10],
        ]);
    }
}