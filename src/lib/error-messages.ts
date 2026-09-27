import { limits, specialSymbols } from "./database/limits"
import type { TextResource } from "./langs"

const passwordSymbols = specialSymbols.split("").map(r => `"${r}"`).join(", ")

type WrongValues = {
  message: Record<string, TextResource>,
  user: Record<string, TextResource>,
  auth: Record<string, TextResource>,
}

export const wrongValues: WrongValues = {
  message: {
    region: {
      en: "An incorrect value for region. Valid values: " + 
        limits.message.region.values.join(", ") + ".",
      ru: "Неверное значение для региона. Корректные значения: " +
        limits.message.region.values.join(", ") + ".",
    },
    tag: {
      en: "An incorrect value for tag. The message tag must be a string " +
        "containing lowercase latin letters only, between " + 
        `${limits.message.tag.minLen} and ${limits.message.tag.maxLen} characters in length.`,
      ru: "Метке сообщения задано неверное значение. Метка должна быть строкой " +
        "содержащей только строчные латинские буквы и имеющей длину от " +
        `${limits.message.tag.minLen} до ${limits.message.tag.maxLen} символов.`,
    },
    index: {
      en: "An incorrect value for index. " + 
        "The value must be an integer within the range of " +
        `[${limits.message.index.min}, ${limits.message.index.max}]`,
      ru: "Неверное значение для индекса. " + 
        "Значение должно быть целым числов находящимся в интервале " +
        `[${limits.message.index.min}, ${limits.message.index.max}]`,
    },
    text: {
      en: "An incorrect value for text. " +
        " The message text can only contain printable ASCII characters " +
        "(latin letters, digits, spaces, punctuation marks and some other characters " +
        'like "#" or "@") and cannot have trailing or leading spaces ' +
        "nor have more than one space in a row. " +
        "The message length must be within the range of " +
        `[${limits.message.text.minLen}, ${limits.message.text.maxLen}]`,
      ru: "Неверное значение для теста. " +
        " Текст сообщения может содержать только печатные символы таблицы ASCII " +
        "(латинские буквы, цифры, пробелы, знаки препинания и некоторые другие " +
        'символы как "@" или "#") и не может начинаться или заканчиваться пробелом ' +
        "или содержать больше одного пробела подряд. " +
        "Длина сообщения должна находиться в интервале " +
        `[${limits.message.text.minLen}, ${limits.message.text.maxLen}]`,
    },
    color: {
      en: "An incorrect value for color. Valid values: " + 
        limits.message.color.values.join(", ") + ".",
      ru: "Неверное значение для цвета. Корректные значения: " +
        limits.message.color.values.join(", ") + ".",
    },
  },
  user: {
    region: {
      en: "An incorrect value for region. Valid values: " + 
        limits.message.region.values.join(", ") + ".",
      ru: "Неверное значение для региона. Корректные значения: " +
        limits.message.region.values.join(", ") + ".",
    },
    login: {
      en: "An incorrect value for login. " +
        " The login can only contain latin letters, digits, " +
        'and symbols "-" and "_". The login length must be within the range of ' +
        `[${limits.user.login.minLen}, ${limits.user.login.maxLen}].`,
      ru: "Неверное значение для логина. " +
        " Логин может содержать только латинские буквы, цифры, " +
        'и символы "-" и "_". Длина логина должна находиться в интервале ' +
        `[${limits.user.login.minLen}, ${limits.user.login.maxLen}].`,
    },
    password: {
      en: "An incorrect value for password. " +
        " The password can only contain latin letters, " +
        `digits and special symbols (${passwordSymbols}), ` +
        "and must contain at least one lowercase letter, one uppercase letter, " +
        "one digit and one special symbol. The password length must be within the range of " +
        `[${limits.user.password.minLen}, ${limits.user.password.maxLen}].`,
      ru: "Неверное значение для пароля. " +
        " Пароль может содержать только латинские буквы, цифры, " +
        `и специальные символы (${passwordSymbols}), ` +
        "и должен содержать хотя бы одну строчную букву, одну заглавную букву, " +
        "одну цифру и один специальный символ. Длина пароля должна находиться в интервале " +
        `[${limits.user.password.minLen}, ${limits.user.password.maxLen}].`
    },
    name: {
      en: "An incorrect value for name. " +
        " The user name can only contain latin letters, digits, " +
        'and symbols "-" and "_". The name length must be within the range of ' +
        `[${limits.user.name.minLen}, ${limits.user.name.maxLen}].`,
      ru: "Неверное значение для имени. " +
        " Имя пользователя может содержать только латинские буквы, цифры, " +
        'и символы "-" и "_". Длина имени должна находиться в интервале ' +
        `[${limits.user.name.minLen}, ${limits.user.name.maxLen}].`,
    },
    userid: {
      en: "Wrong user identifier",
      ru: "Недопустимый идентификатор пользователя",
    },
    deviceid: {
      en: "Wrong device identifier",
      ru: "Недопустимый идентификатор устройства",
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
    serviceid: {
      en: "Wrong service id",
      ru: "Недопустимый идентификатор сервиса",
    },
  }
}

export const appErrors: Record<string, TextResource> = {
  actionNotAllowed: {
    en: "Action not allowed",
    ru: "Действие запрещено",
  },
  unhandledError: {
    en: "Unknown unhandled error occurred",
    ru: "Произошла неизвестая необработанная ошибка",
  },
  wrongUrl: {
    en: "Wrong request URL",
    ru: "Неверный URL запроса",
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
  getDeviceid: {
    en: "Impossible to retrieve device identifier",
    ru: "Невозможно извлечь идентификатор устройства",
  },
  createSession: {
    en: "Impossible to create a session",
    ru: "Невозможно создать сессию",
  },
  verifyCredentials: {
    en: "Impossible to verify credentials",
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
  updateProfileColor: {
    en: "Impossible to update profile color",
    ru: "Невозможно обновить цвет профиля",
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

export const wsErrors: Record<string, TextResource> = {
  wrongLocation: {
    en: "WebSocket server: an incorrect value for location",
    ru: "Websocket сервер: неверное значение для локации",
  },
  wrongDeviceid: {
    en: "WebSocket server: an incorrect value for device identifier",
    ru: "Websocket сервер: неверное значение для идентификатора устройства",
  },
  wrongMessageType: {
    en: "WebSocket server: an incorrect value for message type",
    ru: "Websocket сервер: неверное значение для типа сообщения",
  },
  wrongJson: {
    en: "WebSocket server: impossible to decode the message",
    ru: "Websocket сервер: невозможно декодировать сообщение",
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
  for ( let item in wsErrors ) {
    let tag = `wsError.${item}`
    errmsgs[tag] = wsErrors[item]
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
        case "wrongValue.auth.sessionid":
        case "wrongValue.auth.serviceid": {
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
