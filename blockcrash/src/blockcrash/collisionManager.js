class CollisionManager {
    constructor() {
        this.collidables = []
    }

    add(obj) {
        this.collidables.push(obj)
    }

    handle(ball) {
        const hit = this.collidables.find(obj => obj.checkCollision(ball))
        if (hit) hit.onCollision(ball)
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
