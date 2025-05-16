import Direction from "./direction.js"

class Ball {
    static RADIUS = 10
    static COLOR = "#DD3333"

    constructor(x, y, dx = 2, dy = -2, canvas, paddle) {
        this.x = x
        this.y = y
        this.dx = dx
        this.dy = dy
        this.canvas = canvas
        this.paddle = paddle
        this.die = false
    }

    move() {
        if (this.die) return

        this.checkWallCollision()
        this.checkPaddleCollision()

        this.x += this.dx
        this.y += this.dy
    }

    isDead() {
        return this.die
    }

    bounceX() {
        this.dx = -this.dx
    }

    bounceY() {
        this.dy = -this.dy
    }

    checkWallCollision() {
        const { width, height } = this.canvas

        if (this.x < Ball.RADIUS || this.x > width - Ball.RADIUS) {
            this.bounceX()
        }
        if (this.y < Ball.RADIUS) {
            this.bounceY()
        }
        if (this.y + Ball.RADIUS > height) {
            this.die = true
        }
    }

    checkPaddleCollision() {
        const direction = this.paddle.direction

        if (direction.checkCollision(this, this.paddle, Ball.RADIUS)) {
            if (direction === Direction.TOP || direction === Direction.BOTTOM) {
                this.bounceY()
            } else {
                this.bounceX()
            }
        }
    }

    draw(ctx) {
        this.move()
        ctx.beginPath()
        ctx.arc(this.x, this.y, Ball.RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = Ball.COLOR
        ctx.fill()
        ctx.closePath()
    }
}


export default Ball