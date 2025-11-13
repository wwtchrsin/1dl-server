export const limits = {
  messages: {
    regions: ["en", "ru"],
    districtMin: 0,
    districtMax: 299,
    roomMin: 0,
    roomMax: 299,
    indexMin: 0,
    indexMax: 299,
    textLenMin: 16,
    textLenMax: 128,
  },
  users: {
    loginLenMax: 8,
    loginLenMin: 16,
    passwordLenMin: 8,
    passwordLenMax: 24,
    nameLenMin: 8,
    nameLenMax: 16,
  }
}
