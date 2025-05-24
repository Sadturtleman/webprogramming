class LevelManager {
  constructor() {
    this.currentLevel = null
  }

  setLevel(level) {
    this.currentLevel = level
  }

  getLevel() {
    return this.currentLevel
  }
}

const levelManager = new LevelManager()
export default levelManager
