class SoundManager {
  constructor() {
    this.currentBGM = null;
    this.bgmEnabled = true; // ✅ 배경음 켜짐 상태

    this.tracks = {
      start: new Audio("assets/start.mp3"),
      lobby: new Audio("assets/lobby.mp3"),
      game1: new Audio("assets/map1.mp3"),
      game2: new Audio("assets/map2.mp3"),
      game3: new Audio("assets/map3.mp3"),
      gameover: new Audio("assets/lose.mp3"),
      victory: new Audio("assets/win.mp3"),
    };

    for (const key of ["start", "lobby", "game1", "game2", "game3"]) {
      this.tracks[key].loop = true;
    }
  }

  playBGM(name) {
    this.stopBGM();
    if (!this.bgmEnabled) return; // ✅ 끄기 상태면 재생 안 함
    const track = this.tracks[name];
    if (track) {
      track.currentTime = 0;
      track.play().catch((e) => console.warn("Autoplay error:", e));
      this.currentBGM = track;
    }
  }

  stopBGM() {
    if (this.currentBGM) {
      this.currentBGM.pause();
      this.currentBGM.currentTime = 0;
      this.currentBGM = null;
    }
  }

  toggleBGM() {
    this.bgmEnabled = !this.bgmEnabled;
    if (!this.bgmEnabled) {
      this.stopBGM();
    }
  }

  playGameOver() {
    const sfx = this.tracks.gameover;
    sfx.currentTime = 0;
    sfx.play();
  }

  playVictory() {
    const sfx = this.tracks.victory;
    sfx.currentTime = 0;
    sfx.play();
  }

  pauseBGM() {
    if (this.current) {
      this.current.pause();
    }
  }

  resumeBGM() {
    if (this.current) {
      this.current.play().catch((e) => {
        console.warn("resume error", e);
      });
    }
  }


}


export default SoundManager
