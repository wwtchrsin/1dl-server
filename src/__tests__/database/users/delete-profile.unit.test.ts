import * as messages from "../../../lib/database/messages"
import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

let msgs = [[{
  region: examples.region.first,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin,
  text: examples.text.correct[0],
  color: examples.color.first,
  timestamp: "123456780",
}, {
  region: examples.region.first,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin + 1,
  text: examples.text.correct[1],
  color: examples.color.first,
  timestamp: "123456781",
}], [{
  region: examples.region.last,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin,
  text: examples.text.correct[2],
  color: examples.color.last,
  timestamp: "123456782",
}]]

let correctUserids = [
  examples.uuid[0],
  examples.uuid[1]
]

let wrongUserid = examples.uuid[2]

let profiles = [{
  userid: correctUserids[0],
  login: examples.login.correct[0],
  name: examples.name.correct[0],
  state: "inactive",
  puid: examples.uuid[2],
  timestamp: "123456700",
}, {
  userid: correctUserids[1],
  login: examples.login.correct[1],
  name: examples.name.correct[1],
  state: "inactive",
  puid: examples.uuid[3],
  timestamp: "123456800",
}]

let getProfile = (userid: string) => {
  let index = correctUserids.indexOf(userid)
  if ( index < 0 ) {
    return Promise.resolve({ 
      error: "databaseConflicts.profileNotFound",
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
  error: "databaseErrors.getUserMessages",
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
      executeTransaction: transactionSucceeds,
    },
    expres: {
      error: undefined,
      messages: msgs[0],
      profile: profiles[0],
    }
  }, {
    tag: 2,
    args: correctUserids[1],
    mocks: {
      getProfile: getProfile,
      getUserMessages: getUserMessagesSucceeds,
      executeTransaction: transactionSucceeds,
    },
    expres: {
      error: undefined,
      messages: msgs[1],
      profile: profiles[1],
    }
  }, {
    tag: 3,
    args: wrongUserid,
    mocks: {
      getProfile: getProfile,
      getUserMessages: getUserMessagesSucceeds,
      executeTransaction: transactionSucceeds,
    },
    expres: {
      error: "databaseConflicts.profileNotFound",
      messages: undefined,
      profile: undefined,
    }
  }, {
    tag: 4,
    args: "abcd",
    mocks: {
      getProfile: getProfile,
      getUserMessages: getUserMessagesSucceeds,
      executeTransaction: transactionSucceeds,
    },
    expres: {
      error: "wrongValues.users.userid",
      messages: undefined,
      profile: undefined,
    }
  }, {
    tag: 5,
    args: correctUserids[0],
    mocks: {
      getProfile: getProfile,
      getUserMessages: getUserMessagesFails,
      executeTransaction: transactionSucceeds,
    },
    expres: {
      error: "databaseErrors.getUserMessages",
      messages: undefined,
      profile: undefined,
    }
  }, {
    tag: 6,
    args: correctUserids[0],
    mocks: {
      getProfile: getProfile,
      getUserMessages: getUserMessagesSucceeds,
      executeTransaction: transactionFails,
    },
    expres: {
      error: "databaseErrors.deleteProfile",
      messages: undefined,
      profile: undefined,
    }
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function deleteProfile. Unit Test #${tag}`, async () => {
      jest.spyOn(users, "getProfile").mockImplementation(mocks.getProfile)
      jest.spyOn(messages, "getUserMessages").mockImplementation(mocks.getUserMessages)
      jest.spyOn(conn, "executeTransaction").mockImplementation(mocks.executeTransaction)
      let result = await users.deleteProfile(args)
      expect(result).toStrictEqual(expres)
    })
  }
})



       
