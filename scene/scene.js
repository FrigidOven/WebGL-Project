class Scene {
    #entities;

    #camera;
    #cameraParent;

    #light;
    #lightParent;
    #ambientLight;

    #previousTime;
    #currentTime;

    constructor() {
        this.#entities = [];

        this.#camera = new Camera(new Transform(0), 60, 16/9, 0.1, 1000);
        this.#cameraParent = this.createEntity();
        new MovementController(this.#cameraParent, 'w', 'a', 's', 'd', ' ', 'Control', 'Shift', 7.5, 15);
        new RotationController(this.#cameraParent, 0.1);
        this.#cameraParent.transform.addChild(this.#camera.transform);

        this.#light = new Light(new Transform(1), /*[201, 226, 255]*/ [255, 255, 254], 1);
        this.#lightParent = this.createEntity();
        new KeyboardRotationController(this.#lightParent, 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 60);
        this.#lightParent.transform.addChild(this.#light.transform);

        this.#cameraParent.transform.coordinates = [0, 5, 15];
        this.#light.transform.coordinates = [0, 10, 1000];

        // Roughly aligns with sun in skybox.
        this.#lightParent.transform.localRotation = Quaternion.multiply(
            Quaternion.angleAxis(66, 0, 1, 0),
            Quaternion.angleAxis(-45, 1, 0, 0)
        );


        var rustyMat = new Material(
            [255, 255, 255],
            1,
            1,
            "rusty",
            "rustyNormal",
            "rustyMetallic",
            "rustyRoughness",
            "default"
        );
        var rustyMatUnlit = new Material(
            [255, 255, 255],
            1,
            1,
            "rusty",
            "rustyNormal",
            "rustyMetallic",
            "rustyRoughness",
            "unlitTextured"
        );

        var brickMat = new Material(
            [255, 255, 255],
            0,
            0.0001,
            "brick",
            "brickNormal",
            null,
            null,
            "default"
        );
        var brickMatUnlit = new Material(
            [255, 255, 255],
            0,
            0.0001,
            "brick",
            "brickNormal",
            null,
            null,
            "unlitTextured"
        );

        var chairMat = new Material(
            [255, 255, 255],
            0,
            0.0001,
            "chair",
            null,
            null,
            null,
            "default"
        );
        var chairMatUnlit = new Material(
            [255, 255, 255],
            0,
            0.0001,
            "chair",
            null,
            null,
            null,
            "unlitTextured"
        );

        var tile = new Material(
            [255, 255, 255],
            1,
            1,
            "tile",
            "tileNormal",
            "tileMetallic",
            "tileRoughness",
            "default"
        );
        var tileUnlit = new Material(
            [255, 255, 255],
            1,
            1,
            "tile",
            "tileNormal",
            "tileMetallic",
            "tileRoughness",
            "unlitTextured"
        );

        var metalTile = new Material(
            [255, 255, 255],
            1,
            1,
            "metalTile",
            "metalTileNormal",
            "metalTileMetallic",
            "metalTileRoughness",
            "default"
        );
        var metalTileUnlit = new Material(
            [255, 255, 255],
            1,
            1,
            "metalTile",
            "metalTileNormal",
            "metalTileMetallic",
            "metalTileRoughness",
            "unlitTextured"
        );

        var plasticMat = new Material(
            [245, 242, 208],
            0,
            0.00001,
            null,
            null,
            null,
            null,
            "default"
        );
        var plasticMatUnlit = new Material(
            [245, 242, 208],
            0,
            0.00001,
            null,
            null,
            null,
            null,
            "unlitTextured"
        );

        var redMetal = new Material(
            [128, 0, 0],
            1.0,
            0.8,
            null,
            null,
            null,
            null,
            "default"
        );
        var redMetalUnlit = new Material(
            [128, 0, 0],
            1.0,
            0.8,
            null,
            null,
            null,
            null,
            "unlitTextured"
        );

        var skyboxMat = new Material(
            [255, 255, 255],
            0.0,
            0,
            null,
            null,
            null,
            null,
            "skybox"
        );
        var wireframe = new Material(
            [255, 255, 255],
            1,
            1,
            null,
            null,
            null,
            null,
            "wireframe"
        );

        this.createEntity("skybox", skyboxMat).transform.localDimensions = [5000, 5000, 5000];

        var scene = this.createEntity();
        new Rotator(scene, 0, 1, 0, 10);

        var dist = 6;
        var torusParent = this.createEntity();
        scene.transform.addChild(torusParent.transform);

        var rustyTorusParent = this.createEntity();
        rustyTorusParent.transform.localRotation = Quaternion.angleAxis(120, 0, 1, 0);

        var metalTileTorusParent = this.createEntity();
        metalTileTorusParent.transform.localRotation = Quaternion.angleAxis(240, 0, 1, 0);

        torusParent.transform.addChild(rustyTorusParent.transform);
        torusParent.transform.addChild(metalTileTorusParent.transform);

        var brickTorus = this.createEntity("torus", brickMat);
        torusParent.transform.addChild(brickTorus.transform);
        brickTorus.transform.localCoordinates = [0, 0, dist];
        
        var rustyTorus = this.createEntity("torus", rustyMat);
        rustyTorusParent.transform.addChild(rustyTorus.transform);
        rustyTorus.transform.localCoordinates = [0, 0, dist];
  
        var metalTileTorus = this.createEntity("torus", metalTile);
        metalTileTorusParent.transform.addChild(metalTileTorus.transform);
        metalTileTorus.transform.localCoordinates = [0, 0, dist];
        
        new Rotator(brickTorus, 0, 1, 1, 90);
        new Rotator(rustyTorus, 1, -1, 0, 90);
        new Rotator(metalTileTorus, 1, 1, 0, 90);

        new MaterialSwitcher(brickTorus, 'm', [brickMat, brickMatUnlit, wireframe]);
        new MaterialSwitcher(rustyTorus, 'm', [rustyMat, rustyMatUnlit, wireframe]);
        new MaterialSwitcher(metalTileTorus, 'm', [metalTile, metalTileUnlit, wireframe]);

        torusParent.transform.localCoordinates = [0, 1.5, 0];
        new Rotator(torusParent, 0, 1, 0, 90/dist);

        var skull = this.createSkull([rustyMat, rustyMatUnlit, wireframe], [redMetal, redMetalUnlit, wireframe]);
        skull.transform.coordinates = [0, 0, 0];
        scene.transform.addChild(skull.transform);

        var leftPawn = this.createPawn([plasticMat, plasticMatUnlit, wireframe]);
        leftPawn.transform.coordinates = [-2.5, 0, 0];
        new Rotator(leftPawn, 0, 1, 0, 90);
        scene.transform.addChild(leftPawn.transform);

        var rightPawn = this.createPawn([plasticMat, plasticMatUnlit, wireframe]);
        rightPawn.transform.coordinates = [2.5, 0, 0];
        new Rotator(rightPawn, 0, -1, 0, 90);
        scene.transform.addChild(rightPawn.transform);

        var chair = this.createEntity("chair", chairMat);
        chair.transform.localDimensions = [0.01, 0.01, 0.01];
        chair.transform.localCoordinates = [0, 13, 12];
        new MaterialSwitcher(chair, 'm', [chairMat, chairMatUnlit, wireframe]);

        scene.transform.addChild(chair.transform);

        scene.transform.localCoordinates = [0, 1.75, 0];


        var floor = this.createEntity("floor", tile);
        new MaterialSwitcher(floor, 'm', [tile, tileUnlit, wireframe]);

        this.#ambientLight = new Float32Array([0.1, 0.1, 0.1]);

        this.#previousTime = 0;
        this.#currentTime = 0;

        this.update();
    }

    createEntity(meshName, material) {
        this.#entities.push(new Entity(this.#entities.length + 1, new Mesh(meshName), material));
        return this.#entities[this.#entities.length - 1];
    }

    createPawn(materials) {
        var pawn = this.createEntity();

        var sphere = this.createEntity("sphere", materials[0]);
        sphere.transform.localDimensions = [0.25, 0.25, 0.25];
        sphere.transform.localCoordinates = [0, 1.3, 0];
        new MaterialSwitcher(sphere, 'm', materials);

        var cone = this.createEntity("cone", materials[0]);
        cone.transform.localDimensions = [1, 2, 1];
        new MaterialSwitcher(cone, 'm', materials);

        var cube = this.createEntity("cube", materials[0]);
        cube.transform.localDimensions = [1.5, 1, 1.5];
        cube.transform.localCoordinates = [0, -1.3, 0];
        new MaterialSwitcher(cube, 'm', materials);

        pawn.transform.addChild(sphere.transform);
        pawn.transform.addChild(cone.transform);
        pawn.transform.addChild(cube.transform);

        return pawn;
    }
    createSkull(skullMats, eyeMats) {
        var skullHolder = this.createEntity();

        var skull =  this.createEntity("skull", skullMats[0]);
        skullHolder.transform.addChild(skull.transform);
        skull.transform.localRotation = Quaternion.angleAxis(-90, 1, 0, 0);
        skull.transform.localDimensions = [0.2, 0.2, 0.2];
        new MaterialSwitcher(skull, 'm', skullMats);

        var leftEye = this.createEntity("sphere", eyeMats[0]);
        skullHolder.transform.addChild(leftEye.transform);
        leftEye.transform.localDimensions = [0.25, 0.25, 0.25];
        leftEye.transform.localCoordinates = [0.8, 2.7, 2];
        new MaterialSwitcher(leftEye, 'm', eyeMats);

        var rightEye = this.createEntity("sphere", eyeMats[0]);
        skullHolder.transform.addChild(rightEye.transform);
        rightEye.transform.localDimensions = [0.25, 0.25, 0.25];
        rightEye.transform.localCoordinates = [-0.8, 2.7, 2];
        new MaterialSwitcher(rightEye, 'm', eyeMats);

        return skullHolder;
    }

    update() {
        this.#currentTime = Date.now();
        let dt = (this.#currentTime - this.#previousTime)/1000;
        this.#previousTime = this.#currentTime;

        for (let i = 0; i < this.#entities.length; i++)
            this.#entities[i].update(dt);

        this.clear();
        this.draw();

        Mouse.update();
        requestAnimationFrame(this.update.bind(this));
    }

    clear() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    draw() {
        var cameraMatrix = this.#camera.matrix;
        var cameraPos = new Float32Array(this.#camera.transform.coordinates);
        var lightPos = new Float32Array(this.#light.transform.coordinates);

        for(let entity of this.#entities) {
            entity.draw(cameraMatrix, cameraPos, lightPos, this.#light.color, this.#light.intensity, this.#ambientLight);
        }
    }
}