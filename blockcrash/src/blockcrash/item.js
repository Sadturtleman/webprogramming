class Item {
  static SIZE = 20  // 아이템의 너비/높이 (정사각형)

  constructor(x, y, type) {
    this.x = x
    this.y = y
    this.type = type
    this.collected = false
    this.speed = 2  // 아래로 떨어지는 속도

    this.image = new Image()
    this.image.src = `assets/${type}.png`
  }

  move() {
    this.y += this.speed
  }

  draw(ctx) {
    if (this.collected) return
    this.move()

    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, Item.SIZE, Item.SIZE)
    } else {
      // 이미지가 아직 로딩 중이면 대체 사각형 그리기
      ctx.fillStyle = "gold"
      ctx.fillRect(this.x, this.y, Item.SIZE, Item.SIZE)
    }
  }

  collect() {
    this.collected = true
    console.log(`Collected item: ${this.type}`)

    // 타입별 효과는 이곳에 적용해도 되고, draw()에서 수집 직후 외부에서 처리해도 됨
    // 예: if (this.type === "life") lives.gain()
  }
}

export default Item
