import ICollidable from "../interface/icollidable.js"
import DirectionDetector from "./directionDetector.js"

class Brick extends ICollidable {
  static COLOR = "#999"

  constructor(x, y, width, height, options = {}) {
    super()
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.destroyed = false
    this.hitCount = options.hitCount || 1
    this.image = options.image || null
    this.indestructible = options.indestructible || false
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
    const direction = DirectionDetector.detect(ball, this)
    if (direction === "LEFT" || direction === "RIGHT") ball.bounceX()
    else ball.bounceY()

    if (!this.indestructible) {
      this.hitCount--
      if (this.hitCount <= 0) this.destroyed = true
    }
  }


  draw(ctx) {
    if (!this.destroyed) {
      if (this.image && this.image.complete) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
      } else {
        ctx.fillStyle = Brick.COLOR
        ctx.fillRect(this.x, this.y, this.width, this.height)
      }
    }
  }
}

export default Brick