const passwordSymbols = "!@#$%^&*+=_-"

export const limits = {
  messages: {
    regions: ["en", "ru"],
    regionPattern: "^(en|ru)$",
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
    loginPattern: "^[A-Za-z0-9_-]{8,16}$",
    passwordLenMin: 8,
    passwordLenMax: 24,
    passwordSymbols: passwordSymbols.split(""),
    passwordPattern: `^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[${passwordSymbols}])` +
      `[A-Za-z\\d${passwordSymbols}]{8,24}$`,
    passwordHashSize: 128,
    nameLenMin: 8,
    nameLenMax: 16,
    states: [
      "inactive",
      "active",
      "suspended",
    ],
  },
  sessions: {
    sessionidSize: 128,
    sessionidHashSize: 128,
  },
}

export const patterns = {
  uuid: /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/,
  timestamp: /^[1-9][0-9]{8,10}$/,
  passwordHash: /^[0-9A-Fa-f]{128}$/,
  sessionid: /^[0-9A-Fa-f]{128}$/,
  login: new RegExp(limits.users.loginPattern),
  password: new RegExp(limits.users.passwordPattern),
  region: new RegExp(limits.messages.regionPattern),
}
       



