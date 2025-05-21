import ICollidable from "../interface/icollidable.js"
import DirectionDetector from "./directionDetector.js"

class Brick extends ICollidable {
    static COLOR = "#999"

    constructor(x, y, width, height) {
        super()
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.destroyed = false
    }

    checkCollision(ball) {
        if (this.destroyed) return false

        const r = ball.constructor.RADIUS
        const ballLeft = ball.x - r
        const ballRight = ball.x + r
        const ballTop = ball.y - r
        const ballBottom = ball.y + r

        const brickLeft = this.x
        const brickRight = this.x + this.width
        const brickTop = this.y
        const brickBottom = this.y + this.height

        return (
            ballRight > brickLeft &&
            ballLeft < brickRight &&
            ballBottom > brickTop &&
            ballTop < brickBottom
        )
    }

    onCollision(ball) {
        this.destroyed = true
        const direction = DirectionDetector.detect(ball, this)
        if (direction === "LEFT" || direction === "RIGHT") ball.bounceX()
        else ball.bounceY()
    }

    draw(ctx) {
        if (!this.destroyed) {
            ctx.fillStyle = Brick.COLOR
            ctx.fillRect(this.x, this.y, this.width, this.height)
        }
    }
}

export default Brick