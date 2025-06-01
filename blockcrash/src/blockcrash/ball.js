class Ball {
    static RADIUS = 10
    static COLOR = "#DD3333"

    constructor(x, y, dx = 2, dy = -2, canvas) {
        this.x = x
        this.y = y
        this.dx = dx
        this.dy = dy
        this.canvas = canvas
        this.die = false
        this.collisionManager = null
    }

    setCollisionManager(manager) {
        this.collisionManager = manager
    }

    move() {
        if (this.die) return

        this.checkWallCollision()

        if (this.collisionManager) {
            this.collisionManager.handle(this)
        }

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

        if (
            this.x - Ball.RADIUS < 0 || this.x + Ball.RADIUS > width ||
            this.y - Ball.RADIUS < 0 || this.y + Ball.RADIUS > height
        ) {
            this.die = true
        }
    }
    adjustSpeed(factor) {
        this.dx *= factor
        this.dy *= factor
    }

    bounceWithAngle(offsetRatio) {
        const speed = Math.sqrt(this.dx ** 2 + this.dy ** 2)
        const maxAngle = Math.PI / 3  // 최대 60도

        const angle = offsetRatio * maxAngle  // -1 ~ 1 범위
        this.dx = speed * Math.sin(angle)
        this.dy = -Math.abs(speed * Math.cos(angle))  // 항상 위로 반사
    }


    draw(ctx) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, Ball.RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = Ball.COLOR
        ctx.fill()
        ctx.closePath()
    }
}

export default Ball
