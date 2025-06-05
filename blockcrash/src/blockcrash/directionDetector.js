class DirectionDetector {
    static detect(ball, obj) {
        const r = ball.constructor.RADIUS

        const overlapLeft = ball.x + r - obj.x
        const overlapRight = obj.x + obj.width - (ball.x - r)
        const overlapTop = ball.y + r - obj.y
        const overlapBottom = obj.y + obj.height - (ball.y - r)

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)

        if (minOverlap === overlapLeft) return "LEFT"
        if (minOverlap === overlapRight) return "RIGHT"
        if (minOverlap === overlapTop) return "TOP"
        return "BOTTOM"
    }
}

export default DirectionDetector