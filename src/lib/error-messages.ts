import { limits } from "./database/limits"
import type { TextResource } from "./langs"

const passwordSymbols = limits.users.passwordSymbols.map(r => `"${r}"`).join(", ")

const getErrorCause = (lang: string, parameter: string) => {
  if ( lang === "ru" ) {
    return `Следующему параметру задано неверное значение: ${parameter}.`
  }
  return `An incorrect value set for the following parameter: ${parameter}.`
}

const getCorrectRange = (lang: string, min: number, max: number) => {
  if ( lang === "ru" ) {
    return `Значение должно быть целым числов находящимся в интервале [${min}, ${max}].`
  }
  return `The value must be an integer within the range [${min}, ${max}].`
}

type WrongValues = {
  messages: Record<string, TextResource>,
  users: Record<string, TextResource>,
}

export const wrongValues: WrongValues = {
  messages: {
    region: {
      en: getErrorCause("en", "region") + " Valid values: " + 
        limits.messages.regions.join(", ") + ".",
      ru: getErrorCause("ru", "region") + " Корректные значения: " +
        limits.messages.regions.join(", ") + ".",
    },
    district: {
      en: getErrorCause("en", "district") + " " +
        getCorrectRange("en", limits.messages.districtMin, limits.messages.districtMax),
      ru: getErrorCause("ru", "district") + " " + 
        getCorrectRange("ru", limits.messages.districtMin, limits.messages.districtMax),
    },
    room: {
      en: getErrorCause("en", "room") + " " + 
        getCorrectRange("en", limits.messages.roomMin, limits.messages.roomMax),
      ru: getErrorCause("ru", "room") + " " + 
        getCorrectRange("ru", limits.messages.roomMin, limits.messages.roomMax),
    },
    index: {
      en: getErrorCause("en", "index") + " " + 
        getCorrectRange("en", limits.messages.indexMin, limits.messages.indexMax),
      ru: getErrorCause("ru", "index") + " " + 
        getCorrectRange("ru", limits.messages.indexMin, limits.messages.indexMax),
    },
    text: {
      en: "The message not sent. The message length must be within the range " +
        `[${limits.messages.textLenMin}, ${limits.messages.textLenMax}]`,
      ru: "Сообщение не отправлено. Длина сообщения должна находиться в интервале " +
        `[${limits.messages.textLenMin}, ${limits.messages.textLenMax}]`,
    },
    color: {
      en: getErrorCause("en", "color") + " Valid values: " + 
        limits.messages.colors.join(", ") + ".",
      ru: getErrorCause("ru", "color") + " Корректные значения: " +
        limits.messages.colors.join(", ") + ".",
    },
  },
  users: {
    login: {
      en: "Login not accepted. The login can only contain latin letters, digits, " +
        'and symbols "-" and "_". The login length must be between ' +
        `${limits.users.loginLenMin} and ${limits.users.loginLenMax} symbols.`,
      ru: "Логин не принят. Логин может содержать только латинские буквы, цифры, " +
        'и символы "-" и "_". Длина логина должна находиться в интервале от ' +
        `${limits.users.loginLenMin} до ${limits.users.loginLenMax} символов.`,
    },
    password: {
      en: "Password not accepted. The password can only contain latin letters, " +
        `digits and special symbols (${passwordSymbols}), ` +
        "and must contain at least one lowercase letter, one uppercase letter, " +
        "one digit and one special symbol. The password length must be between " +
        `${limits.users.passwordLenMin} and ${limits.users.passwordLenMax} symbols.`,
      ru: "Пароль не принят. Пароль может содержать только латинские буквы, цифры, " +
        `и специальные символы (${passwordSymbols}), ` +
        "и должен содержать хотя бы одну строчную букву, одну заглавную букву, " +
        "одну цифру и один специальный символ. Длина пароля должна находиться в интервале от " +
        `${limits.users.passwordLenMin} до ${limits.users.passwordLenMax} символов.`
    },
    name: {
      en: "Wrong user name. The name length must be between " +
        `${limits.users.nameLenMin} and ${limits.users.nameLenMax} symbols.`,
      ru: "Недопустимое имя пользователя. Длина имени должна находиться в интервале от " +
        `${limits.users.nameLenMin} до ${limits.users.nameLenMax} символов.`,
    },
    userid: {
      en: "Wrong user identifier",
      ru: "Недопустимый идентификатор пользователя",
    },
  },
  auth: {
    login: {
      en: "Login is not set or incorrect",
      ru: "Логин не задан или имеет недопустимое значение",
    },
    password: {
      en: "Password is not set or incorrect",
      ru: "Пароль не задан или имеет недопустимое значение",
    },
    header: {
      en: "Authorization header is not set or incorrect",
      ru: "Заголовок 'Authorization' не задан или имеет недопустимое значение",
    },
    sessionid: {
      en: "Wrong session identifier",
      ru: "Недопустимый идентификатор сессии",
    },
  }
}

export const databaseErrors: Record<string, TextResource> = {
  getMessages: {
    en: "Impossible to get the list of messages",
    ru: "Невозможно получить список сообщений",
  },
  getMessage: {
    en: "Impossible to get the message requested",
    ru: "Невозможно получить запрошенное сообщение",
  },
  createMessage: {
    en: "Impossible to save the message",
    ru: "Невозможно сохранить сообщение",
  },
  checkUserExists: {
    en: "Impossible to check if user exists",
    ru: "Невозможно проверить существует ли пользователь",
  },
  checkMessage: {
    en: "Impossible to check the message",
    ru: "Невозможно проверить сообщение",
  },
  createProfile: {
    en: "Impossible to create profile",
    ru: "Невозможно создать профиль",
  },
  deleteSession: {
    en: "Impossible to delete the session",
    ru: "Невозможно удалить сессию",
  },
  createSession: {
    en: "Impossible to create a session",
    ru: "Невозможно создать сессию",
  },
  checkCredentials: {
    en: "Impossible to check credentials",
    ru: "Невозможно проверить учетные данные пользователя",
  },
  getProfile: {
    en: "Impossible to retrieve profile data",
    ru: "Невозможно извлечь данные профиля",
  },
  getUserid: {
    en: "Impossible to retrieve user identifier",
    ru: "Невозможно извлечь идентификатор пользователя",
  },
}

export const databaseConflicts: Record<string, TextResource> = {
  messageNotFound: {
    en: "Message not found",
    ru: "Сообщение не найдено",
  },
  messageAlreadyExists: {
    en: "Message already exists",
    ru: "Сообщение уже существует",
  },
  loginTaken: {
    en: "The login is already taken",
    ru: "Логин уже используется",
  },
  sessionNotFound: {
    en: "Session not found",
    ru: "Сессия не найдена",
  },
  profileNotFound: {
    en: "Profile not found",
    ru: "Профиль не найден",
  },
}
  
export const getErrorMessage = (error: string | undefined): TextResource | undefined => {
  if ( error === undefined ) {
    return undefined
  }
  let err = error.split(".")
  switch ( err[0] ) {
    case "wrongValues": {
      switch ( err[1] ) {
        case "messages":
          return wrongValues.messages[err[2]]
        case "users":
          return wrongValues.users[err[2]]
        case "auth":
          return wrongValues.auth[err[2]]
        default:
          return undefined
      }
    }
    case "databaseErrors": {
      return databaseErrors[err[1]]
    }
    case "databaseConflicts": {
      return databaseConflicts[err[1]]
    }
    default: {
      return undefined
    }
  }
}

export const getStatusCode = (error: string | undefined, successCode: number = 200): number => {
  if ( error === undefined ) {
    return successCode
  }
  if ( getErrorMessage(error) === undefined ) {
    return 500
  }
  let err = error.split(".")
  switch ( err[0] ) {
    case "wrongValues": {
      switch ( error ) {
        case "wrongValues.auth.header":
        case "wrongValues.auth.sessionid": {
          return 401
        }
        default: {
          return 400
        }
      }
    }
    case "databaseErrors": {
      return 500
    }
    case "databaseConflicts": {
      switch ( err[1] ) {
        case "messageNotFound":
        case "sessionNotFound":
        case "profileNotFound": {
          return 404
        }
        case "messageAlreadyExists":
        case "loginTaken": {
          return 409
        }
      }
    }
  }
  return 500
}


