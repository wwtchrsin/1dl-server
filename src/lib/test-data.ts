import { randomUUID, randomBytes } from "node:crypto"
import { limits } from "./database/limits"
import { hashPassword, hashSession } from "./database/miscs"

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
      "<<<< >>>> ;;;;",
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

export const databaseActiveUsers = [
  /*[0]*/ 0,
  /*[1]*/ 1,
  /*[2]*/ 2,
  /*[3]*/ 3,
  /*[4]*/ 4,
  /*[5]*/ 5,
  /*[6]*/ 6,
  /*[7]*/ 7,
  /*[8]*/ 8,
  /*[9]*/ 9,
  /*[10]*/ 10,
  /*[11]*/ 11,
]

export const databaseInactiveUsers = [
  /*[0]*/ 12,
  /*[1]*/ 13,
  /*[2]*/ 14,
  /*[3]*/ 15,
]

export const databaseUsers = (() => {
  let result = []
  for ( let i=0; i < 16; i++ ) {
    let postfix = String.fromCharCode(97 + i % 26)
    let login = examples.login.correct[i % examples.login.correct.length] + postfix
    let password = examples.password.correct[i % examples.password.correct.length] + postfix
    let name = examples.name.correct[i % examples.name.correct.length] + postfix
    let passwordHash = hashPassword(login, password)
    let isActive = databaseActiveUsers.includes(i)
    let state = isActive ? "active" : "inactive"
    let timestamp = "12345670" + ("0" + i).slice(-2)
    result.push({
      userid: randomUUID(),
      login: login,
      password: password,
      passwordHash: passwordHash,
      name: name,
      state: state,
      puid: randomUUID(),
      timestamp: timestamp,
    })
  }
  return result
})()

export const userBySession = [
  /*[0]*/ 0,
  /*[1]*/ 1,
  /*[2]*/ 2,
  /*[3]*/ 3,
  /*[4]*/ 4,
  /*[5]*/ 5,
  /*[6]*/ 6,
  /*[7]*/ 7,
  /*[8]*/ 12,
  /*[9]*/ 13,
]

export const sessionByUser = (() => {
  let result = []
  for ( let i=0; i < userBySession.length; i++ ) {
    result[userBySession[i]] = i
  }
  return result
})()

export const databaseSessions = (() => {
  let result = []
  for ( let i=0; i < userBySession.length; i++ ) {
    let userid = databaseUsers[userBySession[i]].userid
    let sessionid = randomBytes(limits.sessions.sessionidSize / 2).toString("hex")
    let sessionidHash = hashSession(sessionid)
    let timestamp = "12345671" + ("0" + i).slice(-2)
    result.push({
      userid: userid,
      sessionid: sessionid,
      sessionidHash: sessionidHash,
      timestamp: timestamp,
    })
  }
  return result
})()


export const userByMessage = [
  /*[0]*/ 0,
  /*[1]*/ 1,
  /*[2]*/ 2,
  /*[3]*/ 3,
  /*[4]*/ 4,
  /*[5]*/ 5,
  /*[6]*/ 6,
  /*[7]*/ 7,
  /*[8]*/ 0,
  /*[9]*/ 1,
  /*[10]*/ 2,
  /*[11]*/ 3,
  /*[12]*/ 4,
  /*[13]*/ 5,
  /*[14]*/ 6,
  /*[15]*/ 13,
  /*[16]*/ 12,
  /*[17]*/ 11,
  /*[18]*/ 10,
  /*[19]*/ 9,
  /*[20]*/ 13,
  /*[21]*/ 12,
  /*[22]*/ 11,
  /*[23]*/ 10,
  /*[24]*/ 13,
  /*[25]*/ 12,
  /*[26]*/ 11,
  /*[27]*/ 13,
  /*[28]*/ 12,
  /*[29]*/ 13,
]

export const messagesByUser = (() => {
  let result = []
  for ( let i=0; i < userByMessage.length; i++ ) {
    if ( !result[userByMessage[i]] ) {
      result[userByMessage[i]] = []
    }
    result[userByMessage[i]].push(i)
  }
  return result
})()

export const databaseCompleteUsers = (() => {
  let result = []  
  for ( let i=0; i < databaseUsers.length; i++ ) {
    if ( !databaseActiveUsers.includes(i) ) {
      continue
    }
    if ( sessionByUser[i] === undefined ) {
      continue
    }
    if ( messagesByUser[i] === undefined ) {
      continue
    }
    result.push(i)
  }
  return result
})()

export const databaseDistricts = [
  /*[0]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMin + 4,
  },
  /*[1]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMin + 8,
  },
  /*[2]*/ {
    region: limits.messages.regions[1],
    district: limits.messages.districtMax - 4,
  },
]

export const databaseRooms = [
  /*[0]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMin + 4,
    room: limits.messages.roomMin + 4,
  },
  /*[1]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMin + 4,
    room: limits.messages.roomMin + 8,
  },
  /*[2]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMin + 4,
    room: limits.messages.roomMax - 4,
  },
  /*[3]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMin + 8,
    room: limits.messages.roomMin + 4,
  },
  /*[4]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMin + 8,
    room: limits.messages.roomMin + 8,
  },
  /*[5]*/ {
    region: limits.messages.regions[1],
    district: limits.messages.districtMax - 4,
    room: limits.messages.roomMin + 4,
  },
  /*[6]*/ {
    region: limits.messages.regions[1],
    district: limits.messages.districtMax - 4 ,
    room: limits.messages.roomMax - 4,
  },
]

export const databaseEmptyDistricts = [
  /*[0]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMin,
  },
  /*[1]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMax,
  },
  /*[2]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMin + 1,
  },
  /*[3]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMax - 1,
  },
  /*[4]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMin + 2,
  },
  /*[5]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMax - 2,
  },
  /*[6]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMin + 3,
  },
  /*[7]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMax - 3,
  },
]

export const databaseEmptyRooms = [
  /*[0]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMin,
    room: limits.messages.roomMin,
  },
  /*[1]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMax,
    room: limits.messages.roomMax,
  },
  /*[2]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMin + 1,
    room: limits.messages.roomMin + 1,
  },
  /*[3]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMax - 1,
    room: limits.messages.roomMax - 1,
  },
  /*[4]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMin + 2,
    room: limits.messages.roomMin + 2,
  },
  /*[5]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMax - 2,
    room: limits.messages.roomMax - 2,
  },
  /*[6]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMin + 3,
    room: limits.messages.roomMin + 3,
  },
  /*[7]*/ {
    region: limits.messages.regions[0],
    district: limits.messages.districtMax - 3,
    room: limits.messages.roomMax - 3,
  },
]

export const roomByMessage = [
  /*[0]*/ 0,
  /*[1]*/ 0,
  /*[2]*/ 0,
  /*[3]*/ 0,
  /*[4]*/ 0,
  /*[5]*/ 0,
  /*[6]*/ 1,
  /*[7]*/ 1,
  /*[8]*/ 1,
  /*[9]*/ 1,
  /*[10]*/ 2,
  /*[11]*/ 2,
  /*[12]*/ 3,
  /*[13]*/ 3,
  /*[14]*/ 3,
  /*[15]*/ 3,
  /*[16]*/ 3,
  /*[17]*/ 4,
  /*[18]*/ 4,
  /*[19]*/ 4,
  /*[20]*/ 5,
  /*[21]*/ 5,
  /*[22]*/ 5,
  /*[23]*/ 5,
  /*[24]*/ 5,
  /*[25]*/ 5,
  /*[26]*/ 6,
  /*[27]*/ 6,
  /*[28]*/ 6,
  /*[29]*/ 6,
]

export const districtByMessage = [
  /*[0]*/ 0,
  /*[1]*/ 0,
  /*[2]*/ 0,
  /*[3]*/ 0,
  /*[4]*/ 0,
  /*[5]*/ 0,
  /*[6]*/ 0,
  /*[7]*/ 0,
  /*[8]*/ 0,
  /*[9]*/ 0,
  /*[10]*/ 0,
  /*[11]*/ 0,
  /*[12]*/ 1,
  /*[13]*/ 1,
  /*[14]*/ 1,
  /*[15]*/ 1,
  /*[16]*/ 1,
  /*[17]*/ 1,
  /*[18]*/ 1,
  /*[19]*/ 1,
  /*[20]*/ 2,
  /*[21]*/ 2,
  /*[22]*/ 2,
  /*[23]*/ 2,
  /*[24]*/ 2,
  /*[25]*/ 2,
  /*[26]*/ 2,
  /*[27]*/ 2,
  /*[28]*/ 2,
  /*[29]*/ 2,
]

let regionByMessage = [
  /*[0]*/ 0,
  /*[1]*/ 0,
  /*[2]*/ 0,
  /*[3]*/ 0,
  /*[4]*/ 0,
  /*[5]*/ 0,
  /*[6]*/ 0,
  /*[7]*/ 0,
  /*[8]*/ 0,
  /*[9]*/ 0,
  /*[10]*/ 0,
  /*[11]*/ 0,
  /*[12]*/ 0,
  /*[13]*/ 0,
  /*[14]*/ 0,
  /*[15]*/ 0,
  /*[16]*/ 0,
  /*[17]*/ 0,
  /*[18]*/ 0,
  /*[19]*/ 0,
  /*[20]*/ 1,
  /*[21]*/ 1,
  /*[22]*/ 1,
  /*[23]*/ 1,
  /*[24]*/ 1,
  /*[25]*/ 1,
  /*[26]*/ 1,
  /*[27]*/ 1,
  /*[28]*/ 1,
  /*[29]*/ 1,
]

export const messagesByRoom = (() => {
  let result = []
  for ( let i=0; i < roomByMessage.length; i++ ) {
    if ( result[roomByMessage[i]] === undefined ) {
      result[roomByMessage[i]] = []
    }
    result[roomByMessage[i]].push(i)
  }
  return result
})()

export const messagesByDistrict = (() => {
  let result = []
  for ( let i=0; i < districtByMessage.length; i++ ) {
    if ( result[districtByMessage[i]] === undefined ) {
      result[districtByMessage[i]] = []
    }
    result[districtByMessage[i]].push(i)
  }
  return result
})()

export const messagesByRegion = (() => {
  let result = []
  for ( let i=0; i < regionByMessage.length; i++ ) {
    if ( result[regionByMessage[i]] === undefined ) {
      result[regionByMessage[i]] = []
    }
    result[regionByMessage[i]].push(i)
  }
  return result
})()

export const databaseMessages = (() => {
  let result = []
  for ( let i=0; i < roomByMessage.length; i++ ) {
    let roomid = databaseRooms[roomByMessage[i]]
    let user = databaseUsers[userByMessage[i]]
    let text = examples.text.correct[i % examples.text.correct.length] + " " + i
    let color = limits.messages.colors[i % limits.messages.colors.length]
    let timestamp = "12345672" + ("0" + i).slice(-2)
    result.push({
      region: roomid.region,
      district: roomid.district,
      room: roomid.room,
      index: i,
      text: text,
      color: color,
      userid: user.userid,
      username: user.name,
      puid: user.puid,
      timestamp: timestamp,
    })
  }
  return result
})()

export const populateDatabase = (() => {
  let addUsers = ''
  for ( let user of databaseUsers ) {
    let entry = `
      INSERT INTO users VALUES
        ('${user.userid}', '${user.login}', '${user.passwordHash}',
        '${user.name}', '${user.state}', '${user.puid}', ${user.timestamp});
    `
    addUsers += entry
  }
  let addSessions = ''
  for ( let session of databaseSessions ) {
    let entry = `
      INSERT INTO sessions VALUES
        ('${session.userid}', '${session.sessionidHash}', 
        ${session.timestamp});
    `
    addSessions += entry
  }
  let addMessages = ''
  for ( let message of databaseMessages ) {
    let entry = `
      INSERT INTO messages VALUES
        ('${message.region}', ${message.district}, ${message.room},
        ${message.index}, '${message.text}', '${message.color}',
        '${message.userid}', ${message.timestamp});
    `
    addMessages += entry
  }
  return {
    addUsers,
    addSessions,
    addMessages,
  }
})()

export const roomMsgcounts = (() => {
  let result = {}
  for ( let i=0; i < roomByMessage.length; i++ ) {
    let roomid = databaseRooms[roomByMessage[i]]
    let { region, district, room } = roomid
    if ( result[region] === undefined ) {
      result[region] = {}
    }
    if ( result[region][district] === undefined ) {
      result[region][district] = {}
    }
    if ( result[region][district][room] === undefined ) {
      result[region][district][room] = 0
    }
    result[region][district][room]++
  }
  return result
})()

export const districtMsgcounts = (() => {
  let result = {}
  for ( let i=0; i < districtByMessage.length; i++ ) {
    let districtid = databaseDistricts[districtByMessage[i]]
    let { region, district } = districtid
    if ( result[region] === undefined ) {
      result[region] = {}
    }
    if ( result[region][district] === undefined ) {
      result[region][district] = 0
    }
    result[region][district]++
  }
  return result
})()

    

