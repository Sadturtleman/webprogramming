import Paddle from "./paddle.js"
import Ball from "./ball.js"

const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

const paddle = Paddle.getInstance(canvas)
const ball = new Ball(canvas.width / 2, canvas.height / 2, 2, -2, canvas, paddle)

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    paddle.draw(ctx)
    ball.draw(ctx)
    

    requestAnimationFrame(draw)
}

draw()