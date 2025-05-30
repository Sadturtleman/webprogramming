import Brick from "../blockcrash/brick.js"
import brickImages from "./brickImages.js"

class BrickFactory {
  static createBricks(difficulty, canvasWidth) {
    const bricks = []

    let rows, cols, hitCount, image

    switch (difficulty) {
      case "EASY":
        rows = 3
        cols = 5
        hitCount = 1
        image = brickImages.EASY
        break
      case "NORMAL":
        rows = 5
        cols = 7
        hitCount = 2
        image = brickImages.NORMAL
        break
      case "HARD":
        rows = 6
        cols = 9
        hitCount = 3
        image = brickImages.HARD
        break
    }

    const brickWidth = 60
    const brickHeight = 20
    const margin = 10
    const offsetTop = 50
    const totalWidth = cols * (brickWidth + margin) - margin
    const offsetLeft = (canvasWidth - totalWidth) / 2

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetLeft + col * (brickWidth + margin)
        const y = offsetTop + row * (brickHeight + margin)
        const brick = new Brick(x, y, brickWidth, brickHeight, {
          hitCount,
          image
        })
        bricks.push(brick)
      }
    }

    return bricks
  }
}

export default BrickFactory