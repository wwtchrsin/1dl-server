const passwordSymbols = "!@#$%^&*+=_-"

export default {
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
    colors: [
      "black",
      "red",
      "orange",
      "yellow",
      "green",
      "aqua",
      "blue",
      "purple",
      "pink",
    ],
  },
  users: {
    loginLenMin: 8,
    loginLenMax: 16,
    loginPattern: "^[A-Za-z0-9_-]+$",
    passwordLenMin: 8,
    passwordLenMax: 24,
    passwordSymbols: passwordSymbols.split(""),
    passwordPattern: `^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[${passwordSymbols}])` +
      `[A-Za-z\\d${passwordSymbols}]+$`,
    nameLenMin: 8,
    nameLenMax: 16,
    states: [
      "inactive",
      "active",
      "suspended",
    ]
  }
}




