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
    handleItem(item) {
    for (const obj of this.collidables) {
        if (obj.checkCollisionWithItem && obj.checkCollisionWithItem(item)) {
            obj.onCollisionWithItem?.(item)
        }
    }
    }

    reset() {
        this.collidables = []
    }
}

export default CollisionManager
