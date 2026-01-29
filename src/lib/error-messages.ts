import { limits, specialSymbols } from "./database/limits"
import type { TextResource } from "./langs"

const passwordSymbols = specialSymbols.split("").map(r => `"${r}"`).join(", ")

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
  message: Record<string, TextResource>,
  user: Record<string, TextResource>,
  auth: Record<string, TextResource>,
}

export const wrongValues: WrongValues = {
  message: {
    region: {
      en: getErrorCause("en", "region") + " Valid values: " + 
        limits.message.region.values.join(", ") + ".",
      ru: getErrorCause("ru", "region") + " Корректные значения: " +
        limits.message.region.values.join(", ") + ".",
    },
    district: {
      en: getErrorCause("en", "district") + " " +
        getCorrectRange("en", limits.message.district.min, limits.message.district.max),
      ru: getErrorCause("ru", "district") + " " + 
        getCorrectRange("ru", limits.message.district.min, limits.message.district.max),
    },
    zone: {
      en: getErrorCause("en", "zone") + " " + 
        getCorrectRange("en", limits.message.zone.min, limits.message.zone.max),
      ru: getErrorCause("ru", "zone") + " " + 
        getCorrectRange("ru", limits.message.zone.min, limits.message.zone.max),
    },
    index: {
      en: getErrorCause("en", "index") + " " + 
        getCorrectRange("en", limits.message.index.min, limits.message.index.max),
      ru: getErrorCause("ru", "index") + " " + 
        getCorrectRange("ru", limits.message.index.min, limits.message.index.max),
    },
    text: {
      en: "The message length must be within the range " +
        `[${limits.message.text.minLen}, ${limits.message.text.maxLen}]`,
      ru: "Длина сообщения должна находиться в интервале " +
        `[${limits.message.text.minLen}, ${limits.message.text.maxLen}]`,
    },
    color: {
      en: getErrorCause("en", "color") + " Valid values: " + 
        limits.message.color.values.join(", ") + ".",
      ru: getErrorCause("ru", "color") + " Корректные значения: " +
        limits.message.color.values.join(", ") + ".",
    },
  },
  user: {
    region: {
      en: getErrorCause("en", "region") + " Valid values: " + 
        limits.message.region.values.join(", ") + ".",
      ru: getErrorCause("ru", "region") + " Корректные значения: " +
        limits.message.region.values.join(", ") + ".",
    },
    login: {
      en: "Login not accepted. The login can only contain latin letters, digits, " +
        'and symbols "-" and "_". The login length must be between ' +
        `${limits.user.login.minLen} and ${limits.user.login.maxLen} symbols.`,
      ru: "Логин не принят. Логин может содержать только латинские буквы, цифры, " +
        'и символы "-" и "_". Длина логина должна находиться в интервале от ' +
        `${limits.user.login.minLen} до ${limits.user.login.maxLen} символов.`,
    },
    password: {
      en: "Password not accepted. The password can only contain latin letters, " +
        `digits and special symbols (${passwordSymbols}), ` +
        "and must contain at least one lowercase letter, one uppercase letter, " +
        "one digit and one special symbol. The password length must be between " +
        `${limits.user.password.minLen} and ${limits.user.password.maxLen} symbols.`,
      ru: "Пароль не принят. Пароль может содержать только латинские буквы, цифры, " +
        `и специальные символы (${passwordSymbols}), ` +
        "и должен содержать хотя бы одну строчную букву, одну заглавную букву, " +
        "одну цифру и один специальный символ. Длина пароля должна находиться в интервале от " +
        `${limits.user.password.minLen} до ${limits.user.password.maxLen} символов.`
    },
    name: {
      en: "Wrong user name. The name length must be between " +
        `${limits.user.name.minLen} and ${limits.user.name.maxLen} symbols.`,
      ru: "Недопустимое имя пользователя. Длина имени должна находиться в интервале от " +
        `${limits.user.name.minLen} до ${limits.user.name.maxLen} символов.`,
    },
    userid: {
      en: "Wrong user identifier",
      ru: "Недопустимый идентификатор пользователя",
    },
  },
  auth: {
    region: {
      en: "Region is not set or incorrect",
      ru: "Регион не задан или имеет недопустимое значение",
    },
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

export const appErrors: Record<string, TextResource> = {
  actionNotAllowed: {
    en: "Action not allowed",
    ru: "Действие запрещено",
  },
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
  getUserMessages: {
    en: "Impossible to retrieve user messages",
    ru: "Невозможно извлечь сообщения пользователя",
  },
  deleteProfile: {
    en: "Impossible to delete profile",
    ru: "Невозможно удалить профиль",
  },
  deleteMessage: {
    en: "Impossible to delete message",
    ru: "Невозможно удалить сообщение",
  },
  countDistrictMessages: {
    en: "Impossible to count messages",
    ru: "Невозможно посчитать сообщения",
  },
  countRegionMessages: {
    en: "Impossible to count messages",
    ru: "Невозможно посчитать сообщения",
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

export const errorMessages = (() => {
  let errmsgs: Record<string, TextResource> = {}
  for ( let group of ["message", "user", "auth"] ) { 
    for ( let item in wrongValues[group] ) {
      let tag = `wrongValue.${group}.${item}`
      errmsgs[tag] = wrongValues[group][item]
    }
  }
  for ( let item in appErrors ) {
    let tag = `appError.${item}`
    errmsgs[tag] = appErrors[item]
  }
  for ( let item in databaseErrors ) {
    let tag = `databaseError.${item}`
    errmsgs[tag] = databaseErrors[item]
  }
  for ( let item in databaseConflicts ) {
    let tag = `databaseConflict.${item}`
    errmsgs[tag] = databaseConflicts[item]
  }
  return errmsgs
})()

export const getStatusCode = (error: string | undefined, successCode: number = 200): number => {
  if ( error === undefined ) {
    return successCode
  }
  if ( errorMessages[error] === undefined ) {
    return 500
  }
  let err = error.split(".")
  switch ( err[0] ) {
    case "wrongValue": {
      switch ( error ) {
        case "wrongValue.auth.header":
        case "wrongValue.auth.sessionid": {
          return 401
        }
        default: {
          return 400
        }
      }
    }
    case "appError": {
      switch ( err[1] ) {
        case "actionNotAllowed": {
          return 403
        }
      }
    }
    case "databaseError": {
      return 500
    }
    case "databaseConflict": {
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

export const getAuthStatus = (status: number): number => {
  switch ( status ) {
    case 400:
    case 404:
    case 409: {
      return 401
    }
    default: {
      return status
    }
  }
}


