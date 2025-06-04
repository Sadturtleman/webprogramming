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

// 화면 전환 관련
function showScreen(id) {
  $(".screen").hide()
  $(id).show()
}

// 🎯 승리/패배 이미지 관련
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
      // 게임 오버 or 승리 이미지 표시
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

      // draw 루프는 반드시 유지
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

      // 아이템 생성
      if (Math.random() < 0.3) {
        const types = ["paddlebuff", "speedbuff", "paddlebuff", "speeddebuff"]
        const type = types[Math.floor(Math.random() * types.length)]
        items.push(new Item(brick.x + brick.width / 2, brick.y + brick.height / 2, type))
      }
    }
  }

  for (const item of items) {
    if (!item.collected) {
      item.draw(ctx)

      if (paddle.checkCollisionWithItem(item)) {
        item.collect()

        // 🎯 효과 적용
        if (item.type == "paddlebuff") {
          paddle.shrink()
        } else if (item.type == "paddlebuff") {
          paddle.enlarge()
        } else if (item.type == "speedbuff") {
          if (ball) ball.adjustSpeed(0.8)
        } else if (item.type == "speeddebuff"){
          if (ball) ball.adjustSpeed(1.2) 
        }
      }
    }
  }


  // 승리 조건 체크
  const allDestroyed = bricks.length > 0 && bricks.every(b => b.destroyed)
  if (allDestroyed && !showVictoryImg) {
    showVictoryImg = true
    sound.playVictory()
    ball = null
    setTimeout(resetToStart, 3000)
  }

  lives.draw(ctx)
  score.draw(ctx, canvas)

  requestAnimationFrame(draw) // 항상 루프 유지
}


function resetToStart() {
  // 게임 상태 초기화
  showGameOverImg = false
  showVictoryImg = false
  backgroundImg = null
  bricks = []
  items.length = 0
  ball = null
  level = null
  gameStarted = false

  // 충돌 목록 초기화
  collisionManager.collidables = []
  collisionManager.add(paddle)

  // UI 복원
  showScreen("#startScreen")
  $("#gameCanvas").hide()
  sound.play("start")
}

$(document).ready(() => {
  showScreen("#startScreen")
})

$("#gameStart").click(function () {
  showScreen("#level")
  sound.play("lobby")
})

$(".levelButton").click(function () {
  $(".levelButton").removeClass("selected")
  $(this).addClass("selected")
})

$("#pass").click(function () {
  $(".levelButton").removeClass("selected")
  showScreen("#startScreen")          
  sound.play("start")
})

$("#levelselect").click(function () {
  if ($(".levelButton.selected").length == 0) {
    alert("\ub09c\uc774\ub3c4\ub97c \uc120\ud0dd\ud558\uc138\uc694.")
    return
  }

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

  if (level === "EASY") sound.play("game1")
  else if (level === "NORMAL") sound.play("game2")
  else if (level === "HARD") sound.play("game3")

  $("#level").hide()
  $("#readyScreen").show()
  $("#gameCanvas").show()  // 캔버스 보이기
  gameStarted = true
})

sound.play("start")
draw()
