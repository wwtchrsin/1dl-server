export const specialSymbols = "!@#$%^&*+=_-"

export const limits = {
  message: {
    region: {
      values: ["en", "ru"],
      pattern: "^(en|ru)$",
    },
    district: {
      min: 0,
      max: 299,
    },
    room: {
      min: 0,
      max: 299,
    },
    index: {
      min: 0,
      max: 299,
    },
    text: {
      minLen: 16,
      maxLen: 128,
    },
    color: {
      values: [
        "black",
        "red",
        "orange",
        "yellow",
        "green",
        "cyan",
        "blue",
        "purple",
        "pink",
      ]
    }
  },
  user: {
    login: {
      minLen: 8,
      maxLen: 16,
      pattern: "^[A-Za-z0-9_-]{8,16}$",
    },
    password: {
      minLen: 8,
      maxLen: 24,
      pattern: `^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[${specialSymbols}])` +
        `[A-Za-z\\d${specialSymbols}]{8,24}$`,
    },
    name: {
      minLen: 8,
      maxLen: 16,
    },
    state: {
      values: [
        "inactive",
        "active",
        "suspended",
      ]
    },
  },
  session: {
    sessionid: {
      len: 128,
      pattern: "^[0-9A-Fa-f]{128}$",
    }
  }
}

export const hashSizes = {
  password: 128,
  sessionid: 128,
}

export const patterns = {
  uuid: /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/,
  timestamp: /^[1-9][0-9]{8,10}$/,
  passwordHash: /^[0-9A-Fa-f]{128}$/,
  sessionid: new RegExp(limits.session.sessionid.pattern),
  login: new RegExp(limits.user.login.pattern),
  password: new RegExp(limits.user.password.pattern),
  region: new RegExp(limits.message.region.pattern),
}
       



