import Direction from "../interface/direction.js"
import ICollidable from "../interface/icollidable.js"

class Paddle extends ICollidable {
    static DEFAULT_WIDTH = 150
    static DEFAULT_HEIGHT = 60
    static COLOR = "#0095DD"
    static MARGIN = 10
    static #instance = null

    static IMAGE_PATHS = {
        [Direction.TOP]: "assets/paddleboard1.png",
        [Direction.BOTTOM]: "assets/paddleboard2.png",
        [Direction.LEFT]: "assets/paddleboard4.png",
        [Direction.RIGHT]: "assets/paddleboard3.png",
    }

    static IMAGES = {}

    // ✅ 모든 방향 이미지 미리 로딩
    static loadMainImage() {
        for (const direction of Object.values(Direction)) {
            if (!Paddle.IMAGES[direction]) {
                Paddle.loadImageForDirection(direction)
            }
        }
    }

    static loadImageForDirection(direction) {
        const path = Paddle.IMAGE_PATHS[direction]
        const img = new Image()
        img.src = path
        Paddle.IMAGES[direction] = img
    }

    constructor(canvas) {
        super()
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

            const distances = new Map([
                [Direction.TOP, mouseY],
                [Direction.BOTTOM, this.canvas.height - mouseY],
                [Direction.LEFT, mouseX],
                [Direction.RIGHT, this.canvas.width - mouseX],
            ])

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

        const { DEFAULT_WIDTH, DEFAULT_HEIGHT, MARGIN } = Paddle

        if (direction === Direction.TOP) {
            this.width = DEFAULT_WIDTH
            this.height = DEFAULT_HEIGHT
            this.y = MARGIN
            this.x = mouseX - this.width / 2
        } else if (direction === Direction.BOTTOM) {
            this.width = DEFAULT_WIDTH
            this.height = DEFAULT_HEIGHT
            this.y = this.canvas.height - this.height - MARGIN
            this.x = mouseX - this.width / 2
        } else if (direction === Direction.LEFT) {
            this.width = DEFAULT_HEIGHT
            this.height = DEFAULT_WIDTH
            this.x = MARGIN
            this.y = mouseY - this.height / 2
        } else if (direction === Direction.RIGHT) {
            this.width = DEFAULT_HEIGHT
            this.height = DEFAULT_WIDTH
            this.x = this.canvas.width - this.width - MARGIN
            this.y = mouseY - this.height / 2
        }

        // 보장용: 해당 방향 이미지가 없으면 로드
        if (!Paddle.IMAGES[direction]) {
            Paddle.loadImageForDirection(direction)
        }
    }

    clamp() {
        this.x = Math.max(0, Math.min(this.x, this.canvas.width - this.width))
        this.y = Math.max(0, Math.min(this.y, this.canvas.height - this.height))
    }

    checkCollision(ball) {
        const r = ball.constructor.RADIUS
        const { x, y, width, height } = this

        switch (this.direction) {
            case Direction.TOP:
                return ball.y - r <= y + height && ball.y >= y && ball.x >= x && ball.x <= x + width
            case Direction.BOTTOM:
                return ball.y + r >= y && ball.y <= y + height && ball.x >= x && ball.x <= x + width
            case Direction.LEFT:
                return ball.x - r <= x + width && ball.x >= x && ball.y >= y && ball.y <= y + height
            case Direction.RIGHT:
                return ball.x + r >= x && ball.x <= x + width && ball.y >= y && ball.y <= y + height
        }
    }

    onCollision(ball) {
        if (this.direction === Direction.TOP || this.direction === Direction.BOTTOM) {
            ball.bounceY()
        } else {
            ball.bounceX()
        }
    }

    draw(ctx) {
        const image = Paddle.IMAGES[this.direction]
        if (image && image.complete) {
            ctx.drawImage(image, this.x, this.y, this.width, this.height)
        } else {
            ctx.beginPath()
            ctx.rect(this.x, this.y, this.width, this.height)
            ctx.fillStyle = Paddle.COLOR
            ctx.fill()
            ctx.closePath()
        }
    }
}

export default Paddle
