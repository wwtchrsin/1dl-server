import * as messages from "../../../lib/database/messages"
import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

let msgs = [[{
  region: examples.region.first,
  tag: examples.tag.minLen,
  index: limits.message.index.min,
  text: examples.text.correct[0],
  color: examples.color.first,
  timestamp: "123456780",
}, {
  region: examples.region.first,
  tag: examples.tag.minLen,
  index: limits.message.index.min + 1,
  text: examples.text.correct[1],
  color: examples.color.first,
  timestamp: "123456781",
}], [{
  region: examples.region.first,
  tag: examples.tag.minLen,
  index: limits.message.index.min,
  text: examples.text.correct[2],
  color: examples.color.last,
  timestamp: "123456782",
}]]

let correctUserids = [
  examples.uuid[0],
  examples.uuid[1]
]

let wrongUserid = examples.uuid[2]

let identifiers = [
  examples.sessionid[1],
  examples.sessionid[2],
]

let profiles = [{
  userid: correctUserids[0],
  region: examples.region.first,
  login: examples.login.correct[0],
  name: examples.name.correct[0],
  color: null,
  state: "inactive",
  puid: examples.uuid[2],
  timestamp: "123456700",
}, {
  userid: correctUserids[1],
  region: examples.region.first,
  login: examples.login.correct[1],
  name: examples.name.correct[1],
  color: null,
  state: "inactive",
  puid: examples.uuid[3],
  timestamp: "123456800",
}]

let getProfile = (userid: string) => {
  let index = correctUserids.indexOf(userid)
  if ( index < 0 ) {
    return Promise.resolve({ 
      error: "databaseConflict.profileNotFound",
      data: undefined,
    })
  }
  return Promise.resolve({
    error: undefined,
    data: profiles[index],
  })
}

let getUserMessagesSucceeds = (userid: string) => {
  let index = correctUserids.indexOf(userid)
  if ( index < 0 ) {
    return Promise.resolve({
      error: undefined,
      data: [],
    })
  }
  return Promise.resolve({
    error: undefined,
    data: msgs[index],
  })
}

let getUserMessagesFails = () => Promise.resolve({ 
  error: "databaseError.getUserMessages",
  data: undefined,
})

let getIdentifierSucceeds = (userid: string) => {
  let index = correctUserids.indexOf(userid)
  if ( index < 0 ) {
    return Promise.resolve({
      error: "databaseConflict.sessionNotFound",
      data: undefined,
    })
  }
  return Promise.resolve({
    error: undefined,
    data: identifiers[index],
  })
}

let getIdentifierFails = () => Promise.resolve({
  error: "databaseError.getDeviceid",
  data: undefined,
})

let transactionSucceeds = () => Promise.resolve(true)

let transactionFails = () => Promise.resolve(false)

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: correctUserids[0],
    mocks: {
      getProfile: getProfile,
      getUserMessages: getUserMessagesSucceeds,
      getDeviceid: getIdentifierSucceeds,
      executeTransaction: transactionSucceeds,
    },
    expres: {
      error: undefined,
      messages: msgs[0],
      profile: profiles[0],
      deviceid: identifiers[0],
    }
  }, {
    tag: 2,
    args: correctUserids[1],
    mocks: {
      getProfile: getProfile,
      getUserMessages: getUserMessagesSucceeds,
      getDeviceid: getIdentifierSucceeds,
      executeTransaction: transactionSucceeds,
    },
    expres: {
      error: undefined,
      messages: msgs[1],
      profile: profiles[1],
      deviceid: identifiers[1],
    }
  }, {
    tag: 3,
    args: wrongUserid,
    mocks: {
      getProfile: getProfile,
      getUserMessages: getUserMessagesSucceeds,
      getDeviceid: getIdentifierSucceeds,
      executeTransaction: transactionSucceeds,
    },
    expres: {
      error: "databaseConflict.profileNotFound",
      messages: undefined,
      profile: undefined,
      deviceid: undefined,
    }
  }, {
    tag: 4,
    args: "abcd",
    mocks: {
      getProfile: getProfile,
      getUserMessages: getUserMessagesSucceeds,
      getDeviceid: getIdentifierSucceeds,
      executeTransaction: transactionSucceeds,
    },
    expres: {
      error: "databaseConflict.profileNotFound",
      messages: undefined,
      profile: undefined,
      deviceid: undefined,
    }
  }, {
    tag: 5,
    args: correctUserids[0],
    mocks: {
      getProfile: getProfile,
      getUserMessages: getUserMessagesFails,
      getDeviceid: getIdentifierSucceeds,
      executeTransaction: transactionSucceeds,
    },
    expres: {
      error: "databaseError.getUserMessages",
      messages: undefined,
      profile: undefined,
      deviceid: undefined,
    }
  }, {
    tag: 6,
    args: correctUserids[0],
    mocks: {
      getProfile: getProfile,
      getUserMessages: getUserMessagesSucceeds,
      getDeviceid: getIdentifierFails,
      executeTransaction: transactionSucceeds,
    },
    expres: {
      error: "databaseError.getDeviceid",
      messages: undefined,
      profile: undefined,
      deviceid: undefined,
    }
  }, {
    tag: 7,
    args: correctUserids[0],
    mocks: {
      getProfile: getProfile,
      getUserMessages: getUserMessagesSucceeds,
      getDeviceid: getIdentifierSucceeds,
      executeTransaction: transactionFails,
    },
    expres: {
      error: "databaseError.deleteProfile",
      messages: undefined,
      profile: undefined,
      deviceid: undefined,
    }
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function deleteProfile. Unit Test #${tag}`, async () => {
      jest.spyOn(users, "getProfile").mockImplementation(mocks.getProfile)
      jest.spyOn(messages, "getUserMessages").mockImplementation(mocks.getUserMessages)
      jest.spyOn(users, "getDeviceid").mockImplementation(mocks.getDeviceid)
      jest.spyOn(conn, "executeTransaction").mockImplementation(mocks.executeTransaction)
      let result = await users.deleteProfile(args)
      expect(result).toStrictEqual(expres)
    })
  }
})



       
