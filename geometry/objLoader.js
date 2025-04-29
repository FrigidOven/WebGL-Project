class ObjLoader {
    static async load(filename) {
        try {
            var response = await fetch("geometry/" + filename);
            var fileContents = await response.text();
            this.#createMesh(filename.split(".")[0], fileContents);
        } catch (error) {
            console.log(error.stack);
            console.error("Error loading file \"" + filename + "\":\n\t", error + "\n\nHint: Must launch local server.");
        }
    }
    static #createMesh(meshName, fileContents) {
        var vertices    = [];
        var texCoords   = [];
        var vertexNorms = [];

        var data = [];

        var lines = fileContents.split(/\r?\n/);
        for (let line of lines) {
            line = line.trim();
            let prefix = line.substr(0, 2);

            switch(prefix) {
                case 'v ':
                    vertices.push(line.split(/\s+/).slice(1).map(Number));
                    break;
                case 'vt':
                    texCoords.push(line.split(/\s+/).slice(1).map(Number));
                    break;
                case 'vn':
                    vertexNorms.push(line.split(/\s+/).slice(1).map(Number));
                    break;
                case 'f ':
                    this.#processFace(vertices, texCoords, vertexNorms, line.split(/\s+/).slice(1), data);
                    break;
            }
        }

        data = new Float32Array(data);
        
        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        
        vbo.positionOffset = 0;
        vbo.positionSize = 3;

        vbo.texCoordOffset = vbo.positionSize * Float32Array.BYTES_PER_ELEMENT;
        vbo.texCoordSize = texCoords.length != 0 ? texCoords[0].length : 0;

        vbo.normalOffset = vbo.texCoordOffset + (vbo.texCoordSize * Float32Array.BYTES_PER_ELEMENT);
        vbo.normalSize = 3;

        vbo.stride = (vbo.positionSize + vbo.texCoordSize + vbo.normalSize) * Float32Array.BYTES_PER_ELEMENT;
        vbo.numItems = data.length/(vbo.positionSize + vbo.texCoordSize + vbo.normalSize);

        Mesh.registerMesh(meshName, vbo);

        var units = ["B", "KB", "MB"];
        var bytes = Float32Array.BYTES_PER_ELEMENT * data.length;
        var unit = 0;
        while(bytes/(1024**(unit + 1)) > 1) {
            unit++;
        }

        console.log("Created mesh: \"" + meshName + "\".\nSize: " + (bytes/(1024**unit)).toFixed(2) + " " + units[unit]);
    }

    static #processFace(vertices, texCoords, vertexNorms, face, data) {
        // has no UVs but has normals: 1//2 3//4 ...
        if (texCoords.length == 0 && vertexNorms.length != 0)
            return this.#processFaceWithNormals(vertices, vertexNorms, face, data);

        // has no normals but has UVs: 1/2// 3/4// ...
        if (texCoords.length != 0 && vertexNorms.length == 0)
            return this.#processFaceWithUVs(vertices, texCoords, face, data);

        // has no UVs and no normals: 1 2 3 ...
        if (texCoords.length == 0 && vertexNorms.length == 0)
            return this.#processFaceVerticesOnly(vertices, face, data);

        // otherwise everything is present: 1/2/3 3/4/5 ...
        return this.#processFaceWithAll(vertices, texCoords, vertexNorms, face, data);
    }

    static #processFaceWithNormals(vertices, vertexNorms, face, data) {
        let indices1 = face[0].split(/\/+/).map(num => Number(num));

        // triangularize all faces
        for(let i = 1; i + 1 < face.length; i++) {
            let indices2 = face[i].split(/\/+/).map(num => Number(num));
            let indices3 = face[i + 1].split(/\/+/).map(num => Number(num));

            data.push(...vertices[this.#getIndex(indices1[0], vertices.length)]);
            data.push(...vertexNorms[this.#getIndex(indices1[1], vertexNorms.length)]);

            data.push(...vertices[this.#getIndex(indices2[0], vertices.length)]);
            data.push(...vertexNorms[this.#getIndex(indices2[1], vertexNorms.length)]);

            data.push(...vertices[this.#getIndex(indices3[0], vertices.length)]);
            data.push(...vertexNorms[this.#getIndex(indices3[1], vertexNorms.length)]);
        }
    }
    static #processFaceWithUVs(vertices, texCoords, face, data) {
        let indices1 = face[0].split(/\/+/).filter(Boolean).map(num => Number(num));

        // triangularize all faces
        for(let i = 1; i + 1 < face.length; i++) {
            let indices2 = face[i].split(/\/+/).filter(Boolean).map(num => Number(num));
            let indices3 = face[i + 1].split(/\/+/).filter(Boolean).map(num => Number(num));

            data.push(...vertices[this.#getIndex(indices1[0], vertices.length)]);
            data.push(...texCoords[this.#getIndex(indices1[1], texCoords.length)]);
            data.push(0, 0, 0); // normals will be calculated later, placeholder

            data.push(...vertices[this.#getIndex(indices2[0], vertices.length)]);
            data.push(...texCoords[this.#getIndex(indices2[1], texCoords.length)]);
            data.push(0, 0, 0);

            data.push(...vertices[this.#getIndex(indices3[0], vertices.length)]);
            data.push(...texCoords[this.#getIndex(indices3[1], texCoords.length)]);
            data.push(0, 0, 0);
        }

        this.#computeNormals(data, 3 + texCoords[0].length + 3, 3 + texCoords[0].length);
    }
    static #processFaceVerticesOnly(vertices, face, data) {
        let indices1 = face[0].split(/\s+/).map(num => Number(num));

        // triangularize all faces
        for(let i = 1; i + 1 < face.length; i++) {
            let indices2 = face[i].split(/\s+/).map(num => Number(num));
            let indices3 = face[i + 1].split(/\s+/).map(num => Number(num));

            data.push(...vertices[this.#getIndex(indices1[0], vertices.length)]);
            data.push(0, 0, 0); // normals will be calculated later, placeholder

            data.push(...vertices[this.#getIndex(indices2[0], vertices.length)]);
            data.push(0, 0, 0);

            data.push(...vertices[this.#getIndex(indices3[0], vertices.length)]);
            data.push(0, 0, 0);
        }

        this.#computeNormals(data, 3 + 3, 3);
    }
    static #processFaceWithAll(vertices, texCoords, vertexNorms, face, data) {
        let indices1 = face[0].split(/\/+/).map(num => Number(num));

        // triangularize all faces
        for(let i = 1; i + 1 < face.length; i++) {
            let indices2 = face[i].split(/\/+/).map(num => Number(num));
            let indices3 = face[i + 1].split(/\/+/).map(num => Number(num));

            if(!indices1[2])
                console.log(face[0]);

            data.push(...vertices[this.#getIndex(indices1[0], vertices.length)]);
            data.push(...texCoords[this.#getIndex(indices1[1], texCoords.length)]);
            data.push(...vertexNorms[this.#getIndex(indices1[2], vertexNorms.length)]);

            data.push(...vertices[this.#getIndex(indices2[0], vertices.length)]);
            data.push(...texCoords[this.#getIndex(indices2[1], texCoords.length)]);
            data.push(...vertexNorms[this.#getIndex(indices2[2], vertexNorms.length)]);

            data.push(...vertices[this.#getIndex(indices3[0], vertices.length)]);
            data.push(...texCoords[this.#getIndex(indices3[1], texCoords.length)]);
            data.push(...vertexNorms[this.#getIndex(indices3[2], vertexNorms.length)]);
        }
    }
    static #getIndex(index, length) {
        return index < 0 ? length + index : index - 1;
    }

    // Computes per-face normals i.e flat shading
    static #computeNormals(data, size, offset) {
        // look at each group of three vertices
        for(let i = 0; i + 3*size < data.length; i += 3*size) {
            let x1 = data[i];
            let y1 = data[i + 1];
            let z1 = data[i + 2];

            let x2 = data[i + size];
            let y2 = data[i + 1 + size];
            let z2 = data[i + 2 + size];

            let x3 = data[i + 2*size];
            let y3 = data[i + 1 + 2*size];
            let z3 = data[i + 2 + 2*size];

            let v1x = x2 - x1;
            let v1y = y2 - y1;
            let v1z = z2 - z1;

            let v2x = x3 - x1;
            let v2y = y3 - y1;
            let v2z = z3 - z1;

            let nx = v1y*v2z - v1z*v2y;
            let ny = v1z*v2x - v1x*v2z;
            let nz = v1x*v2y - v1y*v2x;

            let magnitude = Math.sqrt(nx**2 + ny**2 + nz**2);

            nx/=magnitude;
            ny/=magnitude;
            nz/=magnitude;

            data[i + offset] = nx;
            data[i + 1 + offset] = ny;
            data[i + 2 + offset] = nz;

            data[i + size + offset] = nx;
            data[i + 1 + size + offset] = ny;
            data[i + 2 + size + offset] = nz;

            data[i + 2*size + offset] = nx;
            data[i + 1 + 2*size + offset] = ny;
            data[i + 2 + 2*size + offset] = nz;
        }
    }
}