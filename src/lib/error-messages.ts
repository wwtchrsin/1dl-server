import limits from "./database/limits"
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

export interface WrongValueMessages {
  messages: {
    region: TextResource
    district: TextResource
    room: TextResource
    index: TextResource
    text: TextResource
    color: TextResource
  },
  users: {
    login: TextResource,
    password: TextResource,
    name: TextResource,
  },
}
    
export const wrongValues: WrongValueMessages = {
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
  },
}

export const databaseErrors = {
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
}

export const databaseConflicts = {
  messageNotFound: {
    en: "Message not found",
    ru: "Сообщение не найдено",
  },
  messageAlreadyExists: {
    en: "Message already exists",
    ru: "Сообщение уже существует",
  },
}

export const errorsEqual = (errA: TextResource | undefined, errB: TextResource | undefined): boolean => {
  if ( errA === undefined && errB === undefined ) {
    return true
  }
  if ( errA === undefined || errB === undefined ) {
    return false
  }
  for ( let lang in errA ) {
    if ( errA[lang] !== errB[lang] ) {
      return false
    }
  }
  return true
}
