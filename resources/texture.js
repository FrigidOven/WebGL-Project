class Texture {
    static #textures;

    static init() {
        Texture.#textures = new Map();
        Texture.#loadDefaults();

        Texture.#loadAlbedoMap("resources/textures/brick.png", "brick");
        Texture.#loadNormalMap("resources/textures/brickNormal.png", "brickNormal");

        Texture.#loadAlbedoMap("resources/textures/rusty.png", "rusty");
        Texture.#loadNormalMap("resources/textures/rustyNormal.png", "rustyNormal");
        Texture.#loadMetallicMap("resources/textures/rustyMetallic.png", "rustyMetallic");
        Texture.#loadRoughnessMap("resources/textures/rustyRoughness.png", "rustyRoughness");

        Texture.#loadAlbedoMap("resources/textures/tile.png", "tile");
        Texture.#loadNormalMap("resources/textures/tileNormal.png", "tileNormal");
        Texture.#loadMetallicMap("resources/textures/tileMetallic.png", "tileMetallic");
        Texture.#loadRoughnessMap("resources/textures/tileRoughness.png", "tileRoughness");

        Texture.#loadAlbedoMap("resources/textures/metalTile.png", "metalTile");
        Texture.#loadNormalMap("resources/textures/metalTileNormal.png", "metalTileNormal");
        Texture.#loadMetallicMap("resources/textures/metalTileMetallic.png", "metalTileMetallic");
        Texture.#loadRoughnessMap("resources/textures/metalTileRoughness.png", "metalTileRoughness");

        Texture.#loadAlbedoMap("resources/textures/chair.png", "chair");

        Texture.#loadAlbedoMap("resources/textures/Skull.jpg", "skull");

        Texture.#loadCubeMap("resources/textures/cubemap/", "posx.jpg", "negx.jpg", "posy.jpg", "negy.jpg", "posz.jpg", "negz.jpg");
    }

    static #loadCubeMap(path, posx, negx, posy, negy, posz, negz) {
        gl.activeTexture(gl.TEXTURE4);
        var texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.REPEAT); 
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        var px = new Image();
        px.onload = () => {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, px);
        }
        px.src = path + posx;

        var nx = new Image();
        nx.onload = () => {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, nx);
        }
        nx.src = path + negx;

        var py = new Image();
        py.onload = () => {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, py);
        }
        py.src = path + posy;

        var ny = new Image();
        ny.onload = () => {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ny);
        }
        ny.src = path + negy;

        var pz = new Image();
        pz.onload = () => {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pz);
        }
        pz.src = path + posz;

        var nz = new Image();
        nz.onload = () => {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, nz);
        }
        nz.src = path + negz;
    }

    static setTextures(albedo, normal, metallic, roughness) {
        gl.activeTexture(gl.TEXTURE0);
        if (Texture.#textures.has(albedo))
            gl.bindTexture(gl.TEXTURE_2D, Texture.#textures.get(albedo));
        else
            gl.bindTexture(gl.TEXTURE_2D, Texture.#textures.get("defaultAlbedo"));

        gl.activeTexture(gl.TEXTURE1);
        if (Texture.#textures.has(normal))
            gl.bindTexture(gl.TEXTURE_2D, Texture.#textures.get(normal));
        else
            gl.bindTexture(gl.TEXTURE_2D, Texture.#textures.get("defaultNormal"));

        gl.activeTexture(gl.TEXTURE2);
        if (Texture.#textures.has(metallic))
            gl.bindTexture(gl.TEXTURE_2D, Texture.#textures.get(metallic));
        else
            gl.bindTexture(gl.TEXTURE_2D, Texture.#textures.get("defaultMetallic"));

        gl.activeTexture(gl.TEXTURE3);
        if (Texture.#textures.has(roughness))
            gl.bindTexture(gl.TEXTURE_2D, Texture.#textures.get(roughness));
        else
            gl.bindTexture(gl.TEXTURE_2D, Texture.#textures.get("defaultRoughness"));
    }

    static #loadDefaults() {
        // Default Albedo
        gl.activeTexture(gl.TEXTURE0);
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
        Texture.#textures.set("defaultAlbedo", texture);

        // Default Normal
        gl.activeTexture(gl.TEXTURE1);
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 255]));
        Texture.#textures.set("defaultNormal", texture);

        // Default Metallic
        gl.activeTexture(gl.TEXTURE2);
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 1, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array([255]));
        Texture.#textures.set("defaultMetallic", texture);

        // Default Roughness
        gl.activeTexture(gl.TEXTURE3);
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 1, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array([0]));
        Texture.#textures.set("defaultRoughness", texture);
    }

    static #loadAlbedoMap(source, name) {
        gl.activeTexture(gl.TEXTURE0);
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

        var image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            Texture.#textures.set(name, texture);
        };
        image.src = source;

        Texture.#textures.set(name, Texture.#textures.get("defaultAlbedo"));
    }

    static #loadNormalMap(source, name) {
        gl.activeTexture(gl.TEXTURE1);
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 255]));

        var image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            Texture.#textures.set(name, texture);
        };
        image.src = source;

        Texture.#textures.set(name, Texture.#textures.get("defaultNormal"));
    }

    static #loadMetallicMap(source, name) {
        gl.activeTexture(gl.TEXTURE2);
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 1, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array([255]));

        var image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, image);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            Texture.#textures.set(name, texture);
        };
        image.src = source;

        Texture.#textures.set(name, Texture.#textures.get("defaultMetallic"));
    }

    static #loadRoughnessMap(source, name) {
        gl.activeTexture(gl.TEXTURE3);
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 1, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array([0]));

        var image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, image);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            Texture.#textures.set(name, texture);
        };
        image.src = source;

        Texture.#textures.set(name, Texture.#textures.get("defaultRoughness"));
    }
}