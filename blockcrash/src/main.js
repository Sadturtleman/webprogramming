import Paddle from "./blockcrash/paddle.js"
import Ball from "./blockcrash/ball.js"
import CollisionManager from "./blockcrash/collisionManager.js"
import BrickFactory from "./interface/brickFactroy.js"
import levelManager from "./blockcrash/levelManager.js"
import Lives from "./blockcrash/lives.js"
import Score from "./blockcrash/score.js"

const canvas = $("#gameCanvas")[0]
const ctx = canvas.getContext("2d")
let backgroundImg = null
let bricks = []
let ball = null
let gameStarted = false

const paddle = Paddle.getInstance(canvas)
const collisionManager = new CollisionManager()
collisionManager.add(paddle)

const lives = new Lives()
const score = new Score()

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (backgroundImg) {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height)
  }

  if (gameStarted) {
    if (!ball) {
      gameStarted = false
      alert("게임 오버!\n점수: " + score.get())
      return
    }

    ball.move()

    if (ball.isDead()) {
      lives.lose()

      if (!lives.isDead()) {
        ball = new Ball(canvas.width / 2, canvas.height / 2, 2, -2, canvas)
        ball.setCollisionManager(collisionManager)
      } else {
        ball = null
        return
      }
    }
  }

  if (ball) ball.draw(ctx)
  paddle.draw(ctx)

  for (const brick of bricks) {
    brick.draw(ctx)
    if (brick.destroyed && !brick.counted) {
      score.addPoint()
      brick.counted = true
    }
  }

  lives.draw(ctx)
  score.draw(ctx, canvas)

  requestAnimationFrame(draw)
}

$("#gameStart").click(function () {
  $("#startScreen").hide()
  $("#level").show()
})

$(".levelButton").click(function () {
  $(".levelButton").removeClass("selected")
  $(this).addClass("selected")
})

$("#pass").click(function () {
  $(".levelButton").removeClass("selected")
})

$("#levelselect").click(function () {
  if ($(".levelButton.selected").length == 0) {
    alert("난이도를 선택하세요.")
    return
  }

  let level
  const selectedBtn = $(".levelButton.selected img").attr("id")

  if (selectedBtn == "easygame") {
    level = "EASY"
  } else if (selectedBtn == "normalgame") {
    level = "NORMAL"
  } else if (selectedBtn == "hardgame") {
    level = "HARD"
  }

  levelManager.setLevel(level)
  lives.reset()
  score.reset(level)

  backgroundImg = new Image()
  backgroundImg.src = `assets/map${level === "EASY" ? 1 : level === "NORMAL" ? 2 : 3}.png`

  bricks = BrickFactory.createBricks(level, canvas.width)
  for (const brick of bricks) {
    collisionManager.add(brick)
    brick.counted = false
  }

  ball = new Ball(canvas.width / 2, canvas.height / 2, 2, -2, canvas)
  ball.setCollisionManager(collisionManager)

  $("#level").hide()
  $("#readyScreen").show() // 게임 시작 

  gameStarted = true
})

draw()
