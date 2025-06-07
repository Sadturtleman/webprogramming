import Brick from "../blockcrash/brick.js"
import brickImages from "./brickImages.js"

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

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {

        const isObstacle = difficulty === "HARD" && row === 4 && (col === 7 || col === 1)
        const imageToUse = isObstacle ? brickImages.OBSTACLE : image

        const x = offsetLeft + col * (brickWidth + margin)
        const y = offsetTop + row * (brickHeight + margin)
        const brick = new Brick(x, y, brickWidth, brickHeight, {
          hitCount : isObstacle ? Infinity : hitCount,
          image : imageToUse,
          indestructible : isObstacle
        })
        bricks.push(brick)
      }
    }

    return bricks
  }
}

export default BrickFactory