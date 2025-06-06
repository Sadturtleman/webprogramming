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

export default Lives;
