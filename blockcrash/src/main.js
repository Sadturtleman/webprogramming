import Paddle from "./blockcrash/paddle.js"
import Ball from "./blockcrash/ball.js"
import CollisionManager from "./blockcrash/collisionManager.js"
import BrickFactory from "./interface/brickFactroy.js"
import levelManager from "./blockcrash/levelManager.js"
import Lives from "./blockcrash/lives.js"
import Score from "./blockcrash/score.js"
import SoundManager from "./blockcrash/soundManager.js"
import Item from "./blockcrash/item.js"

const items = []

const canvas = $("#gameCanvas")[0]
const ctx = canvas.getContext("2d")

let backgroundImg = null
let bricks = []
let ball = null
let gameStarted = false
let level = null

const paddle = Paddle.getInstance(canvas)
const collisionManager = new CollisionManager()
collisionManager.add(paddle)

const lives = new Lives()
const score = new Score()
const sound = new SoundManager()

paddle.lives = lives
paddle.score = score

let gameOverImg = new Image()
gameOverImg.src = "assets/loseImg.png"
let showGameOverImg = false

let victoryImg = new Image()
victoryImg.src = "assets/winImg.png"
let showVictoryImg = false

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (backgroundImg) {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height)
  }

  if (gameStarted) {
    if (!ball) {
      if (showGameOverImg && gameOverImg.complete) {
        const x = (canvas.width - 300) / 2
        const y = (canvas.height - 150) / 2
        ctx.drawImage(gameOverImg, x, y, 300, 150)
      }

      if (showVictoryImg && victoryImg.complete) {
        const x = (canvas.width - 300) / 2
        const y = (canvas.height - 150) / 2
        ctx.drawImage(victoryImg, x, y, 300, 150)
      }

      requestAnimationFrame(draw)
      return
    }

    ball.move()

    if (ball.isDead()) {
      lives.lose()

      if (!lives.isDead()) {
        ball = new Ball(canvas.width / 2, canvas.height / 2, 2, -2, canvas)
        ball.setCollisionManager(collisionManager)
      } else {
        showGameOverImg = true
        ball = null
        sound.playGameOver()
        setTimeout(resetToStart, 3000)
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

      // 아이템 생성 확률
      if (Math.random() < 0.3) {
        const types = ["paddlebuff", "paddledebuff", "speedbuff", "speeddebuff"]
        const type = types[Math.floor(Math.random() * types.length)]
        items.push(new Item(brick.x + brick.width / 2, brick.y + brick.height / 2, type))
      }
    }
  }

  // 아이템 그리기 + Paddle 충돌 확인
  for (const item of items) {
    if (!item.collected) {
      item.update()
      item.draw(ctx)
      if (paddle.checkCollisionWithItem(item)) {
        item.collect()

        // 아이템 효과 처리
        if (item.type === "expand") paddle.enlarge()
        else if (item.type === "shrink") paddle.shrink()
        else if (item.type === "speedbuff") ball?.adjustSpeed?.(1.2)
        else if (item.type === "speeddebuff") ball?.adjustSpeed?.(0.8)
      }
    }
  }

  // 승리 체크
  const allDestroyed = bricks.length > 0 && bricks.every(b => b.destroyed)
  if (allDestroyed && !showVictoryImg) {
    showVictoryImg = true
    sound.playVictory()
    ball = null
    setTimeout(resetToStart, 3000)
  }

  score.draw(ctx, canvas)

  // ✅ 무조건 호출되어야 함 (루프 유지)
  requestAnimationFrame(draw)
}


function resetToStart() {
  showGameOverImg = false
  showVictoryImg = false
  backgroundImg = null
  bricks = []
  ball = null
  level = null
  items.length = 0
  gameStarted = false

  collisionManager.reset()
  collisionManager.add(paddle)

  $("#startScreen").show()
  $("#readyScreen").hide()
  $("#level").hide()

  sound.play("start")
}

$("#gameStart").click(function () {
  $("#startScreen").hide()
  $("#level").show()
  sound.play("lobby")
})

$(".levelButton").click(function () {
  $(".levelButton").removeClass("selected")
  $(this).addClass("selected")
})

$("#pass").click(function () {
  $(".levelButton").removeClass("selected")
})

$("#levelselect").click(function () {
  if ($(".levelButton.selected").length === 0) {
    alert("난이도를 선택하세요.")
    return
  }

  const selectedBtn = $(".levelButton.selected img").attr("id")
  level = selectedBtn === "easygame" ? "EASY" : selectedBtn === "normalgame" ? "NORMAL" : "HARD"

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

  sound.play(level === "EASY" ? "game1" : level === "NORMAL" ? "game2" : "game3")

  $("#level").hide()
  $("#readyScreen").show()
  gameStarted = true
})

sound.play("start")
draw()
