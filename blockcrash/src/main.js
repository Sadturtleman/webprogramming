import Paddle from "./blockcrash/paddle.js"
import Ball from "./blockcrash/ball.js"
import CollisionManager from "./blockcrash/collisionManager.js"
import BrickFactory from "./interface/brickFactroy.js"
import levelManager from "./blockcrash/levelManager.js"

const canvas = $("#gameCanvas")[0]
const ctx = canvas.getContext("2d")
let backgroundImg = null
let bricks = []
let gameStarted = false

const paddle = Paddle.getInstance(canvas)
const ball = new Ball(canvas.width / 2, canvas.height / 2, 2, -2, canvas)

const collisionManager = new CollisionManager()
collisionManager.add(paddle)
ball.setCollisionManager(collisionManager)

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (backgroundImg) {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height)
  }

  if (gameStarted) {
    ball.move()
  }
  ball.draw(ctx)
  paddle.draw(ctx)

  for (const brick of bricks) {
    brick.draw(ctx)
  }

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

  let imgPath = "assets/map1.png"
  let level
  const selectedBtn = $(".levelButton.selected img").attr("id")

  if (selectedBtn == "easygame") {
    imgPath = "assets/map1.png"
    level = "EASY"
  } else if (selectedBtn == "normalgame") {
    imgPath = "assets/map2.png"
    level = "NORMAL"
  } else if (selectedBtn == "hardgame") {
    imgPath = "assets/map3.png"
    level = "HARD"
  }

  levelManager.setLevel(level)

  const img = new Image()
  img.src = imgPath
  img.onload = function () {
    backgroundImg = img
  }

  bricks = BrickFactory.createBricks(level, canvas.width)
  for (const brick of bricks) {
    collisionManager.add(brick)
  }

  $("#level").hide()
  $("#readyScreen").show() // 게임 시작 
  
  gameStarted = true
})

draw()