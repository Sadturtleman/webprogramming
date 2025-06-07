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

export default brickImages