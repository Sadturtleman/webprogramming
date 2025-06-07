class Ball {
    static RADIUS = 40
    static COLOR = "#DD3333"

    constructor(x, y, dx = 15, dy = -15, canvas, imageObj) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.canvas = canvas;
        this.die = false;
        this.collisionManager = null;
        this.image = imageObj; // 이제 imageObj는 미리 로드된 Image 객체
    }

    changeImage(imgObj) {
        this.image = imgObj;
    }



    setCollisionManager(manager) {
        this.collisionManager = manager
    }

    move() {
        if (this.die) return

        this.checkWallCollision()

        if (this.collisionManager) {
            this.collisionManager.handle(this)
        }

        this.x += this.dx
        this.y += this.dy
    }

    isDead() {
        return this.die
    }

    bounceX() {
        this.dx = -this.dx
    }

    bounceY() {
        this.dy = -this.dy
    }

    checkWallCollision() {
        const { width, height } = this.canvas

        if (
            this.x - Ball.RADIUS < 0 || this.x + Ball.RADIUS > width ||
            this.y - Ball.RADIUS < 0 || this.y + Ball.RADIUS > height
        ) {
            this.die = true
        }
    }
    adjustSpeed(factor) {
        this.dx *= factor
        this.dy *= factor
    }

    bounceWithAngle(offsetRatio, verticalDir = -1) {
        const speed = Math.sqrt(this.dx ** 2 + this.dy ** 2)
        const maxAngle = Math.PI / 3  // 최대 60도

        const angle = offsetRatio * maxAngle
        this.dx = speed * Math.sin(angle)
        this.dy = verticalDir * Math.abs(speed * Math.cos(angle))  // 위(-1) 또는 아래(+1)
    }


    draw(ctx) {
        if (
            this.image &&
            this.image.complete &&
            this.image.naturalWidth > 0 &&
            this.image.naturalHeight > 0
        ) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, Ball.RADIUS, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(
            this.image,
            this.x - Ball.RADIUS,
            this.y - Ball.RADIUS,
            Ball.RADIUS * 2,
            Ball.RADIUS * 2
            );
            ctx.restore();
        } else {
            // fallback: 원형 색상 공
            ctx.beginPath();
            ctx.arc(this.x, this.y, Ball.RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = Ball.COLOR;
            ctx.fill();
            ctx.closePath();
        }
    }



}

export default Ball
