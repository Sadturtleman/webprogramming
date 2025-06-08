// ===================== 모듈 임포트 ===================== //

class ICollidable {
  checkCollision(ball) {
    throw new Error("checkCollision not implemented");
  }

  onCollision(ball) {
    throw new Error("onCollision not implemented");
  }
}

const Direction = Object.freeze({
  TOP: "TOP",
  BOTTOM: "BOTTOM",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
});

class Ball {
  static RADIUS = 40;
  static COLOR = "#DD3333";

  constructor(x, y, canvas, imageObj) {
    this.x = x;
    this.y = y;
    this.dx = 3;
    this.dy = -3;
    this.canvas = canvas;
    this.die = false;
    this.collisionManager = null;
    this.image = imageObj; // 이제 imageObj는 미리 로드된 Image 객체
  }

  changeImage(imgObj) {
    this.image = imgObj;
  }

  setCollisionManager(manager) {
    this.collisionManager = manager;
  }

  move() {
    if (this.die) return;

    this.checkWallCollision();

    if (this.collisionManager) {
      this.collisionManager.handle(this);
    }

    this.x += this.dx;
    this.y += this.dy;
  }

  isDead() {
    return this.die;
  }

  bounceX() {
    this.dx = -this.dx;
  }

  bounceY() {
    this.dy = -this.dy;
  }

  checkWallCollision() {
    const { width, height } = this.canvas;

    if (
      this.x - Ball.RADIUS < 0 ||
      this.x + Ball.RADIUS > width ||
      this.y - Ball.RADIUS < 0 ||
      this.y + Ball.RADIUS > height
    ) {
      this.die = true;
    }
  }
  adjustSpeed(factor) {
    this.dx *= factor;
    this.dy *= factor;
  }

  bounceWithAngle(offsetRatio, verticalDir = -1) {
    const speed = Math.sqrt(this.dx ** 2 + this.dy ** 2);
    const maxAngle = Math.PI / 3; // 최대 60도

    const angle = offsetRatio * maxAngle;
    this.dx = speed * Math.sin(angle);
    this.dy = verticalDir * Math.abs(speed * Math.cos(angle)); // 위(-1) 또는 아래(+1)
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
    this.collidables = [];
  }

  add(obj) {
    this.collidables.push(obj);
  }

  handle(ball) {
    const hit = this.collidables.find((obj) => obj.checkCollision(ball));
    if (hit) hit.onCollision(ball);
  }

  reset() {
    this.collidables = [];
  }
}

class DirectionDetector {
  static detect(ball, obj) {
    const r = ball.constructor.RADIUS;

    const overlapLeft = ball.x + r - obj.x;
    const overlapRight = obj.x + obj.width - (ball.x - r);
    const overlapTop = ball.y + r - obj.y;
    const overlapBottom = obj.y + obj.height - (ball.y - r);

    const minOverlap = Math.min(
      overlapLeft,
      overlapRight,
      overlapTop,
      overlapBottom
    );

    if (minOverlap === overlapLeft) return "LEFT";
    if (minOverlap === overlapRight) return "RIGHT";
    if (minOverlap === overlapTop) return "TOP";
    return "BOTTOM";
  }
}

class Item {
  static SIZE = 50;

  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.collected = false;

    this.image = new Image();
    this.image.src = `assets/${type}.png`;

    this.image.onerror = () => {
      console.warn(`아이템 이미지 로드 실패: ${this.type}`);
    };
  }

  draw(ctx) {
    if (this.collected) return;

    if (this.image.complete && this.image.naturalWidth !== 0) {
      ctx.drawImage(this.image, this.x, this.y, Item.SIZE, Item.SIZE);
    } else {
      ctx.beginPath();
      ctx.arc(
        this.x + Item.SIZE / 2,
        this.y + Item.SIZE / 2,
        Item.SIZE / 2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = this.getColor();
      ctx.fill();
      ctx.closePath();
    }
  }

  checkCollisionWithBall(ball) {
    if (!ball) return false;
    const r = ball.constructor.RADIUS;
    const centerX = this.x + Item.SIZE / 2;
    const centerY = this.y + Item.SIZE / 2;
    const dx = ball.x - centerX;
    const dy = ball.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= r + Item.SIZE / 2;
  }

  collect() {
    this.collected = true;
  }

  getColor() {
    const colors = {
      heart: "red",
      heartdebuff: "black",
      speedbuff: "blue",
      speeddebuff: "green",
    };
    return colors[this.type] || "gray";
  }
}

class Brick extends ICollidable {
  static COLOR = "#999";

  constructor(x, y, width, height, options = {}) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.destroyed = false;
    this.hitCount = options.hitCount || 1;
    this.image = options.image || null;
    this.indestructible = options.indestructible || false;
  }

  checkCollision(ball) {
    if (this.destroyed) return false;

    const r = ball.constructor.RADIUS;
    const ballLeft = ball.x - r;
    const ballRight = ball.x + r;
    const ballTop = ball.y - r;
    const ballBottom = ball.y + r;

    const brickLeft = this.x;
    const brickRight = this.x + this.width;
    const brickTop = this.y;
    const brickBottom = this.y + this.height;

    return (
      ballRight > brickLeft &&
      ballLeft < brickRight &&
      ballBottom > brickTop &&
      ballTop < brickBottom
    );
  }

  onCollision(ball) {
    const direction = DirectionDetector.detect(ball, this);
    if (direction === "LEFT" || direction === "RIGHT") ball.bounceX();
    else ball.bounceY();

    if (!this.indestructible) {
      this.hitCount--;
      if (this.hitCount <= 0) this.destroyed = true;
    }
  }

  draw(ctx) {
    if (!this.destroyed) {
      if (this.image && this.image.complete) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      } else {
        ctx.fillStyle = Brick.COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }
  }
}

class LevelManager {
  constructor() {
    this.currentLevel = null;
  }

  setLevel(level) {
    this.currentLevel = level;
  }

  getLevel() {
    return this.currentLevel;
  }
}

const levelManager = new LevelManager();

class Lives {
  constructor(max = 5) {
    this.max = max;
    this.life = max;
    this.container = document.getElementById("heartContainer");
    this.render();
  }

  lose() {
    this.life = Math.max(0, this.life - 1);
    this.render();
  }

  gain() {
    this.life = Math.min(this.life + 1, this.max);
    this.render();
  }

  reset() {
    this.life = this.max;
    this.render();
  }

  isDead() {
    return this.life <= 0;
  }
  setlife(life) {
    this.life = life;
    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = "";

    for (let i = 0; i < this.life; i++) {
      const heart = document.createElement("img");
      heart.src = "assets/heart.png";
      heart.className = "life";
      this.container.appendChild(heart);
    }
  }
}

class Paddle extends ICollidable {
  static DEFAULT_WIDTH = 150;
  static DEFAULT_HEIGHT = 60;
  static COLOR = "#0095DD";
  static MARGIN = 10;
  static #instance = null;

  static IMAGE_PATHS = {
    [Direction.TOP]: "assets/paddleboard1.png",
    [Direction.BOTTOM]: "assets/paddleboard2.png",
    [Direction.LEFT]: "assets/paddleboard4.png",
    [Direction.RIGHT]: "assets/paddleboard3.png",
  };

  static IMAGES = {};

  // 모든 방향 이미지 미리 로딩
  static loadMainImage() {
    for (const direction of Object.values(Direction)) {
      if (!Paddle.IMAGES[direction]) {
        Paddle.loadImageForDirection(direction);
      }
    }
  }

  static loadImageForDirection(direction) {
    const path = Paddle.IMAGE_PATHS[direction];
    const img = new Image();
    img.src = path;
    Paddle.IMAGES[direction] = img;
  }

  constructor(canvas) {
    super();
    if (Paddle.#instance) throw new Error("Paddle is Singleton");

    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.scale = 1;
    this.width = Paddle.DEFAULT_WIDTH;
    this.height = Paddle.DEFAULT_HEIGHT;
    this.direction = Direction.BOTTOM;

    this.bindMouseMove();
    Paddle.#instance = this;
  }
  static getInstance(canvas) {
    return Paddle.#instance || new Paddle(canvas);
  }

  bindMouseMove() {
    $(this.canvas).on("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const distances = new Map([
        [Direction.TOP, mouseY],
        [Direction.BOTTOM, this.canvas.height - mouseY],
        [Direction.LEFT, mouseX],
        [Direction.RIGHT, this.canvas.width - mouseX],
      ]);

      let nearestDirection = null;
      let minDistance = Infinity;

      for (const [dir, dist] of distances) {
        if (dist < minDistance) {
          minDistance = dist;
          nearestDirection = dir;
        }
      }

      this.setPosition(nearestDirection, mouseX, mouseY);
      this.clamp();
    });
  }

  setPosition(direction, mouseX, mouseY) {
    this.direction = direction;

    const { DEFAULT_WIDTH, DEFAULT_HEIGHT, MARGIN } = Paddle;

    if (direction === Direction.TOP || direction === Direction.BOTTOM) {
      this.width = DEFAULT_WIDTH * this.scale;
      this.height = DEFAULT_HEIGHT;
      this.y =
        direction === Direction.TOP
          ? MARGIN
          : this.canvas.height - DEFAULT_HEIGHT - MARGIN;
      this.x = mouseX - this.width / 2;
    } else {
      this.width = DEFAULT_HEIGHT;
      this.height = DEFAULT_WIDTH * this.scale;
      this.x =
        direction === Direction.LEFT
          ? MARGIN
          : this.canvas.width - DEFAULT_HEIGHT - MARGIN;
      this.y = mouseY - this.height / 2;
    }

    if (!Paddle.IMAGES[direction]) {
      Paddle.loadImageForDirection(direction);
    }
  }

  clamp() {
    this.x = Math.max(0, Math.min(this.x, this.canvas.width - this.width));
    this.y = Math.max(0, Math.min(this.y, this.canvas.height - this.height));
  }

  checkCollision(ball) {
    const r = ball.constructor.RADIUS;
    const { x, y, width, height } = this;

    switch (this.direction) {
      case Direction.TOP:
        return (
          ball.y - r <= y + height &&
          ball.y >= y &&
          ball.x >= x &&
          ball.x <= x + width
        );
      case Direction.BOTTOM:
        return (
          ball.y + r >= y &&
          ball.y <= y + height &&
          ball.x >= x &&
          ball.x <= x + width
        );
      case Direction.LEFT:
        return (
          ball.x - r <= x + width &&
          ball.x >= x &&
          ball.y >= y &&
          ball.y <= y + height
        );
      case Direction.RIGHT:
        return (
          ball.x + r >= x &&
          ball.x <= x + width &&
          ball.y >= y &&
          ball.y <= y + height
        );
    }
  }

  onCollision(ball) {
    if (this.direction == Direction.TOP || this.direction == Direction.BOTTOM) {
      const relativeX = ball.x - this.x;
      const offsetRatio = (relativeX / this.width - 0.5) * 2; // -1(left) ~ 1(right)
      const verticalDir = this.direction === Direction.TOP ? 1 : -1;

      ball.bounceWithAngle(offsetRatio, verticalDir);

      // 위치 보정
      if (this.direction == Direction.TOP) {
        ball.y = this.y + this.height + ball.constructor.RADIUS;
      } else {
        ball.y = this.y - ball.constructor.RADIUS;
      }
    } else {
      ball.bounceX();

      if (this.direction == Direction.LEFT) {
        ball.x = this.x + this.width + ball.constructor.RADIUS;
      } else {
        ball.x = this.x - ball.constructor.RADIUS;
      }
    }
  }

  expand() {
    this.scale *= 1.5;
    this.setPosition(
      this.direction,
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }

  shrink() {
    this.scale *= 0.67;
    this.setPosition(
      this.direction,
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }

  resetSize() {
    this.scale = 1;
    this.setPosition(
      this.direction,
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }

  draw(ctx) {
    const image = Paddle.IMAGES[this.direction];
    if (image && image.complete) {
      ctx.drawImage(image, this.x, this.y, this.width, this.height);
    } else {
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = Paddle.COLOR;
      ctx.fill();
      ctx.closePath();
    }
  }
}

class Score {
  constructor() {
    this.score = 0;
    this.pointPerBrick = 10;
    this.container = document.getElementById("score");
    this.render();
  }

  reset(level) {
    this.score = 0;
    if (level === "EASY") this.pointPerBrick = 10;
    else if (level === "NORMAL") this.pointPerBrick = 20;
    else if (level === "HARD") this.pointPerBrick = 30;
    this.render();
  }

  addPoint() {
    this.score += this.pointPerBrick;
    this.render();
  }

  get() {
    return this.score;
  }

  render() {
    if (!this.container) return;
    this.container.innerText = this.score;
  }
}

class SoundManager {
  constructor() {
    this.currentBGM = null;
    this.bgmEnabled = true;
    this.sfxEnabled = true;

    this.tracks = {
      start: new Audio("assets/start.mp3"),
      lobby: new Audio("assets/lobby.mp3"),
      game1: new Audio("assets/map1.mp3"),
      game2: new Audio("assets/map2.mp3"),
      game3: new Audio("assets/map3.mp3"),
      gameover: new Audio("assets/lose.mp3"),
      victory: new Audio("assets/win.mp3"),
      clicked: new Audio("assets/button_click.mp3"),
      crash: new Audio("assets/crashblock.mp3"),
      item: new Audio("assets/get_item.mp3"),
      story: new Audio("assets/story_bgm.mp3"),
      endding: new Audio("assets/endding_bgm.mp3"),
    };

    for (const key of [
      "start",
      "lobby",
      "game1",
      "game2",
      "game3",
      "story",
      "endding",
    ]) {
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

  playClicked() {
    if (!this.sfxEnabled) return;
    const sfx = this.tracks.clicked;
    sfx.currentTime = 0;
    sfx.play();
  }

  playCrash() {
    if (!this.sfxEnabled) return;
    const sfx = this.tracks.crash;
    sfx.currentTime = 0;
    sfx.play();
  }

  playgetItem() {
    if (!this.sfxEnabled) return;
    const sfx = this.tracks.item;
    sfx.currentTime = 0;
    sfx.play();
  }

  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
  }
}

class BrickFactory {
  static createBricks(difficulty, canvasWidth) {
    const bricks = [];

    let rows, cols, hitCount, image;

    switch (difficulty) {
      case "EASY":
        rows = 5;
        cols = 8;
        hitCount = 1;
        image = brickImages.EASY;
        break;
      case "NORMAL":
        rows = 5;
        cols = 8;
        hitCount = 1;
        image = brickImages.NORMAL;
        break;
      case "HARD":
        rows = 5;
        cols = 8;
        hitCount = 1;
        image = brickImages.HARD;
        break;
    }

    const brickWidth = 80;
    const brickHeight = 80;
    const margin = 5;
    const offsetTop = 50;
    const totalWidth = cols * (brickWidth + margin) - margin;
    const offsetLeft = (canvasWidth - totalWidth) / 2;
    const indestructiblepos = [
      [0, 2],
      [0, 7],
      [3, 1],
      [3, 5],
    ];

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

    return bricks;
  }
}

const brickImages = {
  EASY: new Image(),
  NORMAL: new Image(),
  HARD: new Image(),
  OBSTACLE: new Image(),
};

brickImages.EASY.src = "assets/map1_box1.png";
brickImages.NORMAL.src = "assets/map3_box1.png";
brickImages.HARD.src = "assets/map2_box1.png";
brickImages.OBSTACLE.src = "assets/map3_box3.png";

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

const storyText = [
  '"이 몸, 문어보스! 드디어 돌아왔다…!"',
  '"매번 물풍선에 터지고, 또 터지고… 웃음거리였던 그날들!"',
  '"하지만 이제는 다르다. 이젠 내가 공을 던질 차례지."',
  '"너희가 쌓아올린 벽을… 하나씩, 조용히… 무너뜨려주마!"',
  '"이 복수의 물줄기, 견딜 수 있을까? 후후후…"',
];
let textIdx = 0;

// ===================== 이미지 로딩 및 초기 시작 ===================== //
function loadImage(img) {
  return new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });
}

function startLevel(selectedLevel) {
  if (selectedLevel === "LOBBY") {
    sound.playBGM("endding");
    showScreen("#finalStory");
    return;
  }
  level = selectedLevel;
  levelManager.setLevel(level);
  lives.reset();
  score.reset(level);

  backgroundImg = new Image();
  backgroundImg.src = `assets/map${
    level === "EASY" ? 1 : level === "NORMAL" ? 2 : 3
  }.png`;

  bricks = BrickFactory.createBricks(level, canvas.width);
  for (const brick of bricks) {
    collisionManager.add(brick);
    brick.counted = false;
  }

  ball = new Ball(
    canvas.width / 2,
    canvas.height / 2 + 150,
    canvas,
    selectedBallImage
  );
  lives.setlife(level == "EASY" ? 5 : level == "NORMAL" ? 4 : 3);
  ball.setCollisionManager(collisionManager);

  sound.playBGM(
    level === "EASY" ? "game1" : level === "NORMAL" ? "game2" : "game3"
  );

  $("#level").hide();
  $("#readyScreen").hide(); // 다음 레벨 넘어갈 때 준비 화면 생략
  $("#gameCanvas").show();
  $("#game").show();
  gameStarted = true;
}

function getNextLevel(current) {
  if (current === "EASY") return "NORMAL";
  if (current === "NORMAL") return "HARD";
  if (current === "HARD") return "LOBBY";
  return "EASY"; // HARD 이후엔 로비로로
}

Promise.all([
  loadImage(ballImages.ball1),
  loadImage(ballImages.ball2),
  loadImage(ballImages.ball3),
]).then(() => {
  selectedBallImage = ballImages.ball1;
  //sound.playBGM("story");
  draw();
});

// ===================== 게임 루프 ===================== //
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (backgroundImg)
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

  if (gameStarted) {
    if (!ball) {
      if (showGameOverImg && gameOverImg.complete) {
        ctx.drawImage(
          gameOverImg,
          (canvas.width - 300) / 2,
          (canvas.height - 150) / 2,
          300,
          150
        );
      }
      if (showVictoryImg && victoryImg.complete) {
        ctx.drawImage(
          victoryImg,
          (canvas.width - 300) / 2,
          (canvas.height - 150) / 2,
          300,
          150
        );
      }
      requestAnimationFrame(draw);
      return;
    }

    ball.move();

    if (ball.isDead()) {
      lives.lose();

      if (!lives.isDead()) {
        ball = new Ball(
          canvas.width / 2,
          canvas.height / 2 + 150,
          canvas,
          selectedBallImage
        );
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

  bricks.forEach((brick) => {
    brick.draw(ctx);

    if (brick.destroyed && !brick.counted) {
      score.addPoint();
      brick.counted = true;
      sound.playCrash();
      if (Math.random() < 0.15 && level != "EASY") {
        const types = [
          "heart",
          "heartdebuff",
          "speedbuff",
          "speeddebuff",
          "paddlebuff",
          "paddledebuff",
        ];
        const type = types[Math.floor(Math.random() * types.length)];
        items.push(
          new Item(
            brick.x + brick.width / 2 - 30,
            brick.y + brick.height / 2 - 30,
            type
          )
        );
      }
    }
  });

  items.forEach((item) => {
    if (!item.collected) {
      item.draw(ctx);

      if (item.checkCollisionWithBall(ball)) {
        item.collect();
        addItemToInventory(item.type);
        sound.playgetItem();
        if (item.type === "heart") lives.gain();
        else if (item.type === "heartdebuff") lives.lose();
        else if (item.type === "speedbuff") ball?.adjustSpeed?.(0.8);
        else if (item.type === "speeddebuff") ball?.adjustSpeed?.(1.2);
        else if (item.type === "paddlebuff") paddle.expand();
        else if (item.type === "paddledebuff") paddle.shrink();
      }
    }
  });

  const allDestroyed = bricks.length > 0 && bricks.every((b) => b.destroyed);
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
  paddle.resetSize();

  collisionManager.reset();
  collisionManager.add(paddle);

  $("#finalStory").hide();
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
showScreen("#startStory");
sound.playBGM("end");
$("#startStory .storyTextContainer").click(function () {
  if (textIdx == 0) {
    sound.playBGM("story");
  }
  if (textIdx < storyText.length) {
    sound.playClicked();
    $(".storyText").text(storyText[textIdx++]);
  } else {
    sound.playClicked();
    showScreen("#startScreen");
    sound.playBGM("start");
  }
});
$(document).keydown(function (e) {
  if ($("#startStory").is(":visible") && e.code === "Space") {
    if (textIdx == 0) {
      sound.playBGM("story");
    }
    if (textIdx < storyText.length) {
      sound.playClicked();
      $(".storyText").text(storyText[textIdx++]);
    } else {
      sound.playClicked();
      showScreen("#startScreen");
      sound.playBGM("start");
    }
  } else if ($("#startStory").is(":visible") && e.code === "Enter") {
    sound.playClicked();
    showScreen("#startScreen");
    sound.playBGM("start");
  }
});

$("#levelTitle img").click(() => $("#settingOverlay").css("display", "flex"));
$("#settingTitle img").click(() => $("#settingOverlay").css("display", "none"));

$(".ballCheck").click(function () {
  $(".ballCheck")
    .css("background", "#B8CED4")
    .find(".ballCheckBox")
    .css("background", "#70757E")
    .find("img")
    .hide();

  $(this)
    .css("background", "#08C6FE")
    .find(".ballCheckBox")
    .css("background", "#3171D7")
    .find("img")
    .show();

  const src = $(this).children("img").attr("src");
  selectedBallImage = src.includes("settingBall2")
    ? ballImages.ball2
    : src.includes("settingBall3")
    ? ballImages.ball3
    : ballImages.ball1;

  if (ball) ball.changeImage(selectedBallImage);
});

$("#gameStart").click(() => {
  showScreen("#level");
  sound.playClicked();
  sound.playBGM("lobby");
});

$("#gameDesc").click(function () {
  showScreen("#desc");
  $("#desc img").hide();
  $("#desc img").first().show();
});

$("#desc img").click(function () {
  const nextImg = $(this).next("img");
  sound.playClicked();
  $(this).hide();

  if (nextImg.length) {
    nextImg.show();
  } else {
    $("#desc").hide();
    $("#startScreen").show();
  }
});

$(".levelButton").click(function () {
  $(".levelButton").removeClass("selected");
  $(this).addClass("selected");
  sound.playClicked();
});

$("#pass").click(() => {
  $(".levelButton").removeClass("selected");
  showScreen("#startScreen");
  sound.playClicked();
  sound.playBGM("start");
});

$("#levelselect").click(() => {
  if ($(".levelButton.selected").length === 0) {
    alert("난이도를 선택하세요.");
    return;
  }

  const selectedBtn = $(".levelButton.selected img").attr("id");
  level =
    selectedBtn === "easygame"
      ? "EASY"
      : selectedBtn === "normalgame"
      ? "NORMAL"
      : "HARD";

  levelManager.setLevel(level);
  lives.reset();
  score.reset(level);

  backgroundImg = new Image();
  backgroundImg.src = `assets/map${
    level === "EASY" ? 1 : level === "NORMAL" ? 2 : 3
  }.png`;

  bricks = BrickFactory.createBricks(level, canvas.width);
  for (const brick of bricks) {
    collisionManager.add(brick);
    brick.counted = false;
  }

  ball = new Ball(
    canvas.width / 2,
    canvas.height / 2 + 150,
    canvas,
    selectedBallImage
  );
  lives.setlife(level == "EASY" ? 5 : level == "NORMAL" ? 4 : 3);
  ball.setCollisionManager(collisionManager);

  sound.playBGM(
    level === "EASY" ? "game1" : level === "NORMAL" ? "game2" : "game3"
  );

  $("#level").hide();
  $("#readyScreen").show();
  $("#gameCanvas").show();
  $("#game").show();
  gameStarted = true;

  sound.playClicked();
});

$("#exit").click(() => {
  sound.playClicked();
  resetToStart(true);
});

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

  sound.playClicked();
});

$(document).on("keydown.finalStory", (e) => {
  if ($("#finalStory").is(":visible") && e.code === "Enter") {
    $(document).off("keydown.finalStory");
    resetToStart(true);
  }
});
