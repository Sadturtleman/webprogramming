import Direction from "./direction.js"

class Paddle {
    static DEFAULT_WIDTH = 75
    static DEFAULT_HEIGHT = 10
    static COLOR = "#0095DD"
    static MARGIN = 10
    static #instance = null

    constructor(canvas) {
        if (Paddle.#instance) throw new Error("Paddle is Singleton")

        this.canvas = canvas
        this.x = 0
        this.y = 0
        this.width = Paddle.DEFAULT_WIDTH
        this.height = Paddle.DEFAULT_HEIGHT
        this.direction = Direction.BOTTOM

        this.bindMouseMove()
        Paddle.#instance = this
    }

    static getInstance(canvas) {
        return Paddle.#instance || new Paddle(canvas)
    }

    bindMouseMove() {
        $(this.canvas).on("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top

            // 각 방향별 거리 계산
            const distances = new Map([
                [Direction.TOP, mouseY],
                [Direction.BOTTOM, this.canvas.height - mouseY],
                [Direction.LEFT, mouseX],
                [Direction.RIGHT, this.canvas.width - mouseX],
            ])

            // 가장 가까운 방향 선택
            let nearestDirection = null
            let minDistance = Infinity

            for (const [dir, dist] of distances) {
                if (dist < minDistance) {
                    minDistance = dist
                    nearestDirection = dir
                }
            }

            this.setPosition(nearestDirection, mouseX, mouseY)
            this.clamp()
        })
    }

    setPosition(direction, mouseX, mouseY) {
        this.direction = direction

        direction.setPosition(this, mouseX, mouseY, {
            DEFAULT_WIDTH: Paddle.DEFAULT_WIDTH,
            DEFAULT_HEIGHT: Paddle.DEFAULT_HEIGHT,
            MARGIN: Paddle.MARGIN,
        })
    }

    clamp() {
        this.x = Math.max(0, Math.min(this.x, this.canvas.width - this.width))
        this.y = Math.max(0, Math.min(this.y, this.canvas.height - this.height))
    }

    draw(ctx) {
        ctx.beginPath()
        ctx.rect(this.x, this.y, this.width, this.height)
        ctx.fillStyle = Paddle.COLOR
        ctx.fill()
        ctx.closePath()
    }
}


export default Paddle