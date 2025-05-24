class ICollidable {
    checkCollision(ball) {
        throw new Error("checkCollision not implemented")
    }

    onCollision(ball) {
        throw new Error("onCollision not implemented")
    }
}

export default ICollidable