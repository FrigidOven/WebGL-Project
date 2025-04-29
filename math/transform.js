class Transform {
    #id;
    
    #parent;
    #children;

    #matrix;
    
    #localScale;
    #scale;

    #rotation;

    #localPosition;
    #position;

    #updateCallbacks;

    constructor(id, parent) {
        this.#id = id;

        this.#parent = parent;
        this.#children = new Map();

        this.#localScale = new Mat4();
        this.#rotation = new Quaternion();
        this.#localPosition = new Mat4();

        this.#updateCallbacks = [];

        this.#updateMatrices();

        if(parent != null)
            parent.addChild(this);
    }

    performOnUpdate(callback) {
        this.#updateCallbacks.push(callback);
    }

    addChild(child) {
        if (child.parent == this)
            return;

        var childDimensions = child.dimensions;
        var childRotation = child.rotation;
        var childCoordinates = child.coordinates;

        child.#parent = this;
        this.#children.set(child.#id, child);

        child.dimensions = childDimensions;
        child.rotation = childRotation;
        child.coordinates = childCoordinates;
    }

    removeChild(child) {
        if (!this.#children.has(child.#id))
            return

        var childDimensions = child.dimensions;
        var childRotation = child.rotation;
        var childCoordinates = child.coordinates;

        child.#parent = null;
        this.#children.delete(child.#id);

        child.dimensions = childDimensions;
        child.rotation = childRotation;
        child.coordinates = childCoordinates;
    }

    get matrix() { return this.#matrix; }

    get up() { return Mat4.vectorMultiply([0, 1, 0], this.#rotation.matrix); }
    get down() { return Mat4.vectorMultiply([0, -1, 0], this.#rotation.matrix); }
    get right() { return Mat4.vectorMultiply([1, 0, 0], this.#rotation.matrix); }
    get left() { return Mat4.vectorMultiply([-1, 0, 0], this.#rotation.matrix); }
    get forward() { return Mat4.vectorMultiply([0, 0, 1], this.#rotation.matrix); }
    get backward() { return Mat4.vectorMultiply([0, 0, -1], this.#rotation.matrix); }
    

    #updateMatrices() {
        if (this.#parent != null) {
            this.#scale    = Mat4.multiply(this.#parent.#scale, this.#localScale);
            this.#position = Mat4.multiply(this.#parent.matrix, this.#localPosition);
        } else {
            this.#scale    = this.#localScale;
            this.#position = this.#localPosition;
        }

        this.#matrix = Mat4.compose(this.#position, this.#rotation.matrix, this.#scale);

        for(let entry of this.#children.entries())
            entry[1].#updateMatrices();

        for(let callback of this.#updateCallbacks)
            callback();
    }

    /*=========================================================================
                                      Scale
    =========================================================================*/
    
    // Local Scale
    set localDimensions(xyz) {
        this.#localScale.columns[0]  = xyz[0];
        this.#localScale.columns[5]  = xyz[1];
        this.#localScale.columns[10] = xyz[2];

        this.#updateMatrices();
    }
    get localDimensions() {
        return [this.#localScale.columns[0], this.#localScale.columns[5], this.#localScale.columns[10]];
    }
    get localScaleMatrix() {
        return this.#localScale;
    }

    // True Scale
    set dimensions(xyz) {
        if (this.#parent == null)
            this.localDimensions = xyz;
        else
            this.localDimensions = Mat4.vectorMultiply(xyz, this.#parent.scaleMatrix.inverse());
    }
    get dimensions() {
        return [this.#scale.columns[0], this.#scale.columns[5], this.#scale.columns[10]];
    }
    get scaleMatrix() {
        return this.#scale;
    }

    /*=========================================================================
                                    Rotation
    =========================================================================*/

    // Local Rotation
    set localRotation(quaternion) {
        this.#rotation = quaternion;
        this.#updateMatrices();
    }

    // True Rotation
    set rotation(quaternion) {
        this.#rotation = this.#parent == null ? quaternion : Quaternion.multiply(quaternion, this.#parent.rotation.inverse())
        this.#updateMatrices();
    }
    get rotation() {
        return this.#rotation;
    }

    /*=========================================================================
                                    Position
    =========================================================================*/

    // Local Position
    set localCoordinates(xyz) {
        this.#localPosition.columns[12] = xyz[0];
        this.#localPosition.columns[13] = xyz[1];
        this.#localPosition.columns[14] = xyz[2];

        this.#updateMatrices();
    }
    get localCoordinates() {
        return [this.#localPosition.columns[12], this.#localPosition.columns[13], this.#localPosition.columns[14]];
    }
    get localPositionMatrix() {
        return this.#localPosition;
    }

    // True Position
    set coordinates(xyz) {
        if(this.#parent == null)
            this.localCoordinates = xyz;
        else
            this.localCoordinates = Mat4.vectorMultiply(xyz, this.#parent.#matrix.inverse());  
    }
    get coordinates() {
        return [this.#position.columns[12], this.#position.columns[13], this.#position.columns[14]];
    }
    get positionMatrix() {
        return this.#position;
    }
}