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

export default Score
