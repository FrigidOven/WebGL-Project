class Primitives {
    static initialize() {
        Primitives.initializeCone();
        Primitives.initializeCube();
        Primitives.initializeTorus();
        Primitives.initializeFloor();
        Primitives.initializeSkybox();
    }
    static initializeFloor() {
        var width = 512;
        var length = 512;
        var textureScale = 32;

        var vertices = [
            [-0.5*width, 0.0, 0.5*length],
            [0.5*width, 0.0,  0.5*length],
            [0.5*width, 0.0, -0.5*length],

            [-0.5*width, 0.0, 0.5*length],
            [0.5*width, 0.0, -0.5*length],
            [-0.5*width, 0.0, -0.5*length],
        ];
        var normals = [
            [0.0, 1.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 1.0, 0.0],

            [0.0, 1.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 1.0, 0.0],
        ];
        var texCoords = [
            [0.0, length/textureScale],
            [width/textureScale, length/textureScale],
            [width/textureScale, 0.0],

            [0.0, length/textureScale],
            [width/textureScale, 0.0],
            [0.0, 0.0]
        ]

        var vboData = [];
        for (let i = 0; i < 6; i++) {
            vboData.push(...vertices[i]);
            vboData.push(...texCoords[i]);
            vboData.push(...normals[i]);
            vboData.push(1, 0, 0); // tangent
        }

        vboData = new Float32Array(vboData);

        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vboData, gl.STATIC_DRAW);

        vbo.positionOffset = 0;
        vbo.positionSize = 3;

        vbo.texCoordOffset = vbo.positionSize * Float32Array.BYTES_PER_ELEMENT;
        vbo.texCoordSize = 2;

        vbo.normalOffset = vbo.texCoordOffset + (vbo.texCoordSize * Float32Array.BYTES_PER_ELEMENT);
        vbo.normalSize = 3;

        vbo.tangentOffset = vbo.normalOffset + (vbo.normalSize * Float32Array.BYTES_PER_ELEMENT);
        vbo.tangentSize = 3;

        vbo.stride = (vbo.positionSize + vbo.texCoordSize + vbo.normalSize + vbo.tangentSize) * Float32Array.BYTES_PER_ELEMENT;
        vbo.numItems = vboData.length/(vbo.positionSize + vbo.texCoordSize + vbo.normalSize + vbo.tangentSize);

        Mesh.registerMesh("floor", vbo);
    }
    static initializeTorus() {
        var res = 33;
        var circleRes = 33;
        var innerRadius = 0.5;
        var ringRadius = 0.5;

        var vertices = [];
        var texCoords = [];
        var normals = [];
        for (let i = 0; i <= res; i++) {
            let rotation = Quaternion.angleAxis(360 * i/res, 0, 1, 0).matrix;
            for (let j = 0; j < circleRes; j++) {
                let x = Math.cos(2*Math.PI * j/circleRes);
                let y = Math.sin(2*Math.PI * j/circleRes);
                let xOffset = -(innerRadius + ringRadius);

                vertices.push(Mat4.vectorMultiply([ringRadius*x + xOffset, ringRadius*y, 0], rotation));
                texCoords.push([i/res, 0.5*y + 0.5]);
                normals.push(Mat4.vectorMultiply([x, y, 0], rotation));
            }
        }
        
        var tangents = [];
        for (let i = 0; i < vertices.length; i++) {
            tangents.push([0, 0, 0]);
        }

        for (let i = 0; i < res; i++) {
            let nextRing = i + 1;
            for (let j = 0; j < circleRes; j++) {
                let nextPoint = (j + 1) % circleRes;
                
                let tangent1 = Primitives.#findTangent(vertices, texCoords, i*circleRes + j, i*circleRes + nextPoint, nextRing*circleRes + nextPoint);
                tangents[i*circleRes + j] = tangents[i*circleRes + j].map((num, k) => num + tangent1[k]);
                tangents[i*circleRes + nextPoint] = tangents[i*circleRes + nextPoint].map((num, k) => num + tangent1[k]);
                tangents[nextRing*circleRes + nextPoint] = tangents[nextRing*circleRes + nextPoint].map((num, k) => num + tangent1[k]);

                let tangent2 = Primitives.#findTangent(vertices, texCoords, i*circleRes + j, nextRing*circleRes + nextPoint, nextRing*circleRes + j);
                tangents[i*circleRes + j] = tangents[i*circleRes + j].map((num, k) => num + tangent2[k]);
                tangents[nextRing*circleRes + nextPoint] = tangents[nextRing*circleRes + nextPoint].map((num, k) => num + tangent2[k]);
                tangents[nextRing*circleRes + j] = tangents[nextRing*circleRes + j].map((num, k) => num + tangent2[k]);
            }
        }
        for (let i = 0; i < tangents.length; i++) {
            let magnitude = Math.sqrt(tangents[i][0]**2 + tangents[i][1]**2 + tangents[i][2]**2);
            tangents[i] = tangents[i].map((num) => num/magnitude);
        }

        var vboData = [];
        for (let i = 0; i < res; i++) {
            let nextRing = i + 1;
            for (let j = 0; j < circleRes; j++) {
                let nextPoint = (j + 1) % circleRes;

                vboData.push(...vertices[i*circleRes + j]);
                vboData.push(...texCoords[i*circleRes + j]);
                vboData.push(...normals[i*circleRes + j]);
                vboData.push(...tangents[i*circleRes + j]);
                
                vboData.push(...vertices[i*circleRes + nextPoint]);
                vboData.push(...texCoords[i*circleRes + nextPoint]);
                vboData.push(...normals[i*circleRes + nextPoint]);
                vboData.push(...tangents[i*circleRes + nextPoint]);

                vboData.push(...vertices[nextRing*circleRes + nextPoint]);
                vboData.push(...texCoords[nextRing*circleRes + nextPoint]);
                vboData.push(...normals[nextRing*circleRes + nextPoint]);
                vboData.push(...tangents[nextRing*circleRes + nextPoint]);

                vboData.push(...vertices[i*circleRes + j]);
                vboData.push(...texCoords[i*circleRes + j]);
                vboData.push(...normals[i*circleRes + j]);
                vboData.push(...tangents[i*circleRes + j]);

                vboData.push(...vertices[nextRing*circleRes + nextPoint]);
                vboData.push(...texCoords[nextRing*circleRes + nextPoint]);
                vboData.push(...normals[nextRing*circleRes + nextPoint]);
                vboData.push(...tangents[nextRing*circleRes + nextPoint]);

                vboData.push(...vertices[nextRing*circleRes + j]);
                vboData.push(...texCoords[nextRing*circleRes + j]);
                vboData.push(...normals[nextRing*circleRes + j]);
                vboData.push(...tangents[nextRing*circleRes + j]);
            }
        }

        vboData = new Float32Array(vboData);

        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vboData, gl.STATIC_DRAW);

        vbo.positionOffset = 0;
        vbo.positionSize = 3;

        vbo.texCoordOffset = vbo.positionSize * Float32Array.BYTES_PER_ELEMENT;
        vbo.texCoordSize = 2;

        vbo.normalOffset = vbo.texCoordOffset + (vbo.texCoordSize * Float32Array.BYTES_PER_ELEMENT);
        vbo.normalSize = 3;

        vbo.tangentOffset = vbo.normalOffset + (vbo.normalSize * Float32Array.BYTES_PER_ELEMENT);
        vbo.tangentSize = 3;

        vbo.stride = (vbo.positionSize + vbo.texCoordSize + vbo.normalSize + vbo.tangentSize) * Float32Array.BYTES_PER_ELEMENT;
        vbo.numItems = vboData.length/(vbo.positionSize + vbo.texCoordSize + vbo.normalSize + vbo.tangentSize);

        Mesh.registerMesh("torus", vbo);
    }
    static #findTangent(vertices, texCoords, i1, i2, i3) {
        let edge1 = vertices[i1].map((num, k) => vertices[i2][k] - num);
        let edge2 = vertices[i1].map((num, k) => vertices[i3][k] - num);
        let dUV1 = texCoords[i1].map((num, k) => texCoords[i2][k] - num);
        let dUV2 = texCoords[i1].map((num, k) => texCoords[i3][k] - num);

        var f = 1 / (dUV1[0] * dUV2[1] - dUV2[0] * dUV1[1]);
        
        return [
            f * (dUV2[1] * edge1[0] - dUV1[1] * edge2[0]),
            f * (dUV2[1] * edge1[1] - dUV1[1] * edge2[1]),
            f * (dUV2[1] * edge1[2] - dUV1[1] * edge2[2])
        ];        
    }
    static initializeCone() {
        var circleRes  = 33;
        var baseRadius = 0.75;
        var topRadius  = 0.25; 
        var slope = baseRadius - topRadius;

        var vertices = [];
        var normals = [];
        var faces = [];

        var vboData = [];

        // add bottom ring
        for (let i = 0; i < circleRes; i++) {
            let x = Math.cos(2*Math.PI * i/circleRes);
            let z = Math.sin(2*Math.PI * i/circleRes);

            vertices.push([baseRadius * x, -0.5, baseRadius * z]);

            let nmag = Math.sqrt(x**2 + slope**2 + z**2);
            normals.push([x/nmag, slope/nmag, z/nmag]);
        }
        // add top ring
        for (let i = 0; i < circleRes; i++) {
            let x = Math.cos(2*Math.PI * i/circleRes);
            let z = Math.sin(2*Math.PI * i/circleRes);

            vertices.push([topRadius * x, 0.5, topRadius * z]);

            let nmag = Math.sqrt(x**2 + slope**2 + z**2);
            normals.push([x/nmag, slope/nmag, z/nmag]);
        }
        // add faces along rings
        for(let i = 0; i < circleRes; i++) {
            let next = (i + 1) % circleRes;
            faces.push([i, next, circleRes + next]);
            faces.push([i, circleRes + next, circleRes + i]);
        }
        // add ring faces to vbo
        for(let face of faces) {
            let faceVertices = face.map(val => vertices[val]);
            let faceNormals = face.map(val => normals[val]);

            vboData.push(...faceVertices[2]);
            vboData.push(...faceNormals[2]);

            vboData.push(...faceVertices[1]);
            vboData.push(...faceNormals[1]);

            vboData.push(...faceVertices[0]);
            vboData.push(...faceNormals[0]);
        }
        // add top and bottom face to vbo.
        for (let i = 0; i < circleRes; i++) {
            vboData.push(...vertices[i]);
            vboData.push(0, -1, 0); // bottom face has down pointing normals

            vboData.push(...vertices[(i + 1) % circleRes]);
            vboData.push(0, -1, 0);

            vboData.push(0, -0.5, 0);
            vboData.push(0, -1, 0);

            vboData.push(...vertices[circleRes + i]);
            vboData.push(0, 1, 0); // top face has up pointing normals

            vboData.push(...vertices[circleRes + (i + 1) % circleRes]);
            vboData.push(0, 1, 0);

            vboData.push(0, 0.5, 0);
            vboData.push(0, 1, 0);
        }

        vboData = new Float32Array(vboData);

        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vboData, gl.STATIC_DRAW);

        vbo.positionOffset = 0;
        vbo.positionSize = 3;

        vbo.normalOffset = vbo.positionOffset + (vbo.positionSize * Float32Array.BYTES_PER_ELEMENT);
        vbo.normalSize = 3;

        vbo.stride = (vbo.positionSize + vbo.normalSize) * Float32Array.BYTES_PER_ELEMENT;
        vbo.numItems = vboData.length/(vbo.positionSize + vbo.normalSize);

        Mesh.registerMesh("cone", vbo);
    }
    static initializeSkybox() {
        var vboData = new Float32Array([
            // Front face
             0.5,  0.5, 0.5,
             0.5, -0.5, 0.5,
            -0.5, -0.5, 0.5,
             
            -0.5,  0.5, 0.5,
             0.5,  0.5, 0.5,
            -0.5, -0.5, 0.5,

            // Back face
            -0.5, -0.5, -0.5,
             0.5, -0.5, -0.5,
             0.5,  0.5, -0.5,
            
            -0.5, -0.5, -0.5,
             0.5,  0.5, -0.5,
            -0.5,  0.5, -0.5,

            // Right face
             0.5, -0.5, -0.5,
             0.5, -0.5,  0.5,
             0.5,  0.5,  0.5,

             0.5, -0.5, -0.5,
             0.5,  0.5,  0.5,
             0.5,  0.5, -0.5,

            // Left face
            -0.5,  0.5,  0.5,
            -0.5, -0.5,  0.5,
            -0.5, -0.5, -0.5,

            -0.5,  0.5, -0.5,
            -0.5,  0.5,  0.5,
            -0.5, -0.5, -0.5,

            // Top face
             0.5,  0.5, -0.5,
             0.5,  0.5,  0.5,
            -0.5,  0.5,  0.5,

            -0.5,  0.5, -0.5,
             0.5,  0.5, -0.5,
            -0.5,  0.5,  0.5,

            // Bottom face
            -0.5, -0.5,  0.5,
             0.5, -0.5,  0.5,
             0.5, -0.5, -0.5,
 
            -0.5, -0.5,  0.5,
             0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5,
        ]);

        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vboData, gl.STATIC_DRAW);

        vbo.positionOffset = 0;
        vbo.positionSize = 3;

        vbo.stride = vbo.positionSize * Float32Array.BYTES_PER_ELEMENT;
        vbo.numItems = vboData.length/vbo.positionSize;

        Mesh.registerMesh("skybox", vbo);
    }
    static initializeCube() {
        var vboData = new Float32Array([
            // Front face

            -0.5, -0.5, 0.5,
             0.0,  0.0, 1.0,
            
             0.5, -0.5, 0.5,
             0.0,  0.0, 1.0,

             0.5,  0.5, 0.5,
             0.0,  0.0, 1.0,

            -0.5, -0.5, 0.5,
             0.0,  0.0, 1.0,

             0.5,  0.5, 0.5,
             0.0,  0.0, 1.0,

            -0.5,  0.5, 0.5,
             0.0,  0.0, 1.0,

            // Back face

             0.5,  0.5, -0.5,
             0.0,  0.0, -1.0,
            
             0.5, -0.5, -0.5,
             0.0,  0.0, -1.0,

            -0.5, -0.5, -0.5,
             0.0,  0.0, -1.0,

            -0.5,  0.5, -0.5,
             0.0,  0.0, -1.0,

             0.5,  0.5, -0.5,
             0.0,  0.0, -1.0,

            -0.5, -0.5, -0.5,
             0.0,  0.0, -1.0,

            // Right face

             0.5,  0.5,  0.5,
             1.0,  0.0,  0.0,

             0.5, -0.5,  0.5,
             1.0,  0.0,  0.0,

             0.5, -0.5, -0.5,
             1.0,  0.0,  0.0,

             0.5,  0.5, -0.5,
             1.0,  0.0,  0.0,

             0.5,  0.5,  0.5,
             1.0,  0.0,  0.0,

             0.5, -0.5, -0.5,
             1.0,  0.0,  0.0,


            // Left face

            -0.5, -0.5, -0.5,
            -1.0,  0.0,  0.0,

            -0.5, -0.5,  0.5,
            -1.0,  0.0,  0.0,

            -0.5,  0.5,  0.5,
            -1.0,  0.0,  0.0,

            -0.5, -0.5, -0.5,
            -1.0,  0.0,  0.0,

            -0.5,  0.5,  0.5,
            -1.0,  0.0,  0.0,

            -0.5,  0.5, -0.5,
            -1.0,  0.0,  0.0,

            // Top face

            -0.5,  0.5,  0.5,
             0.0,  1.0,  0.0,

             0.5,  0.5,  0.5,
             0.0,  1.0,  0.0,

             0.5,  0.5, -0.5,
             0.0,  1.0,  0.0,

            -0.5,  0.5,  0.5,
             0.0,  1.0,  0.0,

             0.5,  0.5, -0.5,
             0.0,  1.0,  0.0,
            
            -0.5,  0.5, -0.5,
             0.0,  1.0,  0.0,

            // Bottom face

             0.5, -0.5, -0.5,
             0.0, -1.0,  0.0,

             0.5, -0.5,  0.5,
             0.0, -1.0,  0.0,

            -0.5, -0.5,  0.5,
             0.0, -1.0,  0.0,

            -0.5, -0.5, -0.5,
             0.0, -1.0,  0.0,

             0.5, -0.5, -0.5,
             0.0, -1.0,  0.0,
           
            -0.5, -0.5,  0.5,
             0.0, -1.0,  0.0,
        ]);

        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vboData, gl.STATIC_DRAW);

        vbo.positionOffset = 0;
        vbo.positionSize = 3;

        vbo.normalOffset = vbo.positionOffset + (vbo.positionSize * Float32Array.BYTES_PER_ELEMENT);
        vbo.normalSize = 3;

        vbo.stride = (vbo.positionSize + vbo.normalSize) * Float32Array.BYTES_PER_ELEMENT;
        vbo.numItems = vboData.length/(vbo.positionSize + vbo.normalSize);

        Mesh.registerMesh("cube", vbo);
    }
}