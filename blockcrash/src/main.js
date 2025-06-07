// ===================== 모듈 임포트 ===================== //

class ICollidable {
    checkCollision(ball) {
        throw new Error("checkCollision not implemented")
    }

    onCollision(ball) {
        throw new Error("onCollision not implemented")
    }
}

const Direction = Object.freeze({
    TOP: "TOP",
    BOTTOM: "BOTTOM",
    LEFT: "LEFT",
    RIGHT: "RIGHT",
})

class Ball {
    static RADIUS = 40
    static COLOR = "#DD3333"

    constructor(x, y, dx = 30, dy = -30, canvas, imageObj) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.canvas = canvas;
        this.die = false;
        this.collisionManager = null;
        this.image = imageObj; // 이제 imageObj는 미리 로드된 Image 객체
    }

    changeImage(imgObj) {
        this.image = imgObj;
    }

    setCollisionManager(manager) {
        this.collisionManager = manager
    }

    move() {
        if (this.die) return

        this.checkWallCollision()

        if (this.collisionManager) {
            this.collisionManager.handle(this)
        }

        this.x += this.dx
        this.y += this.dy
    }

    isDead() {
        return this.die
    }

    bounceX() {
        this.dx = -this.dx
    }

    bounceY() {
        this.dy = -this.dy
    }

    checkWallCollision() {
        const { width, height } = this.canvas

        if (
            this.x - Ball.RADIUS < 0 || this.x + Ball.RADIUS > width ||
            this.y - Ball.RADIUS < 0 || this.y + Ball.RADIUS > height
        ) {
            this.die = true
        }
    }
    adjustSpeed(factor) {
        this.dx *= factor
        this.dy *= factor
    }

    bounceWithAngle(offsetRatio, verticalDir = -1) {
        const speed = Math.sqrt(this.dx ** 2 + this.dy ** 2)
        const maxAngle = Math.PI / 3  // 최대 60도

        const angle = offsetRatio * maxAngle
        this.dx = speed * Math.sin(angle)
        this.dy = verticalDir * Math.abs(speed * Math.cos(angle))  // 위(-1) 또는 아래(+1)
    }


    draw(ctx) {
        if (
            this.image &&
            this.image.complete &&
            this.image.naturalWidth > 0 &&
            this.image.naturalHeight > 0
        ) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, Ball.RADIUS, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(
            this.image,
            this.x - Ball.RADIUS,
            this.y - Ball.RADIUS,
            Ball.RADIUS * 2,
            Ball.RADIUS * 2
            );
            ctx.restore();
        } else {
            // fallback: 원형 색상 공
            ctx.beginPath();
            ctx.arc(this.x, this.y, Ball.RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = Ball.COLOR;
            ctx.fill();
            ctx.closePath();
        }
    }
}

class CollisionManager {
    constructor() {
        this.collidables = []
    }

    add(obj) {
        this.collidables.push(obj)
    }

    handle(ball) {
        const hit = this.collidables.find(obj => obj.checkCollision(ball))
        if (hit) hit.onCollision(ball)
    }
    handleItem(item) {
    for (const obj of this.collidables) {
        if (obj.checkCollisionWithItem && obj.checkCollisionWithItem(item)) {
            obj.onCollisionWithItem?.(item)
        }
    }
    }

    reset() {
        this.collidables = []
    }
}

class DirectionDetector {
    static detect(ball, obj) {
        const r = ball.constructor.RADIUS

        const overlapLeft = ball.x + r - obj.x
        const overlapRight = obj.x + obj.width - (ball.x - r)
        const overlapTop = ball.y + r - obj.y
        const overlapBottom = obj.y + obj.height - (ball.y - r)

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)

        if (minOverlap === overlapLeft) return "LEFT"
        if (minOverlap === overlapRight) return "RIGHT"
        if (minOverlap === overlapTop) return "TOP"
        return "BOTTOM"
    }
}

class Item {
  static SIZE = 80

  constructor(x, y, type) {
    this.x = x
    this.y = y
    this.type = type     // 예: "life", "score", "expand", "shrink", "speedup", "slowdown"
    this.collected = false

    this.image = new Image()
    this.image.src = `assets/${type}.png`

    // 에러 디버깅용
    this.image.onerror = () => {
      console.warn(`⚠️ 아이템 이미지 로드 실패: ${this.type}`)
    }
  }

  getColor() {
    const colors = {
      life: "red",
      score: "gold",
      expand: "blue",
      shrink: "purple",
      speedup: "orange",
      slowdown: "green"
    }
    return colors[this.type] || "gray"
  }

  draw(ctx) {
    if (this.collected) return

    const size = Item.SIZE

    if (this.image.complete && this.image.naturalWidth !== 0) {
      ctx.drawImage(this.image, this.x, this.y, size, size)
    } else {
      // 이미지 로딩 실패 또는 대기 중일 때 기본 원형 표시
      ctx.beginPath()
      ctx.arc(this.x + size / 2, this.y + size / 2, size / 2, 0, Math.PI * 2)
      ctx.fillStyle = this.getColor()
      ctx.fill()
      ctx.closePath()
    }
  }

  update() {
    // 아래로 떨어지는 애니메이션
    this.y += 2
  }

  checkCollision(paddle) {
    const px = paddle.x
    const py = paddle.y
    const pw = paddle.width
    const ph = paddle.height

    const size = Item.SIZE

    return (
      this.x < px + pw &&
      this.x + size > px &&
      this.y < py + ph &&
      this.y + size > py
    )
  }

  collect() {
    this.collected = true
  }
}

class Brick extends ICollidable {
  static COLOR = "#999"

  constructor(x, y, width, height, options = {}) {
    super()
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.destroyed = false
    this.hitCount = options.hitCount || 1
    this.image = options.image || null
    this.indestructible = options.indestructible || false
  }

  checkCollision(ball) {
    if (this.destroyed) return false

    const r = ball.constructor.RADIUS
    const ballLeft = ball.x - r
    const ballRight = ball.x + r
    const ballTop = ball.y - r
    const ballBottom = ball.y + r

    const brickLeft = this.x
    const brickRight = this.x + this.width
    const brickTop = this.y
    const brickBottom = this.y + this.height

    return (
      ballRight > brickLeft &&
      ballLeft < brickRight &&
      ballBottom > brickTop &&
      ballTop < brickBottom
    )
  }

  onCollision(ball) {
    const direction = DirectionDetector.detect(ball, this)
    if (direction === "LEFT" || direction === "RIGHT") ball.bounceX()
    else ball.bounceY()

    if (!this.indestructible) {
      this.hitCount--
      if (this.hitCount <= 0) this.destroyed = true
    }
  }


  draw(ctx) {
    if (!this.destroyed) {
      if (this.image && this.image.complete) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
      } else {
        ctx.fillStyle = Brick.COLOR
        ctx.fillRect(this.x, this.y, this.width, this.height)
      }
    }
  }
}

class LevelManager {
  constructor() {
    this.currentLevel = null
  }

  setLevel(level) {
    this.currentLevel = level
  }

  getLevel() {
    return this.currentLevel
  }
}

const levelManager = new LevelManager()

class Lives {
  constructor(max = 3) {
    this.max = max
    this.life = max
    this.container = document.getElementById("heartContainer")
    this.render()
  }

  lose() {
    this.life = Math.max(0, this.life - 1)
    this.render()
  }

  gain() {
    this.life = Math.min(this.life + 1, this.max)
    this.render()
  }

  reset() {
    this.life = this.max
    this.render()
  }

  isDead() {
    return this.life <= 0
  }
  setlife(life){
    this.life = life
    this.render()
  }
  
  render() {
    if (!this.container) return

    this.container.innerHTML = ""

    for (let i = 0; i < this.life; i++) {
      const heart = document.createElement("img")
      heart.src = "assets/heart.png"
      heart.className = "life"
      this.container.appendChild(heart)
    }
  }
}


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
    checkCollisionWithItem(item) {
        const size = Item.SIZE
        return (
            this.x < item.x + size &&
            this.x + this.width > item.x &&
            this.y < item.y + size &&
            this.y + this.height > item.y
        )
    }

    onCollision(ball) {
        if (this.direction == Direction.TOP || this.direction == Direction.BOTTOM) {
            const relativeX = ball.x - this.x
            const offsetRatio = (relativeX / this.width - 0.5) * 2  // -1(left) ~ 1(right)
            const verticalDir = this.direction === Direction.TOP ? 1 : -1

            ball.bounceWithAngle(offsetRatio, verticalDir)

            // 🎯 위치 보정
            if (this.direction == Direction.TOP) {
                ball.y = this.y + this.height + ball.constructor.RADIUS
            } else {
                ball.y = this.y - ball.constructor.RADIUS
            }

        } else {
            ball.bounceX()

            // 🎯 위치 보정 (좌우 패들일 경우)
            if (this.direction == Direction.LEFT) {
                ball.x = this.x + this.width + ball.constructor.RADIUS
            } else {
                ball.x = this.x - ball.constructor.RADIUS
            }
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

    enlarge() {
        this.width *= 1.5
        this.height *= 1.5

        // 일정 시간 후 원래 크기로 복구
        setTimeout(() => {
            this.width = Paddle.DEFAULT_WIDTH
            this.height = Paddle.DEFAULT_HEIGHT
        }, 5000)
    }

    shrink() {
        this.width *= 0.7
        this.height *= 0.7

        // 5초 후 원래 크기로 복원
        setTimeout(() => {
            this.width = Paddle.DEFAULT_WIDTH
            this.height = Paddle.DEFAULT_HEIGHT
        }, 5000)
    }

}

class Score {
  constructor() {
    this.score = 0
    this.pointPerBrick = 10
    this.container = document.getElementById("timeText")
    this.render()
  }

  reset(level) {
    this.score = 0
    if (level === "EASY") this.pointPerBrick = 10
    else if (level === "NORMAL") this.pointPerBrick = 20
    else if (level === "HARD") this.pointPerBrick = 30
    this.render()
  }

  addPoint() {
    this.score += this.pointPerBrick
    this.render()
  }

  get() {
    return this.score
  }

  render(){
    if (!this.container) return;
    this.container.innerText = `점수 : ${this.score}`
  }
}

class SoundManager {
  constructor() {
    this.currentBGM = null;
    this.bgmEnabled = true;

    this.tracks = {
      start: new Audio("assets/start.mp3"),
      lobby: new Audio("assets/lobby.mp3"),
      game1: new Audio("assets/map1.mp3"),
      game2: new Audio("assets/map2.mp3"),
      game3: new Audio("assets/map3.mp3"),
      gameover: new Audio("assets/lose.mp3"),
      victory: new Audio("assets/win.mp3"),
    };

    for (const key of ["start", "lobby", "game1", "game2", "game3"]) {
      this.tracks[key].loop = true;
    }
  }

  playBGM(name) {
    this.stopBGM();
    if (!this.bgmEnabled) return;
    const track = this.tracks[name];
    if (track) {
      track.currentTime = 0;
      track.play().catch((e) => console.warn("Autoplay error:", e));
      this.currentBGM = track;
    }
  }

  stopBGM() {
    if (this.currentBGM) {
      this.currentBGM.pause();
      this.currentBGM.currentTime = 0;
      this.currentBGM = null;
    }
  }

  toggleBGM() {
    this.bgmEnabled = !this.bgmEnabled;
    if (!this.bgmEnabled) {
      this.stopBGM();
    }
  }

  playGameOver() {
    const sfx = this.tracks.gameover;
    sfx.currentTime = 0;
    sfx.play();
  }

  playVictory() {
    const sfx = this.tracks.victory;
    sfx.currentTime = 0;
    sfx.play();
  }

  pauseBGM() {
    if (this.current) {
      this.current.pause();
    }
  }

  resumeBGM() {
    if (this.current) {
      this.current.play().catch((e) => {
        console.warn("resume error", e);
      });
    }
  }
}

class BrickFactory {
  static createBricks(difficulty, canvasWidth) {
    const bricks = []

    let rows, cols, hitCount, image

    switch (difficulty) {
      case "EASY":
        rows = 5
        cols = 8
        hitCount = 1
        image = brickImages.EASY
        break
      case "NORMAL":
        rows = 5
        cols = 8
        hitCount = 1
        image = brickImages.NORMAL
        break
      case "HARD":
        rows = 5
        cols = 8
        hitCount = 1
        image = brickImages.HARD
        break
    }

    const brickWidth = 80
    const brickHeight = 80
    const margin = 5
    const offsetTop = 50
    const totalWidth = cols * (brickWidth + margin) - margin
    const offsetLeft = (canvasWidth - totalWidth) / 2
    const indestructiblepos = [[0, 2], [0, 7], [1, 4], [3, 1], [3, 5]];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isObstacle =
          difficulty === "HARD" &&
          indestructiblepos.some(([r, c]) => r === row && c === col);

        const imageToUse = isObstacle ? brickImages.OBSTACLE : image;

        const x = offsetLeft + col * (brickWidth + margin);
        const y = offsetTop + row * (brickHeight + margin);

        const brick = new Brick(x, y, brickWidth, brickHeight, {
          hitCount: isObstacle ? Infinity : hitCount,
          image: imageToUse,
          indestructible: isObstacle,
        });

        bricks.push(brick);
      }
    }

    return bricks
  }
}


const brickImages = {
  EASY: new Image(),
  NORMAL: new Image(),
  HARD: new Image(),
  OBSTACLE : new Image()
}

brickImages.EASY.src = "assets/map1_box1.png"
brickImages.NORMAL.src = "assets/map3_box1.png"
brickImages.HARD.src = "assets/map2_box1.png"
brickImages.OBSTACLE.src = "assets/map3_box3.png"

// ===================== 전역 상수 및 변수 ===================== //
const canvas = $("#gameCanvas")[0];
const ctx = canvas.getContext("2d");

const paddle = Paddle.getInstance(canvas);
const collisionManager = new CollisionManager();
const lives = new Lives();
const score = new Score();
const sound = new SoundManager();

const ballImages = {
  ball1: new Image(),
  ball2: new Image(),
  ball3: new Image(),
};
ballImages.ball1.src = "assets/ball1.png";
ballImages.ball2.src = "assets/ball2.png";
ballImages.ball3.src = "assets/ball3.png";

const gameOverImg = new Image();
gameOverImg.src = "assets/loseImg.png";

const victoryImg = new Image();
victoryImg.src = "assets/winImg.png";

let selectedBallImage = null;
let backgroundImg = null;
let bricks = [];
let items = [];
let ball = null;
let level = null;
let gameStarted = false;
let showGameOverImg = false;
let showVictoryImg = false;

collisionManager.add(paddle);


// ===================== 이미지 로딩 및 초기 시작 ===================== //
function loadImage(img) {
  return new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });
}

function startLevel(selectedLevel) {
  level = selectedLevel;
  levelManager.setLevel(level);
  lives.reset();
  score.reset(level);

  backgroundImg = new Image();
  backgroundImg.src = `assets/map${level === "EASY" ? 1 : level === "NORMAL" ? 2 : 3}.png`;

  bricks = BrickFactory.createBricks(level, canvas.width);
  for (const brick of bricks) {
    collisionManager.add(brick);
    brick.counted = false;
  }

  ball = new Ball(canvas.width / 2, canvas.height / 2 + 150, 2, -2, canvas, selectedBallImage);
  lives.setlife(level == "EASY" ? 5 : level == "NORMAL" ? 4 : 3)
  ball.setCollisionManager(collisionManager);

  sound.playBGM(level === "EASY" ? "game1" : level === "NORMAL" ? "game2" : "game3");

  $("#level").hide();
  $("#readyScreen").hide();  // 다음 레벨 넘어갈 때 준비 화면 생략
  $("#gameCanvas").show();
  $("#game").show();
  gameStarted = true;
}

function getNextLevel(current) {
  if (current === "EASY") return "NORMAL"
  if (current === "NORMAL") return "HARD"
  return "EASY" // HARD 이후엔 EASY로 루프 or 변경 가능
}

Promise.all([
  loadImage(ballImages.ball1),
  loadImage(ballImages.ball2),
  loadImage(ballImages.ball3),
]).then(() => {
  selectedBallImage = ballImages.ball1;
  sound.playBGM("start");
  draw();
});


// ===================== 게임 루프 ===================== //
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (backgroundImg) ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

  if (gameStarted) {
    if (!ball) {
      if (showGameOverImg && gameOverImg.complete) {
        ctx.drawImage(gameOverImg, (canvas.width - 300) / 2, (canvas.height - 150) / 2, 300, 150);
      }
      if (showVictoryImg && victoryImg.complete) {
        ctx.drawImage(victoryImg, (canvas.width - 300) / 2, (canvas.height - 150) / 2, 300, 150);
      }
      requestAnimationFrame(draw);
      return;
    }

    ball.move();

    if (ball.isDead()) {
      lives.lose();

      if (!lives.isDead()) {
        ball = new Ball(canvas.width / 2, canvas.height / 2 + 150, 2, -2, canvas, selectedBallImage);
        ball.setCollisionManager(collisionManager);
      } else {
        showGameOverImg = true;
        ball = null;
        sound.playGameOver();
        setTimeout(() => resetToStart(true), 3000);
      }
    }
  }

  if (ball) ball.draw(ctx);
  paddle.draw(ctx);

  bricks.forEach(brick => {
    brick.draw(ctx);

    if (brick.destroyed && !brick.counted) {
      score.addPoint();
      brick.counted = true;

      if (Math.random() < 0.3 && level != "EASY") {
        const types = ["paddlebuff", "paddledebuff", "speedbuff", "speeddebuff"];
        const type = types[Math.floor(Math.random() * types.length)];
        items.push(new Item(brick.x + brick.width / 2, brick.y + brick.height / 2, type));
      }
    }
  });

  items.forEach(item => {
    if (!item.collected) {
      item.update();
      item.draw(ctx);

      if (paddle.checkCollisionWithItem(item)) {
        item.collect();
        addItemToInventory(item.type);

        if (item.type === "paddlebuff") paddle.enlarge();
        else if (item.type === "paddledebuff") paddle.shrink();
        else if (item.type === "speedbuff") ball?.adjustSpeed?.(1.2);
        else if (item.type === "speeddebuff") ball?.adjustSpeed?.(0.8);
      }
    }
  });

  const allDestroyed = bricks.length > 0 && bricks.every(b => b.destroyed);
  if (allDestroyed && !showVictoryImg) {
    showVictoryImg = true;
    sound.playVictory();
    ball = null;
    setTimeout(() => resetToStart(false), 3000);
  }

  requestAnimationFrame(draw);
}


// ===================== 상태 초기화 ===================== //
function resetToStart(redirectToLobby = true) {
  showGameOverImg = false;
  showVictoryImg = false;
  backgroundImg = null;
  bricks = [];
  ball = null;
  items.length = 0;
  gameStarted = false;

  collisionManager.reset();
  collisionManager.add(paddle);

  $(".item img").remove();

  if (redirectToLobby) {
    // 패배 시: 로비로 이동
    showScreen("#startScreen");
    $("#gameCanvas").hide();
    sound.playBGM("start");
  } else {
    // 승리 시: 다음 레벨 자동 진행
    const nextLevel = getNextLevel(level);
    startLevel(nextLevel);
  }
}


// ===================== 화면 전환 함수 ===================== //
function showScreen(id) {
  $(".screen").hide();
  $(id).show();
}


// ===================== 아이템 인벤토리 추가 ===================== //
function addItemToInventory(type) {
  const slots = $("#itemContainer .item");
  for (let i = 0; i < slots.length; i++) {
    const slot = $(slots[i]);
    if (slot.find("img").length > 0) continue;

    const img = $("<img>")
      .attr("src", `assets/${type}.png`)
      .css({ width: "70px", height: "70px" });

    slot.append(img);
    break;
  }
}


// ===================== 이벤트 바인딩 ===================== //
showScreen("#startScreen");

$("#levelTitle img").click(() => $("#settingOverlay").css("display", "flex"));
$("#settingTitle img").click(() => $("#settingOverlay").css("display", "none"));

$(".ballCheck").click(function () {
  $(".ballCheck").css("background", "#B8CED4")
    .find(".ballCheckBox").css("background", "#70757E").find("img").hide();

  $(this).css("background", "#08C6FE")
    .find(".ballCheckBox").css("background", "#3171D7").find("img").show();

  const src = $(this).children("img").attr("src");
  selectedBallImage =
    src.includes("settingBall2") ? ballImages.ball2 :
    src.includes("settingBall3") ? ballImages.ball3 :
    ballImages.ball1;

  if (ball) ball.changeImage(selectedBallImage);
});

$("#gameStart").click(() => {
  showScreen("#level");
  sound.playBGM("lobby");
});

$(".levelButton").click(function () {
  $(".levelButton").removeClass("selected");
  $(this).addClass("selected");
});

$("#pass").click(() => {
  $(".levelButton").removeClass("selected");
  showScreen("#startScreen");
  sound.playBGM("start");
});

$("#levelselect").click(() => {
  if ($(".levelButton.selected").length === 0) {
    alert("난이도를 선택하세요.");
    return;
  }

  const selectedBtn = $(".levelButton.selected img").attr("id");
  level = selectedBtn === "easygame" ? "EASY" : selectedBtn === "normalgame" ? "NORMAL" : "HARD";

  levelManager.setLevel(level);
  lives.reset();
  score.reset(level);

  backgroundImg = new Image();
  backgroundImg.src = `assets/map${level === "EASY" ? 1 : level === "NORMAL" ? 2 : 3}.png`;

  bricks = BrickFactory.createBricks(level, canvas.width);
  for (const brick of bricks) {
    collisionManager.add(brick);
    brick.counted = false;
  }

  ball = new Ball(canvas.width / 2, canvas.height / 2 + 150, 2, -2, canvas, selectedBallImage);
  lives.setlife(level == "EASY" ? 5 : level == "NORMAL" ? 4 : 3)
  ball.setCollisionManager(collisionManager);

  sound.playBGM(level === "EASY" ? "game1" : level === "NORMAL" ? "game2" : "game3");

  $("#level").hide();
  $("#readyScreen").show();
  $("#gameCanvas").show();
  $("#game").show();
  gameStarted = true;
});

$("#exit").click(() => resetToStart(true));

$(".audioCheck").click(function () {
  $(".audioCheckBox img").hide();
  $(this).find("img").show();

  const selected = $(this).find("span").text().trim();
  if (selected === "ON") {
    sound.bgmEnabled = true;
    sound.playBGM("start");
  } else {
    sound.bgmEnabled = false;
    sound.stopBGM();
  }
});
