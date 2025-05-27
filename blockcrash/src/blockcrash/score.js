class Score {
  constructor() {
    this.score = 0
    this.pointPerBrick = 10
  }

  reset(level) {
    this.score = 0
    if (level === "EASY") this.pointPerBrick = 10
    else if (level === "NORMAL") this.pointPerBrick = 20
    else if (level === "HARD") this.pointPerBrick = 30
  }

  addPoint() {
    this.score += this.pointPerBrick
  }

  get() {
    return this.score
  }

  draw(ctx, canvas) {
    ctx.font = "20px Do Hyeon"
    ctx.fillStyle = "#ffffff"
    ctx.fillText("점수: " + this.score, canvas.width - 120, 30)
  }
}

export default Score
