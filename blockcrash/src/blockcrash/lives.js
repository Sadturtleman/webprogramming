class Lives {
    constructor(max = 3) {
        this.max = max;
        this.current = max;
        this.icon = new Image();
        this.icon.src = "assets/heart.png";
        this.iconSize = 32;
    }

    reset() {
        this.current = this.max;
    }

    lose() {
        if (this.current > 0) {
            this.current--;
        }
    }

    isDead() {
        return this.current <= 0;
    }

    draw(ctx) {
        for (let i = 0; i < this.current; i++) {
            ctx.drawImage(this.icon, 10 + i * (this.iconSize + 5), 10, this.iconSize, this.iconSize);
        }
    }
}
export default Lives;
