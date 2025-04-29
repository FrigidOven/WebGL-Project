class MovementController {
    #entity;
    forwardKey;
    leftKey;
    backwardKey;
    rightKey;
    upKey;
    downKey;
    sprintKey;
    speed;
    sprintSpeed;

    constructor(entity, forwardKey, leftKey, backwardKey, rightKey, upKey, downKey, sprintKey, speed, sprintSpeed) {
        this.#entity = entity;
        this.forwardKey = forwardKey;
        this.leftKey = leftKey;
        this.backwardKey = backwardKey;
        this.rightKey = rightKey;
        this.upKey = upKey;
        this.downKey = downKey;
        this.sprintKey = sprintKey;
        this.speed = speed;
        this.sprintSpeed = sprintSpeed;
        
        this.#entity.components.push(this);
    }

    update(dt) {
        let xyz  = this.#entity.transform.localCoordinates;
        let dxyz = [0, 0, 0];

        let speed = Keyboard.isKeyDown(this.sprintKey) ? this.sprintSpeed : this.speed;

        if (Keyboard.isKeyDown(this.forwardKey)) {
            let dir = this.#entity.transform.backward;
            dxyz[0] += dir[0]; dxyz[1] += dir[1]; dxyz[2] += dir[2];
        }
        if (Keyboard.isKeyDown(this.leftKey)) {
            let dir = this.#entity.transform.left;
            dxyz[0] += dir[0]; dxyz[1] += dir[1]; dxyz[2] += dir[2];
        }
        if (Keyboard.isKeyDown(this.backwardKey)) {
            let dir = this.#entity.transform.forward;
            dxyz[0] += dir[0]; dxyz[1] += dir[1]; dxyz[2] += dir[2];
        }
        if (Keyboard.isKeyDown(this.rightKey)) {
            let dir = this.#entity.transform.right;
            dxyz[0] += dir[0]; dxyz[1] += dir[1]; dxyz[2] += dir[2];
        }
        if (Keyboard.isKeyDown(this.upKey)) {
            dxyz[0] += 0; dxyz[1] += 1; dxyz[2] += 0;
        }
        if (Keyboard.isKeyDown(this.downKey)) {
            dxyz[0] += 0; dxyz[1] += -1; dxyz[2] += 0;
        }

        let magnitude = Math.sqrt(dxyz[0]**2 + dxyz[1]**2 + dxyz[2]**2);
        if(magnitude > 0) dxyz = dxyz.map(num => num/magnitude);

        this.#entity.transform.localCoordinates = [
            xyz[0] + speed*dxyz[0]*dt,
            xyz[1] + speed*dxyz[1]*dt,
            xyz[2] + speed*dxyz[2]*dt
        ];
    }
}