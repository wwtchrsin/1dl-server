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
    zone: {
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
      pattern: "^(?!.*\x20{2})[\x21-\x7E][\x20-\x7E]{14,126}[\x21-\x7E]$",
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
      pattern: "^[A-Za-z0-9_-]{8,16}$",
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
      size: 64,
      pattern: "^[0-9A-Fa-f]{128}$",
    }
  }
}

export const hashSizes = {
  password: 64,
  sessionid: 64,
}

export const patterns = {
  uuid: /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/,
  timestamp: /^[1-9][0-9]{8,10}$/,
  passwordHash: /^[0-9A-Fa-f]{128}$/,
  sessionid: new RegExp(limits.session.sessionid.pattern),
  login: new RegExp(limits.user.login.pattern),
  password: new RegExp(limits.user.password.pattern),
  name: new RegExp(limits.user.name.pattern),
  region: new RegExp(limits.message.region.pattern),
  text: new RegExp(limits.message.text.pattern),
}
       



