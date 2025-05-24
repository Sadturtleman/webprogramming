class CollisionManager {
    constructor() {
        this.collidables = []
    }

    add(obj) {
        this.collidables.push(obj)
    }

    handle(ball) {
        for (const obj of this.collidables) {
            if (obj.checkCollision(ball)) {
                obj.onCollision(ball)
            }
        }
    }
}

export default CollisionManager