class Direction {
    constructor(checkCollisionFn, setPositionFn) {
        this.checkCollision = checkCollisionFn
        this.setPosition = setPositionFn
    }

    func() {
        console.log("Direction function called")
    }

    static TOP = new Direction(
        (ball, paddle, radius) =>
            ball.y - radius <= paddle.y + paddle.height &&
            ball.y >= paddle.y &&
            ball.x >= paddle.x &&
            ball.x <= paddle.x + paddle.width,
        (paddle, mouseX, mouseY, config) => {
            const { DEFAULT_WIDTH, DEFAULT_HEIGHT, MARGIN } = config
            paddle.width = DEFAULT_WIDTH
            paddle.height = DEFAULT_HEIGHT
            paddle.y = MARGIN
            paddle.x = mouseX - paddle.width / 2
        }
    )

    static BOTTOM = new Direction(
        (ball, paddle, radius) =>
            ball.y + radius >= paddle.y &&
            ball.y <= paddle.y + paddle.height &&
            ball.x >= paddle.x &&
            ball.x <= paddle.x + paddle.width,
        (paddle, mouseX, mouseY, config) => {
            const { DEFAULT_WIDTH, DEFAULT_HEIGHT, MARGIN } = config
            paddle.width = DEFAULT_WIDTH
            paddle.height = DEFAULT_HEIGHT
            paddle.y = paddle.canvas.height - paddle.height - MARGIN
            paddle.x = mouseX - paddle.width / 2
        }
    )

    static LEFT = new Direction(
        (ball, paddle, radius) =>
            ball.x - radius <= paddle.x + paddle.width &&
            ball.x >= paddle.x &&
            ball.y >= paddle.y &&
            ball.y <= paddle.y + paddle.height,
        (paddle, mouseX, mouseY, config) => {
            const { DEFAULT_WIDTH, DEFAULT_HEIGHT, MARGIN } = config
            paddle.width = DEFAULT_HEIGHT
            paddle.height = DEFAULT_WIDTH
            paddle.x = MARGIN
            paddle.y = mouseY - paddle.height / 2
        }
    )

    static RIGHT = new Direction(
        (ball, paddle, radius) =>
            ball.x + radius >= paddle.x &&
            ball.x <= paddle.x + paddle.width &&
            ball.y >= paddle.y &&
            ball.y <= paddle.y + paddle.height,
        (paddle, mouseX, mouseY, config) => {
            const { DEFAULT_WIDTH, DEFAULT_HEIGHT, MARGIN } = config
            paddle.width = DEFAULT_HEIGHT
            paddle.height = DEFAULT_WIDTH
            paddle.x = paddle.canvas.width - paddle.width - MARGIN
            paddle.y = mouseY - paddle.height / 2
        }
    )
}

Object.freeze(Direction)
export default Direction
