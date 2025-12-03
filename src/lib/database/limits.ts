const passwordSymbols = "!@#$%^&*+=_-"

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
    nameLenMin: 8,
    nameLenMax: 16,
    states: [
      "inactive",
      "active",
      "suspended",
    ]
  },
}

export const patterns = {
  uuid: /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/,
  timestamp: /^[1-9][0-9]{9,10}$/,
  passwordHash: /^[0-9A-Fa-f]{128}$/,
  sessionid: /^[0-9A-Fa-f]{128}$/,
  login: new RegExp(limits.users.loginPattern),
  password: new RegExp(limits.users.passwordPattern),
}

export const examples = {
  uuid: [
    "fbbce138-3d93-4b4e-bf51-8f60b94042c6",
    "1edbd190-fc00-47d6-a99b-8fa15b6c336e",
    "3a6586e3-9f73-4335-b70c-8e9c2cdcf9bc",
    "e21e15d3-d0ca-4368-b2cc-618482734de6",
  ],
  sessionid: [
    "9edc63713fc27b3d1e88f974e7b67552086d343ae1b6233c" +
      "1727a1d19672bbb10075ba97924013462c96193ca6c222ce31f6173781e53ba47caa8673d6cd7b2b",
    "848b7e7ef74e46be47a0ae3f97cebbdc224df5aed7f22347" + 
      "4f04bf7cc1b489a18b9509423eb2efcd4417a6fc930ac9d08ae4a170fc5e3708fa6e81863fad457b",
    "5194c386aa64e27fc2c2472038caf889f332c3c9fd2ce944" +
      "ee47d941f230643d3baa5f94fb5559e0acd25e3e830c94d27eb277fe5f06cc57098d02a29841a025",
    "9d6d7283de26caef3520704ac832a661abea19dfbef0314b" +
      "382e6c2f2fa617e134c35edd7eea95073be03d1606a7294f411a374ce2b658d0ac489f978e9da028",
  ],
  password: {
    minLen: "Aa!12345",
    maxLen: "Aa!12345".repeat(3),
    regLen: "Aa!123456",
    tooShort: "Aa!1234",
    tooLong: "*" + "Aa!12345".repeat(3),
    noCapitalLetters: "aa!12345",
    noSmallLetters: "AA!12345",
    noDigits: "Aa!@#$%^",
    noSpecialSymbols: "Aa123456",
    wrongSymbols: "Aa!1<345",
    correct: [
      "7890!@#$ABcd",
      "$$$@@@345678Mm",
      "A__##1234abcd",
      "!@#$%^&*+=_-Aa1",
    ]
  },
  login: {
    minLen: "Ab-_1234",
    maxLen: "Ab-_1234".repeat(2),
    regLen: "Ab-_12345",
    tooShort: "Ab-_123",
    tooLong: "A" + "Ab-_1234".repeat(2),
    digitsOnly: "12345678",
    lettersOnly: "abcdefgh",
    wrongSymbols: "Ab-_1$34",
    correct: [
      "89-Qwerty_",
      "-ASD-357__",
      "hhhTTT765ff",
      "__1234567890",
    ],
  },
  name: {
    minLen: "Ab1%,.<;",
    maxLen: "Ab1%,.<;".repeat(2),
    regLen: "Ab1%,.<;'",
    tooShort: "Ab1%,.<",
    tooLong: "A" + "Ab1%,.<;".repeat(2),
    correct: [
      "abcd abcd abcd",
      "1234 1234 1234",
      "@@@@ %%%% &&&&",
      "<<<< >>>> ''''",
    ],
  },
  text: {
    minLen: "Aacd 1234 #$ <.'",
    maxLen: "Aacd 1234 #$ <.'".repeat(8),
    regLen: "Aacd 1234 #$ <.'^",
    tooShort: "Aacd 1234 #$ <.",
    tooLong: "A" + "Aacd 1234 #$ <.'".repeat(8),
    correct: [
      "ABCD ABCD ABCD ABCD",
      "7890 7890 7890 7890",
      "**** ____ ---- ++++",
      "[[[[ ]]]] ;;;; ....",
    ]
  },
  region: {
    first: limits.messages.regions[0],
    last: limits.messages.regions[limits.messages.regions.length - 1],
    some: limits.messages.regions[1],
  },
  color: {
    first: limits.messages.colors[0],
    last: limits.messages.colors[limits.messages.colors.length - 1],
    some: limits.messages.colors[1],
  },
}
          
        



