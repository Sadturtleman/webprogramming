import { Paddle } from "./paddle.js"

export class Ball {
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
        console.log(paddle)
    }

    move() {
        if (this.die) return

        this.checkWallCollision(this.canvas)
        this.checkPaddleCollision(this.paddle, this.canvas)

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

    checkWallCollision(canvas) {
        if (this.x < Ball.RADIUS || this.x > canvas.width - Ball.RADIUS) {
            this.bounceX()
        }
        if (this.y < Ball.RADIUS) {
            this.bounceY()
        }

        if (this.y + Ball.RADIUS > canvas.height){
            return this.die = true
        }
    }

    checkPaddleCollision(paddle) {
        const ballBottom = this.y + Ball.RADIUS
        const ballTop = this.y - Ball.RADIUS
        const ballLeft = this.x - Ball.RADIUS
        const ballRight = this.x + Ball.RADIUS

        switch (paddle.direction) {
            case "top":
            if (
                ballTop <= paddle.y + paddle.height &&
                this.y >= paddle.y &&
                this.x >= paddle.x &&
                this.x <= paddle.x + paddle.width
            ) {
                this.bounceY()
            }
            break

            case "bottom":
            if (
                ballBottom >= paddle.y &&
                this.y <= paddle.y + paddle.height &&
                this.x >= paddle.x &&
                this.x <= paddle.x + paddle.width
            ) {
                this.bounceY()
            }
            break

            case "left":
            if (
                ballLeft <= paddle.x + paddle.width &&
                this.x >= paddle.x &&
                this.y >= paddle.y &&
                this.y <= paddle.y + paddle.height
            ) {
                this.bounceX()
            }
            break

            case "right":
            if (
                ballRight >= paddle.x &&
                this.x <= paddle.x + paddle.width &&
                this.y >= paddle.y &&
                this.y <= paddle.y + paddle.height
            ) {
                this.bounceX()
            }
            break
        }

        if (
            ballBottom > this.canvas.height ||
            ballTop < 0 ||
            ballRight > this.canvas.width ||
            ballLeft < 0
        ) {
            return true
        }

        return false
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
