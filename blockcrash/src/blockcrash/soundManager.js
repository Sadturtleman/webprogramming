class SoundManager {
  constructor() {
    this.current = null // 현재 재생 중인 오디오

    this.tracks = {
      start: new Audio("assets/start.mp3"),
      lobby: new Audio("assets/lobby.mp3"),
      game1: new Audio("assets/map1.mp3"),
      game2: new Audio("assets/map2.mp3"),
      game3: new Audio("assets/map3.mp3"),
      gameover: new Audio("assets/lose.mp3"),
      victory: new Audio("assets/win.mp3"),
    }

    // 루프 설정 (배경음들만)
    for (const key of ["start", "lobby", "game1", "game2", "game3"]) {
      this.tracks[key].loop = true
    }
  }

  play(name) {
    this.stop()
    const track = this.tracks[name]
    if (track) {
      track.currentTime = 0
      track.play().catch((e) => {
        console.warn("Autoplay error:", e)
      })
      this.current = track
    }
  }

  stop() {
    if (this.current) {
      this.current.pause()
      this.current.currentTime = 0
      this.current = null
    }
  }

  playGameOver() {
    this.stop()
    const sfx = this.tracks.gameover
    sfx.currentTime = 0
    sfx.play()
  }

  playVictory() {
    this.stop()
    const sfx = this.tracks.victory
    sfx.currentTime = 0
    sfx.play()
  }
}

export default SoundManager
