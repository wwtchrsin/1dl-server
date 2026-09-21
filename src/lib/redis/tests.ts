import { getClient, redisns, getSubscriber } from "./conn"

export const clearRedis = async () => {
  let client = await getClient()
  let keys = await client.keys(`${redisns}:*`)
  if ( keys.length ) await client.del(keys)
}

export const getReports = async (channel: string, reportsNum: number, timeout: number = 2000) => {
  let subscriber = await getSubscriber()
  return new Promise<any[]>((res) => {
    if ( reportsNum === 0 ) {
      res([])
      return
    }
    let reports = []
    subscriber.subscribe(`${redisns}:${channel}`, (messageString: string) => {
      let message = JSON.parse(messageString)
      reports.push(message)
      if ( reports.length === reportsNum ) {
        subscriber.unsubscribe(`${redisns}:${channel}`)
        res(reports)
      }
    })
    setTimeout(() => {
      subscriber.unsubscribe(`${redisns}:${channel}`)
      res([])
    }, timeout)
  })
}