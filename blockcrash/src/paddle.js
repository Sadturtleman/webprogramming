export class Paddle {
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
        this.direction = "bottom"

        this.bindMouseMove()
        Paddle.#instance = this
    }

    static getInstance(canvas) {
        if (!Paddle.#instance) {
        new Paddle(canvas)
        }
        return Paddle.#instance
    }

    bindMouseMove() {
        const self = this

        $(this.canvas).on("mousemove", function (e) {
        const rect = self.canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const top = mouseY
        const bottom = self.canvas.height - mouseY
        const left = mouseX
        const right = self.canvas.width - mouseX

        const min = Math.min(top, bottom, left, right)

        if (min == top) {
            self.direction = "top"
            self.width = Paddle.DEFAULT_WIDTH
            self.height = Paddle.DEFAULT_HEIGHT
            self.y = Paddle.MARGIN
            self.x = mouseX - self.width / 2
        } 
        else if (min == bottom) {
            self.direction = "bottom"
            self.width = Paddle.DEFAULT_WIDTH
            self.height = Paddle.DEFAULT_HEIGHT
            self.y = self.canvas.height - self.height - Paddle.MARGIN
            self.x = mouseX - self.width / 2
        } 
        else if (min == left) {
            self.direction = "left"
            self.width = Paddle.DEFAULT_HEIGHT
            self.height = Paddle.DEFAULT_WIDTH
            self.x = Paddle.MARGIN
            self.y = mouseY - self.height / 2
        } 
        else if (min == right) {
            self.direction = "right"
            self.width = Paddle.DEFAULT_HEIGHT
            self.height = Paddle.DEFAULT_WIDTH
            self.x = self.canvas.width - self.width - Paddle.MARGIN
            self.y = mouseY - self.height / 2
        }

        self.clamp()
        })
    }

    clamp() {
        if (this.x < 0) this.x = 0
        if (this.x + this.width > this.canvas.width) {
        this.x = this.canvas.width - this.width
        }
        if (this.y < 0) this.y = 0
        if (this.y + this.height > this.canvas.height) {
        this.y = this.canvas.height - this.height
        }
    }

    draw(ctx) {
        ctx.beginPath()
        ctx.rect(this.x, this.y, this.width, this.height)
        ctx.fillStyle = Paddle.COLOR
        ctx.fill()
        ctx.closePath()
    }
}
