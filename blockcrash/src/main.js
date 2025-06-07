// ===================== 모듈 임포트 ===================== //
import Paddle from "./blockcrash/paddle.js";
import Ball from "./blockcrash/ball.js";
import CollisionManager from "./blockcrash/collisionManager.js";
import BrickFactory from "./interface/brickFactroy.js";
import levelManager from "./blockcrash/levelManager.js";
import Lives from "./blockcrash/lives.js";
import Score from "./blockcrash/score.js";
import SoundManager from "./blockcrash/soundManager.js";
import Item from "./blockcrash/item.js";


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
ballImages.ball1.src = "assets/settingBall.png";
ballImages.ball2.src = "assets/settingBall2.png";
ballImages.ball3.src = "assets/settingBall3.png";

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
        ball = new Ball(canvas.width / 2, canvas.height / 2, 2, -2, canvas, selectedBallImage);
        ball.setCollisionManager(collisionManager);
      } else {
        showGameOverImg = true;
        ball = null;
        sound.playGameOver();
        setTimeout(resetToStart, 3000);
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
    setTimeout(resetToStart, 3000);
  }

  requestAnimationFrame(draw);
}


// ===================== 상태 초기화 ===================== //
function resetToStart() {
  showGameOverImg = false;
  showVictoryImg = false;
  backgroundImg = null;
  bricks = [];
  ball = null;
  level = null;
  items.length = 0;
  gameStarted = false;

  collisionManager.reset();
  collisionManager.add(paddle);

  $(".item img").remove();
  showScreen("#startScreen");
  $("#gameCanvas").hide();
  sound.playBGM("start");
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

  ball = new Ball(canvas.width / 2, canvas.height / 2, 2, -2, canvas, selectedBallImage);
  lives.setlife(level == "EASY" ? 5 : level == "NORMAL" ? 4 : 3)
  ball.setCollisionManager(collisionManager);

  sound.playBGM(level === "EASY" ? "game1" : level === "NORMAL" ? "game2" : "game3");

  $("#level").hide();
  $("#readyScreen").show();
  $("#gameCanvas").show();
  $("#game").show();
  gameStarted = true;
});

$("#exit").click(() => resetToStart());

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
