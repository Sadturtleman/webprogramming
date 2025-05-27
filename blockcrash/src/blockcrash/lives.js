class Lives {
  constructor(maxLives = 3) {
    this.max = maxLives
    this.remaining = maxLives
  }

  reset() {
    this.remaining = this.max
  }

  lose() {
    this.remaining--
  }

  isDead() {
    return this.remaining <= 0
  }

  draw(ctx) {
    ctx.font = "20px Do Hyeon"
    ctx.fillStyle = "#ffffff"
    ctx.fillText("목숨: " + this.remaining, 20, 30)
  }
}

export default Lives
