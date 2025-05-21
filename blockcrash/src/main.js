import Paddle from "./blockcrash/paddle.js"
import Ball from "./blockcrash/ball.js"
import CollisionManager from "./blockcrash/collisionManager.js"
import Brick from "./blockcrash/brick.js"

const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

const paddle = Paddle.getInstance(canvas)
const ball = new Ball(canvas.width / 2, canvas.height / 2, 2, -2, canvas)

const collisionManager = new CollisionManager()
collisionManager.add(paddle)
ball.setCollisionManager(collisionManager)

const bricks = []
const rows = 3
const cols = 5
const brickWidth = 60
const brickHeight = 20
const margin = 10
const offsetTop = 50
const offsetLeft = 35

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const x = offsetLeft + col * (brickWidth + margin)
        const y = offsetTop + row * (brickHeight + margin)
        const brick = new Brick(x, y, brickWidth, brickHeight)
        bricks.push(brick)
        collisionManager.add(brick)
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    paddle.draw(ctx)
    ball.draw(ctx)
    for (const brick of bricks) {
        brick.draw(ctx)
    }
    requestAnimationFrame(draw)
}

draw()