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

export default Item
